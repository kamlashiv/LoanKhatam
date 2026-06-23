import acRepair from "@/assets/images/ac-repair.png";
import electrician from "@/assets/images/electrician.png";
import plumber from "@/assets/images/plumber.png";
import cleaning from "@/assets/images/cleaning.png";
import carpentry from "@/assets/images/carpentry.png";
import painting from "@/assets/images/painting.png";
import logo from "@/assets/images/logo.png";
import splash from "@/assets/images/splash-graphic.png";

export const IMAGES: Record<string, string> = {
  "ac-repair": acRepair,
  electrician,
  plumber,
  cleaning,
  carpentry,
  painting,
  logo,
  splash,
};

export function categoryImage(icon: string): string {
  return IMAGES[icon] ?? logo;
}
