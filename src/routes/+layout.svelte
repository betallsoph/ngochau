<script lang="ts">
  import './layout.css';
  import favicon from '$lib/assets/favicon.svg';
  import { Toaster } from 'svelte-sonner';

  let { children } = $props();
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
  <title>Roomio - Quản Lý Trọ Thông Minh</title>
</svelte:head>

<Toaster position="top-right" richColors />
{@render children()}
