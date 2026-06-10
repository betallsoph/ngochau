<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import { toast } from 'svelte-sonner';
  import { 
    Home, 
    Building2, 
    Plus, 
    X, 
    User, 
    Receipt, 
    Zap, 
    Droplet,
    Wifi,
    Trash2, 
    Wrench,
    FileText,
    Check,
    Loader2,
    LogOut,
    CheckCircle2,
    ArrowRight
  } from '@lucide/svelte';

  interface Service {
    id: string;
    name: string;
    type: string;
    defaultRate: number;
  }

  interface ServiceConfig {
    id: string;
    serviceId: string;
    service: Service;
    customRate: number | null;
    quantity: number;
  }

  interface MeterReading {
    id: string;
    serviceId: string;
    month: string;
    prevValue: number;
    currValue: number;
    recordedAt: string;
  }

  interface RoomAsset {
    id: string;
    name: string;
    code: string | null;
    status: string;
    notes: string | null;
  }

  interface Tenant {
    id: string;
    user: {
      name: string;
      phone: string;
      email: string;
    };
    idNumber: string;
    moveInDate: string;
    deposit: number;
  }

  interface Room {
    id: string;
    propertyId: string;
    blockId: string | null;
    roomNumber: string;
    roomCode: string | null;
    roomType: string;
    floor: number | null;
    status: string;
    monthlyRent: number;
    area: number | null;
    debtAmount: number;
    tenantId: string | null;
    tenant: Tenant | null;
    services: ServiceConfig[];
    meterReadings: MeterReading[];
    assets: RoomAsset[];
  }

  interface Property {
    id: string;
    name: string;
    shortName: string;
    blocks: { id: string; name: string }[];
  }

  let landlordId = $state<string | null>(null);
  let isLoading = $state(true);
  let properties = $state<Property[]>([]);
  let rooms = $state<Room[]>([]);

  // Filtering states
  let selectedPropertyId = $state('');
  let selectedBlockId = $state('all');

  // Detail Modal / Drawer states
  let selectedRoom = $state<Room | null>(null);
  let isDetailOpen = $state(false);
  let activeTab = $state<'general' | 'services' | 'meters' | 'assets'>('general');

  // Add Room Dialog states
  let isAddDialogOpen = $state(false);
  let newRoomNumber = $state('');
  let newRoomCode = $state('');
  let newRoomType = $state('standard');
  let newFloor = $state('');
  let newMonthlyRent = $state('');
  let newArea = $state('');
  let newBlockId = $state('');
  let isCreatingRoom = $state(false);

  // Meter Form states
  let meterServiceId = $state('');
  let meterMonth = $state(new Date().toISOString().slice(0, 7)); // YYYY-MM
  let meterPrev = $state('');
  let meterCurr = $state('');
  let isLoggingMeter = $state(false);

  // Asset Form states
  let assetName = $state('');
  let assetCode = $state('');
  let assetStatus = $state('good');
  let assetNotes = $state('');
  let isAddingAsset = $state(false);

  onMount(() => {
    const sessionStr = localStorage.getItem('roomio_user');
    if (!sessionStr) return;
    const session = JSON.parse(sessionStr);
    landlordId = session.landlordProfileId;
    
    // Parse query params (e.g. from building details click)
    const propertyParam = page.url.searchParams.get('propertyId');
    if (propertyParam) {
      selectedPropertyId = propertyParam;
    }

    loadInitialData(session.landlordProfileId);
  });

  async function loadInitialData(profileId: string) {
    isLoading = true;
    try {
      // Fetch properties first
      const propRes = await fetch(`/api/properties?landlordId=${profileId}`);
      const propData = await propRes.json();
      
      if (propRes.ok) {
        properties = propData;
        if (properties.length > 0 && !selectedPropertyId) {
          selectedPropertyId = properties[0].id;
        }
      }

      if (selectedPropertyId) {
        await fetchRooms(selectedPropertyId);
      }
    } catch (e: any) {
      toast.error('Lỗi khi tải dữ liệu: ' + e.message);
    } finally {
      isLoading = false;
    }
  }

  async function fetchRooms(propertyId: string) {
    if (!propertyId) return;
    try {
      const blockFilter = selectedBlockId !== 'all' ? `&blockId=${selectedBlockId}` : '';
      const res = await fetch(`/api/rooms?propertyId=${propertyId}${blockFilter}`);
      const data = await res.json();
      if (res.ok) rooms = data;
    } catch (e: any) {
      toast.error('Lỗi khi tải danh sách phòng: ' + e.message);
    }
  }

  // Handle building select change
  $effect(() => {
    if (selectedPropertyId) {
      fetchRooms(selectedPropertyId);
    }
  });

  // Handle block filter change
  $effect(() => {
    if (selectedPropertyId && selectedBlockId) {
      fetchRooms(selectedPropertyId);
    }
  });

  async function handleAddRoom(e: SubmitEvent) {
    e.preventDefault();
    if (!selectedPropertyId || isCreatingRoom) return;

    if (!newRoomNumber || !newMonthlyRent) {
      toast.error('Vui lòng điền số phòng và giá thuê');
      return;
    }

    isCreatingRoom = true;
    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: selectedPropertyId,
          blockId: newBlockId || null,
          roomNumber: newRoomNumber,
          roomCode: newRoomCode || null,
          roomType: newRoomType,
          floor: newFloor ? Number(newFloor) : null,
          monthlyRent: Number(newMonthlyRent),
          area: newArea ? Number(newArea) : null
        })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Lỗi tạo phòng');

      toast.success(`Đã thêm phòng ${newRoomNumber} thành công`);
      isAddDialogOpen = false;
      // Clear forms
      newRoomNumber = '';
      newRoomCode = '';
      newFloor = '';
      newMonthlyRent = '';
      newArea = '';
      newBlockId = '';
      
      // Refresh
      fetchRooms(selectedPropertyId);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      isCreatingRoom = false;
    }
  }

  async function handleCheckout(roomId: string) {
    if (!confirm('Bạn có chắc chắn muốn trả phòng cho khách này? Các khoản nợ sẽ được xóa về 0.')) return;

    try {
      const res = await fetch('/api/rooms', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: roomId, action: 'checkout' })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Lỗi khi trả phòng');

      toast.success('Đã trả phòng thành công');
      isDetailOpen = false;
      selectedRoom = null;
      fetchRooms(selectedPropertyId);
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  async function saveServiceConfig(roomId: string, configs: { serviceId: string; customRate: string | null; quantity: number }[]) {
    try {
      const res = await fetch('/api/rooms', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: roomId, action: 'updateServiceConfig', configs })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Lỗi lưu dịch vụ');

      toast.success('Đã cập nhật biểu phí riêng của phòng');
      selectedRoom = data;
      fetchRooms(selectedPropertyId);
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  async function handleLogMeter(e: SubmitEvent) {
    e.preventDefault();
    if (!selectedRoom || isLoggingMeter) return;

    if (!meterServiceId || !meterMonth || meterCurr === '' || meterPrev === '') {
      toast.error('Vui lòng nhập đầy đủ chỉ số');
      return;
    }

    isLoggingMeter = true;
    try {
      const res = await fetch('/api/rooms', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedRoom.id,
          action: 'updateMeters',
          serviceId: meterServiceId,
          month: meterMonth,
          prevValue: Number(meterPrev),
          currValue: Number(meterCurr)
        })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Lỗi ghi chỉ số');

      toast.success('Đã lưu chỉ số đo lường thành công');
      selectedRoom = data;
      meterCurr = '';
      meterPrev = '';
      fetchRooms(selectedPropertyId);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      isLoggingMeter = false;
    }
  }

  async function handleAddAsset(e: SubmitEvent) {
    e.preventDefault();
    if (!selectedRoom || isAddingAsset) return;

    if (!assetName) {
      toast.error('Vui lòng nhập tên thiết bị');
      return;
    }

    isAddingAsset = true;
    try {
      const res = await fetch('/api/rooms', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedRoom.id,
          action: 'updateAsset',
          name: assetName,
          code: assetCode || null,
          status: assetStatus,
          notes: assetNotes || null
        })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Lỗi thêm thiết bị');

      toast.success('Đã thêm thiết bị bàn giao phòng');
      selectedRoom = data;
      assetName = '';
      assetCode = '';
      assetNotes = '';
      fetchRooms(selectedPropertyId);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      isAddingAsset = false;
    }
  }

  async function handleDeleteAsset(assetId: string) {
    if (!selectedRoom || !confirm('Bạn muốn thu hồi/xóa thiết bị này?')) return;

    try {
      const res = await fetch('/api/rooms', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedRoom.id,
          action: 'deleteAsset',
          assetId
        })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Lỗi xóa thiết bị');

      toast.success('Đã xóa thiết bị');
      selectedRoom = data;
      fetchRooms(selectedPropertyId);
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  function getActiveProperty() {
    return properties.find(p => p.id === selectedPropertyId);
  }

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
  }

  function getRoomTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      standard: 'Phòng thường',
      master: 'Phòng master',
      balcony: 'Phòng ban công',
    };
    return labels[type] || type;
  }
</script>

<div class="space-y-6">
  <!-- Top Section: Filters and Title -->
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
    <div>
      <h1 class="text-xl sm:text-2xl font-black text-black leading-none">Sơ Đồ Phòng Trọ</h1>
      <p class="text-zinc-500 text-sm mt-1.5 font-bold uppercase tracking-wider">Quản lý trạng thái, chỉ số và thiết bị bàn giao</p>
    </div>
    
    <button 
      onclick={() => isAddDialogOpen = true}
      class="w-full sm:w-auto bg-blue-300 hover:bg-blue-400 text-black border-2 border-black px-4 py-2.5 rounded-[6px] shadow-secondary hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center justify-center gap-1.5 cursor-pointer font-bold text-sm"
    >
      Thêm phòng <Plus class="h-4.5 w-4.5" />
    </button>
  </div>

  <!-- Filter bar -->
  <div class="bg-white border-2 border-black p-4 rounded-lg shadow-secondary">
    <div class="grid gap-3 sm:grid-cols-2">
      <div class="space-y-1">
        <span class="text-[10px] font-black text-zinc-500 uppercase tracking-wider block">Chọn tòa nhà</span>
        <select 
          bind:value={selectedPropertyId} 
          class="w-full border-2 border-black px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white font-bold text-black"
        >
          {#each properties as prop}
            <option value={prop.id}>{prop.name}</option>
          {/each}
        </select>
      </div>

      {#if getActiveProperty() && getActiveProperty()!.blocks.length > 0}
        <div class="space-y-1">
          <span class="text-[10px] font-black text-zinc-500 uppercase tracking-wider block">Dãy/Phân cụm</span>
          <select 
            bind:value={selectedBlockId} 
            class="w-full border-2 border-black px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white font-bold text-black"
          >
            <option value="all">Tất cả dãy</option>
            {#each getActiveProperty()!.blocks as block}
              <option value={block.id}>{block.name}</option>
            {/each}
          </select>
        </div>
      {/if}
    </div>

    <!-- Quick Legend -->
    <div class="flex flex-wrap gap-4 text-xs font-bold text-zinc-600 mt-3 select-none">
      <div class="flex items-center gap-1.5">
        <span class="w-3.5 h-3.5 rounded-md border-2 border-black bg-white"></span>
        <span>Phòng trống</span>
      </div>
      <div class="flex items-center gap-1.5">
        <span class="w-3.5 h-3.5 rounded-md border-2 border-black bg-green-200"></span>
        <span>Đã đóng đủ</span>
      </div>
      <div class="flex items-center gap-1.5">
        <span class="w-3.5 h-3.5 rounded-md border-2 border-black bg-red-200"></span>
        <span>Chưa thanh toán</span>
      </div>
    </div>
  </div>

  {#if isLoading}
    <div class="h-[40vh] w-full flex items-center justify-center">
      <Loader2 class="h-10 w-10 text-black animate-spin" />
    </div>
  {:else if rooms.length === 0}
    <div class="bg-white border-2 border-black p-12 rounded-lg text-center max-w-md mx-auto shadow-secondary">
      <Home class="h-12 w-12 text-black mx-auto mb-3" />
      <h3 class="font-black text-black text-lg">Tòa nhà này chưa có phòng</h3>
      <p class="text-zinc-600 text-sm mt-2 font-semibold">Bắt đầu bằng cách tạo các phòng trọ để thêm thông tin khách thuê.</p>
    </div>
  {:else}
    <!-- Mobile card list (hidden on sm+) -->
    <div class="sm:hidden border-2 border-black rounded-lg overflow-hidden divide-y-2 divide-black">
      {#each rooms as room}
        {@const statusBg = room.status === 'empty' ? 'bg-white' : room.status === 'paid' ? 'bg-green-100' : 'bg-red-100'}
        {@const statusText = room.status === 'empty' ? 'text-zinc-500' : room.status === 'paid' ? 'text-green-800' : 'text-red-800'}
        {@const statusLabel = room.status === 'empty' ? 'Trống' : room.status === 'paid' ? 'Đã đóng' : 'Còn nợ'}
        <div class="p-4 space-y-2 {statusBg}">
          <div class="flex justify-between items-start gap-2">
            <div>
              <h3 class="font-black text-black text-base leading-none">Phòng {room.roomNumber}</h3>
              <p class="text-zinc-500 text-xs mt-0.5 font-semibold">{getRoomTypeLabel(room.roomType)}</p>
            </div>
            <span class="text-[10px] px-2 py-1 rounded-md border-2 border-black font-black uppercase {statusText} {statusBg}">{statusLabel}</span>
          </div>
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs text-zinc-500 font-bold">{room.tenant ? room.tenant.user.name : 'Trống'}</p>
              <p class="text-sm font-black text-black">{formatCurrency(room.monthlyRent)}/tháng</p>
            </div>
            <button
              onclick={() => { selectedRoom = room; activeTab = 'general'; isDetailOpen = true; }}
              class="bg-blue-300 text-black border-2 border-black px-3 py-1.5 rounded-[6px] text-xs font-black shadow-secondary hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all cursor-pointer"
            >
              Chi tiết
            </button>
          </div>
        </div>
      {/each}
    </div>

    <!-- Desktop grid (hidden on mobile) -->
    <div class="hidden sm:block">
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {#each rooms as room}
          {@const statusColor = room.status === 'empty' ? 'border-black bg-white' : room.status === 'paid' ? 'border-black bg-green-200' : 'border-black bg-red-200'}
          {@const statusBadge = room.status === 'empty' ? 'text-zinc-500' : room.status === 'paid' ? 'text-green-800' : 'text-red-800'}
          
          <button
            onclick={() => { selectedRoom = room; activeTab = 'general'; isDetailOpen = true; }}
            class="border-2 rounded-lg p-4 flex flex-col justify-between items-start text-left shadow-secondary hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none transition-all cursor-pointer h-32 focus:outline-none focus:ring-2 focus:ring-blue-300 {statusColor}"
          >
            <div>
              <span class="text-xl font-black text-black leading-none">{room.roomNumber}</span>
              <p class="text-[9px] font-black text-zinc-600 uppercase tracking-wider mt-1">{getRoomTypeLabel(room.roomType)}</p>
            </div>
            
            <div class="w-full flex justify-between items-end border-t border-black/15 pt-2 mt-2">
              <span class="text-[10px] font-black uppercase tracking-wider {statusBadge}">
                {room.status === 'empty' ? 'Trống' : room.status === 'paid' ? 'Đã đóng' : 'Còn nợ'}
              </span>
              <span class="text-xs font-black text-black">{formatCurrency(room.monthlyRent)}</span>
            </div>
          </button>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Add Room Dialog -->
  {#if isAddDialogOpen}
    <!-- Overlay -->
    <div 
      class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onclick={() => isAddDialogOpen = false}
      onkeydown={(e) => e.key === 'Escape' && (isAddDialogOpen = false)}
      role="button"
      tabindex="0"
    >
      <!-- Dialog Content: Brutallist Panel with macOS Header -->
      <div 
        class="bg-white rounded-lg w-full max-w-lg border-2 border-black shadow-primary overflow-hidden relative flex flex-col animate-[scale-up_0.2s_ease-out]"
        onclick={(e) => e.stopPropagation()}
        onkeydown={(e) => e.stopPropagation()}
        role="dialog"
      >
        <!-- macOS Style Header -->
        <div class="flex items-center gap-2 px-4 py-3 bg-zinc-50 border-b-2 border-black shrink-0 select-none">
          <div class="w-2.5 h-2.5 rounded-full bg-red-500 border border-black"></div>
          <div class="w-2.5 h-2.5 rounded-full bg-yellow-500 border border-black"></div>
          <div class="w-2.5 h-2.5 rounded-full bg-green-500 border border-black"></div>
          <span class="text-xs font-bold text-zinc-500 ml-2">Tạo phòng trọ mới</span>
          <button onclick={() => isAddDialogOpen = false} class="ml-auto text-black hover:bg-zinc-200 p-1 border border-transparent rounded-[6px]">
            <X class="h-4 w-4" />
          </button>
        </div>

        <form onsubmit={handleAddRoom} class="p-6 space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1">
              <label for="r-num" class="text-xs font-bold text-zinc-600 uppercase tracking-wider block">Số phòng</label>
              <input 
                id="r-num"
                type="text" 
                bind:value={newRoomNumber}
                required
                placeholder="Ví dụ: 101, A2" 
                class="w-full border-2 border-black px-3 py-2 text-sm rounded-lg focus:outline-none bg-white font-bold"
              />
            </div>
            <div class="space-y-1">
              <label for="r-code" class="text-xs font-bold text-zinc-600 uppercase tracking-wider block">Mã căn hộ (Tùy chọn)</label>
              <input 
                id="r-code"
                type="text" 
                bind:value={newRoomCode}
                placeholder="Ví dụ: CH-101" 
                class="w-full border-2 border-black px-3 py-2 text-sm rounded-lg focus:outline-none bg-white font-bold"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1">
              <label for="r-type" class="text-xs font-bold text-zinc-600 uppercase tracking-wider block">Loại phòng</label>
              <select 
                id="r-type"
                bind:value={newRoomType}
                class="w-full border-2 border-black px-3 py-2 text-sm rounded-lg focus:outline-none bg-white font-bold text-black"
              >
                <option value="standard">Phòng thường</option>
                <option value="master">Phòng master</option>
                <option value="balcony">Phòng ban công</option>
              </select>
            </div>
            <div class="space-y-1">
              <label for="r-floor" class="text-xs font-bold text-zinc-600 uppercase tracking-wider block">Tầng</label>
              <input 
                id="r-floor"
                type="number" 
                bind:value={newFloor}
                placeholder="1, 2, 3..." 
                class="w-full border-2 border-black px-3 py-2 text-sm rounded-lg focus:outline-none bg-white font-bold"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1">
              <label for="r-rent" class="text-xs font-bold text-zinc-600 uppercase tracking-wider block">Giá thuê tháng (đ)</label>
              <input 
                id="r-rent"
                type="number" 
                bind:value={newMonthlyRent}
                required
                placeholder="Ví dụ: 3000000" 
                class="w-full border-2 border-black px-3 py-2 text-sm rounded-lg focus:outline-none bg-white font-bold"
              />
            </div>
            <div class="space-y-1">
              <label for="r-area" class="text-xs font-bold text-zinc-600 uppercase tracking-wider block">Diện tích (m²)</label>
              <input 
                id="r-area"
                type="number" 
                bind:value={newArea}
                placeholder="Ví dụ: 25" 
                class="w-full border-2 border-black px-3 py-2 text-sm rounded-lg focus:outline-none bg-white font-bold"
              />
            </div>
          </div>

          {#if getActiveProperty() && getActiveProperty()!.blocks.length > 0}
            <div class="space-y-1">
              <label for="r-block" class="text-xs font-bold text-zinc-600 uppercase tracking-wider block">Thuộc Dãy/Cụm</label>
              <select 
                id="r-block"
                bind:value={newBlockId}
                class="w-full border-2 border-black px-3 py-2 text-sm rounded-lg focus:outline-none bg-white font-bold text-black"
              >
                <option value="">Không phân dãy</option>
                {#each getActiveProperty()!.blocks as block}
                  <option value={block.id}>{block.name}</option>
                {/each}
              </select>
            </div>
          {/if}

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
              disabled={isCreatingRoom}
              class="bg-blue-300 hover:bg-blue-400 disabled:opacity-50 text-black border-2 border-black px-4 py-2 rounded-[6px] text-xs font-bold shadow-secondary hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none transition-all flex items-center gap-1.5 cursor-pointer"
            >
              Thêm phòng
              {#if isCreatingRoom}
                <Loader2 class="h-4 w-4 animate-spin" />
              {/if}
            </button>
          </div>
        </form>
      </div>
    </div>
  {/if}

  <!-- Room Detail Drawer Slide-over: Brutallist Panel with macOS Header -->
  {#if isDetailOpen && selectedRoom}
    <!-- Overlay -->
    <div 
      class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex justify-end"
      onclick={() => isDetailOpen = false}
      onkeydown={(e) => e.key === 'Escape' && (isDetailOpen = false)}
      role="button"
      tabindex="0"
    >
      <!-- Drawer Content: Brutallist Panel border-l-2 -->
      <div 
        class="bg-white w-full max-w-xl h-full border-l-2 border-black shadow-primary flex flex-col justify-between animate-[slide-left_0.2s_ease-out] overflow-hidden"
        onclick={(e) => e.stopPropagation()}
        onkeydown={(e) => e.stopPropagation()}
        role="dialog"
      >
        <!-- macOS Style Header -->
        <div class="flex items-center gap-2 px-4 py-3 bg-zinc-50 border-b-2 border-black shrink-0 select-none">
          <div class="w-2.5 h-2.5 rounded-full bg-red-500 border border-black"></div>
          <div class="w-2.5 h-2.5 rounded-full bg-yellow-500 border border-black"></div>
          <div class="w-2.5 h-2.5 rounded-full bg-green-500 border border-black"></div>
          <span class="text-xs font-bold text-zinc-500 ml-2">Quản lý Phòng {selectedRoom.roomNumber}</span>
          <button onclick={() => isDetailOpen = false} class="ml-auto text-black hover:bg-zinc-200 p-1 border border-transparent rounded-[6px]">
            <X class="h-4 w-4" />
          </button>
        </div>

        <div class="flex-1 flex flex-col min-h-0 p-6">
          <div class="flex-1 flex flex-col min-h-0">
            <!-- Header Title Info -->
            <div class="flex items-center gap-3 border-b-2 border-black pb-4 shrink-0">
              <Home class="h-6 w-6 text-blue-500" />
              <div>
                <h3 class="font-black text-black text-lg leading-none">Phòng {selectedRoom.roomNumber}</h3>
                <p class="text-zinc-600 text-xs mt-1.5 font-bold uppercase tracking-wider">
                  Loại: {getRoomTypeLabel(selectedRoom.roomType)} | Diện tích: {selectedRoom.area || '--'}m² | Tầng: {selectedRoom.floor || '--'}
                </p>
              </div>
            </div>

            <!-- Tab Selector inside Drawer -->
            <div class="flex border-b border-black/15 mt-4 shrink-0 gap-1 bg-white/50 p-1 rounded-lg border-2 border-black select-none">
              <button 
                onclick={() => activeTab = 'general'}
                class="flex-1 py-1.5 text-xs font-black uppercase tracking-wider rounded-[6px] transition-all cursor-pointer {activeTab === 'general' ? 'bg-blue-300 text-black border border-black' : 'text-zinc-500 hover:text-black border border-transparent'}"
              >
                Chung
              </button>
              <button 
                onclick={() => activeTab = 'services'}
                class="flex-1 py-1.5 text-xs font-black uppercase tracking-wider rounded-[6px] transition-all cursor-pointer {activeTab === 'services' ? 'bg-blue-300 text-black border border-black' : 'text-zinc-500 hover:text-black border border-transparent'}"
              >
                Dịch vụ
              </button>
              <button 
                onclick={() => activeTab = 'meters'}
                class="flex-1 py-1.5 text-xs font-black uppercase tracking-wider rounded-[6px] transition-all cursor-pointer {activeTab === 'meters' ? 'bg-blue-300 text-black border border-black' : 'text-zinc-500 hover:text-black border border-transparent'}"
              >
                Ghi số
              </button>
              <button 
                onclick={() => activeTab = 'assets'}
                class="flex-1 py-1.5 text-xs font-black uppercase tracking-wider rounded-[6px] transition-all cursor-pointer {activeTab === 'assets' ? 'bg-blue-300 text-black border border-black' : 'text-zinc-500 hover:text-black border border-transparent'}"
              >
                Tài sản
              </button>
            </div>

            <!-- Tab Content Scrollable -->
            <div class="flex-1 overflow-y-auto py-4 min-h-0 space-y-4">
              <!-- GENERAL TAB -->
              {#if activeTab === 'general'}
                <div class="space-y-4">
                  <!-- Status Card -->
                  <div class="p-4 rounded-lg border-2 border-black flex justify-between items-center shadow-secondary {selectedRoom.status === 'empty' ? 'bg-white' : selectedRoom.status === 'paid' ? 'bg-green-200' : 'bg-red-200'}">
                    <div>
                      <span class="text-xs text-zinc-600 uppercase tracking-wider font-black">Trạng thái phòng</span>
                      <h4 class="font-black text-sm uppercase mt-1 {selectedRoom.status === 'empty' ? 'text-zinc-700' : selectedRoom.status === 'paid' ? 'text-green-850' : 'text-red-850'}">
                        {selectedRoom.status === 'empty' ? 'Đang trống' : selectedRoom.status === 'paid' ? 'Đã đóng tiền' : 'Còn nợ tiền nhà'}
                      </h4>
                    </div>
                    {#if selectedRoom.status !== 'empty'}
                      <div class="text-right">
                        <span class="text-xs text-zinc-600 uppercase tracking-wider font-black">Số tiền đang nợ</span>
                        <p class="font-black text-lg text-red-650 mt-1">{formatCurrency(selectedRoom.debtAmount)}</p>
                      </div>
                    {/if}
                  </div>

                  <!-- Tenant Details -->
                  <div class="bg-white border-2 border-black rounded-lg p-4 space-y-3 shadow-secondary">
                    <h4 class="text-xs font-black text-zinc-500 uppercase tracking-wider border-b pb-1.5">Thông tin khách thuê</h4>
                    {#if selectedRoom.tenant}
                      <div class="grid grid-cols-2 gap-3 text-sm font-semibold">
                        <div>
                          <p class="text-zinc-400 text-xs font-bold uppercase tracking-wider">Họ và tên</p>
                          <p class="font-bold text-black">{selectedRoom.tenant.user.name}</p>
                        </div>
                        <div>
                          <p class="text-zinc-400 text-xs font-bold uppercase tracking-wider">Số điện thoại</p>
                          <p class="font-bold text-black">{selectedRoom.tenant.user.phone}</p>
                        </div>
                        <div>
                          <p class="text-zinc-400 text-xs font-bold uppercase tracking-wider">Ngày dọn vào</p>
                          <p class="font-bold text-black">{new Date(selectedRoom.tenant.moveInDate).toLocaleDateString('vi-VN')}</p>
                        </div>
                        <div>
                          <p class="text-zinc-400 text-xs font-bold uppercase tracking-wider">Tiền đặt cọc</p>
                          <p class="font-black text-green-650">{formatCurrency(selectedRoom.tenant.deposit)}</p>
                        </div>
                      </div>
                    {:else}
                      <div class="text-center py-4 space-y-3">
                        <p class="text-sm text-zinc-500 font-semibold">Chưa có thông tin khách thuê phòng này.</p>
                        <a 
                          href="/dashboard/tenants"
                          class="inline-flex bg-blue-300 text-black border-2 border-black px-4 py-2 rounded-[6px] shadow-secondary hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all text-xs font-black"
                        >
                          Đến trang Thêm khách thuê <ArrowRight class="h-3.5 w-3.5" />
                        </a>
                      </div>
                    {/if}
                  </div>
                </div>

              <!-- SERVICES TAB -->
              {:else if activeTab === 'services'}
                <div class="space-y-4">
                  <div class="bg-white border-2 border-black rounded-lg p-4 space-y-3 shadow-secondary">
                    <div class="flex justify-between items-center border-b pb-2">
                      <h4 class="text-xs font-black text-zinc-500 uppercase tracking-wider">Dịch vụ phòng trọ sử dụng</h4>
                      <span class="text-[10px] text-zinc-400 font-bold uppercase">Nhấn Lưu để đổi biểu phí riêng</span>
                    </div>
                    
                    <div class="divide-y divide-zinc-200">
                      {#each selectedRoom.services as config}
                        <div class="py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                          <div>
                            <p class="font-bold text-black text-sm">{config.service.name}</p>
                            <p class="text-xs text-zinc-500 font-semibold mt-0.5">
                              Giá chuẩn: {formatCurrency(config.service.defaultRate)} | Loại: {config.service.type}
                            </p>
                          </div>
                          <div class="flex gap-2 items-center">
                            <div class="space-y-1">
                              <span class="text-[9px] text-zinc-400 font-black uppercase block">Giá riêng (đ)</span>
                              <input 
                                type="number" 
                                placeholder="Kế thừa"
                                value={config.customRate}
                                oninput={(e) => {
                                  const val = (e.target as HTMLInputElement).value;
                                  config.customRate = val === '' ? null : Number(val);
                                }}
                                class="border-2 border-black px-2 py-1 text-xs rounded-lg w-24 focus:outline-none bg-white font-bold"
                              />
                            </div>
                            
                            {#if config.service.type !== 'METERED'}
                              <div class="space-y-1">
                                <span class="text-[9px] text-zinc-400 font-black uppercase block">Số lượng</span>
                                <input 
                                  type="number" 
                                  bind:value={config.quantity}
                                  min="1"
                                  class="border-2 border-black px-2 py-1 text-xs rounded-lg w-16 focus:outline-none bg-white font-bold"
                                />
                              </div>
                            {/if}
                          </div>
                        </div>
                      {/each}
                    </div>

                    <div class="flex justify-end pt-3 border-t">
                      <button
                        onclick={() => saveServiceConfig(selectedRoom!.id, selectedRoom!.services.map(s => ({
                          serviceId: s.serviceId,
                          customRate: s.customRate === null ? null : s.customRate.toString(),
                          quantity: s.quantity
                        })))}
                        class="bg-blue-300 text-black border-2 border-black rounded-[6px] shadow-secondary hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all px-4 py-2 text-xs font-black cursor-pointer"
                      >
                        Lưu cấu hình dịch vụ
                      </button>
                    </div>
                  </div>
                </div>

              <!-- METERS TAB -->
              {:else if activeTab === 'meters'}
                <div class="space-y-4">
                  <!-- Log Meter Reading Form -->
                  <div class="bg-white border-2 border-black rounded-lg p-4 space-y-3 shadow-secondary">
                    <h4 class="text-xs font-black text-zinc-500 uppercase tracking-wider border-b pb-1.5">Nhập chỉ số điện/nước mới</h4>
                    <form onsubmit={handleLogMeter} class="space-y-3">
                      <div class="grid grid-cols-2 gap-3">
                        <div class="space-y-1">
                          <label for="m-serv" class="text-[10px] text-zinc-500 font-black uppercase tracking-wider block">Dịch vụ</label>
                          <select 
                            id="m-serv"
                            bind:value={meterServiceId}
                            required
                            class="w-full border-2 border-black px-2.5 py-1.5 text-xs rounded-lg focus:outline-none bg-white font-semibold text-black"
                          >
                            <option value="">-- Chọn dịch vụ --</option>
                            {#each selectedRoom.services.filter(s => s.service.type === 'METERED') as c}
                              <option value={c.serviceId}>{c.service.name}</option>
                            {/each}
                          </select>
                        </div>
                        <div class="space-y-1">
                          <label for="m-month" class="text-[10px] text-zinc-500 font-black uppercase tracking-wider block">Tháng ghi</label>
                          <input 
                            id="m-month"
                            type="month" 
                            bind:value={meterMonth}
                            required
                            class="w-full border-2 border-black px-2.5 py-1.5 text-xs rounded-lg focus:outline-none bg-white font-semibold text-black"
                          />
                        </div>
                      </div>

                      <div class="grid grid-cols-2 gap-3">
                        <div class="space-y-1">
                          <label for="m-prev" class="text-[10px] text-zinc-500 font-black uppercase tracking-wider block">Chỉ số cũ</label>
                          <input 
                            id="m-prev"
                            type="number" 
                            bind:value={meterPrev}
                            required
                            placeholder="Số cũ" 
                            class="w-full border-2 border-black px-2.5 py-1.5 text-xs rounded-lg focus:outline-none bg-white font-black text-black"
                          />
                        </div>
                        <div class="space-y-1">
                          <label for="m-curr" class="text-[10px] text-zinc-500 font-black uppercase tracking-wider block">Chỉ số mới</label>
                          <input 
                            id="m-curr"
                            type="number" 
                            bind:value={meterCurr}
                            required
                            placeholder="Số mới" 
                            class="w-full border-2 border-black px-2.5 py-1.5 text-xs rounded-lg focus:outline-none bg-white font-black text-black"
                          />
                        </div>
                      </div>

                      <div class="flex justify-end pt-2">
                        <button
                          type="submit"
                          disabled={isLoggingMeter}
                          class="bg-blue-300 text-black border-2 border-black rounded-[6px] shadow-secondary hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all px-4 py-2 text-xs font-black cursor-pointer flex items-center gap-1.5"
                        >
                          Ghi chỉ số
                          {#if isLoggingMeter}
                            <Loader2 class="h-3 w-3 animate-spin" />
                          {/if}
                        </button>
                      </div>
                    </form>
                  </div>

                  <!-- Readings History -->
                  <div class="bg-white border-2 border-black rounded-lg p-4 space-y-3 shadow-secondary">
                    <h4 class="text-xs font-black text-zinc-500 uppercase tracking-wider border-b pb-1.5">Lịch sử ghi số</h4>
                    {#if selectedRoom.meterReadings.length === 0}
                      <p class="text-xs text-zinc-400 font-semibold text-center py-2">Chưa có lịch sử đo lường nào.</p>
                    {:else}
                      <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr class="bg-zinc-50 border-b-2 border-black text-zinc-500 font-black uppercase tracking-wider">
                              <th class="px-3 py-2">Tháng</th>
                              <th class="px-3 py-2">Dịch vụ</th>
                              <th class="px-3 py-2">Chỉ số Cũ - Mới</th>
                              <th class="px-3 py-2">Tiêu thụ</th>
                              <th class="px-3 py-2 text-right">Ngày ghi</th>
                            </tr>
                          </thead>
                          <tbody>
                            {#each selectedRoom.meterReadings as read}
                              {@const sName = selectedRoom.services.find(s => s.serviceId === read.serviceId)?.service.name || 'Dịch vụ'}
                              <tr class="border-b border-zinc-150 text-zinc-600 font-semibold">
                                <td class="px-3 py-2 font-black text-black">{read.month}</td>
                                <td class="px-3 py-2 text-zinc-800">{sName}</td>
                                <td class="px-3 py-2">{read.prevValue} → {read.currValue}</td>
                                <td class="px-3 py-2 font-black text-black">{read.currValue - read.prevValue}</td>
                                <td class="px-3 py-2 text-right text-zinc-400">{new Date(read.recordedAt).toLocaleDateString('vi-VN')}</td>
                              </tr>
                            {/each}
                          </tbody>
                        </table>
                      </div>
                    {/if}
                  </div>
                </div>

              <!-- ASSETS TAB -->
              {:else if activeTab === 'assets'}
                <div class="space-y-4">
                  <!-- Add Asset Form -->
                  <div class="bg-white border-2 border-black rounded-lg p-4 space-y-3 shadow-secondary">
                    <h4 class="text-xs font-black text-zinc-500 uppercase tracking-wider border-b pb-1.5">Thêm thiết bị bàn giao mới</h4>
                    <form onsubmit={handleAddAsset} class="space-y-3">
                      <div class="grid grid-cols-2 gap-3">
                        <div class="space-y-1">
                          <label for="a-name" class="text-[10px] text-zinc-500 font-black uppercase block">Tên thiết bị</label>
                          <input 
                            id="a-name"
                            type="text" 
                            bind:value={assetName}
                            required
                            placeholder="Ví dụ: Máy điều hòa LG" 
                            class="w-full border-2 border-black px-2.5 py-1.5 text-xs rounded-lg focus:outline-none bg-white font-bold"
                          />
                        </div>
                        <div class="space-y-1">
                          <label for="a-code" class="text-[10px] text-zinc-500 font-black uppercase block">Mã kiểm kê (Tùy chọn)</label>
                          <input 
                            id="a-code"
                            type="text" 
                            bind:value={assetCode}
                            placeholder="Ví dụ: ML-01" 
                            class="w-full border-2 border-black px-2.5 py-1.5 text-xs rounded-lg focus:outline-none bg-white font-bold"
                          />
                        </div>
                      </div>

                      <div class="grid grid-cols-2 gap-3">
                        <div class="space-y-1">
                          <label for="a-status" class="text-[10px] text-zinc-500 font-black uppercase block">Tình trạng</label>
                          <select 
                            id="a-status"
                            bind:value={assetStatus}
                            class="w-full border-2 border-black px-2.5 py-1.5 text-xs rounded-lg focus:outline-none bg-white font-bold text-black"
                          >
                            <option value="good">Hoạt động tốt</option>
                            <option value="broken">Đã hỏng</option>
                            <option value="need_maintenance">Cần bảo trì</option>
                          </select>
                        </div>
                        <div class="space-y-1">
                          <label for="a-notes" class="text-[10px] text-zinc-500 font-black uppercase block">Ghi chú thêm</label>
                          <input 
                            id="a-notes"
                            type="text" 
                            bind:value={assetNotes}
                            placeholder="Hao mòn nhẹ, mới mua..." 
                            class="w-full border-2 border-black px-2.5 py-1.5 text-xs rounded-lg focus:outline-none bg-white font-bold"
                          />
                        </div>
                      </div>

                      <div class="flex justify-end pt-2">
                        <button
                          type="submit"
                          disabled={isAddingAsset}
                          class="bg-blue-300 text-black border-2 border-black rounded-[6px] shadow-secondary hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all px-4 py-2 text-xs font-black cursor-pointer flex items-center gap-1.5"
                        >
                          Bàn giao thiết bị
                          {#if isAddingAsset}
                            <Loader2 class="h-3 w-3 animate-spin" />
                          {/if}
                        </button>
                      </div>
                    </form>
                  </div>

                  <!-- Assets List -->
                  <div class="bg-white border-2 border-black rounded-lg p-4 space-y-3 shadow-secondary">
                    <h4 class="text-xs font-black text-zinc-500 uppercase tracking-wider border-b pb-1.5">Danh sách thiết bị ({selectedRoom.assets.length})</h4>
                    {#if selectedRoom.assets.length === 0}
                      <p class="text-xs text-zinc-400 font-semibold text-center py-2">Phòng này chưa bàn giao thiết bị nào.</p>
                    {:else}
                      <div class="divide-y divide-zinc-200">
                        {#each selectedRoom.assets as asset}
                          <div class="py-2.5 flex justify-between items-center text-xs font-semibold">
                            <div>
                              <p class="font-black text-black">{asset.name}</p>
                              <p class="text-[10px] text-zinc-400 mt-0.5">Mã: {asset.code || 'không có'} | Ghi chú: {asset.notes || '--'}</p>
                            </div>
                            <div class="flex items-center gap-3">
                              <span class="text-[9px] px-2 py-0.5 rounded-full font-black uppercase border border-black {asset.status === 'good' ? 'bg-green-200 text-green-800' : asset.status === 'broken' ? 'bg-red-200 text-red-800' : 'bg-amber-200 text-amber-800'}">
                                {asset.status === 'good' ? 'Tốt' : asset.status === 'broken' ? 'Hỏng' : 'Bảo trì'}
                              </span>
                              <button
                                onclick={() => handleDeleteAsset(asset.id)}
                                class="text-red-500 hover:bg-red-50 p-1.5 rounded-lg border border-transparent transition-colors cursor-pointer"
                              >
                                <Trash2 class="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        {/each}
                      </div>
                    {/if}
                  </div>
                </div>
              {/if}
            </div>
          </div>

          <!-- Action buttons at bottom -->
          <div class="pt-4 border-t-2 border-black flex gap-3 shrink-0">
            {#if selectedRoom.tenantId}
              <button
                onclick={() => handleCheckout(selectedRoom!.id)}
                class="flex-1 bg-red-200 hover:bg-red-300 text-red-800 border-2 border-black py-2.5 rounded-[6px] text-center text-xs font-black shadow-secondary hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                Khách trả phòng (Checkout)
                <LogOut class="h-4 w-4" />
              </button>
            {/if}
            <button
              onclick={() => isDetailOpen = false}
              class="flex-1 bg-white hover:bg-zinc-150 text-black border-2 border-black py-2.5 rounded-[6px] text-center text-xs font-black shadow-secondary hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  {/if}

</div>

<style>
  @keyframes slide-left {
    from { transform: translateX(100%); }
    to { transform: translateX(0); }
  }
  @keyframes scale-up {
    from { transform: scale(0.95); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }
</style>
