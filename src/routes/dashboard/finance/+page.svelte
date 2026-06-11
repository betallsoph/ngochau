<script lang="ts">
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { TrendingUp, Plus, Trash2, Loader2, X } from '@lucide/svelte';

	interface MonthlyRow {
		month: string;
		revenue: number;
		expense: number;
		profit: number;
	}

	interface ExpenseRow {
		id: string;
		category: string;
		description: string;
		amount: number;
		date: string;
		notes: string | null;
		property: { name: string; shortName: string } | null;
	}

	interface PropertyOption {
		id: string;
		shortName: string;
	}

	const CATEGORIES: Record<string, string> = {
		electricity: 'Tiền điện',
		water: 'Tiền nước',
		internet: 'Internet',
		maintenance: 'Sửa chữa',
		cleaning: 'Vệ sinh',
		tax: 'Thuế/phí',
		other: 'Khác'
	};

	let landlordId = $state('');
	let monthly = $state<MonthlyRow[]>([]);
	let totals = $state({ revenue: 0, expense: 0, profit: 0 });
	let expenseList = $state<ExpenseRow[]>([]);
	let propertyOptions = $state<PropertyOption[]>([]);
	let isLoading = $state(true);
	let showAddModal = $state(false);
	let isSaving = $state(false);

	let form = $state({
		category: 'electricity',
		description: '',
		amount: 0,
		date: new Date().toISOString().split('T')[0],
		propertyId: '',
		notes: ''
	});

	const maxBar = $derived(Math.max(...monthly.map((m) => Math.max(m.revenue, m.expense)), 1));
	const formatMoney = (n: number) => new Intl.NumberFormat('vi-VN').format(n) + 'đ';

	onMount(() => {
		const sessionStr = localStorage.getItem('roomio_user');
		if (sessionStr) {
			landlordId = JSON.parse(sessionStr).landlordProfileId;
			loadData();
		}
	});

	async function loadData() {
		isLoading = true;
		try {
			const [financeRes, expensesRes, propertiesRes] = await Promise.all([
				fetch(`/api/finance?landlordId=${landlordId}&months=6`),
				fetch(`/api/expenses?landlordId=${landlordId}`),
				fetch(`/api/properties?landlordId=${landlordId}`)
			]);
			const financeData = await financeRes.json();
			const expensesData = await expensesRes.json();
			const propertiesData = await propertiesRes.json();
			if (!financeRes.ok) throw new Error(financeData.error);

			monthly = financeData.monthly;
			totals = {
				revenue: financeData.totalRevenue,
				expense: financeData.totalExpense,
				profit: financeData.totalProfit
			};
			if (expensesRes.ok) expenseList = expensesData;
			if (propertiesRes.ok) propertyOptions = propertiesData;
		} catch (e) {
			toast.error(e instanceof Error ? e.message : 'Lỗi tải dữ liệu tài chính');
		} finally {
			isLoading = false;
		}
	}

	async function addExpense() {
		if (!form.description || !form.amount || !form.date) {
			toast.error('Vui lòng điền mô tả, số tiền và ngày chi');
			return;
		}
		isSaving = true;
		try {
			const res = await fetch('/api/expenses', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					landlordId,
					propertyId: form.propertyId || null,
					category: form.category,
					description: form.description,
					amount: form.amount,
					date: form.date,
					notes: form.notes || null
				})
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.error);
			toast.success('Đã ghi nhận chi phí');
			showAddModal = false;
			form = {
				category: 'electricity',
				description: '',
				amount: 0,
				date: new Date().toISOString().split('T')[0],
				propertyId: '',
				notes: ''
			};
			await loadData();
		} catch (e) {
			toast.error(e instanceof Error ? e.message : 'Lỗi lưu chi phí');
		} finally {
			isSaving = false;
		}
	}

	async function deleteExpense(expense: ExpenseRow) {
		if (!confirm(`Xóa khoản chi "${expense.description}"?`)) return;
		const res = await fetch(`/api/expenses?id=${expense.id}`, { method: 'DELETE' });
		if (res.ok) {
			toast.success('Đã xóa khoản chi');
			await loadData();
		} else {
			toast.error('Lỗi xóa khoản chi');
		}
	}
</script>

<div class="space-y-5">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<div>
			<h1 class="flex items-center gap-2 text-2xl font-black text-black">
				Tài chính <TrendingUp class="h-6 w-6" />
			</h1>
			<p class="mt-1 text-sm font-bold text-zinc-500">
				Dòng tiền 6 tháng gần nhất: doanh thu đã thực thu so với chi phí vận hành.
			</p>
		</div>
		<button
			onclick={() => (showAddModal = true)}
			class="flex items-center gap-1.5 rounded-[6px] border-2 border-black bg-blue-300 px-4 py-2 text-sm font-black shadow-secondary transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
		>
			<Plus class="h-4 w-4" /> Ghi chi phí
		</button>
	</div>

	{#if isLoading}
		<div class="flex justify-center py-16">
			<Loader2 class="h-8 w-8 animate-spin text-zinc-400" />
		</div>
	{:else}
		<!-- Tổng quan -->
		<div class="grid grid-cols-1 gap-3 md:grid-cols-3">
			<div class="rounded-lg border-2 border-black bg-green-100 p-4">
				<p class="text-xs font-black text-zinc-600 uppercase">Doanh thu (6 tháng)</p>
				<p class="mt-1 text-xl font-black text-black">{formatMoney(totals.revenue)}</p>
			</div>
			<div class="rounded-lg border-2 border-black bg-red-100 p-4">
				<p class="text-xs font-black text-zinc-600 uppercase">Chi phí (6 tháng)</p>
				<p class="mt-1 text-xl font-black text-black">{formatMoney(totals.expense)}</p>
			</div>
			<div
				class="rounded-lg border-2 border-black {totals.profit >= 0
					? 'bg-blue-100'
					: 'bg-red-200'} p-4"
			>
				<p class="text-xs font-black text-zinc-600 uppercase">Lợi nhuận</p>
				<p class="mt-1 text-xl font-black text-black">{formatMoney(totals.profit)}</p>
			</div>
		</div>

		<!-- Biểu đồ cột đơn giản theo tháng -->
		<div class="rounded-lg border-2 border-black bg-white p-4">
			<p class="mb-3 text-sm font-black text-black">Thu / chi theo tháng</p>
			<div class="space-y-3">
				{#each monthly as m (m.month)}
					<div>
						<div class="flex items-center justify-between text-xs font-black">
							<span>{m.month}</span>
							<span class={m.profit >= 0 ? 'text-green-700' : 'text-red-600'}>
								Lãi/lỗ: {formatMoney(m.profit)}
							</span>
						</div>
						<div class="mt-1 space-y-1">
							<div class="h-3 overflow-hidden rounded border border-black bg-zinc-100">
								<div class="h-full bg-green-300" style="width: {(m.revenue / maxBar) * 100}%"></div>
							</div>
							<div class="h-3 overflow-hidden rounded border border-black bg-zinc-100">
								<div class="h-full bg-red-300" style="width: {(m.expense / maxBar) * 100}%"></div>
							</div>
						</div>
						<p class="mt-0.5 text-[10px] font-bold text-zinc-500">
							Thu {formatMoney(m.revenue)} | Chi {formatMoney(m.expense)}
						</p>
					</div>
				{/each}
			</div>
		</div>

		<!-- Danh sách chi phí -->
		<div class="rounded-lg border-2 border-black bg-white">
			<p class="border-b-2 border-black px-4 py-3 text-sm font-black text-black">
				Các khoản chi gần đây
			</p>
			{#if expenseList.length === 0}
				<p class="p-6 text-center text-sm font-bold text-zinc-400">Chưa ghi nhận khoản chi nào.</p>
			{/if}
			{#each expenseList.slice(0, 30) as expense (expense.id)}
				<div class="flex items-center gap-3 border-b border-zinc-100 px-4 py-3">
					<span
						class="shrink-0 rounded border-2 border-black bg-zinc-100 px-1.5 text-xs font-black"
					>
						{CATEGORIES[expense.category] ?? expense.category}
					</span>
					<div class="min-w-0 flex-1">
						<p class="truncate text-sm font-black text-black">{expense.description}</p>
						<p class="text-xs font-bold text-zinc-500">
							{expense.date}{expense.property ? ` | ${expense.property.shortName}` : ''}
						</p>
					</div>
					<span class="shrink-0 text-sm font-black text-red-600"
						>-{formatMoney(expense.amount)}</span
					>
					<button
						onclick={() => deleteExpense(expense)}
						class="shrink-0 rounded-[6px] border-2 border-black bg-red-200 p-1.5 transition-all hover:translate-x-[1px] hover:translate-y-[1px]"
						title="Xóa khoản chi"
					>
						<Trash2 class="h-3.5 w-3.5" />
					</button>
				</div>
			{/each}
		</div>
	{/if}
</div>

{#if showAddModal}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
	>
		<div
			class="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg border-2 border-black bg-white"
		>
			<div class="flex items-center justify-between border-b-2 border-black p-4">
				<h2 class="text-lg font-black">Ghi nhận chi phí</h2>
				<button
					onclick={() => (showAddModal = false)}
					class="rounded-[6px] border-2 border-black p-1.5 hover:bg-zinc-50"
				>
					<X class="h-4 w-4" />
				</button>
			</div>
			<div class="space-y-3 p-4">
				<div class="grid grid-cols-2 gap-3">
					<label class="block text-xs font-black text-zinc-500">
						Loại chi phí
						<select
							bind:value={form.category}
							class="mt-1 w-full rounded-[6px] border-2 border-black bg-white px-3 py-2 text-sm font-bold"
						>
							{#each Object.entries(CATEGORIES) as [value, label] (value)}
								<option {value}>{label}</option>
							{/each}
						</select>
					</label>
					<label class="block text-xs font-black text-zinc-500">
						Ngày chi
						<input
							type="date"
							bind:value={form.date}
							class="mt-1 w-full rounded-[6px] border-2 border-black px-3 py-2 text-sm font-bold"
						/>
					</label>
				</div>
				<label class="block text-xs font-black text-zinc-500">
					Mô tả
					<input
						type="text"
						bind:value={form.description}
						placeholder="Ví dụ: Tiền điện khu vực chung"
						class="mt-1 w-full rounded-[6px] border-2 border-black px-3 py-2 text-sm font-bold"
					/>
				</label>
				<label class="block text-xs font-black text-zinc-500">
					Số tiền
					<input
						type="number"
						bind:value={form.amount}
						class="mt-1 w-full rounded-[6px] border-2 border-black px-3 py-2 text-sm font-bold"
					/>
				</label>
				<label class="block text-xs font-black text-zinc-500">
					Tòa nhà (tùy chọn)
					<select
						bind:value={form.propertyId}
						class="mt-1 w-full rounded-[6px] border-2 border-black bg-white px-3 py-2 text-sm font-bold"
					>
						<option value="">Chi phí chung</option>
						{#each propertyOptions as property (property.id)}
							<option value={property.id}>{property.shortName}</option>
						{/each}
					</select>
				</label>
				<button
					onclick={addExpense}
					disabled={isSaving}
					class="w-full rounded-[6px] border-2 border-black bg-blue-300 py-2.5 text-sm font-black shadow-secondary transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none disabled:opacity-50"
				>
					{isSaving ? 'Đang lưu...' : 'Lưu chi phí'}
				</button>
			</div>
		</div>
	</div>
{/if}
