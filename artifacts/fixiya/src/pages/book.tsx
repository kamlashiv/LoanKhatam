import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import {
  getService,
  MOCK_USER,
  BOOKING_DAYS,
  TIME_SLOTS,
  formatRupees,
} from "@/lib/mock-data";
import { ScreenHeader } from "@/components/screen-header";
import { Button } from "@/components/ui/button";

export default function Book({ id }: { id: string }) {
  const [, navigate] = useLocation();
  const service = getService(id);
  const [addressId, setAddressId] = useState(MOCK_USER.addresses[0].id);
  const [day, setDay] = useState("today");
  const [slot, setSlot] = useState("");
  const [note, setNote] = useState("");

  if (!service) {
    return (
      <div className="flex min-h-full flex-col bg-background">
        <ScreenHeader title="Book service" />
        <p className="px-5 text-sm text-muted-foreground">Service not found.</p>
      </div>
    );
  }

  const visitFee = 49;
  const total = service.price + visitFee;
  const canBook = slot !== "";

  return (
    <div className="flex min-h-full flex-col bg-background pb-28">
      <ScreenHeader title="Book service" subtitle={service.name} />

      <div className="space-y-6 px-5">
        <section>
          <h2 className="mb-2.5 text-sm font-bold">Service address</h2>
          <div className="space-y-2.5">
            {MOCK_USER.addresses.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => setAddressId(a.id)}
                className={`flex w-full items-start gap-3 rounded-2xl border p-3.5 text-left transition-colors ${
                  addressId === a.id
                    ? "border-primary bg-primary/5"
                    : "border-card-border bg-card"
                }`}
              >
                <span
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                    addressId === a.id ? "border-primary bg-primary text-primary-foreground" : "border-border"
                  }`}
                >
                  {addressId === a.id && <Check size={12} strokeWidth={3} />}
                </span>
                <div>
                  <p className="text-sm font-semibold">{a.label}</p>
                  <p className="text-xs text-muted-foreground">{a.text}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-2.5 text-sm font-bold">Select day</h2>
          <div className="flex gap-2.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {BOOKING_DAYS.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setDay(d.id)}
                className={`flex shrink-0 flex-col items-center rounded-2xl border px-4 py-3 transition-colors ${
                  day === d.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-card-border bg-card"
                }`}
              >
                <span className="text-sm font-bold">{d.label}</span>
                <span className={`text-xs ${day === d.id ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                  {d.sub}
                </span>
              </button>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-2.5 text-sm font-bold">Select time slot</h2>
          <div className="grid grid-cols-3 gap-2.5">
            {TIME_SLOTS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setSlot(t)}
                className={`rounded-xl border py-2.5 text-sm font-semibold transition-colors ${
                  slot === t
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-card-border bg-card text-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-2.5 text-sm font-bold">Describe the problem (optional)</h2>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="e.g. The kitchen tap has been dripping for two days."
            className="w-full resize-none rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/15"
          />
        </section>

        <section className="rounded-2xl border border-card-border bg-card p-4">
          <h2 className="text-sm font-bold">Bill summary</h2>
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>{service.name}</span>
              <span className="text-foreground">{formatRupees(service.price)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Visit & inspection fee</span>
              <span className="text-foreground">{formatRupees(visitFee)}</span>
            </div>
            <div className="my-2 h-px bg-border" />
            <div className="flex justify-between text-base font-extrabold">
              <span>Total</span>
              <span className="text-primary">{formatRupees(total)}</span>
            </div>
          </div>
        </section>
      </div>

      <div className="absolute bottom-0 left-0 right-0 border-t border-border bg-card/95 px-5 py-4 backdrop-blur-md">
        <Button
          disabled={!canBook}
          className="h-13 w-full rounded-2xl py-6 text-base font-semibold shadow-lg shadow-primary/20 disabled:opacity-40"
          onClick={() => navigate("/booking-confirmed")}
        >
          {canBook ? `Confirm Booking • ${formatRupees(total)}` : "Select a time slot"}
        </Button>
      </div>
    </div>
  );
}
