"use client";

import { useRef, useState } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
}

export function ImageUploader({
  value,
  onChange,
  folder = "banners",
}: ImageUploaderProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const supabase = createClient();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("Fichier trop volumineux (max 5 Mo)");
      return;
    }

    setUploading(true);
    setError("");

    const ext = file.name.split(".").pop();
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error: uploadErr } = await supabase.storage
      .from("content")
      .upload(path, file, { upsert: true });

    if (uploadErr) {
      setError(uploadErr.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("content").getPublicUrl(path);
    onChange(data.publicUrl);
    setUploading(false);
  };

  const clear = () => {
    onChange("");
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div>
      <div
        className="relative w-full h-44 rounded-card border-2 border-dashed border-border hover:border-pink-primary/40 transition-colors cursor-pointer overflow-hidden group"
        onClick={() => !uploading && fileRef.current?.click()}
      >
        {value ? (
          <>
            <img src={value} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-bg-primary/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <span className="text-[14px] text-text-primary font-medium">
                Changer
              </span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                clear();
              }}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-bg-primary/80 flex items-center justify-center text-text-tertiary hover:text-pink-primary z-10"
            >
              <X className="w-4 h-4" />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-text-tertiary">
            {uploading ? (
              <Loader2 className="w-6 h-6 animate-spin text-pink-primary" />
            ) : (
              <>
                <Upload className="w-8 h-8 mb-2" />
                <span className="text-[14px]">Cliquez pour envoyer</span>
                <span className="text-[12px] mt-1">JPG, PNG ou WebP · max 5 Mo</span>
              </>
            )}
          </div>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleUpload}
        />
      </div>
      {error && <p className="text-[12px] text-pink-primary mt-1">{error}</p>}
    </div>
  );
}
