<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import { uploadImage } from '$lib/upload';
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
		Droplet,
		Send,
		Copy,
		FileText
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
				landlord?: {
					bankName: string;
					bankCode: string;
					accountNumber: string;
					accountName: string;
					momoNumber?: string | null;
					phone?: string | null;
				};
			};
		};
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
		sender?: 'TENANT' | 'LANDLORD';
		createdAt: string;
	}

	interface ChatMessage {
		id: string;
		conversationId: string;
		senderId: string;
		content: string;
		createdAt: string;
	}

	interface Contract {
		id: string;
		startDate: string;
		endDate: string;
		monthlyRent: number;
		deposit: number;
		fileUrl: string | null;
		notes: string | null;
		status: string;
		room?: { roomNumber: string; property?: { name: string; shortName: string } };
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
	let userId = $state(''); // User.id từ localStorage (dùng so sánh người gửi chat)
	let isLoading = $state(true);

	// Active navigation tab
	let activeTab = $state<'home' | 'bills' | 'request' | 'note' | 'meters' | 'documents' | 'chat'>(
		'home'
	);

	// Tenant profile & room details
	let roomDetails = $state<{
		roomNumber: string;
		propertyName: string;
		monthlyRent: number;
		propertyId: string;
	} | null>(null);

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
	let uploadingDocField = $state<'front' | 'back' | 'vehicle' | 'checkin' | null>(null);

	// Meter form state
	let fullRoomData = $state<any | null>(null);
	let meterServiceId = $state('');
	let meterMonth = $state(new Date().toISOString().slice(0, 7)); // YYYY-MM
	let meterPrev = $state<number>(0);
	let meterCurr = $state('');
	let meterPhotoUrl = $state('');
	let isSubmittingMeter = $state(false);
	let isUploadingMeterPhoto = $state(false);

	// Lists
	let invoices = $state<Invoice[]>([]);
	let requests = $state<MaintenanceRequest[]>([]);
	let notes = $state<SpecialNote[]>([]);
	let announcements = $state<Announcement[]>([]);

	// Selected invoice for payment / VietQR modal
	let payingInvoice = $state<Invoice | null>(null);
	let proofImageUrl = $state('');
	let isSubmittingProof = $state(false);
	let isUploadingProofImage = $state(false);

	// Request form state
	let reqCategory = $state('maintenance');
	let reqTitle = $state('');
	let reqDesc = $state('');
	let reqImage = $state('');
	let reqIsImportant = $state(false);
	let isSubmittingRequest = $state(false);
	let isUploadingReqImage = $state(false);

	// Special note form state
	let noteText = $state('');
	let isSubmittingNote = $state(false);

	// Contract & referral state
	let activeContract = $state<Contract | null>(null);
	let emptyRooms = $state<any[]>([]);

	// Chat state
	let chatMessages = $state<ChatMessage[]>([]);
	let chatInput = $state('');
	let isSendingChat = $state(false);
	let chatBox = $state<HTMLDivElement | null>(null);

	$effect(() => {
		if (meterServiceId && fullRoomData) {
			// Chỉ số đầu kỳ tham khảo: lấy theo lần đã được chủ nhà chốt gần nhất
			const latestApproved = fullRoomData.meterReadings.find(
				(r: any) => r.serviceId === meterServiceId && r.status === 'approved'
			);
			if (latestApproved) {
				meterPrev = latestApproved.currValue;
			} else {
				meterPrev = 0;
			}
		} else {
			meterPrev = 0;
		}
	});

	// Đọc file từ input, nén + upload, trả về URL (null nếu lỗi/không chọn file)
	async function uploadFromInput(e: Event, watermarkLabel?: string): Promise<string | null> {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return null;
		try {
			return await uploadImage(file, watermarkLabel);
		} catch (err: any) {
			toast.error(err.message);
			return null;
		} finally {
			input.value = '';
		}
	}

	async function handleMeterPhotoChange(e: Event) {
		if (isUploadingMeterPhoto) return;
		isUploadingMeterPhoto = true;
		const url = await uploadFromInput(e, 'Phòng ' + (fullRoomData?.roomNumber || ''));
		if (url) meterPhotoUrl = url;
		isUploadingMeterPhoto = false;
	}

	async function handleReqImageChange(e: Event) {
		if (isUploadingReqImage) return;
		isUploadingReqImage = true;
		const url = await uploadFromInput(e, 'Sự cố');
		if (url) reqImage = url;
		isUploadingReqImage = false;
	}

	async function handleProofImageChange(e: Event) {
		if (isUploadingProofImage || !payingInvoice) return;
		isUploadingProofImage = true;
		const url = await uploadFromInput(e, 'TT ' + payingInvoice.id);
		if (url) proofImageUrl = url;
		isUploadingProofImage = false;
	}

	async function handleDocImageChange(e: Event, field: 'front' | 'back' | 'vehicle' | 'checkin') {
		if (uploadingDocField) return;
		uploadingDocField = field;
		const url = await uploadFromInput(e);
		if (url) {
			if (field === 'front') tenantIdFrontImage = url;
			else if (field === 'back') tenantIdBackImage = url;
			else if (field === 'vehicle') tenantVehicleImage = url;
			else tenantCheckInImage = url;
		}
		uploadingDocField = null;
	}

	async function handleSubmitMeter(e: SubmitEvent) {
		e.preventDefault();
		if (!tenantId || !fullRoomData || isSubmittingMeter) return;

		if (!meterServiceId || !meterMonth || meterCurr === '') {
			toast.error('Vui lòng chọn dịch vụ và nhập chỉ số mới');
			return;
		}

		isSubmittingMeter = true;
		try {
			const res = await fetch('/api/meter-readings', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					roomId: fullRoomData.id,
					serviceId: meterServiceId,
					month: meterMonth,
					currValue: Number(meterCurr),
					photoUrl: meterPhotoUrl || null
				})
			});
			const data = await res.json();

			if (!res.ok) throw new Error(data.error || 'Lỗi gửi chỉ số điện nước');

			toast.success('Đã gửi chỉ số, chờ chủ nhà duyệt');
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
		userId = session.id;

		fetchTenantData(session.tenantProfileId);
	});

	// Chat: tải tin nhắn & thăm dò mỗi 5 giây khi đang mở tab Chat
	$effect(() => {
		if (activeTab === 'chat' && fullRoomData?.property?.landlordId && tenantId) {
			fetchChatMessages();
			const timer = setInterval(fetchChatMessages, 5000);
			return () => clearInterval(timer);
		}
	});

	function scrollChatToBottom() {
		requestAnimationFrame(() => {
			if (chatBox) chatBox.scrollTop = chatBox.scrollHeight;
		});
	}

	async function fetchChatMessages() {
		if (!fullRoomData?.property?.landlordId || !tenantId) return;
		try {
			const res = await fetch(
				`/api/messages?landlordId=${fullRoomData.property.landlordId}&tenantId=${tenantId}`
			);
			const data = await res.json();
			if (res.ok) {
				const hasNew = data.length !== chatMessages.length;
				chatMessages = data;
				if (hasNew) scrollChatToBottom();
			}
		} catch (e) {
			// Ignore lỗi thăm dò
		}
	}

	async function handleSendChat(e: SubmitEvent) {
		e.preventDefault();
		if (!fullRoomData?.property?.landlordId || !tenantId || isSendingChat) return;

		const content = chatInput.trim();
		if (!content) return;

		isSendingChat = true;
		try {
			const res = await fetch('/api/messages', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					landlordId: fullRoomData.property.landlordId,
					tenantId,
					content
				})
			});
			const data = await res.json();

			if (!res.ok) throw new Error(data.error || 'Lỗi gửi tin nhắn');

			chatInput = '';
			await fetchChatMessages();
		} catch (err: any) {
			toast.error(err.message);
		} finally {
			isSendingChat = false;
		}
	}

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

				// Fetch announcements (đủ phạm vi: tòa nhà / block / phòng / đích danh khách)
				fetchAnnouncements(fullRoomData.propertyId, fullRoomData.blockId, fullRoomData.id);

				// Fetch empty rooms cùng tòa để giới thiệu bạn bè
				fetchEmptyRooms(fullRoomData.propertyId);
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

			// 5. Fetch contracts (lấy hợp đồng đang hiệu lực nếu có)
			const contractRes = await fetch(`/api/contracts?tenantId=${tId}`);
			const contractData = await contractRes.json();
			if (contractRes.ok && Array.isArray(contractData)) {
				activeContract = contractData.find((c: Contract) => c.status === 'active') || null;
			}
		} catch (e: any) {
			toast.error('Lỗi khi tải thông tin: ' + e.message);
		} finally {
			isLoading = false;
		}
	}

	async function fetchAnnouncements(
		propertyId?: string | null,
		blockId?: string | null,
		roomId?: string | null
	) {
		try {
			const params = new URLSearchParams({ audience: 'tenant' });
			if (propertyId) params.set('propertyId', propertyId);
			if (blockId) params.set('blockId', blockId);
			if (roomId) params.set('roomId', roomId);
			if (tenantId) params.set('tenantId', tenantId);

			const res = await fetch(`/api/announcements?${params.toString()}`);
			const data = await res.json();
			if (res.ok) announcements = data.slice(0, 3);
		} catch (e) {
			// Ignore
		}
	}

	async function fetchEmptyRooms(propertyId: string) {
		try {
			const res = await fetch(`/api/rooms?propertyId=${propertyId}&status=empty`);
			const data = await res.json();
			if (res.ok) emptyRooms = data;
		} catch (e) {
			// Ignore
		}
	}

	// Mở modal thanh toán: lấy chi tiết hóa đơn (kèm thông tin nhận tiền của chủ nhà)
	async function openPayment(invoice: Invoice) {
		proofImageUrl = '';
		try {
			const res = await fetch(`/api/invoices/${invoice.id}`);
			const data = await res.json();
			payingInvoice = res.ok ? data : invoice;
		} catch (e) {
			payingInvoice = invoice;
		}
	}

	async function handleSubmitProof(e: SubmitEvent) {
		e.preventDefault();
		if (!payingInvoice || isSubmittingProof) return;

		if (!proofImageUrl) {
			toast.error('Vui lòng chụp/tải ảnh bill chuyển khoản trước khi gửi');
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

	async function handleLogout() {
		try {
			await fetch('/api/auth', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ action: 'logout' })
			});
		} catch (e) {
			// Vẫn cho đăng xuất phía client nếu server lỗi
		}
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
		if (!ll) return '';
		const amount = invoice.totalAmount;
		const info = `ROOMIO ${invoice.roomNumber} T${invoice.month.replace('-', '')}`;
		return `https://img.vietqr.io/image/${ll.bankCode}-${ll.accountNumber}-compact.png?amount=${amount}&addInfo=${encodeURIComponent(info)}&accountName=${encodeURIComponent(ll.accountName)}`;
	}

	const pendingInvoice = $derived(() => {
		return invoices.find((inv) => inv.status !== 'paid');
	});

	// Hợp đồng sắp hết hạn trong vòng 30 ngày tới?
	const contractExpiringSoon = $derived(() => {
		if (!activeContract?.endDate) return false;
		const diffDays =
			(new Date(activeContract.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
		return diffDays <= 30;
	});

	function getMeterStatusBadge(status: string) {
		if (status === 'approved') return { label: 'Đã chốt', cls: 'bg-green-200' };
		if (status === 'rejected') return { label: 'Từ chối', cls: 'bg-red-200' };
		return { label: 'Chờ duyệt', cls: 'bg-yellow-200' };
	}

	function getRoomTypeLabel(roomType: string) {
		const labels: Record<string, string> = {
			standard: 'Phòng thường',
			master: 'Phòng master',
			balcony: 'Phòng ban công'
		};
		return labels[roomType] || roomType;
	}

	// Sao chép lời giới thiệu phòng trống gửi cho bạn bè
	async function handleCopyReferral() {
		if (!fullRoomData || emptyRooms.length === 0) return;

		const lines = [
			`Nhà mình đang ở "${fullRoomData.property.name}" (${fullRoomData.property.address}) còn phòng trống, bạn nào cần thuê thì tham khảo nhé:`,
			...emptyRooms.map((r: any) => {
				const area = r.area ? `, ${r.area}m2` : '';
				return `- Phòng ${r.roomNumber} (${getRoomTypeLabel(r.roomType)}${area}): ${formatCurrency(r.monthlyRent)}/tháng`;
			})
		];

		// Lấy SĐT liên hệ chủ nhà từ hóa đơn đã tải (nếu có), không có thì bỏ qua
		const landlord = invoices.find((inv) => inv.room?.property?.landlord)?.room.property.landlord;
		const phone = landlord?.phone || landlord?.momoNumber;
		if (phone) lines.push(`Liên hệ chủ nhà: ${phone}`);

		try {
			await navigator.clipboard.writeText(lines.join('\n'));
			toast.success('Đã sao chép lời giới thiệu, gửi ngay cho bạn bè!');
		} catch (e) {
			toast.error('Không sao chép được, vui lòng thử lại');
		}
	}
</script>

<div class="relative flex min-h-screen flex-col bg-slate-50 font-sans">
	<!-- Interactive Grid Background Overlay -->
	<div
		class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,black_1px,transparent_0)] bg-[size:16px_16px] opacity-[0.03]"
	></div>

	<!-- Top header: Brutalist header with black border-b-2 -->
	<header
		class="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b-2 border-black bg-blue-300 px-6 text-black shadow-sm"
	>
		<div class="flex items-center gap-2">
			<div class="rounded-lg border-2 border-black bg-white p-1.5 shadow-secondary">
				<Home class="h-5 w-5 text-black" />
			</div>
			<span class="text-lg font-black">Roomio Cư Dân</span>
		</div>

		<button
			onclick={handleLogout}
			class="flex cursor-pointer items-center gap-1.5 rounded-[6px] border-2 border-black bg-white px-3 py-1.5 text-xs font-bold shadow-secondary transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
		>
			Đăng xuất
			<LogOut class="h-4 w-4" />
		</button>
	</header>

	{#if isLoading}
		<div class="relative z-10 flex flex-1 items-center justify-center">
			<div class="flex flex-col items-center gap-3">
				<Loader2 class="h-10 w-10 animate-spin text-black" />
				<p class="text-xs font-bold tracking-wider text-zinc-500 uppercase">
					Đang tải cổng thông tin cư dân...
				</p>
			</div>
		</div>
	{:else}
		<!-- Shell Wrapper -->
		<main class="relative z-10 mx-auto w-full max-w-4xl flex-grow space-y-6 p-4 pb-24">
			<!-- Welcome Header Profile Card - Styled as Brutallist Card -->
			<div
				class="relative flex flex-col justify-between gap-4 overflow-hidden rounded-lg border-2 border-black bg-white p-6 text-black shadow-secondary sm:flex-row sm:items-center"
			>
				<div
					class="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#00000005_1px,transparent_1px),linear-gradient(to_bottom,#00000005_1px,transparent_1px)] bg-[size:16px_16px]"
				></div>

				<div class="relative z-10 flex items-center gap-4">
					<div
						class="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border-2 border-black bg-blue-300 text-lg font-black text-black"
					>
						{tenantName.slice(0, 1).toUpperCase()}
					</div>
					<div>
						<h2 class="text-xl font-black">Chào cư dân, {tenantName}</h2>
						{#if roomDetails}
							<p class="mt-1 text-sm font-bold text-zinc-600">
								{roomDetails.propertyName} — Phòng {roomDetails.roomNumber}
							</p>
						{:else}
							<p class="mt-1 text-sm font-bold text-red-500">Chưa có thông tin bàn giao phòng</p>
						{/if}
					</div>
				</div>

				{#if roomDetails}
					<div class="relative z-10 shrink-0 text-left sm:text-right">
						<span class="block text-xs font-bold tracking-wider text-zinc-500 uppercase"
							>Giá phòng thuê</span
						>
						<span class="text-2xl font-black">{formatCurrency(roomDetails.monthlyRent)}</span>
					</div>
				{/if}
			</div>

			<!-- Pinned Announcements -->
			{#if announcements.length > 0}
				<div class="space-y-2">
					<h3
						class="flex items-center gap-1.5 text-xs font-black tracking-wider text-zinc-500 uppercase"
					>
						<Pin class="h-4 w-4 text-black" />
						Bảng tin thông báo
					</h3>
					<div
						class="divide-y-2 divide-black overflow-hidden rounded-lg border-2 border-black bg-white shadow-secondary"
					>
						{#each announcements as ann}
							<div class="flex flex-col gap-1 bg-white p-4 transition-colors hover:bg-slate-50">
								<h4 class="flex items-center gap-2 text-sm font-black text-black">
									<span
										class="h-2.5 w-2.5 rounded-full border border-black {ann.isImportant
											? 'animate-pulse bg-red-500'
											: 'bg-zinc-400'}"
									></span>
									{ann.title}
								</h4>
								<p class="pl-4.5 text-xs leading-relaxed font-semibold text-zinc-600">
									{ann.content}
								</p>
							</div>
						{/each}
					</div>
				</div>
			{/if}

			<!-- TAB SELECTION: Brutallist style tabs -->
			<div
				class="flex shrink-0 scrollbar-none gap-1 overflow-x-auto rounded-lg border-2 border-b-2 border-black bg-white p-1 whitespace-nowrap shadow-sm select-none"
			>
				<button
					onclick={() => (activeTab = 'home')}
					class="min-w-[80px] flex-grow cursor-pointer rounded-[6px] py-2 text-xs font-black tracking-wider uppercase transition-all {activeTab ===
					'home'
						? 'border-2 border-black bg-blue-300 text-black'
						: 'border border-transparent text-zinc-600 hover:bg-white/50'}"
				>
					Trang chủ
				</button>
				<button
					onclick={() => (activeTab = 'bills')}
					class="min-w-[80px] flex-grow cursor-pointer rounded-[6px] py-2 text-xs font-black tracking-wider uppercase transition-all {activeTab ===
					'bills'
						? 'border-2 border-black bg-blue-300 text-black'
						: 'border border-transparent text-zinc-600 hover:bg-white/50'}"
				>
					Hóa đơn ({invoices.length})
				</button>
				<button
					onclick={() => (activeTab = 'request')}
					class="min-w-[100px] flex-grow cursor-pointer rounded-[6px] py-2 text-xs font-black tracking-wider uppercase transition-all {activeTab ===
					'request'
						? 'border-2 border-black bg-blue-300 text-black'
						: 'border border-transparent text-zinc-600 hover:bg-white/50'}"
				>
					Báo sự cố ({requests.length})
				</button>
				<button
					onclick={() => (activeTab = 'meters')}
					class="min-w-[120px] flex-grow cursor-pointer rounded-[6px] py-2 text-xs font-black tracking-wider uppercase transition-all {activeTab ===
					'meters'
						? 'border-2 border-black bg-blue-300 text-black'
						: 'border border-transparent text-zinc-600 hover:bg-white/50'}"
				>
					Báo điện nước
				</button>
				<button
					onclick={() => (activeTab = 'documents')}
					class="min-w-[130px] flex-grow cursor-pointer rounded-[6px] py-2 text-xs font-black tracking-wider uppercase transition-all {activeTab ===
					'documents'
						? 'border-2 border-black bg-blue-300 text-black'
						: 'border border-transparent text-zinc-600 hover:bg-white/50'}"
				>
					Giấy tờ & Hợp đồng
				</button>
				<button
					onclick={() => (activeTab = 'note')}
					class="min-w-[100px] flex-grow cursor-pointer rounded-[6px] py-2 text-xs font-black tracking-wider uppercase transition-all {activeTab ===
					'note'
						? 'border-2 border-black bg-blue-300 text-black'
						: 'border border-transparent text-zinc-600 hover:bg-white/50'}"
				>
					Lời nhắn
				</button>
				<button
					onclick={() => (activeTab = 'chat')}
					class="min-w-[80px] flex-grow cursor-pointer rounded-[6px] py-2 text-xs font-black tracking-wider uppercase transition-all {activeTab ===
					'chat'
						? 'border-2 border-black bg-blue-300 text-black'
						: 'border border-transparent text-zinc-600 hover:bg-white/50'}"
				>
					Chat
				</button>
			</div>

			<!-- TAB CONTENTS -->
			<div class="space-y-4">
				<!-- 1. HOME TAB -->
				{#if activeTab === 'home'}
					<div class="space-y-4">
						<!-- Pending Bill Alert Box -->
						{#if pendingInvoice()}
							<div
								class="flex flex-col justify-between gap-4 rounded-lg border-2 border-black bg-white p-5 shadow-secondary md:flex-row md:items-center"
							>
								<div class="flex items-start gap-3.5">
									<div
										class="shrink-0 rounded-lg border-2 border-black bg-white p-3 text-black shadow-secondary"
									>
										<Receipt class="h-6 w-6" />
									</div>
									<div>
										<h3 class="text-base font-black text-black">Hóa đơn cần đóng tháng này</h3>
										<p class="mt-1 text-xs font-bold text-zinc-500">
											Hạn nộp tiền: {new Date(pendingInvoice()!.dueDate).toLocaleDateString(
												'vi-VN'
											)}
										</p>
										<div class="mt-2 flex items-baseline gap-2">
											<span class="text-2xl font-black text-black"
												>{formatCurrency(pendingInvoice()!.totalAmount)}</span
											>
											{#if pendingInvoice()!.paymentProofImage}
												<span
													class="rounded-full border border-black bg-amber-200 px-2 py-0.5 text-xs font-bold text-amber-800"
													>Đang chờ đối soát</span
												>
											{/if}
										</div>
									</div>
								</div>

								<button
									onclick={() => {
										openPayment(pendingInvoice()!);
										activeTab = 'bills';
									}}
									class="flex cursor-pointer items-center justify-center gap-1.5 rounded-[6px] border-2 border-black bg-blue-300 px-5 py-3 text-sm font-bold text-black shadow-primary transition-all hover:translate-x-[5px] hover:translate-y-[6px] hover:shadow-none active:translate-x-[5px] active:translate-y-[6px] active:shadow-none"
								>
									Quét QR thanh toán <QrCode class="h-4.5 w-4.5" />
								</button>
							</div>
						{:else}
							<div
								class="flex flex-col items-center rounded-lg border-2 border-black bg-white p-6 text-center shadow-secondary"
							>
								<CheckCircle2 class="mb-2 h-12 w-12 text-green-500" />
								<h3 class="text-base font-black text-black">Đã đóng sạch cước phí nhà!</h3>
								<p class="mt-1 text-xs font-bold text-zinc-500">
									Cảm ơn bạn! Hệ thống không ghi nhận hóa đơn quá hạn nào.
								</p>
							</div>
						{/if}

						<!-- General Help Grid info -->
						<div class="grid gap-4 sm:grid-cols-2">
							<div
								class="flex h-44 flex-col justify-between rounded-lg border-2 border-black bg-white p-5 shadow-secondary"
							>
								<div class="flex items-center gap-2 border-b-2 border-black pb-2">
									<Wrench class="h-5 w-5 text-black" />
									<span class="text-sm font-black text-black">Gửi báo cáo sự cố</span>
								</div>
								<p class="mt-2 text-xs leading-relaxed font-semibold text-zinc-600">
									Thiết bị điện nước, nội thất trong phòng gặp sự cố? Gửi yêu cầu đính kèm hình ảnh
									và mô tả để chủ nhà bố trí thợ xử lý nhanh nhất.
								</p>
								<button
									onclick={() => (activeTab = 'request')}
									class="mt-3 cursor-pointer border-none bg-transparent p-0 text-left text-xs font-black text-blue-500 hover:underline"
								>
									Báo cáo ngay
								</button>
							</div>

							<div
								class="flex h-44 flex-col justify-between rounded-lg border-2 border-black bg-white p-5 shadow-secondary"
							>
								<div class="flex items-center gap-2 border-b-2 border-black pb-2">
									<MessageSquare class="h-5 w-5 text-black" />
									<span class="text-sm font-black text-black">Gửi lời nhắn lưu ý</span>
								</div>
								<p class="mt-2 text-xs leading-relaxed font-semibold text-zinc-600">
									Bạn có các đề xuất đặc biệt hoặc yêu cầu riêng cần chủ trọ lưu tâm? Gửi lời nhắn
									lưu ý để chủ nhà lưu giữ cố định tránh trôi tin nhắn.
								</p>
								<button
									onclick={() => (activeTab = 'note')}
									class="mt-3 cursor-pointer border-none bg-transparent p-0 text-left text-xs font-black text-blue-500 hover:underline"
								>
									Soạn lời nhắn
								</button>
							</div>
						</div>
					</div>

					<!-- 2. BILLS TAB -->
				{:else if activeTab === 'bills'}
					<div class="space-y-4">
						{#if payingInvoice}
							<!-- VietQR Payment Modal Detail -->
							<div
								class="animate-[scale-up_0.2s_ease-out] space-y-4 rounded-lg border-2 border-black bg-white p-5 shadow-secondary"
							>
								<div class="flex items-center justify-between border-b-2 border-black pb-2">
									<h3 class="flex items-center gap-1.5 text-sm font-black text-black">
										Thanh Toán Hóa Đơn {payingInvoice.id}
										<QrCode class="h-4.5 w-4.5" />
									</h3>
									<button
										onclick={() => (payingInvoice = null)}
										class="rounded-lg border border-transparent p-1.5 text-black hover:bg-white/40"
									>
										<X class="h-4.5 w-4.5" />
									</button>
								</div>

								<!-- VietQR image dynamically generated -->
								<div class="flex flex-col items-center gap-6 md:flex-row">
									<div
										class="flex flex-col items-center rounded-lg border-2 border-black bg-white p-3 shadow-secondary"
									>
										{#if payingInvoice.room.property.landlord}
											<img
												src={getVietQRUrl(payingInvoice)}
												alt="VietQR thanh toan"
												class="h-56 w-56 object-contain"
											/>
										{:else}
											<div class="flex h-56 w-56 items-center justify-center">
												<Loader2 class="h-8 w-8 animate-spin text-zinc-400" />
											</div>
										{/if}
										<p class="mt-2 text-[10px] font-black tracking-wider text-zinc-500 uppercase">
											Mở app ngân hàng quét mã
										</p>
									</div>

									<!-- Bank Info and Proof Upload -->
									<div class="w-full flex-1 space-y-3">
										<div class="space-y-2 border-b-2 border-black pb-3 text-xs">
											<p class="font-black tracking-wider text-zinc-500 uppercase">
												Thông tin tài khoản nhận
											</p>
											{#if payingInvoice.room.property.landlord}
												{@const ll = payingInvoice.room.property.landlord}
												<p class="text-sm font-black text-black">{ll.bankName} ({ll.bankCode})</p>
												<p class="font-black text-black">STK: {ll.accountNumber}</p>
												<p class="font-black text-black">Tên: {ll.accountName}</p>
												{#if ll.momoNumber}
													<p class="font-black text-pink-600">Momo: {ll.momoNumber}</p>
												{/if}
											{:else}
												<p class="font-bold text-zinc-400">Đang tải thông tin tài khoản...</p>
											{/if}
											<p class="font-black text-indigo-600">
												Số tiền: {formatCurrency(payingInvoice.totalAmount)}
											</p>
											<p
												class="mt-1 w-fit rounded border-2 border-black bg-white px-2 py-1 font-mono font-black text-black"
											>
												Nội dung: ROOMIO {payingInvoice.roomNumber} T{payingInvoice.month.replace(
													'-',
													''
												)}
											</p>
										</div>

										<!-- Upload payment proof image form -->
										<form onsubmit={handleSubmitProof} class="space-y-3 pt-2">
											<span
												class="block text-[10px] font-black tracking-wider text-zinc-500 uppercase"
												>Chụp/tải ảnh Bill chuyển khoản thành công</span
											>
											<label
												class="flex w-fit cursor-pointer items-center gap-1.5 rounded-[6px] border-2 border-black bg-white px-3 py-2 text-xs font-black text-black shadow-secondary transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-zinc-100 hover:shadow-none {isUploadingProofImage
													? 'pointer-events-none opacity-50'
													: ''}"
											>
												{#if isUploadingProofImage}
													<Loader2 class="h-4 w-4 animate-spin" />
													Đang tải ảnh lên...
												{:else}
													<Camera class="h-4 w-4" />
													Chụp ảnh bill chuyển khoản
												{/if}
												<input
													type="file"
													accept="image/*"
													capture="environment"
													class="hidden"
													disabled={isUploadingProofImage}
													onchange={handleProofImageChange}
												/>
											</label>
											{#if proofImageUrl}
												<img
													src={proofImageUrl}
													alt="Ảnh bill chuyển khoản"
													class="h-20 animate-[scale-up_0.2s_ease-out] rounded border-2 border-black bg-white object-contain p-1 shadow-secondary"
												/>
											{/if}

											<button
												type="submit"
												disabled={isSubmittingProof}
												class="flex w-full cursor-pointer items-center justify-center gap-1 rounded-[6px] border-2 border-black bg-blue-300 py-2.5 text-xs font-black text-black shadow-secondary transition-all hover:translate-x-[3px] hover:translate-y-[3px] hover:bg-blue-400 hover:shadow-none disabled:opacity-50"
											>
												Gửi hóa đơn chứng nhận đã chuyển khoản
												{#if isSubmittingProof}
													<Loader2 class="h-3.5 w-3.5 animate-spin" />
												{/if}
											</button>
										</form>
									</div>
								</div>
							</div>
						{/if}

						<!-- Bills list history -->
						<div class="overflow-hidden rounded-lg border-2 border-black bg-white shadow-secondary">
							<div class="flex items-center gap-2 border-b-2 border-black bg-zinc-100 p-5">
								<Receipt class="h-5 w-5 text-black" />
								<h3 class="text-lg font-black text-black">Lịch sử hóa đơn</h3>
							</div>

							{#if invoices.length === 0}
								<p class="bg-white p-8 text-center text-sm font-bold text-zinc-400">
									Chưa có hóa đơn nào được tạo.
								</p>
							{:else}
								<div class="divide-y-2 divide-black bg-white">
									{#each invoices as invoice}
										<div
											class="flex flex-col justify-between gap-4 p-4 md:flex-row md:items-center"
										>
											<div>
												<div class="flex items-center gap-2">
													<h4 class="text-sm font-black text-black">
														Hóa đơn tháng {invoice.month}
													</h4>
													<span
														class="rounded-full border border-black px-2.5 py-0.5 text-[9px] font-black uppercase {invoice.status ===
														'paid'
															? 'bg-green-200 text-green-800'
															: 'bg-red-200 text-red-800'}"
													>
														{invoice.status === 'paid' ? 'Đã đóng' : 'Chưa đóng'}
													</span>
												</div>
												<p class="mt-1 text-[10px] font-bold text-zinc-500">
													Hạn nộp: {new Date(invoice.dueDate).toLocaleDateString('vi-VN')}
												</p>

												<!-- Mini items list details -->
												<div class="mt-2 space-y-1 text-xs font-semibold text-zinc-600">
													{#each invoice.items as item}
														<p>• {item.name}: {formatCurrency(item.amount)}</p>
													{/each}
												</div>
											</div>

											<div class="flex shrink-0 flex-col items-end gap-2">
												<span class="text-base font-black text-black"
													>{formatCurrency(invoice.totalAmount)}</span
												>
												{#if invoice.status !== 'paid'}
													<button
														onclick={() => {
															openPayment(invoice);
															window.scrollTo({ top: 0, behavior: 'smooth' });
														}}
														class="cursor-pointer rounded-[6px] border-2 border-black bg-blue-300 px-3 py-1.5 text-xs font-black text-black shadow-secondary transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-blue-400 hover:shadow-none"
													>
														Thanh toán
													</button>
												{/if}
											</div>
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
						<div class="space-y-4 rounded-lg border-2 border-black bg-white p-5 shadow-secondary">
							<h3
								class="flex items-center gap-2 border-b-2 border-black pb-2 text-base font-black text-black"
							>
								Gửi báo cáo sự cố kỹ thuật phòng <Wrench class="h-5 w-5" />
							</h3>

							<form onsubmit={handleSubmitRequest} class="space-y-4">
								<div class="grid grid-cols-2 gap-4">
									<div class="space-y-1">
										<label
											for="req-cat"
											class="block text-xs font-bold tracking-wider text-zinc-600 uppercase"
											>Phân loại kỹ thuật</label
										>
										<select
											id="req-cat"
											bind:value={reqCategory}
											class="w-full rounded-lg border-2 border-black bg-white px-3 py-2 text-xs font-semibold text-black focus:outline-none"
										>
											<option value="maintenance">Nội thất/Gia dụng</option>
											<option value="plumbing">Đường ống nước</option>
											<option value="electrical">Hệ thống điện</option>
											<option value="internet">Mạng Wifi/Internet</option>
											<option value="other">Vấn đề khác</option>
										</select>
									</div>
									<div class="space-y-1">
										<label
											for="req-title"
											class="block text-xs font-bold tracking-wider text-zinc-600 uppercase"
											>Tiêu đề sự cố</label
										>
										<input
											id="req-title"
											type="text"
											bind:value={reqTitle}
											required
											placeholder="Rò rỉ nước nhà tắm / Hỏng máy lạnh..."
											class="w-full rounded-lg border-2 border-black bg-white px-3 py-2 text-xs font-semibold text-black focus:outline-none"
										/>
									</div>
								</div>

								<div class="space-y-1">
									<label
										for="req-desc"
										class="block text-xs font-bold tracking-wider text-zinc-600 uppercase"
										>Mô tả chi tiết vấn đề</label
									>
									<textarea
										id="req-desc"
										bind:value={reqDesc}
										required
										rows="3"
										placeholder="Mô tả cụ thể vấn đề giúp thợ sửa dễ hình dung (vị trí hỏng, hiện trạng)..."
										class="w-full rounded-lg border-2 border-black bg-white p-3 text-xs font-semibold text-black focus:outline-none"
									></textarea>
								</div>

								<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
									<div class="space-y-1">
										<span class="block text-xs font-bold tracking-wider text-zinc-600 uppercase"
											>Ảnh chụp sự cố (Tùy chọn)</span
										>
										<label
											class="flex w-fit cursor-pointer items-center gap-1.5 rounded-[6px] border-2 border-black bg-white px-3 py-2 text-xs font-black text-black shadow-secondary transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-zinc-100 hover:shadow-none {isUploadingReqImage
												? 'pointer-events-none opacity-50'
												: ''}"
										>
											{#if isUploadingReqImage}
												<Loader2 class="h-4 w-4 animate-spin" />
												Đang tải ảnh lên...
											{:else}
												<Camera class="h-4 w-4" />
												Chụp ảnh sự cố
											{/if}
											<input
												type="file"
												accept="image/*"
												capture="environment"
												class="hidden"
												disabled={isUploadingReqImage}
												onchange={handleReqImageChange}
											/>
										</label>
										{#if reqImage}
											<img
												src={reqImage}
												alt="Ảnh sự cố"
												class="mt-2 h-20 animate-[scale-up_0.2s_ease-out] rounded border-2 border-black bg-white object-contain p-1 shadow-secondary"
											/>
										{/if}
									</div>
									<div class="flex items-center gap-2 pt-5 text-xs font-bold select-none">
										<input
											id="req-imp"
											type="checkbox"
											bind:checked={reqIsImportant}
											class="h-4.5 w-4.5 cursor-pointer rounded border-2 border-black text-black focus:ring-blue-300"
										/>
										<label for="req-imp" class="block cursor-pointer text-red-600"
											>Sự cố khẩn cấp (Cần xử lý gấp)</label
										>
									</div>
								</div>

								<div class="flex justify-end border-t-2 border-black pt-3">
									<button
										type="submit"
										disabled={isSubmittingRequest}
										class="flex cursor-pointer items-center gap-1.5 rounded-[6px] border-2 border-black bg-blue-300 px-5 py-2.5 text-xs font-black text-black shadow-secondary transition-all hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none"
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
						<div class="overflow-hidden rounded-lg border-2 border-black bg-white shadow-secondary">
							<div class="border-b-2 border-black bg-zinc-100 p-5">
								<h3 class="text-lg font-black text-black">Lịch sử sự cố đã gửi</h3>
							</div>

							{#if requests.length === 0}
								<p class="bg-white p-8 text-center text-sm font-bold text-zinc-400">
									Chưa có sự cố nào được ghi nhận.
								</p>
							{:else}
								<div class="divide-y-2 divide-black bg-white">
									{#each requests as req}
										<div class="space-y-2 p-4 transition-colors hover:bg-slate-50">
											<div class="flex items-start justify-between">
												<div>
													<div class="flex items-center gap-2">
														<h4 class="text-sm font-black text-black">{req.title}</h4>
														<span
															class="rounded-full border border-black px-2 py-0.5 text-[9px] font-black uppercase {req.status ===
															'completed'
																? 'bg-green-150 text-green-800'
																: req.status === 'in_progress'
																	? 'bg-white text-blue-800'
																	: req.status === 'rejected'
																		? 'bg-zinc-100 text-zinc-500'
																		: 'bg-red-50 text-red-800'}"
														>
															{getStatusLabel(req.status)}
														</span>
														{#if req.priority === 'important'}
															<span
																class="animate-pulse rounded-full border border-black bg-red-500 px-2 py-0.5 text-[9px] font-black text-white uppercase"
																>Gấp</span
															>
														{/if}
													</div>
													<p class="mt-1 text-[10px] font-bold text-zinc-400">
														Ngày gửi: {new Date(req.createdAt).toLocaleDateString('vi-VN')}
													</p>
												</div>
											</div>
											<p class="text-xs leading-relaxed font-semibold text-zinc-600">
												{req.description}
											</p>

											<!-- Landlord reply message -->
											{#if req.response}
												<div
													class="mt-2 space-y-1 rounded-lg border-2 border-black bg-blue-50 p-3 text-xs"
												>
													<p class="flex items-center gap-1 font-black text-black">
														Phản hồi của chủ nhà:
														<User class="h-3.5 w-3.5" />
													</p>
													<p class="leading-relaxed font-semibold text-zinc-700 italic">
														{req.response}
													</p>
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
						<div class="space-y-4 rounded-lg border-2 border-black bg-white p-5 shadow-secondary">
							<h3
								class="flex items-center gap-2 border-b-2 border-black pb-2 text-base font-black text-black"
							>
								Báo số điện / số nước cuối tháng <Zap class="h-5 w-5 text-black" />
							</h3>

							{#if !fullRoomData}
								<p class="py-4 text-center text-xs font-bold text-zinc-500">
									Không tìm thấy thông tin phòng để ghi chỉ số.
								</p>
							{:else}
								<form onsubmit={handleSubmitMeter} class="space-y-4">
									<div class="grid grid-cols-2 gap-4">
										<div class="space-y-1">
											<label
												for="tenant-m-serv"
												class="block text-xs font-bold tracking-wider text-zinc-600 uppercase"
												>Dịch vụ đo lường</label
											>
											<select
												id="tenant-m-serv"
												bind:value={meterServiceId}
												required
												class="w-full rounded-lg border-2 border-black bg-white px-3 py-2 text-xs font-semibold text-black focus:outline-none"
											>
												<option value="">-- Chọn dịch vụ --</option>
												{#each fullRoomData.services.filter((s: any) => s.service.type === 'METERED') as c}
													<option value={c.serviceId}>{c.service.name}</option>
												{/each}
											</select>
										</div>
										<div class="space-y-1">
											<label
												for="tenant-m-month"
												class="block text-xs font-bold tracking-wider text-zinc-600 uppercase"
												>Tháng báo số</label
											>
											<input
												id="tenant-m-month"
												type="month"
												bind:value={meterMonth}
												required
												class="w-full rounded-lg border-2 border-black bg-white px-3 py-2 text-xs font-semibold text-black focus:outline-none"
											/>
										</div>
									</div>

									<div class="grid grid-cols-2 gap-4">
										<div class="space-y-1">
											<span class="block text-xs font-bold tracking-wider text-zinc-600 uppercase"
												>Chỉ số cũ (Kỳ trước)</span
											>
											<div
												class="w-full rounded-lg border-2 border-black bg-zinc-100 px-3 py-2 text-xs font-black text-black"
											>
												{meterPrev}
											</div>
										</div>
										<div class="space-y-1">
											<label
												for="tenant-m-curr"
												class="block text-xs font-bold tracking-wider text-zinc-600 uppercase"
												>Chỉ số mới (Thực tế)</label
											>
											<input
												id="tenant-m-curr"
												type="number"
												bind:value={meterCurr}
												required
												min={meterPrev}
												placeholder="Nhập số đo thực tế..."
												class="w-full rounded-lg border-2 border-black bg-white px-3 py-2 text-xs font-black text-black focus:border-indigo-500 focus:outline-none"
											/>
										</div>
									</div>

									<div class="space-y-1">
										<span class="block text-xs font-bold tracking-wider text-zinc-600 uppercase"
											>Ảnh chụp đồng hồ (Đồng kiểm)</span
										>
										<label
											class="flex w-fit cursor-pointer items-center gap-1.5 rounded-[6px] border-2 border-black bg-white px-3 py-2 text-xs font-black text-black shadow-secondary transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-zinc-100 hover:shadow-none {isUploadingMeterPhoto
												? 'pointer-events-none opacity-50'
												: ''}"
										>
											{#if isUploadingMeterPhoto}
												<Loader2 class="h-4 w-4 animate-spin" />
												Đang tải ảnh lên...
											{:else}
												<Camera class="h-4 w-4" />
												Chụp ảnh đồng hồ
											{/if}
											<input
												type="file"
												accept="image/*"
												capture="environment"
												class="hidden"
												disabled={isUploadingMeterPhoto}
												onchange={handleMeterPhotoChange}
											/>
										</label>
										{#if meterPhotoUrl}
											<img
												src={meterPhotoUrl}
												alt="Ảnh đồng hồ vừa chụp"
												class="mt-2 h-20 animate-[scale-up_0.2s_ease-out] rounded border-2 border-black bg-white object-contain p-1 shadow-secondary"
											/>
										{/if}
									</div>

									<div class="flex justify-end border-t-2 border-black pt-3">
										<button
											type="submit"
											disabled={isSubmittingMeter}
											class="flex cursor-pointer items-center gap-1.5 rounded-[6px] border-2 border-black bg-blue-300 px-5 py-2.5 text-xs font-black text-black shadow-secondary transition-all hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none"
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
						<div class="overflow-hidden rounded-lg border-2 border-black bg-white shadow-secondary">
							<div class="border-b-2 border-black bg-zinc-100 p-5">
								<h3 class="text-lg font-black text-black">Lịch sử tự báo số điện nước</h3>
							</div>

							{#if !fullRoomData || fullRoomData.meterReadings.length === 0}
								<p class="bg-white p-8 text-center text-sm font-bold text-zinc-400">
									Chưa có lịch sử báo số nào.
								</p>
							{:else}
								<div class="overflow-x-auto bg-white">
									<table class="w-full border-collapse text-left text-xs">
										<thead>
											<tr
												class="border-b-2 border-black bg-zinc-50 font-black tracking-wider text-zinc-600 uppercase"
											>
												<th class="px-4 py-3">Tháng</th>
												<th class="px-4 py-3">Dịch vụ</th>
												<th class="px-4 py-3">Chỉ số Cũ → Mới</th>
												<th class="px-4 py-3">Tiêu thụ</th>
												<th class="px-4 py-3">Trạng thái</th>
												<th class="px-4 py-3">Ảnh đồng hồ</th>
												<th class="px-4 py-3 text-right">Ngày gửi</th>
											</tr>
										</thead>
										<tbody class="divide-y divide-zinc-200">
											{#each fullRoomData.meterReadings as read}
												{@const serviceName =
													fullRoomData.services.find((s: any) => s.serviceId === read.serviceId)
														?.service.name || 'Điện/Nước'}
												{@const badge = getMeterStatusBadge(read.status)}
												<tr class="font-semibold text-zinc-600">
													<td class="px-4 py-3 font-black text-black">{read.month}</td>
													<td class="px-4 py-3 text-zinc-800">{serviceName}</td>
													<td class="px-4 py-3">{read.prevValue} → {read.currValue}</td>
													<td class="px-4 py-3 font-black text-black"
														>{read.currValue - read.prevValue}</td
													>
													<td class="px-4 py-3">
														<span
															class="rounded border-2 border-black px-1.5 text-xs font-black {badge.cls}"
															>{badge.label}</span
														>
													</td>
													<td class="px-4 py-3 font-bold text-blue-500">
														{#if read.photoUrl}
															<a
																href={read.photoUrl}
																target="_blank"
																rel="noreferrer"
																class="hover:underline">Xem ảnh</a
															>
														{:else}
															<span class="font-medium text-zinc-300">Không có</span>
														{/if}
													</td>
													<td class="px-4 py-3 text-right text-zinc-400"
														>{new Date(read.recordedAt).toLocaleDateString('vi-VN')}</td
													>
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
						<div class="space-y-4 rounded-lg border-2 border-black bg-white p-5 shadow-secondary">
							<h3
								class="flex items-center gap-2 border-b-2 border-black pb-2 text-base font-black text-black"
							>
								Thông tin Hợp đồng thuê nhà <Calendar class="h-5 w-5 text-black" />
							</h3>

							{#if activeContract}
								<!-- Hợp đồng chính thức đang hiệu lực -->
								<div class="grid grid-cols-1 gap-4 text-sm font-semibold text-black md:grid-cols-2">
									<div class="rounded-lg border-2 border-black bg-white p-4 shadow-secondary">
										<p class="text-xs font-black tracking-wider text-zinc-500 uppercase">
											Ngày bắt đầu
										</p>
										<p class="mt-1 text-base font-black text-black">
											{new Date(activeContract.startDate).toLocaleDateString('vi-VN')}
										</p>
									</div>
									<div
										class="rounded-lg border-2 border-black bg-white p-4 shadow-secondary {contractExpiringSoon()
											? 'bg-red-200'
											: ''}"
									>
										<p class="text-xs font-black tracking-wider text-zinc-500 uppercase">
											Ngày kết thúc
										</p>
										<p
											class="mt-1 text-base font-black {contractExpiringSoon()
												? 'text-red-600'
												: 'text-black'}"
										>
											{new Date(activeContract.endDate).toLocaleDateString('vi-VN')}
											{#if contractExpiringSoon()}
												<span
													class="ml-1 rounded-full border border-black bg-red-500 px-2 py-0.5 align-middle text-[9px] font-black text-white uppercase"
													>Sắp hết hạn</span
												>
											{/if}
										</p>
									</div>
									<div class="rounded-lg border-2 border-black bg-white p-4 shadow-secondary">
										<p class="text-xs font-black tracking-wider text-zinc-500 uppercase">
											Tiền thuê hàng tháng
										</p>
										<p class="mt-1 text-base font-black text-blue-600">
											{formatCurrency(activeContract.monthlyRent)}
										</p>
									</div>
									<div class="rounded-lg border-2 border-black bg-white p-4 shadow-secondary">
										<p class="text-xs font-black tracking-wider text-zinc-500 uppercase">
											Tiền cọc giữ chỗ
										</p>
										<p class="mt-1 text-base font-black text-green-600">
											{formatCurrency(activeContract.deposit)}
										</p>
									</div>
								</div>

								{#if activeContract.fileUrl}
									<a
										href={activeContract.fileUrl}
										target="_blank"
										rel="noreferrer"
										class="flex w-fit cursor-pointer items-center gap-1.5 rounded-[6px] border-2 border-black bg-blue-300 px-4 py-2 text-xs font-black text-black shadow-secondary transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-blue-400 hover:shadow-none"
									>
										<FileText class="h-4 w-4" />
										Xem file hợp đồng
									</a>
								{/if}

								<div
									class="space-y-1 rounded-lg border-2 border-black bg-white p-4 shadow-secondary"
								>
									<span class="block text-xs font-black tracking-wider text-zinc-500 uppercase"
										>Ghi chú & Thỏa thuận hợp đồng</span
									>
									<p class="mt-1 text-xs leading-relaxed font-bold text-zinc-700 italic">
										{activeContract.notes ||
											tenantNotes ||
											'Không có thỏa thuận đặc biệt nào ghi trong hợp đồng.'}
									</p>
								</div>
							{:else}
								<!-- Fallback: hiển thị thông tin từ hồ sơ khi chưa có hợp đồng chính thức -->
								<div class="grid grid-cols-1 gap-4 text-sm font-semibold text-black md:grid-cols-3">
									<div class="rounded-lg border-2 border-black bg-white p-4 shadow-secondary">
										<p class="text-xs font-black tracking-wider text-zinc-500 uppercase">
											Ngày dọn vào
										</p>
										<p class="mt-1 text-base font-black text-black">
											{tenantMoveInDate
												? new Date(tenantMoveInDate).toLocaleDateString('vi-VN')
												: '--'}
										</p>
									</div>
									<div class="rounded-lg border-2 border-black bg-white p-4 shadow-secondary">
										<p class="text-xs font-black tracking-wider text-zinc-500 uppercase">
											Tiền cọc giữ chỗ
										</p>
										<p class="mt-1 text-base font-black text-green-600">
											{formatCurrency(tenantDeposit)}
										</p>
									</div>
									<div class="rounded-lg border-2 border-black bg-white p-4 shadow-secondary">
										<p class="text-xs font-black tracking-wider text-zinc-500 uppercase">
											Phòng đang thuê
										</p>
										<p class="mt-1 text-base font-black text-blue-600">
											{roomDetails ? `Phòng ${roomDetails.roomNumber}` : 'Chưa xếp'}
										</p>
									</div>
								</div>

								<div
									class="space-y-1 rounded-lg border-2 border-black bg-white p-4 shadow-secondary"
								>
									<span class="block text-xs font-black tracking-wider text-zinc-500 uppercase"
										>Ghi chú & Thỏa thuận hợp đồng</span
									>
									<p class="mt-1 text-xs leading-relaxed font-bold text-zinc-700 italic">
										{tenantNotes || 'Không có thỏa thuận đặc biệt nào ghi trong hợp đồng.'}
									</p>
								</div>
							{/if}
						</div>

						<!-- Referral: giới thiệu phòng trống cho bạn bè -->
						<div class="space-y-4 rounded-lg border-2 border-black bg-white p-5 shadow-secondary">
							<h3
								class="flex items-center gap-2 border-b-2 border-black pb-2 text-base font-black text-black"
							>
								Giới thiệu phòng trống cho bạn bè <Home class="h-5 w-5 text-black" />
							</h3>

							{#if emptyRooms.length === 0}
								<p class="py-4 text-center text-xs font-bold text-zinc-500">
									Hiện tòa nhà không còn phòng trống nào.
								</p>
							{:else}
								<div
									class="divide-y-2 divide-black overflow-hidden rounded-lg border-2 border-black"
								>
									{#each emptyRooms as room}
										<div
											class="flex items-center justify-between gap-3 bg-white p-3 transition-colors hover:bg-slate-50"
										>
											<div>
												<p class="text-sm font-black text-black">Phòng {room.roomNumber}</p>
												<p class="mt-0.5 text-[10px] font-bold text-zinc-500">
													{getRoomTypeLabel(room.roomType)}{room.area ? ` • ${room.area}m2` : ''}
												</p>
											</div>
											<span class="shrink-0 text-sm font-black text-blue-600"
												>{formatCurrency(room.monthlyRent)}/tháng</span
											>
										</div>
									{/each}
								</div>

								<button
									onclick={handleCopyReferral}
									class="flex cursor-pointer items-center gap-1.5 rounded-[6px] border-2 border-black bg-blue-300 px-5 py-2.5 text-xs font-black text-black shadow-secondary transition-all hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none"
								>
									<Copy class="h-4 w-4" />
									Sao chép lời giới thiệu
								</button>
							{/if}
						</div>

						<!-- Documents Upload Form -->
						<div class="space-y-4 rounded-lg border-2 border-black bg-white p-5 shadow-secondary">
							<h3
								class="flex items-center gap-2 border-b-2 border-black pb-2 text-base font-black text-black"
							>
								Đồng bộ giấy tờ tùy thân & Ảnh check-in nhận phòng <Camera
									class="h-5 w-5 text-black"
								/>
							</h3>

							<form onsubmit={handleSubmitDocs} class="space-y-4">
								<div class="space-y-1">
									<label
										for="doc-cccd"
										class="block text-xs font-bold tracking-wider text-zinc-600 uppercase"
										>Số căn cước công dân (CCCD)</label
									>
									<input
										id="doc-cccd"
										type="text"
										bind:value={tenantIdNumber}
										required
										placeholder="Nhập 12 số CCCD..."
										class="w-full rounded-lg border-2 border-black bg-white px-3 py-2 text-xs font-black text-black focus:outline-none"
									/>
								</div>

								<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
									<div class="space-y-1">
										<span class="block text-xs font-bold tracking-wider text-zinc-600 uppercase"
											>Ảnh CCCD mặt trước</span
										>
										<label
											class="flex w-fit cursor-pointer items-center gap-1.5 rounded-[6px] border-2 border-black bg-white px-3 py-2 text-xs font-black text-black shadow-secondary transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-zinc-100 hover:shadow-none {uploadingDocField ===
											'front'
												? 'pointer-events-none opacity-50'
												: ''}"
										>
											{#if uploadingDocField === 'front'}
												<Loader2 class="h-4 w-4 animate-spin" />
												Đang tải ảnh lên...
											{:else}
												<Camera class="h-4 w-4" />
												Chụp/tải ảnh mặt trước
											{/if}
											<input
												type="file"
												accept="image/*"
												capture="environment"
												class="hidden"
												disabled={uploadingDocField !== null}
												onchange={(e) => handleDocImageChange(e, 'front')}
											/>
										</label>
										{#if tenantIdFrontImage}
											<img
												src={tenantIdFrontImage}
												alt="Mặt trước CCCD"
												class="mt-2 h-20 animate-[scale-up_0.2s_ease-out] rounded border-2 border-black bg-white object-contain p-1 shadow-secondary"
											/>
										{/if}
									</div>

									<div class="space-y-1">
										<span class="block text-xs font-bold tracking-wider text-zinc-600 uppercase"
											>Ảnh CCCD mặt sau</span
										>
										<label
											class="flex w-fit cursor-pointer items-center gap-1.5 rounded-[6px] border-2 border-black bg-white px-3 py-2 text-xs font-black text-black shadow-secondary transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-zinc-100 hover:shadow-none {uploadingDocField ===
											'back'
												? 'pointer-events-none opacity-50'
												: ''}"
										>
											{#if uploadingDocField === 'back'}
												<Loader2 class="h-4 w-4 animate-spin" />
												Đang tải ảnh lên...
											{:else}
												<Camera class="h-4 w-4" />
												Chụp/tải ảnh mặt sau
											{/if}
											<input
												type="file"
												accept="image/*"
												capture="environment"
												class="hidden"
												disabled={uploadingDocField !== null}
												onchange={(e) => handleDocImageChange(e, 'back')}
											/>
										</label>
										{#if tenantIdBackImage}
											<img
												src={tenantIdBackImage}
												alt="Mặt sau CCCD"
												class="mt-2 h-20 animate-[scale-up_0.2s_ease-out] rounded border-2 border-black bg-white object-contain p-1 shadow-secondary"
											/>
										{/if}
									</div>
								</div>

								<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
									<div class="space-y-1">
										<span class="block text-xs font-bold tracking-wider text-zinc-600 uppercase"
											>Ảnh đăng ký xe / Cà vẹt (Nếu có gửi xe)</span
										>
										<label
											class="flex w-fit cursor-pointer items-center gap-1.5 rounded-[6px] border-2 border-black bg-white px-3 py-2 text-xs font-black text-black shadow-secondary transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-zinc-100 hover:shadow-none {uploadingDocField ===
											'vehicle'
												? 'pointer-events-none opacity-50'
												: ''}"
										>
											{#if uploadingDocField === 'vehicle'}
												<Loader2 class="h-4 w-4 animate-spin" />
												Đang tải ảnh lên...
											{:else}
												<Camera class="h-4 w-4" />
												Chụp/tải ảnh cà vẹt
											{/if}
											<input
												type="file"
												accept="image/*"
												capture="environment"
												class="hidden"
												disabled={uploadingDocField !== null}
												onchange={(e) => handleDocImageChange(e, 'vehicle')}
											/>
										</label>
										{#if tenantVehicleImage}
											<img
												src={tenantVehicleImage}
												alt="Ảnh cà vẹt xe"
												class="mt-2 h-20 animate-[scale-up_0.2s_ease-out] rounded border-2 border-black bg-white object-contain p-1 shadow-secondary"
											/>
										{/if}
									</div>

									<div class="space-y-1">
										<span class="block text-xs font-bold tracking-wider text-zinc-600 uppercase"
											>Ảnh bàn giao phòng (Lúc check-in)</span
										>
										<label
											class="flex w-fit cursor-pointer items-center gap-1.5 rounded-[6px] border-2 border-black bg-white px-3 py-2 text-xs font-black text-black shadow-secondary transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-zinc-100 hover:shadow-none {uploadingDocField ===
											'checkin'
												? 'pointer-events-none opacity-50'
												: ''}"
										>
											{#if uploadingDocField === 'checkin'}
												<Loader2 class="h-4 w-4 animate-spin" />
												Đang tải ảnh lên...
											{:else}
												<Camera class="h-4 w-4" />
												Chụp/tải ảnh bàn giao
											{/if}
											<input
												type="file"
												accept="image/*"
												capture="environment"
												class="hidden"
												disabled={uploadingDocField !== null}
												onchange={(e) => handleDocImageChange(e, 'checkin')}
											/>
										</label>
										{#if tenantCheckInImage}
											<img
												src={tenantCheckInImage}
												alt="Ảnh check-in bàn giao"
												class="mt-2 h-20 animate-[scale-up_0.2s_ease-out] rounded border-2 border-black bg-white object-contain p-1 shadow-secondary"
											/>
										{/if}
									</div>
								</div>

								<div class="flex justify-end border-t-2 border-black pt-3">
									<button
										type="submit"
										disabled={isSubmittingDocs}
										class="flex cursor-pointer items-center gap-1.5 rounded-[6px] border-2 border-black bg-blue-300 px-5 py-2.5 text-xs font-black text-black shadow-secondary transition-all hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none"
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
						<div class="space-y-4 rounded-lg border-2 border-black bg-white p-5 shadow-secondary">
							<h3
								class="flex items-center gap-2 border-b-2 border-black pb-2 text-base font-black text-black"
							>
								Gửi lời nhắn / Đề xuất đặc biệt tới chủ trọ <MessageSquare
									class="h-5 w-5 text-black"
								/>
							</h3>

							<form onsubmit={handleSubmitNote} class="space-y-3">
								<label
									for="note-text"
									class="block text-xs font-bold tracking-wider text-zinc-600 uppercase"
									>Nội dung lời nhắn</label
								>
								<textarea
									id="note-text"
									bind:value={noteText}
									required
									rows="4"
									placeholder="Ví dụ: Đóng tiền trọ muộn 2 hôm / Đăng ký thêm 1 xe máy..."
									class="w-full rounded-lg border-2 border-black bg-white p-3 text-xs font-semibold text-black focus:outline-none"
								></textarea>

								<div class="flex justify-end border-t-2 border-black pt-3">
									<button
										type="submit"
										disabled={isSubmittingNote}
										class="flex cursor-pointer items-center gap-1.5 rounded-[6px] border-2 border-black bg-blue-300 px-5 py-2.5 text-xs font-black text-black shadow-secondary transition-all hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none"
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
						<div class="overflow-hidden rounded-lg border-2 border-black bg-white shadow-secondary">
							<div class="border-b-2 border-black bg-zinc-100 p-5">
								<h3 class="text-lg font-black text-black">Lời nhắn đã gửi</h3>
							</div>

							{#if notes.length === 0}
								<p class="bg-white p-8 text-center text-sm font-bold text-zinc-400">
									Chưa gửi lời nhắn nào.
								</p>
							{:else}
								<div class="divide-y-2 divide-black bg-white">
									{#each notes as note}
										<div
											class="space-y-2 p-4 transition-colors hover:bg-slate-50 {note.sender ===
											'LANDLORD'
												? 'bg-blue-100'
												: ''}"
										>
											<div class="flex items-center justify-between text-xs">
												<span class="font-bold text-zinc-400"
													>{new Date(note.createdAt).toLocaleString('vi-VN')}</span
												>
												{#if note.sender === 'LANDLORD'}
													<span
														class="rounded-full border border-black bg-blue-300 px-2 py-0.5 text-[9px] font-black text-black uppercase"
													>
														Chủ nhà nhắn
													</span>
												{:else}
													<span
														class="rounded-full border border-black px-2 py-0.5 text-[9px] font-black uppercase {note.isRead
															? 'bg-zinc-100 text-zinc-400'
															: 'bg-blue-200 text-blue-800'}"
													>
														{note.isRead ? 'Chủ nhà đã xem' : 'Chưa xem'}
													</span>
												{/if}
											</div>
											<p
												class="rounded-lg border-2 border-black p-2.5 text-xs leading-relaxed font-bold text-black {note.sender ===
												'LANDLORD'
													? 'bg-white'
													: 'bg-zinc-50'}"
											>
												{note.content}
											</p>
										</div>
									{/each}
								</div>
							{/if}
						</div>
					</div>

					<!-- 7. CHAT TAB -->
				{:else if activeTab === 'chat'}
					<div
						class="flex flex-col overflow-hidden rounded-lg border-2 border-black bg-white shadow-secondary"
					>
						<div class="flex items-center gap-2 border-b-2 border-black bg-zinc-100 p-5">
							<MessageSquare class="h-5 w-5 text-black" />
							<h3 class="text-lg font-black text-black">Chat với chủ nhà</h3>
						</div>

						{#if !fullRoomData?.property?.landlordId}
							<p class="bg-white p-8 text-center text-sm font-bold text-zinc-400">
								Chưa có thông tin chủ nhà để trò chuyện.
							</p>
						{:else}
							<div
								bind:this={chatBox}
								class="h-[50vh] flex-1 space-y-2 overflow-y-auto bg-slate-50 p-4"
							>
								{#if chatMessages.length === 0}
									<p class="py-8 text-center text-xs font-bold text-zinc-400">
										Chưa có tin nhắn nào. Gửi lời chào tới chủ nhà nhé!
									</p>
								{:else}
									{#each chatMessages as msg (msg.id)}
										<div class="flex {msg.senderId === userId ? 'justify-end' : 'justify-start'}">
											<div
												class="max-w-[75%] rounded-lg border-2 border-black p-2 text-sm font-semibold text-black {msg.senderId ===
												userId
													? 'bg-blue-300'
													: 'bg-white'}"
											>
												<p class="leading-relaxed break-words whitespace-pre-wrap">{msg.content}</p>
												<p
													class="mt-1 text-[9px] font-bold text-zinc-500 {msg.senderId === userId
														? 'text-right'
														: ''}"
												>
													{new Date(msg.createdAt).toLocaleString('vi-VN')}
												</p>
											</div>
										</div>
									{/each}
								{/if}
							</div>

							<form
								onsubmit={handleSendChat}
								class="flex items-center gap-2 border-t-2 border-black bg-white p-3"
							>
								<input
									type="text"
									bind:value={chatInput}
									placeholder="Nhập tin nhắn gửi chủ nhà..."
									class="flex-1 rounded-lg border-2 border-black bg-white px-3 py-2 text-xs font-semibold text-black focus:outline-none"
								/>
								<button
									type="submit"
									disabled={isSendingChat || !chatInput.trim()}
									class="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-[6px] border-2 border-black bg-blue-300 px-4 py-2 text-xs font-black text-black shadow-secondary transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-blue-400 hover:shadow-none disabled:opacity-50"
								>
									Gửi
									{#if isSendingChat}
										<Loader2 class="h-3.5 w-3.5 animate-spin" />
									{:else}
										<Send class="h-3.5 w-3.5" />
									{/if}
								</button>
							</form>
						{/if}
					</div>
				{/if}
			</div>
		</main>
	{/if}
</div>

<style>
	@keyframes scale-up {
		from {
			transform: scale(0.95);
			opacity: 0;
		}
		to {
			transform: scale(1);
			opacity: 1;
		}
	}
</style>
