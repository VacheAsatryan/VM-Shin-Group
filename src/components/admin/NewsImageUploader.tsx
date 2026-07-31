"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";

interface NewsImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  error?: string;
  bucketName?: string;
  label?: string;
}

export default function NewsImageUploader({
  value,
  onChange,
  error,
  bucketName = "news",
  label,
}: NewsImageUploaderProps) {
  const t = useTranslations("adminCareers");
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setUploadError("Please select a valid image file (PNG, JPG, WebP, etc.)");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError("Image size must be less than 10 MB");
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const supabase = createClient();
      const fileExt = file.name.split(".").pop() || "jpg";
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `cover-images/${fileName}`;

      const { data, error: uploadErr } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadErr) {
        throw new Error(uploadErr.message || "Failed to upload image");
      }

      const { data: publicUrlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(data.path);

      if (publicUrlData?.publicUrl) {
        onChange(publicUrlData.publicUrl);
      } else {
        throw new Error("Failed to generate public URL for uploaded image");
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleUpload(e.target.files[0]);
    }
  };

  const handleRemoveImage = () => {
    onChange("");
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-zinc-300">
        {label || t("coverImage")}
      </label>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Preview or Dropzone */}
      {value ? (
        <div className="relative w-full h-48 rounded-2xl bg-zinc-950 border border-zinc-800 overflow-hidden group">
          <Image
            src={value}
            alt="Cover preview"
            fill
            className="object-cover"
            unoptimized
          />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 rounded-xl text-xs font-semibold shadow-lg transition-colors"
            >
              🔄 {t("browseFile")}
            </button>
            <button
              type="button"
              onClick={handleRemoveImage}
              className="px-3 py-1.5 bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-600/50 rounded-xl text-xs font-semibold shadow-lg transition-colors"
            >
              🗑️ {t("deleteAction")}
            </button>
          </div>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`w-full h-36 border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all ${
            isDragging
              ? "border-[#F5C21B] bg-[#F5C21B]/10"
              : "border-zinc-800 bg-zinc-950/60 hover:border-zinc-700 hover:bg-zinc-950"
          }`}
        >
          {isUploading ? (
            <div className="flex items-center gap-2 text-xs font-semibold text-[#F5C21B]">
              <span className="animate-spin text-lg">⏳</span>
              <span>{t("saving")}</span>
            </div>
          ) : (
            <div className="text-center space-y-1.5 select-none">
              <div className="text-2xl">🖼️</div>
              <p className="text-xs font-semibold text-zinc-200">
                {t("dragDropImage")} <span className="text-[#F5C21B] underline">{t("browseFile")}</span>
              </p>
              <p className="text-[11px] text-zinc-500">{t("imageConstraints")}</p>
            </div>
          )}
        </div>
      )}

      {(uploadError || error) && (
        <p className="text-rose-400 text-[11px] font-medium">⚠️ {uploadError || error}</p>
      )}
    </div>
  );
}
