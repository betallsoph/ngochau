// Xử lý ảnh phía client trước khi upload:
// 1. Resize về tối đa 1280px và nén JPEG (~150-300KB) để tiết kiệm băng thông
// 2. Đóng dấu thời gian + nhãn lên góc ảnh để chống dùng lại ảnh cũ (ảnh đồng hồ, bill)

const MAX_DIMENSION = 1280;
const JPEG_QUALITY = 0.72;

function loadImage(file: File): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const url = URL.createObjectURL(file);
		const img = new Image();
		img.onload = () => {
			URL.revokeObjectURL(url);
			resolve(img);
		};
		img.onerror = () => {
			URL.revokeObjectURL(url);
			reject(new Error('Không đọc được file ảnh'));
		};
		img.src = url;
	});
}

export async function compressImage(file: File, watermarkLabel?: string): Promise<Blob> {
	const img = await loadImage(file);

	const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height));
	const width = Math.round(img.width * scale);
	const height = Math.round(img.height * scale);

	const canvas = document.createElement('canvas');
	canvas.width = width;
	canvas.height = height;
	const ctx = canvas.getContext('2d')!;
	ctx.drawImage(img, 0, 0, width, height);

	if (watermarkLabel) {
		const stamp = new Date().toLocaleString('vi-VN', { hour12: false });
		const text = `${watermarkLabel} • ${stamp}`;
		const fontSize = Math.max(14, Math.round(width / 45));
		ctx.font = `bold ${fontSize}px sans-serif`;
		const padding = fontSize * 0.6;
		const textWidth = ctx.measureText(text).width;

		ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
		ctx.fillRect(
			0,
			height - fontSize - padding * 2,
			textWidth + padding * 2,
			fontSize + padding * 2
		);
		ctx.fillStyle = '#ffffff';
		ctx.textBaseline = 'middle';
		ctx.fillText(text, padding, height - (fontSize + padding * 2) / 2);
	}

	return new Promise((resolve, reject) => {
		canvas.toBlob(
			(blob) => (blob ? resolve(blob) : reject(new Error('Không nén được ảnh'))),
			'image/jpeg',
			JPEG_QUALITY
		);
	});
}

// Nén (kèm watermark nếu có nhãn) rồi upload, trả về URL ảnh trên server
export async function uploadImage(file: File, watermarkLabel?: string): Promise<string> {
	const blob = await compressImage(file, watermarkLabel);

	const formData = new FormData();
	formData.append('file', new File([blob], 'photo.jpg', { type: 'image/jpeg' }));

	const res = await fetch('/api/upload', { method: 'POST', body: formData });
	const data = await res.json();
	if (!res.ok) throw new Error(data.error || 'Upload ảnh thất bại');

	return data.url;
}
