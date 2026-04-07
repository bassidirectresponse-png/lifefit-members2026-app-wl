import { Header } from "@/components/member/header";
import { MobileNav } from "@/components/member/mobile-nav";
import { LenisProvider } from "@/components/member/lenis-provider";

export default function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LenisProvider>
      <Header />
      <main className="min-h-screen pt-16 md:pt-[72px] pb-20 md:pb-0">
        {children}
      </main>
      <MobileNav />
    </LenisProvider>
  );
}
