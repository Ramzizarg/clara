"use client";

import { useState, MouseEvent } from "react";

interface ExistingImage {
  id: number;
  url: string;
  isPrimary: boolean;
}

interface ExistingProductImagesEditorProps {
  images: ExistingImage[];
}

export function ExistingProductImagesEditor({ images }: ExistingProductImagesEditorProps) {
  const [items, setItems] = useState<ExistingImage[]>(images);
  const [primaryId, setPrimaryId] = useState<number | null>(
    images.find((img) => img.isPrimary)?.id ?? (images[0]?.id ?? null)
  );
  const [removedIds, setRemovedIds] = useState<number[]>([]);

  const handleSelectPrimary = (id: number) => {
    setPrimaryId(id);
  };

  const handleRemove = (e: MouseEvent<HTMLButtonElement>, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    setItems((prev) => prev.filter((img) => img.id !== id));
    setRemovedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));

    if (primaryId === id) {
      const remaining = items.filter((img) => img.id !== id);
      setPrimaryId(remaining[0]?.id ?? null);
    }
  };

  if (items.length === 0 && removedIds.length === 0) {
    return null;
  }

  return (
    <>
      {items.length > 0 && (
        <>
          {items.map((img) => (
            <div
              key={img.id}
              className="relative group"
            >
              <div
                onClick={(e) => {
                  e.preventDefault();
                  handleSelectPrimary(img.id);
                }}
                className={`relative h-16 w-16 overflow-hidden rounded-xl border cursor-pointer ${
                  img.id === primaryId
                    ? "border-[#ff1744] ring-2 ring-[#ff1744]"
                    : "border-zinc-200"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt="Image actuelle"
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={(e) => handleRemove(e, img.id)}
                  className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600/80 text-[9px] text-white hover:bg-red-700"
                >
                  ×
                </button>
                {img.id === primaryId && (
                  <span className="absolute inset-x-0 bottom-0 bg-black/60 text-[9px] font-semibold text-white px-1 py-0.5 text-center">
                    Principale
                  </span>
                )}
              </div>
            </div>
          ))}
        </>
      )}

      {/* Hidden fields to inform server about changes */}
      {primaryId !== null && (
        <input type="hidden" name="primaryExistingId" value={primaryId} />
      )}
      {removedIds.map((id) => (
        <input key={id} type="hidden" name="removeImageIds" value={id} />
      ))}
    </>
  );
}
