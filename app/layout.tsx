import "./globals.css";
import Link from "next/link";

export const metadata = { title: "Host Talent AI", description: "Copilote IA pour cabinets de recrutement" };

export default function Layout({ children }: { children: React.ReactNode }) {
  return <html lang="fr"><body><div className="shell"><nav className="nav">
    <Link className="brand" href="/">HOST TALENT AI</Link>
    <Link href="/">Dashboard</Link>
    <Link href="/jobs">Missions</Link>
    <Link href="/pipeline">Pipeline</Link>
    <Link href="/search">Recherche</Link>
    <Link href="/candidates">Vivier</Link>
    <Link href="/jobs/new">Nouvelle mission</Link>
    <Link href="/candidates/new">Importer CV</Link>
  </nav>{children}<footer className="footer">Host Talent AI assiste la revue des candidatures. Les décisions de recrutement restent humaines.</footer></div></body></html>;
}
