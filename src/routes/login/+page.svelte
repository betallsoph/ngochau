<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { toast } from 'svelte-sonner';
  import { KeyRound, Mail, Phone, User, Landmark, Loader2, ArrowRight } from '@lucide/svelte';

  // Toggle state
  let isRegister = $state(false);

  // Form inputs
  let email = $state('');
  let phone = $state('');
  let name = $state('');
  let password = $state('');
  let confirmPassword = $state('');

  // Loading indicator
  let isLoading = $state(false);

  onMount(() => {
    // If user is already logged in, redirect immediately
    const sessionStr = localStorage.getItem('roomio_user');
    if (sessionStr) {
      try {
        const session = JSON.parse(sessionStr);
        if (session.role === 'SUPER_ADMIN') goto('/super-admin');
        else if (session.role === 'LANDLORD') goto('/dashboard');
        else if (session.role === 'TENANT') goto('/tenant');
      } catch (e) {
        localStorage.removeItem('roomio_user');
      }
    }
  });

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (isLoading) return;

    if (isRegister) {
      // Register validation
      if (!email || !phone || !password || !name) {
        toast.error('Vui lòng điền đầy đủ tất cả thông tin');
        return;
      }
      if (password !== confirmPassword) {
        toast.error('Mật khẩu nhập lại không trùng khớp');
        return;
      }
      if (password.length < 6) {
        toast.error('Mật khẩu phải dài ít nhất 6 ký tự');
        return;
      }

      isLoading = true;
      try {
        const res = await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'register',
            email,
            phone,
            password,
            name,
            role: 'LANDLORD' // Landlords sign up here
          })
        });
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.error || 'Lỗi đăng ký tài khoản');
        }

        toast.success('Đăng ký tài khoản chủ trọ thành công!');
        // Save session and redirect
        localStorage.setItem('roomio_user', JSON.stringify(data));
        goto('/dashboard');
      } catch (err: any) {
        toast.error(err.message);
      } finally {
        isLoading = false;
      }
    } else {
      // Login validation
      if (!email && !phone) {
        toast.error('Vui lòng nhập Email hoặc Số điện thoại');
        return;
      }
      if (!password) {
        toast.error('Vui lòng nhập mật khẩu');
        return;
      }

      isLoading = true;
      try {
        const res = await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'login',
            email: email.includes('@') ? email : undefined,
            phone: !email.includes('@') ? email : undefined,
            password
          })
        });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Tài khoản hoặc mật khẩu không đúng');
        }

        toast.success(`Chào mừng trở lại, ${data.name}!`);
        localStorage.setItem('roomio_user', JSON.stringify(data));

        if (data.role === 'SUPER_ADMIN') {
          goto('/super-admin');
        } else if (data.role === 'LANDLORD') {
          goto('/dashboard');
        } else if (data.role === 'TENANT') {
          goto('/tenant');
        }
      } catch (err: any) {
        toast.error(err.message);
      } finally {
        isLoading = false;
      }
    }
  }
</script>

<div class="min-h-screen w-screen flex flex-col md:flex-row bg-slate-50 overflow-hidden font-sans relative">
  <!-- Interactive Grid Background -->
  <div class="absolute inset-0 opacity-[0.05] pointer-events-none bg-[radial-gradient(circle_at_1px_1px,black_1px,transparent_0)] bg-[size:16px_16px]"></div>

  <!-- Left Panel: Brutallist Graphic Branding -->
  <div class="hidden md:flex md:w-1/2 bg-white border-r-2 border-black flex-col justify-between p-12 relative">
    <div class="absolute inset-0 bg-[linear-gradient(to_right,#0000000a_1px,transparent_1px),linear-gradient(to_bottom,#0000000a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
    
    <div class="flex items-center gap-3 relative z-10">
      <div class="bg-blue-300 border-2 border-black p-2.5 rounded-lg shadow-secondary">
        <Landmark class="h-6 w-6 text-black" />
      </div>
      <span class="text-2xl font-black tracking-tight text-black">Roomio</span>
    </div>

    <div class="space-y-6 relative z-10 max-w-lg">
      <h1 class="text-4xl lg:text-5xl font-black leading-none text-black">
        Quản lý nhà trọ & căn hộ dịch vụ hiệu quả.
      </h1>
      <p class="text-zinc-600 text-base leading-relaxed font-semibold">
        Phần mềm quản trị vận hành tối ưu cho cả chủ nhà và khách thuê. Tự động hoá hoá đơn, báo cáo chỉ số điện nước, quản lý sự cố và chuyển khoản VietQR tiện lợi.
      </p>
    </div>

    <div class="text-zinc-500 text-xs relative z-10 font-bold uppercase tracking-wider">
      © 2026 Roomio Inc. All rights reserved.
    </div>
  </div>

  <!-- Right Panel: Authentication Form -->
  <div class="flex-1 flex items-center justify-center p-6 md:p-12 relative">
    
    <!-- Brutallist login window panel -->
    <div class="w-full max-w-md bg-white border-2 border-black rounded-lg shadow-primary overflow-hidden flex flex-col">
      <!-- macOS style header window -->
      <div class="flex items-center gap-2 px-4 py-3 bg-zinc-50 border-b-2 border-black shrink-0 select-none">
        <div class="w-2.5 h-2.5 rounded-full bg-red-500 border border-black"></div>
        <div class="w-2.5 h-2.5 rounded-full bg-yellow-500 border border-black"></div>
        <div class="w-2.5 h-2.5 rounded-full bg-green-500 border border-black"></div>
        <span class="text-xs font-bold text-zinc-500 ml-2">Roomio Window System</span>
      </div>

      <div class="p-6 md:p-8 flex-1 flex flex-col justify-center">
        <!-- Title -->
        <div class="text-center mb-6">
          <div class="flex justify-center md:hidden items-center gap-2 mb-4">
            <div class="bg-blue-300 border-2 border-black p-2 rounded-lg shadow-secondary">
              <Landmark class="h-5 w-5 text-black" />
            </div>
            <span class="text-xl font-black text-black tracking-tight">Roomio</span>
          </div>
          <h2 class="text-2xl font-black text-black leading-none">
            {isRegister ? 'ĐĂNG KÝ CHỦ TRỌ' : 'ĐĂNG NHẬP HỆ THỐNG'}
          </h2>
          <p class="text-zinc-600 text-xs font-semibold mt-2">
            {isRegister ? 'Đăng ký quản lý dàn trọ của bạn dễ dàng' : 'Nhập thông tin truy cập cổng dịch vụ của bạn'}
          </p>
        </div>

        <!-- Auth Form -->
        <form onsubmit={handleSubmit} class="space-y-4">
          {#if isRegister}
            <!-- Full Name -->
            <div class="space-y-1">
              <label for="reg-name" class="text-xs font-bold text-zinc-600 uppercase tracking-wider block">Họ và tên</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <User class="h-4.5 w-4.5" />
                </span>
                <input
                  id="reg-name"
                  type="text"
                  bind:value={name}
                  required
                  placeholder="Nguyễn Văn Hậu"
                  class="w-full pl-10 pr-4 py-2 bg-white border-2 border-black rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm font-semibold"
                />
              </div>
            </div>
          {/if}

          <!-- Email/Account -->
          <div class="space-y-1">
            <label for="acc-email" class="text-xs font-bold text-zinc-600 uppercase tracking-wider block">
              {isRegister ? 'Email liên hệ' : 'Email hoặc Số điện thoại'}
            </label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                <Mail class="h-4.5 w-4.5" />
              </span>
              <input
                id="acc-email"
                type={isRegister ? "email" : "text"}
                bind:value={email}
                required
                placeholder={isRegister ? "chu-nha@gmail.com" : "Email hoặc SĐT đăng nhập"}
                class="w-full pl-10 pr-4 py-2 bg-white border-2 border-black rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm font-semibold"
              />
            </div>
          </div>

          <!-- Phone (Register only) -->
          {#if isRegister}
            <div class="space-y-1">
              <label for="reg-phone" class="text-xs font-bold text-zinc-600 uppercase tracking-wider block">Số điện thoại</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <Phone class="h-4.5 w-4.5" />
                </span>
                <input
                  id="reg-phone"
                  type="tel"
                  bind:value={phone}
                  required
                  placeholder="0901234567"
                  class="w-full pl-10 pr-4 py-2 bg-white border-2 border-black rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm font-semibold"
                />
              </div>
            </div>
          {/if}

          <!-- Password -->
          <div class="space-y-1">
            <label for="acc-password" class="text-xs font-bold text-zinc-600 uppercase tracking-wider block">Mật khẩu</label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                <KeyRound class="h-4.5 w-4.5" />
              </span>
              <input
                id="acc-password"
                type="password"
                bind:value={password}
                required
                placeholder="••••••••"
                class="w-full pl-10 pr-4 py-2 bg-white border-2 border-black rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm font-semibold"
              />
            </div>
          </div>

          <!-- Confirm Password (Register only) -->
          {#if isRegister}
            <div class="space-y-1">
              <label for="reg-confirm" class="text-xs font-bold text-zinc-600 uppercase tracking-wider block">Nhập lại mật khẩu</label>
              <div class="relative">
                <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <KeyRound class="h-4.5 w-4.5" />
                </span>
                <input
                  id="reg-confirm"
                  type="password"
                  bind:value={confirmPassword}
                  required
                  placeholder="••••••••"
                  class="w-full pl-10 pr-4 py-2 bg-white border-2 border-black rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm font-semibold"
                />
              </div>
            </div>
          {/if}

          <!-- Submit Button with brutalist shadow collapse animation -->
          <button
            type="submit"
            disabled={isLoading}
            class="w-full py-3 mt-2 bg-blue-300 hover:bg-blue-400 text-black border-2 border-black rounded-[6px] shadow-primary hover:translate-x-[5px] hover:translate-y-[6px] hover:shadow-none active:translate-x-[5px] active:translate-y-[6px] active:shadow-none transition-all font-bold text-sm cursor-pointer flex items-center justify-center gap-2"
          >
            {#if isLoading}
              Đang xử lý... <Loader2 class="h-4.5 w-4.5 animate-spin" />
            {:else}
              {isRegister ? 'ĐĂNG KÝ CHỦ TRỌ' : 'ĐĂNG NHẬP'} <ArrowRight class="h-4.5 w-4.5" />
            {/if}
          </button>
        </form>

        <!-- Toggle Mode Link -->
        <div class="text-center mt-6 text-xs text-zinc-600 font-bold uppercase tracking-wider">
          {isRegister ? 'Đã có tài khoản?' : 'Bạn là chủ trọ mới?'}
          <button
            type="button"
            onclick={() => { isRegister = !isRegister; }}
            class="text-blue-500 hover:underline font-bold ml-1 bg-transparent border-none p-0 cursor-pointer"
          >
            {isRegister ? 'Đăng nhập tại đây' : 'Đăng ký tại đây'}
          </button>
        </div>
      </div>
    </div>
  </div>
</div>
