<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { toast } from 'svelte-sonner';
  import { 
    Home, 
    Receipt, 
    Wrench, 
    MessageSquare, 
    LogOut,
    Calendar,
    DollarSign,
    QrCode,
    Camera,
    Check,
    Loader2,
    Pin,
    AlertCircle,
    User,
    X,
    CheckCircle2,
    Zap,
    Droplet
  } from '@lucide/svelte';

  interface InvoiceItem {
    id: string;
    name: string;
    amount: number;
    details: string | null;
  }

  interface Invoice {
    id: string;
    roomNumber: string;
    tenantName: string;
    month: string;
    rentAmount: number;
    totalAmount: number;
    dueDate: string;
    paidDate: string | null;
    status: string; // 'paid' | 'pending'
    paymentProofImage: string | null;
    notes: string | null;
    items: InvoiceItem[];
    room: {
      id: string;
      roomNumber: string;
      property: {
        id: string;
        name: string;
        shortName: string;
        landlord: {
          bankName: string;
          bankCode: string;
          accountNumber: string;
          accountName: string;
        }
      }
    }
  }

  interface MaintenanceRequest {
    id: string;
    title: string;
    description: string;
    status: string;
    priority: string;
    createdAt: string;
    response: string | null;
  }

  interface SpecialNote {
    id: string;
    content: string;
    isRead: boolean;
    createdAt: string;
  }

  interface Announcement {
    id: string;
    title: string;
    content: string;
    isImportant: boolean;
    createdAt: string;
  }

  let tenantId = $state<string | null>(null);
  let tenantName = $state('');
  let isLoading = $state(true);

  // Active navigation tab
  let activeTab = $state<'home' | 'bills' | 'request' | 'note' | 'meters' | 'documents'>('home');

  // Tenant profile & room details
  let roomDetails = $state<{ roomNumber: string; propertyName: string; monthlyRent: number; propertyId: string } | null>(null);

  // Tenant Profile / Documents state
  let tenantProfileId = $state('');
  let tenantIdNumber = $state('');
  let tenantIdFrontImage = $state('');
  let tenantIdBackImage = $state('');
  let tenantVehicleImage = $state('');
  let tenantCheckInImage = $state('');
  let tenantMoveInDate = $state('');
  let tenantDeposit = $state(0);
  let tenantNotes = $state('');
  let isSubmittingDocs = $state(false);

  // Meter form state
  let fullRoomData = $state<any | null>(null);
  let meterServiceId = $state('');
  let meterMonth = $state(new Date().toISOString().slice(0, 7)); // YYYY-MM
  let meterPrev = $state<number>(0);
  let meterCurr = $state('');
  let meterPhotoUrl = $state('');
  let isSubmittingMeter = $state(false);

  // Lists
  let invoices = $state<Invoice[]>([]);
  let requests = $state<MaintenanceRequest[]>([]);
  let notes = $state<SpecialNote[]>([]);
  let announcements = $state<Announcement[]>([]);

  // Selected invoice for payment / VietQR modal
  let payingInvoice = $state<Invoice | null>(null);
  let proofImageUrl = $state('');
  let isSubmittingProof = $state(false);

  // Request form state
  let reqCategory = $state('maintenance');
  let reqTitle = $state('');
  let reqDesc = $state('');
  let reqImage = $state('');
  let reqIsImportant = $state(false);
  let isSubmittingRequest = $state(false);

  // Special note form state
  let noteText = $state('');
  let isSubmittingNote = $state(false);

  $effect(() => {
    if (meterServiceId && fullRoomData) {
      const latestReading = fullRoomData.meterReadings.find((r: any) => r.serviceId === meterServiceId);
      if (latestReading) {
        meterPrev = latestReading.currValue;
      } else {
        meterPrev = 0;
      }
    } else {
      meterPrev = 0;
    }
  });

  async function handleSubmitMeter(e: SubmitEvent) {
    e.preventDefault();
    if (!tenantId || !fullRoomData || isSubmittingMeter) return;

    if (!meterServiceId || !meterMonth || meterCurr === '') {
      toast.error('Vui lòng chọn dịch vụ và nhập chỉ số mới');
      return;
    }

    const currentVal = Number(meterCurr);
    if (currentVal < meterPrev) {
      toast.error(`Chỉ số mới (${currentVal}) không được nhỏ hơn chỉ số cũ (${meterPrev})`);
      return;
    }

    isSubmittingMeter = true;
    try {
      const res = await fetch('/api/rooms', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: fullRoomData.id,
          action: 'updateMeters',
          serviceId: meterServiceId,
          month: meterMonth,
          prevValue: meterPrev,
          currValue: currentVal,
          photoUrl: meterPhotoUrl || null
        })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Lỗi gửi chỉ số điện nước');

      toast.success('Đã gửi chỉ số điện nước thành công!');
      meterCurr = '';
      meterPhotoUrl = '';
      fetchTenantData(tenantId);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      isSubmittingMeter = false;
    }
  }

  async function handleSubmitDocs(e: SubmitEvent) {
    e.preventDefault();
    if (!tenantProfileId || isSubmittingDocs) return;

    if (!tenantIdNumber) {
      toast.error('Vui lòng điền số CCCD');
      return;
    }

    isSubmittingDocs = true;
    try {
      const res = await fetch('/api/tenants', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: tenantProfileId,
          idNumber: tenantIdNumber,
          idFrontImage: tenantIdFrontImage || null,
          idBackImage: tenantIdBackImage || null,
          vehicleImage: tenantVehicleImage || null,
          checkInImage: tenantCheckInImage || null
        })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Lỗi cập nhật giấy tờ');

      toast.success('Cập nhật thông tin giấy tờ thành công!');
      if (tenantId) fetchTenantData(tenantId);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      isSubmittingDocs = false;
    }
  }

  onMount(() => {
    const sessionStr = localStorage.getItem('roomio_user');
    if (!sessionStr) {
      goto('/login');
      return;
    }
    const session = JSON.parse(sessionStr);
    if (session.role !== 'TENANT') {
      toast.error('Bạn không có quyền truy cập cổng khách thuê');
      goto('/login');
      return;
    }
    tenantId = session.tenantProfileId;
    tenantName = session.name;

    fetchTenantData(session.tenantProfileId);
  });

  async function fetchTenantData(tId: string) {
    isLoading = true;
    try {
      // 1. Fetch room details (contains tenant profile & configs & readings)
      const roomRes = await fetch(`/api/rooms?tenantId=${tId}`);
      const roomsData = await roomRes.json();
      if (roomRes.ok && roomsData.length > 0) {
        fullRoomData = roomsData[0];
        
        // Populate roomDetails
        roomDetails = {
          roomNumber: fullRoomData.roomNumber,
          propertyName: fullRoomData.property.name,
          monthlyRent: fullRoomData.monthlyRent,
          propertyId: fullRoomData.propertyId
        };

        // Populate documents state from room.tenant
        if (fullRoomData.tenant) {
          tenantProfileId = fullRoomData.tenant.id;
          tenantIdNumber = fullRoomData.tenant.idNumber || '';
          tenantIdFrontImage = fullRoomData.tenant.idFrontImage || '';
          tenantIdBackImage = fullRoomData.tenant.idBackImage || '';
          tenantVehicleImage = fullRoomData.tenant.vehicleImage || '';
          tenantCheckInImage = fullRoomData.tenant.checkInImage || '';
          tenantMoveInDate = fullRoomData.tenant.moveInDate || '';
          tenantDeposit = fullRoomData.tenant.deposit || 0;
          tenantNotes = fullRoomData.tenant.notes || '';
        }

        // Fetch announcements
        fetchAnnouncements(fullRoomData.propertyId);
      }

      // 2. Fetch invoices
      const invRes = await fetch(`/api/invoices?tenantId=${tId}`);
      const invData = await invRes.json();
      if (invRes.ok) {
        invoices = invData;
        
        // Fallback roomDetails if first invoice is available and room fetch failed/empty
        if (!roomDetails && invoices.length > 0) {
          const firstInv = invoices[0];
          roomDetails = {
            roomNumber: firstInv.roomNumber,
            propertyName: firstInv.room.property.name,
            monthlyRent: firstInv.rentAmount,
            propertyId: firstInv.room.property.id
          };
          fetchAnnouncements(firstInv.room.property.id);
        }
      }

      // 3. Fetch maintenance requests
      const reqRes = await fetch(`/api/requests?tenantId=${tId}`);
      const reqData = await reqRes.json();
      if (reqRes.ok) requests = reqData;

      // 4. Fetch special notes
      const notesRes = await fetch(`/api/notifications?tenantId=${tId}`);
      const notesData = await notesRes.json();
      if (notesRes.ok) notes = notesData;

    } catch (e: any) {
      toast.error('Lỗi khi tải thông tin: ' + e.message);
    } finally {
      isLoading = false;
    }
  }

  async function fetchAnnouncements(propertyId: string) {
    try {
      const res = await fetch(`/api/announcements?targetType=PROPERTY&targetId=${propertyId}`);
      const data = await res.json();
      if (res.ok) announcements = data.slice(0, 3);
    } catch (e) {
      // Ignore
    }
  }

  async function handleSubmitProof(e: SubmitEvent) {
    e.preventDefault();
    if (!payingInvoice || isSubmittingProof) return;

    if (!proofImageUrl) {
      toast.error('Vui lòng nhập đường dẫn ảnh hóa đơn chuyển khoản');
      return;
    }

    isSubmittingProof = true;
    try {
      const res = await fetch(`/api/invoices/${payingInvoice.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'uploadProof',
          paymentProofImage: proofImageUrl
        })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Lỗi gửi hóa đơn chuyển khoản');

      toast.success('Đã gửi hóa đơn thanh toán lên hệ thống, đang chờ chủ nhà xác nhận!');
      payingInvoice = null;
      proofImageUrl = '';
      if (tenantId) fetchTenantData(tenantId);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      isSubmittingProof = false;
    }
  }

  async function handleSubmitRequest(e: SubmitEvent) {
    e.preventDefault();
    if (!tenantId || !roomDetails || isSubmittingRequest) return;

    if (!reqTitle || !reqDesc) {
      toast.error('Vui lòng điền tiêu đề và mô tả chi tiết sự cố');
      return;
    }

    isSubmittingRequest = true;
    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          roomNumber: roomDetails.roomNumber,
          buildingName: roomDetails.propertyName,
          category: reqCategory,
          title: reqTitle,
          description: reqDesc,
          imageUrl: reqImage || null,
          priority: reqIsImportant ? 'important' : 'normal'
        })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Lỗi tạo yêu cầu sự cố');

      toast.success('Đã gửi báo cáo sự cố thành công!');
      reqTitle = '';
      reqDesc = '';
      reqImage = '';
      reqIsImportant = false;
      
      fetchTenantData(tenantId);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      isSubmittingRequest = false;
    }
  }

  async function handleSubmitNote(e: SubmitEvent) {
    e.preventDefault();
    if (!tenantId || isSubmittingNote) return;

    if (!noteText) {
      toast.error('Vui lòng nhập nội dung lời nhắn');
      return;
    }

    isSubmittingNote = true;
    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          content: noteText
        })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Lỗi gửi lời nhắn');

      toast.success('Đã gửi lời nhắn lưu ý tới chủ trọ thành công!');
      noteText = '';
      fetchTenantData(tenantId);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      isSubmittingNote = false;
    }
  }

  function handleLogout() {
    localStorage.removeItem('roomio_user');
    toast.success('Đã đăng xuất tài khoản cư dân');
    goto('/login');
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

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
  }

  // Generate dynamic VietQR image url
  function getVietQRUrl(invoice: Invoice) {
    const ll = invoice.room.property.landlord;
    const amount = invoice.totalAmount;
    const info = `ROOMIO ${invoice.roomNumber} T${invoice.month.replace('-', '')}`;
    return `https://img.vietqr.io/image/${ll.bankCode}-${ll.accountNumber}-compact.png?amount=${amount}&addInfo=${encodeURIComponent(info)}&accountName=${encodeURIComponent(ll.accountName)}`;
  }

  const pendingInvoice = $derived(() => {
    return invoices.find(inv => inv.status !== 'paid');
  });
</script>

<div class="min-h-screen bg-white flex flex-col font-sans relative">

  <!-- Top header: Brutalist header with black border-b-2 -->
  <header class="bg-blue-300 text-black h-16 px-6 border-b-2 border-black flex items-center justify-between sticky top-0 z-40 shadow-sm shrink-0">
    <div class="flex items-center gap-2">
      <div class="bg-white border-2 border-black p-1.5 rounded-lg shadow-secondary">
        <Home class="h-5 w-5 text-black" />
      </div>
      <span class="font-black text-lg">Roomio Cư Dân</span>
    </div>
    
    <button 
      onclick={handleLogout}
      class="flex items-center gap-1.5 bg-white border-2 border-black hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all px-3 py-1.5 rounded-[6px] shadow-secondary text-xs font-bold cursor-pointer"
    >
      Đăng xuất
      <LogOut class="h-4 w-4" />
    </button>
  </header>

  {#if isLoading}
    <div class="flex-1 flex items-center justify-center relative z-10">
      <div class="flex flex-col items-center gap-3">
        <Loader2 class="h-10 w-10 text-black animate-spin" />
        <p class="text-zinc-500 font-bold uppercase tracking-wider text-xs">Đang tải cổng thông tin cư dân...</p>
      </div>
    </div>
  {:else}
    <!-- Shell Wrapper -->
    <main class="flex-grow max-w-4xl w-full mx-auto p-4 space-y-5 pb-28 relative z-10">
      
      <!-- Welcome Header Profile Card - Styled as Brutallist Card -->
      <div class="bg-white border-2 border-black text-black p-6 rounded-lg shadow-secondary relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="absolute inset-0 bg-[linear-gradient(to_right,#00000005_1px,transparent_1px),linear-gradient(to_bottom,#00000005_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none"></div>
        
        <div class="relative z-10 flex items-center gap-4">
          <div class="h-12 w-12 bg-blue-300 border-2 border-black text-black rounded-lg flex items-center justify-center font-black text-lg shrink-0">
            {tenantName.slice(0,1).toUpperCase()}
          </div>
          <div>
            <h2 class="text-xl font-black">Chào cư dân, {tenantName}</h2>
            {#if roomDetails}
              <p class="text-zinc-600 text-sm mt-1 font-bold">
                {roomDetails.propertyName} — Phòng {roomDetails.roomNumber}
              </p>
            {:else}
              <p class="text-red-500 text-sm mt-1 font-bold">Chưa có thông tin bàn giao phòng</p>
            {/if}
          </div>
        </div>

        {#if roomDetails}
          <div class="relative z-10 text-left sm:text-right shrink-0">
            <span class="text-zinc-500 text-xs font-bold uppercase tracking-wider block">Giá phòng thuê</span>
            <span class="text-2xl font-black">{formatCurrency(roomDetails.monthlyRent)}</span>
          </div>
        {/if}
      </div>

      <!-- Pinned Announcements -->
      {#if announcements.length > 0}
        <div class="space-y-2">
          <h3 class="text-xs font-black text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
            <Pin class="h-4 w-4 text-black" />
            Bảng tin thông báo
          </h3>
          <div class="bg-white border-2 border-black rounded-lg shadow-secondary overflow-hidden divide-y-2 divide-black">
            {#each announcements as ann}
              <div class="p-4 bg-white flex flex-col gap-1 hover:bg-slate-50 transition-colors">
                <h4 class="font-black text-black text-sm flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full border border-black {ann.isImportant ? 'bg-red-500 animate-pulse' : 'bg-zinc-400'}"></span>
                  {ann.title}
                </h4>
                <p class="text-zinc-600 text-xs leading-relaxed font-semibold pl-4.5">{ann.content}</p>
              </div>
            {/each}
          </div>
        </div>
      {/if}


      <!-- TAB CONTENTS -->
      <div class="space-y-4">
        <!-- 1. HOME TAB -->
        {#if activeTab === 'home'}
          <div class="space-y-4">
            <!-- Pending Bill Alert Box -->
            {#if pendingInvoice()}
              <div class="bg-white border-2 border-black rounded-lg p-5 shadow-secondary flex flex-col gap-4">
                <div>
                  <h3 class="text-base font-black text-black flex items-center gap-1.5"><Receipt class="h-5 w-5 text-blue-500" /> Hóa đơn cần đóng tháng này</h3>
                  <p class="text-zinc-500 text-xs font-bold mt-1">Hạn nộp: {new Date(pendingInvoice()!.dueDate).toLocaleDateString('vi-VN')}</p>
                  <div class="flex items-baseline gap-2 mt-2">
                    <span class="text-2xl font-black text-black">{formatCurrency(pendingInvoice()!.totalAmount)}</span>
                    {#if pendingInvoice()!.paymentProofImage}
                      <span class="text-[10px] font-black text-amber-800 bg-amber-200 border border-black px-2 py-0.5 rounded-full">Đang chờ đối soát</span>
                    {/if}
                  </div>
                </div>

                <button
                  onclick={() => { payingInvoice = pendingInvoice()!; activeTab = 'bills'; }}
                  class="w-full bg-blue-300 text-black border-2 border-black rounded-[6px] shadow-[4px_4px_0_#000] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none active:translate-x-[4px] active:translate-y-[4px] active:shadow-none py-3 text-sm font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  Quét QR thanh toán <QrCode class="h-4.5 w-4.5" />
                </button>
              </div>
            {:else}
              <div class="bg-white border-2 border-black rounded-lg p-6 shadow-secondary text-center flex flex-col items-center">
                <CheckCircle2 class="h-12 w-12 text-green-500 mb-2" />
                <h3 class="font-black text-black text-base">Đã đóng sạch cước phí nhà!</h3>
                <p class="text-zinc-500 text-xs font-bold mt-1">Cảm ơn bạn! Hệ thống không ghi nhận hóa đơn quá hạn nào.</p>
              </div>
            {/if}

            <!-- General Help quick links -->
            <div class="grid gap-3 grid-cols-2">
              <div class="bg-white border-2 border-black p-4 rounded-lg shadow-secondary flex flex-col gap-2">
                <span class="text-base font-black text-black flex items-center gap-1.5"><Wrench class="h-5 w-5 text-blue-500" /> Sự cố</span>
                <p class="text-xs text-zinc-600 font-semibold leading-relaxed">Báo điện nước, nội thất hỏng để chủ nhà xử lý nhanh.</p>
                <button onclick={() => activeTab = 'request'} class="text-xs font-black text-blue-500 hover:underline text-left bg-transparent border-none p-0 cursor-pointer">Báo ngay →</button>
              </div>

              <div class="bg-white border-2 border-black p-4 rounded-lg shadow-secondary flex flex-col gap-2">
                <span class="text-base font-black text-black flex items-center gap-1.5"><MessageSquare class="h-5 w-5 text-blue-500" /> Lời nhắn</span>
                <p class="text-xs text-zinc-600 font-semibold leading-relaxed">Đề xuất hoặc yêu cầu riêng gửi tới chủ trọ lưu tâm.</p>
                <button onclick={() => activeTab = 'note'} class="text-xs font-black text-blue-500 hover:underline text-left bg-transparent border-none p-0 cursor-pointer">Gửi →</button>
              </div>
            </div>
          </div>

        <!-- 2. BILLS TAB -->
        {:else if activeTab === 'bills'}
          <div class="space-y-4">
            {#if payingInvoice}
              <!-- VietQR Payment Modal Detail -->
              <div class="bg-white border-2 border-black rounded-lg p-5 shadow-secondary space-y-4 animate-[scale-up_0.2s_ease-out]">
                <div class="flex justify-between items-center border-b-2 border-black pb-2">
                  <h3 class="font-black text-black text-sm flex items-center gap-1.5">
                    Thanh Toán Hóa Đơn {payingInvoice.id} <QrCode class="h-4.5 w-4.5" />
                  </h3>
                  <button onclick={() => payingInvoice = null} class="text-black hover:bg-white/40 p-1.5 rounded-lg border border-transparent">
                    <X class="h-4.5 w-4.5" />
                  </button>
                </div>

                <!-- VietQR image + bank info stacked for mobile -->
                <div class="flex flex-col gap-4">
                  <!-- QR code centered -->
                  <div class="border-2 border-black rounded-lg p-3 bg-white shadow-secondary flex flex-col items-center mx-auto">
                    <img 
                      src={getVietQRUrl(payingInvoice)} 
                      alt="VietQR thanh toan" 
                      class="w-52 h-52 object-contain"
                    />
                    <p class="text-[10px] text-zinc-500 mt-2 font-black uppercase tracking-wider">Mở app ngân hàng quét mã</p>
                  </div>

                  <!-- Bank Info -->
                  <div class="text-xs space-y-1.5 border-2 border-black rounded-lg p-3">
                    <p class="text-zinc-500 font-black uppercase tracking-wider text-[10px]">Thông tin tài khoản nhận</p>
                    <p class="font-black text-black">{payingInvoice.room.property.landlord.bankName} ({payingInvoice.room.property.landlord.bankCode})</p>
                    <p class="font-semibold text-black">STK: <span class="font-black">{payingInvoice.room.property.landlord.accountNumber}</span></p>
                    <p class="font-semibold text-black">Tên: <span class="font-black">{payingInvoice.room.property.landlord.accountName}</span></p>
                    <p class="font-black text-indigo-600 text-sm">Số tiền: {formatCurrency(payingInvoice.totalAmount)}</p>
                    <p class="font-mono bg-zinc-50 border-2 border-black px-2 py-1 rounded text-black font-black">
                      Nội dung: ROOMIO {payingInvoice.roomNumber} T{payingInvoice.month.replace('-', '')}
                    </p>
                  </div>

                  <!-- Upload payment proof image form -->
                  <form onsubmit={handleSubmitProof} class="space-y-3">
                    <label for="proof-url" class="text-[10px] text-zinc-500 font-black uppercase tracking-wider block">Dán link ảnh Bill chuyển khoản</label>
                    <div class="relative">
                      <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                        <Camera class="h-4 w-4" />
                      </span>
                      <input 
                        id="proof-url"
                        type="text" 
                        bind:value={proofImageUrl}
                        required
                        placeholder="https://image-storage/bill.jpg"
                        class="w-full border-2 border-black px-3 py-2.5 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-300 pl-9"
                      />
                    </div>
                    
                    <button
                      type="submit"
                      disabled={isSubmittingProof}
                      class="w-full py-3 bg-blue-300 disabled:opacity-50 text-black border-2 border-black rounded-[6px] shadow-[4px_4px_0_#000] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none transition-all text-sm font-black cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      Gửi hóa đơn chứng nhận
                      {#if isSubmittingProof}
                        <Loader2 class="h-3.5 w-3.5 animate-spin" />
                      {/if}
                    </button>
                  </form>
                </div>
              </div>
            {/if}

            <!-- Bills list history -->
            <div class="bg-white border-2 border-black rounded-lg shadow-secondary overflow-hidden">
              <div class="p-5 border-b-2 border-black bg-zinc-100 flex items-center gap-2">
                <Receipt class="h-5 w-5 text-black" />
                <h3 class="font-black text-black text-lg">Lịch sử hóa đơn</h3>
              </div>

              {#if invoices.length === 0}
                <p class="p-8 text-center text-zinc-400 font-bold text-sm bg-white">Chưa có hóa đơn nào được tạo.</p>
              {:else}
                <div class="divide-y-2 divide-black bg-white">
                  {#each invoices as invoice}
                    <!-- Compact invoice card -->
                    <div class="p-4 flex flex-col gap-3">
                      <!-- Top row: property + room, month, badge -->
                      <div class="flex items-start justify-between gap-2">
                        <div>
                          <p class="text-xs font-black text-zinc-500 uppercase tracking-wide">{invoice.room?.property?.name ?? roomDetails?.propertyName ?? ''} · Phòng {invoice.roomNumber}</p>
                          <h4 class="font-black text-black text-sm mt-0.5">Tháng {invoice.month}</h4>
                        </div>
                        <span class="text-[10px] px-2 py-0.5 rounded-full font-black border border-black shrink-0 {invoice.status === 'paid' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}">
                          {invoice.status === 'paid' ? 'Đã đóng' : 'Chưa đóng'}
                        </span>
                      </div>

                      <!-- Amount -->
                      <div class="flex items-baseline gap-2">
                        <span class="text-2xl font-black text-black">{formatCurrency(invoice.totalAmount)}</span>
                        <span class="text-[10px] text-zinc-400 font-bold">Hạn: {new Date(invoice.dueDate).toLocaleDateString('vi-VN')}</span>
                      </div>

                      <!-- Item breakdown (compact) -->
                      {#if invoice.items.length > 0}
                        <div class="text-xs text-zinc-500 font-semibold space-y-0.5">
                          {#each invoice.items as item}
                            <p>• {item.name}: {formatCurrency(item.amount)}</p>
                          {/each}
                        </div>
                      {/if}

                      <!-- Pay button: full-width if unpaid -->
                      {#if invoice.status !== 'paid'}
                        <button
                          onclick={() => { payingInvoice = invoice; window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                          class="w-full py-2.5 bg-blue-300 text-black border-2 border-black rounded-[6px] shadow-[4px_4px_0_#000] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none transition-all text-sm font-black cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <QrCode class="h-4 w-4" /> Thanh toán
                        </button>
                      {:else if invoice.paymentProofImage}
                        <a href={invoice.paymentProofImage} target="_blank" rel="noreferrer" class="text-xs font-black text-blue-500 hover:underline">Xem bill chuyển khoản →</a>
                      {/if}
                    </div>
                  {/each}
                </div>
              {/if}
            </div>
          </div>

        <!-- 3. INCIDENT REPORT TAB -->
        {:else if activeTab === 'request'}
          <div class="space-y-6">
            <!-- Create repair ticket form -->
            <div class="bg-white border-2 border-black p-5 rounded-lg shadow-secondary space-y-4">
              <h3 class="font-black text-black text-base flex items-center gap-2 border-b-2 border-black pb-2">
                Gửi báo cáo sự cố kỹ thuật phòng <Wrench class="h-5 w-5" />
              </h3>

              <form onsubmit={handleSubmitRequest} class="space-y-4">
                <div class="space-y-4">
                  <div class="space-y-1">
                    <label for="req-cat" class="text-xs font-bold text-zinc-600 uppercase tracking-wider block">Phân loại kỹ thuật</label>
                    <select 
                      id="req-cat"
                      bind:value={reqCategory}
                      class="w-full border-2 border-black px-3 py-2.5 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white text-black"
                    >
                      <option value="maintenance">Nội thất/Gia dụng</option>
                      <option value="plumbing">Đường ống nước</option>
                      <option value="electrical">Hệ thống điện</option>
                      <option value="internet">Mạng Wifi/Internet</option>
                      <option value="other">Vấn đề khác</option>
                    </select>
                  </div>
                  <div class="space-y-1">
                    <label for="req-title" class="text-xs font-bold text-zinc-600 uppercase tracking-wider block">Tiêu đề sự cố</label>
                    <input 
                      id="req-title"
                      type="text" 
                      bind:value={reqTitle}
                      required
                      placeholder="Rò rỉ nước nhà tắm / Hỏng máy lạnh..." 
                      class="w-full border-2 border-black px-3 py-2.5 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />
                  </div>
                </div>

                <div class="space-y-1">
                  <label for="req-desc" class="text-xs font-bold text-zinc-600 uppercase tracking-wider block">Mô tả chi tiết vấn đề</label>
                  <textarea 
                    id="req-desc"
                    bind:value={reqDesc}
                    required
                    rows="3"
                    placeholder="Mô tả cụ thể vấn đề giúp thợ sửa dễ hình dung (vị trí hỏng, hiện trạng)..." 
                    class="w-full border-2 border-black px-3 py-2.5 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-300"
                  ></textarea>
                </div>

                <div class="space-y-1">
                  <label for="req-img" class="text-xs font-bold text-zinc-600 uppercase tracking-wider block">Dán link ảnh chụp sự cố (Tùy chọn)</label>
                  <input 
                    id="req-img"
                    type="text" 
                    bind:value={reqImage}
                    placeholder="https://image-storage/broken.jpg" 
                    class="w-full border-2 border-black px-3 py-2.5 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                </div>

                <div class="flex items-center gap-2 select-none font-bold">
                  <input 
                    id="req-imp"
                    type="checkbox" 
                    bind:checked={reqIsImportant}
                    class="h-5 w-5 border-2 border-black text-black rounded focus:ring-blue-300 cursor-pointer"
                  />
                  <label for="req-imp" class="text-red-600 text-sm cursor-pointer">Sự cố khẩn cấp (Cần xử lý gấp)</label>
                </div>

                <div class="pt-3 border-t-2 border-black">
                  <button
                    type="submit"
                    disabled={isSubmittingRequest}
                    class="w-full bg-blue-300 text-black border-2 border-black rounded-[6px] shadow-[4px_4px_0_#000] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none transition-all py-3 text-sm font-black cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    Gửi yêu cầu sửa chữa
                    {#if isSubmittingRequest}
                      <Loader2 class="h-3.5 w-3.5 animate-spin" />
                    {/if}
                  </button>
                </div>
              </form>
            </div>

            <!-- Incidents history list -->
            <div class="bg-white border-2 border-black rounded-lg shadow-secondary overflow-hidden">
              <div class="p-5 border-b-2 border-black bg-zinc-100">
                <h3 class="font-black text-black text-lg">Lịch sử sự cố đã gửi</h3>
              </div>

              {#if requests.length === 0}
                <p class="p-8 text-center text-zinc-400 font-bold text-sm bg-white">Chưa có sự cố nào được ghi nhận.</p>
              {:else}
                <div class="divide-y-2 divide-black bg-white">
                  {#each requests as req}
                    <div class="p-4 space-y-2 hover:bg-slate-50 transition-colors">
                      <div class="flex justify-between items-start">
                        <div>
                          <div class="flex items-center gap-2">
                            <h4 class="font-black text-black text-sm">{req.title}</h4>
                            <span class="text-[9px] px-2 py-0.5 rounded-full font-black uppercase border border-black {req.status === 'completed' ? 'bg-green-150 text-green-800' : req.status === 'in_progress' ? 'bg-white text-blue-800' : req.status === 'rejected' ? 'bg-zinc-100 text-zinc-500' : 'bg-red-50 text-red-800'}">
                              {getStatusLabel(req.status)}
                            </span>
                            {#if req.priority === 'important'}
                              <span class="text-[9px] px-2 py-0.5 bg-red-500 text-white rounded-full font-black uppercase border border-black animate-pulse">Gấp</span>
                            {/if}
                          </div>
                          <p class="text-[10px] text-zinc-400 font-bold mt-1">Ngày gửi: {new Date(req.createdAt).toLocaleDateString('vi-VN')}</p>
                        </div>
                      </div>
                      <p class="text-xs text-zinc-600 font-semibold leading-relaxed">{req.description}</p>
                      
                      <!-- Landlord reply message -->
                      {#if req.response}
                        <div class="bg-blue-50 border-2 border-black p-3 rounded-lg text-xs mt-2 space-y-1">
                          <p class="font-black text-black flex items-center gap-1">
                            Phản hồi của chủ nhà:
                            <User class="h-3.5 w-3.5" />
                          </p>
                          <p class="text-zinc-700 leading-relaxed font-semibold italic">{req.response}</p>
                        </div>
                      {/if}
                    </div>
                  {/each}
                </div>
              {/if}
            </div>
          </div>

        <!-- 5. METERS TAB -->
        {:else if activeTab === 'meters'}
          <div class="space-y-6">
            <div class="bg-white border-2 border-black p-5 rounded-lg shadow-secondary space-y-4">
              <h3 class="font-black text-black text-base flex items-center gap-2 border-b-2 border-black pb-2">
                Báo số điện / số nước cuối tháng <Zap class="h-5 w-5 text-black" />
              </h3>

              {#if !fullRoomData}
                <p class="text-xs text-zinc-500 text-center font-bold py-4">Không tìm thấy thông tin phòng để ghi chỉ số.</p>
              {:else}
                <form onsubmit={handleSubmitMeter} class="space-y-4">
                  <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-1">
                      <label for="tenant-m-serv" class="text-xs font-bold text-zinc-600 uppercase tracking-wider block">Dịch vụ đo lường</label>
                      <select 
                        id="tenant-m-serv"
                        bind:value={meterServiceId}
                        required
                        class="w-full border-2 border-black px-3 py-2 text-xs rounded-lg focus:outline-none bg-white font-semibold text-black"
                      >
                        <option value="">-- Chọn dịch vụ --</option>
                        {#each fullRoomData.services.filter((s: any) => s.service.type === 'METERED') as c}
                          <option value={c.serviceId}>{c.service.name}</option>
                        {/each}
                      </select>
                    </div>
                    <div class="space-y-1">
                      <label for="tenant-m-month" class="text-xs font-bold text-zinc-600 uppercase tracking-wider block">Tháng báo số</label>
                      <input 
                        id="tenant-m-month"
                        type="month" 
                        bind:value={meterMonth}
                        required
                        class="w-full border-2 border-black px-3 py-2 text-xs rounded-lg focus:outline-none bg-white font-semibold text-black"
                      />
                    </div>
                  </div>

                  <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-1">
                      <span class="text-xs font-bold text-zinc-600 uppercase tracking-wider block">Chỉ số cũ (Kỳ trước)</span>
                      <div class="w-full bg-zinc-100 border-2 border-black px-3 py-2 text-xs rounded-lg text-black font-black">
                        {meterPrev}
                      </div>
                    </div>
                    <div class="space-y-1">
                      <label for="tenant-m-curr" class="text-xs font-bold text-zinc-600 uppercase tracking-wider block">Chỉ số mới (Thực tế)</label>
                      <input 
                        id="tenant-m-curr"
                        type="number" 
                        bind:value={meterCurr}
                        required
                        min={meterPrev}
                        placeholder="Nhập số đo thực tế..." 
                        class="w-full border-2 border-black px-3 py-2 text-xs rounded-lg focus:outline-none focus:border-indigo-500 bg-white font-black text-black"
                      />
                    </div>
                  </div>

                  <div class="space-y-1">
                    <label for="tenant-m-photo" class="text-xs font-bold text-zinc-600 uppercase tracking-wider block">Đường dẫn ảnh chụp đồng hồ (Đồng kiểm)</label>
                    <input 
                      id="tenant-m-photo"
                      type="text" 
                      bind:value={meterPhotoUrl}
                      placeholder="Ví dụ: https://img-storage/dongho.jpg" 
                      class="w-full border-2 border-black px-3 py-2 text-xs rounded-lg focus:outline-none bg-white font-semibold text-black"
                    />
                  </div>

                  <div class="pt-3 border-t-2 border-black">
                    <button
                      type="submit"
                      disabled={isSubmittingMeter}
                      class="w-full bg-blue-300 text-black border-2 border-black rounded-[6px] shadow-[4px_4px_0_#000] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none transition-all py-3 text-sm font-black cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      Gửi chỉ số
                      {#if isSubmittingMeter}
                        <Loader2 class="h-3.5 w-3.5 animate-spin" />
                      {/if}
                    </button>
                  </div>
                </form>
              {/if}
            </div>

            <!-- Readings History -->
            <div class="bg-white border-2 border-black rounded-lg shadow-secondary overflow-hidden">
              <div class="p-5 border-b-2 border-black bg-zinc-100">
                <h3 class="font-black text-black text-lg">Lịch sử tự báo số điện nước</h3>
              </div>

              {#if !fullRoomData || fullRoomData.meterReadings.length === 0}
                <p class="p-8 text-center text-zinc-400 font-bold text-sm bg-white">Chưa có lịch sử báo số nào.</p>
              {:else}
                <div class="overflow-x-auto bg-white">
                  <table class="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr class="bg-zinc-50 border-b-2 border-black text-zinc-600 font-black uppercase tracking-wider">
                        <th class="px-4 py-3">Tháng</th>
                        <th class="px-4 py-3">Dịch vụ</th>
                        <th class="px-4 py-3">Chỉ số Cũ → Mới</th>
                        <th class="px-4 py-3">Tiêu thụ</th>
                        <th class="px-4 py-3">Ảnh đồng hồ</th>
                        <th class="px-4 py-3 text-right">Ngày gửi</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-zinc-200">
                      {#each fullRoomData.meterReadings as read}
                        {@const serviceName = fullRoomData.services.find((s: any) => s.serviceId === read.serviceId)?.service.name || 'Điện/Nước'}
                        <tr class="text-zinc-600 font-semibold">
                          <td class="px-4 py-3 font-black text-black">{read.month}</td>
                          <td class="px-4 py-3 text-zinc-800">{serviceName}</td>
                          <td class="px-4 py-3">{read.prevValue} → {read.currValue}</td>
                          <td class="px-4 py-3 font-black text-black">{read.currValue - read.prevValue}</td>
                          <td class="px-4 py-3 text-blue-500 font-bold">
                            {#if read.photoUrl}
                              <a href={read.photoUrl} target="_blank" rel="noreferrer" class="hover:underline">Xem ảnh</a>
                            {:else}
                              <span class="text-zinc-300 font-medium">Không có</span>
                            {/if}
                          </td>
                          <td class="px-4 py-3 text-right text-zinc-400">{new Date(read.recordedAt).toLocaleDateString('vi-VN')}</td>
                        </tr>
                      {/each}
                    </tbody>
                  </table>
                </div>
              {/if}
            </div>
          </div>

        <!-- 6. DOCUMENTS & LEASE TAB -->
        {:else if activeTab === 'documents'}
          <div class="space-y-6">
            <!-- Contract details view -->
            <div class="bg-white border-2 border-black p-5 rounded-lg shadow-secondary space-y-4">
              <h3 class="font-black text-black text-base flex items-center gap-2 border-b-2 border-black pb-2">
                Thông tin Hợp đồng thuê nhà <Calendar class="h-5 w-5 text-black" />
              </h3>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm font-semibold text-black">
                <div class="bg-white p-4 rounded-lg border-2 border-black shadow-secondary">
                  <p class="text-zinc-500 text-xs font-black uppercase tracking-wider">Ngày dọn vào</p>
                  <p class="font-black text-black text-base mt-1">
                    {tenantMoveInDate ? new Date(tenantMoveInDate).toLocaleDateString('vi-VN') : '--'}
                  </p>
                </div>
                <div class="bg-white p-4 rounded-lg border-2 border-black shadow-secondary">
                  <p class="text-zinc-500 text-xs font-black uppercase tracking-wider">Tiền cọc giữ chỗ</p>
                  <p class="font-black text-green-600 text-base mt-1">
                    {formatCurrency(tenantDeposit)}
                  </p>
                </div>
                <div class="bg-white p-4 rounded-lg border-2 border-black shadow-secondary">
                  <p class="text-zinc-500 text-xs font-black uppercase tracking-wider">Phòng đang thuê</p>
                  <p class="font-black text-blue-600 text-base mt-1">
                    {roomDetails ? `Phòng ${roomDetails.roomNumber}` : 'Chưa xếp'}
                  </p>
                </div>
              </div>

              <div class="space-y-1 bg-white p-4 border-2 border-black rounded-lg shadow-secondary">
                <span class="text-xs font-black text-zinc-500 uppercase tracking-wider block">Ghi chú & Thỏa thuận hợp đồng</span>
                <p class="text-zinc-700 text-xs leading-relaxed mt-1 font-bold italic">
                  {tenantNotes || 'Không có thỏa thuận đặc biệt nào ghi trong hợp đồng.'}
                </p>
              </div>
            </div>

            <!-- Documents Upload Form -->
            <div class="bg-white border-2 border-black p-5 rounded-lg shadow-secondary space-y-4">
              <h3 class="font-black text-black text-base flex items-center gap-2 border-b-2 border-black pb-2">
                Đồng bộ giấy tờ tùy thân & Ảnh check-in nhận phòng <Camera class="h-5 w-5 text-black" />
              </h3>

              <form onsubmit={handleSubmitDocs} class="space-y-4">
                <div class="space-y-1">
                  <label for="doc-cccd" class="text-xs font-bold text-zinc-600 uppercase tracking-wider block">Số căn cước công dân (CCCD)</label>
                  <input 
                    id="doc-cccd"
                    type="text" 
                    bind:value={tenantIdNumber}
                    required
                    placeholder="Nhập 12 số CCCD..." 
                    class="w-full border-2 border-black px-3 py-2 text-xs rounded-lg focus:outline-none bg-white font-black text-black"
                  />
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="space-y-1">
                    <label for="doc-cccd-front" class="text-xs font-bold text-zinc-600 uppercase tracking-wider block">Ảnh CCCD mặt trước (Link)</label>
                    <input 
                      id="doc-cccd-front"
                      type="text" 
                      bind:value={tenantIdFrontImage}
                      placeholder="https://image-server/cccd-truoc.jpg" 
                      class="w-full border-2 border-black px-3 py-2 text-xs rounded-lg focus:outline-none bg-white font-semibold text-black animate-[scale-up_0.2s_ease-out]"
                    />
                    {#if tenantIdFrontImage}
                      <img src={tenantIdFrontImage} alt="Mặt trước CCCD" class="mt-2 h-24 object-contain border-2 border-black rounded-lg p-1 bg-white shadow-secondary" />
                    {/if}
                  </div>

                  <div class="space-y-1">
                    <label for="doc-cccd-back" class="text-xs font-bold text-zinc-600 uppercase tracking-wider block">Ảnh CCCD mặt sau (Link)</label>
                    <input 
                      id="doc-cccd-back"
                      type="text" 
                      bind:value={tenantIdBackImage}
                      placeholder="https://image-server/cccd-sau.jpg" 
                      class="w-full border-2 border-black px-3 py-2 text-xs rounded-lg focus:outline-none bg-white font-semibold text-black animate-[scale-up_0.2s_ease-out]"
                    />
                    {#if tenantIdBackImage}
                      <img src={tenantIdBackImage} alt="Mặt sau CCCD" class="mt-2 h-24 object-contain border-2 border-black rounded-lg p-1 bg-white shadow-secondary" />
                    {/if}
                  </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="space-y-1">
                    <label for="doc-car" class="text-xs font-bold text-zinc-600 uppercase tracking-wider block">Ảnh đăng ký xe / Cà vẹt (Nếu có gửi xe)</label>
                    <input 
                      id="doc-car"
                      type="text" 
                      bind:value={tenantVehicleImage}
                      placeholder="https://image-server/cavet.jpg" 
                      class="w-full border-2 border-black px-3 py-2 text-xs rounded-lg focus:outline-none bg-white font-semibold text-black"
                    />
                    {#if tenantVehicleImage}
                      <img src={tenantVehicleImage} alt="Ảnh cà vẹt xe" class="mt-2 h-24 object-contain border-2 border-black rounded-lg p-1 bg-white shadow-secondary animate-[scale-up_0.2s_ease-out]" />
                    {/if}
                  </div>

                  <div class="space-y-1">
                    <label for="doc-checkin" class="text-xs font-bold text-zinc-600 uppercase tracking-wider block">Ảnh bàn giao phòng (Lúc check-in)</label>
                    <input 
                      id="doc-checkin"
                      type="text" 
                      bind:value={tenantCheckInImage}
                      placeholder="https://image-server/checkin-phong.jpg" 
                      class="w-full border-2 border-black px-3 py-2 text-xs rounded-lg focus:outline-none bg-white font-semibold text-black"
                    />
                    {#if tenantCheckInImage}
                      <img src={tenantCheckInImage} alt="Ảnh check-in bàn giao" class="mt-2 h-24 object-contain border-2 border-black rounded-lg p-1 bg-white shadow-secondary animate-[scale-up_0.2s_ease-out]" />
                    {/if}
                  </div>
                </div>

                <div class="pt-3 border-t-2 border-black">
                  <button
                    type="submit"
                    disabled={isSubmittingDocs}
                    class="w-full bg-blue-300 text-black border-2 border-black rounded-[6px] shadow-[4px_4px_0_#000] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none transition-all py-3 text-sm font-black cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    Lưu hồ sơ giấy tờ
                    {#if isSubmittingDocs}
                      <Loader2 class="h-3.5 w-3.5 animate-spin" />
                    {/if}
                  </button>
                </div>
              </form>
            </div>
          </div>

        <!-- 4. SPECIAL NOTES TAB -->
        {:else if activeTab === 'note'}
          <div class="space-y-6">
            <!-- Create note form -->
            <div class="bg-white border-2 border-black p-5 rounded-lg shadow-secondary space-y-4">
              <h3 class="font-black text-black text-base flex items-center gap-2 border-b-2 border-black pb-2">
                Gửi lời nhắn / Đề xuất đặc biệt tới chủ trọ <MessageSquare class="h-5 w-5 text-black" />
              </h3>

              <form onsubmit={handleSubmitNote} class="space-y-3">
                <label for="note-text" class="text-xs font-bold text-zinc-600 uppercase tracking-wider block">Nội dung lời nhắn</label>
                <textarea 
                  id="note-text"
                  bind:value={noteText}
                  required
                  rows="4"
                  placeholder="Ví dụ: Đóng tiền trọ muộn 2 hôm / Đăng ký thêm 1 xe máy..." 
                  class="w-full border-2 border-black p-3 text-xs rounded-lg focus:outline-none bg-white font-semibold text-black"
                ></textarea>

                <div class="pt-3 border-t-2 border-black">
                  <button
                    type="submit"
                    disabled={isSubmittingNote}
                    class="w-full bg-blue-300 text-black border-2 border-black rounded-[6px] shadow-[4px_4px_0_#000] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none transition-all py-3 text-sm font-black cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    Gửi lời nhắn
                    {#if isSubmittingNote}
                      <Loader2 class="h-3.5 w-3.5 animate-spin" />
                    {/if}
                  </button>
                </div>
              </form>
            </div>

            <!-- Notes list history -->
            <div class="bg-white border-2 border-black rounded-lg shadow-secondary overflow-hidden">
              <div class="p-5 border-b-2 border-black bg-zinc-100">
                <h3 class="font-black text-black text-lg">Lời nhắn đã gửi</h3>
              </div>

              {#if notes.length === 0}
                <p class="p-8 text-center text-zinc-400 font-bold text-sm bg-white">Chưa gửi lời nhắn nào.</p>
              {:else}
                <div class="divide-y-2 divide-black bg-white">
                  {#each notes as note}
                    <div class="p-4 space-y-2 hover:bg-slate-50 transition-colors">
                      <div class="flex justify-between items-center text-xs">
                        <span class="text-zinc-400 font-bold">{new Date(note.createdAt).toLocaleString('vi-VN')}</span>
                        <span class="text-[9px] px-2 py-0.5 rounded-full font-black uppercase border border-black {note.isRead ? 'bg-zinc-100 text-zinc-400' : 'bg-blue-200 text-blue-800'}">
                          {note.isRead ? 'Chủ nhà đã xem' : 'Chưa xem'}
                        </span>
                      </div>
                      <p class="text-black text-xs leading-relaxed bg-zinc-50 p-2.5 border-2 border-black rounded-lg font-bold">{note.content}</p>
                    </div>
                  {/each}
                </div>
              {/if}
            </div>
          </div>
        {/if}
      </div>

    </main>

    <!-- Bottom Tab Navigation (mobile-first) -->
    <nav class="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-black z-50 flex items-stretch">
      <button
        onclick={() => activeTab = 'home'}
        class="flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 text-[10px] font-black uppercase tracking-wide cursor-pointer transition-colors {activeTab === 'home' ? 'text-blue-500' : 'text-zinc-400'}"
      >
        <Home class="h-5 w-5" />
        Trang chủ
      </button>
      <button
        onclick={() => activeTab = 'bills'}
        class="flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 text-[10px] font-black uppercase tracking-wide cursor-pointer transition-colors relative {activeTab === 'bills' ? 'text-blue-500' : 'text-zinc-400'}"
      >
        <Receipt class="h-5 w-5" />
        Hóa đơn
        {#if invoices.filter(i => i.status !== 'paid').length > 0}
          <span class="absolute top-1.5 right-3 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        {/if}
      </button>
      <button
        onclick={() => activeTab = 'request'}
        class="flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 text-[10px] font-black uppercase tracking-wide cursor-pointer transition-colors {activeTab === 'request' ? 'text-blue-500' : 'text-zinc-400'}"
      >
        <Wrench class="h-5 w-5" />
        Sự cố
      </button>
      <button
        onclick={() => activeTab = 'meters'}
        class="flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 text-[10px] font-black uppercase tracking-wide cursor-pointer transition-colors {activeTab === 'meters' ? 'text-blue-500' : 'text-zinc-400'}"
      >
        <Zap class="h-5 w-5" />
        Điện nước
      </button>
      <button
        onclick={() => activeTab = 'documents'}
        class="flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 text-[10px] font-black uppercase tracking-wide cursor-pointer transition-colors {activeTab === 'documents' ? 'text-blue-500' : 'text-zinc-400'}"
      >
        <Calendar class="h-5 w-5" />
        Giấy tờ
      </button>
      <button
        onclick={() => activeTab = 'note'}
        class="flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 text-[10px] font-black uppercase tracking-wide cursor-pointer transition-colors {activeTab === 'note' ? 'text-blue-500' : 'text-zinc-400'}"
      >
        <MessageSquare class="h-5 w-5" />
        Lời nhắn
      </button>
    </nav>
  {/if}
</div>

<style>
  @keyframes scale-up {
    from { transform: scale(0.95); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }
</style>
