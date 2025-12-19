"use client";

import { useState, useRef, ChangeEvent, MouseEvent, ReactNode } from "react";

interface ProductImagesUploaderProps {
  fieldName?: string;
  children?: ReactNode;
}

export function ProductImagesUploader({ fieldName = "files", children }: ProductImagesUploaderProps) {
  const [previews, setPreviews] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  // -1 means "no new image selected as primary yet"
  const [primaryIndex, setPrimaryIndex] = useState<number>(-1);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      setPreviews([]);
      setFiles([]);
      setPrimaryIndex(-1);
      return;
    }

    const selectedFiles = Array.from(files);
    const urls: string[] = selectedFiles.map((file) => URL.createObjectURL(file));

    setFiles(selectedFiles);
    setPreviews(urls);
    // do not auto-select a new primary; user must click one
    setPrimaryIndex(-1);
  };

  const handleRemove = (index: number, e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    const newFiles = files.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);

    setFiles(newFiles);
    setPreviews(newPreviews);

    // Rebuild the FileList on the input so removed files are not uploaded
    if (inputRef.current) {
      const dataTransfer = new DataTransfer();
      newFiles.forEach((file) => dataTransfer.items.add(file));
      inputRef.current.files = dataTransfer.files;
    }

    if (newPreviews.length === 0) {
      setPrimaryIndex(-1);
      return;
    }

    // Adjust primary index if needed
    if (index === primaryIndex) {
      // If we removed the current primary, fallback to previous image or first
      const newIndex = newPreviews.length > 0 ? 0 : -1;
      setPrimaryIndex(newIndex);
    } else if (index < primaryIndex) {
      // Shift primary index left if an earlier image was removed
      setPrimaryIndex((prev) => prev - 1);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <input
          id="product-files"
          name={fieldName}
          type="file"
          multiple
          accept="image/*"
          className="sr-only"
          ref={inputRef}
          onChange={handleChange}
        />
        <label
          htmlFor="product-files"
          className="inline-flex cursor-pointer items-center rounded-full bg-zinc-900 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-zinc-800"
        >
          Ajouter des images
        </label>
        {/* Primary index is posted with the form */}
        <input type="hidden" name="primaryIndex" value={primaryIndex} />
      </div>

      {(previews.length > 0 || children) && (
        <div className="space-y-2">
          <p className="text-[11px] text-zinc-500">Cliquez sur une image pour la définir comme principale.</p>
          <div className="flex flex-wrap gap-3">
            {previews.map((src, index) => (
              <div
                key={index}
                onClick={() => setPrimaryIndex(index)}
                className={`relative h-16 w-16 overflow-hidden rounded-xl border cursor-pointer ${
                  primaryIndex === index
                    ? "border-[#ff1744] ring-2 ring-[#ff1744]"
                    : "border-zinc-200"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={`Preview ${index + 1}`}
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={(e) => handleRemove(index, e)}
                  className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600/80 text-[9px] text-white hover:bg-red-700"
                >
                  ×
                </button>
                {primaryIndex === index && (
                  <span className="absolute inset-x-0 bottom-0 bg-black/60 text-[9px] font-semibold text-white px-1 py-0.5 text-center">
                    Principale
                  </span>
                )}
              </div>
            ))}
            {children}
          </div>
        </div>
      )}
    </div>
  );
}
