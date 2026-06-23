import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { MapPin, Calendar, Phone, MessageSquare, Star, BadgeCheck } from "lucide-react";
import {
  getRequest,
  getProvider,
  getCategory,
  MOCK_USER,
  formatRupees,
} from "@/lib/mock-data";
import { categoryImage } from "@/lib/images";
import { ScreenHeader } from "@/components/screen-header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";

export default function RequestDetail({ id }: { id: string }) {
  const [, navigate] = useLocation();
  const request = getRequest(id);

  if (!request) {
    return (
      <div className="flex min-h-full flex-col bg-background">
        <ScreenHeader title="Request" />
        <p className="px-5 text-sm text-muted-foreground">Request not found.</p>
      </div>
    );
  }

  const provider = getProvider(request.providerId);
  const cat = getCategory(request.categoryId);
  const isCancellable = request.status === "Pending" || request.status === "Assigned";

  return (
    <div className="flex min-h-full flex-col bg-background pb-28">
      <ScreenHeader
        title="Request details"
        subtitle={`#${request.id.toUpperCase()}`}
        action={<StatusBadge status={request.status} />}
      />

      <div className="px-5">
        <div className="flex items-center gap-3 rounded-2xl border border-card-border bg-card p-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-secondary">
            <img src={categoryImage(cat?.icon ?? "")} alt="" className="h-9 w-9 object-contain" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-bold">{request.serviceName}</p>
            <p className="text-xs text-muted-foreground">{cat?.name}</p>
          </div>
          <p className="text-base font-extrabold text-primary">{formatRupees(request.amount)}</p>
        </div>
      </div>

      {provider && (
        <div className="px-5 pt-4">
          <h2 className="mb-2.5 text-sm font-bold">Your professional</h2>
          <div className="flex items-center gap-3 rounded-2xl border border-card-border bg-card p-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
              {provider.initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1 text-sm font-bold">
                {provider.name}
                <BadgeCheck size={15} className="text-primary" />
              </p>
              <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                <Star size={12} className="fill-amber-400 text-amber-400" />
                {provider.rating} • {provider.speciality}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                aria-label="Call professional"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary"
              >
                <Phone size={17} />
              </button>
              <button
                type="button"
                aria-label="Message professional"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary"
              >
                <MessageSquare size={17} />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="px-5 pt-5">
        <h2 className="mb-3 text-sm font-bold">Status timeline</h2>
        <div className="rounded-2xl border border-card-border bg-card p-4">
          {request.timeline.map((step, i) => {
            const last = i === request.timeline.length - 1;
            return (
              <motion.div
                key={step.label}
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.08 }}
                className="flex gap-3"
              >
                <div className="flex flex-col items-center">
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full ${
                      step.done
                        ? "bg-primary"
                        : "border-2 border-dashed border-border bg-card"
                    }`}
                  >
                    {step.done && (
                      <span className="h-2 w-2 rounded-full bg-primary-foreground" />
                    )}
                  </span>
                  {!last && (
                    <span
                      className={`my-0.5 w-0.5 flex-1 ${step.done ? "bg-primary/40" : "bg-border"}`}
                      style={{ minHeight: 28 }}
                    />
                  )}
                </div>
                <div className={`pb-4 ${last ? "pb-0" : ""}`}>
                  <p className={`text-sm font-semibold ${step.done ? "text-foreground" : "text-muted-foreground"}`}>
                    {step.label}
                  </p>
                  <p className="text-xs text-muted-foreground">{step.time}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="px-5 pt-5">
        <h2 className="mb-2.5 text-sm font-bold">Booking info</h2>
        <div className="space-y-3 rounded-2xl border border-card-border bg-card p-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Calendar size={16} />
            </span>
            <div>
              <p className="text-xs text-muted-foreground">Scheduled</p>
              <p className="text-sm font-semibold">{request.date}, {request.time}</p>
            </div>
          </div>
          <div className="h-px bg-border" />
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <MapPin size={16} />
            </span>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">{request.addressLabel}</p>
              <p className="truncate text-sm font-semibold">
                {MOCK_USER.addresses.find((a) => a.label === request.addressLabel)?.text ??
                  MOCK_USER.addresses[0].text}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 border-t border-border bg-card/95 px-5 py-4 backdrop-blur-md">
        {request.status === "Completed" ? (
          <Button className="h-12 w-full rounded-2xl text-base font-semibold" onClick={() => navigate(`/book/${request.serviceId}`)}>
            Book Again
          </Button>
        ) : isCancellable ? (
          <Button
            variant="outline"
            className="h-12 w-full rounded-2xl border-destructive/30 text-base font-semibold text-destructive"
            onClick={() => navigate("/requests")}
          >
            Cancel Request
          </Button>
        ) : (
          <Button className="h-12 w-full rounded-2xl text-base font-semibold" disabled>
            Service in progress
          </Button>
        )}
      </div>
    </div>
  );
}
