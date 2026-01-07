'use client';

import { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Camera, Upload, X, Check, Loader2, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ImageUploaderProps {
  label: string;
  imageUrl?: string | null;
  onUpload?: (file: File) => void;
  onRemove?: () => void;
  aspectRatio?: number;
  className?: string;
}

export function ImageUploader({
  label,
  imageUrl,
  onUpload,
  onRemove,
  aspectRatio = 16 / 10,
  className
}: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(imageUrl || null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Chỉ chấp nhận file ảnh');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước file tối đa là 5MB');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Simulate upload with progress
    setIsUploading(true);
    setUploadProgress(0);

    // Simulate compression message
    toast.info('Đang nén ảnh...', {
      description: `${label} - ${(file.size / 1024).toFixed(0)}KB`,
    });

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 10;
      });
    }, 100);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    clearInterval(progressInterval);
    setUploadProgress(100);

    await new Promise(resolve => setTimeout(resolve, 300));

    setIsUploading(false);
    setUploadProgress(0);

    toast.success('Đã tải ảnh lên thành công', {
      description: label,
    });

    onUpload?.(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
    // Reset input
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleRemove = () => {
    setPreview(null);
    toast.success('Đã xóa ảnh', {
      description: label,
    });
    onRemove?.();
  };

  const handleClick = () => {
    if (!isUploading && !preview) {
      fileInputRef.current?.click();
    }
  };

  return (
    <Card
      className={cn(
        'overflow-hidden transition-all',
        isDragOver && 'ring-2 ring-primary ring-offset-2',
        className
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleInputChange}
      />

      <AspectRatio ratio={aspectRatio}>
        {preview ? (
          // Image preview mode
          <div className="relative w-full h-full group">
            <img
              src={preview}
              alt={label}
              className="w-full h-full object-cover"
            />

            {/* Overlay with actions */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                <Upload className="h-4 w-4 mr-2" />
                Thay đổi
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleRemove}
                disabled={isUploading}
              >
                <X className="h-4 w-4 mr-2" />
                Xóa
              </Button>
            </div>

            {/* Upload progress overlay */}
            {isUploading && (
              <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-3 p-4">
                <Loader2 className="h-8 w-8 text-white animate-spin" />
                <p className="text-white text-sm">Đang tải lên...</p>
                <div className="w-full max-w-[200px]">
                  <Progress value={uploadProgress} className="h-2" />
                </div>
                <p className="text-white/70 text-xs">{uploadProgress}%</p>
              </div>
            )}

            {/* Success indicator */}
            {!isUploading && preview && (
              <div className="absolute top-2 right-2">
                <div className="bg-emerald-500 text-white rounded-full p-1">
                  <Check className="h-4 w-4" />
                </div>
              </div>
            )}
          </div>
        ) : (
          // Empty state - upload prompt
          <button
            type="button"
            className={cn(
              'w-full h-full bg-muted flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors',
              isDragOver ? 'bg-primary/10' : 'hover:bg-muted/80'
            )}
            onClick={handleClick}
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-10 w-10 text-muted-foreground animate-spin" />
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Đang tải lên...</p>
                  <div className="w-32 mt-2">
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className={cn(
                  'p-4 rounded-full transition-colors',
                  isDragOver ? 'bg-primary/20' : 'bg-muted-foreground/10'
                )}>
                  {isDragOver ? (
                    <ImageIcon className="h-8 w-8 text-primary" />
                  ) : (
                    <Camera className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    {isDragOver ? 'Thả ảnh vào đây' : 'Chưa có ảnh'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Kéo thả hoặc bấm để chọn ảnh
                  </p>
                </div>
                <Button variant="outline" size="sm" disabled={isUploading}>
                  <Upload className="h-4 w-4 mr-2" />
                  Chọn ảnh
                </Button>
              </>
            )}
          </button>
        )}
      </AspectRatio>
    </Card>
  );
}
