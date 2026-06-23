import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Star, Clock, Check, ShieldCheck, BadgeCheck } from "lucide-react";
import { getService, getCategory, formatRupees, MOCK_PROVIDERS } from "@/lib/mock-data";
import { categoryImage } from "@/lib/images";
import { ScreenHeader } from "@/components/screen-header";
import { Button } from "@/components/ui/button";

const REVIEWS = [
  { name: "Priya M.", rating: 5, text: "Quick, polite and fixed it in one visit. Highly recommend!" },
  { name: "Karan S.", rating: 5, text: "Professional arrived on time and explained everything clearly." },
  { name: "Neha R.", rating: 4, text: "Good service, fair pricing. Will book again." },
];

export default function ServiceDetail({ id }: { id: string }) {
  const [, navigate] = useLocation();
  const service = getService(id);

  if (!service) {
    return (
      <div className="flex min-h-full flex-col bg-background">
        <ScreenHeader title="Service" />
        <p className="px-5 text-sm text-muted-foreground">Service not found.</p>
      </div>
    );
  }

  const cat = getCategory(service.categoryId);
  const provider = MOCK_PROVIDERS[0];

  return (
    <div className="flex min-h-full flex-col bg-background pb-28">
      <ScreenHeader title={cat?.name ?? "Service"} />

      <div className="px-5">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex items-center gap-4 rounded-3xl bg-secondary p-5"
        >
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-card">
            <img src={categoryImage(cat?.icon ?? "")} alt="" className="h-14 w-14 object-contain" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-extrabold leading-tight">{service.name}</h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1 font-semibold text-foreground">
                <Star size={13} className="fill-amber-400 text-amber-400" />
                {service.rating}
                <span className="font-normal text-muted-foreground">
                  ({service.reviews.toLocaleString("en-IN")})
                </span>
              </span>
              <span className="flex items-center gap-1">
                <Clock size={13} />
                {service.timeEstimate}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {service.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 px-5 pt-4">
          {service.tags.map((t) => (
            <span
              key={t}
              className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent"
            >
              {t}
            </span>
          ))}
        </div>
      )}

      <div className="px-5 pt-6">
        <h2 className="text-sm font-bold">About this service</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{service.description}</p>
      </div>

      <div className="px-5 pt-6">
        <h2 className="text-sm font-bold">What's included</h2>
        <div className="mt-3 space-y-2.5">
          {service.includes.map((item, i) => (
            <motion.div
              key={item}
              initial={{ x: -12, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.06 }}
              className="flex items-center gap-3"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Check size={14} strokeWidth={3} />
              </span>
              <span className="text-sm text-foreground">{item}</span>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="px-5 pt-6">
        <div className="flex items-center gap-3 rounded-2xl border border-card-border bg-card p-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
            {provider.initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1 text-sm font-bold">
              {provider.name}
              <BadgeCheck size={15} className="text-primary" />
            </p>
            <p className="text-xs text-muted-foreground">
              {provider.speciality} • {provider.experience} experience
            </p>
          </div>
          <div className="text-right">
            <span className="flex items-center gap-0.5 text-sm font-bold">
              <Star size={13} className="fill-amber-400 text-amber-400" />
              {provider.rating}
            </span>
            <span className="text-xs text-muted-foreground">{provider.jobs}+ jobs</span>
          </div>
        </div>
      </div>

      <div className="px-5 pt-6">
        <h2 className="text-sm font-bold">Reviews</h2>
        <div className="mt-3 space-y-3">
          {REVIEWS.map((r) => (
            <div key={r.name} className="rounded-2xl border border-card-border bg-card p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">{r.name}</p>
                <span className="flex items-center gap-0.5">
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <Star key={i} size={12} className="fill-amber-400 text-amber-400" />
                  ))}
                </span>
              </div>
              <p className="mt-1.5 text-sm text-muted-foreground">{r.text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-5 pt-6">
        <div className="flex items-center gap-2 rounded-2xl bg-secondary p-4 text-xs text-muted-foreground">
          <ShieldCheck size={18} className="shrink-0 text-primary" />
          Backed by Fixiya's 30-day service warranty and verified professionals.
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 flex items-center gap-4 border-t border-border bg-card/95 px-5 py-4 backdrop-blur-md">
        <div>
          <p className="text-xs text-muted-foreground">Starting at</p>
          <p className="text-xl font-extrabold text-primary">{formatRupees(service.price)}</p>
        </div>
        <Button
          className="h-12 flex-1 rounded-2xl text-base font-semibold shadow-lg shadow-primary/20"
          onClick={() => navigate(`/book/${service.id}`)}
        >
          Book Now
        </Button>
      </div>
    </div>
  );
}
