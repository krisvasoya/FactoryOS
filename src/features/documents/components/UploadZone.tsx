'use client';

import React, { useCallback, useState } from 'react';
import { Upload, FileText, Image, Camera, Scan, X } from 'lucide-react';

interface UploadZoneProps {
  onFileSelected: (file: File) => void;
  error?: string;
}

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
const MAX_SIZE_MB = 10;

export function UploadZone({ onFileSelected, error }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState('');
  const [preview, setPreview] = useState<{ name: string; size: string; type: string } | null>(null);

  const validateAndProcess = useCallback((file: File) => {
    setFileError('');
    if (!ALLOWED_TYPES.includes(file.type)) {
      setFileError('Unsupported file type. Please use PDF, JPG, or PNG.');
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setFileError(`File is too large. Maximum size is ${MAX_SIZE_MB}MB.`);
      return;
    }
    const sizeMB = (file.size / 1024 / 1024).toFixed(2);
    setPreview({ name: file.name, size: `${sizeMB} MB`, type: file.type });
    onFileSelected(file);
  }, [onFileSelected]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) validateAndProcess(file);
  }, [validateAndProcess]);

  const onInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndProcess(file);
  }, [validateAndProcess]);

  const displayError = fileError || error;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <label
        htmlFor="invoice-upload"
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={`
          relative flex flex-col items-center justify-center min-h-[320px] rounded-2xl cursor-pointer
          border-2 border-dashed transition-all duration-300
          ${isDragging
            ? 'border-sky-400 bg-sky-500/10 scale-[1.01]'
            : 'border-border hover:border-sky-400/60 hover:bg-sky-500/5 bg-card/50'
          }
        `}
        style={{ backdropFilter: 'blur(10px)' }}
      >
        {/* Animated background gradient */}
        <div
          className={`absolute inset-0 rounded-2xl transition-opacity duration-300 ${isDragging ? 'opacity-100' : 'opacity-0'}`}
          style={{ background: 'radial-gradient(ellipse at center, rgba(56,189,248,0.08) 0%, transparent 70%)' }}
        />

        <div className="relative z-10 flex flex-col items-center gap-5 px-8 py-10 text-center">
          {/* Icon cluster */}
          <div className="relative">
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300
              ${isDragging ? 'bg-sky-500/20 scale-110' : 'bg-secondary/30'}`}
              style={{ boxShadow: isDragging ? '0 0 40px rgba(56,189,248,0.3)' : 'none' }}
            >
              <Scan className={`h-10 w-10 transition-all duration-300 ${isDragging ? 'text-sky-400' : 'text-muted-foreground'}`} />
            </div>
            <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-sky-500/20 border border-sky-500/30 flex items-center justify-center">
              <FileText className="h-3.5 w-3.5 text-sky-400" />
            </div>
            <div className="absolute -bottom-2 -left-2 w-7 h-7 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
              <Camera className="h-3.5 w-3.5 text-purple-400" />
            </div>
          </div>

          <div className="space-y-1.5">
            <p className="text-sm font-bold text-foreground">
              {isDragging ? 'Drop your invoice here' : 'Upload Supplier Invoice'}
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Drag & drop or click to browse<br />
              Gemini Vision AI will extract all data automatically
            </p>
          </div>

          {/* File type badges */}
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {[
              { label: 'PDF', icon: FileText, color: 'text-red-400 border-red-400/30 bg-red-400/10' },
              { label: 'JPG', icon: Image, color: 'text-orange-400 border-orange-400/30 bg-orange-400/10' },
              { label: 'PNG', icon: Image, color: 'text-blue-400 border-blue-400/30 bg-blue-400/10' },
              { label: 'Camera', icon: Camera, color: 'text-green-400 border-green-400/30 bg-green-400/10' },
            ].map(({ label, icon: Icon, color }) => (
              <span key={label} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[10px] font-bold ${color}`}>
                <Icon className="h-3 w-3" />
                {label}
              </span>
            ))}
          </div>

          <p className="text-[10px] text-muted-foreground/60">Max size 10MB · Works with scanned documents & mobile photos</p>
        </div>

        <input
          id="invoice-upload"
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.webp"
          className="sr-only"
          onChange={onInputChange}
        />
      </label>

      {/* Preview card */}
      {preview && (
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-xs animate-fade-in">
          <div className="w-8 h-8 rounded-lg bg-sky-500/15 flex items-center justify-center flex-shrink-0">
            {preview.type === 'application/pdf'
              ? <FileText className="h-4 w-4 text-sky-400" />
              : <Image className="h-4 w-4 text-sky-400" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate text-foreground">{preview.name}</p>
            <p className="text-muted-foreground">{preview.size}</p>
          </div>
          <button
            onClick={(e) => { e.preventDefault(); setPreview(null); }}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Error display */}
      {displayError && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-xs text-red-400 animate-fade-in">
          ⚠️ {displayError}
        </div>
      )}
    </div>
  );
}
