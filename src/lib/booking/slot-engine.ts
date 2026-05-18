import { addMinutes, format, isBefore, parseISO, setHours, setMinutes, setSeconds } from "date-fns";

export type Busy = { startsAt: Date; endsAt: Date };

export type SlotEngineInput = {
  date: string;
  durationMinutes: number;
  workingHours: { openTime: string; closeTime: string };
  busy: Busy[];
  stepMinutes?: number;
  bufferMinutes?: number;
  now?: Date;
};

export type Slot = {
  time: string;
  available: boolean;
  reason?: "taken" | "past";
};

export function generateSlots(input: SlotEngineInput): Slot[] {
  const {
    date,
    durationMinutes,
    workingHours,
    busy,
    stepMinutes = 15,
    bufferMinutes = 5,
    now = new Date(),
  } = input;

  const dayStart = withTime(parseISO(date), workingHours.openTime);
  const dayEnd = withTime(parseISO(date), workingHours.closeTime);

  const slots: Slot[] = [];
  let cursor = dayStart;

  while (!isBefore(dayEnd, addMinutes(cursor, durationMinutes))) {
    const slotEnd = addMinutes(cursor, durationMinutes);
    const isPast = isBefore(cursor, now);
    const isTaken = busy.some((b) =>
      overlapsWithBuffer(cursor, slotEnd, b.startsAt, b.endsAt, bufferMinutes),
    );

    slots.push({
      time: format(cursor, "HH:mm"),
      available: !isPast && !isTaken,
      reason: isPast ? "past" : isTaken ? "taken" : undefined,
    });

    cursor = addMinutes(cursor, stepMinutes);
  }
  return slots;
}

function withTime(date: Date, hhmm: string): Date {
  const parts = hhmm.split(":");
  const h = Number(parts[0] ?? "0");
  const m = Number(parts[1] ?? "0");
  return setSeconds(setMinutes(setHours(date, h), m), 0);
}

function overlapsWithBuffer(
  aStart: Date,
  aEnd: Date,
  bStart: Date,
  bEnd: Date,
  bufferMinutes: number,
): boolean {
  const bExpandedStart = addMinutes(bStart, -bufferMinutes);
  const bExpandedEnd = addMinutes(bEnd, bufferMinutes);
  return aStart < bExpandedEnd && aEnd > bExpandedStart;
}
