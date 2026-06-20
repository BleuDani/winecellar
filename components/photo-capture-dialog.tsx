"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Upload, Camera, RotateCcw, Check } from "lucide-react";

const MAX_DIMENSION = 1600;
const SKIP_BELOW_BYTES = 500_000;

// Phone camera-roll photos can be several MB at full sensor resolution; downscaling
// client-side before upload meaningfully speeds up the upload over a cellular connection.
async function downscaleImage(file: File): Promise<File> {
  if (file.size < SKIP_BELOW_BYTES) return file;

  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new window.Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = objectUrl;
    });

    const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height));
    if (scale === 1) return file;

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.85)
    );
    if (!blob) return file;
    return new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" });
  } catch {
    return file;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export function PhotoCapture({
  onPhoto,
  disabled,
}: {
  onPhoto: (file: File) => void;
  disabled?: boolean;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [cameraOpen, setCameraOpen] = useState(false);
  const [capturedFrame, setCapturedFrame] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    setCapturedFrame(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      setCameraError("Camera access denied. Use the upload button instead.");
    }
  }, []);

  useEffect(() => {
    if (cameraOpen) {
      startCamera();
    } else {
      stopStream();
      setCapturedFrame(null);
      setCameraError(null);
    }
    return stopStream;
  }, [cameraOpen, startCamera, stopStream]);

  function captureFrame() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    setCapturedFrame(canvas.toDataURL("image/jpeg", 0.92));
    stopStream();
  }

  function retake() {
    setCapturedFrame(null);
    startCamera();
  }

  async function usePhoto() {
    if (!capturedFrame) return;
    const res = await fetch(capturedFrame);
    const blob = await res.blob();
    const file = new File([blob], "label.jpg", { type: "image/jpeg" });
    setCameraOpen(false);
    onPhoto(file);
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    onPhoto(await downscaleImage(file));
    e.target.value = "";
  }

  return (
    <>
      <div className="flex gap-2 flex-wrap">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          capture="environment"
          className="hidden"
          onChange={handleFileChange}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload size={14} className="mr-1" />
          Upload photo
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={() => setCameraOpen(true)}
        >
          <Camera size={14} className="mr-1" />
          Take photo
        </Button>
      </div>

      <Dialog open={cameraOpen} onOpenChange={setCameraOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Take a photo of the label</DialogTitle>
          </DialogHeader>
          <canvas ref={canvasRef} className="hidden" />
          {cameraError ? (
            <p className="text-sm text-destructive text-center py-8">{cameraError}</p>
          ) : capturedFrame ? (
            <div className="space-y-3">
              <img src={capturedFrame} alt="Captured" className="w-full rounded-lg" />
              <div className="flex gap-2 justify-center">
                <Button variant="outline" size="sm" onClick={retake}>
                  <RotateCcw size={14} className="mr-1" /> Retake
                </Button>
                <Button size="sm" onClick={usePhoto}>
                  <Check size={14} className="mr-1" /> Use photo
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full rounded-lg bg-black aspect-[3/4] object-cover"
              />
              <div className="flex justify-center">
                <Button onClick={captureFrame}>
                  <Camera size={14} className="mr-1" /> Capture
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
