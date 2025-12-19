"use client";

import { useState, useTransition } from "react";

interface Props {
  orderId: number;
  initialStatus: "PENDING" | "LIVREE" | "RETOUR" | "ANNULEE";
  initialPhoneConfirmed: boolean;
  updateAction: (formData: FormData) => Promise<void> | void;
  netTotal: number;
}

export function OrderStatusControls({
  orderId,
  initialStatus,
  initialPhoneConfirmed,
  updateAction,
  netTotal,
}: Props) {
  const [status, setStatus] = useState<Props["initialStatus"]>(initialStatus);
  const [phoneConfirmed, setPhoneConfirmed] = useState<boolean>(initialPhoneConfirmed);
  const [isPending, startTransition] = useTransition();

  const submit = (nextStatus: typeof status, nextPhoneConfirmed: boolean) => {
    startTransition(async () => {
      const fd = new FormData();
      fd.append("orderId", String(orderId));
      fd.append("status", nextStatus);
      fd.append("phoneConfirmed", String(nextPhoneConfirmed));
      await updateAction(fd);
    });
  };

  const handleStatusChange = (value: typeof status) => {
    setStatus(value);
    submit(value, phoneConfirmed);
  };

  const handlePhoneChange = (value: boolean) => {
    setPhoneConfirmed(value);
    submit(status, value);
  };

  return (
    <div className="flex items-center justify-end gap-6 text-sm md:min-w-[320px]">
      {/* Prix total produit (sans livraison) */}
      <div className="text-right text-2xl font-bold text-[#ff1744] min-w-[90px]">
        {netTotal.toFixed(2)} DT
      </div>

      {/* Confirmation tél. + Status alignés horizontalement */}
      <div className="flex items-center gap-6 text-[11px]">
        <div className="flex flex-col items-start gap-1 min-w-[130px]">
          <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-[0.14em]">
            Confirmation tél.
          </span>
          <select
            value={phoneConfirmed ? "true" : "false"}
            onChange={(e) => handlePhoneChange(e.target.value === "true")}
            className={`min-w-[120px] rounded-md border px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-rose-400 focus:border-rose-400 ${
              phoneConfirmed
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-rose-200 bg-rose-50 text-rose-700"
            }`}
          >
            <option value="false">Non</option>
            <option value="true">Oui</option>
          </select>
        </div>

        <div className="flex flex-col items-start gap-1 min-w-[150px]">
          <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-[0.14em]">
            Status
          </span>
          <div
            className={`inline-flex items-center gap-2 min-w-[140px] rounded-md border px-2 py-1.5 ${
              status === "PENDING"
                ? "border-amber-200 bg-amber-50"
                : status === "LIVREE"
                ? "border-emerald-200 bg-emerald-50"
                : status === "RETOUR"
                ? "border-sky-200 bg-sky-50"
                : "border-rose-200 bg-rose-50"
            }`}
          >
            {status === "PENDING" ? (
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            ) : status === "LIVREE" ? (
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            ) : status === "RETOUR" ? (
              <span className="h-2.5 w-2.5 rounded-full bg-sky-500" />
            ) : (
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
            )}
            <select
              value={status}
              onChange={(e) => handleStatusChange(e.target.value as Props["initialStatus"])}
              className={`flex-1 bg-transparent text-xs outline-none ${
                status === "PENDING"
                  ? "text-amber-800"
                  : status === "LIVREE"
                  ? "text-emerald-800"
                  : status === "RETOUR"
                  ? "text-sky-800"
                  : "text-rose-800"
              }`}
            >
              <option value="PENDING">En attente</option>
              <option value="LIVREE">Livrée</option>
              <option value="RETOUR">Retour</option>
              <option value="ANNULEE">Refusée</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
