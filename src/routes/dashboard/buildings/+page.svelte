<script lang="ts">
  import { onMount } from 'svelte';
  import { toast } from 'svelte-sonner';
  import { 
    Building2, 
    Plus, 
    X, 
    MapPin, 
    Home, 
    Trash2, 
    Loader2 
  } from '@lucide/svelte';

  interface Block {
    id: string;
    name: string;
  }

  interface RoomSummary {
    id: string;
    roomNumber: string;
    status: string;
    roomType: string;
    monthlyRent: number;
  }

  interface Property {
    id: string;
    name: string;
    shortName: string;
    address: string;
    blocks: Block[];
    rooms: RoomSummary[];
  }

  let landlordId = $state<string | null>(null);
  let isLoading = $state(true);
  let properties = $state<Property[]>([]);
  let selectedProperty = $state<Property | null>(null);

  // Dialog and drawer states
  let isAddDialogOpen = $state(false);
  let isDetailDrawerOpen = $state(false);

  // Form states
  let name = $state('');
  let shortName = $state('');
  let address = $state('');
  let blocksText = $state(''); // e.g. "Block A, Block B"
  let isSubmitting = $state(false);

  onMount(() => {
    const sessionStr = localStorage.getItem('roomio_user');
    if (!sessionStr) return;
    const session = JSON.parse(sessionStr);
    landlordId = session.landlordProfileId;
    fetchProperties(session.landlordProfileId);
  });

  async function fetchProperties(profileId: string) {
    isLoading = true;
    try {
      const res = await fetch(`/api/properties?landlordId=${profileId}`);
      const data = await res.json();
      if (res.ok) properties = data;
    } catch (e: any) {
      toast.error('Không thể tải danh sách tòa nhà: ' + e.message);
    } finally {
      isLoading = false;
    }
  }

  async function handleAddProperty(e: SubmitEvent) {
    e.preventDefault();
    if (!landlordId || isSubmitting) return;

    if (!name || !shortName || !address) {
      toast.error('Vui lòng điền đầy đủ tên, tên viết tắt và địa chỉ');
      return;
    }

    isSubmitting = true;
    const blocksArray = blocksText
      .split(',')
      .map(b => b.trim())
      .filter(Boolean);

    try {
      const res = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          landlordId,
          name,
          shortName,
          address,
          blocks: blocksArray
        })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Lỗi khi tạo tòa nhà');

      toast.success(`Đã thêm tòa nhà ${name} thành công`);
      isAddDialogOpen = false;
      // Clear forms
      name = '';
      shortName = '';
      address = '';
      blocksText = '';
      // Refresh
      fetchProperties(landlordId);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      isSubmitting = false;
    }
  }

  async function handleDeleteProperty(id: string) {
    if (!confirm('Bạn có chắc chắn muốn xóa tòa nhà này? Tất cả phòng và hóa đơn liên quan sẽ bị xóa!')) return;

    try {
      const res = await fetch(`/api/properties?id=${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Lỗi khi xóa tòa nhà');

      toast.success('Đã xóa tòa nhà thành công');
      isDetailDrawerOpen = false;
      selectedProperty = null;
      if (landlordId) fetchProperties(landlordId);
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  function calculatePropertyStats(rooms: RoomSummary[]) {
    const total = rooms.length;
    const empty = rooms.filter(r => r.status === 'empty').length;
    const debt = rooms.filter(r => r.status === 'debt').length;
    const paid = total - empty - debt;

    return { total, empty, debt, paid };
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
  <!-- Header -->
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
    <div>
      <h1 class="text-xl sm:text-2xl font-black text-black">Danh Sách Tòa Nhà</h1>
      <p class="text-zinc-600 text-sm mt-1 font-bold">{properties.length} tòa nhà, {properties.reduce((sum, p) => sum + p.rooms.length, 0)} phòng trọ</p>
    </div>
    <button 
      onclick={() => isAddDialogOpen = true}
      class="w-full sm:w-auto bg-blue-300 text-black border-2 border-black px-4 py-2.5 rounded-[6px] shadow-secondary hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center justify-center gap-1.5 cursor-pointer font-black text-sm"
    >
      Thêm tòa nhà <Plus class="h-4.5 w-4.5" />
    </button>
  </div>

  {#if isLoading}
    <div class="h-[50vh] w-full flex items-center justify-center">
      <div class="flex flex-col items-center gap-3">
        <Loader2 class="h-10 w-10 text-black animate-spin" />
        <p class="text-zinc-600 font-bold">Đang tải danh sách tòa nhà...</p>
      </div>
    </div>
  {:else if properties.length === 0}
    <div class="bg-white border-2 border-black p-12 rounded-lg text-center max-w-md mx-auto shadow-secondary mt-8">
              <Building2 class="h-8 w-8 text-black" />
      <h3 class="font-black text-black text-lg">Chưa có tòa nhà nào</h3>
      <p class="text-zinc-600 text-sm mt-2 leading-relaxed font-semibold">
        Bắt đầu bằng cách thêm tòa nhà đầu tiên của bạn để thiết lập các phòng trọ, quản lý dịch vụ và tính tiền hàng tháng.
      </p>
      <button 
        onclick={() => isAddDialogOpen = true}
        class="mt-5 bg-blue-300 text-black border-2 border-black px-5 py-2.5 rounded-[6px] text-sm font-black shadow-secondary hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all cursor-pointer"
      >
        Tạo tòa nhà mới
      </button>
    </div>
  {:else}
    <!-- Mobile card list (hidden on sm+) -->
    <div class="sm:hidden border-2 border-black rounded-lg overflow-hidden divide-y-2 divide-black">
      {#each properties as prop}
        {@const stats = calculatePropertyStats(prop.rooms)}
        <!-- Inline stat strip -->
        <div class="p-4 space-y-2">
          <div class="flex justify-between items-start gap-2">
            <div class="min-w-0">
              <h3 class="font-black text-black text-base leading-tight truncate">{prop.name}</h3>
              <p class="text-zinc-500 text-xs mt-0.5 truncate font-semibold">{prop.shortName} · {prop.address}</p>
            </div>
          </div>
          <!-- Compact inline strip -->
          <div class="flex items-center border-2 border-black rounded-lg overflow-hidden divide-x-2 divide-black text-center">
            <div class="flex-1 py-3 px-2">
              <p class="text-base font-black text-black">{stats.total}</p>
              <p class="text-[9px] text-zinc-500 font-bold uppercase">Tổng</p>
            </div>
            <div class="flex-1 py-3 px-2">
              <p class="text-base font-black text-zinc-500">{stats.empty}</p>
              <p class="text-[9px] text-zinc-500 font-bold uppercase">Trống</p>
            </div>
            <div class="flex-1 py-3 px-2">
              <p class="text-base font-black text-green-600">{stats.paid}</p>
              <p class="text-[9px] text-zinc-500 font-bold uppercase">Đã đóng</p>
            </div>
            <div class="flex-1 py-3 px-2">
              <p class="text-base font-black text-red-600">{stats.debt}</p>
              <p class="text-[9px] text-zinc-500 font-bold uppercase">Còn nợ</p>
            </div>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-xs text-zinc-500 font-bold">Lấp đầy: {stats.total > 0 ? Math.round(((stats.total - stats.empty) / stats.total) * 100) : 0}%</span>
            <button
              onclick={() => { selectedProperty = prop; isDetailDrawerOpen = true; }}
              class="bg-blue-300 text-black border-2 border-black px-3 py-1.5 rounded-[6px] text-xs font-black shadow-secondary hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all cursor-pointer"
            >
              Chi tiết
            </button>
          </div>
        </div>
      {/each}
    </div>

    <!-- Desktop grid (hidden on mobile) -->
    <div class="hidden sm:grid gap-6 md:grid-cols-2">
      {#each properties as prop}
        {@const stats = calculatePropertyStats(prop.rooms)}
        <div
          onclick={() => { selectedProperty = prop; isDetailDrawerOpen = true; }}
          onkeydown={(e) => e.key === 'Enter' && (selectedProperty = prop, isDetailDrawerOpen = true)}
          role="button"
          tabindex="0"
          class="bg-white border-2 border-black rounded-lg p-5 shadow-secondary hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          <div class="flex justify-between items-start mb-4">
            <div class="flex items-center gap-3 min-w-0">
              <Building2 class="h-6 w-6 text-blue-500" />
              <div class="min-w-0">
                <h3 class="font-black text-black text-lg leading-tight truncate">{prop.name}</h3>
                <p class="text-zinc-600 text-xs mt-1 truncate font-semibold">{prop.address}</p>
              </div>
            </div>
          </div>

          <!-- Stats mini-table -->
          <div class="grid grid-cols-4 gap-2 text-center py-3 border-y-2 border-black -mx-5 px-5 bg-white font-semibold">
            <div>
              <p class="text-xl font-black text-black">{stats.total}</p>
              <p class="text-[9px] text-zinc-500 font-bold uppercase tracking-wide mt-0.5">Tổng phòng</p>
            </div>
            <div>
              <p class="text-xl font-black text-zinc-500">{stats.empty}</p>
              <p class="text-[9px] text-zinc-500 font-bold uppercase tracking-wide mt-0.5">Còn trống</p>
            </div>
            <div>
              <p class="text-xl font-black text-green-600">{stats.paid}</p>
              <p class="text-[9px] text-zinc-500 font-bold uppercase tracking-wide mt-0.5">Đã đóng</p>
            </div>
            <div>
              <p class="text-xl font-black text-red-600">{stats.debt}</p>
              <p class="text-[9px] text-zinc-500 font-bold uppercase tracking-wide mt-0.5">Còn nợ</p>
            </div>
          </div>

          <div class="flex justify-between items-center mt-4 font-bold">
            <span class="text-xs text-zinc-600 uppercase tracking-wide">Tỷ lệ lấp đầy</span>
            <span class="text-sm text-black font-black">
              {stats.total > 0 ? Math.round(((stats.total - stats.empty) / stats.total) * 100) : 0}%
            </span>
          </div>
        </div>
      {/each}
    </div>
  {/if}

  <!-- Add Property Dialog -->
  {#if isAddDialogOpen}
    <!-- Overlay -->
    <div 
      class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-[fade-in_0.2s_ease-out]"
      onclick={() => isAddDialogOpen = false}
      onkeydown={(e) => e.key === 'Escape' && (isAddDialogOpen = false)}
      role="button"
      tabindex="0"
    >
      <!-- Dialog Content: Brutalist MacOS Window Style -->
      <div 
        class="bg-white rounded-lg w-full max-w-lg border-2 border-black shadow-primary overflow-hidden relative flex flex-col animate-[scale-up_0.2s_ease-out]"
        onclick={(e) => e.stopPropagation()}
        onkeydown={(e) => e.stopPropagation()}
        role="dialog"
      >
        <!-- Header Windows macOS style -->
        <div class="flex items-center gap-2 px-4 py-3 bg-zinc-50 border-b-2 border-black shrink-0 select-none">
          <div class="w-2.5 h-2.5 rounded-full bg-red-500 border border-black"></div>
          <div class="w-2.5 h-2.5 rounded-full bg-yellow-500 border border-black"></div>
          <div class="w-2.5 h-2.5 rounded-full bg-green-500 border border-black"></div>
          <span class="text-xs font-bold text-zinc-500 ml-2">Thêm tòa nhà mới</span>
          <button 
            onclick={() => isAddDialogOpen = false}
            class="ml-auto text-black hover:bg-zinc-200 p-1 border border-transparent rounded-[6px] cursor-pointer"
          >
            <X class="h-4.5 w-4.5" />
          </button>
        </div>

        <form onsubmit={handleAddProperty} class="p-6 space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-1">
              <label for="p-name" class="text-xs font-bold text-zinc-600 uppercase tracking-wider block">Tên tòa nhà</label>
              <input 
                id="p-name"
                type="text" 
                bind:value={name}
                required
                placeholder="Ví dụ: Hoàng Anh Gia Lai" 
                class="w-full border-2 border-black px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white font-semibold text-black"
              />
            </div>
            <div class="space-y-1">
              <label for="p-short" class="text-xs font-bold text-zinc-600 uppercase tracking-wider block">Tên viết tắt</label>
              <input 
                id="p-short"
                type="text" 
                bind:value={shortName}
                required
                placeholder="Ví dụ: HAGL" 
                class="w-full border-2 border-black px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white font-semibold text-black"
              />
            </div>
          </div>

          <div class="space-y-1">
            <label for="p-addr" class="text-xs font-bold text-zinc-600 uppercase tracking-wider block">Địa chỉ</label>
            <input 
              id="p-addr"
              type="text" 
              bind:value={address}
              required
              placeholder="Nhập địa chỉ chi tiết tòa nhà" 
              class="w-full border-2 border-black px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white font-semibold text-black"
            />
          </div>

          <div class="space-y-1">
            <label for="p-blocks" class="text-xs font-bold text-zinc-600 uppercase tracking-wider block">Dãy/Phân cụm (Tùy chọn)</label>
            <input 
              id="p-blocks"
              type="text" 
              bind:value={blocksText}
              placeholder="Ví dụ: Block A, Block B, Khu trọ phía sau" 
              class="w-full border-2 border-black px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white font-semibold text-black"
            />
          </div>

          <div class="flex justify-end gap-3 pt-3">
            <button 
              type="button" 
              onclick={() => isAddDialogOpen = false}
              class="border-2 border-black bg-white hover:bg-zinc-150 text-black px-4 py-2 rounded-[6px] text-sm font-bold transition-all cursor-pointer"
            >
              Hủy
            </button>
            <button 
              type="submit"
              disabled={isSubmitting}
              class="bg-blue-300 hover:bg-blue-400 disabled:opacity-50 text-black border-2 border-black px-4 py-2 rounded-[6px] text-sm font-bold shadow-secondary hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center gap-1.5 cursor-pointer font-black"
            >
              Thêm tòa nhà
              {#if isSubmitting}
                <Loader2 class="h-4 w-4 animate-spin" />
              {/if}
            </button>
          </div>
        </form>
      </div>
    </div>
  {/if}

  <!-- Detail Slide-over Drawer -->
  {#if isDetailDrawerOpen && selectedProperty}
    {@const stats = calculatePropertyStats(selectedProperty.rooms)}
    <!-- Overlay -->
    <div 
      class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex justify-end"
      onclick={() => isDetailDrawerOpen = false}
      onkeydown={(e) => e.key === 'Escape' && (isDetailDrawerOpen = false)}
      role="button"
      tabindex="0"
    >
      <!-- Drawer Content: Brutalist Panel border-l-2 -->
      <div 
        class="bg-white w-full max-w-md h-full border-l-2 border-black shadow-primary flex flex-col justify-between animate-[slide-left_0.2s_ease-out] overflow-hidden"
        onclick={(e) => e.stopPropagation()}
        onkeydown={(e) => e.stopPropagation()}
        role="dialog"
      >
        <!-- Header Windows macOS style -->
        <div class="flex items-center gap-2 px-4 py-3 bg-zinc-50 border-b-2 border-black shrink-0 select-none">
          <div class="w-2.5 h-2.5 rounded-full bg-red-500 border border-black"></div>
          <div class="w-2.5 h-2.5 rounded-full bg-yellow-500 border border-black"></div>
          <div class="w-2.5 h-2.5 rounded-full bg-green-500 border border-black"></div>
          <span class="text-xs font-bold text-zinc-500 ml-2">Chi tiết tòa nhà</span>
          <button 
            onclick={() => isDetailDrawerOpen = false}
            class="ml-auto text-black hover:bg-zinc-200 p-1 border border-transparent rounded-[6px] cursor-pointer"
          >
            <X class="h-4.5 w-4.5" />
          </button>
        </div>

        <div class="p-6 space-y-6 flex-1 overflow-y-auto">
          <!-- Title & basic details -->
          <div class="flex items-center gap-3 border-b-2 border-black pb-4 shrink-0">
                          <Building2 class="h-5 w-5" />
            <div>
              <h3 class="font-black text-black text-lg leading-tight">{selectedProperty.name}</h3>
              <p class="text-zinc-600 text-xs mt-1 font-bold">Mã viết tắt: {selectedProperty.shortName}</p>
            </div>
          </div>

          <!-- Basic Info -->
          <div class="space-y-3">
            <div class="flex justify-between items-start text-xs border-b border-black/15 pb-3 font-semibold">
              <span class="text-zinc-500 flex items-center gap-1.5 shrink-0 uppercase tracking-wide font-bold">
                <MapPin class="h-4 w-4" />
                Địa chỉ:
              </span>
              <span class="font-black text-black text-right pl-4">{selectedProperty.address}</span>
            </div>
          </div>

          <!-- Stats breakdown -->
          <div class="space-y-3">
            <h4 class="text-xs font-black text-zinc-500 uppercase tracking-wider">Thống kê chi tiết phòng</h4>
            <div class="grid grid-cols-3 gap-2 text-center font-semibold text-black">
              <div class="bg-white border-2 border-black p-3 rounded-lg shadow-secondary">
                <p class="text-lg font-black">{stats.total}</p>
                <p class="text-[9px] text-zinc-500 font-bold leading-tight uppercase mt-0.5">Tổng số phòng</p>
              </div>
              <div class="bg-white border-2 border-black p-3 rounded-lg shadow-secondary">
                <p class="text-lg font-black">{stats.total - stats.empty}</p>
                <p class="text-[9px] text-zinc-500 font-bold leading-tight uppercase mt-0.5">Có người ở</p>
              </div>
              <div class="bg-white border-2 border-black p-3 rounded-lg shadow-secondary">
                <p class="text-lg font-black">{stats.empty}</p>
                <p class="text-[9px] text-zinc-500 font-bold leading-tight uppercase mt-0.5">Phòng trống</p>
              </div>
            </div>
          </div>

          <!-- Blocks -->
          {#if selectedProperty.blocks.length > 0}
            <div class="space-y-2">
              <h4 class="text-xs font-black text-zinc-500 uppercase tracking-wider">Các dãy / Phân cụm ({selectedProperty.blocks.length})</h4>
              <div class="flex flex-wrap gap-2">
                {#each selectedProperty.blocks as block}
                  <span class="bg-white border border-black text-black px-3 py-1.5 rounded-lg text-xs font-bold shadow-secondary">
                    {block.name}
                  </span>
                {/each}
              </div>
            </div>
          {/if}

          <!-- Room types breakdown -->
          <div class="space-y-3">
            <h4 class="text-xs font-black text-zinc-500 uppercase tracking-wider">Chi tiết theo loại phòng</h4>
            <div class="divide-y divide-black/15 border-t border-b border-black/15 font-semibold text-black">
              {#each ['standard', 'master', 'balcony'] as type}
                {@const typeRooms = selectedProperty.rooms.filter(r => r.roomType === type)}
                {@const typeStats = calculatePropertyStats(typeRooms)}
                <div class="py-2.5 flex justify-between items-center text-sm">
                  <span class="text-zinc-700">{getRoomTypeLabel(type)}</span>
                  <span class="font-black text-black">
                    {typeRooms.length} phòng (Trống {typeStats.empty})
                  </span>
                </div>
              {/each}
            </div>
          </div>
        </div>

        <!-- Action buttons at bottom -->
        <div class="p-6 border-t-2 border-black bg-zinc-150 flex gap-3 shrink-0">
          <button
            onclick={() => handleDeleteProperty(selectedProperty!.id)}
            class="border-2 border-black bg-red-200 hover:bg-red-300 text-red-800 p-2.5 rounded-[6px] shadow-secondary hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all cursor-pointer"
            title="Xóa tòa nhà"
          >
            <Trash2 class="h-5 w-5" />
          </button>
          <a 
            href="/dashboard/rooms?propertyId={selectedProperty.id}" 
            class="flex-grow bg-blue-300 hover:bg-blue-400 text-black border-2 border-black py-2.5 rounded-[6px] text-center text-sm font-black shadow-secondary hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            Xem & Quản lý phòng <Home class="h-4.5 w-4.5" />
          </a>
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
  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes scale-up {
    from { transform: scale(0.95); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }
</style>
