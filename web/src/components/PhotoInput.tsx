"use client";

import { useRef, useState } from "react";

interface Props {
  value?: string;
  onChange: (v?: string) => void;
  fallbackLabel?: string;
  maxDimension?: number;
  quality?: number;
}

export default function PhotoInput({
  value,
  onChange,
  fallbackLabel,
  maxDimension = 900,
  quality = 0.82,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("Solo se aceptan imágenes.");
      return;
    }
    setProcessing(true);
    try {
      const compressed = await compressImage(file, maxDimension, quality);
      onChange(compressed);
    } catch (e) {
      console.error(e);
      setError("No se pudo procesar la imagen.");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="flex items-start gap-3">
      <div
        className="w-24 h-24 rounded-xl overflow-hidden shrink-0 flex items-center justify-center relative"
        style={{
          background: "var(--surface-2)",
          border: "1px solid var(--rule)",
        }}
      >
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="Foto" className="w-full h-full object-cover" />
        ) : (
          <span className="text-[0.62rem] font-mono uppercase tracking-wider text-subtle text-center px-2">
            {fallbackLabel ?? "Sin foto"}
          </span>
        )}
        {processing && (
          <div
            className="absolute inset-0 flex items-center justify-center text-[0.62rem] font-mono uppercase tracking-wider"
            style={{
              background: "rgba(0,0,0,0.55)",
              color: "white",
            }}
          >
            procesando…
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 flex flex-col gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
        />
        <div className="flex gap-2 flex-wrap">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => inputRef.current?.click()}
            disabled={processing}
          >
            {value ? "Cambiar foto" : "Subir foto"}
          </button>
          {value && (
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => onChange(undefined)}
              disabled={processing}
            >
              Quitar
            </button>
          )}
        </div>
        <p className="text-[0.68rem] text-subtle leading-relaxed">
          Se comprime automáticamente y se guarda localmente. Peso final ~50–150 KB.
        </p>
        {error && <p className="text-xs text-danger">{error}</p>}
      </div>
    </div>
  );
}

async function compressImage(
  file: File,
  maxDim: number,
  quality: number
): Promise<string> {
  const dataUrl = await readAsDataURL(file);
  const img = await loadImage(dataUrl);

  let { width, height } = img;
  const scale = Math.min(1, maxDim / Math.max(width, height));
  width = Math.round(width * scale);
  height = Math.round(height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No canvas context");
  ctx.drawImage(img, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", quality);
}

function readAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("No se pudo cargar la imagen"));
    img.src = src;
  });
}
