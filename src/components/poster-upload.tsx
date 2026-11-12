"use client";

import * as React from "react";
import { CldUploadWidget } from "next-cloudinary";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, X, Link as LinkIcon, Image as ImageIcon, Loader2 } from "lucide-react";
import Image from "next/image";
import { Tape } from "@/components/ui-theme/tape";
import { Sticker } from "@/components/ui-theme/sticker";

interface PosterUploadProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  disabled?: boolean;
}

export function PosterUpload({ value, onChange, disabled }: PosterUploadProps) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset =
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "default_preset";

  const [mode, setMode] = React.useState<"file" | "url">("file");
  const [urlInput, setUrlInput] = React.useState("");
  const [isProcessingFile, setIsProcessingFile] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Helper to downscale and convert image to data URL to keep database lightweight
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file (PNG, JPG, WebP).");
      return;
    }

    setIsProcessingFile(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxDim = 1200;
        let { width, height } = img;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.85);
          onChange(compressedDataUrl);
        } else {
          onChange(event.target?.result as string);
        }
        setIsProcessingFile(false);
      };
      img.onerror = () => {
        onChange(event.target?.result as string);
        setIsProcessingFile(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleApplyUrl = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
      setUrlInput("");
    }
  };

  // Preview state if image exists
  if (value) {
    return (
      <div className="relative inline-block pt-3 pb-2 px-2.5 bg-white border-2 border-ink rounded-[3px] shadow-hard -rotate-1 max-w-sm">
        <Tape color="blue" rotation="-rotate-2" className="-top-3 left-1/2 -translate-x-1/2" />
        <div className="relative w-72 sm:w-80 h-44 border border-ink/40 overflow-hidden bg-black/5">
          <Image
            src={value}
            alt="Event poster"
            fill
            unoptimized={value.startsWith("data:") || value.startsWith("blob:")}
            className="object-cover"
          />
        </div>
        <div className="flex items-center justify-between pt-2.5 px-1">
          <Sticker color="yellow" className="text-[10px]">
            POSTER ATTACHED ✓
          </Sticker>
          <button
            type="button"
            onClick={() => onChange(null)}
            disabled={disabled}
            className="px-2 py-0.5 border border-ink bg-[#FDF2F4] hover:bg-[#F0508C] hover:text-white rounded-[2px] font-mono text-xs text-ink transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
            title="Remove poster"
          >
            <X className="h-3 w-3" />
            <span>Remove</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-w-md">
      {/* Upload mode tabs */}
      <div className="flex items-center gap-2 border-b border-ink/20 pb-2">
        <button
          type="button"
          onClick={() => setMode("file")}
          className={`flex items-center gap-1.5 px-3 py-1 text-xs font-mono rounded-[2px] border-2 transition-all ${
            mode === "file"
              ? "bg-[#F6C945] border-ink font-bold shadow-hard-sm"
              : "bg-paper border-transparent text-muted-ink hover:text-ink"
          }`}
        >
          <ImageIcon className="h-3.5 w-3.5" />
          <span>Upload File</span>
        </button>
        <button
          type="button"
          onClick={() => setMode("url")}
          className={`flex items-center gap-1.5 px-3 py-1 text-xs font-mono rounded-[2px] border-2 transition-all ${
            mode === "url"
              ? "bg-[#F6C945] border-ink font-bold shadow-hard-sm"
              : "bg-paper border-transparent text-muted-ink hover:text-ink"
          }`}
        >
          <LinkIcon className="h-3.5 w-3.5" />
          <span>Image Link</span>
        </button>
      </div>

      {mode === "file" && (
        <div className="space-y-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="hidden"
            disabled={disabled || isProcessingFile}
          />

          <div
            onClick={() => !disabled && !isProcessingFile && fileInputRef.current?.click()}
            className="border-2 border-dashed border-ink bg-white rounded-[3px] p-6 text-center cursor-pointer hover:bg-paper-cream hover:border-black transition-all flex flex-col items-center justify-center gap-2 shadow-hard-sm group"
          >
            {isProcessingFile ? (
              <>
                <Loader2 className="h-6 w-6 animate-spin text-ink" />
                <span className="font-mono text-xs font-bold text-ink">
                  Processing image...
                </span>
              </>
            ) : (
              <>
                <div className="h-10 w-10 rounded-[3px] border border-ink bg-[#F3E6B8] flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                  <Upload className="h-5 w-5 text-ink" />
                </div>
                <div className="space-y-0.5">
                  <span className="block font-mono text-xs font-bold text-ink uppercase tracking-wider">
                    Click to Choose Image From Device
                  </span>
                  <span className="block font-hand text-sm text-muted-ink">
                    JPG, PNG, WebP up to 10MB (auto-compressed)
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Cloudinary fallback button if credentials present */}
          {cloudName && (
            <div className="pt-1">
              <CldUploadWidget
                uploadPreset={uploadPreset}
                onSuccess={(result) => {
                  if (
                    result.info &&
                    typeof result.info === "object" &&
                    "secure_url" in result.info
                  ) {
                    onChange(result.info.secure_url as string);
                  }
                }}
                options={{
                  maxFiles: 1,
                  resourceType: "image",
                }}
              >
                {({ open }) => (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={disabled}
                    onClick={() => open?.()}
                    className="w-full text-xs font-mono h-8 border-ink"
                  >
                    Or Upload via Cloudinary Cloud ↗
                  </Button>
                )}
              </CldUploadWidget>
            </div>
          )}
        </div>
      )}

      {mode === "url" && (
        <div className="space-y-2 bg-white border-2 border-ink rounded-[3px] p-3 shadow-hard-sm">
          <label className="block font-mono text-[11px] font-bold text-ink uppercase">
            Direct Poster Image URL:
          </label>
          <div className="flex gap-2">
            <Input
              type="url"
              placeholder="https://example.com/poster.jpg"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              disabled={disabled}
              className="text-xs font-mono h-9"
            />
            <Button
              type="button"
              variant="yellow"
              size="sm"
              onClick={handleApplyUrl}
              disabled={disabled || !urlInput.trim()}
              className="h-9 px-3 text-xs font-mono-label shrink-0"
            >
              Apply
            </Button>
          </div>
          <span className="block font-hand text-xs text-muted-ink">
            Paste any publicly accessible image link (Unsplash, Imgur, etc.)
          </span>
        </div>
      )}
    </div>
  );
}
