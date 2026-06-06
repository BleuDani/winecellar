"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { uploadWineLabel } from "@/actions/wine.actions";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

export function LabelImageUpload({
  wineId,
  currentImage,
}: {
  wineId: string;
  currentImage: string | null;
}) {
  const [preview, setPreview] = useState<string | null>(currentImage);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    const formData = new FormData();
    formData.append("labelImage", file);

    startTransition(async () => {
      const { error } = await uploadWineLabel(wineId, formData);
      if (error) {
        alert(error);
        setPreview(currentImage);
      }
    });
  }

  return (
    <div className="space-y-3">
      {preview ? (
        <div className="relative w-40 h-56 rounded-lg overflow-hidden border border-border">
          <Image
            src={preview}
            alt="Wine label"
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      ) : (
        <div className="w-40 h-56 rounded-lg border-2 border-dashed border-border flex items-center justify-center text-muted-foreground text-sm">
          No label
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="hidden"
        onChange={handleFileChange}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={isPending}
        onClick={() => inputRef.current?.click()}
      >
        <Upload size={14} className="mr-1" />
        {isPending ? "Uploading…" : preview ? "Change photo" : "Upload label photo"}
      </Button>
    </div>
  );
}
