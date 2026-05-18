import { addDays, addHours, addMinutes, format, setHours, setMinutes } from "date-fns";

export type MockBookingStatus =
  | "pending_payment"
  | "confirmed"
  | "checked_in"
  | "completed"
  | "cancelled_client"
  | "no_show";

export type MockBooking = {
  id: string;
  clientName: string;
  clientId: string;
  clientPhone: string;
  staffSlug: string;
  staffName: string;
  unitSlug: string;
  unitName: string;
  serviceSlug: string;
  serviceName: string;
  scheduledAt: Date;
  durationMinutes: number;
  status: MockBookingStatus;
  totalCents: number;
  depositCents: number;
};

const today = new Date();
const todayMorning = setMinutes(setHours(today, 9), 0);

export const MOCK_BOOKINGS: MockBooking[] = [
  {
    id: "bkg-001",
    clientName: "Mariana Castelo",
    clientId: "cli-001",
    clientPhone: "(86) 99102-3344",
    staffSlug: "silvia-meneses",
    staffName: "Silvia Meneses",
    unitSlug: "casa-i-teresina-shopping",
    unitName: "Casa I",
    serviceSlug: "bordado",
    serviceName: "Corte Bordado",
    scheduledAt: addHours(todayMorning, 0),
    durationMinutes: 75,
    status: "confirmed",
    totalCents: 22000,
    depositCents: 0,
  },
  {
    id: "bkg-002",
    clientName: "Camila Veloso",
    clientId: "cli-002",
    clientPhone: "(86) 99988-7766",
    staffSlug: "ana-correia",
    staffName: "Ana Correia",
    unitSlug: "casa-i-teresina-shopping",
    unitName: "Casa I",
    serviceSlug: "mechas",
    serviceName: "Mechas",
    scheduledAt: addHours(todayMorning, 2),
    durationMinutes: 240,
    status: "confirmed",
    totalCents: 52000,
    depositCents: 15600,
  },
  {
    id: "bkg-003",
    clientName: "Letícia Almeida",
    clientId: "cli-003",
    clientPhone: "(86) 98877-5544",
    staffSlug: "fernanda-castro",
    staffName: "Fernanda Castro",
    unitSlug: "casa-i-teresina-shopping",
    unitName: "Casa I",
    serviceSlug: "ritual-kerastase",
    serviceName: "Ritual Kérastase",
    scheduledAt: addHours(todayMorning, 4),
    durationMinutes: 90,
    status: "checked_in",
    totalCents: 28000,
    depositCents: 0,
  },
  {
    id: "bkg-004",
    clientName: "Beatriz Sá",
    clientId: "cli-004",
    clientPhone: "(86) 99201-1188",
    staffSlug: "marcos-vinicius",
    staffName: "Marcos Vinícius",
    unitSlug: "casa-ii-rio-poty",
    unitName: "Casa II",
    serviceSlug: "masculino",
    serviceName: "Corte masculino",
    scheduledAt: addHours(todayMorning, 6),
    durationMinutes: 45,
    status: "pending_payment",
    totalCents: 9500,
    depositCents: 0,
  },
  {
    id: "bkg-005",
    clientName: "Ana Paula Reis",
    clientId: "cli-005",
    clientPhone: "(86) 99001-2233",
    staffSlug: "patricia-lima",
    staffName: "Patrícia Lima",
    unitSlug: "casa-ii-rio-poty",
    unitName: "Casa II",
    serviceSlug: "acrigel",
    serviceName: "Acrigel",
    scheduledAt: addHours(todayMorning, 7),
    durationMinutes: 120,
    status: "confirmed",
    totalCents: 18000,
    depositCents: 0,
  },
  {
    id: "bkg-006",
    clientName: "Renata Vieira",
    clientId: "cli-006",
    clientPhone: "(86) 98765-4321",
    staffSlug: "silvia-meneses",
    staffName: "Silvia Meneses",
    unitSlug: "casa-i-teresina-shopping",
    unitName: "Casa I",
    serviceSlug: "luzes",
    serviceName: "Luzes globais",
    scheduledAt: addDays(addHours(todayMorning, 2), 1),
    durationMinutes: 300,
    status: "confirmed",
    totalCents: 68000,
    depositCents: 20400,
  },
  {
    id: "bkg-007",
    clientName: "Sofia Albuquerque",
    clientId: "cli-007",
    clientPhone: "(86) 98123-4567",
    staffSlug: "juliana-rocha",
    staffName: "Juliana Rocha",
    unitSlug: "casa-i-teresina-shopping",
    unitName: "Casa I",
    serviceSlug: "limpeza-pele",
    serviceName: "Limpeza de pele",
    scheduledAt: addDays(addHours(todayMorning, 4), 2),
    durationMinutes: 90,
    status: "confirmed",
    totalCents: 22000,
    depositCents: 0,
  },
];

export type MockClient = {
  id: string;
  name: string;
  email: string;
  phone: string;
  firstSeenAt: Date;
  lastSeenAt: Date | null;
  visitCount: number;
  lifetimeValueCents: number;
  unitPreference: string;
  notes?: string;
  hairType?: string;
  isInactive: boolean;
  upcomingBookings: number;
};

export const MOCK_CLIENTS: MockClient[] = [
  {
    id: "cli-001",
    name: "Mariana Castelo",
    email: "mariana.castelo@example.com",
    phone: "(86) 99102-3344",
    firstSeenAt: addDays(today, -1100),
    lastSeenAt: addDays(today, -45),
    visitCount: 28,
    lifetimeValueCents: 612000,
    unitPreference: "Casa I",
    hairType: "Liso, médio porosidade",
    notes: "Prefere coloração sem amônia. Alérgica a parabenos.",
    isInactive: false,
    upcomingBookings: 1,
  },
  {
    id: "cli-002",
    name: "Camila Veloso",
    email: "camila.veloso@example.com",
    phone: "(86) 99988-7766",
    firstSeenAt: addDays(today, -1450),
    lastSeenAt: addDays(today, -30),
    visitCount: 42,
    lifetimeValueCents: 1240000,
    unitPreference: "Casa I",
    hairType: "Ondulado, descolorido",
    notes: "Loiro pérola, retoque a cada 6 semanas.",
    isInactive: false,
    upcomingBookings: 1,
  },
  {
    id: "cli-003",
    name: "Letícia Almeida",
    email: "leticia.almeida@example.com",
    phone: "(86) 98877-5544",
    firstSeenAt: addDays(today, -3200),
    lastSeenAt: addDays(today, -12),
    visitCount: 96,
    lifetimeValueCents: 2480000,
    unitPreference: "Casa I",
    hairType: "Cacheado 3A",
    isInactive: false,
    upcomingBookings: 2,
  },
  {
    id: "cli-004",
    name: "Beatriz Sá",
    email: "beatriz.sa@example.com",
    phone: "(86) 99201-1188",
    firstSeenAt: addDays(today, -210),
    lastSeenAt: addDays(today, -70),
    visitCount: 4,
    lifetimeValueCents: 38000,
    unitPreference: "Casa II",
    isInactive: false,
    upcomingBookings: 1,
  },
  {
    id: "cli-005",
    name: "Ana Paula Reis",
    email: "ana.reis@example.com",
    phone: "(86) 99001-2233",
    firstSeenAt: addDays(today, -800),
    lastSeenAt: addDays(today, -8),
    visitCount: 24,
    lifetimeValueCents: 280000,
    unitPreference: "Casa II",
    isInactive: false,
    upcomingBookings: 1,
  },
  {
    id: "cli-006",
    name: "Renata Vieira",
    email: "renata.vieira@example.com",
    phone: "(86) 98765-4321",
    firstSeenAt: addDays(today, -560),
    lastSeenAt: addDays(today, -90),
    visitCount: 14,
    lifetimeValueCents: 420000,
    unitPreference: "Casa I",
    hairType: "Liso, fios médios",
    isInactive: false,
    upcomingBookings: 1,
  },
  {
    id: "cli-007",
    name: "Sofia Albuquerque",
    email: "sofia.albuquerque@example.com",
    phone: "(86) 98123-4567",
    firstSeenAt: addDays(today, -90),
    lastSeenAt: addDays(today, -2),
    visitCount: 3,
    lifetimeValueCents: 54000,
    unitPreference: "Casa I",
    isInactive: false,
    upcomingBookings: 1,
  },
  {
    id: "cli-008",
    name: "Júlia Mendes",
    email: "julia.mendes@example.com",
    phone: "(86) 99876-5432",
    firstSeenAt: addDays(today, -900),
    lastSeenAt: addDays(today, -180),
    visitCount: 11,
    lifetimeValueCents: 195000,
    unitPreference: "Casa I",
    isInactive: true,
    upcomingBookings: 0,
  },
  {
    id: "cli-009",
    name: "Helena Carvalho",
    email: "helena.carvalho@example.com",
    phone: "(86) 99443-2211",
    firstSeenAt: addDays(today, -1800),
    lastSeenAt: addDays(today, -240),
    visitCount: 32,
    lifetimeValueCents: 920000,
    unitPreference: "Casa II",
    isInactive: true,
    upcomingBookings: 0,
  },
];

export function bookingsForDate(date: Date): MockBooking[] {
  const target = format(date, "yyyy-MM-dd");
  return MOCK_BOOKINGS.filter((b) => format(b.scheduledAt, "yyyy-MM-dd") === target);
}

export function bookingsForToday(): MockBooking[] {
  return bookingsForDate(new Date());
}

export function bookingsForStaff(staffSlug: string, date: Date): MockBooking[] {
  return bookingsForDate(date).filter((b) => b.staffSlug === staffSlug);
}

export function nextBookingForStaff(staffSlug: string): MockBooking | undefined {
  const now = new Date();
  return MOCK_BOOKINGS
    .filter((b) => b.staffSlug === staffSlug && b.scheduledAt >= now)
    .sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime())[0];
}

export function clientById(id: string) {
  return MOCK_CLIENTS.find((c) => c.id === id);
}

export function bookingsForClient(clientId: string): MockBooking[] {
  return MOCK_BOOKINGS.filter((b) => b.clientId === clientId);
}

export function bookingEnd(b: MockBooking): Date {
  return addMinutes(b.scheduledAt, b.durationMinutes);
}

export function statusLabel(s: MockBookingStatus): string {
  const map: Record<MockBookingStatus, string> = {
    pending_payment: "Aguardando Pix",
    confirmed: "Confirmado",
    checked_in: "Em atendimento",
    completed: "Concluído",
    cancelled_client: "Cancelado pela cliente",
    no_show: "Não compareceu",
  };
  return map[s];
}

export function statusTone(s: MockBookingStatus): "ink" | "warn" | "teal" | "muted" | "danger" {
  if (s === "pending_payment") return "warn";
  if (s === "confirmed") return "ink";
  if (s === "checked_in") return "teal";
  if (s === "completed") return "muted";
  return "danger";
}
