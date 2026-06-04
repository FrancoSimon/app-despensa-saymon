"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
const maxFileSize = 2 * 1024 * 1024;

type ProductImageUploadProps = {
  initialUrl?: string | null;
  onUploadingChange?: (isUploading: boolean) => void;
};

function extensionFor(file: File) {
  const fromName = file.name.split(".").pop()?.toLowerCase();

  if (fromName && ["jpg", "jpeg", "png", "webp"].includes(fromName)) {
    return fromName === "jpeg" ? "jpg" : fromName;
  }

  return file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
}

export function ProductImageUpload({
  initialUrl,
  onUploadingChange,
}: ProductImageUploadProps) {
  const [imageUrl, setImageUrl] = useState(initialUrl ?? "");
  const [previewUrl, setPreviewUrl] = useState(initialUrl ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const hasImage = previewUrl.length > 0;

  const label = useMemo(
    () => (imageUrl ? "Reemplazar foto" : "Seleccionar foto"),
    [imageUrl],
  );

  useEffect(() => {
    onUploadingChange?.(isUploading);
  }, [isUploading, onUploadingChange]);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setError(null);

    if (!file) {
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      setError("La imagen debe ser JPG, PNG o WEBP.");
      event.target.value = "";
      return;
    }

    if (file.size > maxFileSize) {
      setError("La imagen no puede superar 2MB.");
      event.target.value = "";
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);
    setIsUploading(true);

    const supabase = createClient();
    const path = `products/${Date.now()}-${crypto.randomUUID()}.${extensionFor(file)}`;
    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(path, file, {
        cacheControl: "31536000",
        upsert: false,
      });

    if (uploadError) {
      setError(uploadError.message);
      setPreviewUrl(imageUrl);
      setIsUploading(false);
      URL.revokeObjectURL(localPreview);
      return;
    }

    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    setImageUrl(data.publicUrl);
    setPreviewUrl(data.publicUrl);
    setIsUploading(false);
    URL.revokeObjectURL(localPreview);
  }

  return (
    <div className="grid gap-3">
      <input type="hidden" name="imagenUrl" value={imageUrl} />
      <label className="mb-0 block text-sm font-medium text-zinc-200">
        Foto del producto
      </label>
      <div className="grid gap-4 rounded-md border border-white/10 bg-black p-4 md:grid-cols-[160px_1fr]">
        <div className="relative grid aspect-square place-items-center overflow-hidden rounded-md border border-white/10 bg-zinc-950">
          {hasImage ? (
            <Image
              src={previewUrl}
              alt="Vista previa del producto"
              fill
              sizes="160px"
              className="object-cover"
            />
          ) : (
            <span className="px-4 text-center text-sm text-zinc-500">
              Sin imagen
            </span>
          )}
        </div>
        <div className="flex flex-col justify-center gap-3">
          <p className="text-sm leading-6 text-zinc-400">
            Sube una imagen JPG, PNG o WEBP de hasta 2MB. Se guardara en
            Supabase Storage.
          </p>
          <label className="inline-flex w-fit cursor-pointer rounded-md bg-lime-300 px-4 py-3 text-sm font-black text-black transition hover:bg-lime-200">
            {isUploading ? "Subiendo..." : label}
            <input
              className="sr-only"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </label>
          {imageUrl ? (
            <p className="break-all text-xs text-zinc-500">{imageUrl}</p>
          ) : null}
          {error ? (
            <p className="rounded-md border border-red-400/30 bg-red-950/40 px-3 py-2 text-sm text-red-100">
              {error}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

