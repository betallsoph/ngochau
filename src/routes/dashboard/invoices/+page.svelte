<script lang="ts">
  import { onMount } from 'svelte';
  import { toast } from 'svelte-sonner';
  import { 
    Receipt, 
    X, 
    Check, 
    Trash2, 
    Loader2, 
    AlertTriangle,
    Eye,
    Calendar,
    FileText,
    ArrowRight
  } from '@lucide/svelte';

  interface InvoiceItem {
    id: string;
    name: string;
    amount: number;
    details: string | null;
  }

  interface Invoice {
    id: string;
    roomId: string;
    roomNumber: string;
    tenantName: string;
    tenantPhone: string;
    month: string;
    rentAmount: number;
    totalAmount: number;
    dueDate: string;
    paidDate: string | null;
    status: string; // 'paid' | 'pending' | 'overdue' | 'partial'
    paidAmount: number;
    paymentProofImage: string | null;
    createdAt: string;
    notes: string | null;
    items: InvoiceItem[];
    room: {
      property: {
        name: string;
        shortName: string;
      }
    };
  }

  let landlordId = $state<string | null>(null);
  let isLoading = $state(true);
  let invoices = $state<Invoice[]>([]);
  let selectedInvoice = $state<Invoice | null>(null);
  let isDetailOpen = $state(false);

  // Filters
  let statusFilter = $state('');
  let monthFilter = $state('');
  let searchRoom = $state('');

  let isConfirming = $state(false);
  let isDeleting = $state(false);

  onMount(() => {
    const sessionStr = localStorage.getItem('roomio_user');
    if (!sessionStr) return;
    const session = JSON.parse(sessionStr);
    landlordId = session.landlordProfileId;
    fetchInvoices(session.landlordProfileId);
  });

  async function fetchInvoices(profileId: string) {
    isLoading = true;
    try {
      const url = `/api/invoices?landlordId=${profileId}`;
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok) invoices = data;
    } catch (e: any) {
      toast.error('Lỗi khi tải danh sách hóa đơn: ' + e.message);
    } finally {
      isLoading = false;
    }
  }

  async function confirmPayment(invoiceId: string) {
    if (isConfirming) return;
    isConfirming = true;

    try {
      const res = await fetch(`/api/invoices/${invoiceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'confirmPaid' })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Lỗi xác nhận đóng tiền');

      toast.success('Đã xác nhận thanh toán hóa đơn thành công!');
      isDetailOpen = false;
      selectedInvoice = null;
      if (landlordId) fetchInvoices(landlordId);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      isConfirming = false;
    }
  }

  async function deleteInvoice(invoiceId: string) {
    if (!confirm('Bạn có chắc chắn muốn xóa hóa đơn này? Số nợ của phòng sẽ tự động giảm đi.')) return;
    isDeleting = true;

    try {
      const res = await fetch(`/api/invoices/${invoiceId}`, {
        method: 'DELETE'
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Lỗi khi xóa hóa đơn');

      toast.success('Đã xóa hóa đơn thành công');
      isDetailOpen = false;
      selectedInvoice = null;
      if (landlordId) fetchInvoices(landlordId);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      isDeleting = false;
    }
  }

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
  }

  // Filtered invoices computed state
  const filteredInvoices = $derived(() => {
    return invoices.filter(inv => {
      const matchStatus = statusFilter === '' || inv.status === statusFilter;
      const matchMonth = monthFilter === '' || inv.month === monthFilter;
      const matchRoom = searchRoom === '' || inv.roomNumber.toLowerCase().includes(searchRoom.toLowerCase()) || inv.tenantName.toLowerCase().includes(searchRoom.toLowerCase());
      return matchStatus && matchMonth && matchRoom;
    });
  });
</script>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
    <div>
      <h1 class="text-xl sm:text-2xl font-black text-black leading-none">Quản Lý Hóa Đơn</h1>
      <p class="text-zinc-500 text-xs sm:text-sm mt-1 font-bold">Lịch sử xuất hóa đơn và đối soát thanh toán</p>
    </div>
    <a 
      href="/dashboard/invoices/bulk"
      class="bg-blue-300 text-black border-2 border-black px-4 py-2.5 rounded-[6px] shadow-secondary hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center justify-center gap-1.5 cursor-pointer font-black text-sm w-full sm:w-auto"
    >
      Tạo hóa đơn loạt <ArrowRight class="h-4 w-4" />
    </a>
  </div>

  <!-- Filters -->
  <div class="bg-white border-2 border-black p-4 rounded-lg shadow-secondary grid gap-4 sm:grid-cols-3 items-end">
    <div class="space-y-1">
      <span class="text-[10px] font-black text-zinc-500 uppercase tracking-wider block">Trạng thái thanh toán</span>
      <select 
        bind:value={statusFilter}
        class="w-full border-2 border-black px-3 py-2 text-sm rounded-lg focus:outline-none bg-white font-bold text-black"
      >
        <option value="">Tất cả hóa đơn</option>
        <option value="pending">Chưa thanh toán</option>
        <option value="paid">Đã thanh toán</option>
        <option value="overdue">Trễ hạn</option>
      </select>
    </div>

    <div class="space-y-1">
      <span class="text-[10px] font-black text-zinc-500 uppercase tracking-wider block">Lọc theo Tháng</span>
      <input 
        type="month" 
        bind:value={monthFilter}
        class="w-full border-2 border-black px-3 py-2 text-sm rounded-lg focus:outline-none bg-white font-bold text-black"
      />
    </div>

    <div class="space-y-1">
      <span class="text-[10px] font-black text-zinc-500 uppercase tracking-wider block">Tìm theo số phòng/tên khách</span>
      <input 
        type="text" 
        bind:value={searchRoom}
        placeholder="Nhập 101, A2, Tên khách..."
        class="w-full border-2 border-black px-3 py-2 text-sm rounded-lg focus:outline-none bg-white font-bold text-black"
      />
    </div>
  </div>

  {#if isLoading}
    <div class="h-[50vh] w-full flex items-center justify-center">
      <Loader2 class="h-10 w-10 text-black animate-spin" />
    </div>
  {:else if filteredInvoices().length === 0}
    <div class="bg-white border-2 border-black p-12 rounded-lg text-center max-w-md mx-auto shadow-secondary">
      <Receipt class="h-12 w-12 text-black mx-auto mb-3" />
      <h3 class="font-black text-black text-lg">Không tìm thấy hóa đơn nào</h3>
      <p class="text-zinc-500 text-sm mt-2 font-semibold">Không có hóa đơn nào trùng khớp với bộ lọc hiện tại.</p>
    </div>
  {:else}
    <!-- Invoices List -->
    <div class="bg-white border-2 border-black rounded-lg shadow-secondary overflow-hidden">
      <!-- Mobile: card list -->
      <div class="sm:hidden divide-y-2 divide-black">
        {#each filteredInvoices() as invoice}
          <div class="p-4 space-y-2">
            <div class="flex justify-between items-start gap-2">
              <div class="min-w-0">
                <p class="font-black text-black text-sm">{invoice.room.property.shortName} - P.{invoice.roomNumber}</p>
                <p class="text-xs text-zinc-500 font-bold mt-0.5 truncate">{invoice.tenantName} · T.{invoice.month}</p>
              </div>
              <span class="text-sm font-black text-black shrink-0">{formatCurrency(invoice.totalAmount)}</span>
            </div>
            <div class="flex items-center justify-between gap-2">
              <span class="text-[10px] px-2 py-0.5 rounded-full font-black uppercase border border-black shrink-0 {invoice.status === 'paid' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}">
                {invoice.status === 'paid' ? 'Đã đóng' : 'Chưa đóng'}
              </span>
              <button
                onclick={() => { selectedInvoice = invoice; isDetailOpen = true; }}
                class="p-1.5 border-2 border-black bg-white rounded-lg text-black shadow-secondary hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all cursor-pointer"
              >
                <Eye class="h-4 w-4" />
              </button>
            </div>
          </div>
        {/each}
      </div>
      <!-- Desktop: table -->
      <div class="hidden sm:block overflow-x-auto">
        <table class="w-full text-left border-collapse text-sm">
          <thead>
            <tr class="bg-blue-300 border-b-2 border-black text-black font-black uppercase text-xs">
              <th class="px-4 py-3">Mã Hóa Đơn</th>
              <th class="px-4 py-3">Nhà / Phòng</th>
              <th class="px-4 py-3">Khách thuê</th>
              <th class="px-4 py-3">Tháng</th>
              <th class="px-4 py-3">Tổng tiền</th>
              <th class="px-4 py-3">Trạng thái</th>
              <th class="px-4 py-3">Ảnh bill</th>
              <th class="px-4 py-3 text-right">Chi tiết</th>
            </tr>
          </thead>
          <tbody>
            {#each filteredInvoices() as invoice}
              <tr class="border-b border-zinc-200 hover:bg-slate-50 transition-colors text-zinc-600 font-semibold">
                <td class="px-4 py-4 font-mono font-black text-blue-600">{invoice.id}</td>
                <td class="px-4 py-4 font-black text-black">
                  {invoice.room.property.shortName} - {invoice.roomNumber}
                </td>
                <td class="px-4 py-4 text-zinc-800 font-bold">{invoice.tenantName}</td>
                <td class="px-4 py-4 font-bold">{invoice.month}</td>
                <td class="px-4 py-4 font-black text-black">{formatCurrency(invoice.totalAmount)}</td>
                <td class="px-4 py-4">
                  <span class="text-[9px] px-2.5 py-0.5 rounded-full font-black uppercase border border-black {invoice.status === 'paid' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}">
                    {invoice.status === 'paid' ? 'Đã đóng' : 'Chưa đóng'}
                  </span>
                </td>
                <td class="px-4 py-4">
                  {#if invoice.paymentProofImage}
                    <span class="text-[9px] px-2 py-0.5 rounded-full font-black uppercase border border-black bg-amber-200 text-amber-800 flex items-center gap-1 w-fit">
                      <FileText class="h-3 w-3" />
                      Có bill
                    </span>
                  {:else}
                    <span class="text-zinc-400 text-xs">--</span>
                  {/if}
                </td>
                <td class="px-4 py-4 text-right">
                  <button
                    onclick={() => { selectedInvoice = invoice; isDetailOpen = true; }}
                    class="p-1.5 border-2 border-black bg-white hover:bg-zinc-150 rounded-lg text-black transition-colors cursor-pointer shadow-secondary active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                  >
                    <Eye class="h-4 w-4" />
                  </button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  {/if}

  <!-- Detail Dialog Modal -->
  {#if isDetailOpen && selectedInvoice}
    <!-- Overlay -->
    <div 
      class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-[fade-in_0.2s_ease-out]"
      onclick={() => isDetailOpen = false}
      onkeydown={(e) => e.key === 'Escape' && (isDetailOpen = false)}
      role="button"
      tabindex="0"
    >
      <!-- Dialog Content: Brutallist Panel with macOS Header -->
      <div 
        class="bg-white rounded-lg w-full max-w-2xl border-2 border-black shadow-primary overflow-hidden relative flex flex-col max-h-[90vh] animate-[scale-up_0.2s_ease-out]"
        onclick={(e) => e.stopPropagation()}
        onkeydown={(e) => e.stopPropagation()}
        role="dialog"
      >
        <!-- macOS Style Header -->
        <div class="flex items-center gap-2 px-4 py-3 bg-zinc-50 border-b-2 border-black shrink-0 select-none">
          <div class="w-2.5 h-2.5 rounded-full bg-red-500 border border-black"></div>
          <div class="w-2.5 h-2.5 rounded-full bg-yellow-500 border border-black"></div>
          <div class="w-2.5 h-2.5 rounded-full bg-green-500 border border-black"></div>
          <span class="text-xs font-bold text-zinc-500 ml-2">Chi Tiết Hóa Đơn</span>
          <button onclick={() => isDetailOpen = false} class="ml-auto text-black hover:bg-zinc-200 p-1 border border-transparent rounded-[6px]">
            <X class="h-4 w-4" />
          </button>
        </div>

        <div class="p-6 overflow-y-auto space-y-4">
          <!-- Meta info columns -->
          <div class="grid grid-cols-2 gap-4 text-sm bg-white p-4 border-2 border-black rounded-lg shadow-secondary font-semibold text-black">
            <div>
              <p class="text-zinc-500 text-xs font-black uppercase">Tòa nhà / Số phòng</p>
              <p class="font-bold text-black mt-1">{selectedInvoice.room.property.name} - Phòng {selectedInvoice.roomNumber}</p>
            </div>
            <div>
              <p class="text-zinc-500 text-xs font-black uppercase">Khách thuê phòng</p>
              <p class="font-bold text-black mt-1">{selectedInvoice.tenantName} ({selectedInvoice.tenantPhone})</p>
            </div>
            <div>
              <p class="text-zinc-500 text-xs font-black uppercase">Tháng hóa đơn</p>
              <p class="font-bold text-black mt-1 flex items-center gap-1">
                <Calendar class="h-4 w-4 text-zinc-500" />
                Tháng {selectedInvoice.month}
              </p>
            </div>
            <div>
              <p class="text-zinc-500 text-xs font-black uppercase">Hạn đóng tiền</p>
              <p class="font-black text-red-650 mt-1">{new Date(selectedInvoice.dueDate).toLocaleDateString('vi-VN')}</p>
            </div>
          </div>

          <!-- Bill Line Items -->
          <div class="space-y-2">
            <h3 class="text-xs font-black text-zinc-500 uppercase tracking-wider">Các mục thanh toán</h3>
            <div class="border-2 border-black bg-white rounded-lg shadow-secondary overflow-hidden divide-y divide-black/15">
              {#each selectedInvoice.items as item}
                <div class="p-3 flex justify-between items-center text-sm font-semibold">
                  <div>
                    <p class="font-bold text-black">{item.name}</p>
                    {#if item.details}
                      <p class="text-xs text-zinc-500 mt-0.5 font-bold italic">{item.details}</p>
                    {/if}
                  </div>
                  <span class="font-bold text-zinc-800">{formatCurrency(item.amount)}</span>
                </div>
              {/each}
              <!-- Total Row -->
              <div class="p-4 bg-zinc-50 flex justify-between items-center text-sm border-t-2 border-black">
                <span class="font-black text-black text-base">Tổng số tiền cần đóng</span>
                <span class="font-black text-blue-650 text-lg">{formatCurrency(selectedInvoice.totalAmount)}</span>
              </div>
            </div>
          </div>

          <!-- Tenant Submitted Proof -->
          {#if selectedInvoice.paymentProofImage}
            <div class="space-y-2">
              <h3 class="text-xs font-black text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                Ảnh chụp bill thanh toán của khách <AlertTriangle class="h-4 w-4 text-amber-500" />
              </h3>
              <div class="border-2 border-black rounded-lg p-3 bg-amber-50/30 flex flex-col items-center shadow-secondary">
                <img 
                  src={selectedInvoice.paymentProofImage} 
                  alt="Bill thanh toan" 
                  class="max-h-60 rounded-lg object-contain border-2 border-black shadow-secondary bg-white"
                />
                <p class="text-xs text-amber-900 mt-2 font-bold text-center">Khách đã tải bill này lên. Vui lòng đối soát STK trước khi xác nhận.</p>
              </div>
            </div>
          {/if}

          <!-- Actions -->
          <div class="flex gap-3 pt-4 border-t-2 border-black">
            <button
              onclick={() => deleteInvoice(selectedInvoice!.id)}
              disabled={isDeleting}
              class="border-2 border-black bg-red-200 hover:bg-red-350 text-red-800 p-2.5 rounded-[6px] shadow-secondary hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center justify-center cursor-pointer"
              title="Xóa hóa đơn"
            >
              {#if isDeleting}
                <Loader2 class="h-5 w-5 animate-spin" />
              {:else}
                <Trash2 class="h-5 w-5" />
              {/if}
            </button>

            {#if selectedInvoice.status !== 'paid'}
              <button
                onclick={() => confirmPayment(selectedInvoice!.id)}
                disabled={isConfirming}
                class="flex-1 bg-blue-300 hover:bg-blue-400 text-black border-2 border-black py-2.5 rounded-[6px] text-center text-xs font-black shadow-secondary hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                Xác nhận đã nhận tiền (Đóng hóa đơn)
                {#if isConfirming}
                  <Loader2 class="h-4 w-4 animate-spin" />
                {:else}
                  <Check class="h-4.5 w-4.5" />
                {/if}
              </button>
            {:else}
              <div class="flex-1 bg-green-200 border-2 border-black text-green-800 text-center py-2.5 rounded-[6px] text-xs font-black flex items-center justify-center gap-1.5 select-none">
                Hóa đơn đã đóng vào ngày {new Date(selectedInvoice.paidDate!).toLocaleDateString('vi-VN')}
              </div>
            {/if}
          </div>
        </div>
      </div>
    </div>
  {/if}

</div>

<style>
  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes scale-up {
    from { transform: scale(0.95); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }
</style>
