"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";

interface ProductImageFromApi {
  id: number;
  url: string;
  isPrimary: boolean;
}

interface ProductFeatureFromApi {
  id: number;
  imageUrl: string;
  title: string;
  description: string;
  order: number;
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string | null;
  salePrice?: number | null;
  offer2OriginalPrice?: number | null;
  offer2SalePrice?: number | null;
  offer3OriginalPrice?: number | null;
  offer3SalePrice?: number | null;
  images?: ProductImageFromApi[];
  features?: ProductFeatureFromApi[];
}

export default function ProductByIdPage() {
  const params = useParams<{ id: string }>();
  const productId = Number(params?.id); // Convert to number for the API call
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPack, setSelectedPack] = useState<1 | 2 | 3>(1);
  const [selectedGovernor, setSelectedGovernor] = useState<string>("");
  const [isGovernorOpen, setIsGovernorOpen] = useState(false);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [zoomImage, setZoomImage] = useState<ProductImageFromApi | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isOrderSuccessOpen, setIsOrderSuccessOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState({
    name: false,
    governor: false,
    city: false,
    address: false,
    phone: false,
  });
  const carouselRef = useRef<HTMLDivElement | null>(null);
  // Container for offers + form: used to scroll when user wants to see the order area
  const orderSectionRef = useRef<HTMLDivElement | null>(null);
  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const cityInputRef = useRef<HTMLInputElement | null>(null);
  const addressInputRef = useRef<HTMLInputElement | null>(null);
  const phoneInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${productId}`, { cache: "no-store" });
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          throw new Error(data?.message || "Failed to load product");
        }
        const data: Product = await res.json();
        setProduct(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unexpected error");
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  // When images load or change, default the active image to the primary one
  useEffect(() => {
    if (!product) return;
    const imgs = (product.images && product.images.length > 0)
      ? product.images
      : product.imageUrl
        ? [{ id: 0, url: product.imageUrl, isPrimary: true }]
        : [];

    if (imgs.length === 0) return;

    const primaryIdx = imgs.findIndex((img) => img.isPrimary);
    const initialIndex = primaryIdx >= 0 ? primaryIdx : 0;
    setActiveImageIndex(initialIndex);
  }, [product]);

  // From here down, reuse the exact same UI as /product/page.tsx

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white text-zinc-900">
        <p className="text-lg">Chargement du produit...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white text-zinc-900 px-4">
        <div className="max-w-md rounded-2xl border border-zinc-200 bg-zinc-50 p-6 text-center">
          <h1 className="mb-2 text-xl font-semibold">Une erreur est survenue</h1>
          <p className="mb-4 text-sm text-zinc-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 transition"
          >
            Réessayer
          </button>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white text-zinc-900">
        <p>Aucun produit trouvé dans la base de données.</p>
      </main>
    );
  }

  const base = product.price;
  const images = (product.images && product.images.length > 0)
    ? product.images
    : product.imageUrl
      ? [{ id: 0, url: product.imageUrl, isPrimary: true }]
      : [];

  const primaryImage = images.find((img) => img.isPrimary) ?? images[0] ?? null;
  const galleryImages = primaryImage
    ? images.filter((img) => img.id !== primaryImage.id)
    : images;

  const currentImage =
    activeImageIndex !== null && images[activeImageIndex]
      ? images[activeImageIndex]
      : primaryImage;

  type PackKey = 1 | 2 | 3;

  const packPrices: Record<PackKey, { label: string; original: number | null; sale: number }> = {
    1: {
      label: "1x",
      original: product.price,
      sale:
        product.salePrice && !Number.isNaN(product.salePrice)
          ? product.salePrice
          : product.price,
    },
    2: {
      label: "2x",
      original:
        product.offer2OriginalPrice && !Number.isNaN(product.offer2OriginalPrice)
          ? product.offer2OriginalPrice
          : product.price * 2,
      sale:
        product.offer2SalePrice && !Number.isNaN(product.offer2SalePrice)
          ? product.offer2SalePrice
          : (product.offer2OriginalPrice && !Number.isNaN(product.offer2OriginalPrice)
              ? product.offer2OriginalPrice
              : product.price * 2),
    },
    3: {
      label: "3x",
      original:
        product.offer3OriginalPrice && !Number.isNaN(product.offer3OriginalPrice)
          ? product.offer3OriginalPrice
          : product.price * 3,
      sale:
        product.offer3SalePrice && !Number.isNaN(product.offer3SalePrice)
          ? product.offer3SalePrice
          : (product.offer3OriginalPrice && !Number.isNaN(product.offer3OriginalPrice)
              ? product.offer3OriginalPrice
              : product.price * 3),
    },
  };

  const getDiscountPercent = (pack: { original: number | null; sale: number }) => {
    if (pack.original === null || Number.isNaN(pack.original)) return 0;
    if (pack.sale >= pack.original) return 0;
    const percent = 100 - (pack.sale * 100) / pack.original;
    return Math.round(percent);
  };

  const selectedPackInfo = packPrices[selectedPack];
  const subtotal = selectedPackInfo.sale;

  const mainOriginalPrice = packPrices[1].original ?? base;
  const mainDiscountedPrice = packPrices[1].sale;
  const livraison = 8;
  const total = subtotal + livraison;

  const governorates = [
    "Tunis",
    "Ariana",
    "Ben Arous",
    "Manouba",
    "Nabeul",
    "Zaghouan",
    "Bizerte",
    "Béja",
    "Jendouba",
    "Le Kef",
    "Siliana",
    "Sousse",
    "Monastir",
    "Mahdia",
    "Sfax",
    "Kairouan",
    "Kasserine",
    "Sidi Bouzid",
    "Gabès",
    "Medenine",
    "Tataouine",
    "Gafsa",
    "Tozeur",
    "Kebili",
  ];

  const handleMobileScroll = () => {
    const el = carouselRef.current;
    if (!el) return;
    const index = Math.round(el.scrollLeft / el.offsetWidth);
    setActiveSlide(index);
    setActiveImageIndex(index);
  };

  const handleScrollToForm = () => {
    orderSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleSubmitOrder = async () => {
    const name = nameInputRef.current?.value.trim() ?? "";
    const city = cityInputRef.current?.value.trim() ?? "";
    const address = addressInputRef.current?.value.trim() ?? "";
    const phone = phoneInputRef.current?.value.trim() ?? "";
    const governor = selectedGovernor.trim();

    const nextFieldErrors = {
      name: !name,
      governor: !governor,
      city: !city,
      address: !address,
      phone: !phone,
    };

    if (!name || !governor || !city || !address || !phone) {
      setFieldErrors(nextFieldErrors);
      setFormError("Merci de remplir tous les champs pour valider votre commande.");
      // Scroll to the whole order block (offers + form), not just the inner form,
      // so on mobile you see all inputs and context comme les attributs en rouge
      orderSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    // Clear previous field-level errors on successful validation
    setFieldErrors({ name: false, governor: false, city: false, address: false, phone: false });

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product.id,
          pack: selectedPack,
          total,
          name,
          phone,
          address,
          governor,
          city,
        }),
      });

      if (!res.ok) {
        setFormError("Une erreur est survenue lors de l'envoi de votre commande. Veuillez réessayer.");
        return;
      }

      setFormError(null);
      setIsOrderSuccessOpen(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      console.error(e);
      setFormError("Une erreur est survenue lors de l'envoi de votre commande. Veuillez réessayer.");
    }
  };

  const openZoomWithImage = (img: ProductImageFromApi | null) => {
    if (!img) return;
    setZoomImage(img);
    setIsZoomOpen(true);
  };

  return (
    <main className="min-h-screen bg-white text-zinc-900">
      {/* Header similaire à la page d'accueil */}
      <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/90 backdrop-blur">
        <div className="mx-auto grid max-w-6xl grid-cols-3 items-center px-6 py-4">
          {/* Left: MENU */}
          <div className="flex items-center gap-2 text-xs font-medium tracking-[0.25em] text-zinc-600">
            <span className="inline-flex flex-col justify-center gap-[3px] pr-1">
              <span className="block h-[1px] w-4 bg-zinc-700" />
              <span className="block h-[1px] w-3 bg-zinc-700" />
            </span>
            <span>MENU</span>
          </div>

          {/* Center: brand (texte seulement) */}
          <p
            className="flex items-center justify-center text-xl font-semibold tracking-tight text-zinc-900 md:text-2xl"
            style={{ fontFamily: "Abramo, var(--font-geist-sans), system-ui, sans-serif" }}
          >
            Clara
          </p>

          {/* Right: recherche + panier + coût */}
          <div className="flex items-center justify-end gap-4 text-xs text-zinc-600">
            <button className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-zinc-100">
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                className="h-4 w-4 text-zinc-700"
              >
                <circle
                  cx="11"
                  cy="11"
                  r="5.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="m15.5 15.5 3.5 3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              <span className="sr-only">Recherche</span>
            </button>

            <button className="relative flex h-8 w-8 items-center justify-center rounded-full hover:bg-zinc-100">
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                className="h-4 w-4 text-zinc-700"
              >
                <path
                  d="M7 6h13l-1.2 6H8.5L7 6z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="10" cy="18" r="1.3" fill="currentColor" />
                <circle cx="17" cy="18" r="1.3" fill="currentColor" />
                <path
                  d="M7 6 5.5 3.5H3"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
              <span className="sr-only">Panier</span>
              <span className="absolute -right-1 -top-1 flex h-3 w-3 items-center justify-center rounded-full bg-[#ff2d55] text-[8px] font-semibold text-white">
                0
              </span>
            </button>

            <span className="hidden text-[11px] text-zinc-600 sm:inline">
              Coût - 0.000
            </span>
          </div>
        </div>
      </header>

      {/* Bandeau livraison avec texte défilant */}
      <div className="w-full overflow-hidden bg-[#102643] py-2 text-[11px] font-semibold text-white">
        <div className="hidden md:block w-full overflow-hidden">
          <div className="flex w-max animate-[marquee_25s_linear_infinite] whitespace-nowrap">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
              <span key={i} className="mx-8 tracking-[0.18em] whitespace-nowrap">
                Livraison partout en Tunisie 8 DT 🚚💨
              </span>
            ))}
          </div>
        </div>
        <div className="md:hidden">
          <div className="flex w-max animate-[marquee_10s_linear_infinite] whitespace-nowrap">
            {[0, 1, 2].map((i) => (
              <span key={i} className="mx-8 tracking-[0.18em]">
                Livraison partout en Tunisie 8 DT 🚚💨
              </span>
            ))}
          </div>
        </div>
      </div>

      <section className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-10 md:flex-row md:items-start">
        {/* Galerie mobile : carrousel swipe gauche/droite */}
        <div className="w-full md:hidden">
          {/* Make product image visually smaller on mobile by reducing max width and height */}
          <div className="mx-auto w-full max-w-xs overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-50">
            <div
              ref={carouselRef}
              onScroll={handleMobileScroll}
              className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth h-64"
            >
              {images.length > 0 ? (
                images.map((img, index) => (
                  <div key={img.id} className="relative min-w-full snap-center">
                    <img
                      src={img.url}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setActiveSlide(index);
                        openZoomWithImage(img);
                      }}
                      className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur hover:bg-black/80"
                    >
                      <svg
                        aria-hidden
                        viewBox="0 0 24 24"
                        className="h-4 w-4"
                      >
                        <circle
                          cx="11"
                          cy="11"
                          r="5.5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        />
                        <path
                          d="m15.5 15.5 3.5 3.5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>
                  </div>
                ))
              ) : (
                <div className="relative min-w-full snap-center">
                  <div className="flex h-64 items-center justify-center text-sm text-zinc-500">
                    Aucune image disponible
                  </div>
                </div>
              )}

      {isOrderSuccessOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl">
            <h2 className="mb-2 text-lg font-semibold text-zinc-900">Commande envoyée !</h2>
            <p className="mb-4 text-xs text-zinc-600">
              Merci pour votre confiance. Nous allons vous contacter pour confirmer votre commande.
            </p>
            <button
              type="button"
              onClick={() => {
                setIsOrderSuccessOpen(false);
                window.location.reload();
              }}
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#ff6b00] to-[#ff1744] px-4 py-2 text-xs font-semibold text-white shadow hover:brightness-95"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
            </div>
          </div>
          <div className="mt-3 flex justify-center gap-1">
            {images.map((img, index) => (
              <button
                key={img.id}
                type="button"
                onClick={() => {
                  const el = carouselRef.current;
                  if (!el) return;
                  el.scrollTo({ left: index * el.offsetWidth, behavior: "smooth" });
                }}
                className={`w-2 h-2 rounded-full ${index === activeSlide ? "bg-zinc-900" : "bg-zinc-400"
                  }`}
              />
            ))}
          </div>
        </div>

        {/* Colonne gauche : image principale + miniatures (desktop) */}
        <div className="hidden w-full space-y-4 md:block md:w-1/2">
          <div className="relative mx-auto w-full max-w-sm aspect-[4/5] overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-50">
            {currentImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={currentImage.url}
                alt={product.name}
                className="h-full w-full object-contain bg-white"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-zinc-500">
                Aucune image disponible
              </div>
            )}
            {currentImage && (
              <button
                type="button"
                onClick={() => openZoomWithImage(currentImage)}
                className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur hover:bg-black/80"
              >
                <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4">
                  <circle
                    cx="11"
                    cy="11"
                    r="5.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <path
                    d="m15.5 15.5 3.5 3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
                <span className="sr-only">Zoom de l'image</span>
              </button>
            )}
          </div>

          <div className="mx-auto flex max-w-sm gap-3">
            {galleryImages.map((img) => (
              <button
                key={img.id}
                type="button"
                onClick={() => {
                  const idx = images.findIndex((i) => i.id === img.id);
                  if (idx >= 0) {
                    setActiveImageIndex(idx);
                  }
                }}
                className="aspect-[4/5] w-20 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Colonne droite : infos produit + formulaire simple */}
        <div ref={orderSectionRef} className="w-full md:w-1/2 space-y-6">
          <div className="space-y-2 text-center md:text-left">
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
              {product.name}
            </h1>
            <div className="flex flex-col items-center gap-0.5 md:items-start">
              <p className="text-xs text-zinc-700 line-through">
                {mainOriginalPrice.toFixed(2)} DT
              </p>
              <p className="text-2xl font-semibold text-[#ff1744] md:text-3xl">
                {mainDiscountedPrice.toFixed(2)} DT
              </p>
            </div>
          </div>

          {/* Packs / options comme les cartes d'offre */}
          <div className="space-y-3 text-sm">
            <p className="font-medium">Choisissez votre offre</p>
            <div className="space-y-3">
              {[1, 2, 3].map((pack) => {
                const cfg = packPrices[pack as PackKey];
                const discountPercent = getDiscountPercent(cfg);
                const isActive = selectedPack === pack;

                return (
                  <button
                    key={pack}
                    type="button"
                    onClick={() => setSelectedPack(pack as 1 | 2 | 3)}
                    className={`flex w-full items-center justify-between rounded-3xl border px-4 py-3 text-left text-xs shadow-sm transition ${
                      isActive
                        ? "border-[#ff6b00] bg-gradient-to-r from-[#fff3e0] via-[#ffe0b2] to-white shadow-md ring-2 ring-[#ff6b00]/60"
                        : "border-zinc-200 bg-white hover:border-[#ff6b00]/40 hover:bg-[#fff7ec]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 overflow-hidden rounded-2xl bg-zinc-100 hidden sm:block">
                        {primaryImage && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={primaryImage.url}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>
                      <div>
                        <p className="font-medium flex items-baseline gap-1">
                          <span className="text-sm font-extrabold text-[#ff1744] tracking-wide">
                            {cfg.label}
                          </span>
                          <span className="text-[11px] text-zinc-900">
                            {product.name}
                          </span>
                        </p>
                        <span className="mt-1 inline-flex items-center rounded-full bg-[#ff1744] px-2 py-0.5 text-[11px] font-semibold text-white shadow-sm">
                          {discountPercent > 0
                            ? `Économie ${discountPercent}%`
                            : "Sans remise"}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      {discountPercent > 0 && cfg.original !== null && (
                        <p className="text-[11px] text-zinc-400 line-through">
                          {cfg.original.toFixed(2)} DT
                        </p>
                      )}
                      <p className={`text-lg font-semibold text-[#ff1744]`}>
                        {cfg.sale.toFixed(2)} DT
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Formulaire : infos client / livraison */}
          <div className="space-y-4">
            <div className="rounded-xl bg-blue-50 p-4">
              <p className="mb-3 flex items-center text-sm font-medium text-blue-800">
                <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h2a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Paiement sécurisé à la livraison
              </p>
              <p className="text-xs text-blue-700">Remplissez vos coordonnées pour finaliser votre commande</p>
            </div>

            <div className="space-y-4">
              {/* Nom Complet */}
              <div className="group relative">
                <label htmlFor="fullName" className="mb-1 block text-sm font-medium text-gray-700">
                  Nom complet <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="fullName"
                    type="text"
                    ref={nameInputRef}
                    className={`block w-full rounded-lg border ${fieldErrors.name ? "border-red-500" : "border-gray-300"} bg-white p-3 text-sm text-gray-900 shadow-sm transition-all duration-200 focus:border-[#ff6b00] focus:ring-2 focus:ring-[#ff6b00]/20 focus:ring-offset-1`}
                    placeholder="Ex: Mohamed Ben Ali"
                    required
                  />
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
                {fieldErrors.name && (
                  <p className="mt-1 text-xs text-red-600">Merci de remplir ce champ.</p>
                )}
              </div>

              {/* Gouvernorat et Ville */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Gouvernorat Dropdown */}
                <div className="group relative">
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Gouvernorat <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsGovernorOpen(!isGovernorOpen)}
                      className={`flex w-full items-center justify-between rounded-lg border ${fieldErrors.governor ? "border-red-500" : "border-gray-300"} bg-white p-3 text-left text-sm text-gray-900 shadow-sm transition-all duration-200 focus:border-[#ff6b00] focus:outline-none focus:ring-2 focus:ring-[#ff6b00]/20 focus:ring-offset-1 ${selectedGovernor ? 'text-gray-900' : 'text-gray-500'}`}
                    >
                      <span>{selectedGovernor || "Sélectionnez votre gouvernorat"}</span>
                      <svg className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${isGovernorOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {isGovernorOpen && (
                      <div className="absolute z-30 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-gray-200 bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5">
                        {governorates.map((gov) => (
                          <button
                            key={gov}
                            type="button"
                            onClick={() => {
                              setSelectedGovernor(gov);
                              setIsGovernorOpen(false);
                            }}
                            className={`flex w-full items-center px-4 py-2.5 text-left text-sm hover:bg-gray-50 ${selectedGovernor === gov ? 'bg-gray-100 text-[#ff6b00]' : 'text-gray-700'}`}
                          >
                            {gov}
                            {selectedGovernor === gov && (
                              <svg className="ml-auto h-5 w-5 text-[#ff6b00]" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {fieldErrors.governor && (
                    <p className="mt-1 text-xs text-red-600">Merci de choisir un gouvernorat.</p>
                  )}
                </div>

                {/* Ville */}
                <div className="group">
                  <label htmlFor="city" className="mb-1 block text-sm font-medium text-gray-700">
                    Ville <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="city"
                      type="text"
                      ref={cityInputRef}
                      className={`block w-full rounded-lg border ${fieldErrors.city ? "border-red-500" : "border-gray-300"} bg-white p-3 text-sm text-gray-900 shadow-sm transition-all duration-200 focus:border-[#ff6b00] focus:ring-2 focus:ring-[#ff6b00]/20 focus:ring-offset-1`}
                      placeholder="Ex: Tunis, Sousse, Sfax..."
                      required
                    />
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Adresse et Téléphone */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Adresse */}
                <div className="group">
                  <label htmlFor="address" className="mb-1 block text-sm font-medium text-gray-700">
                    Adresse complète <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="address"
                      type="text"
                      ref={addressInputRef}
                      className={`block w-full rounded-lg border ${fieldErrors.address ? "border-red-500" : "border-gray-300"} bg-white p-3 text-sm text-gray-900 shadow-sm transition-all duration-200 focus:border-[#ff6b00] focus:ring-2 focus:ring-[#ff6b00]/20 focus:ring-offset-1`}
                      placeholder="N° rue, avenue, immeuble..."
                      required
                    />
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                    </div>
                  </div>
                  {fieldErrors.address && (
                    <p className="mt-1 text-xs text-red-600">Merci de remplir ce champ.</p>
                  )}
                </div>

                {/* Téléphone */}
                <div className="group">
                  <label htmlFor="phone" className="mb-1 block text-sm font-medium text-gray-700">
                    Téléphone <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <span className="text-sm text-gray-500">+216</span>
                    </div>
                    <input
                      id="phone"
                      type="tel"
                      ref={phoneInputRef}
                      className={`block w-full rounded-lg border ${fieldErrors.phone ? "border-red-500" : "border-gray-300"} bg-white p-3 pl-16 text-sm text-gray-900 shadow-sm transition-all duration-200 focus:border-[#ff6b00] focus:ring-2 focus:ring-[#ff6b00]/20 focus:ring-offset-1`}
                      placeholder="Ex: 20123456"
                      pattern="[0-9]{8}"
                      title="Veuillez entrer un numéro de téléphone valide (8 chiffres)"
                      required
                    />
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Format: 8 chiffres (sans le 0 initial)</p>
                  {fieldErrors.phone && (
                    <p className="mt-1 text-xs text-red-600">Merci de remplir ce champ avec un numéro valide.</p>
                  )}
                </div>
              </div>
            </div>
            {formError && (
              <p className="text-xs text-red-600 pt-1">
                {formError}
              </p>
            )}
          </div>

          <div className="space-y-2 rounded-2xl border border-[#ffd9a3] bg-gradient-to-br from-[#fff9e9] to-[#ffeccc] p-4 text-sm shadow-sm">
            <div className="flex justify-between text-[13px] font-semibold text-zinc-800">
              <span>Sous-total</span>
              <span>{subtotal.toFixed(2)} DT</span>
            </div>
            <div className="flex justify-between text-[13px] font-semibold text-zinc-800">
              <span>Livraison</span>
              <span>{livraison.toFixed(2)} DT</span>
            </div>
            <div className="mt-2 flex items-baseline justify-between border-t border-[#ffd9a3] pt-2">
              <span className="text-[13px] font-bold text-zinc-900 tracking-wide uppercase">
                Prix total
              </span>
              <span className="text-xl font-extrabold text-emerald-600">
                {total.toFixed(2)} DT
              </span>
            </div>
          </div>

          {/* Main desktop order button */}
          <button
            type="button"
            onClick={handleSubmitOrder}
            className="mt-2 hidden w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#ff6b00] to-[#ff1744] py-3 text-sm font-semibold text-white shadow-md hover:brightness-95 md:inline-flex"
          >
            <span>Commander maintenant</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 transform rotate-180"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10.293 5.293a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414-1.414L13.586 12H4a1 1 0 110-2h9.586l-3.293-3.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </section>

      {/* Product Features Section */}
      {product.features && product.features.length > 0 && (
        <section className="bg-gradient-to-b from-white to-gray-50 py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Caractéristiques du produit
              </h2>
              <div className="mt-4 h-1 w-20 bg-gradient-to-r from-[#ff6b00] to-[#ff1744] mx-auto rounded-full"></div>
            </div>

            <div className="space-y-20">
              {product.features.map((feature, index) => (
                <div
                  key={feature.id}
                  className={`relative flex flex-col gap-6 md:gap-10 items-center ${index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}
                >
                  {/* Image Container */}
                  <div className="w-full md:w-5/12 flex justify-center">
                    <div className="relative aspect-square w-full max-w-sm rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300 flex items-center justify-center bg-white">
                      <img
                        src={feature.imageUrl}
                        alt={`${product.name} - Caractéristique ${index + 1}`}
                        className="h-full w-full object-contain hover:scale-105 transition-transform duration-500 cursor-zoom-in"
                        onClick={() => openZoomWithImage({ id: feature.id, url: feature.imageUrl, isPrimary: false })}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                        <button
                          onClick={() => openZoomWithImage({ id: feature.id, url: feature.imageUrl, isPrimary: false })}
                          className="text-white bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 transform translate-y-2 hover:translate-y-0 transition-transform duration-300"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                          </svg>
                          Agrandir l'image
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Text Content (RTL-friendly for Arabic) */}
                  <div className={`w-full md:w-7/12 mt-4 md:mt-0`} dir="rtl">
                    <div className="relative text-right">
                      <span className="text-5xl font-bold text-gray-100 absolute -top-8 -left-2 -z-10 ltr:left-0 rtl:right-0">
                        0{index + 1}
                      </span>
                      <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 relative">
                        {feature.title || `Caractéristique ${index + 1}`}
                      </h3>
                      <p className="text-lg text-gray-600 leading-relaxed">
                        {feature.description ||
                          `Découvrez cette caractéristique exceptionnelle de notre produit conçue pour vous offrir une expérience utilisateur inégalée.`}
                      </p>
                      <button
                        onClick={handleSubmitOrder}
                        className="mt-6 inline-flex items-center gap-2 px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-gradient-to-r from-[#ff6b00] to-[#ff1744] hover:from-[#ff7b1a] hover:to-[#ff2a52] transition-all duration-300 transform hover:-translate-y-0.5"
                      >
                        <span>Commander maintenant</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 transform rotate-180"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10.293 5.293a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414-1.414L13.586 12H4a1 1 0 110-2h9.586l-3.293-3.293a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <footer className="border-t border-zinc-200 bg-zinc-50/80">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-4 text-xs text-zinc-500 sm:flex-row">
          <p>{new Date().getFullYear()} Clara. Tous droits réservés.</p>
          <div className="flex gap-4">
            <button className="hover:text-zinc-800">Confidentialité</button>
            <button className="hover:text-zinc-800">Conditions</button>
            <button className="hover:text-zinc-800">Support</button>
          </div>
        </div>
      </footer>

      {/* Mobile bottom bar: price summary + order button (stacked vertically) */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-black/5 bg-white/95 px-3 py-3 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-xl flex-col gap-2">
          <div className="rounded-xl bg-gradient-to-br from-[#fff9e9] to-[#ffeccc] px-3 py-2 text-[11px] shadow-sm border border-[#ffd9a3]">
            <div className="flex justify-between font-medium text-zinc-800">
              <span>Sous-total</span>
              <span>{subtotal.toFixed(2)} DT</span>
            </div>
            <div className="flex justify-between text-[11px] text-zinc-700">
              <span>Livraison</span>
              <span>{livraison.toFixed(2)} DT</span>
            </div>
            <div className="mt-1 flex items-baseline justify-between border-t border-[#ffd9a3] pt-1">
              <span className="font-semibold uppercase tracking-wide text-[10px] text-zinc-900">
                Prix total
              </span>
              <span className="text-sm font-extrabold text-emerald-600">
                {total.toFixed(2)} DT
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSubmitOrder}
            className="flex w-full items-center justify-center rounded-full bg-gradient-to-r from-[#ff6b00] to-[#ff1744] px-4 py-3 text-sm font-semibold text-white shadow-md hover:brightness-95"
          >
            <span>Commander</span>
          </button>
        </div>
      </div>

      {/* Order Success Modal - Same for both desktop and mobile */}
      {isOrderSuccessOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
            <div className="text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                <svg
                  className="h-12 w-12 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="mt-6 text-2xl font-bold text-gray-900">Commande effectuée avec succès !</h3>
              <p className="mt-3 text-base text-gray-600">
                Merci pour votre commande. Notre équipe vous contactera sous peu pour confirmer votre commande.
              </p>
              <div className="mt-8">
                <button
                  type="button"
                  onClick={() => {
                    setIsOrderSuccessOpen(false);
                    // Reload the page to reset the form
                    window.location.reload();
                  }}
                  className="w-full rounded-full bg-gradient-to-r from-[#ff6b00] to-[#ff1744] px-6 py-3 text-base font-medium text-white shadow-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff6b00] transition-all duration-200 transform hover:scale-[1.02]"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isZoomOpen && zoomImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <button
            type="button"
            onClick={() => setIsZoomOpen(false)}
            className="absolute right-6 top-6 z-50 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span className="sr-only">Fermer le zoom</span>
          </button>

          <div className="relative flex h-full w-full max-w-5xl flex-col items-center justify-center gap-4">
            <div className="relative flex w-full items-center justify-center">
              {images.length > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    const currentIndex = images.findIndex((img) => img.id === zoomImage.id);
                    if (currentIndex === -1) return;
                    const prevIndex = (currentIndex - 1 + images.length) % images.length;
                    setZoomImage(images[prevIndex]);
                  }}
                  className="absolute left-0 z-40 flex h-10 w-10 -translate-x-4 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-5 w-5"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.707 15.707a1 1 0 01-1.414 0L6.586 11l4.707-4.707a1 1 0 011.414 1.414L9.414 11l3.293 3.293a1 1 0 010 1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              )}

              <div className="max-h-[80vh] max-w-[90vw] overflow-auto">
                <img
                  src={zoomImage.url}
                  alt={product.name}
                  className="mx-auto max-h-[75vh] w-auto max-w-full object-contain"
                  style={{ imageRendering: "auto" }}
                />
              </div>

              {images.length > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    const currentIndex = images.findIndex((img) => img.id === zoomImage.id);
                    if (currentIndex === -1) return;
                    const nextIndex = (currentIndex + 1) % images.length;
                    setZoomImage(images[nextIndex]);
                  }}
                  className="absolute right-0 z-40 flex h-10 w-10 translate-x-4 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-5 w-5"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 4.293a1 1 0 011.414 0L13.414 9l-4.707 4.707a1 1 0 01-1.414-1.414L10.586 9 7.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              )}
            </div>

            {images.length > 1 && (
              <div className="mt-2 flex max-w-full gap-2 overflow-x-auto px-2">
                {images.map((img) => (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => setZoomImage(img)}
                    className={`h-16 w-12 flex-shrink-0 overflow-hidden rounded-lg border ${
                      img.id === zoomImage.id ? "border-white ring-2 ring-white/80" : "border-zinc-500/60"
                    }`}
                  >
                    <img
                      src={img.url}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
