"use client";

import { useState, useEffect } from "react";

interface ProductImageOption {
  id: number;
  url: string;
}

interface ExistingFeature {
  id: number;
  imageUrl: string;
  title: string;
  description: string;
  order: number;
}

interface ProductFeaturesEditorProps {
  images: ProductImageOption[];
  features: ExistingFeature[];
}

interface FeatureRow {
  id: number | null;
  imageUrl: string;
  title: string;
  description: string;
  _file?: File; // For handling new file uploads
  _previewUrl?: string; // For previewing before upload
}

export function ProductFeaturesEditor({ images, features }: ProductFeaturesEditorProps) {
  const initialRows: FeatureRow[] =
    features.length > 0
      ? features
          .sort((a, b) => a.order - b.order)
          .map((f) => ({
            id: f.id,
            // If an old blob: preview URL accidentally got stored, treat it as empty
            imageUrl: f.imageUrl?.startsWith("blob:") ? "" : f.imageUrl,
            title: f.title,
            description: f.description,
          }))
      : [];

  const [rows, setRows] = useState<FeatureRow[]>(() => 
    initialRows.map(row => ({
      ...row,
      _previewUrl: row.imageUrl.startsWith('blob:') ? '' : row.imageUrl
    }))
  );
  
  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      rows.forEach(row => {
        if (row._previewUrl && row._previewUrl.startsWith('blob:')) {
          URL.revokeObjectURL(row._previewUrl);
        }
      });
    };
  }, [rows]);
  
  // Validate image file
  const validateImageFile = (file: File): boolean => {
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      alert("Veuillez sélectionner une image au format JPG, PNG, WebP ou GIF.");
      return false;
    }

    if (file.size > maxSize) {
      alert("La taille de l'image ne doit pas dépasser 5 Mo.");
      return false;
    }

    return true;
  };

  const handleAddRow = () => {
    const defaultImageUrl = images[0]?.url ?? "";
    setRows((prev) => [
      ...prev,
      {
        id: null,
        imageUrl: defaultImageUrl,
        _previewUrl: defaultImageUrl,
        title: "",
        description: "",
      },
    ]);
  };

  const handleRemoveRow = (index: number) => {
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  if (images.length === 0) {
    return (
      <p className="text-xs text-zinc-500">
        Ajoutez d'abord des images produit pour pouvoir créer des caractéristiques visuelles.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {rows.map((row, index) => (
        <div
          key={index}
          className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-zinc-50/60 p-3 md:flex-row md:items-start md:gap-4"
        >
          <div className="w-full md:w-1/3 space-y-1">
            <label className="text-[11px] font-medium text-zinc-700">
              Image de la caractéristique
            </label>

            {/* Hidden input to submit current imageUrl */}
            <input type="hidden" name="featureImageUrls" value={row.imageUrl} />

            {/* Real file input for new uploads: always rendered so the file is submitted */}
            <input
              id={`featureNewImage_${index}`}
              type="file"
              name={`featureNewImage_${index}`}
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;

                if (!validateImageFile(file)) {
                  e.target.value = '';
                  return;
                }

                const previewUrl = URL.createObjectURL(file);

                const prevRow = rows[index];
                if (prevRow?._previewUrl && prevRow._previewUrl.startsWith('blob:')) {
                  URL.revokeObjectURL(prevRow._previewUrl);
                }

                setRows((prev) =>
                  prev.map((r, i) =>
                    i === index
                      ? {
                          ...r,
                          _file: file,
                          _previewUrl: previewUrl,
                          imageUrl: '', // Clear old URL since we have a new file
                        }
                      : r
                  )
                );
              }}
            />

            {(row._previewUrl || row.imageUrl) ? (
              // Existing or new image → show thumbnail with X, clicking image opens file dialog
              <div className="relative h-32 w-32 rounded-3xl border border-zinc-200 bg-white shadow-sm flex items-center justify-center">
                <label
                  htmlFor={`featureNewImage_${index}`}
                  className="h-24 w-24 overflow-hidden rounded-2xl bg-zinc-50 cursor-pointer"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={row._previewUrl || row.imageUrl}
                    alt={row.title || 'Image caractéristique'}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setRows((prev) =>
                      prev.map((r, i) =>
                        i === index
                          ? { ...r, imageUrl: "", _previewUrl: "", _file: undefined }
                          : r
                      )
                    );
                  }}
                  className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-[11px] font-semibold text-white shadow-md hover:bg-red-600"
                  aria-label="Retirer l'image de cette caractéristique"
                >
                  ×
                </button>
              </div>
            ) : (
              // No image yet → show upload card
              <div className="pt-1">
                <label
                  htmlFor={`featureNewImage_${index}`}
                  className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-red-200 bg-red-50/60 px-3 py-2 text-[10px] text-red-700 hover:bg-red-100 hover:border-red-300"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-[12px] font-bold text-white">+</span>
                  <span className="flex flex-col">
                    <span className="font-semibold">Ajouter une image</span>
                    <span className="text-[9px] text-red-500/80">Depuis votre ordinateur (JPG, PNG, WebP, GIF…)</span>
                  </span>
                </label>
              </div>
            )}
          </div>

          <div className="w-full md:flex-1 space-y-2">
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-zinc-700">
                Titre de la caractéristique
              </label>
              <input
                type="text"
                name="featureTitles"
                value={row.title}
                onChange={(e) => {
                  const value = e.target.value;
                  setRows((prev) =>
                    prev.map((r, i) => (i === index ? { ...r, title: value } : r))
                  );
                }}
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-xs outline-none focus:border-zinc-900"
                placeholder={`Caractéristique ${index + 1}`}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-zinc-700">
                Paragraphe de la caractéristique
              </label>
              <textarea
                name="featureDescriptions"
                value={row.description}
                onChange={(e) => {
                  const value = e.target.value;
                  setRows((prev) =>
                    prev.map((r, i) => (i === index ? { ...r, description: value } : r))
                  );
                }}
                className="w-full rounded-md border border-zinc-300 px-3 py-2 text-xs outline-none focus:border-zinc-900"
                rows={2}
              />
            </div>
          </div>

          <div className="flex justify-end md:pt-6">
            <button
              type="button"
              onClick={() => handleRemoveRow(index)}
              className="text-[11px] text-red-600 hover:text-red-700"
            >
              Supprimer
            </button>
          </div>
        </div>
      ))}

      <div className="flex justify-between items-center pt-1">
        <p className="text-[11px] text-zinc-500">
          Vous pouvez ajouter plusieurs caractéristiques. Elles seront affichées dans l'ordre de la liste.
        </p>
        <button
          type="button"
          onClick={handleAddRow}
          className="inline-flex items-center rounded-full bg-zinc-900 px-3 py-1.5 text-[11px] font-medium text-white hover:bg-zinc-800"
        >
          + Ajouter une caractéristique
        </button>
      </div>
    </div>
  );
}
