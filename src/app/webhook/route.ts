import { NextResponse } from "next/server";

async function handle() {
  return NextResponse.json({ ok: true });
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
