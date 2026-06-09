<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { toast } from 'svelte-sonner';
  import { 
    DollarSign, 
    Home, 
    Receipt, 
    Calendar, 
    Check, 
    Loader2, 
    Play, 
    CheckCircle2, 
    User,
    ArrowRight,
    Wrench
  } from '@lucide/svelte';

  interface DashboardStats {
    totalRevenue: number;
    emptyRooms: number;
    unpaidInvoices: number;
    expiringContracts: number;
    totalRooms: number;
    occupiedRooms: number;
  }

  interface Invoice {
    id: string;
    roomNumber: string;
    tenantName: string;
    tenantPhone: string;
    month: string;
    totalAmount: number;
    dueDate: string;
    status: string;
    room: {
      property: {
        shortName: string;
      }
    };
  }

  interface MaintenanceRequest {
    id: string;
    roomNumber: string;
    buildingName: string;
    tenant: {
      user: {
        name: string;
      }
    };
    title: string;
    status: string;
    priority: string;
    createdAt: string;
  }

  let today = $state('');
  let landlordId = $state<string | null>(null);
  let isLoading = $state(true);
  let processingInvoiceId = $state<string | null>(null);

  let stats = $state<DashboardStats>({
    totalRevenue: 0,
    emptyRooms: 0,
    unpaidInvoices: 0,
    expiringContracts: 0,
    totalRooms: 0,
    occupiedRooms: 0
  });

  let unpaidInvoices = $state<Invoice[]>([]);
  let pendingRequests = $state<MaintenanceRequest[]>([]);

  onMount(() => {
    today = new Date().toLocaleDateString('vi-VN', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });

    const sessionStr = localStorage.getItem('roomio_user');
    if (!sessionStr) {
      goto('/login');
      return;
    }
    const session = JSON.parse(sessionStr);
    landlordId = session.landlordProfileId;
    fetchDashboardData(session.landlordProfileId);
  });

  async function fetchDashboardData(profileId: string) {
    isLoading = true;
    try {
      // 1. Fetch dashboard stats
      const statsRes = await fetch(`/api/dashboard/stats?landlordId=${profileId}`);
      const statsData = await statsRes.json();
      if (statsRes.ok) stats = statsData;

      // 2. Fetch pending invoices
      const invRes = await fetch(`/api/invoices?landlordId=${profileId}&status=pending`);
      const invData = await invRes.json();
      if (invRes.ok) unpaidInvoices = invData.slice(0, 5);

      // 3. Fetch requests
      const reqRes = await fetch(`/api/requests?landlordId=${profileId}`);
      const reqData = await reqRes.json();
      if (reqRes.ok) {
        pendingRequests = reqData
          .filter((r: any) => r.status !== 'completed' && r.status !== 'rejected')
          .slice(0, 5);
      }
    } catch (err: any) {
      toast.error('Không thể tải dữ liệu báo cáo: ' + err.message);
    } finally {
      isLoading = false;
    }
  }

  async function confirmInvoicePayment(invoiceId: string) {
    if (processingInvoiceId) return;
    processingInvoiceId = invoiceId;

    try {
      const res = await fetch(`/api/invoices/${invoiceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'confirmPaid' })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Lỗi khi xác nhận đóng tiền');
      }

      toast.success(`Đã xác nhận thanh toán hóa đơn ${invoiceId}`);
      // Refresh
      if (landlordId) fetchDashboardData(landlordId);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      processingInvoiceId = null;
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
      <h1 class="text-xl sm:text-2xl font-black text-black">Cổng Quản Trị Roomio</h1>
      <p class="text-zinc-600 text-xs sm:text-sm mt-1 flex items-center gap-1.5 font-bold">
        Hôm nay, {today} <Calendar class="h-4 w-4 text-zinc-500" />
      </p>
    </div>
    <div class="flex gap-2 sm:gap-3">
      <a 
        href="/dashboard/rooms" 
        class="flex-1 sm:flex-none bg-blue-300 text-black border-2 border-black px-3 sm:px-4 py-2 sm:py-2.5 rounded-[6px] shadow-secondary hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center justify-center gap-1.5 cursor-pointer font-black text-xs sm:text-sm"
      >
        Phòng <ArrowRight class="h-3.5 w-3.5" />
      </a>
      <a 
        href="/dashboard/invoices/bulk" 
        class="flex-1 sm:flex-none bg-green-200 text-black border-2 border-black px-3 sm:px-4 py-2 sm:py-2.5 rounded-[6px] shadow-secondary hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center justify-center gap-1.5 cursor-pointer font-black text-xs sm:text-sm"
      >
        Hoá đơn loạt <Play class="h-3.5 w-3.5" />
      </a>
    </div>
  </div>

  {#if isLoading}
    <div class="h-[60vh] w-full flex items-center justify-center">
      <div class="flex flex-col items-center gap-3">
        <Loader2 class="h-10 w-10 text-black animate-spin" />
        <p class="text-zinc-600 font-bold">Đang tải báo cáo tổng quan...</p>
      </div>
    </div>
  {:else}
    <!-- Stats Cards Grid: 2 cols mobile, 4 cols desktop -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <!-- Card 1: Revenue -->
      <div class="bg-blue-100 border-2 border-black p-3 sm:p-5 rounded-lg shadow-secondary flex items-center gap-3 sm:gap-4 text-black">
        <div class="p-2 sm:p-3 bg-white border-2 border-black text-black rounded-lg shadow-secondary shrink-0">
          <DollarSign class="h-4 w-4 sm:h-6 sm:w-6" />
        </div>
        <div class="min-w-0">
          <p class="text-zinc-600 text-[10px] sm:text-xs font-bold uppercase tracking-wider truncate">Doanh thu</p>
          <h3 class="text-sm sm:text-2xl font-black text-black mt-0.5 sm:mt-1 truncate">{formatCurrency(stats.totalRevenue)}</h3>
        </div>
      </div>

      <!-- Card 2: Occupancy -->
      <div class="bg-blue-100 border-2 border-black p-3 sm:p-5 rounded-lg shadow-secondary flex items-center gap-3 sm:gap-4 text-black">
        <div class="p-2 sm:p-3 bg-white border-2 border-black text-black rounded-lg shadow-secondary shrink-0">
          <Home class="h-4 w-4 sm:h-6 sm:w-6" />
        </div>
        <div class="min-w-0">
          <p class="text-zinc-600 text-[10px] sm:text-xs font-bold uppercase tracking-wider">Tỷ lệ trống</p>
          <h3 class="text-sm sm:text-xl font-black text-black mt-0.5 sm:mt-1">
            {stats.emptyRooms}/{stats.totalRooms}
            <span class="text-[10px] sm:text-xs font-bold text-zinc-500 block">
              Lấp đầy {stats.totalRooms > 0 ? Math.round((stats.occupiedRooms / stats.totalRooms) * 100) : 0}%
            </span>
          </h3>
        </div>
      </div>

      <!-- Card 3: Unpaid Bills -->
      <div class="bg-blue-100 border-2 border-black p-3 sm:p-5 rounded-lg shadow-secondary flex items-center gap-3 sm:gap-4 text-black">
        <div class="p-2 sm:p-3 bg-white border-2 border-black text-black rounded-lg shadow-secondary shrink-0">
          <Receipt class="h-4 w-4 sm:h-6 sm:w-6" />
        </div>
        <div class="min-w-0">
          <p class="text-zinc-600 text-[10px] sm:text-xs font-bold uppercase tracking-wider">Chưa đóng</p>
          <h3 class="text-sm sm:text-2xl font-black text-black mt-0.5 sm:mt-1">{stats.unpaidInvoices} HĐ</h3>
        </div>
      </div>

      <!-- Card 4: Expiring Contracts -->
      <div class="bg-blue-100 border-2 border-black p-3 sm:p-5 rounded-lg shadow-secondary flex items-center gap-3 sm:gap-4 text-black">
        <div class="p-2 sm:p-3 bg-white border-2 border-black text-black rounded-lg shadow-secondary shrink-0">
          <Calendar class="h-4 w-4 sm:h-6 sm:w-6" />
        </div>
        <div class="min-w-0">
          <p class="text-zinc-600 text-[10px] sm:text-xs font-bold uppercase tracking-wider">Sắp hết HĐ</p>
          <h3 class="text-sm sm:text-2xl font-black text-black mt-0.5 sm:mt-1">{stats.expiringContracts}</h3>
        </div>
      </div>
    </div>

    <!-- Main Lists Section -->
    <div class="grid gap-6 lg:grid-cols-3">
      <!-- Left 2 Columns: Unpaid Invoices -->
      <div class="lg:col-span-2 bg-blue-100 border-2 border-black rounded-lg shadow-secondary flex flex-col overflow-hidden">
        <div class="p-4 border-b-2 border-black bg-zinc-100 flex items-center justify-between shrink-0">
          <h2 class="font-black text-black text-base flex items-center gap-2">
            Hoá đơn cần thu tiền <Receipt class="h-5 w-5" />
          </h2>
          <a href="/dashboard/invoices" class="text-xs font-black text-blue-500 hover:underline flex items-center gap-1">
            Xem tất cả <ArrowRight class="h-3.5 w-3.5" />
          </a>
        </div>

        {#if unpaidInvoices.length === 0}
          <div class="flex-1 p-8 flex flex-col items-center justify-center text-center bg-white">
            <CheckCircle2 class="h-12 w-12 text-green-500 mb-2" />
            <p class="font-black text-black text-base">Tất cả sạch nợ!</p>
            <p class="text-zinc-500 text-xs font-semibold mt-1">Không có hoá đơn nào đang nợ hoặc chưa đóng.</p>
          </div>
        {:else}
          <!-- Mobile: card list view -->
          <div class="sm:hidden divide-y-2 divide-black bg-white">
            {#each unpaidInvoices as invoice}
              <div class="p-4 space-y-2">
                <div class="flex justify-between items-start gap-2">
                  <div class="min-w-0">
                    <p class="font-black text-black text-sm">{invoice.room.property.shortName} - P.{invoice.roomNumber}</p>
                    <p class="text-xs text-zinc-500 font-bold mt-0.5 truncate">{invoice.tenantName} · T.{invoice.month}</p>
                  </div>
                  <span class="text-sm font-black text-black shrink-0">{formatCurrency(invoice.totalAmount)}</span>
                </div>
                <div class="flex items-center justify-between gap-2">
                  <span class="text-[10px] px-2 py-0.5 rounded-full font-bold bg-red-100 border border-black text-red-800 shrink-0">
                    HN: {new Date(invoice.dueDate).toLocaleDateString('vi-VN')}
                  </span>
                  <button
                    onclick={() => confirmInvoicePayment(invoice.id)}
                    disabled={processingInvoiceId === invoice.id}
                    class="px-3 py-1.5 bg-green-200 disabled:opacity-50 text-black border-2 border-black rounded-[6px] shadow-secondary hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center gap-1 cursor-pointer font-black text-xs"
                  >
                    {#if processingInvoiceId === invoice.id}
                      <Loader2 class="h-3 w-3 animate-spin" />
                    {:else}
                      Xác nhận <Check class="h-3 w-3" />
                    {/if}
                  </button>
                </div>
              </div>
            {/each}
          </div>
          <!-- Desktop: table view -->
          <div class="hidden sm:block overflow-x-auto bg-white">
            <table class="w-full text-left border-collapse text-sm">
              <thead>
                <tr class="bg-blue-300 border-b-2 border-black text-black font-black uppercase text-xs">
                  <th class="px-4 py-3">Phòng</th>
                  <th class="px-4 py-3">Khách thuê</th>
                  <th class="px-4 py-3">Tháng</th>
                  <th class="px-4 py-3">Số tiền</th>
                  <th class="px-4 py-3">Hạn thanh toán</th>
                  <th class="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {#each unpaidInvoices as invoice}
                  <tr class="border-b border-black/15 hover:bg-slate-50 transition-all font-semibold">
                    <td class="px-4 py-4 font-black text-black">
                      {invoice.room.property.shortName} - {invoice.roomNumber}
                    </td>
                    <td class="px-4 py-4">
                      <div>
                        <p class="font-black text-black text-sm">{invoice.tenantName}</p>
                        <p class="text-xs text-zinc-500 font-bold">{invoice.tenantPhone}</p>
                      </div>
                    </td>
                    <td class="px-4 py-4 font-bold">{invoice.month}</td>
                    <td class="px-4 py-4 font-black text-black">{formatCurrency(invoice.totalAmount)}</td>
                    <td class="px-4 py-4">
                      <span class="text-xs px-2.5 py-0.5 rounded-full font-bold bg-red-100 border border-black text-red-800">
                        {new Date(invoice.dueDate).toLocaleDateString('vi-VN')}
                      </span>
                    </td>
                    <td class="px-4 py-4 text-right">
                      <button
                        onclick={() => confirmInvoicePayment(invoice.id)}
                        disabled={processingInvoiceId === invoice.id}
                        class="px-3 py-1.5 bg-green-200 hover:bg-green-300 disabled:opacity-50 text-black border-2 border-black rounded-[6px] shadow-secondary hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center justify-center ml-auto gap-1 cursor-pointer font-black text-xs"
                      >
                        Xác nhận đóng
                        {#if processingInvoiceId === invoice.id}
                          <Loader2 class="h-3 w-3 animate-spin" />
                        {:else}
                          <Check class="h-3.5 w-3.5" />
                        {/if}
                      </button>
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        {/if}
      </div>

      <!-- Right Column: Pending Incidents -->
      <div class="bg-blue-100 border-2 border-black rounded-lg shadow-secondary flex flex-col overflow-hidden">
        <div class="p-4 border-b-2 border-black bg-zinc-100 flex items-center justify-between shrink-0">
          <h2 class="font-black text-black text-base flex items-center gap-2">
            Sự cố cần xử lý <Wrench class="h-5 w-5" />
          </h2>
          <a href="/dashboard/requests" class="text-xs font-black text-blue-500 hover:underline flex items-center gap-1">
            Xem tất cả <ArrowRight class="h-3.5 w-3.5" />
          </a>
        </div>

        {#if pendingRequests.length === 0}
          <div class="flex-1 p-8 flex flex-col items-center justify-center text-center bg-white">
            <CheckCircle2 class="h-12 w-12 text-green-500 mb-2" />
            <p class="font-black text-black text-base">Không có sự cố nào!</p>
            <p class="text-zinc-500 text-xs font-semibold mt-1">Nhà trọ vận hành êm đẹp, chưa ghi nhận vấn đề.</p>
          </div>
        {:else}
          <div class="divide-y-2 divide-black flex-1 overflow-y-auto bg-white">
            {#each pendingRequests as req}
              <div class="p-4 hover:bg-slate-50 transition-all flex flex-col gap-2 font-semibold">
                <div class="flex items-start justify-between gap-3">
                  <div>
                    <h4 class="font-black text-black text-sm">{req.title}</h4>
                    <p class="text-xs text-zinc-500 font-bold mt-0.5">{req.buildingName} - Phòng {req.roomNumber}</p>
                  </div>
                  <span class="text-[10px] px-2 py-0.5 rounded-full font-black uppercase border border-black {req.priority === 'important' ? 'bg-red-200 text-red-800' : 'bg-zinc-150 text-zinc-700'}">
                    {req.priority === 'important' ? 'Khẩn cấp' : 'Thường'}
                  </span>
                </div>
                <div class="flex items-center justify-between text-xs text-zinc-500 font-bold mt-1">
                  <span class="flex items-center gap-1">
                    <User class="h-3.5 w-3.5" />
                    {req.tenant.user.name}
                  </span>
                  <span>{new Date(req.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>
                <div class="flex gap-2 mt-2">
                  <a 
                    href="/dashboard/requests" 
                    class="px-3 py-1.5 bg-blue-300 hover:bg-blue-400 text-black border-2 border-black rounded-[6px] shadow-secondary hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all text-xs font-black text-center flex items-center justify-center gap-1.5 cursor-pointer w-full"
                  >
                    Chi tiết & Phân công <ArrowRight class="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </div>
  {/if}
</div>
