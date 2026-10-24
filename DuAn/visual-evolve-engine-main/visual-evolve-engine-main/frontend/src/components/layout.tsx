import type { ReactNode } from "react";
import { useLocation } from "@tanstack/react-router";
import { AnnouncementBar, SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";

export function Layout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const isAdminPage = pathname.startsWith("/admin");

  return (
    <div className="min-h-dvh bg-surface text-ink font-sans flex flex-col">
      {!isAdminPage && (
        <>
          <AnnouncementBar />
          <SiteHeader />
        </>
      )}
      <main className="flex-1">{children}</main>
      {!isAdminPage && <SiteFooter />}
    </div>
  );
}
