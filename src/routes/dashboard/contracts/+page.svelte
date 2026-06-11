<script lang="ts">
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { FileText, Plus, Trash2, Ban, Loader2, X } from '@lucide/svelte';
	import { uploadImage } from '$lib/upload';

	interface ContractRow {
		id: string;
		tenantId: string;
		roomId: string;
		startDate: string;
		endDate: string;
		monthlyRent: number;
		deposit: number;
		fileUrl: string | null;
		status: string;
		notes: string | null;
		tenant: { user: { name: string; phone: string } };
		room: { roomNumber: string; property: { name: string; shortName: string } };
	}

	interface TenantOption {
		id: string;
		user: { name: string };
		rooms: {
			id: string;
			roomNumber: string;
			monthlyRent: number;
			property: { shortName: string };
		}[];
	}

	let landlordId = $state('');
	let contractList = $state<ContractRow[]>([]);
	let tenantOptions = $state<TenantOption[]>([]);
	let isLoading = $state(true);
	let showCreateModal = $state(false);
	let isSaving = $state(false);
	let isUploadingFile = $state(false);

	let form = $state({
		tenantId: '',
		startDate: new Date().toISOString().split('T')[0],
		endDate: '',
		monthlyRent: 0,
		deposit: 0,
		fileUrl: '',
		notes: ''
	});

	const selectedTenant = $derived(tenantOptions.find((t) => t.id === form.tenantId));
	const today = new Date().toISOString().split('T')[0];
	const in30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

	function isExpiringSoon(c: ContractRow) {
		return c.status === 'active' && c.endDate >= today && c.endDate <= in30Days;
	}

	onMount(() => {
		const sessionStr = localStorage.getItem('roomio_user');
		if (sessionStr) {
			landlordId = JSON.parse(sessionStr).landlordProfileId;
			loadContracts();
		}
	});

	async function loadContracts() {
		isLoading = true;
		try {
			const [contractsRes, tenantsRes] = await Promise.all([
				fetch(`/api/contracts?landlordId=${landlordId}`),
				fetch(`/api/tenants?landlordId=${landlordId}`)
			]);
			const contractsData = await contractsRes.json();
			const tenantsData = await tenantsRes.json();
			if (!contractsRes.ok) throw new Error(contractsData.error);
			contractList = contractsData;
			if (tenantsRes.ok) tenantOptions = tenantsData;
		} catch (e) {
			toast.error(e instanceof Error ? e.message : 'Lỗi tải danh sách hợp đồng');
		} finally {
			isLoading = false;
		}
	}

	function openCreate() {
		form = {
			tenantId: '',
			startDate: new Date().toISOString().split('T')[0],
			endDate: '',
			monthlyRent: 0,
			deposit: 0,
			fileUrl: '',
			notes: ''
		};
		showCreateModal = true;
	}

	async function handleFileChange(event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		isUploadingFile = true;
		try {
			form.fileUrl = await uploadImage(file);
			toast.success('Đã tải file hợp đồng lên');
		} catch (e) {
			toast.error(e instanceof Error ? e.message : 'Lỗi upload file');
		} finally {
			isUploadingFile = false;
			input.value = '';
		}
	}

	async function createContract() {
		const room = selectedTenant?.rooms[0];
		if (!form.tenantId || !room || !form.startDate || !form.endDate || !form.monthlyRent) {
			toast.error('Vui lòng điền đủ khách thuê, ngày bắt đầu/kết thúc và tiền thuê');
			return;
		}
		isSaving = true;
		try {
			const res = await fetch('/api/contracts', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					tenantId: form.tenantId,
					roomId: room.id,
					startDate: form.startDate,
					endDate: form.endDate,
					monthlyRent: form.monthlyRent,
					deposit: form.deposit,
					fileUrl: form.fileUrl || null,
					notes: form.notes || null
				})
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.error);
			toast.success('Đã tạo hợp đồng');
			showCreateModal = false;
			await loadContracts();
		} catch (e) {
			toast.error(e instanceof Error ? e.message : 'Lỗi tạo hợp đồng');
		} finally {
			isSaving = false;
		}
	}

	async function terminateContract(c: ContractRow) {
		if (!confirm(`Chấm dứt hợp đồng phòng ${c.room.roomNumber} của ${c.tenant.user.name}?`)) return;
		const res = await fetch('/api/contracts', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ id: c.id, status: 'terminated' })
		});
		if (res.ok) {
			toast.success('Đã chấm dứt hợp đồng');
			await loadContracts();
		} else {
			toast.error('Lỗi cập nhật hợp đồng');
		}
	}

	async function deleteContract(c: ContractRow) {
		if (!confirm('Xóa hẳn hợp đồng này? Hành động không thể hoàn tác.')) return;
		const res = await fetch(`/api/contracts?id=${c.id}`, { method: 'DELETE' });
		if (res.ok) {
			toast.success('Đã xóa hợp đồng');
			await loadContracts();
		} else {
			toast.error('Lỗi xóa hợp đồng');
		}
	}

	function statusBadge(c: ContractRow) {
		if (c.status === 'terminated') return { text: 'Đã chấm dứt', cls: 'bg-zinc-200' };
		if (c.endDate < today) return { text: 'Hết hạn', cls: 'bg-red-200' };
		if (isExpiringSoon(c)) return { text: 'Sắp hết hạn', cls: 'bg-yellow-200' };
		return { text: 'Hiệu lực', cls: 'bg-green-200' };
	}

	const formatMoney = (n: number) => new Intl.NumberFormat('vi-VN').format(n) + 'đ';
</script>

<div class="space-y-5">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<div>
			<h1 class="flex items-center gap-2 text-2xl font-black text-black">
				Hợp đồng thuê <FileText class="h-6 w-6" />
			</h1>
			<p class="mt-1 text-sm font-bold text-zinc-500">
				Theo dõi thời hạn hợp đồng, lưu file scan và nhận cảnh báo sắp hết hạn.
			</p>
		</div>
		<button
			onclick={openCreate}
			class="flex items-center gap-1.5 rounded-[6px] border-2 border-black bg-blue-300 px-4 py-2 text-sm font-black shadow-secondary transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
		>
			<Plus class="h-4 w-4" /> Tạo hợp đồng
		</button>
	</div>

	{#if isLoading}
		<div class="flex justify-center py-16">
			<Loader2 class="h-8 w-8 animate-spin text-zinc-400" />
		</div>
	{:else if contractList.length === 0}
		<div class="rounded-lg border-2 border-black bg-white p-10 text-center">
			<p class="font-black text-zinc-400">Chưa có hợp đồng nào.</p>
		</div>
	{:else}
		<div class="space-y-3">
			{#each contractList as c (c.id)}
				{@const badge = statusBadge(c)}
				<div
					class="flex flex-col gap-3 rounded-lg border-2 border-black bg-white p-4 md:flex-row md:items-center {isExpiringSoon(
						c
					)
						? 'bg-yellow-50'
						: ''}"
				>
					<div class="min-w-0 flex-1">
						<div class="flex flex-wrap items-center gap-2">
							<span class="font-black text-black">{c.tenant.user.name}</span>
							<span class="text-xs font-bold text-zinc-500">{c.tenant.user.phone}</span>
							<span class="rounded border-2 border-black bg-blue-100 px-1.5 text-xs font-black">
								{c.room.property.shortName} - P.{c.room.roomNumber}
							</span>
							<span class="rounded border-2 border-black px-1.5 text-xs font-black {badge.cls}"
								>{badge.text}</span
							>
						</div>
						<p class="mt-1.5 text-xs font-bold text-zinc-500">
							{c.startDate} đến {c.endDate} | Thuê {formatMoney(c.monthlyRent)}/tháng | Cọc {formatMoney(
								c.deposit
							)}
						</p>
						{#if c.notes}
							<p class="mt-1 text-xs font-bold text-zinc-400">{c.notes}</p>
						{/if}
					</div>
					<div class="flex shrink-0 items-center gap-2">
						{#if c.fileUrl}
							<a
								href={c.fileUrl}
								target="_blank"
								rel="noreferrer"
								class="rounded-[6px] border-2 border-black bg-white px-3 py-2 text-xs font-black hover:bg-zinc-50"
							>
								Xem file
							</a>
						{/if}
						{#if c.status === 'active'}
							<button
								onclick={() => terminateContract(c)}
								class="flex items-center gap-1 rounded-[6px] border-2 border-black bg-yellow-200 px-3 py-2 text-xs font-black shadow-secondary transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
							>
								<Ban class="h-4 w-4" /> Chấm dứt
							</button>
						{/if}
						<button
							onclick={() => deleteContract(c)}
							class="flex items-center gap-1 rounded-[6px] border-2 border-black bg-red-200 px-3 py-2 text-xs font-black shadow-secondary transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
						>
							<Trash2 class="h-4 w-4" />
						</button>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

{#if showCreateModal}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
	>
		<div
			class="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg border-2 border-black bg-white"
		>
			<div class="flex items-center justify-between border-b-2 border-black p-4">
				<h2 class="text-lg font-black">Tạo hợp đồng thuê</h2>
				<button
					onclick={() => (showCreateModal = false)}
					class="rounded-[6px] border-2 border-black p-1.5 hover:bg-zinc-50"
				>
					<X class="h-4 w-4" />
				</button>
			</div>
			<div class="space-y-3 p-4">
				<label class="block text-xs font-black text-zinc-500">
					Khách thuê (phòng đang ở)
					<select
						bind:value={form.tenantId}
						onchange={() => {
							const room = selectedTenant?.rooms[0];
							if (room) form.monthlyRent = room.monthlyRent;
						}}
						class="mt-1 w-full rounded-[6px] border-2 border-black bg-white px-3 py-2 text-sm font-bold"
					>
						<option value="">-- Chọn khách --</option>
						{#each tenantOptions as t (t.id)}
							{#if t.rooms.length > 0}
								<option value={t.id}>
									{t.user.name} ({t.rooms[0].property.shortName} - P.{t.rooms[0].roomNumber})
								</option>
							{/if}
						{/each}
					</select>
				</label>
				<div class="grid grid-cols-2 gap-3">
					<label class="block text-xs font-black text-zinc-500">
						Ngày bắt đầu
						<input
							type="date"
							bind:value={form.startDate}
							class="mt-1 w-full rounded-[6px] border-2 border-black px-3 py-2 text-sm font-bold"
						/>
					</label>
					<label class="block text-xs font-black text-zinc-500">
						Ngày kết thúc
						<input
							type="date"
							bind:value={form.endDate}
							class="mt-1 w-full rounded-[6px] border-2 border-black px-3 py-2 text-sm font-bold"
						/>
					</label>
					<label class="block text-xs font-black text-zinc-500">
						Tiền thuê / tháng
						<input
							type="number"
							bind:value={form.monthlyRent}
							class="mt-1 w-full rounded-[6px] border-2 border-black px-3 py-2 text-sm font-bold"
						/>
					</label>
					<label class="block text-xs font-black text-zinc-500">
						Tiền cọc
						<input
							type="number"
							bind:value={form.deposit}
							class="mt-1 w-full rounded-[6px] border-2 border-black px-3 py-2 text-sm font-bold"
						/>
					</label>
				</div>
				<label class="block text-xs font-black text-zinc-500">
					File hợp đồng (ảnh scan)
					<input
						type="file"
						accept="image/*"
						onchange={handleFileChange}
						class="mt-1 w-full rounded-[6px] border-2 border-black px-3 py-2 text-sm font-bold file:hidden"
					/>
				</label>
				{#if isUploadingFile}
					<p class="flex items-center gap-1 text-xs font-bold text-zinc-500">
						<Loader2 class="h-3 w-3 animate-spin" /> Đang tải file...
					</p>
				{:else if form.fileUrl}
					<img src={form.fileUrl} alt="File hợp đồng" class="h-20 rounded border-2 border-black" />
				{/if}
				<label class="block text-xs font-black text-zinc-500">
					Ghi chú
					<textarea
						bind:value={form.notes}
						rows="2"
						class="mt-1 w-full rounded-[6px] border-2 border-black px-3 py-2 text-sm font-bold"
					></textarea>
				</label>
				<button
					onclick={createContract}
					disabled={isSaving || isUploadingFile}
					class="w-full rounded-[6px] border-2 border-black bg-blue-300 py-2.5 text-sm font-black shadow-secondary transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none disabled:opacity-50"
				>
					{isSaving ? 'Đang lưu...' : 'Tạo hợp đồng'}
				</button>
			</div>
		</div>
	</div>
{/if}
