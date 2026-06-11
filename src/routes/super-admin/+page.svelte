<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { toast } from 'svelte-sonner';
  import { 
    ShieldCheck, 
    X, 
    Check, 
    Users, 
    Lock, 
    Unlock, 
    Calendar,
    Search,
    Loader2,
    LogOut,
    Sliders,
    Building2,
    DollarSign,
    Award
  } from '@lucide/svelte';

  interface Landlord {
    id: string;
    userId: string;
    subscriptionType: string; // FREE, PREMIUM, ENTERPRISE
    subValidUntil: string | null;
    companyName: string | null;
    user: {
      id: string;
      name: string;
      email: string;
      phone: string;
      isActive: boolean;
    };
    properties: {
      id: string;
      name: string;
      _count: {
        rooms: number;
      };
    }[];
  }

  let adminName = $state('');
  let isLoading = $state(true);
  let landlords = $state<Landlord[]>([]);
  let selectedLandlord = $state<Landlord | null>(null);
  
  // Modals & form state
  let isEditOpen = $state(false);
  let subType = $state('FREE');
  let subValid = $state('');
  let isSaving = $state(false);

  // Search filter
  let searchQuery = $state('');

  onMount(() => {
    const sessionStr = localStorage.getItem('roomio_user');
    if (!sessionStr) {
      goto('/login');
      return;
    }
    const session = JSON.parse(sessionStr);
    if (session.role !== 'SUPER_ADMIN') {
      toast.error('Bạn không có quyền truy cập trang Quản Trị Hệ Thống');
      goto('/login');
      return;
    }
    adminName = session.name;
    fetchLandlords();
  });

  async function fetchLandlords() {
    isLoading = true;
    try {
      const res = await fetch('/api/super-admin');
      const data = await res.json();
      if (res.ok) landlords = data;
    } catch (e: any) {
      toast.error('Lỗi khi tải danh sách chủ trọ: ' + e.message);
    } finally {
      isLoading = false;
    }
  }

  async function handleToggleStatus(userId: string, currentActive: boolean) {
    const actionLabel = currentActive ? 'Khóa' : 'Mở khóa';
    if (!confirm(`Bạn có chắc muốn ${actionLabel.toLowerCase()} tài khoản chủ trọ này?`)) return;

    try {
      const res = await fetch('/api/super-admin', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, isActive: !currentActive })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Lỗi khi cập nhật trạng thái');

      toast.success(`Đã ${actionLabel.toLowerCase()} tài khoản chủ trọ`);
      fetchLandlords();
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  async function handleUpdateSubscription(e: SubmitEvent) {
    e.preventDefault();
    if (!selectedLandlord || isSaving) return;

    isSaving = true;
    try {
      const res = await fetch('/api/super-admin', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          landlordId: selectedLandlord.id,
          subscriptionType: subType,
          subValidUntil: subValid || null
        })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Lỗi khi cập nhật gói dịch vụ');

      toast.success(`Đã cập nhật gói dịch vụ cho chủ trọ ${selectedLandlord.user.name}`);
      isEditOpen = false;
      selectedLandlord = null;
      fetchLandlords();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      isSaving = false;
    }
  }

  function handleLogout() {
    fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'logout' })
    }).catch(() => {});
    localStorage.removeItem('roomio_user');
    toast.success('Đã đăng xuất tài khoản quản trị');
    goto('/login');
  }

  const filteredLandlords = $derived(() => {
    if (!searchQuery.trim()) return landlords;
    const query = searchQuery.toLowerCase();
    return landlords.filter(l => 
      l.user.name.toLowerCase().includes(query) ||
      (l.companyName && l.companyName.toLowerCase().includes(query)) ||
      l.user.email.toLowerCase().includes(query) ||
      l.user.phone.includes(query)
    );
  });
</script>

<div class="min-h-screen bg-slate-50 font-sans">
  <!-- Top bar -->
  <header class="bg-slate-900 text-white h-16 px-6 flex items-center justify-between shadow-md">
    <div class="flex items-center gap-3">
      <div class="bg-indigo-600 p-2 rounded-xl">
        <ShieldCheck class="h-5 w-5 text-white" />
      </div>
      <span class="text-xl font-bold tracking-tight">Roomio SuperAdmin</span>
    </div>
    
    <div class="flex items-center gap-4">
      <span class="text-slate-300 text-sm font-semibold">Chào Admin, {adminName}</span>
      <button 
        onclick={handleLogout}
        class="flex items-center gap-1.5 text-red-400 hover:text-red-300 text-sm font-semibold cursor-pointer"
      >
        <LogOut class="h-4.5 w-4.5" />
        Đăng xuất
      </button>
    </div>
  </header>

  <!-- Main panel wrapper -->
  <main class="max-w-7xl mx-auto p-6 space-y-6">
    <!-- Quick stats grid -->
    <div class="grid gap-4 sm:grid-cols-3">
      <div class="bg-white border p-5 rounded-2xl shadow-sm flex items-center gap-4">
        <div class="p-3 bg-indigo-50 rounded-xl text-indigo-600">
          <Users class="h-6 w-6" />
        </div>
        <div>
          <p class="text-slate-400 text-xs font-bold uppercase tracking-wider">Tổng chủ trọ vận hành</p>
          <h3 class="text-2xl font-extrabold text-slate-800 mt-1">{landlords.length} chủ trọ</h3>
        </div>
      </div>
      <div class="bg-white border p-5 rounded-2xl shadow-sm flex items-center gap-4">
        <div class="p-3 bg-emerald-50 rounded-xl text-emerald-600">
          <Award class="h-6 w-6" />
        </div>
        <div>
          <p class="text-slate-400 text-xs font-bold uppercase tracking-wider">Đối tác Premium</p>
          <h3 class="text-2xl font-extrabold text-slate-800 mt-1">
            {landlords.filter(l => l.subscriptionType !== 'FREE').length} đối tác
          </h3>
        </div>
      </div>
      <div class="bg-white border p-5 rounded-2xl shadow-sm flex items-center gap-4">
        <div class="p-3 bg-amber-50 rounded-xl text-amber-600">
          <Building2 class="h-6 w-6" />
        </div>
        <div>
          <p class="text-slate-400 text-xs font-bold uppercase tracking-wider">Tổng số phòng quản lý</p>
          <h3 class="text-2xl font-extrabold text-slate-800 mt-1">
            {landlords.reduce((sum, l) => sum + l.properties.reduce((s, p) => s + p._count.rooms, 0), 0)} phòng
          </h3>
        </div>
      </div>
    </div>

    <!-- Search and controls -->
    <div class="bg-white border p-4 rounded-2xl shadow-sm flex items-center gap-3">
      <Search class="h-5 w-5 text-slate-400 shrink-0" />
      <input 
        type="text" 
        bind:value={searchQuery}
        placeholder="Tìm kiếm chủ trọ theo tên, công ty, email hoặc số điện thoại..."
        class="w-full text-sm outline-none bg-transparent text-slate-700"
      />
    </div>

    {#if isLoading}
      <div class="h-[40vh] w-full flex items-center justify-center">
        <Loader2 class="h-10 w-10 text-indigo-600 animate-spin" />
      </div>
    {:else if filteredLandlords().length === 0}
      <div class="bg-white border p-12 rounded-2xl text-center shadow-sm">
        <p class="text-slate-400 text-sm">Không tìm thấy chủ trọ nào khớp với từ khóa tìm kiếm.</p>
      </div>
    {:else}
      <!-- Landlords registry list -->
      <div class="bg-white border rounded-2xl shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-sm">
            <thead>
              <tr class="bg-slate-50 border-b text-slate-500 font-bold uppercase text-xs">
                <th class="px-6 py-4">Họ và tên</th>
                <th class="px-6 py-4">Thương hiệu</th>
                <th class="px-6 py-4">Tài khoản liên hệ</th>
                <th class="px-6 py-4">Tòa nhà (Phòng)</th>
                <th class="px-6 py-4">Gói dịch vụ</th>
                <th class="px-6 py-4">Thời hạn gói</th>
                <th class="px-6 py-4">Trạng thái</th>
                <th class="px-6 py-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {#each filteredLandlords() as landlord}
                {@const totalRooms = landlord.properties.reduce((sum, p) => sum + p._count.rooms, 0)}
                <tr class="border-b hover:bg-slate-50/50 transition-colors text-slate-600">
                  <td class="px-6 py-4 font-bold text-slate-800">{landlord.user.name}</td>
                  <td class="px-6 py-4 font-medium">{landlord.companyName || '--'}</td>
                  <td class="px-6 py-4">
                    <p class="font-medium text-slate-700">{landlord.user.phone}</p>
                    <p class="text-xs text-slate-400">{landlord.user.email}</p>
                  </td>
                  <td class="px-6 py-4">
                    <span class="font-bold text-slate-700">{landlord.properties.length}</span> tòa nhà 
                    <span class="text-xs text-slate-400 font-medium block">({totalRooms} phòng trọ)</span>
                  </td>
                  <td class="px-6 py-4">
                    <span class="text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase {landlord.subscriptionType === 'FREE' ? 'bg-slate-100 text-slate-600' : landlord.subscriptionType === 'PREMIUM' ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-700'}">
                      {landlord.subscriptionType}
                    </span>
                  </td>
                  <td class="px-6 py-4 font-semibold text-slate-700">
                    {landlord.subValidUntil ? new Date(landlord.subValidUntil).toLocaleDateString('vi-VN') : 'Vĩnh viễn'}
                  </td>
                  <td class="px-6 py-4">
                    <span class="text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase {landlord.user.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}">
                      {landlord.user.isActive ? 'Hoạt động' : 'Đã khóa'}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-right flex items-center justify-end gap-2">
                    <button
                      onclick={() => handleToggleStatus(landlord.userId, landlord.user.isActive)}
                      class="p-1.5 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-600 transition-colors cursor-pointer"
                      title={landlord.user.isActive ? 'Khóa tài khoản' : 'Mở khóa'}
                    >
                      {#if landlord.user.isActive}
                        <Lock class="h-4 w-4 text-red-500" />
                      {:else}
                        <Unlock class="h-4 w-4 text-emerald-500" />
                      {/if}
                    </button>
                    <button
                      onclick={() => { 
                        selectedLandlord = landlord; 
                        subType = landlord.subscriptionType; 
                        subValid = landlord.subValidUntil ? landlord.subValidUntil.split('T')[0] : '';
                        isEditOpen = true; 
                      }}
                      class="p-1.5 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-600 transition-colors cursor-pointer"
                      title="Nâng cấp gói"
                    >
                      <Sliders class="h-4 w-4 text-indigo-500" />
                    </button>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    {/if}
  </main>

  <!-- Edit subscription level dialog -->
  {#if isEditOpen && selectedLandlord}
    <div 
      class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onclick={() => isEditOpen = false}
      onkeydown={(e) => e.key === 'Escape' && (isEditOpen = false)}
      role="button"
      tabindex="0"
    >
      <div 
        class="bg-white rounded-2xl w-full max-w-md border border-slate-200 shadow-2xl p-6 relative flex flex-col gap-4 animate-[scale-up_0.2s_ease-out]"
        onclick={(e) => e.stopPropagation()}
        onkeydown={(e) => e.stopPropagation()}
        role="dialog"
      >
        <div class="flex justify-between items-center border-b pb-3">
          <h2 class="font-bold text-slate-800 text-lg">Cấp gói dịch vụ Roomio</h2>
          <button onclick={() => isEditOpen = false} class="text-slate-400 hover:bg-slate-100 p-1.5 rounded-lg">
            <X class="h-5 w-5" />
          </button>
        </div>

        <form onsubmit={handleUpdateSubscription} class="space-y-4">
          <div class="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-500">
            <p class="font-bold text-slate-700">Khách hàng: {selectedLandlord.user.name}</p>
            <p class="mt-1">Thương hiệu: {selectedLandlord.companyName || '--'}</p>
          </div>

          <div class="space-y-1">
            <label for="sub-level" class="text-xs font-bold text-slate-500 uppercase tracking-wider block">Chọn gói đăng ký</label>
            <select 
              id="sub-level"
              bind:value={subType}
              required
              class="w-full border border-slate-200 px-3 py-2 text-sm rounded-xl focus:outline-none bg-slate-50 font-medium text-slate-700"
            >
              <option value="FREE">Gói miễn phí (FREE)</option>
              <option value="PREMIUM">Gói nâng cao (PREMIUM)</option>
              <option value="ENTERPRISE">Gói doanh nghiệp (ENTERPRISE)</option>
            </select>
          </div>

          <div class="space-y-1">
            <label for="sub-valid" class="text-xs font-bold text-slate-500 uppercase tracking-wider block">Hạn gói dịch vụ</label>
            <input 
              id="sub-valid"
              type="date" 
              bind:value={subValid}
              class="w-full border border-slate-200 px-3 py-2.5 text-sm rounded-xl focus:outline-none bg-slate-50 text-slate-700"
            />
            <span class="text-[10px] text-slate-400 block mt-1">Để trống nếu muốn đặt hạn vĩnh viễn cho gói FREE.</span>
          </div>

          <div class="flex justify-end gap-3 pt-3 border-t">
            <button 
              type="button" 
              onclick={() => isEditOpen = false}
              class="border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Hủy
            </button>
            <button 
              type="submit"
              disabled={isSaving}
              class="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/50 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-indigo-600/10 transition-all flex items-center gap-1 cursor-pointer"
            >
              {#if isSaving}
                <Loader2 class="h-4.5 w-4.5 animate-spin" />
              {/if}
              Xác nhận gia hạn
            </button>
          </div>
        </form>
      </div>
    </div>
  {/if}
</div>

<style>
  @keyframes scale-up {
    from { transform: scale(0.95); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }
</style>
