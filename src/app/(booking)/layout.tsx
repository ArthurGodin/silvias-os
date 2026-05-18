import { Header } from "@/components/marketing/header";
import { Footer } from "@/components/marketing/footer";
import { PageTransition } from "@/components/ui/page-transition";

export default function BookingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main id="main" className="min-h-screen">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
    </>
  );
}
