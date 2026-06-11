<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { toast } from 'svelte-sonner';
	import {
		LayoutDashboard,
		Building2,
		Home,
		Receipt,
		Users,
		Wrench,
		Settings,
		Bell,
		LogOut,
		Menu,
		X,
		User,
		Gauge,
		FileText,
		TrendingUp,
		MessageSquare
	} from '@lucide/svelte';

	let { children } = $props();

	let user = $state<{ name: string; role: string; landlordProfileId: string } | null>(null);
	let isMobileMenuOpen = $state(false);

	// Active route checking
	const activeRoute = $derived(page.url.pathname);

	onMount(() => {
		const sessionStr = localStorage.getItem('roomio_user');
		if (!sessionStr) {
			goto('/login');
			return;
		}

		try {
			const session = JSON.parse(sessionStr);
			if (session.role !== 'LANDLORD' && session.role !== 'SUPER_ADMIN') {
				toast.error('Bạn không có quyền truy cập cổng chủ trọ');
				goto('/login');
				return;
			}
			user = session;
		} catch (e) {
			localStorage.removeItem('roomio_user');
			goto('/login');
		}
	});

	async function handleLogout() {
		try {
			await fetch('/api/auth', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ action: 'logout' })
			});
		} catch {
			// Bỏ qua lỗi mạng, vẫn xóa phiên phía client
		}
		localStorage.removeItem('roomio_user');
		toast.success('Đã đăng xuất thành công');
		goto('/login');
	}

	const menuItems = [
		{ name: 'Tổng quan', path: '/dashboard', icon: LayoutDashboard },
		{ name: 'Tòa nhà', path: '/dashboard/buildings', icon: Building2 },
		{ name: 'Phòng trọ', path: '/dashboard/rooms', icon: Home },
		{ name: 'Chốt số điện nước', path: '/dashboard/meters', icon: Gauge },
		{ name: 'Hóa đơn', path: '/dashboard/invoices', icon: Receipt },
		{ name: 'Khách thuê', path: '/dashboard/tenants', icon: Users },
		{ name: 'Hợp đồng', path: '/dashboard/contracts', icon: FileText },
		{ name: 'Sự cố', path: '/dashboard/requests', icon: Wrench },
		{ name: 'Tin nhắn', path: '/dashboard/messages', icon: MessageSquare },
		{ name: 'Tài chính', path: '/dashboard/finance', icon: TrendingUp },
		{ name: 'Bảng tin & Lời nhắn', path: '/dashboard/notifications', icon: Bell },
		{ name: 'Cài đặt', path: '/dashboard/settings', icon: Settings }
	];
</script>

{#if user}
	<div class="relative flex min-h-screen flex-col bg-white font-sans">
		<!-- Top header for mobile -->
		<header
			class="sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between border-b-2 border-black bg-white px-4 md:hidden"
		>
			<div class="flex items-center gap-2">
				<div class="rounded-lg border-2 border-black bg-blue-300 p-1.5 shadow-secondary">
					<Building2 class="h-4 w-4 text-black" />
				</div>
				<span class="text-base font-black tracking-tight text-black">Roomio</span>
			</div>
			<button
				onclick={() => (isMobileMenuOpen = !isMobileMenuOpen)}
				class="rounded-[6px] border-2 border-black bg-white p-2 text-black shadow-secondary transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
			>
				{#if isMobileMenuOpen}
					<X class="h-5 w-5" />
				{:else}
					<Menu class="h-5 w-5" />
				{/if}
			</button>
		</header>

		<!-- Shell Wrapper -->
		<div class="relative flex min-h-0 flex-1">
			<!-- Sidebar (Desktop only) - Brutalist Style -->
			<aside
				class="sticky top-0 hidden h-screen shrink-0 flex-col justify-between border-r-2 border-black bg-white text-black select-none md:flex md:w-64"
			>
				<div class="space-y-6 p-6">
					<!-- Logo -->
					<div class="flex items-center gap-3">
						<div class="rounded-lg border-2 border-black bg-blue-300 p-2 shadow-secondary">
							<Building2 class="h-5 w-5 text-black" />
						</div>
						<span class="text-xl font-black tracking-tight text-black">Roomio</span>
					</div>

					<!-- Navigation Links: Icon placed AFTER text -->
					<nav class="space-y-1.5">
						{#each menuItems as item}
							{@const Icon = item.icon}
							<a
								href={item.path}
								class="flex items-center justify-between rounded-[6px] border-2 px-4 py-2.5 text-sm font-black transition-all {activeRoute ===
								item.path
									? 'border-black bg-blue-300 text-black shadow-secondary'
									: 'border-transparent text-zinc-600 hover:border-black hover:bg-white/50 hover:text-black'}"
							>
								<span>{item.name}</span>
								<Icon class="h-4.5 w-4.5 shrink-0" />
							</a>
						{/each}
					</nav>
				</div>

				<!-- User footer profile -->
				<div class="flex flex-col gap-3 border-t-2 border-black bg-white p-4">
					<div class="flex items-center gap-3 px-2 py-1">
						<div
							class="flex h-9 w-9 items-center justify-center rounded-lg border-2 border-black bg-blue-300 font-black text-black"
						>
							<User class="h-5 w-5" />
						</div>
						<div class="min-w-0">
							<p class="truncate text-sm leading-none font-black text-black">{user.name}</p>
							<p class="mt-1 truncate text-xs font-bold text-zinc-500">Chủ trọ</p>
						</div>
					</div>
					<button
						onclick={handleLogout}
						class="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-[6px] border-2 border-black bg-red-200 py-2 text-xs font-black text-red-800 shadow-secondary transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
					>
						Đăng xuất
						<LogOut class="h-4 w-4 shrink-0" />
					</button>
				</div>
			</aside>

			<!-- Mobile Drawer Navigation - Brutalist Style -->
			{#if isMobileMenuOpen}
				<!-- Overlay -->
				<div
					class="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm md:hidden"
					onclick={() => (isMobileMenuOpen = false)}
					onkeydown={(e) => e.key === 'Escape' && (isMobileMenuOpen = false)}
					role="button"
					tabindex="0"
				></div>

				<!-- Drawer menu -->
				<aside
					class="fixed inset-y-0 left-0 z-50 flex w-64 animate-[slide-in_0.2s_ease-out] flex-col justify-between border-r-2 border-black bg-white text-black shadow-2xl md:hidden"
				>
					<div class="space-y-6 p-6">
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-2">
								<div class="rounded-lg border-2 border-black bg-blue-300 p-1.5">
									<Building2 class="h-5 w-5 text-black" />
								</div>
								<span class="font-black tracking-tight text-black">Roomio</span>
							</div>
							<button
								onclick={() => (isMobileMenuOpen = false)}
								class="rounded-[6px] border-2 border-black bg-white p-1.5 text-black hover:bg-slate-50"
							>
								<X class="h-5 w-5" />
							</button>
						</div>

						<nav class="space-y-1.5">
							{#each menuItems as item}
								{@const Icon = item.icon}
								<a
									href={item.path}
									onclick={() => (isMobileMenuOpen = false)}
									class="flex items-center justify-between rounded-[6px] border-2 px-4 py-2.5 text-sm font-black transition-all {activeRoute ===
									item.path
										? 'border-black bg-blue-300 text-black shadow-secondary'
										: 'border-transparent text-zinc-600 hover:border-black hover:bg-white/50 hover:text-black'}"
								>
									<span>{item.name}</span>
									<Icon class="h-4.5 w-4.5 shrink-0" />
								</a>
							{/each}
						</nav>
					</div>

					<div class="flex flex-col gap-3 border-t-2 border-black bg-white p-4">
						<div class="flex items-center gap-3 px-2">
							<div
								class="flex h-9 w-9 items-center justify-center rounded-lg border-2 border-black bg-blue-300 font-black text-black"
							>
								<User class="h-5 w-5" />
							</div>
							<div class="min-w-0">
								<p class="truncate text-sm leading-none font-black text-black">{user.name}</p>
								<p class="mt-1 truncate text-xs font-bold text-zinc-500">Chủ trọ</p>
							</div>
						</div>
						<button
							onclick={handleLogout}
							class="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-[6px] border-2 border-black bg-red-200 py-2 text-xs font-black text-red-800 shadow-secondary transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
						>
							Đăng xuất
							<LogOut class="h-4 w-4 shrink-0" />
						</button>
					</div>
				</aside>
			{/if}

			<!-- Main Content Area -->
			<main class="relative z-10 min-w-0 flex-1 overflow-y-auto p-4 pb-24 md:p-8 md:pb-8">
				{@render children()}
			</main>

			<!-- Mobile Bottom Navigation -->
			<nav
				class="fixed inset-x-0 bottom-0 z-30 flex h-16 items-center justify-around border-t-2 border-black bg-white px-1 select-none md:hidden"
			>
				<a
					href="/dashboard"
					class="flex h-full flex-1 flex-col items-center justify-center gap-0.5 transition-colors {activeRoute ===
					'/dashboard'
						? 'text-blue-500'
						: 'text-zinc-400'}"
				>
					<LayoutDashboard class="h-5 w-5" />
					<span class="text-[9px] font-black tracking-wider uppercase">Tổng quan</span>
				</a>
				<a
					href="/dashboard/rooms"
					class="flex h-full flex-1 flex-col items-center justify-center gap-0.5 transition-colors {activeRoute ===
					'/dashboard/rooms'
						? 'text-blue-500'
						: 'text-zinc-400'}"
				>
					<Home class="h-5 w-5" />
					<span class="text-[9px] font-black tracking-wider uppercase">Phòng</span>
				</a>
				<a
					href="/dashboard/invoices"
					class="flex h-full flex-1 flex-col items-center justify-center gap-0.5 transition-colors {activeRoute ===
					'/dashboard/invoices'
						? 'text-blue-500'
						: 'text-zinc-400'}"
				>
					<Receipt class="h-5 w-5" />
					<span class="text-[9px] font-black tracking-wider uppercase">Hóa đơn</span>
				</a>
				<a
					href="/dashboard/tenants"
					class="flex h-full flex-1 flex-col items-center justify-center gap-0.5 transition-colors {activeRoute ===
					'/dashboard/tenants'
						? 'text-blue-500'
						: 'text-zinc-400'}"
				>
					<Users class="h-5 w-5" />
					<span class="text-[9px] font-black tracking-wider uppercase">Khách</span>
				</a>
				<a
					href="/dashboard/requests"
					class="flex h-full flex-1 flex-col items-center justify-center gap-0.5 transition-colors {activeRoute ===
					'/dashboard/requests'
						? 'text-blue-500'
						: 'text-zinc-400'}"
				>
					<Wrench class="h-5 w-5" />
					<span class="text-[9px] font-black tracking-wider uppercase">Sự cố</span>
				</a>
			</nav>
		</div>
	</div>
{/if}

<style>
	@keyframes slide-in {
		from {
			transform: translateX(-100%);
		}
		to {
			transform: translateX(0);
		}
	}
</style>
