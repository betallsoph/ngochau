<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  onMount(() => {
    const sessionStr = localStorage.getItem('roomio_user');
    if (!sessionStr) {
      goto('/login');
      return;
    }

    try {
      const session = JSON.parse(sessionStr);
      if (session.role === 'SUPER_ADMIN') {
        goto('/super-admin');
      } else if (session.role === 'LANDLORD') {
        goto('/dashboard');
      } else if (session.role === 'TENANT') {
        goto('/tenant');
      } else {
        goto('/login');
      }
    } catch (e) {
      localStorage.removeItem('roomio_user');
      goto('/login');
    }
  });
</script>

<div class="h-screen w-screen flex items-center justify-center bg-slate-50">
  <div class="flex flex-col items-center gap-3">
    <div class="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
    <p class="text-slate-500 font-medium">Đang chuyển hướng...</p>
  </div>
</div>
