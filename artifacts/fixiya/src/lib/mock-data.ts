export type RequestStatus =
  | "Pending"
  | "Assigned"
  | "In Progress"
  | "Completed"
  | "Cancelled";

export interface Address {
  id: string;
  label: string;
  text: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  tagline: string;
}

export interface Service {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  timeEstimate: string;
  rating: number;
  reviews: number;
  tags: string[];
  includes: string[];
}

export interface Provider {
  id: string;
  name: string;
  initials: string;
  rating: number;
  jobs: number;
  experience: string;
  speciality: string;
}

export interface TimelineStep {
  label: string;
  time: string;
  done: boolean;
}

export interface ServiceRequest {
  id: string;
  serviceId: string;
  serviceName: string;
  categoryId: string;
  status: RequestStatus;
  date: string;
  time: string;
  amount: number;
  addressLabel: string;
  providerId: string | null;
  timeline: TimelineStep[];
}

export type NotificationType = "booking" | "offer" | "reminder" | "update" | "info";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  time: string;
  read: boolean;
}

export const MOCK_USER = {
  id: "u1",
  name: "Arjun Sharma",
  phone: "+91 98765 43210",
  email: "arjun.sharma@gmail.com",
  memberSince: "March 2024",
  addresses: [
    {
      id: "a1",
      label: "Home",
      text: "Flat 402, Sunshine Apartments, HSR Layout, Sector 2, Bengaluru 560102",
    },
    {
      id: "a2",
      label: "Office",
      text: "WeWork Galaxy, 43 Residency Road, Bengaluru 560025",
    },
  ] as Address[],
};

export const MOCK_CATEGORIES: Category[] = [
  { id: "ac", name: "AC Repair", icon: "ac-repair", tagline: "Cooling & service" },
  { id: "electric", name: "Electrician", icon: "electrician", tagline: "Wiring & fixtures" },
  { id: "plumbing", name: "Plumbing", icon: "plumber", tagline: "Leaks & fittings" },
  { id: "cleaning", name: "Cleaning", icon: "cleaning", tagline: "Deep home clean" },
  { id: "carpentry", name: "Carpentry", icon: "carpentry", tagline: "Repairs & assembly" },
  { id: "painting", name: "Painting", icon: "painting", tagline: "Walls & touch-ups" },
];

export const MOCK_SERVICES: Service[] = [
  {
    id: "s1",
    categoryId: "ac",
    name: "AC Regular Service",
    description:
      "Deep cleaning of filters, cooling coils, and the outdoor unit with a full gas-level check.",
    price: 499,
    timeEstimate: "45 mins",
    rating: 4.8,
    reviews: 1240,
    tags: ["Bestseller", "30-Day Warranty"],
    includes: [
      "Filter & coil deep cleaning",
      "Gas pressure check",
      "Drainage & cooling test",
      "Outdoor unit wash",
    ],
  },
  {
    id: "s2",
    categoryId: "ac",
    name: "AC Not Cooling Repair",
    description:
      "Full diagnosis and fix for ACs that are not cooling. Spare parts billed separately if needed.",
    price: 299,
    timeEstimate: "60 mins",
    rating: 4.6,
    reviews: 890,
    tags: ["30-Day Warranty"],
    includes: ["Fault diagnosis", "Gas top-up check", "Performance test"],
  },
  {
    id: "s3",
    categoryId: "electric",
    name: "Switch & Socket Replacement",
    description: "Replace faulty switches, sockets, or regulators safely and quickly.",
    price: 99,
    timeEstimate: "20 mins",
    rating: 4.9,
    reviews: 2100,
    tags: ["Quick Fix"],
    includes: ["Safe power isolation", "Fitting replacement", "Load test"],
  },
  {
    id: "s4",
    categoryId: "electric",
    name: "Fan Installation",
    description: "Ceiling or wall fan installation with mounting and wiring.",
    price: 199,
    timeEstimate: "40 mins",
    rating: 4.7,
    reviews: 760,
    tags: [],
    includes: ["Bracket mounting", "Wiring & regulator", "Balance check"],
  },
  {
    id: "s5",
    categoryId: "plumbing",
    name: "Leaking Tap Repair",
    description: "Repair or replacement of leaking taps, faucets, and mixers.",
    price: 149,
    timeEstimate: "30 mins",
    rating: 4.7,
    reviews: 1540,
    tags: ["Bestseller"],
    includes: ["Washer replacement", "Leak sealing", "Pressure check"],
  },
  {
    id: "s6",
    categoryId: "plumbing",
    name: "Blocked Drain Cleaning",
    description: "Clear blocked kitchen or bathroom drains with professional tools.",
    price: 249,
    timeEstimate: "45 mins",
    rating: 4.5,
    reviews: 620,
    tags: [],
    includes: ["Blockage removal", "Drain flush", "Flow test"],
  },
  {
    id: "s7",
    categoryId: "cleaning",
    name: "Full Home Deep Clean",
    description: "Top-to-bottom deep cleaning of your entire home by a trained crew.",
    price: 1499,
    timeEstimate: "3-4 hrs",
    rating: 4.8,
    reviews: 980,
    tags: ["Bestseller", "Crew of 2"],
    includes: ["All rooms & kitchen", "Bathroom sanitisation", "Floor scrubbing", "Dusting"],
  },
  {
    id: "s8",
    categoryId: "cleaning",
    name: "Bathroom Deep Clean",
    description: "Intensive descaling and sanitisation of bathroom tiles and fittings.",
    price: 399,
    timeEstimate: "60 mins",
    rating: 4.6,
    reviews: 540,
    tags: [],
    includes: ["Tile descaling", "Fittings polish", "Sanitisation"],
  },
  {
    id: "s9",
    categoryId: "carpentry",
    name: "Furniture Repair",
    description: "Fix wobbly chairs, tables, drawers, and loose hinges.",
    price: 199,
    timeEstimate: "40 mins",
    rating: 4.7,
    reviews: 430,
    tags: [],
    includes: ["Joint tightening", "Hinge & handle fix", "Surface check"],
  },
  {
    id: "s10",
    categoryId: "carpentry",
    name: "Furniture Assembly",
    description: "Assembly of flat-pack beds, wardrobes, and shelves.",
    price: 349,
    timeEstimate: "90 mins",
    rating: 4.8,
    reviews: 310,
    tags: ["Quick Fix"],
    includes: ["Full assembly", "Wall anchoring", "Stability check"],
  },
  {
    id: "s11",
    categoryId: "painting",
    name: "Single Wall Painting",
    description: "Fresh paint for one wall including primer and finish coat.",
    price: 899,
    timeEstimate: "2-3 hrs",
    rating: 4.6,
    reviews: 220,
    tags: [],
    includes: ["Surface prep", "Primer coat", "Two finish coats"],
  },
  {
    id: "s12",
    categoryId: "painting",
    name: "Wall Touch-up & Patch",
    description: "Quick patch-ups for cracks, dents, and scuff marks.",
    price: 299,
    timeEstimate: "60 mins",
    rating: 4.5,
    reviews: 180,
    tags: ["Quick Fix"],
    includes: ["Crack filling", "Sanding", "Colour matching"],
  },
];

export const MOCK_PROVIDERS: Provider[] = [
  {
    id: "p1",
    name: "Ramesh Kumar",
    initials: "RK",
    rating: 4.9,
    jobs: 1320,
    experience: "8 yrs",
    speciality: "AC & Appliances",
  },
  {
    id: "p2",
    name: "Suresh Patil",
    initials: "SP",
    rating: 4.6,
    jobs: 870,
    experience: "5 yrs",
    speciality: "Plumbing",
  },
  {
    id: "p3",
    name: "Vijay Anand",
    initials: "VA",
    rating: 4.8,
    jobs: 1040,
    experience: "6 yrs",
    speciality: "Electrical",
  },
  {
    id: "p4",
    name: "Deepa Nair",
    initials: "DN",
    rating: 4.9,
    jobs: 760,
    experience: "4 yrs",
    speciality: "Home Cleaning",
  },
];

export function getProvider(id: string | null): Provider | undefined {
  if (!id) return undefined;
  return MOCK_PROVIDERS.find((p) => p.id === id);
}

export function getService(id: string): Service | undefined {
  return MOCK_SERVICES.find((s) => s.id === id);
}

export function getCategory(id: string): Category | undefined {
  return MOCK_CATEGORIES.find((c) => c.id === id);
}

export const MOCK_REQUESTS: ServiceRequest[] = [
  {
    id: "req1",
    serviceId: "s2",
    serviceName: "AC Not Cooling Repair",
    categoryId: "ac",
    status: "In Progress",
    date: "Today",
    time: "11:00 AM",
    amount: 299,
    addressLabel: "Home",
    providerId: "p1",
    timeline: [
      { label: "Booking placed", time: "9:24 AM", done: true },
      { label: "Professional assigned", time: "9:40 AM", done: true },
      { label: "On the way", time: "10:45 AM", done: true },
      { label: "Service in progress", time: "11:05 AM", done: true },
      { label: "Job completed", time: "Pending", done: false },
    ],
  },
  {
    id: "req2",
    serviceId: "s5",
    serviceName: "Leaking Tap Repair",
    categoryId: "plumbing",
    status: "Assigned",
    date: "Tomorrow",
    time: "2:00 PM",
    amount: 149,
    addressLabel: "Home",
    providerId: "p2",
    timeline: [
      { label: "Booking placed", time: "Yesterday, 6:10 PM", done: true },
      { label: "Professional assigned", time: "Yesterday, 6:30 PM", done: true },
      { label: "On the way", time: "Pending", done: false },
      { label: "Service in progress", time: "Pending", done: false },
      { label: "Job completed", time: "Pending", done: false },
    ],
  },
  {
    id: "req3",
    serviceId: "s7",
    serviceName: "Full Home Deep Clean",
    categoryId: "cleaning",
    status: "Pending",
    date: "24 Jun",
    time: "10:00 AM",
    amount: 1499,
    addressLabel: "Office",
    providerId: null,
    timeline: [
      { label: "Booking placed", time: "Just now", done: true },
      { label: "Finding a professional", time: "In progress", done: false },
    ],
  },
  {
    id: "req4",
    serviceId: "s1",
    serviceName: "AC Regular Service",
    categoryId: "ac",
    status: "Completed",
    date: "12 Jun",
    time: "10:00 AM",
    amount: 499,
    addressLabel: "Home",
    providerId: "p1",
    timeline: [
      { label: "Booking placed", time: "12 Jun, 8:00 AM", done: true },
      { label: "Professional assigned", time: "12 Jun, 8:20 AM", done: true },
      { label: "On the way", time: "12 Jun, 9:40 AM", done: true },
      { label: "Service in progress", time: "12 Jun, 10:05 AM", done: true },
      { label: "Job completed", time: "12 Jun, 10:50 AM", done: true },
    ],
  },
  {
    id: "req5",
    serviceId: "s3",
    serviceName: "Switch & Socket Replacement",
    categoryId: "electric",
    status: "Cancelled",
    date: "5 Jun",
    time: "4:00 PM",
    amount: 99,
    addressLabel: "Home",
    providerId: "p3",
    timeline: [
      { label: "Booking placed", time: "5 Jun, 1:00 PM", done: true },
      { label: "Cancelled by you", time: "5 Jun, 2:10 PM", done: true },
    ],
  },
];

export function getRequest(id: string): ServiceRequest | undefined {
  return MOCK_REQUESTS.find((r) => r.id === id);
}

export const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: "n1",
    type: "booking",
    title: "Professional on the way",
    body: "Ramesh Kumar is arriving for your AC Not Cooling Repair. Track live status now.",
    time: "10 min ago",
    read: false,
  },
  {
    id: "n2",
    type: "booking",
    title: "Booking confirmed",
    body: "Your Leaking Tap Repair is scheduled for tomorrow at 2:00 PM.",
    time: "2 hours ago",
    read: false,
  },
  {
    id: "n3",
    type: "offer",
    title: "20% off plumbing",
    body: "Save on your next plumbing service this week. Use code PLUMB20 at checkout.",
    time: "1 day ago",
    read: true,
  },
  {
    id: "n4",
    type: "reminder",
    title: "Rate your last service",
    body: "How was your AC Regular Service with Ramesh Kumar? Leave a quick rating.",
    time: "2 days ago",
    read: true,
  },
  {
    id: "n5",
    type: "offer",
    title: "Monsoon home check",
    body: "Book a full home deep clean and get a free bathroom sanitisation this season.",
    time: "4 days ago",
    read: true,
  },
];

export const TIME_SLOTS = [
  "09:00 AM",
  "11:00 AM",
  "01:00 PM",
  "03:00 PM",
  "05:00 PM",
  "07:00 PM",
];

export const BOOKING_DAYS = [
  { id: "today", label: "Today", sub: "23 Jun" },
  { id: "tomorrow", label: "Tomorrow", sub: "24 Jun" },
  { id: "wed", label: "Wed", sub: "25 Jun" },
  { id: "thu", label: "Thu", sub: "26 Jun" },
  { id: "fri", label: "Fri", sub: "27 Jun" },
];

export function formatRupees(n: number): string {
  return "\u20B9" + n.toLocaleString("en-IN");
}
