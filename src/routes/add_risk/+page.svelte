<style>
	/* Style the native date picker calendar icon */
	input[type="date"]::-webkit-calendar-picker-indicator {
		filter: invert(0.5);
		opacity: 0.6;
		cursor: pointer;
	}
	input[type="date"]::-webkit-calendar-picker-indicator:hover {
		opacity: 1;
	}
	/* For dark theme, invert more */
	:global(body:not(.light)) input[type="date"]::-webkit-calendar-picker-indicator {
		filter: invert(0.7);
	}
</style>

<script lang="ts">
	import * as m from "$lib/paraglide/messages";
	import { Button } from "$lib/components/ui/button";
	import { Badge } from "$lib/components/ui/badge";
	import { riskCreateStore, WIZARD_STEPS, type RiskType } from "$lib/stores/riskCreate.svelte";
	import { metadataStore } from "$lib/stores/metadata.svelte";
	import { toastStore } from "$lib/stores/toast.svelte";
	import { entriesApi } from "$lib/api/entries";
	import { uiLogger } from "$lib/utils/logger";
	import { goto } from "$app/navigation";
	import { onMount } from "svelte";
	import RiskLinkModal from "$lib/components/RiskLinkModal.svelte";
	import PhotoUpload from "$lib/components/PhotoUpload.svelte";
	import ChevronLeft from "lucide-svelte/icons/chevron-left";
	import ChevronRight from "lucide-svelte/icons/chevron-right";
	import Check from "lucide-svelte/icons/check";
	import Link from "lucide-svelte/icons/link";
	import X from "lucide-svelte/icons/x";
	import AlertCircle from "lucide-svelte/icons/alert-circle";
	import RotateCcw from "lucide-svelte/icons/rotate-ccw";
	import type { EntryPhoto } from "$lib/types/entry";

	// Load draft on mount
	onMount(async () => {
		const hadDraft = await riskCreateStore.loadDraft();
		if (hadDraft) {
			toastStore.info(m.draft_restored());
		}
	});

	// Step labels - use $derived for reactivity on language change
	const stepLabels = $derived([
		m.wizard_stepLocation(),
		m.wizard_stepRisk(),
		m.wizard_stepAssignment(),
		m.wizard_stepOptional(),
	]);

	async function handleSubmit() {
		if (!riskCreateStore.validateAll()) {
			// Go to first step with error
			for (let i = 0; i < WIZARD_STEPS.length; i++) {
				if (!riskCreateStore.validateStep(i)) {
					riskCreateStore.goToStep(i);
					break;
				}
			}
			return;
		}

		riskCreateStore.setSubmitting(true);

		try {
			const submitData = riskCreateStore.getSubmitData();
			const created = await entriesApi.create(submitData as any);

			// Upload photos if any
			const photos = riskCreateStore.getPhotos();
			for (const photo of photos) {
				try {
					await entriesApi.uploadPhoto(created.id, photo);
				} catch (error) {
					uiLogger.error("Photo upload failed:", error);
				}
			}

			toastStore.success(m.toast_riskCreated());
			riskCreateStore.reset();
			goto("/table");
		} catch (error) {
			uiLogger.error("Create failed:", error);
			toastStore.error(m.toast_riskCreateError());
		} finally {
			riskCreateStore.setSubmitting(false);
		}
	}

	function handleNext() {
		if (riskCreateStore.isLastStep) {
			handleSubmit();
		} else {
			riskCreateStore.nextStep();
		}
	}

	function handlePrevious() {
		riskCreateStore.previousStep();
	}

	async function handleDiscardDraft() {
		await riskCreateStore.reset();
		toastStore.info(m.draft_discarded());
	}

	// Photo handling for preview (before submission)
	function handlePhotoAdd(file: File) {
		riskCreateStore.addPhoto(file);
	}

	function handlePhotoRemove(index: number) {
		riskCreateStore.removePhoto(index);
	}

	// Convert local photos to EntryPhoto format for PhotoUpload component
	let previewPhotos = $derived(
		riskCreateStore.formData.photoUrls.map((url, i) => ({
			id: String(i),
			url,
			filename: riskCreateStore.formData.photos[i]?.name ?? `photo-${i}`,
			uploadedAt: new Date().toISOString(),
		}))
	);

	// Custom photo upload handler that adds to local state
	async function onPhotoUpload(file: File): Promise<void> {
		handlePhotoAdd(file);
	}

	async function onPhotoRemove(photoId: string): Promise<void> {
		handlePhotoRemove(parseInt(photoId));
	}

	// Error display helper
	function getFieldError(field: string): string | null {
		const error = riskCreateStore.getError(field);
		if (!error) return null;
		if (error === "required") return m.validation_required();
		if (error === "invalid") return m.validation_invalidCost();
		return error;
	}

	// Risk type options
	const riskTypeOptions: { value: RiskType; label: () => string; description: () => string }[] = [
		{ value: 1, label: () => m.riskType_shortTerm(), description: () => m.riskType_shortTermDesc() },
		{ value: 2, label: () => m.riskType_longTerm(), description: () => m.riskType_longTermDesc() },
	];
</script>

<div class="min-h-[calc(100vh-8rem)] p-8">
	<div class="max-w-4xl mx-auto">
		<!-- Progress Steps -->
		<div class="mb-8">
			<div class="flex items-center justify-between relative">
				<!-- Progress line -->
				<div class="absolute top-5 left-0 right-0 h-0.5 bg-border -z-10"></div>
				<div
					class="absolute top-5 left-0 h-0.5 bg-primary transition-all duration-300 -z-10"
					style="width: {riskCreateStore.progress}%"
				></div>

				{#each WIZARD_STEPS as step, i}
					<button
						type="button"
						onclick={() => riskCreateStore.goToStep(i)}
						class="flex flex-col items-center gap-2 group"
						disabled={i > riskCreateStore.currentStep && !riskCreateStore.isStepValid(riskCreateStore.currentStep)}
					>
						<div
							class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all
								{i < riskCreateStore.currentStep
									? 'bg-primary text-white'
									: i === riskCreateStore.currentStep
										? 'bg-primary text-white ring-4 ring-primary/20'
										: 'bg-bg-light border-2 border-border text-text-muted group-hover:border-primary/50'}"
						>
							{#if i < riskCreateStore.currentStep}
								<Check class="h-5 w-5" />
							{:else}
								{i + 1}
							{/if}
						</div>
						<span
							class="text-xs font-medium whitespace-nowrap
								{i <= riskCreateStore.currentStep ? 'text-text' : 'text-text-muted'}"
						>
							{stepLabels[i]}
						</span>
					</button>
				{/each}
			</div>
		</div>

		<!-- Form Card -->
		<div class="bg-bg-light border border-border rounded-xl shadow-sm">
			<div class="p-8">
				<!-- Step 1: Location & Type -->
				{#if riskCreateStore.currentStepId === "location"}
					<div class="space-y-6">
						<h2 class="text-lg font-semibold text-text flex items-center gap-2">
							<span class="w-1 h-5 bg-primary rounded"></span>
							{m.wizard_stepLocation()}
						</h2>

						<!-- Risk Type Segmented Control -->
						<div>
							<label class="block text-sm font-medium text-text mb-3">
								{m.riskType_label()}
							</label>
							<div class="grid grid-cols-2 gap-3">
								{#each riskTypeOptions as option}
									<button
										type="button"
										onclick={() => riskCreateStore.updateField("riskType", option.value)}
										class="p-4 rounded-lg border-2 text-left transition-all
											{riskCreateStore.formData.riskType === option.value
												? 'border-primary bg-primary/5'
												: 'border-border hover:border-primary/50'}"
									>
										<div class="font-medium text-text">{option.label()}</div>
										<div class="text-sm text-text-muted mt-1">{option.description()}</div>
									</button>
								{/each}
							</div>
						</div>

						<!-- Production Line -->
						<div>
							<label for="line" class="block text-sm font-medium text-text mb-2">
								{m.form_line()} <span class="text-danger">*</span>
							</label>
							<select
								id="line"
								value={riskCreateStore.formData.lineId}
								onchange={(e) => riskCreateStore.updateField("lineId", e.currentTarget.value)}
								class="w-full px-4 py-3 bg-bg border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary
									{riskCreateStore.hasError('lineId') ? 'border-danger' : 'border-border'}"
							>
								<option value="" disabled>{m.form_selectLine()}</option>
								{#each metadataStore.lines as line}
									<option value={line.value}>{line.value}</option>
								{/each}
							</select>
							{#if getFieldError("lineId")}
								<p class="mt-1 text-sm text-danger flex items-center gap-1">
									<AlertCircle class="h-4 w-4" />
									{getFieldError("lineId")}
								</p>
							{/if}
						</div>

						<!-- Machine(s) -->
						<div>
							<label for="machines" class="block text-sm font-medium text-text mb-2">
								{m.form_machine()} <span class="text-danger">*</span>
							</label>
							<input
								id="machines"
								type="text"
								value={riskCreateStore.formData.machines}
								oninput={(e) => riskCreateStore.updateField("machines", e.currentTarget.value)}
								placeholder={m.form_machinesPlaceholder()}
								class="w-full px-4 py-3 bg-bg border rounded-lg text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary
									{riskCreateStore.hasError('machines') ? 'border-danger' : 'border-border'}"
							/>
							{#if getFieldError("machines")}
								<p class="mt-1 text-sm text-danger flex items-center gap-1">
									<AlertCircle class="h-4 w-4" />
									{getFieldError("machines")}
								</p>
							{/if}
						</div>

						<!-- Category -->
						<div>
							<label for="category" class="block text-sm font-medium text-text mb-2">
								{m.form_category()} <span class="text-danger">*</span>
							</label>
							<select
								id="category"
								value={riskCreateStore.formData.categoryId}
								onchange={(e) => riskCreateStore.updateField("categoryId", e.currentTarget.value)}
								class="w-full px-4 py-3 bg-bg border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary
									{riskCreateStore.hasError('categoryId') ? 'border-danger' : 'border-border'}"
							>
								<option value="" disabled>{m.form_selectCategory()}</option>
								{#each metadataStore.categories as category}
									<option value={category.value}>{metadataStore.getCategoryLabel(category.value)}</option>
								{/each}
							</select>
							{#if getFieldError("categoryId")}
								<p class="mt-1 text-sm text-danger flex items-center gap-1">
									<AlertCircle class="h-4 w-4" />
									{getFieldError("categoryId")}
								</p>
							{/if}
						</div>
					</div>
				{/if}

				<!-- Step 2: Risk Details -->
				{#if riskCreateStore.currentStepId === "risk"}
					<div class="space-y-6">
						<h2 class="text-lg font-semibold text-text flex items-center gap-2">
							<span class="w-1 h-5 bg-primary rounded"></span>
							{m.wizard_stepRisk()}
						</h2>

						<!-- Danger Description -->
						<div>
							<label for="danger" class="block text-sm font-medium text-text mb-2">
								{m.form_description()} <span class="text-danger">*</span>
							</label>
							<textarea
								id="danger"
								value={riskCreateStore.formData.dangerDescription}
								oninput={(e) => riskCreateStore.updateField("dangerDescription", e.currentTarget.value)}
								placeholder={m.form_dangerPlaceholder()}
								rows="4"
								class="w-full px-4 py-3 bg-bg border rounded-lg text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary resize-none
									{riskCreateStore.hasError('dangerDescription') ? 'border-danger' : 'border-border'}"
							></textarea>
							{#if getFieldError("dangerDescription")}
								<p class="mt-1 text-sm text-danger flex items-center gap-1">
									<AlertCircle class="h-4 w-4" />
									{getFieldError("dangerDescription")}
								</p>
							{/if}
						</div>

						<!-- Risk Level -->
						<div>
							<label class="block text-sm font-medium text-text mb-3">
								{m.form_riskLevel()} <span class="text-danger">*</span>
							</label>
							<div class="flex gap-2">
								{#each metadataStore.riskLevels as level}
									<button
										type="button"
										onclick={() => riskCreateStore.updateField("riskLevelId", level.value)}
										class="flex-1 py-3 px-4 rounded-lg border-2 text-center font-medium transition-all
											{riskCreateStore.formData.riskLevelId === level.value
												? 'border-primary bg-primary/5'
												: 'border-border hover:border-primary/50'}"
									>
										<Badge variant={metadataStore.getRiskLevelBadgeVariant(level.value) as any}>
											{metadataStore.getRiskLevelLabel(level.value)}
										</Badge>
									</button>
								{/each}
							</div>
							{#if getFieldError("riskLevelId")}
								<p class="mt-1 text-sm text-danger flex items-center gap-1">
									<AlertCircle class="h-4 w-4" />
									{getFieldError("riskLevelId")}
								</p>
							{/if}
						</div>

						<!-- Required Action -->
						<div>
							<label for="action" class="block text-sm font-medium text-text mb-2">
								{m.form_action()} <span class="text-text-muted">{m.form_optional()}</span>
							</label>
							<textarea
								id="action"
								value={riskCreateStore.formData.action}
								oninput={(e) => riskCreateStore.updateField("action", e.currentTarget.value)}
								placeholder={m.form_actionPlaceholder()}
								rows="4"
								class="w-full px-4 py-3 bg-bg border border-border rounded-lg text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary resize-none"
							></textarea>
						</div>
					</div>
				{/if}

				<!-- Step 3: Assignment -->
				{#if riskCreateStore.currentStepId === "assignment"}
					<div class="space-y-6">
						<h2 class="text-lg font-semibold text-text flex items-center gap-2">
							<span class="w-1 h-5 bg-primary rounded"></span>
							{m.wizard_stepAssignment()}
						</h2>

						<!-- Responsible Person -->
						<div>
							<label for="responsible" class="block text-sm font-medium text-text mb-2">
								{m.form_responsible()} <span class="text-text-muted">{m.form_optional()}</span>
							</label>
							<select
								id="responsible"
								value={riskCreateStore.formData.responsibleId}
								onchange={(e) => riskCreateStore.updateField("responsibleId", e.currentTarget.value)}
								class="w-full px-4 py-3 bg-bg border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary"
							>
								<option value="">{m.form_selectResponsible()}</option>
								{#each metadataStore.responsibles as person}
									<option value={person.value}>{person.name}</option>
								{/each}
							</select>
						</div>

						<!-- Deadline -->
						<div>
							<label for="deadline" class="block text-sm font-medium text-text mb-2">
								{m.form_deadline()} <span class="text-text-muted">{m.form_optional()}</span>
							</label>
							<input
								id="deadline"
								type="date"
								value={riskCreateStore.formData.deadline}
								oninput={(e) => riskCreateStore.updateField("deadline", e.currentTarget.value)}
								class="w-full px-4 py-3 bg-bg border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary"
							/>
						</div>

						<!-- Status info (always starts as open) -->
						<div class="p-4 bg-bg rounded-lg border border-border">
							<div class="flex items-center gap-2 text-text-muted">
								<div class="w-2 h-2 rounded-full bg-info animate-pulse"></div>
								<span class="text-sm">
									{m.form_status()}: <strong class="text-text">{m.status_open()}</strong>
								</span>
							</div>
							<p class="text-xs text-text-muted mt-1">
								New entries always start with "Open" status
							</p>
						</div>
					</div>
				{/if}

				<!-- Step 4: Optional Details -->
				{#if riskCreateStore.currentStepId === "optional"}
					<div class="space-y-6">
						<h2 class="text-lg font-semibold text-text flex items-center gap-2">
							<span class="w-1 h-5 bg-primary rounded"></span>
							{m.wizard_stepOptional()}
						</h2>

						<!-- Linked Risk -->
						<div>
							<label class="block text-sm font-medium text-text mb-2">
								{m.linkedRisk_label()} <span class="text-text-muted">{m.form_optional()}</span>
							</label>
							<p class="text-sm text-text-muted mb-3">
								{m.linkedRisk_description({
									type: riskCreateStore.formData.riskType === 1 ? m.linkedRisk_longTerm() : m.linkedRisk_shortTerm()
								})}
							</p>

							{#if riskCreateStore.formData.linkedRisk}
								<div class="p-4 bg-bg rounded-lg border border-border">
									<div class="flex items-start justify-between gap-4">
										<div class="flex-1 min-w-0">
											<div class="flex items-center gap-2 mb-1">
												<Link class="h-4 w-4 text-primary" />
												<span class="text-sm font-mono text-text-muted">
													#{riskCreateStore.formData.linkedRisk.id}
												</span>
												<Badge variant="secondary" class="text-xs">
													{riskCreateStore.formData.linkedRisk.riskType === 1 ? m.riskType_shortTerm() : m.riskType_longTerm()}
												</Badge>
											</div>
											<p class="text-text font-medium">{riskCreateStore.formData.linkedRisk.machine}</p>
											<p class="text-sm text-text-muted truncate">{riskCreateStore.formData.linkedRisk.descriptionOfDanger}</p>
										</div>
										<Button variant="ghost" size="sm" onclick={() => riskCreateStore.removeLinkedRisk()}>
											<X class="h-4 w-4" />
										</Button>
									</div>
								</div>
							{:else}
								<Button variant="outline" onclick={() => riskCreateStore.openLinkModal()}>
									<Link class="h-4 w-4 mr-2" />
									{m.linkedRisk_select()}
								</Button>
							{/if}
						</div>

						<hr class="border-border" />

						<!-- Financial Section -->
						<div class="grid grid-cols-2 gap-4">
							<!-- Cost -->
							<div>
								<label for="cost" class="block text-sm font-medium text-text mb-2">
									{m.form_cost()} <span class="text-text-muted">{m.form_optional()}</span>
								</label>
								<input
									id="cost"
									type="number"
									min="0"
									step="0.01"
									value={riskCreateStore.formData.cost ?? ""}
									oninput={(e) => {
										const val = e.currentTarget.value;
										riskCreateStore.updateField("cost", val ? parseFloat(val) : null);
									}}
									class="w-full px-4 py-3 bg-bg border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary
										{riskCreateStore.hasError('cost') ? 'border-danger' : 'border-border'}"
								/>
								{#if getFieldError("cost")}
									<p class="mt-1 text-sm text-danger flex items-center gap-1">
										<AlertCircle class="h-4 w-4" />
										{getFieldError("cost")}
									</p>
								{/if}
							</div>

							<!-- Expense Type -->
							<div>
								<label for="expenseType" class="block text-sm font-medium text-text mb-2">
									{m.form_expenseType()} <span class="text-text-muted">{m.form_optional()}</span>
								</label>
								<select
									id="expenseType"
									value={riskCreateStore.formData.expenseTypeId}
									onchange={(e) => riskCreateStore.updateField("expenseTypeId", e.currentTarget.value)}
									class="w-full px-4 py-3 bg-bg border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary"
								>
									<option value="">{m.form_selectExpenseType()}</option>
									{#each metadataStore.expenseTypes as expenseType}
										<option value={expenseType.value}>{metadataStore.getExpenseTypeLabel(expenseType.value)}</option>
									{/each}
								</select>
							</div>
						</div>

						<!-- MOC Number -->
						<div>
							<label for="moc" class="block text-sm font-medium text-text mb-2">
								{m.form_moc()} <span class="text-text-muted">{m.form_optional()}</span>
							</label>
							<input
								id="moc"
								type="text"
								value={riskCreateStore.formData.mocNumber}
								oninput={(e) => riskCreateStore.updateField("mocNumber", e.currentTarget.value)}
								class="w-full px-4 py-3 bg-bg border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary"
							/>
						</div>

						<!-- Photos -->
						<div>
							<h3 class="text-sm font-medium text-text mb-3">
								{m.section_photos()} <span class="text-text-muted">{m.form_optional()}</span>
							</h3>
							<PhotoUpload
								photos={previewPhotos}
								onUpload={onPhotoUpload}
								onRemove={onPhotoRemove}
								disabled={riskCreateStore.isSubmitting}
							/>
						</div>
					</div>
				{/if}
			</div>

			<!-- Footer Navigation -->
			<div class="px-8 py-4 border-t border-border flex justify-between items-center bg-bg rounded-b-xl">
				<div class="flex gap-2">
					{#if !riskCreateStore.isFirstStep}
						<Button variant="outline" onclick={handlePrevious} disabled={riskCreateStore.isSubmitting}>
							<ChevronLeft class="h-4 w-4 mr-2" />
							{m.wizard_previous()}
						</Button>
					{/if}
					{#if riskCreateStore.draftRestored}
						<Button variant="ghost" onclick={handleDiscardDraft} disabled={riskCreateStore.isSubmitting} class="text-text-muted">
							<RotateCcw class="h-4 w-4 mr-2" />
							{m.draft_discard()}
						</Button>
					{/if}
				</div>

				<div class="flex gap-3">
					<Button onclick={handleNext} disabled={riskCreateStore.isSubmitting}>
						{#if riskCreateStore.isSubmitting}
							<span class="h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
							{m.wizard_submitting()}
						{:else if riskCreateStore.isLastStep}
							<Check class="h-4 w-4 mr-2" />
							{m.wizard_submit()}
						{:else}
							{m.wizard_next()}
							<ChevronRight class="h-4 w-4 ml-2" />
						{/if}
					</Button>
				</div>
			</div>
		</div>
	</div>
</div>

<!-- Risk Link Modal -->
<RiskLinkModal
	open={riskCreateStore.isLinkModalOpen}
	onOpenChange={(open) => open ? riskCreateStore.openLinkModal() : riskCreateStore.closeLinkModal()}
	targetRiskType={riskCreateStore.formData.riskType}
	onSelect={(risk) => riskCreateStore.setLinkedRisk(risk)}
/>
