"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { uploadCellarBackground } from "@/actions/cellar.actions";
import { PhotoCapture } from "@/components/photo-capture-dialog";

export function CellarBackgroundUpload({
  cellarId,
  currentImage,
}: {
  cellarId: string;
  currentImage: string | null;
}) {
  const [preview, setPreview] = useState<string | null>(currentImage);
  const [isPending, startTransition] = useTransition();

  function handlePhoto(file: File) {
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    const formData = new FormData();
    formData.append("backgroundImage", file);
    startTransition(async () => {
      const { error } = await uploadCellarBackground(cellarId, formData);
      if (error) {
        alert(error);
        setPreview(currentImage);
      }
    });
  }

  return (
    <div className="space-y-3">
      {preview ? (
        <div className="relative h-40 sm:h-56 w-full rounded-xl overflow-hidden border border-border">
          <Image src={preview} alt="Cellar background" fill className="object-cover" unoptimized />
        </div>
      ) : (
        <div className="h-40 sm:h-56 w-full rounded-xl border-2 border-dashed border-border flex items-center justify-center text-muted-foreground text-sm">
          No background photo
        </div>
      )}
      <PhotoCapture onPhoto={handlePhoto} disabled={isPending} />
    </div>
  );
}
