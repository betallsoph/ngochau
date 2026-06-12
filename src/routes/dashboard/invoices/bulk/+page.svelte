<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { toast } from 'svelte-sonner';
  import { 
    Receipt, 
    Loader2, 
    ArrowLeft, 
    Zap, 
    Droplet,
    AlertCircle,
    CheckCircle2
  } from '@lucide/svelte';

  interface Service {
    id: string;
    name: string;
    type: string;
    defaultRate: number;
  }

  interface ServiceConfig {
    serviceId: string;
    service: Service;
    customRate: number | null;
    quantity: number;
  }

  interface Room {
    id: string;
    roomNumber: string;
    monthlyRent: number;
    tenant: {
      id: string;
      user: {
        name: string;
      }
    } | null;
    services: ServiceConfig[];
    meterReadings: {
      serviceId: string;
      month: string;
      currValue: number;
    }[];
  }

  interface Property {
    id: string;
    name: string;
  }

  let landlordId = $state<string | null>(null);
  let isLoadingProperties = $state(true);
  let isLoadingRooms = $state(false);
  let isSubmitting = $state(false);

  let properties = $state<Property[]>([]);
  let rooms = $state<Room[]>([]);
  let meteredServices = $state<Service[]>([]);

  // Form selections
  let selectedPropertyId = $state('');
  let month = $state(new Date().toISOString().slice(0, 7)); // YYYY-MM
  let dueDate = $state('');

  // Meter readings state inputs
  let readingsMap = $state<Record<string, Record<string, { prevValue: string; currValue: string }>>>({});

  onMount(() => {
    const sessionStr = localStorage.getItem('roomio_user');
    if (!sessionStr) return;
    const session = JSON.parse(sessionStr);
    landlordId = session.landlordProfileId;
    
    // Default due date: 5th of next month
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    nextMonth.setDate(5);
    dueDate = nextMonth.toISOString().split('T')[0];

    loadProperties(session.landlordProfileId);
  });

  async function loadProperties(profileId: string) {
    isLoadingProperties = true;
    try {
      const res = await fetch(`/api/properties?landlordId=${profileId}`);
      const data = await res.json();
      if (res.ok) {
        properties = data;
        if (properties.length > 0) {
          selectedPropertyId = properties[0].id;
        }
      }
    } catch (e: any) {
      toast.error('Lỗi tải danh sách tòa nhà: ' + e.message);
    } finally {
      isLoadingProperties = false;
    }
  }

  async function fetchRoomsAndServices(propertyId: string) {
    if (!propertyId) return;
    isLoadingRooms = true;
    try {
      // 1. Fetch rooms
      const res = await fetch(`/api/rooms?propertyId=${propertyId}`);
      const roomsData = await res.json();
      
      // Filter only occupied rooms (rooms with tenant)
      const occupiedRooms = roomsData.filter((r: any) => r.tenantId !== null);
      rooms = occupiedRooms;

      // 2. Extract metered services active in these rooms
      const mServices: Record<string, Service> = {};
      occupiedRooms.forEach((r: any) => {
        r.services.forEach((c: any) => {
          if (c.service.type === 'METERED' && c.service.isActive) {
            mServices[c.serviceId] = c.service;
          }
        });
      });
      meteredServices = Object.values(mServices);

      // 3. Initialize readingsMap with previous values
      const newReadings: typeof readingsMap = {};
      
      occupiedRooms.forEach((r: any) => {
        newReadings[r.id] = {};
        
        meteredServices.forEach(s => {
          // Find the last recorded reading for this service in this room
          const lastReading = r.meterReadings.find((mr: any) => mr.serviceId === s.id);
          
          newReadings[r.id][s.id] = {
            prevValue: lastReading ? lastReading.currValue.toString() : '0',
            currValue: ''
          };
        });
      });

      // 4. Overlay readings already submitted by tenants and approved (chốt số)
      try {
        const prefillRes = await fetch(`/api/invoices/bulk?propertyId=${propertyId}&month=${month}`);
        const prefill = await prefillRes.json();
        if (prefillRes.ok) {
          for (const [roomId, services] of Object.entries(prefill.readings || {})) {
            for (const [serviceId, reading] of Object.entries(services as Record<string, any>)) {
              if (reading.status === 'approved' && newReadings[roomId]?.[serviceId]) {
                newReadings[roomId][serviceId] = {
                  prevValue: reading.prevValue.toString(),
                  currValue: reading.currValue.toString()
                };
              }
            }
          }
        }
      } catch {
        // Không tải được dữ liệu chốt số thì vẫn cho nhập tay như cũ
      }

      readingsMap = newReadings;
    } catch (e: any) {
      toast.error('Lỗi khi tải dữ liệu phòng: ' + e.message);
    } finally {
      isLoadingRooms = false;
    }
  }

  $effect(() => {
    if (selectedPropertyId) {
      fetchRoomsAndServices(selectedPropertyId);
    }
  });

  async function handleSubmitBulkInvoices(e: SubmitEvent) {
    e.preventDefault();
    if (!landlordId || !selectedPropertyId || isSubmitting) return;

    if (rooms.length === 0) {
      toast.error('Không có phòng nào có khách để tạo hóa đơn.');
      return;
    }

    // Verify all fields are completed
    let hasError = false;
    const cleanReadings: Record<string, Record<string, { prevValue: number; currValue: number }>> = {};

    for (const room of rooms) {
      cleanReadings[room.id] = {};
      for (const service of meteredServices) {
        const entry = readingsMap[room.id]?.[service.id] || { prevValue: '0', currValue: '' };
        if (entry.currValue === '') {
          toast.error(`Vui lòng điền chỉ số mới cho phòng ${room.roomNumber} - dịch vụ ${service.name}`);
          hasError = true;
          break;
        }

        const prevNum = Number(entry.prevValue) || 0;
        const currNum = Number(entry.currValue) || 0;

        if (currNum < prevNum) {
          toast.error(`Số mới của phòng ${room.roomNumber} (${currNum}) nhỏ hơn số cũ (${prevNum})!`);
          hasError = true;
          break;
        }

        cleanReadings[room.id][service.id] = {
          prevValue: prevNum,
          currValue: currNum
        };
      }
      if (hasError) break;
    }

    if (hasError) return;

    isSubmitting = true;
    try {
      const res = await fetch('/api/invoices/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          landlordId,
          propertyId: selectedPropertyId,
          month,
          dueDate,
          readings: cleanReadings
        })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Lỗi tạo hóa đơn hàng loạt');

      toast.success(`Đã tạo thành công ${data.count} hóa đơn tháng ${month}!`);
      goto('/dashboard/invoices');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      isSubmitting = false;
    }
  }

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
  }
</script>

<div class="space-y-6">
  <!-- Back navigation & Header -->
  <div class="flex items-center gap-3">
    <a 
      href="/dashboard/invoices" 
      class="p-2 border-2 border-black bg-white hover:bg-zinc-100 rounded-[6px] text-black shadow-secondary hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all shrink-0 cursor-pointer"
    >
      <ArrowLeft class="h-5 w-5" />
    </a>
    <div>
      <h1 class="text-2xl font-black text-black">Tạo Hóa Đơn Hàng Loạt</h1>
      <p class="text-zinc-600 text-sm mt-0.5 font-bold">Nhập chỉ số điện nước cuối kỳ của toàn bộ tòa nhà để tự động tính hóa đơn.</p>
    </div>
  </div>

  {#if isLoadingProperties}
    <div class="h-[40vh] w-full flex items-center justify-center">
      <Loader2 class="h-10 w-10 text-black animate-spin" />
    </div>
  {:else if properties.length === 0}
    <div class="bg-white border-2 border-black p-8 rounded-lg text-center max-w-md mx-auto shadow-secondary">
              <AlertCircle class="h-8 w-8" />
      <p class="font-black text-black">Chưa có tòa nhà</p>
      <p class="text-zinc-600 text-sm mt-1 font-semibold">Vui lòng tạo tòa nhà trước khi tính hóa đơn.</p>
    </div>
  {:else}
    <form onsubmit={handleSubmitBulkInvoices} class="space-y-6">
      <!-- Top selectors card -->
      <div class="bg-white border-2 border-black p-5 rounded-lg shadow-secondary grid gap-4 sm:grid-cols-3">
        <div class="space-y-1">
          <label for="b-prop" class="text-xs font-bold text-zinc-600 uppercase tracking-wider block">Chọn tòa nhà</label>
          <select 
            id="b-prop"
            bind:value={selectedPropertyId} 
            required
            class="w-full border-2 border-black px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white font-semibold text-black"
          >
            {#each properties as prop}
              <option value={prop.id}>{prop.name}</option>
            {/each}
          </select>
        </div>

        <div class="space-y-1">
          <label for="b-month" class="text-xs font-bold text-zinc-600 uppercase tracking-wider block">Tháng tính hóa đơn</label>
          <input 
            id="b-month"
            type="month" 
            bind:value={month} 
            required
            class="w-full border-2 border-black px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white font-semibold text-black"
          />
        </div>

        <div class="space-y-1">
          <label for="b-due" class="text-xs font-bold text-zinc-600 uppercase tracking-wider block">Hạn nộp tiền</label>
          <input 
            id="b-due"
            type="date" 
            bind:value={dueDate} 
            required
            class="w-full border-2 border-black px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white font-semibold text-black"
          />
        </div>
      </div>

      <!-- Meter inputs table -->
      <div class="bg-white border-2 border-black rounded-lg shadow-secondary overflow-hidden flex flex-col">
        <div class="p-4 border-b-2 border-black bg-zinc-50 flex items-center justify-between shrink-0">
          <h2 class="font-black text-black text-base flex items-center gap-2">
            Nhập chỉ số điện nước cuối kỳ <Receipt class="h-5 w-5" />
          </h2>
        </div>

        {#if isLoadingRooms}
          <div class="p-12 w-full flex items-center justify-center bg-white">
            <Loader2 class="h-8 w-8 text-black animate-spin" />
          </div>
        {:else if rooms.length === 0}
          <div class="p-12 text-center bg-white">
            <p class="text-zinc-600 text-sm font-semibold">Không tìm thấy phòng có khách đang ở trong tòa nhà này.</p>
          </div>
        {:else}
          <div class="overflow-x-auto bg-white">
            <table class="w-full text-left border-collapse text-sm">
              <thead>
                <tr class="bg-blue-300 border-b-2 border-black text-black font-black uppercase text-xs">
                  <th class="px-4 py-3">Số phòng</th>
                  <th class="px-4 py-3">Khách thuê</th>
                  <th class="px-4 py-3">Giá phòng</th>
                  
                  {#each meteredServices as service}
                    <th class="px-4 py-3 text-center border-l-2 border-black bg-blue-150/40">
                      <div class="flex items-center justify-center gap-1">
                        {#if service.name.includes('Điện')}
                          <Zap class="h-4 w-4 text-amber-650" />
                        {:else}
                          <Droplet class="h-4 w-4 text-blue-600" />
                        {/if}
                        {service.name} (Cũ → Mới)
                      </div>
                    </th>
                  {/each}
                </tr>
              </thead>
              <tbody>
                {#each rooms as room}
                  <tr class="border-b border-black/15 hover:bg-slate-50 transition-all font-semibold text-black">
                    <td class="px-4 py-4 font-black">Phòng {room.roomNumber}</td>
                    <td class="px-4 py-4">{room.tenant?.user.name || '--'}</td>
                    <td class="px-4 py-4 font-black">{formatCurrency(room.monthlyRent)}</td>

                    {#each meteredServices as service}
                      {@const readings = readingsMap[room.id]?.[service.id] || { prevValue: '0', currValue: '' }}
                      <td class="px-4 py-4 text-center border-l-2 border-black bg-zinc-50/50">
                        <div class="flex items-center justify-center gap-2">
                          <input 
                            type="number" 
                            bind:value={readings.prevValue}
                            required
                            placeholder="Số cũ" 
                            class="border-2 border-black px-2 py-1 text-xs rounded-lg w-20 text-center bg-white font-bold text-black focus:outline-none focus:ring-2 focus:ring-blue-300"
                          />
                          <span class="text-zinc-500 font-black">→</span>
                          <input 
                            type="number" 
                            bind:value={readings.currValue}
                            required
                            placeholder="Số mới" 
                            class="border-2 border-black px-2 py-1 text-xs rounded-lg w-24 text-center bg-white font-black text-black focus:outline-none focus:ring-2 focus:ring-blue-300"
                          />
                        </div>
                        {#if readings.currValue !== '' && Number(readings.currValue) >= Number(readings.prevValue)}
                          <span class="text-[10px] text-blue-600 font-black block mt-1">
                            Tiêu thụ: {Number(readings.currValue) - Number(readings.prevValue)}
                          </span>
                        {/if}
                      </td>
                    {/each}
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>

          <!-- Form Submit Footer -->
          <div class="p-6 border-t-2 border-black bg-zinc-50 flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0">
            <div class="flex items-center gap-2 text-xs text-zinc-600 font-bold max-w-md">
              <AlertCircle class="h-4.5 w-4.5 text-blue-600 shrink-0" />
              <span>Khi ấn xác nhận, hệ thống sẽ tự động tính toán điện nước, cộng phí dịch vụ cố định và gửi hóa đơn đến khách thuê.</span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              class="bg-green-200 hover:bg-green-300 disabled:opacity-50 text-black border-2 border-black px-6 py-3 rounded-[6px] text-sm font-black shadow-primary hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {#if isSubmitting}
                Đang tạo hóa đơn...
                <Loader2 class="h-4.5 w-4.5 animate-spin" />
              {:else}
                Tính toán & Xuất hóa đơn
                <CheckCircle2 class="h-4.5 w-4.5" />
              {/if}
            </button>
          </div>
        {/if}
      </div>
    </form>
  {/if}
</div>
