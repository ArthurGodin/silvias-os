"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

type Status = "loading" | "authenticated" | "anonymous";

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    let mounted = true;
    let supabase;
    try {
      supabase = createClient();
    } catch {
      // Sem credenciais Supabase: trata como anônimo (modo dev).
      setStatus("anonymous");
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setStatus(data.session ? "authenticated" : "anonymous");
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      if (!mounted) return;
      setSession(s);
      setStatus(s ? "authenticated" : "anonymous");
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { session, status, isAuthenticated: status === "authenticated" };
}
