"use client";

import { CldUploadWidget } from "next-cloudinary";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import Image from "next/image";
import { Tape } from "@/components/ui-theme/tape";

interface PosterUploadProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  disabled?: boolean;
}

export function PosterUpload({ value, onChange, disabled }: PosterUploadProps) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset =
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "default_preset";

  if (value) {
    return (
      <div className="relative inline-block pt-3 pb-2 px-2 bg-paper border-2 border-ink rounded-[3px] shadow-hard -rotate-1 max-w-xs">
        <Tape color="blue" rotation="-rotate-3" className="-top-3 left-1/2 -translate-x-1/2" />
        <div className="relative w-64 h-36 border border-ink/40 overflow-hidden bg-black/5">
          <Image
            src={value}
            alt="Event poster"
            fill
            className="object-cover"
          />
        </div>
        <div className="flex items-center justify-between pt-2 px-1">
          <span className="font-mono text-[10px] text-muted-ink uppercase">Poster Attachment</span>
          <button
            type="button"
            onClick={() => onChange(null)}
            disabled={disabled}
            className="p-1 border border-ink bg-[#FDF2F4] hover:bg-[#F0508C] hover:text-white rounded-[2px] text-ink transition-colors cursor-pointer"
            title="Remove poster"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      </div>
    );
  }

  if (!cloudName) {
    return (
      <div className="h-28 max-w-xs border-2 border-dashed border-ink rounded-[3px] bg-paper-cream flex flex-col items-center justify-center gap-1 p-4 text-center">
        <Upload className="h-5 w-5 text-muted-ink" />
        <span className="text-xs font-mono font-bold text-ink uppercase tracking-wider">
          Upload unavailable
        </span>
        <span className="text-[11px] font-mono text-muted-ink">
          Cloudinary not configured
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
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
          <div className="flex flex-col gap-2 max-w-xs">
            <Button
              type="button"
              variant="outline"
              disabled={disabled}
              onClick={() => open?.()}
              className="h-28 border-2 border-dashed border-ink bg-paper flex flex-col items-center justify-center gap-1.5 hover:bg-[#F6C945]/20 cursor-pointer shadow-hard-sm"
            >
              <Upload className="h-5 w-5 text-ink" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-ink">
                Upload Event Poster
              </span>
              <span className="text-[11px] font-mono text-muted-ink">
                JPG, PNG via Cloudinary
              </span>
            </Button>
          </div>
        )}
      </CldUploadWidget>
    </div>
  );
}
