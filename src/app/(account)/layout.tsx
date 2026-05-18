import { Header } from "@/components/marketing/header";
import { Footer } from "@/components/marketing/footer";
import { FloatingCTA } from "@/components/marketing/floating-cta";
import { PageTransition } from "@/components/ui/page-transition";

export default function AccountLayout({
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
      <FloatingCTA />
    </>
  );
}
