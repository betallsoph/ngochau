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
    User
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

  function handleLogout() {
    localStorage.removeItem('roomio_user');
    toast.success('Đã đăng xuất thành công');
    goto('/login');
  }

  const menuItems = [
    { name: 'Tổng quan', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Tòa nhà', path: '/dashboard/buildings', icon: Building2 },
    { name: 'Phòng trọ', path: '/dashboard/rooms', icon: Home },
    { name: 'Hóa đơn', path: '/dashboard/invoices', icon: Receipt },
    { name: 'Khách thuê', path: '/dashboard/tenants', icon: Users },
    { name: 'Sự cố', path: '/dashboard/requests', icon: Wrench },
    { name: 'Bảng tin & Lời nhắn', path: '/dashboard/notifications', icon: Bell },
    { name: 'Cài đặt', path: '/dashboard/settings', icon: Settings }
  ];
</script>

{#if user}
<div class="min-h-screen bg-slate-50 flex flex-col font-sans relative">
  <!-- Interactive Grid Background Overlay -->
  <div class="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(circle_at_1px_1px,black_1px,transparent_0)] bg-[size:16px_16px]"></div>

  <!-- Top header for mobile -->
  <header class="bg-white border-b-2 border-black h-14 px-4 flex items-center justify-between sticky top-0 z-40 md:hidden shrink-0">
    <div class="flex items-center gap-2">
      <div class="bg-blue-300 border-2 border-black p-1.5 rounded-lg shadow-secondary">
        <Building2 class="h-4 w-4 text-black" />
      </div>
      <span class="font-black text-base text-black tracking-tight">Roomio</span>
    </div>
    <button 
      onclick={() => isMobileMenuOpen = !isMobileMenuOpen}
      class="p-2 bg-white border-2 border-black rounded-[6px] shadow-secondary text-black hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
    >
      {#if isMobileMenuOpen}
        <X class="h-5 w-5" />
      {:else}
        <Menu class="h-5 w-5" />
      {/if}
    </button>
  </header>

  <!-- Shell Wrapper -->
  <div class="flex flex-1 relative min-h-0">
    
    <!-- Sidebar (Desktop only) - Brutalist Style -->
    <aside class="hidden md:flex md:w-64 bg-blue-100 text-black flex-col justify-between border-r-2 border-black sticky top-0 h-screen select-none shrink-0">
      <div class="p-6 space-y-6">
        <!-- Logo -->
        <div class="flex items-center gap-3">
          <div class="bg-blue-300 border-2 border-black p-2 rounded-lg shadow-secondary">
            <Building2 class="h-5 w-5 text-black" />
          </div>
          <span class="text-xl font-black text-black tracking-tight">Roomio</span>
        </div>

        <!-- Navigation Links: Icon placed AFTER text -->
        <nav class="space-y-1.5">
          {#each menuItems as item}
            {@const Icon = item.icon}
            <a
              href={item.path}
              class="flex items-center justify-between px-4 py-2.5 rounded-[6px] text-sm font-black border-2 transition-all {activeRoute === item.path ? 'bg-blue-300 text-black border-black shadow-secondary' : 'text-zinc-600 border-transparent hover:bg-white/50 hover:text-black hover:border-black'}"
            >
              <span>{item.name}</span>
              <Icon class="h-4.5 w-4.5 shrink-0" />
            </a>
          {/each}
        </nav>
      </div>

      <!-- User footer profile -->
      <div class="p-4 border-t-2 border-black bg-white flex flex-col gap-3">
        <div class="flex items-center gap-3 px-2 py-1">
          <div class="h-9 w-9 bg-blue-300 border-2 border-black text-black rounded-lg flex items-center justify-center font-black">
            <User class="h-5 w-5" />
          </div>
          <div class="min-w-0">
            <p class="text-sm font-black text-black truncate leading-none">{user.name}</p>
            <p class="text-xs text-zinc-500 font-bold truncate mt-1">Chủ trọ</p>
          </div>
        </div>
        <button
          onclick={handleLogout}
          class="flex items-center justify-center gap-1.5 w-full bg-red-200 border-2 border-black hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all py-2 rounded-[6px] shadow-secondary text-xs font-black text-red-800 cursor-pointer"
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
        class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden"
        onclick={() => isMobileMenuOpen = false}
        onkeydown={(e) => e.key === 'Escape' && (isMobileMenuOpen = false)}
        role="button"
        tabindex="0"
      ></div>
      
      <!-- Drawer menu -->
      <aside class="fixed inset-y-0 left-0 w-64 bg-blue-100 text-black flex flex-col justify-between z-50 md:hidden border-r-2 border-black shadow-2xl animate-[slide-in_0.2s_ease-out]">
        <div class="p-6 space-y-6">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div class="bg-blue-300 border-2 border-black p-1.5 rounded-lg">
                <Building2 class="h-5 w-5 text-black" />
              </div>
              <span class="font-black text-black tracking-tight">Roomio</span>
            </div>
            <button 
              onclick={() => isMobileMenuOpen = false}
              class="p-1.5 text-black border-2 border-black rounded-[6px] bg-white hover:bg-slate-50"
            >
              <X class="h-5 w-5" />
            </button>
          </div>

          <nav class="space-y-1.5">
            {#each menuItems as item}
              {@const Icon = item.icon}
              <a
                href={item.path}
                onclick={() => isMobileMenuOpen = false}
                class="flex items-center justify-between px-4 py-2.5 rounded-[6px] text-sm font-black border-2 transition-all {activeRoute === item.path ? 'bg-blue-300 text-black border-black shadow-secondary' : 'text-zinc-600 border-transparent hover:bg-white/50 hover:text-black hover:border-black'}"
              >
                <span>{item.name}</span>
                <Icon class="h-4.5 w-4.5 shrink-0" />
              </a>
            {/each}
          </nav>
        </div>

        <div class="p-4 border-t-2 border-black bg-white flex flex-col gap-3">
          <div class="flex items-center gap-3 px-2">
            <div class="h-9 w-9 bg-blue-300 border-2 border-black text-black rounded-lg flex items-center justify-center font-black">
              <User class="h-5 w-5" />
            </div>
            <div class="min-w-0">
              <p class="text-sm font-black text-black truncate leading-none">{user.name}</p>
              <p class="text-xs text-zinc-500 font-bold truncate mt-1">Chủ trọ</p>
            </div>
          </div>
          <button
            onclick={handleLogout}
            class="flex items-center justify-center gap-1.5 w-full bg-red-200 border-2 border-black hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all py-2 rounded-[6px] shadow-secondary text-xs font-black text-red-800 cursor-pointer"
          >
            Đăng xuất
            <LogOut class="h-4 w-4 shrink-0" />
          </button>
        </div>
      </aside>
    {/if}

    <!-- Main Content Area -->
    <main class="flex-1 min-w-0 p-4 md:p-8 pb-24 md:pb-8 overflow-y-auto relative z-10">
      {@render children()}
    </main>

    <!-- Mobile Bottom Navigation -->
    <nav class="md:hidden fixed bottom-0 inset-x-0 bg-white border-t-2 border-black h-16 flex items-center justify-around z-30 px-1 select-none">
      <a 
        href="/dashboard"
        class="flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors {activeRoute === '/dashboard' ? 'text-blue-500' : 'text-zinc-400'}"
      >
        <LayoutDashboard class="h-5 w-5" />
        <span class="text-[9px] font-black uppercase tracking-wider">Tổng quan</span>
      </a>
      <a 
        href="/dashboard/rooms"
        class="flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors {activeRoute === '/dashboard/rooms' ? 'text-blue-500' : 'text-zinc-400'}"
      >
        <Home class="h-5 w-5" />
        <span class="text-[9px] font-black uppercase tracking-wider">Phòng</span>
      </a>
      <a 
        href="/dashboard/invoices"
        class="flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors {activeRoute === '/dashboard/invoices' ? 'text-blue-500' : 'text-zinc-400'}"
      >
        <Receipt class="h-5 w-5" />
        <span class="text-[9px] font-black uppercase tracking-wider">Hóa đơn</span>
      </a>
      <a 
        href="/dashboard/tenants"
        class="flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors {activeRoute === '/dashboard/tenants' ? 'text-blue-500' : 'text-zinc-400'}"
      >
        <Users class="h-5 w-5" />
        <span class="text-[9px] font-black uppercase tracking-wider">Khách</span>
      </a>
      <a 
        href="/dashboard/requests"
        class="flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors {activeRoute === '/dashboard/requests' ? 'text-blue-500' : 'text-zinc-400'}"
      >
        <Wrench class="h-5 w-5" />
        <span class="text-[9px] font-black uppercase tracking-wider">Sự cố</span>
      </a>
    </nav>

  </div>
</div>
{/if}

<style>
  @keyframes slide-in {
    from { transform: translateX(-100%); }
    to { transform: translateX(0); }
  }
</style>
