import { createAdminClient } from "@/lib/supabase/admin";
import {
  StaffPageClient,
  type StaffRow,
} from "@/components/admin/staff-page-client";

export const dynamic = "force-dynamic";

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  manager: "Gerência",
  stylist: "Profissional",
  receptionist: "Recepção",
};

type RawStaff = {
  slug: string;
  name: string;
  role: "admin" | "manager" | "stylist" | "receptionist";
  bio: string | null;
  image_url: string | null;
  credentials: string[] | null;
  primary_unit_id: string | null;
  staff_services: { service_id: string }[];
  staff_units: { unit_id: string }[];
};

export default async function AdminEquipePage() {
  const supabase = createAdminClient();

  const [unitsRes, staffRes] = await Promise.all([
    supabase
      .from("units")
      .select("id, slug, name")
      .is("deleted_at", null)
      .order("name", { ascending: true }),
    supabase
      .from("staff")
      .select(
        "slug, name, role, bio, image_url, credentials, primary_unit_id, staff_services(service_id), staff_units(unit_id)",
      )
      .is("deleted_at", null)
      .order("name", { ascending: true }),
  ]);

  type UnitWithId = { id: string; slug: string; name: string };
  const unitsAll = (unitsRes.data as UnitWithId[] | null) ?? [];
  const unitsById = new Map(unitsAll.map((u) => [u.id, u]));

  const staffRaw = (staffRes.data as unknown as RawStaff[] | null) ?? [];

  const rows: StaffRow[] = staffRaw.map((s) => {
    const primaryUnit = s.primary_unit_id
      ? unitsById.get(s.primary_unit_id)
      : undefined;
    return {
      slug: s.slug,
      name: s.name,
      role: s.role,
      roleLabel: ROLE_LABELS[s.role] ?? s.role,
      bio: s.bio ?? "",
      imageUrl: s.image_url ?? "",
      credentials: s.credentials ?? [],
      primaryUnitSlug: primaryUnit?.slug ?? "",
      primaryUnitName: primaryUnit?.name ?? "",
      serviceCount: s.staff_services?.length ?? 0,
      unitCount: s.staff_units?.length ?? 0,
    };
  });

  const unitOptions = unitsAll.map((u) => ({ slug: u.slug, name: u.name }));

  return (
    <main className="px-8 lg:px-12 py-10 lg:py-14">
      <StaffPageClient rows={rows} units={unitOptions} />
    </main>
  );
}
