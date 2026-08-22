import "./globals.css";
import Link from "next/link";
import { getCurrentSession } from "./lib/auth";
import LogoutButton from "./LogoutButton";

export const metadata = { title: "Host Talent AI", description: "Copilote IA pour cabinets de recrutement" };

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await getCurrentSession();
  const user = session?.user;
  return <html lang="fr"><body><div className="shell"><nav className="nav">
    <Link className="brand" href="/">HOST TALENT AI</Link>
    {user && <>
      <Link href="/">Dashboard</Link>
      <Link href="/jobs">Missions</Link>
      <Link href="/pipeline">Pipeline</Link>
      <Link href="/actions">Actions</Link>
      <Link href="/experience">Expérience candidat</Link>
      <Link href="/search">Recherche</Link>
      <Link href="/candidates">Vivier</Link>
      <Link href="/jobs/new">Nouvelle mission</Link>
      <Link href="/candidates/new">Importer CV</Link>
      {user.role === "ADMIN" && <Link href="/admin/automation">Automatisation</Link>}
      {user.role === "ADMIN" && <Link href="/admin/users">Utilisateurs</Link>}
      {user.role === "ADMIN" && <Link href="/admin/privacy">Confidentialité</Link>}
      {user.role === "ADMIN" && <Link href="/admin/audit">Journal</Link>}
      <Link href="/account" className="userBadge">{user.fullName} · {user.organization.name}</Link>
      <LogoutButton />
    </>}
  </nav>{children}<footer className="footer">Host Talent AI assiste la revue des candidatures. Les décisions de recrutement restent humaines.</footer></div></body></html>;
}
