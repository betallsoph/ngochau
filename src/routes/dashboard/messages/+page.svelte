<script lang="ts">
	import { onMount, onDestroy, tick } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { MessageSquare, Send, Loader2 } from '@lucide/svelte';

	interface TenantRow {
		id: string;
		user: { id: string; name: string; phone: string };
		rooms: { roomNumber: string; property: { shortName: string } }[];
	}

	interface MessageRow {
		id: string;
		senderId: string;
		content: string;
		createdAt: string;
	}

	let landlordId = $state('');
	let myUserId = $state('');
	let tenants = $state<TenantRow[]>([]);
	let selectedTenant = $state<TenantRow | null>(null);
	let messageList = $state<MessageRow[]>([]);
	let draft = $state('');
	let isLoading = $state(true);
	let isSending = $state(false);
	let pollTimer: ReturnType<typeof setInterval> | null = null;
	let scrollContainer = $state<HTMLDivElement | null>(null);

	onMount(() => {
		const sessionStr = localStorage.getItem('roomio_user');
		if (sessionStr) {
			const session = JSON.parse(sessionStr);
			landlordId = session.landlordProfileId;
			myUserId = session.id;
			loadTenants();
		}
		pollTimer = setInterval(() => {
			if (selectedTenant) loadMessages(false);
		}, 5000);
	});

	onDestroy(() => {
		if (pollTimer) clearInterval(pollTimer);
	});

	async function loadTenants() {
		try {
			const res = await fetch(`/api/tenants?landlordId=${landlordId}`);
			const data = await res.json();
			if (!res.ok) throw new Error(data.error);
			tenants = data;
		} catch (e) {
			toast.error(e instanceof Error ? e.message : 'Lỗi tải danh sách khách thuê');
		} finally {
			isLoading = false;
		}
	}

	async function selectTenant(tenant: TenantRow) {
		selectedTenant = tenant;
		messageList = [];
		await loadMessages(true);
	}

	async function loadMessages(scrollToEnd: boolean) {
		if (!selectedTenant) return;
		try {
			const res = await fetch(
				`/api/messages?landlordId=${landlordId}&tenantId=${selectedTenant.id}`
			);
			const data = await res.json();
			if (!res.ok) return;
			const hadNew = data.length !== messageList.length;
			messageList = data;
			if (scrollToEnd || hadNew) {
				await tick();
				scrollContainer?.scrollTo({ top: scrollContainer.scrollHeight });
			}
		} catch {
			// Bỏ qua lỗi polling, lần sau thử lại
		}
	}

	async function sendMessage() {
		if (!draft.trim() || !selectedTenant) return;
		isSending = true;
		try {
			const res = await fetch('/api/messages', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ landlordId, tenantId: selectedTenant.id, content: draft })
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.error);
			draft = '';
			await loadMessages(true);
		} catch (e) {
			toast.error(e instanceof Error ? e.message : 'Lỗi gửi tin nhắn');
		} finally {
			isSending = false;
		}
	}

	function formatTime(value: string) {
		return new Date(value).toLocaleString('vi-VN', { hour12: false });
	}
</script>

<div class="h-full space-y-5">
	<div>
		<h1 class="flex items-center gap-2 text-2xl font-black text-black">
			Tin nhắn <MessageSquare class="h-6 w-6" />
		</h1>
		<p class="mt-1 text-sm font-bold text-zinc-500">Trao đổi trực tiếp với khách thuê.</p>
	</div>

	{#if isLoading}
		<div class="flex justify-center py-16">
			<Loader2 class="h-8 w-8 animate-spin text-zinc-400" />
		</div>
	{:else}
		<div class="grid grid-cols-1 gap-4 md:h-[calc(100vh-220px)] md:grid-cols-3">
			<!-- Danh sách khách -->
			<div class="max-h-64 overflow-y-auto rounded-lg border-2 border-black bg-white md:max-h-none">
				{#if tenants.length === 0}
					<p class="p-6 text-center text-sm font-bold text-zinc-400">Chưa có khách thuê.</p>
				{/if}
				{#each tenants as tenant (tenant.id)}
					<button
						onclick={() => selectTenant(tenant)}
						class="w-full border-b-2 border-zinc-100 px-4 py-3 text-left transition-colors hover:bg-blue-50 {selectedTenant?.id ===
						tenant.id
							? 'bg-blue-100'
							: ''}"
					>
						<p class="truncate text-sm font-black text-black">{tenant.user.name}</p>
						<p class="text-xs font-bold text-zinc-500">
							{tenant.rooms[0]
								? `${tenant.rooms[0].property.shortName} - P.${tenant.rooms[0].roomNumber}`
								: 'Chưa có phòng'}
						</p>
					</button>
				{/each}
			</div>

			<!-- Khung chat -->
			<div
				class="flex min-h-[400px] flex-col rounded-lg border-2 border-black bg-white md:col-span-2"
			>
				{#if !selectedTenant}
					<div class="flex flex-1 items-center justify-center">
						<p class="text-sm font-black text-zinc-400">
							Chọn một khách thuê để bắt đầu trò chuyện.
						</p>
					</div>
				{:else}
					<div class="border-b-2 border-black px-4 py-3">
						<p class="text-sm font-black">{selectedTenant.user.name}</p>
						<p class="text-xs font-bold text-zinc-500">{selectedTenant.user.phone}</p>
					</div>
					<div bind:this={scrollContainer} class="flex-1 space-y-2 overflow-y-auto p-4">
						{#if messageList.length === 0}
							<p class="py-8 text-center text-xs font-bold text-zinc-400">Chưa có tin nhắn nào.</p>
						{/if}
						{#each messageList as message (message.id)}
							{@const mine = message.senderId === myUserId}
							<div class="flex {mine ? 'justify-end' : 'justify-start'}">
								<div
									class="max-w-[75%] rounded-lg border-2 border-black px-3 py-2 {mine
										? 'bg-blue-300'
										: 'bg-white'}"
								>
									<p class="text-sm font-bold break-words whitespace-pre-wrap text-black">
										{message.content}
									</p>
									<p class="mt-0.5 text-[10px] font-bold text-zinc-500">
										{formatTime(message.createdAt)}
									</p>
								</div>
							</div>
						{/each}
					</div>
					<div class="flex gap-2 border-t-2 border-black p-3">
						<input
							type="text"
							bind:value={draft}
							onkeydown={(e) => e.key === 'Enter' && sendMessage()}
							placeholder="Nhập tin nhắn..."
							class="flex-1 rounded-[6px] border-2 border-black px-3 py-2 text-sm font-bold"
						/>
						<button
							onclick={sendMessage}
							disabled={isSending || !draft.trim()}
							class="rounded-[6px] border-2 border-black bg-blue-300 px-4 py-2 font-black shadow-secondary transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none disabled:opacity-50"
						>
							<Send class="h-4 w-4" />
						</button>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>
