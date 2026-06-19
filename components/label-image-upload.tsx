"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { uploadWineLabel } from "@/actions/wine.actions";
import { PhotoCapture } from "@/components/photo-capture-dialog";

export function LabelImageUpload({
  wineId,
  currentImage,
}: {
  wineId: string;
  currentImage: string | null;
}) {
  const [preview, setPreview] = useState<string | null>(currentImage);
  const [isPending, startTransition] = useTransition();

  function handlePhoto(file: File) {
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
          <Image src={preview} alt="Wine label" fill className="object-cover" unoptimized />
        </div>
      ) : (
        <div className="w-40 h-56 rounded-lg border-2 border-dashed border-border flex items-center justify-center text-muted-foreground text-sm">
          No label
        </div>
      )}
      <PhotoCapture onPhoto={handlePhoto} disabled={isPending} />
    </div>
  );
}
