import Header from "./Header";
import Footer from "./Footer";
import { ReactNode } from "react";
import { ThemeApplicator } from "@/components/ThemeApplicator";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <ThemeApplicator />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
