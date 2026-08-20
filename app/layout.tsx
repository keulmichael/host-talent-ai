import "./globals.css";
import Link from "next/link";

export const metadata = { title: "Host Talent AI", description: "Copilote IA pour cabinets de recrutement" };

export default function Layout({ children }: { children: React.ReactNode }) {
  return <html lang="fr"><body><div className="shell"><nav className="nav"><Link className="brand" href="/">HOST TALENT AI</Link><Link href="/">Dashboard</Link><Link href="/jobs">Missions</Link><Link href="/jobs/new">Nouvelle mission</Link><Link href="/candidates">Vivier</Link><Link href="/candidates/new">Importer CV</Link></nav>{children}</div></body></html>;
}
