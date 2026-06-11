<script lang="ts">
  import { onMount } from 'svelte';
  import { toast } from 'svelte-sonner';
  import { 
    Wrench, 
    X, 
    Check, 
    AlertTriangle,
    Clock,
    User,
    Calendar,
    MessageSquare,
    Loader2
  } from '@lucide/svelte';

  interface Request {
    id: string;
    tenantId: string;
    roomNumber: string;
    buildingName: string;
    category: string; // 'maintenance' | 'plumbing' | 'electrical' | 'internet' | 'other'
    title: string;
    description: string;
    imageUrl: string | null;
    status: string; // 'pending' | 'in_progress' | 'completed' | 'rejected'
    priority: string; // 'important' | 'normal'
    createdAt: string;
    response: string | null;
    tenant: {
      user: {
        name: string;
        phone: string;
      }
    };
  }

  let landlordId = $state<string | null>(null);
  let isLoading = $state(true);
  let requests = $state<Request[]>([]);
  let selectedRequest = $state<Request | null>(null);
  let isDetailOpen = $state(false);

  // Filters
  let statusFilter = $state('');
  let priorityFilter = $state('');

  // Response form states
  let replyText = $state('');
  let isSubmitting = $state(false);

  onMount(() => {
    const sessionStr = localStorage.getItem('roomio_user');
    if (!sessionStr) return;
    const session = JSON.parse(sessionStr);
    landlordId = session.landlordProfileId;
    fetchRequests(session.landlordProfileId);
  });

  async function fetchRequests(profileId: string) {
    isLoading = true;
    try {
      const res = await fetch(`/api/requests?landlordId=${profileId}`);
      const data = await res.json();
      if (res.ok) requests = data;
    } catch (e: any) {
      toast.error('Lỗi khi tải danh sách sự cố: ' + e.message);
    } finally {
      isLoading = false;
    }
  }

  async function updateRequestStatus(requestId: string, status: string) {
    if (isSubmitting) return;
    isSubmitting = true;

    try {
      const res = await fetch('/api/requests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: requestId,
          status,
          response: replyText || undefined
        })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Lỗi khi cập nhật sự cố');

      toast.success(`Đã cập nhật trạng thái sự cố sang: ${getStatusLabel(status)}`);
      isDetailOpen = false;
      selectedRequest = null;
      replyText = '';
      if (landlordId) fetchRequests(landlordId);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      isSubmitting = false;
    }
  }

  function getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      pending: 'Đang chờ',
      in_progress: 'Đang sửa',
      completed: 'Đã xong',
      rejected: 'Từ chối'
    };
    return labels[status] || status;
  }

  function getCategoryLabel(cat: string): string {
    const labels: Record<string, string> = {
      maintenance: 'Nội thất/Gia dụng',
      plumbing: 'Đường nước',
      electrical: 'Hệ thống điện',
      internet: 'Mạng Wifi',
      other: 'Khác'
    };
    return labels[cat] || cat;
  }

  // Filtered requests computed state
  const filteredRequests = $derived(() => {
    return requests.filter(req => {
      const matchStatus = statusFilter === '' || req.status === statusFilter;
      const matchPriority = priorityFilter === '' || req.priority === priorityFilter;
      return matchStatus && matchPriority;
    });
  });
</script>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
    <div>
      <h1 class="text-xl sm:text-2xl font-black text-black">Báo Cáo Sự Cố</h1>
      <p class="text-zinc-650 text-sm mt-1 font-bold">Quản lý và giải quyết các yêu cầu sửa chữa từ khách thuê phòng</p>
    </div>
  </div>

  <!-- Filters -->
  <div class="bg-white border-2 border-black p-4 rounded-lg shadow-secondary">
    <div class="flex gap-4 overflow-x-auto pb-1">
      <div class="space-y-1 shrink-0">
        <span class="text-[10px] font-bold text-zinc-650 uppercase tracking-wider block">Trạng thái sự cố</span>
        <select 
          bind:value={statusFilter}
          class="border-2 border-black px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white font-semibold text-black w-44"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="pending">Đang chờ (Pending)</option>
          <option value="in_progress">Đang sửa (In Progress)</option>
          <option value="completed">Đã xong (Completed)</option>
          <option value="rejected">Từ chối (Rejected)</option>
        </select>
      </div>

      <div class="space-y-1 shrink-0">
        <span class="text-[10px] font-bold text-zinc-650 uppercase tracking-wider block">Mức độ khẩn cấp</span>
        <select 
          bind:value={priorityFilter}
          class="border-2 border-black px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white font-semibold text-black w-44"
        >
          <option value="">Tất cả</option>
          <option value="important">Khẩn cấp / Gấp</option>
          <option value="normal">Bình thường</option>
        </select>
      </div>
    </div>
  </div>

  {#if isLoading}
    <div class="h-[50vh] w-full flex items-center justify-center">
      <Loader2 class="h-10 w-10 text-black animate-spin" />
    </div>
  {:else if filteredRequests().length === 0}
    <div class="bg-white border-2 border-black p-12 rounded-lg text-center max-w-md mx-auto shadow-secondary">
              <Wrench class="h-7 w-7" />
      <h3 class="font-black text-black text-lg">Không có yêu cầu sự cố</h3>
      <p class="text-zinc-650 text-sm mt-2 font-semibold">Tuyệt vời! Hiện tại không ghi nhận sự cố nào từ cư dân.</p>
    </div>
  {:else}
    <!-- Grid of incident cards -->
    <div class="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {#each filteredRequests() as req}
        {@const statusBadge = req.status === 'completed' ? 'bg-green-200 text-green-800' : req.status === 'in_progress' ? 'bg-blue-300 text-black' : req.status === 'rejected' ? 'bg-zinc-200 text-zinc-600' : 'bg-red-200 text-red-800'}

        <div
          onclick={() => { selectedRequest = req; replyText = req.response || ''; isDetailOpen = true; }}
          onkeydown={(e) => e.key === 'Enter' && (selectedRequest = req, replyText = req.response || '', isDetailOpen = true)}
          role="button"
          tabindex="0"
          class="border-2 border-black bg-white p-5 rounded-lg shadow-secondary hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          <div class="flex justify-between items-start gap-2 mb-3">
            <div>
              <span class="text-[10px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider border border-black {statusBadge}">
                {getStatusLabel(req.status)}
              </span>
              {#if req.priority === 'important'}
                <span class="text-[9px] px-2 py-0.5 ml-1.5 rounded-full font-black uppercase bg-red-500 text-black border border-black animate-pulse">
                  Gấp
                </span>
              {/if}
            </div>
            <span class="text-xs text-zinc-650 font-bold shrink-0">{new Date(req.createdAt).toLocaleDateString('vi-VN')}</span>
          </div>

          <h3 class="font-black text-black text-base leading-tight truncate">{req.title}</h3>
          <p class="text-zinc-600 text-xs mt-1 truncate font-semibold">{req.buildingName} - Phòng {req.roomNumber}</p>
          <p class="text-zinc-500 text-xs mt-2 line-clamp-2 leading-relaxed font-semibold">{req.description}</p>

          <div class="border-t border-black/15 mt-4 pt-3 flex items-center justify-between text-xs text-zinc-650">
            <span class="flex items-center gap-1.5 font-bold">
              <User class="h-4 w-4 text-black" />
              {req.tenant.user.name}
            </span>
            <span class="bg-white border border-black text-black px-2 py-1 rounded-lg font-bold text-[9px] uppercase shadow-secondary">
              {getCategoryLabel(req.category)}
            </span>
          </div>
        </div>
      {/each}
    </div>
  {/if}

  <!-- Detail Dialog Drawer slide-over -->
  {#if isDetailOpen && selectedRequest}
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
        class="bg-white w-full max-w-lg h-full border-l-2 border-black shadow-primary flex flex-col justify-between overflow-hidden animate-[slide-left_0.2s_ease-out]"
        onclick={(e) => e.stopPropagation()}
        onkeydown={(e) => e.stopPropagation()}
        role="dialog"
      >
        <!-- Windows Header style -->
        <div class="flex items-center gap-2 px-4 py-3 bg-zinc-50 border-b-2 border-black shrink-0 select-none">
          <div class="w-2.5 h-2.5 rounded-full bg-red-500 border border-black"></div>
          <div class="w-2.5 h-2.5 rounded-full bg-yellow-500 border border-black"></div>
          <div class="w-2.5 h-2.5 rounded-full bg-green-500 border border-black"></div>
          <span class="text-xs font-bold text-zinc-500 ml-2 font-black">Chi tiết sự cố</span>
          <button 
            onclick={() => isDetailOpen = false} 
            class="ml-auto text-black hover:bg-zinc-200 p-1 border border-transparent rounded-[6px] cursor-pointer"
          >
            <X class="h-4.5 w-4.5" />
          </button>
        </div>

        <div class="p-6 space-y-6 flex-1 overflow-y-auto">
          <!-- Drawer Header Details -->
          <div class="flex items-center gap-3 border-b-2 border-black pb-4">
            <Wrench class="h-6 w-6 text-blue-500 shrink-0" />
            <div>
              <h3 class="font-black text-black text-lg leading-tight">Yêu Cầu Sửa Chữa</h3>
              <p class="text-zinc-600 text-xs mt-0.5 font-bold">
                Phòng {selectedRequest.roomNumber} ({selectedRequest.buildingName})
              </p>
            </div>
          </div>

          <!-- Metadata table -->
          <div class="grid grid-cols-2 gap-4 text-xs bg-white p-4 border-2 border-black rounded-lg shadow-secondary text-black font-semibold">
            <div>
              <p class="text-zinc-500 uppercase tracking-wide font-bold text-[9px]">Khách báo sự cố</p>
              <p class="font-black text-black mt-0.5">{selectedRequest.tenant.user.name} ({selectedRequest.tenant.user.phone})</p>
            </div>
            <div>
              <p class="text-zinc-500 uppercase tracking-wide font-bold text-[9px]">Ngày gửi báo cáo</p>
              <p class="font-black text-black mt-0.5 flex items-center gap-1">
                <Calendar class="h-3.5 w-3.5 text-black" />
                {new Date(selectedRequest.createdAt).toLocaleDateString('vi-VN')}
              </p>
            </div>
            <div>
              <p class="text-zinc-500 uppercase tracking-wide font-bold text-[9px]">Danh mục kỹ thuật</p>
              <p class="font-black text-black mt-0.5">{getCategoryLabel(selectedRequest.category)}</p>
            </div>
            <div>
              <p class="text-zinc-500 uppercase tracking-wide font-bold text-[9px]">Mức độ ưu tiên</p>
              <p class="font-black mt-0.5 {selectedRequest.priority === 'important' ? 'text-red-650 animate-pulse' : 'text-black'}">
                {selectedRequest.priority === 'important' ? 'Khẩn cấp / Gấp' : 'Bình thường'}
              </p>
            </div>
          </div>

          <!-- Ticket Content -->
          <div class="space-y-2">
            <h4 class="text-xs font-black text-zinc-500 uppercase tracking-wider">Mô tả sự cố</h4>
            <div class="bg-white border-2 border-black p-4 rounded-lg shadow-secondary space-y-2 text-black">
              <h5 class="font-black text-black text-sm">{selectedRequest.title}</h5>
              <p class="text-zinc-650 text-xs leading-relaxed font-semibold">{selectedRequest.description}</p>
            </div>
          </div>

          <!-- Incident Image -->
          {#if selectedRequest.imageUrl}
            <div class="space-y-2">
              <h4 class="text-xs font-black text-zinc-500 uppercase tracking-wider">Ảnh đính kèm</h4>
              <img 
                src={selectedRequest.imageUrl} 
                alt="Anh su co" 
                class="rounded-lg max-h-64 w-full object-contain border-2 border-black shadow-secondary bg-white"
              />
            </div>
          {/if}

          <!-- Response Reply -->
          <div class="space-y-2">
            <label for="req-reply" class="text-xs font-black text-zinc-650 uppercase tracking-wider block">Phản hồi của chủ nhà / Biên bản sửa chữa</label>
            <textarea
              id="req-reply"
              bind:value={replyText}
              placeholder="Nhập ghi chú sửa chữa, ngày hoàn thành hoặc phản hồi cho cư dân biết..."
              rows="3"
              class="w-full border-2 border-black p-3 text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white font-semibold text-black"
            ></textarea>
          </div>
        </div>

        <!-- Action update footer buttons -->
        <div class="p-4 sm:p-6 border-t-2 border-black bg-zinc-150 flex flex-wrap gap-3 shrink-0">
          <button
            onclick={() => updateRequestStatus(selectedRequest!.id, 'in_progress')}
            disabled={isSubmitting}
            class="flex-1 min-w-[100px] border-2 border-black bg-blue-300 hover:bg-blue-400 text-black py-2.5 rounded-[6px] text-xs font-black shadow-secondary hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all cursor-pointer"
          >
            Đang sửa
          </button>
          
          <button
            onclick={() => updateRequestStatus(selectedRequest!.id, 'completed')}
            disabled={isSubmitting}
            class="flex-grow min-w-[100px] bg-green-200 hover:bg-green-300 text-black border-2 border-black py-2.5 rounded-[6px] text-xs font-black shadow-secondary hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            Đã xong <Check class="h-4 w-4" />
          </button>
          
          <button
            onclick={() => updateRequestStatus(selectedRequest!.id, 'rejected')}
            disabled={isSubmitting}
            class="border-2 border-black bg-red-200 hover:bg-red-300 text-red-800 py-2.5 px-4 rounded-[6px] text-xs font-black shadow-secondary hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all cursor-pointer"
          >
            Từ chối
          </button>
        </div>
      </div>
    </div>
  {/if}

</div>
