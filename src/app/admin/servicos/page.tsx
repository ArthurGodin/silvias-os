import { createAdminClient } from "@/lib/supabase/admin";
import {
  ServicesPageClient,
  type ServiceRow,
} from "@/components/admin/services-page-client";

export const dynamic = "force-dynamic";

type CategorySlug = "cabelo" | "estetica" | "unhas" | "depilacao";

type DbCategory = {
  id: string;
  slug: CategorySlug;
  index: number;
  title: string;
};

type DbService = {
  slug: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  from_price_cents: number;
  requires_deposit: boolean;
  is_active: boolean;
  category_id: string;
};

export default async function AdminServicosPage() {
  const supabase = createAdminClient();

  const [catsRes, svcsRes] = await Promise.all([
    supabase
      .from("service_categories")
      .select("id, slug, index, title")
      .order("index", { ascending: true }),
    supabase
      .from("services")
      .select(
        "slug, name, description, duration_minutes, from_price_cents, requires_deposit, is_active, category_id",
      )
      .is("deleted_at", null)
      .order("name", { ascending: true }),
  ]);

  const cats = (catsRes.data as DbCategory[] | null) ?? [];
  const svcs = (svcsRes.data as DbService[] | null) ?? [];

  const groups = cats.map((cat) => ({
    categorySlug: cat.slug,
    title: cat.title,
    items: svcs
      .filter((s) => s.category_id === cat.id)
      .map<ServiceRow>((s) => ({
        slug: s.slug,
        name: s.name,
        categorySlug: cat.slug,
        categoryTitle: cat.title,
        description: s.description ?? "",
        durationMinutes: s.duration_minutes,
        fromPriceReais: s.from_price_cents / 100,
        requiresDeposit: s.requires_deposit,
        isActive: s.is_active,
      })),
  }));

  return (
    <main className="px-8 lg:px-12 py-10 lg:py-14">
      <ServicesPageClient groups={groups} />
    </main>
  );
}
