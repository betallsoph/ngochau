<script lang="ts">
  import { onMount } from 'svelte';
  import { toast } from 'svelte-sonner';
  import { 
    Users, 
    Plus, 
    X, 
    User, 
    Phone, 
    Mail, 
    Calendar, 
    DollarSign,
    Loader2,
    Home,
    FileText,
    LogOut
  } from '@lucide/svelte';

  interface Room {
    id: string;
    roomNumber: string;
    property: {
      name: string;
      shortName: string;
    };
  }

  interface Tenant {
    id: string;
    idNumber: string;
    moveInDate: string;
    deposit: number;
    notes: string | null;
    user: {
      id: string;
      name: string;
      email: string;
      phone: string;
    };
    rooms: Room[];
  }

  let landlordId = $state<string | null>(null);
  let isLoading = $state(true);
  let tenants = $state<Tenant[]>([]);
  let emptyRooms = $state<Room[]>([]);
  let selectedTenant = $state<Tenant | null>(null);

  // Modals & drawers
  let isAddDialogOpen = $state(false);
  let isDetailDrawerOpen = $state(false);
  let isSubmitting = $state(false);

  // Form states
  let email = $state('');
  let phone = $state('');
  let name = $state('');
  let password = $state('123456'); // Default simple password
  let roomId = $state('');
  let idNumber = $state('');
  let moveInDate = $state(new Date().toISOString().split('T')[0]);
  let deposit = $state('');
  let notes = $state('');
  let initialElectricity = $state('0');
  let initialWater = $state('0');

  onMount(() => {
    const sessionStr = localStorage.getItem('roomio_user');
    if (!sessionStr) return;
    const session = JSON.parse(sessionStr);
    landlordId = session.landlordProfileId;
    fetchTenants(session.landlordProfileId);
    fetchEmptyRooms(session.landlordProfileId);
  });

  async function fetchTenants(profileId: string) {
    isLoading = true;
    try {
      const res = await fetch(`/api/tenants?landlordId=${profileId}`);
      const data = await res.json();
      if (res.ok) tenants = data;
    } catch (e: any) {
      toast.error('Lỗi khi tải danh sách khách: ' + e.message);
    } finally {
      isLoading = false;
    }
  }

  async function fetchEmptyRooms(profileId: string) {
    try {
      const propRes = await fetch(`/api/properties?landlordId=${profileId}`);
      const propData = await propRes.json();
      
      if (propRes.ok) {
        const roomsList: Room[] = [];
        for (const prop of propData) {
          const roomRes = await fetch(`/api/rooms?propertyId=${prop.id}`);
          const roomData = await roomRes.json();
          if (roomRes.ok) {
            roomData.filter((r: any) => r.status === 'empty').forEach((r: any) => {
              roomsList.push({
                id: r.id,
                roomNumber: r.roomNumber,
                property: {
                  name: prop.name,
                  shortName: prop.shortName
                }
              });
            });
          }
        }
        emptyRooms = roomsList;
        if (emptyRooms.length > 0) {
          roomId = emptyRooms[0].id;
        }
      }
    } catch (e) {
      // Ignore
    }
  }

  async function handleAddTenant(e: SubmitEvent) {
    e.preventDefault();
    if (!landlordId || isSubmitting) return;

    if (!email || !phone || !name || !roomId || !idNumber || !moveInDate || deposit === '') {
      toast.error('Vui lòng nhập đầy đủ các trường thông tin bắt buộc');
      return;
    }

    isSubmitting = true;
    try {
      const res = await fetch('/api/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          phone,
          password,
          name,
          roomId,
          idNumber,
          moveInDate,
          deposit: Number(deposit),
          notes,
          initialElectricity: Number(initialElectricity),
          initialWater: Number(initialWater)
        })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Lỗi thêm khách thuê');

      toast.success(`Đã đăng ký và bàn giao phòng cho khách ${name}`);
      isAddDialogOpen = false;
      
      // Clear forms
      email = '';
      phone = '';
      name = '';
      password = '123456';
      idNumber = '';
      deposit = '';
      notes = '';
      initialElectricity = '0';
      initialWater = '0';

      // Refresh
      fetchTenants(landlordId);
      fetchEmptyRooms(landlordId);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      isSubmitting = false;
    }
  }

  async function handleCheckout(rId: string) {
    if (!confirm('Bạn có chắc chắn muốn trả phòng cho khách này?')) return;

    try {
      const res = await fetch('/api/rooms', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: rId, action: 'checkout' })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Lỗi khi trả phòng');

      toast.success('Đã trả phòng thành công');
      isDetailDrawerOpen = false;
      selectedTenant = null;
      if (landlordId) {
        fetchTenants(landlordId);
        fetchEmptyRooms(landlordId);
      }
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
  }
</script>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
    <div>
      <h1 class="text-xl sm:text-2xl font-black text-black">Quản Lý Khách Thuê</h1>
      <p class="text-zinc-600 text-xs sm:text-sm mt-1 font-bold">Hồ sơ khách hàng, tiền đặt cọ và lịch bàn giao phòng</p>
    </div>
    <button 
      onclick={() => isAddDialogOpen = true}
      class="bg-blue-300 text-black border-2 border-black px-4 py-2.5 rounded-[6px] shadow-secondary hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center gap-1.5 cursor-pointer font-black text-sm w-full sm:w-auto justify-center sm:justify-start"
    >
      Thêm khách thuê <Plus class="h-4 w-4" />
    </button>
  </div>

  <!-- Quick stats -->
  <!-- Mobile: 1-line inline strip -->
  <div class="sm:hidden flex items-center border-2 border-black rounded-lg overflow-hidden divide-x-2 divide-black text-center">
    <div class="flex-1 py-3 px-2">
      <p class="text-[9px] font-bold uppercase text-zinc-400 tracking-wider">Khách thuê</p>
      <p class="text-xs font-black text-black mt-0.5">{tenants.length} người</p>
    </div>
    <div class="flex-1 py-3 px-2">
      <p class="text-[9px] font-bold uppercase text-zinc-400 tracking-wider">Tiền cọc giữ</p>
      <p class="text-xs font-black text-black mt-0.5 truncate">{formatCurrency(tenants.reduce((sum, t) => sum + t.deposit, 0))}</p>
    </div>
  </div>
  <!-- Desktop: stat cards -->
  <div class="hidden sm:grid sm:grid-cols-2 gap-3">
    <div class="bg-white border-2 border-black p-4 rounded-lg shadow-secondary">
      <Users class="h-5 w-5 text-blue-500 mb-2" />
      <p class="text-zinc-500 text-[10px] font-bold uppercase tracking-wider">Khách thuê</p>
      <h3 class="text-base sm:text-xl font-black text-black mt-0.5">{tenants.length} người</h3>
    </div>
    <div class="bg-white border-2 border-black p-4 rounded-lg shadow-secondary">
      <DollarSign class="h-5 w-5 text-blue-500 mb-2" />
      <p class="text-zinc-500 text-[10px] font-bold uppercase tracking-wider">Tiền cọc giữ</p>
      <h3 class="text-base sm:text-xl font-black text-black mt-0.5 truncate">
        {formatCurrency(tenants.reduce((sum, t) => sum + t.deposit, 0))}
      </h3>
    </div>
  </div>


  {#if isLoading}
    <div class="h-[40vh] w-full flex items-center justify-center">
      <Loader2 class="h-10 w-10 text-black animate-spin" />
    </div>
  {:else if tenants.length === 0}
    <div class="bg-white border-2 border-black p-12 rounded-lg text-center max-w-md mx-auto shadow-secondary">
              <Users class="h-7 w-7" />
      <h3 class="font-black text-black text-lg">Chưa có khách thuê nào</h3>
      <p class="text-zinc-600 text-sm mt-2 font-semibold">Đăng ký khách thuê trực tiếp vào phòng trọ để bắt đầu quản lý hợp đồng.</p>
    </div>
  {:else}
    <!-- Tenants List -->
    <div class="bg-white border-2 border-black rounded-lg shadow-secondary overflow-hidden">
      <!-- Mobile card list -->
      <div class="sm:hidden divide-y-2 divide-black bg-white">
        {#each tenants as tenant}
          {@const activeRoom = tenant.rooms[0]}
          <div class="p-4 space-y-2">
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0">
                <p class="font-black text-black text-sm">{tenant.user.name}</p>
                <p class="text-xs text-zinc-500 font-bold mt-0.5">{tenant.user.phone}</p>
              </div>
              {#if activeRoom}
                <span class="text-xs font-black text-blue-600 shrink-0">
                  {activeRoom.property.shortName} - P.{activeRoom.roomNumber}
                </span>
              {:else}
                <span class="text-xs font-black text-red-500 shrink-0">Chưa có phòng</span>
              {/if}
            </div>
            <div class="flex items-center justify-between">
              <span class="text-xs text-zinc-500 font-bold">
                Cọ: {formatCurrency(tenant.deposit)}
              </span>
              <button
                onclick={() => { selectedTenant = tenant; isDetailDrawerOpen = true; }}
                class="px-3 py-1.5 border-2 border-black bg-white text-black rounded-[6px] text-xs font-bold shadow-secondary hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all cursor-pointer"
              >
                Hồ sơ
              </button>
            </div>
          </div>
        {/each}
      </div>
      <!-- Desktop table -->
      <div class="hidden sm:block overflow-x-auto bg-white">
        <table class="w-full text-left border-collapse text-sm">
          <thead>
            <tr class="bg-blue-300 border-b-2 border-black text-black font-black uppercase text-xs">
              <th class="px-4 py-3">Tên khách thuê</th>
              <th class="px-4 py-3">Số điện thoại</th>
              <th class="px-4 py-3">Đang ở phòng</th>
              <th class="px-4 py-3">Ngày nhận phòng</th>
              <th class="px-4 py-3">Tiền đặt cọ</th>
              <th class="px-4 py-3">Số CCCD</th>
              <th class="px-4 py-3 text-right">Hồ sơ</th>
            </tr>
          </thead>
          <tbody>
            {#each tenants as tenant}
              {@const activeRoom = tenant.rooms[0]}
              <tr class="border-b border-black/15 hover:bg-slate-50 transition-all font-semibold text-black">
                <td class="px-4 py-4 font-black">{tenant.user.name}</td>
                <td class="px-4 py-4">{tenant.user.phone}</td>
                <td class="px-4 py-4">
                  {#if activeRoom}
                    <span class="font-black text-blue-600">
                      {activeRoom.property.shortName} - Phòng {activeRoom.roomNumber}
                    </span>
                  {:else}
                    <span class="text-red-500 font-black">Chưa nhận phòng</span>
                  {/if}
                </td>
                <td class="px-4 py-4">{new Date(tenant.moveInDate).toLocaleDateString('vi-VN')}</td>
                <td class="px-4 py-4 font-black">{formatCurrency(tenant.deposit)}</td>
                <td class="px-4 py-4 font-mono">{tenant.idNumber}</td>
                <td class="px-4 py-4 text-right">
                  <button
                    onclick={() => { selectedTenant = tenant; isDetailDrawerOpen = true; }}
                    class="px-3 py-1.5 border-2 border-black bg-white hover:bg-zinc-150 text-black rounded-[6px] text-xs font-bold transition-all shadow-secondary hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none cursor-pointer"
                  >
                    Hồ sơ
                  </button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  {/if}


  <!-- Add Tenant Dialog -->
  {#if isAddDialogOpen}
    <!-- Overlay -->
    <div 
      class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onclick={() => isAddDialogOpen = false}
      onkeydown={(e) => e.key === 'Escape' && (isAddDialogOpen = false)}
      role="button"
      tabindex="0"
    >
      <!-- Dialog Content: Brutallist macOS Window style -->
      <div 
        class="bg-white rounded-lg w-full max-w-xl border-2 border-black shadow-primary overflow-hidden relative flex flex-col max-h-[90vh] animate-[scale-up_0.2s_ease-out]"
        onclick={(e) => e.stopPropagation()}
        onkeydown={(e) => e.stopPropagation()}
        role="dialog"
      >
        <!-- Windows Header style -->
        <div class="flex items-center gap-2 px-4 py-3 bg-zinc-50 border-b-2 border-black shrink-0 select-none">
          <div class="w-2.5 h-2.5 rounded-full bg-red-500 border border-black"></div>
          <div class="w-2.5 h-2.5 rounded-full bg-yellow-500 border border-black"></div>
          <div class="w-2.5 h-2.5 rounded-full bg-green-500 border border-black"></div>
          <span class="text-xs font-bold text-zinc-500 ml-2 font-black">Đăng ký & Bàn giao phòng</span>
          <button 
            onclick={() => isAddDialogOpen = false} 
            class="ml-auto text-black hover:bg-zinc-200 p-1 border border-transparent rounded-[6px] cursor-pointer"
          >
            <X class="h-4.5 w-4.5" />
          </button>
        </div>

        {#if emptyRooms.length === 0}
          <div class="p-8 text-center space-y-3">
            <p class="text-zinc-650 font-bold">Tòa nhà của bạn không có phòng nào trống!</p>
            <p class="text-zinc-500 text-xs font-semibold">Vui lòng tạo phòng trọ trống trước hoặc trả phòng phòng hiện tại.</p>
            <button 
              onclick={() => isAddDialogOpen = false}
              class="border-2 border-black bg-white px-4 py-2 rounded-[6px] text-xs font-bold shadow-secondary hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all cursor-pointer"
            >
              Quay lại
            </button>
          </div>
        {:else}
          <form onsubmit={handleAddTenant} class="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
            <!-- Account Info section -->
            <div class="space-y-3">
              <h3 class="text-xs font-black text-zinc-500 uppercase tracking-wider border-b border-black/15 pb-1.5">1. Thông tin đăng nhập tài khoản</h3>
              <div class="grid grid-cols-2 gap-3">
                <div class="space-y-1">
                  <label for="t-name" class="text-[10px] text-zinc-600 font-bold uppercase tracking-wider block">Họ và tên khách</label>
                  <input 
                    id="t-name"
                    type="text" 
                    bind:value={name}
                    required
                    placeholder="Nguyễn Văn A" 
                    class="w-full border-2 border-black px-2.5 py-1.5 text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white font-semibold text-black"
                  />
                </div>
                <div class="space-y-1">
                  <label for="t-phone" class="text-[10px] text-zinc-600 font-bold uppercase tracking-wider block">Số điện thoại</label>
                  <input 
                    id="t-phone"
                    type="tel" 
                    bind:value={phone}
                    required
                    placeholder="SĐT đăng nhập" 
                    class="w-full border-2 border-black px-2.5 py-1.5 text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white font-semibold text-black"
                  />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div class="space-y-1">
                  <label for="t-email" class="text-[10px] text-zinc-600 font-bold uppercase tracking-wider block">Email liên hệ</label>
                  <input 
                    id="t-email"
                    type="email" 
                    bind:value={email}
                    required
                    placeholder="email@gmail.com" 
                    class="w-full border-2 border-black px-2.5 py-1.5 text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white font-semibold text-black"
                  />
                </div>
                <div class="space-y-1">
                  <label for="t-pass" class="text-[10px] text-zinc-600 font-bold uppercase tracking-wider block">Mật khẩu truy cập</label>
                  <input 
                    id="t-pass"
                    type="password" 
                    bind:value={password}
                    required
                    placeholder="Mật khẩu mặc định" 
                    class="w-full border-2 border-black px-2.5 py-1.5 text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white font-semibold text-black"
                  />
                </div>
              </div>
            </div>

            <!-- Profile Info section -->
            <div class="space-y-3">
              <h3 class="text-xs font-black text-zinc-500 uppercase tracking-wider border-b border-black/15 pb-1.5">2. Hồ sơ hợp đồng & cọc</h3>
              <div class="grid grid-cols-2 gap-3">
                <div class="space-y-1">
                  <label for="t-room" class="text-[10px] text-zinc-600 font-bold uppercase tracking-wider block">Chọn phòng nhận bàn giao</label>
                  <select 
                    id="t-room"
                    bind:value={roomId}
                    required
                    class="w-full border-2 border-black px-2.5 py-1.5 text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white font-semibold text-black"
                  >
                    {#each emptyRooms as room}
                      <option value={room.id}>
                        {room.property.shortName} - Phòng {room.roomNumber}
                      </option>
                    {/each}
                  </select>
                </div>
                <div class="space-y-1">
                  <label for="t-cccd" class="text-[10px] text-zinc-600 font-bold uppercase tracking-wider block">Số CCCD / Hộ chiếu</label>
                  <input 
                    id="t-cccd"
                    type="text" 
                    bind:value={idNumber}
                    required
                    placeholder="Nhập 12 số CCCD" 
                    class="w-full border-2 border-black px-2.5 py-1.5 text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white font-semibold text-black"
                  />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div class="space-y-1">
                  <label for="t-date" class="text-[10px] text-zinc-600 font-bold uppercase tracking-wider block">Ngày bàn giao nhận phòng</label>
                  <input 
                    id="t-date"
                    type="date" 
                    bind:value={moveInDate}
                    required
                    class="w-full border-2 border-black px-2.5 py-1.5 text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white font-semibold text-black"
                  />
                </div>
                <div class="space-y-1">
                  <label for="t-dep" class="text-[10px] text-zinc-600 font-bold uppercase tracking-wider block">Số tiền cọc đã đóng (đ)</label>
                  <input 
                    id="t-dep"
                    type="number" 
                    bind:value={deposit}
                    required
                    placeholder="Ví dụ: 3000000" 
                    class="w-full border-2 border-black px-2.5 py-1.5 text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white font-semibold text-black"
                  />
                </div>
              </div>
            </div>

            <!-- Initial Meter readings -->
            <div class="space-y-3">
              <h3 class="text-xs font-black text-zinc-500 uppercase tracking-wider border-b border-black/15 pb-1.5">3. Chỉ số điện nước đầu kỳ</h3>
              <div class="grid grid-cols-2 gap-3">
                <div class="space-y-1">
                  <label for="t-elec" class="text-[10px] text-zinc-600 font-bold uppercase tracking-wider block">Chỉ số Điện đầu kỳ (kWh)</label>
                  <input 
                    id="t-elec"
                    type="number" 
                    bind:value={initialElectricity}
                    required
                    class="w-full border-2 border-black px-2.5 py-1.5 text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white font-black text-center text-black"
                  />
                </div>
                <div class="space-y-1">
                  <label for="t-water" class="text-[10px] text-zinc-600 font-bold uppercase tracking-wider block">Chỉ số Nước đầu kỳ (m³)</label>
                  <input 
                    id="t-water"
                    type="number" 
                    bind:value={initialWater}
                    required
                    class="w-full border-2 border-black px-2.5 py-1.5 text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white font-black text-center text-black"
                  />
                </div>
              </div>
            </div>

            <div class="space-y-1">
              <label for="t-notes" class="text-[10px] text-zinc-600 font-bold uppercase tracking-wider block">Ghi chú hợp đồng</label>
              <textarea 
                id="t-notes"
                bind:value={notes}
                placeholder="Thuê dài hạn 12 tháng, giữ xe máy..." 
                rows="2"
                class="w-full border-2 border-black p-2.5 text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white font-semibold text-black"
              ></textarea>
            </div>

            <div class="flex justify-end gap-3 pt-3 border-t-2 border-black">
              <button 
                type="button" 
                onclick={() => isAddDialogOpen = false}
                class="border-2 border-black bg-white hover:bg-zinc-150 text-black px-4 py-2 rounded-[6px] text-xs font-bold transition-all cursor-pointer"
              >
                Hủy
              </button>
              <button 
                type="submit"
                disabled={isSubmitting}
                class="bg-blue-300 hover:bg-blue-400 disabled:opacity-50 text-black border-2 border-black px-4 py-2 rounded-[6px] text-xs font-black shadow-secondary hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none transition-all flex items-center gap-1.5 cursor-pointer"
              >
                Đăng ký khách thuê
                {#if isSubmitting}
                  <Loader2 class="h-4.5 w-4.5 animate-spin" />
                {/if}
              </button>
            </div>
          </form>
        {/if}
      </div>
    </div>
  {/if}

  <!-- Detail Slide-over Drawer -->
  {#if isDetailDrawerOpen && selectedTenant}
    <!-- Overlay -->
    <div 
      class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex justify-end"
      onclick={() => isDetailDrawerOpen = false}
      onkeydown={(e) => e.key === 'Escape' && (isDetailDrawerOpen = false)}
      role="button"
      tabindex="0"
    >
      <!-- Drawer Content: Brutallist Panel border-l-2 -->
      <div 
        class="bg-white w-full max-w-md h-full border-l-2 border-black shadow-primary flex flex-col justify-between animate-[slide-left_0.2s_ease-out] overflow-hidden"
        onclick={(e) => e.stopPropagation()}
        onkeydown={(e) => e.stopPropagation()}
        role="dialog"
      >
        <!-- Windows Header style -->
        <div class="flex items-center gap-2 px-4 py-3 bg-zinc-50 border-b-2 border-black shrink-0 select-none">
          <div class="w-2.5 h-2.5 rounded-full bg-red-500 border border-black"></div>
          <div class="w-2.5 h-2.5 rounded-full bg-yellow-500 border border-black"></div>
          <div class="w-2.5 h-2.5 rounded-full bg-green-500 border border-black"></div>
          <span class="text-xs font-bold text-zinc-500 ml-2 font-black">Hồ sơ khách thuê</span>
          <button 
            onclick={() => isDetailDrawerOpen = false} 
            class="ml-auto text-black hover:bg-zinc-200 p-1 border border-transparent rounded-[6px] cursor-pointer"
          >
            <X class="h-4.5 w-4.5" />
          </button>
        </div>

        <div class="p-6 space-y-6 flex-1 overflow-y-auto">
          <!-- Drawer Header Title -->
          <div class="flex items-center gap-3 border-b-2 border-black pb-4">
            <div class="bg-white border-2 border-black p-2.5 rounded-lg shadow-secondary text-black shrink-0">
              <User class="h-6 w-6" />
            </div>
            <div>
              <h3 class="font-black text-black text-lg leading-tight">{selectedTenant.user.name}</h3>
              <p class="text-zinc-600 text-xs mt-1 font-bold">Hồ sơ khách thuê Roomio</p>
            </div>
          </div>

          <!-- Contact info details -->
          <div class="space-y-3">
            <h4 class="text-xs font-black text-zinc-500 uppercase tracking-wider">Thông tin liên hệ</h4>
            <div class="space-y-2.5 divide-y divide-black/15 text-sm font-semibold text-black">
              <div class="flex justify-between items-center py-2">
                <span class="text-zinc-500 flex items-center gap-1.5 font-bold uppercase text-xs">
                  <Phone class="h-4 w-4 text-black" />
                  Số điện thoại
                </span>
                <span class="font-black">{selectedTenant.user.phone}</span>
              </div>
              <div class="flex justify-between items-center py-2">
                <span class="text-zinc-500 flex items-center gap-1.5 font-bold uppercase text-xs">
                  <Mail class="h-4 w-4 text-black" />
                  Email liên hệ
                </span>
                <span class="font-black">{selectedTenant.user.email}</span>
              </div>
              <div class="flex justify-between items-center py-2">
                <span class="text-zinc-500 flex items-center gap-1.5 font-bold uppercase text-xs">
                  <FileText class="h-4 w-4 text-black" />
                  CCCD / Hộ chiếu
                </span>
                <span class="font-mono font-black">{selectedTenant.idNumber}</span>
              </div>
            </div>
          </div>

          <!-- Lease Details -->
          <div class="space-y-3">
            <h4 class="text-xs font-black text-zinc-500 uppercase tracking-wider">Hợp đồng thuê trọ</h4>
            <div class="space-y-2.5 divide-y divide-black/15 text-sm font-semibold text-black">
              <div class="flex justify-between items-center py-2">
                <span class="text-zinc-500 flex items-center gap-1.5 font-bold uppercase text-xs">
                  <Home class="h-4 w-4 text-black" />
                  Phòng đang ở
                </span>
                {#if selectedTenant.rooms[0]}
                  <span class="font-black text-blue-600">
                    {selectedTenant.rooms[0].property.shortName} - Phòng {selectedTenant.rooms[0].roomNumber}
                  </span>
                {:else}
                  <span class="text-red-500 font-black">Chưa ở phòng nào</span>
                {/if}
              </div>
              <div class="flex justify-between items-center py-2">
                <span class="text-zinc-500 flex items-center gap-1.5 font-bold uppercase text-xs">
                  <Calendar class="h-4 w-4 text-black" />
                  Ngày dọn vào ở
                </span>
                <span class="font-black">
                  {new Date(selectedTenant.moveInDate).toLocaleDateString('vi-VN')}
                </span>
              </div>
              <div class="flex justify-between items-center py-2">
                <span class="text-zinc-500 flex items-center gap-1.5 font-bold uppercase text-xs">
                  <DollarSign class="h-4 w-4 text-black" />
                  Tiền đặt cọc giữ
                </span>
                <span class="font-black text-green-600">{formatCurrency(selectedTenant.deposit)}</span>
              </div>
            </div>
          </div>

          <!-- Notes -->
          <div class="space-y-2">
            <h4 class="text-xs font-black text-zinc-500 uppercase tracking-wider">Ghi chú / Thỏa thuận riêng</h4>
            <div class="bg-white border-2 border-black p-3 rounded-lg shadow-secondary text-xs text-black leading-relaxed font-semibold">
              {selectedTenant.notes || 'Không ghi nhận thỏa thuận đặc biệt nào.'}
            </div>
          </div>
        </div>

        <!-- Checkout action at bottom -->
        <div class="p-6 border-t-2 border-black bg-zinc-150 flex gap-3 shrink-0">
          {#if selectedTenant.rooms[0]}
            <button
              onclick={() => handleCheckout(selectedTenant!.rooms[0].id)}
              class="flex-1 border-2 border-black bg-red-200 hover:bg-red-300 text-red-800 py-2.5 rounded-[6px] text-center text-xs font-black shadow-secondary hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              Trả phòng (Checkout) <LogOut class="h-4 w-4" />
            </button>
          {/if}
          <button
            onclick={() => isDetailDrawerOpen = false}
            class="flex-1 border-2 border-black bg-white hover:bg-zinc-150 text-black py-2.5 rounded-[6px] text-center text-xs font-black transition-all cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  {/if}

</div>
