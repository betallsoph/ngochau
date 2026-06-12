<script lang="ts">
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { Gauge, Check, X, TriangleAlert, Camera, Loader2 } from '@lucide/svelte';

	interface ReadingRow {
		id: string;
		roomId: string;
		serviceId: string;
		month: string;
		prevValue: number;
		currValue: number;
		recordedAt: string;
		photoUrl: string | null;
		status: string;
		submittedBy: string;
		isAnomalous: boolean;
		roomNumber: string;
		propertyName: string;
		serviceName: string | null;
	}

	let landlordId = $state('');
	let readings = $state<ReadingRow[]>([]);
	let isLoading = $state(true);
	let filter = $state<'pending' | 'all'>('pending');
	let processingId = $state('');

	// Cho phép chủ nhà sửa lại số trước khi duyệt
	let edits = $state<Record<string, { prevValue: number; currValue: number }>>({});

	const visibleReadings = $derived(
		filter === 'pending' ? readings.filter((r) => r.status === 'pending') : readings
	);
	const pendingCount = $derived(readings.filter((r) => r.status === 'pending').length);

	onMount(() => {
		const sessionStr = localStorage.getItem('roomio_user');
		if (sessionStr) {
			landlordId = JSON.parse(sessionStr).landlordProfileId;
			loadReadings();
		}
	});

	async function loadReadings() {
		isLoading = true;
		try {
			const res = await fetch(`/api/meter-readings?landlordId=${landlordId}`);
			const data = await res.json();
			if (!res.ok) throw new Error(data.error);
			readings = data;
			for (const r of readings) {
				edits[r.id] = { prevValue: r.prevValue, currValue: r.currValue };
			}
		} catch (e) {
			toast.error(e instanceof Error ? e.message : 'Lỗi tải danh sách chỉ số');
		} finally {
			isLoading = false;
		}
	}

	async function review(reading: ReadingRow, action: 'approve' | 'reject') {
		processingId = reading.id;
		try {
			const edit = edits[reading.id];
			const res = await fetch('/api/meter-readings', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					id: reading.id,
					action,
					prevValue: edit?.prevValue,
					currValue: edit?.currValue
				})
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.error);
			toast.success(action === 'approve' ? 'Đã chốt chỉ số' : 'Đã từ chối chỉ số');
			await loadReadings();
		} catch (e) {
			toast.error(e instanceof Error ? e.message : 'Lỗi xử lý chỉ số');
		} finally {
			processingId = '';
		}
	}

	function statusLabel(status: string) {
		if (status === 'pending') return { text: 'Chờ duyệt', cls: 'bg-yellow-200' };
		if (status === 'approved') return { text: 'Đã chốt', cls: 'bg-green-200' };
		return { text: 'Từ chối', cls: 'bg-red-200' };
	}
</script>

<div class="space-y-5">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<div>
			<h1 class="flex items-center gap-2 text-2xl font-black text-black">
				Chốt số điện nước <Gauge class="h-6 w-6" />
			</h1>
			<p class="mt-1 text-sm font-bold text-zinc-500">
				Duyệt chỉ số khách gửi: đối chiếu ảnh chụp đồng hồ, sửa lại số nếu cần rồi chốt.
			</p>
		</div>
		<div class="flex gap-2">
			<button
				onclick={() => (filter = 'pending')}
				class="rounded-[6px] border-2 border-black px-4 py-2 text-sm font-black transition-all {filter ===
				'pending'
					? 'bg-yellow-200 shadow-secondary'
					: 'bg-white text-zinc-500'}"
			>
				Chờ duyệt ({pendingCount})
			</button>
			<button
				onclick={() => (filter = 'all')}
				class="rounded-[6px] border-2 border-black px-4 py-2 text-sm font-black transition-all {filter ===
				'all'
					? 'bg-blue-300 shadow-secondary'
					: 'bg-white text-zinc-500'}"
			>
				Tất cả
			</button>
		</div>
	</div>

	{#if isLoading}
		<div class="flex justify-center py-16">
			<Loader2 class="h-8 w-8 animate-spin text-zinc-400" />
		</div>
	{:else if visibleReadings.length === 0}
		<div class="rounded-lg border-2 border-black bg-white p-10 text-center">
			<p class="font-black text-zinc-400">
				{filter === 'pending' ? 'Không có chỉ số nào đang chờ duyệt.' : 'Chưa có chỉ số nào.'}
			</p>
		</div>
	{:else}
		<div class="space-y-3">
			{#each visibleReadings as reading (reading.id)}
				{@const badge = statusLabel(reading.status)}
				{@const usage =
					(edits[reading.id]?.currValue ?? reading.currValue) -
					(edits[reading.id]?.prevValue ?? reading.prevValue)}
				<div
					class="flex flex-col gap-4 rounded-lg border-2 border-black bg-white p-4 md:flex-row md:items-center"
				>
					<div class="min-w-0 flex-1">
						<div class="flex flex-wrap items-center gap-2">
							<span class="font-black text-black"
								>{reading.propertyName} - P.{reading.roomNumber}</span
							>
							<span class="rounded border-2 border-black bg-blue-100 px-1.5 text-xs font-black">
								{reading.serviceName ?? 'Dịch vụ'}
							</span>
							<span class="rounded border-2 border-black px-1.5 text-xs font-black {badge.cls}"
								>{badge.text}</span
							>
							{#if reading.isAnomalous}
								<span
									class="flex items-center gap-1 rounded border-2 border-black bg-red-200 px-1.5 text-xs font-black"
								>
									<TriangleAlert class="h-3 w-3" /> Bất thường
								</span>
							{/if}
						</div>
						<p class="mt-1 text-xs font-bold text-zinc-500">
							Tháng {reading.month} | Gửi ngày {reading.recordedAt} |
							{reading.submittedBy === 'TENANT' ? 'Khách tự báo số' : 'Chủ nhà ghi'}
						</p>
						<div class="mt-2 flex flex-wrap items-center gap-2">
							<label class="text-xs font-black text-zinc-500">
								Đầu kỳ
								<input
									type="number"
									bind:value={edits[reading.id].prevValue}
									disabled={reading.status !== 'pending'}
									class="block w-28 rounded border-2 border-black px-2 py-1 text-sm font-bold disabled:bg-zinc-100"
								/>
							</label>
							<label class="text-xs font-black text-zinc-500">
								Cuối kỳ
								<input
									type="number"
									bind:value={edits[reading.id].currValue}
									disabled={reading.status !== 'pending'}
									class="block w-28 rounded border-2 border-black px-2 py-1 text-sm font-bold disabled:bg-zinc-100"
								/>
							</label>
							<span class="text-sm font-black {usage < 0 ? 'text-red-600' : 'text-black'} mt-4">
								= {usage}
								{reading.serviceName === 'Điện' ? 'kWh' : 'đơn vị'}
							</span>
						</div>
					</div>

					<div class="flex shrink-0 items-center gap-2">
						{#if reading.photoUrl}
							<a
								href={reading.photoUrl}
								target="_blank"
								rel="noreferrer"
								class="block overflow-hidden rounded-lg border-2 border-black"
								title="Xem ảnh đồng hồ"
							>
								<img src={reading.photoUrl} alt="Ảnh đồng hồ" class="h-16 w-16 object-cover" />
							</a>
						{:else}
							<div
								class="flex h-16 w-16 items-center justify-center rounded-lg border-2 border-dashed border-zinc-300 text-zinc-300"
							>
								<Camera class="h-5 w-5" />
							</div>
						{/if}

						{#if reading.status === 'pending'}
							<button
								onclick={() => review(reading, 'approve')}
								disabled={processingId === reading.id || usage < 0}
								class="flex items-center gap-1 rounded-[6px] border-2 border-black bg-green-200 px-3 py-2 text-xs font-black shadow-secondary transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none disabled:opacity-50"
							>
								<Check class="h-4 w-4" /> Chốt
							</button>
							<button
								onclick={() => review(reading, 'reject')}
								disabled={processingId === reading.id}
								class="flex items-center gap-1 rounded-[6px] border-2 border-black bg-red-200 px-3 py-2 text-xs font-black shadow-secondary transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none disabled:opacity-50"
							>
								<X class="h-4 w-4" /> Từ chối
							</button>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
