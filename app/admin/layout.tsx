import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg-primary">
      <header className="border-b border-border bg-bg-secondary">
        <div className="container-app flex items-center justify-between h-14">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="font-display text-lg text-text-primary"
            >
              Life Fit <span className="italic text-pink-primary">Admin</span>
            </Link>
            <nav className="hidden md:flex items-center gap-1 ml-6">
              <Link
                href="/admin"
                className="px-3 py-1.5 text-[14px] text-text-secondary hover:text-text-primary rounded-button hover:bg-bg-tertiary transition-colors"
              >
                Módulos
              </Link>
              <Link
                href="/admin?tab=usuarios"
                className="px-3 py-1.5 text-[14px] text-text-secondary hover:text-text-primary rounded-button hover:bg-bg-tertiary transition-colors"
              >
                Usuárias
              </Link>
            </nav>
          </div>
          <Link
            href="/"
            className="text-[14px] text-text-tertiary hover:text-pink-primary transition-colors"
          >
            Voltar ao site
          </Link>
        </div>
      </header>
      <main className="container-app py-8">{children}</main>
    </div>
  );
}
