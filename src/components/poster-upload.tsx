"use client";

import { CldUploadWidget } from "next-cloudinary";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import Image from "next/image";

interface PosterUploadProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  disabled?: boolean;
}

export function PosterUpload({ value, onChange, disabled }: PosterUploadProps) {
  const uploadPreset =
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "default_preset";

  return (
    <div className="space-y-3">
      {value ? (
        <div className="relative w-full max-w-xs h-40 rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
          <Image
            src={value}
            alt="Event poster"
            fill
            className="object-cover"
          />
          <button
            type="button"
            onClick={() => onChange(null)}
            disabled={disabled}
            className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 rounded-full text-white transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
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
                className="h-28 border-dashed border-2 flex flex-col items-center justify-center gap-1.5 hover:bg-slate-50 cursor-pointer"
              >
                <Upload className="h-5 w-5 text-slate-500" />
                <span className="text-xs font-medium text-slate-700">
                  Upload Event Poster
                </span>
                <span className="text-[11px] text-slate-400">
                  Image files via Cloudinary
                </span>
              </Button>
            </div>
          )}
        </CldUploadWidget>
      )}
    </div>
  );
}

