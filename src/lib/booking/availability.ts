import { addDays, format, getDay, parseISO } from "date-fns";
import type { Slot } from "./slot-engine";
import { generateSlots, type Busy } from "./slot-engine";
import { getService } from "@/lib/data/services";
import { staffForService } from "@/lib/data/team";

const DEFAULT_HOURS_BY_WEEKDAY: Record<number, { open: string; close: string } | null> = {
  0: { open: "14:00", close: "20:00" },
  1: { open: "09:00", close: "20:00" },
  2: { open: "09:00", close: "20:00" },
  3: { open: "09:00", close: "20:00" },
  4: { open: "09:00", close: "20:00" },
  5: { open: "09:00", close: "21:00" },
  6: { open: "09:00", close: "20:00" },
};

export type AvailabilityQuery = {
  serviceSlug: string;
  unitSlug: string;
  staffSlug: string;
  date: string;
  busy?: Busy[];
  durationOverride?: number;
};

export function getAvailableSlots({
  serviceSlug,
  unitSlug,
  staffSlug,
  date,
  busy = [],
  durationOverride,
}: AvailabilityQuery): Slot[] {
  const service = getService(serviceSlug);
  if (!service) return [];

  if (staffSlug !== "__any__") {
    const candidates = staffForService(serviceSlug, unitSlug);
    const staff = candidates.find((s) => s.slug === staffSlug);
    if (!staff) return [];
  }

  const weekday = getDay(parseISO(date));
  const hours = DEFAULT_HOURS_BY_WEEKDAY[weekday];
  if (!hours) return [];

  return generateSlots({
    date,
    durationMinutes: durationOverride ?? service.duration,
    workingHours: { openTime: hours.open, closeTime: hours.close },
    busy,
    stepMinutes: 30,
    bufferMinutes: 10,
  });
}

export function nextSevenDays(from: Date = new Date()): { date: string; label: string; weekday: number }[] {
  return Array.from({ length: 14 }, (_, i) => {
    const d = addDays(from, i);
    return {
      date: format(d, "yyyy-MM-dd"),
      label: format(d, "dd/MM"),
      weekday: getDay(d),
    };
  });
}
