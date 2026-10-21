<script lang="ts">
	import * as Dialog from "$lib/components/ui/dialog";
	import * as m from "$lib/paraglide/messages";
	import { Button } from "$lib/components/ui/button";
	import { Badge } from "$lib/components/ui/badge";
	import { entryEditStore } from "$lib/stores/entryEdit.svelte";
	import { entriesStore } from "$lib/stores/entries.svelte";
	import { metadataStore } from "$lib/stores/metadata.svelte";
	import { toastStore } from "$lib/stores/toast.svelte";
	import { entriesApi } from "$lib/api/entries";
	import { uiLogger } from "$lib/utils/logger";
	import PhotoUpload from "./PhotoUpload.svelte";
	import ActivityTimeline from "./ActivityTimeline.svelte";
	import CommentSection from "./CommentSection.svelte";
	import RiskLinkModal from "./RiskLinkModal.svelte";
	import DeadlineChangeDialog from "./DeadlineChangeDialog.svelte";
	import type { EntryPhoto, RiskType, LinkedRiskSummary } from "$lib/types/entry";
	import Trash2 from "lucide-svelte/icons/trash-2";
	import Link from "lucide-svelte/icons/link";
	import X from "lucide-svelte/icons/x";

	function formatDate(dateStr: string): string {
		if (!dateStr) return "-";
		const date = new Date(dateStr);
		return date.toLocaleDateString(undefined, {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	}

	function formatDateTime(dateStr: string): string {
		if (!dateStr) return "-";
		const date = new Date(dateStr);
		return date.toLocaleString(undefined, {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	}

	function formatCurrency(value: number): string {
		return new Intl.NumberFormat(undefined, {
			style: "currency",
			currency: "EUR",
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		}).format(value);
	}

	async function handleSave() {
		if (!entryEditStore.entry) return;

		entryEditStore.setSaving(true);
		try {
			const updated = await entriesApi.update(
				entryEditStore.entry.id,
				entryEditStore.entry
			);
			entryEditStore.markSaved(updated);
			toastStore.success(m.toast_saved());
			entryEditStore.close();
			await entriesStore.invalidate();
		} catch (error) {
			uiLogger.error("Save failed:", error);
			toastStore.error(m.toast_saveError());
		} finally {
			entryEditStore.setSaving(false);
		}
	}

	async function handleDelete() {
		if (!entryEditStore.entry) return;

		if (!confirm(m.modal_confirmDelete())) return;

		entryEditStore.setDeleting(true);
		try {
			await entriesApi.delete(entryEditStore.entry.id);
			toastStore.success(m.toast_deleted());
			entryEditStore.close();
			entriesStore.invalidate();
		} catch (error) {
			uiLogger.error("Delete failed:", error);
			toastStore.error(m.toast_deleteError());
		} finally {
			entryEditStore.setDeleting(false);
		}
	}

	async function handlePhotoUpload(file: File) {
		if (!entryEditStore.entry) return;

		try {
			const photo = await entriesApi.uploadPhoto(entryEditStore.entry.id, file);
			entryEditStore.updateField("photos", [...entryEditStore.entry.photos, photo]);
			toastStore.success(m.toast_photoUploaded());
		} catch (error) {
			uiLogger.error("Photo upload failed:", error);
			toastStore.error(m.toast_photoUploadError());
			throw error;
		}
	}

	async function handlePhotoRemove(photoId: string) {
		if (!entryEditStore.entry) return;

		try {
			await entriesApi.deletePhoto(entryEditStore.entry.id, photoId);
			entryEditStore.updateField(
				"photos",
				entryEditStore.entry.photos.filter((p: EntryPhoto) => p.id !== photoId)
			);
			toastStore.success(m.toast_photoDeleted());
		} catch (error) {
			uiLogger.error("Photo delete failed:", error);
			toastStore.error(m.toast_photoDeleteError());
			throw error;
		}
	}

	function handleClose() {
		if (entryEditStore.isDirty) {
			if (!confirm(m.modal_unsavedChanges())) return;
		}
		entryEditStore.close();
	}

	function handleOpenChange(open: boolean) {
		if (!open) {
			handleClose();
		}
	}

	type BadgeVariant = "destructive" | "warning" | "info" | "success" | "default" | "secondary" | "outline";

	let riskBadgeVariant = $derived(
		(entryEditStore.entry
			? metadataStore.getRiskLevelBadgeVariant(entryEditStore.entry.riskLevel)
			: "default") as BadgeVariant
	);

	// Risk type options
	const riskTypeOptions: { value: RiskType; label: () => string; description: () => string }[] = [
		{ value: 1, label: () => m.riskType_shortTerm(), description: () => m.riskType_shortTermDesc() },
		{ value: 2, label: () => m.riskType_longTerm(), description: () => m.riskType_longTermDesc() },
	];

	// Link modal state
	let isLinkModalOpen = $state(false);

	// Deadline change dialog state
	let isDeadlineDialogOpen = $state(false);

	function handleDeadlineChangeSuccess(updated: import("$lib/types/entry").Entry) {
		entryEditStore.markSaved(updated);
		entriesStore.invalidate();
	}

	function handleRiskTypeChange(value: RiskType) {
		if (!entryEditStore.entry) return;
		entryEditStore.updateField("riskType", value);
	}

	function handleLinkedRiskSelect(risk: LinkedRiskSummary) {
		if (!entryEditStore.entry) return;
		entryEditStore.updateField("linkedRiskId", risk.id);
		entryEditStore.updateField("linkedRisk", risk);
		isLinkModalOpen = false;
	}

	function handleLinkedRiskRemove() {
		if (!entryEditStore.entry) return;
		entryEditStore.updateField("linkedRiskId", null);
		entryEditStore.updateField("linkedRisk", null);
	}

	// Check if status is closed/completed
	let isCompleted = $derived(
		entryEditStore.entry?.status === "completed" || entryEditStore.entry?.status === "closed"
	);
</script>

<Dialog.Root open={entryEditStore.isOpen} onOpenChange={handleOpenChange}>
	<Dialog.Content class="max-h-[90vh] flex flex-col" showCloseButton={false}>
		{#if entryEditStore.entry}
			<!-- Header -->
			<Dialog.Header class="flex-shrink-0 flex flex-row items-center justify-between gap-4 pr-12">
				<div class="flex items-center gap-4">
					<Badge variant={riskBadgeVariant}>
						{metadataStore.getRiskLevelLabel(entryEditStore.entry.riskLevel)}
					</Badge>
					<Dialog.Title>
						{m.modal_editEntry()} #{entryEditStore.entry.id}
					</Dialog.Title>
				</div>
				<div class="flex items-center gap-2">
					<!-- Status indicator -->
					<div class="flex items-center gap-2 px-3 py-1 rounded-full bg-bg text-sm">
						<span
							class="w-2 h-2 rounded-full {entryEditStore.entry.status === 'open'
								? 'bg-info animate-pulse'
								: entryEditStore.entry.status === 'in-progress'
									? 'bg-warning animate-pulse'
									: 'bg-success'}"
						></span>
						<span class="text-text-muted">
							{metadataStore.getStatusLabel(entryEditStore.entry.status)}
						</span>
					</div>
				</div>
			</Dialog.Header>

			<!-- Content -->
			<div class="flex-1 overflow-y-auto p-6">
				<div class="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
					<!-- Main Form (Left Column) -->
					<div class="space-y-6">
						<!-- Basic Information -->
						<section>
							<h3 class="flex items-center gap-2 text-sm font-semibold text-text mb-4">
								<span class="w-1 h-4 bg-primary rounded"></span>
								{m.section_basicInfo()}
							</h3>
							<div class="grid grid-cols-2 gap-4">
								<div>
									<label class="block text-sm font-medium text-text-muted mb-1">
										{m.form_line()}
									</label>
									<select
										class="w-full px-3 py-2 bg-bg border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary"
										value={entryEditStore.entry.line}
										onchange={(e) => entryEditStore.updateField("line", e.currentTarget.value)}
									>
										{#each metadataStore.lines as line}
											<option value={line.value}>
												{line.value}
											</option>
										{/each}
									</select>
								</div>
								<div>
									<label class="block text-sm font-medium text-text-muted mb-1">
										{m.form_machine()}
									</label>
									<input
										type="text"
										class="w-full px-3 py-2 bg-bg border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary"
										value={entryEditStore.entry.machine}
										oninput={(e) => entryEditStore.updateField("machine", e.currentTarget.value)}
									/>
								</div>
								<div class="col-span-2">
									<label class="block text-sm font-medium text-text-muted mb-1">
										{m.form_category()}
									</label>
									<select
										class="w-full px-3 py-2 bg-bg border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary"
										value={entryEditStore.entry.category}
										onchange={(e) => entryEditStore.updateField("category", e.currentTarget.value)}
									>
										{#each metadataStore.categories as category}
											<option value={category.value}>
												{metadataStore.getCategoryLabel(category.value)}
											</option>
										{/each}
									</select>
								</div>
							</div>
						</section>

						<!-- Risk Type & Linking -->
						<section>
							<h3 class="flex items-center gap-2 text-sm font-semibold text-text mb-4">
								<span class="w-1 h-4 bg-primary rounded"></span>
								{m.section_riskType()}
							</h3>
							<div class="space-y-4">
								<!-- Risk Type Toggle -->
								<div>
									<label class="block text-sm font-medium text-text-muted mb-2">
										{m.riskType_label()}
									</label>
									<div class="grid grid-cols-2 gap-3">
										{#each riskTypeOptions as option}
											<button
												type="button"
												onclick={() => handleRiskTypeChange(option.value)}
												class="p-3 rounded-lg border-2 text-left transition-all
													{entryEditStore.entry?.riskType === option.value
														? 'border-primary bg-primary/5'
														: 'border-border hover:border-primary/50'}"
											>
												<div class="font-medium text-text text-sm">{option.label()}</div>
												<div class="text-xs text-text-muted mt-0.5">{option.description()}</div>
											</button>
										{/each}
									</div>
								</div>

								<!-- Linked Risk -->
								<div>
									<label class="block text-sm font-medium text-text-muted mb-2">
										{m.linkedRisk_label()}
									</label>
									<p class="text-xs text-text-muted mb-2">
										{m.linkedRisk_description({
											type: entryEditStore.entry?.riskType === 1 ? m.linkedRisk_longTerm() : m.linkedRisk_shortTerm()
										})}
									</p>

									{#if entryEditStore.entry?.linkedRisk}
										<div class="p-3 bg-bg rounded-lg border border-border">
											<div class="flex items-start justify-between gap-3">
												<div class="flex-1 min-w-0">
													<div class="flex items-center gap-2 mb-1">
														<Link class="h-4 w-4 text-primary flex-shrink-0" />
														<span class="text-xs font-mono text-text-muted">
															#{entryEditStore.entry.linkedRisk.id}
														</span>
														<Badge variant="secondary" class="text-xs">
															{entryEditStore.entry.linkedRisk.riskType === 1 ? m.riskType_shortTerm() : m.riskType_longTerm()}
														</Badge>
													</div>
													<p class="text-text text-sm font-medium truncate">{entryEditStore.entry.linkedRisk.machine}</p>
													<p class="text-xs text-text-muted truncate">{entryEditStore.entry.linkedRisk.descriptionOfDanger}</p>
												</div>
												<Button variant="ghost" size="sm" onclick={handleLinkedRiskRemove}>
													<X class="h-4 w-4" />
												</Button>
											</div>
										</div>
									{:else}
										<Button variant="outline" size="sm" onclick={() => isLinkModalOpen = true}>
											<Link class="h-4 w-4 mr-2" />
											{m.linkedRisk_select()}
										</Button>
									{/if}
								</div>
							</div>
						</section>

						<!-- Risk Details -->
						<section>
							<h3 class="flex items-center gap-2 text-sm font-semibold text-text mb-4">
								<span class="w-1 h-4 bg-primary rounded"></span>
								{m.section_riskDetails()}
							</h3>
							<div class="space-y-4">
								<div>
									<label class="block text-sm font-medium text-text-muted mb-1">
										{m.form_description()}
									</label>
									<textarea
										class="w-full px-3 py-2 bg-bg border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary resize-none"
										rows="3"
										value={entryEditStore.entry.descriptionOfDanger}
										oninput={(e) => entryEditStore.updateField("descriptionOfDanger", e.currentTarget.value)}
									></textarea>
								</div>
								<div>
									<label class="block text-sm font-medium text-text-muted mb-1">
										{m.form_action()}
									</label>
									<textarea
										class="w-full px-3 py-2 bg-bg border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary resize-none"
										rows="3"
										value={entryEditStore.entry.action}
										oninput={(e) => entryEditStore.updateField("action", e.currentTarget.value)}
									></textarea>
								</div>
							</div>
						</section>

						<!-- Assignment & Timeline -->
						<section>
							<h3 class="flex items-center gap-2 text-sm font-semibold text-text mb-4">
								<span class="w-1 h-4 bg-primary rounded"></span>
								{m.section_assignment()}
							</h3>
							<div class="grid grid-cols-2 gap-4">
								<div>
									<label class="block text-sm font-medium text-text-muted mb-1">
										{m.form_responsible()}
									</label>
									<select
										class="w-full px-3 py-2 bg-bg border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary"
										value={entryEditStore.entry.responsible}
										onchange={(e) => entryEditStore.updateField("responsible", e.currentTarget.value)}
									>
										{#each metadataStore.responsibles as responsible}
											<option value={responsible.name}>
												{responsible.name}
											</option>
										{/each}
									</select>
								</div>
								<div>
									<label class="block text-sm font-medium text-text-muted mb-1">
										{m.form_deadline()}
									</label>
									<div class="flex items-center gap-2">
										<div
											class="flex-1 px-3 py-2 bg-bg border border-border rounded-lg text-text"
										>
											{entryEditStore.entry.deadline || m.deadline_none()}
										</div>
										<Button
											type="button"
											variant="outline"
											size="sm"
											onclick={() => (isDeadlineDialogOpen = true)}
										>
											{entryEditStore.entry.deadline
												? m.deadline_change()
												: m.deadline_set()}
										</Button>
									</div>
								</div>
								<div>
									<label class="block text-sm font-medium text-text-muted mb-1">
										{m.form_riskLevel()}
									</label>
									<select
										class="w-full px-3 py-2 bg-bg border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary"
										value={entryEditStore.entry.riskLevel}
										onchange={(e) => entryEditStore.updateField("riskLevel", e.currentTarget.value)}
									>
										{#each metadataStore.riskLevels as level}
											<option value={level.value}>
												{metadataStore.getRiskLevelLabel(level.value)}
											</option>
										{/each}
									</select>
								</div>
								<div>
									<label class="block text-sm font-medium text-text-muted mb-1">
										{m.form_status()}
									</label>
									<select
										class="w-full px-3 py-2 bg-bg border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary"
										value={entryEditStore.entry.status}
										onchange={(e) => entryEditStore.updateField("status", e.currentTarget.value)}
									>
										{#each metadataStore.statuses as status}
											<option value={status.value}>
												{metadataStore.getStatusLabel(status.value)}
											</option>
										{/each}
									</select>
								</div>
								<div>
									<label class="block text-sm font-medium text-text-muted mb-1">
										{m.form_implementationDate()}
									</label>
									<input
										type="date"
										class="w-full px-3 py-2 bg-bg border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary"
										value={entryEditStore.entry.implementationDate ?? ""}
										oninput={(e) => entryEditStore.updateField("implementationDate", e.currentTarget.value || null)}
									/>
								</div>
							</div>
						</section>

						<!-- Photo Documentation -->
						<section>
							<h3 class="flex items-center gap-2 text-sm font-semibold text-text mb-4">
								<span class="w-1 h-4 bg-primary rounded"></span>
								{m.section_photos()}
							</h3>
							<PhotoUpload
								photos={entryEditStore.entry.photos}
								onUpload={handlePhotoUpload}
								onRemove={handlePhotoRemove}
								disabled={entryEditStore.isSaving}
							/>
						</section>

						<!-- Comments -->
						<section>
							<h3 class="flex items-center gap-2 text-sm font-semibold text-text mb-4">
								<span class="w-1 h-4 bg-primary rounded"></span>
								{m.section_comments()}
							</h3>
							<CommentSection
								entryId={entryEditStore.entry.id}
								disabled={entryEditStore.isSaving}
							/>
						</section>
					</div>

					<!-- Sidebar (Right Column) -->
					<div class="space-y-6">
						<!-- Metadata Card -->
						<section class="bg-bg rounded-lg p-4 border border-border">
							<h3 class="flex items-center gap-2 text-sm font-semibold text-text mb-4">
								<span class="w-1 h-4 bg-primary rounded"></span>
								{m.section_metadata()}
							</h3>
							<dl class="space-y-3 text-sm">
								<div class="flex justify-between">
									<dt class="text-text-muted">{m.meta_created()}</dt>
									<dd class="text-text font-mono">{formatDateTime(entryEditStore.entry.createdAt)}</dd>
								</div>
								<div class="flex justify-between">
									<dt class="text-text-muted">{m.meta_createdBy()}</dt>
									<dd class="text-text">{entryEditStore.entry.createdBy || "-"}</dd>
								</div>
								<div class="flex justify-between">
									<dt class="text-text-muted">{m.meta_lastModified()}</dt>
									<dd class="text-text font-mono">{formatDateTime(entryEditStore.entry.updatedAt)}</dd>
								</div>
								<div class="flex justify-between">
									<dt class="text-text-muted">{m.meta_originalDeadline()}</dt>
									<dd class="text-text font-mono">{formatDate(entryEditStore.entry.originalDeadline)}</dd>
								</div>
								<div class="flex justify-between">
									<dt class="text-text-muted">{m.meta_postponements()}</dt>
									<dd class="text-text">
										{#if entryEditStore.entry.postponements > 0}
											<span class="text-warning">{entryEditStore.entry.postponements}</span>
										{:else}
											0
										{/if}
									</dd>
								</div>
								{#if isCompleted && entryEditStore.entry.implementationDate}
									<div class="flex justify-between pt-2 border-t border-border">
										<dt class="text-text-muted">{m.meta_implementedOn()}</dt>
										<dd class="text-success font-mono">{formatDate(entryEditStore.entry.implementationDate)}</dd>
									</div>
								{/if}
							</dl>
						</section>

						<!-- Financial Card -->
						<section class="bg-bg rounded-lg p-4 border border-border">
							<h3 class="flex items-center gap-2 text-sm font-semibold text-text mb-4">
								<span class="w-1 h-4 bg-primary rounded"></span>
								{m.section_financial()}
							</h3>
							<div class="space-y-4">
								<div>
									<label class="block text-sm font-medium text-text-muted mb-1">
										{m.form_cost()}
									</label>
									<input
										type="number"
										class="w-full px-3 py-2 bg-bg-light border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary"
										value={entryEditStore.entry.cost}
										oninput={(e) => entryEditStore.updateField("cost", parseFloat(e.currentTarget.value) || 0)}
									/>
								</div>
								<div>
									<label class="block text-sm font-medium text-text-muted mb-1">
										{m.form_expenseType()}
									</label>
									<select
										class="w-full px-3 py-2 bg-bg-light border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary"
										value={entryEditStore.entry.expenseType}
										onchange={(e) => entryEditStore.updateField("expenseType", e.currentTarget.value)}
									>
										{#each metadataStore.expenseTypes as expenseType}
											<option value={expenseType.value}>
												{metadataStore.getExpenseTypeLabel(expenseType.value)}
											</option>
										{/each}
									</select>
								</div>
								<div>
									<label class="block text-sm font-medium text-text-muted mb-1">
										{m.form_moc()}
									</label>
									<input
										type="text"
										class="w-full px-3 py-2 bg-bg-light border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary"
										value={entryEditStore.entry.moc}
										oninput={(e) => entryEditStore.updateField("moc", e.currentTarget.value)}
									/>
								</div>
							</div>
						</section>

						<!-- Activity Timeline -->
						<section class="bg-bg rounded-lg p-4 border border-border">
							<h3 class="flex items-center gap-2 text-sm font-semibold text-text mb-4">
								<span class="w-1 h-4 bg-primary rounded"></span>
								{m.section_activity()}
							</h3>
							{#if entryEditStore.isLoading}
								<div class="text-sm text-text-muted text-center py-4">
									{m.history_loading()}
								</div>
							{:else}
								<ActivityTimeline history={entryEditStore.entry.history} />
							{/if}
						</section>
					</div>
				</div>
			</div>

			<!-- Footer -->
			<Dialog.Footer>
				<div>
					<Button
						variant="destructive"
						onclick={handleDelete}
						disabled={entryEditStore.isSaving || entryEditStore.isDeleting}
					>
						<Trash2 class="h-4 w-4 mr-2" />
						{entryEditStore.isDeleting ? m.modal_deleting() : m.modal_delete()}
					</Button>
				</div>
				<div class="flex gap-2">
					<Button variant="outline" onclick={handleClose} disabled={entryEditStore.isSaving}>
						{m.modal_cancel()}
					</Button>
					<Button
						onclick={handleSave}
						disabled={entryEditStore.isSaving || !entryEditStore.isDirty}
					>
						{entryEditStore.isSaving ? m.modal_saving() : m.modal_save()}
					</Button>
				</div>
			</Dialog.Footer>
		{/if}
	</Dialog.Content>
</Dialog.Root>

<!-- Risk Link Modal -->
{#if entryEditStore.entry}
	<RiskLinkModal
		open={isLinkModalOpen}
		onOpenChange={(open) => isLinkModalOpen = open}
		targetRiskType={entryEditStore.entry.riskType}
		onSelect={handleLinkedRiskSelect}
	/>
{/if}

<!-- Deadline Change Dialog -->
{#if entryEditStore.entry}
	<DeadlineChangeDialog
		open={isDeadlineDialogOpen}
		entryId={entryEditStore.entry.id}
		currentDeadline={entryEditStore.entry.deadline}
		onClose={() => (isDeadlineDialogOpen = false)}
		onSuccess={handleDeadlineChangeSuccess}
	/>
{/if}
