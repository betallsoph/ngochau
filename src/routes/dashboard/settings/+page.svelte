<script lang="ts">
  import { onMount } from 'svelte';
  import { toast } from 'svelte-sonner';
  import { 
    Settings, 
    Landmark, 
    User, 
    Save, 
    Loader2 
  } from '@lucide/svelte';

  let landlordId = $state<string | null>(null);
  let isLoading = $state(true);
  let isSubmitting = $state(false);

  // Form states
  let name = $state('');
  let email = $state('');
  let phone = $state('');
  let companyName = $state('');
  let bankName = $state('');
  let bankCode = $state('');
  let accountNumber = $state('');
  let accountName = $state('');
  let bankBranch = $state('');
  let momoNumber = $state('');

  onMount(() => {
    const sessionStr = localStorage.getItem('roomio_user');
    if (!sessionStr) return;
    const session = JSON.parse(sessionStr);
    landlordId = session.landlordProfileId;
    fetchSettings(session.landlordProfileId);
  });

  async function fetchSettings(profileId: string) {
    isLoading = true;
    try {
      const res = await fetch(`/api/settings?landlordId=${profileId}`);
      const data = await res.json();
      
      if (res.ok) {
        name = data.user.name;
        email = data.user.email;
        phone = data.user.phone;
        companyName = data.companyName || '';
        bankName = data.bankName || '';
        bankCode = data.bankCode || '';
        accountNumber = data.accountNumber || '';
        accountName = data.accountName || '';
        bankBranch = data.bankBranch || '';
        momoNumber = data.momoNumber || '';
      }
    } catch (e: any) {
      toast.error('Lỗi khi tải cấu hình chủ trọ: ' + e.message);
    } finally {
      isLoading = false;
    }
  }

  async function handleSaveSettings(e: SubmitEvent) {
    e.preventDefault();
    if (!landlordId || isSubmitting) return;

    if (!companyName || !bankName || !bankCode || !accountNumber || !accountName) {
      toast.error('Vui lòng điền đầy đủ thông tin ngân hàng nhận tiền chuyển khoản');
      return;
    }

    isSubmitting = true;
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          landlordId,
          companyName,
          bankName,
          bankCode,
          accountNumber,
          accountName,
          bankBranch,
          momoNumber
        })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Lỗi khi cập nhật cấu hình');

      toast.success('Đã lưu cấu hình tài khoản chủ trọ thành công!');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      isSubmitting = false;
    }
  }

  // Pre-configured list of common banks in Vietnam
  const popularBanks = [
    { code: 'VCB', name: 'Vietcombank' },
    { code: 'MB', name: 'MBBank' },
    { code: 'TCB', name: 'Techcombank' },
    { code: 'BIDV', name: 'BIDV' },
    { code: 'CTG', name: 'VietinBank' },
    { code: 'ACB', name: 'ACB' },
    { code: 'VPB', name: 'VPBank' },
    { code: 'TPB', name: 'TPBank' },
    { code: 'VIB', name: 'VIB' }
  ];
</script>

<div class="space-y-6 max-w-4xl">
  <!-- Header -->
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
    <div>
      <h1 class="text-xl sm:text-2xl font-black text-black">Cấu Hình Tài Khoản</h1>
      <p class="text-zinc-650 text-sm mt-1 font-bold">Quản lý thương hiệu dịch vụ và tài khoản nhận thanh toán VietQR động</p>
    </div>
  </div>

  {#if isLoading}
    <div class="h-[40vh] w-full flex items-center justify-center">
      <Loader2 class="h-10 w-10 text-black animate-spin" />
    </div>
  {:else}
    <form onsubmit={handleSaveSettings} class="space-y-6">
      
      <!-- Section 1: User Profile -->
      <div class="bg-white border-2 border-black p-4 sm:p-6 rounded-lg shadow-secondary space-y-4 text-black">
        <h2 class="font-black text-black text-base flex items-center gap-2 border-b-2 border-black pb-2 select-none">
          1. Thông tin cá nhân (Chỉ xem) <User class="h-5 w-5" />
        </h2>
        
        <div class="grid gap-4 sm:grid-cols-3">
          <div class="space-y-1">
            <span class="text-[10px] font-bold text-zinc-600 uppercase tracking-wider block">Họ và tên</span>
            <input 
              type="text" 
              bind:value={name} 
              disabled
              class="w-full border-2 border-black px-3 py-2 text-sm rounded-lg bg-zinc-100 text-zinc-500 font-semibold cursor-not-allowed focus:outline-none"
            />
          </div>
          <div class="space-y-1">
            <span class="text-[10px] font-bold text-zinc-600 uppercase tracking-wider block">Email đăng nhập</span>
            <input 
              type="email" 
              bind:value={email} 
              disabled
              class="w-full border-2 border-black px-3 py-2 text-sm rounded-lg bg-zinc-100 text-zinc-500 font-semibold cursor-not-allowed focus:outline-none"
            />
          </div>
          <div class="space-y-1">
            <span class="text-[10px] font-bold text-zinc-650 uppercase tracking-wider block">Số điện thoại</span>
            <input 
              type="tel" 
              bind:value={phone} 
              disabled
              class="w-full border-2 border-black px-3 py-2 text-sm rounded-lg bg-zinc-100 text-zinc-500 font-semibold cursor-not-allowed focus:outline-none"
            />
          </div>
        </div>
      </div>

      <!-- Section 2: Brand & Bank QR Settings -->
      <div class="bg-white border-2 border-black p-4 sm:p-6 rounded-lg shadow-secondary space-y-4 text-black">
        <h2 class="font-black text-black text-base flex items-center gap-2 border-b-2 border-black pb-2 select-none">
          2. Thương hiệu & VietQR nhận tiền chuyển khoản <Landmark class="h-5 w-5" />
        </h2>
        
        <div class="grid gap-4 sm:grid-cols-2 font-semibold">
          <div class="space-y-1 sm:col-span-2">
            <label for="s-comp" class="text-xs font-bold text-zinc-650 uppercase tracking-wider block">Tên thương hiệu quản lý trọ</label>
            <input 
              id="s-comp"
              type="text" 
              bind:value={companyName} 
              required
              placeholder="Ví dụ: Hệ thống phòng trọ Ngọc Hậu PMS"
              class="w-full border-2 border-black px-3 py-2.5 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white text-black font-semibold"
            />
          </div>

          <div class="space-y-1">
            <label for="s-bcode" class="text-xs font-bold text-zinc-650 uppercase tracking-wider block">Mã Ngân hàng (VietQR)</label>
            <select 
              id="s-bcode"
              bind:value={bankCode} 
              required
              class="w-full border-2 border-black px-3 py-2.5 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white font-semibold text-black"
              onchange={() => {
                const b = popularBanks.find(x => x.code === bankCode);
                if (b) bankName = b.name;
              }}
            >
              <option value="">-- Chọn ngân hàng --</option>
              {#each popularBanks as bank}
                <option value={bank.code}>{bank.name} ({bank.code})</option>
              {/each}
            </select>
          </div>

          <div class="space-y-1">
            <label for="s-bname" class="text-xs font-bold text-zinc-650 uppercase tracking-wider block">Tên ngân hàng chi tiết</label>
            <input 
              id="s-bname"
              type="text" 
              bind:value={bankName} 
              required
              placeholder="Ví dụ: Ngân hàng TMCP Ngoại Thương Việt Nam"
              class="w-full border-2 border-black px-3 py-2.5 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white text-black font-semibold"
            />
          </div>

          <div class="space-y-1">
            <label for="s-acc" class="text-xs font-bold text-zinc-650 uppercase tracking-wider block">Số tài khoản nhận tiền</label>
            <input 
              id="s-acc"
              type="text" 
              bind:value={accountNumber} 
              required
              placeholder="Nhập chính xác số tài khoản ngân hàng"
              class="w-full border-2 border-black px-3 py-2.5 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white text-black font-semibold"
            />
          </div>

          <div class="space-y-1">
            <label for="s-accname" class="text-xs font-bold text-zinc-650 uppercase tracking-wider block">Tên chủ tài khoản (In hoa, không dấu)</label>
            <input 
              id="s-accname"
              type="text" 
              bind:value={accountName} 
              required
              placeholder="Ví dụ: NGUYEN VAN HAU"
              class="w-full border-2 border-black px-3 py-2.5 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white text-black font-semibold"
            />
          </div>

          <div class="space-y-1 sm:col-span-2">
            <label for="s-branch" class="text-xs font-bold text-zinc-650 uppercase tracking-wider block">Chi nhánh ngân hàng (Tùy chọn)</label>
            <input 
              id="s-branch"
              type="text" 
              bind:value={bankBranch} 
              placeholder="Ví dụ: Chi nhánh Nam Sài Gòn"
              class="w-full border-2 border-black px-3 py-2.5 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white text-black font-semibold"
            />
          </div>

          <div class="space-y-1 sm:col-span-2">
            <label for="s-momo" class="text-xs font-bold text-zinc-650 uppercase tracking-wider block">Số Momo nhận tiền (Tùy chọn)</label>
            <input 
              id="s-momo"
              type="text" 
              bind:value={momoNumber} 
              placeholder="Số điện thoại ví Momo, ví dụ: 0901234567"
              class="w-full border-2 border-black px-3 py-2.5 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white text-black font-semibold"
            />
          </div>
        </div>
      </div>

      <!-- Action save -->
      <div class="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          class="bg-blue-300 hover:bg-blue-400 disabled:opacity-50 text-black border-2 border-black px-6 py-3 rounded-[6px] text-sm font-black shadow-primary hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center gap-1.5 cursor-pointer w-full sm:w-auto justify-center"
        >
          Lưu cấu hình tài khoản
          {#if isSubmitting}
            <Loader2 class="h-4.5 w-4.5 animate-spin" />
          {:else}
            <Save class="h-4.5 w-4.5" />
          {/if}
        </button>
      </div>

    </form>
  {/if}
</div>
