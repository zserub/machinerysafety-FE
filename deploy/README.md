# Machinery Safety – Offline Deployment

This archive contains everything needed to run Machinery Safety on a Linux
server **without an internet connection**: prebuilt Docker images and
configuration files. Nothing is downloaded during installation.

| Service    | What it does                              | Reachable from the network |
|------------|-------------------------------------------|----------------------------|
| `frontend` | Web app users open in the browser         | Yes – `FRONTEND_PORT` (80) |
| `backend`  | API, login, business logic                | No (internal only)         |
| `postgres` | Database                                  | No (internal only)         |
| `metabase` | Statistics dashboards (shown inside the app) | Yes – `METABASE_PORT` (3000) |
| `minio`    | Photo storage                             | No (console on `127.0.0.1:9001` only) |

### What's in the delivery zip

| File | Purpose |
|------|---------|
| `README.md` | This guide |
| `machinerysafety-<version>.tar.gz` | The complete installation. Copy this file to the server |
| `SHA256SUMS` | Checksum to verify the `.tar.gz` wasn't damaged in transfer |

Unzip on your own PC, then copy the `.tar.gz` (and `SHA256SUMS`) to the
server, e.g. with `scp` or a USB drive. Don't unpack the `.tar.gz` on Windows;
it keeps file permissions correct only when unpacked on Linux.

---

## 1. Server requirements

- 64-bit Linux (x86_64), **4 GB RAM** minimum, **10 GB** free disk plus room for photos.
- **Docker Engine** with the **Docker Compose plugin**. On an offline server,
  download these packages on another machine from
  https://download.docker.com/linux/ (pick your distribution), copy them over
  and install them with `dpkg -i` / `rpm -i`:
  `containerd.io`, `docker-ce`, `docker-ce-cli`, `docker-compose-plugin`.
  Check with: `docker compose version`
- Firewall: allow incoming TCP on `FRONTEND_PORT` (default 80) and
  `METABASE_PORT` (default 3000) from the user network.

Run all commands below as root or with `sudo`.

---

## 2. First install

Verify the copy, then unpack. Run this in the folder containing the
`.tar.gz` and `SHA256SUMS`:

```bash
sha256sum -c SHA256SUMS                     # must print: machinerysafety-<version>.tar.gz: OK
mkdir -p /opt
tar xzf machinerysafety-<version>.tar.gz -C /opt
cd /opt/machinerysafety
./install.sh            # first run creates .env and stops
```

Edit `.env` and fill in every value marked `CHANGE ME`:

| Setting | What to put there |
|---------|-------------------|
| `APP_URL` | The address users type in the browser, e.g. `http://192.168.1.10` or `http://safety.plant.local`. No trailing slash. If you change `FRONTEND_PORT`, include it (`http://192.168.1.10:8080`). |
| `METABASE_PUBLIC_URL` | Same host, Metabase port: `http://192.168.1.10:3000` |
| `POSTGRES_PASSWORD` | Database password. Generate one: `openssl rand -base64 24` |
| `MINIO_ROOT_PASSWORD` | Photo storage password, at least 8 characters |
| `SESSION_KEY` | Login session key: `openssl rand -base64 32` |
| `INITIAL_ADMIN_PASSWORD` | Password for the first app admin (user `admin`), at least 8 characters |

Leave `DB_SCHEMA=eng` as it is. The statistics queries depend on it.

Then start everything:

```bash
./install.sh            # loads the images (takes a few minutes) and starts the services
```

Check that all services are `Up` / `healthy`:

```bash
docker compose ps
```

Open `APP_URL` in a browser and log in with `admin` and the
`INITIAL_ADMIN_PASSWORD` you set.

**Afterwards:** remove the value of `INITIAL_ADMIN_PASSWORD` from `.env`
(leave the line as `INITIAL_ADMIN_PASSWORD=`). The admin account is only
created when the database is empty, so the value isn't needed any more.

> **HTTPS:** the default setup is plain HTTP on the local network. If you put
> a reverse proxy with HTTPS in front of the app, set `SESSION_SECURE=true`,
> use `https://` in `APP_URL` and `METABASE_PUBLIC_URL`, and set `ORIGIN` to
> the same value as `APP_URL`. With `SESSION_SECURE=true` over plain HTTP,
> login will not work. Without `ORIGIN` behind HTTPS, photo uploads fail.

---

## 3. Statistics (Metabase) setup

The app's **Statistics** page shows a Metabase dashboard. Metabase has to be
set up once by hand. Until then, everything else works, but the Statistics
page stays empty.

Metabase needs 1–2 minutes after startup before it responds.

### 3.1 Create the Metabase admin

1. Open `METABASE_PUBLIC_URL` in a browser.
2. Complete the welcome wizard and create a Metabase admin account. This is
   separate from the app's `admin` user. Store the credentials safely.
3. When asked to add data, choose **"I'll add my data later"**.

### 3.2 Connect the app database

1. **Admin settings → Databases → Add database**
2. Fill in:

   | Field         | Value |
   |---------------|-------|
   | Database type | PostgreSQL |
   | Display name  | Machinery Safety |
   | Host          | `postgres` |
   | Port          | `5432` |
   | Database name | value of `POSTGRES_DB` in `.env` (default `machinery_safety`) |
   | Username      | value of `POSTGRES_USER` (default `postgres`) |
   | Password      | value of `POSTGRES_PASSWORD` |
   | Schemas       | Only these → `eng` |

3. Save. Then open the new database in the list and look at the browser's
   address bar: `.../admin/databases/2` means the **database ID is 2**. Note it.

*Optional, recommended:* give Metabase a read-only database user instead of
`postgres`. See [Read-only Metabase user](#read-only-metabase-user) below.

### 3.3 Enable public sharing

**Admin settings → Settings → Public sharing →** turn **Enable public sharing**
on. The app shows the dashboard through a public link, so it can't display
it without this.

### 3.4 Create an API key

1. **Admin settings → Settings → Authentication → API keys → Create API key**
2. Name: `machinery-safety-backend`, Group: **Administrators**
3. Copy the key. It is only shown once.

### 3.5 Let the backend build the dashboard

Edit `.env`:

```ini
# the key from 3.4
METABASE_API_KEY=mb_xxxxxxxxxxxxxxxxxxxx
# the ID from 3.2
METABASE_DATABASE_ID=2
RUN_METABASE_SETUP=true
```

Apply the change and check the result:

```bash
docker compose up -d backend
docker compose logs backend | grep -i metabase
```

You should see `metabase setup completed`. The backend creates a dashboard
called **Machinery Safety Analytics** with its charts. Open the app's
**Statistics** page; the dashboard should appear.

You can leave `RUN_METABASE_SETUP=true`. On later starts the backend sees
that the dashboard exists and skips the setup.

**If the backend keeps restarting** after this step, the setup failed (wrong
API key or database ID). Run `docker compose logs backend` to see the error,
fix `.env`, and run `docker compose up -d backend` again.

---

## 4. Day-to-day operation

```bash
cd /opt/machinerysafety
docker compose ps                    # status of all services
docker compose logs -f backend       # follow backend logs (Ctrl+C to stop)
docker compose restart frontend      # restart one service
docker compose down                  # stop everything (data is kept)
docker compose up -d                 # start everything again
```

The services start automatically when the server reboots, as long as the
Docker service is enabled (`systemctl enable docker`).

### Where data lives

| Path            | Contents |
|-----------------|----------|
| `.env`          | All configuration and passwords |
| `data/postgres` | Database: entries, users, history, and Metabase's own settings |
| `data/minio`    | Uploaded photos |
| `data/logs`     | Backend log file |

---

## 5. Backup and restore

**Backup:** stop the services briefly so the database files are consistent,
then copy `.env` and `data/`:

```bash
mkdir -p /backup
cd /opt/machinerysafety
docker compose stop
tar czf /backup/machinerysafety-$(date +%F).tar.gz .env data/
docker compose start
```

**Restore** on the same or a new server: unpack the same version of the
bundle, then restore `.env` and `data/` into the folder and start:

```bash
cd /opt/machinerysafety
docker compose down
tar xzf /backup/machinerysafety-<date>.tar.gz
./install.sh
```

---

## 6. Upgrading to a new version

Copy the new `.tar.gz` and `SHA256SUMS` to the server as in section 2, then
run this in the folder containing them:

```bash
sha256sum -c SHA256SUMS
mkdir -p /backup
(cd /opt/machinerysafety && docker compose stop && \
  tar czf /backup/before-upgrade-$(date +%F).tar.gz .env data/)   # safety backup

tar xzf machinerysafety-<new-version>.tar.gz -C /opt   # overwrites program files, keeps .env and data/
cd /opt/machinerysafety
diff .env.example .env       # check for new settings and copy them into .env
./install.sh                 # loads the new images and restarts; database updates run automatically

docker image prune -f        # optional: delete the old images
```

`VERSIONS.txt` shows which versions are in the bundle.

---

## 7. Troubleshooting

| Problem | Cause / fix |
|---------|-------------|
| Login seems to work, then you're logged out right away | `SESSION_SECURE=true` while using plain HTTP. Set it to `false`, then `docker compose up -d backend`. |
| Can't log in with `admin` on a new install | `INITIAL_ADMIN_PASSWORD` was empty or shorter than 8 characters on the first start. Check `docker compose logs backend`. If no users exist yet, set it and run `docker compose up -d backend`. |
| Photo upload fails with `Cross-site POST form submissions are forbidden` | The app is behind an HTTPS proxy but `ORIGIN` isn't set, or `ORIGIN` doesn't match the address in the browser. Set it to the exact `https://` address users open, then `docker compose up -d frontend`. |
| Statistics page is empty | Metabase not set up yet (section 3), or public sharing is off (3.3). |
| Statistics page shows "refused to connect" | `METABASE_PUBLIC_URL` isn't reachable from the user's browser: wrong address, or port 3000 blocked by the firewall. |
| A service shows `Restarting` | `docker compose logs <service>` shows the reason. Most often a wrong value in `.env`. |
| Start fails with `port is already allocated` | Another program uses port 80 or 3000. Change `FRONTEND_PORT` / `METABASE_PORT` in `.env` and update `APP_URL` / `METABASE_PUBLIC_URL` to match. |
| MinIO console needed | It listens on `127.0.0.1:9001` only. From your PC: `ssh -L 9001:127.0.0.1:9001 user@server`, then open `http://localhost:9001` and log in with `MINIO_ROOT_USER` / `MINIO_ROOT_PASSWORD`. |

---

## Read-only Metabase user

By default Metabase connects with the main database user, which can change
data. To give it read access only, run this once (replace the password):

```bash
docker compose exec postgres psql -U postgres -d machinery_safety
```

```sql
CREATE USER metabase_reader WITH PASSWORD 'choose-a-password';
GRANT CONNECT ON DATABASE machinery_safety TO metabase_reader;
GRANT USAGE ON SCHEMA eng TO metabase_reader;
GRANT SELECT ON ALL TABLES IN SCHEMA eng TO metabase_reader;
ALTER DEFAULT PRIVILEGES IN SCHEMA eng GRANT SELECT ON TABLES TO metabase_reader;
\q
```

Then use `metabase_reader` as the username in step 3.2. If the database is
already connected, change it under Admin settings → Databases.

---

## For developers: building a bundle

On a machine with internet access and Docker, with both repositories checked
out side by side:

```bash
cd MachinerySafety_frontend
deploy/pack.sh
# -> dist/machinerysafety-<version>.zip  (README.md + .tar.gz + SHA256SUMS)
```

The script builds the frontend and backend images from the current checkouts.
The backend is expected at `../MachinerySafety_backend`; override that with
`BACKEND_DIR`. It pulls Postgres and Metabase, uses the locally cached MinIO
image if the pull fails, and saves everything into one archive. That archive,
this README and a checksum file are wrapped in the delivery zip.

- **Version** comes from the git tag on the current commit (e.g. `v1.0.3` → `1.0.3`).
  Without a tag it is `dev-<commit>`. Uncommitted changes add `-dirty`.
- **Target platform** defaults to `linux/amd64`; set `PLATFORM=linux/arm64` for ARM servers.
- Third-party image versions can be overridden with `POSTGRES_IMAGE`,
  `METABASE_IMAGE` and `MINIO_IMAGE`.
