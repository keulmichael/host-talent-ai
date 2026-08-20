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
      <Link href="/search">Recherche</Link>
      <Link href="/candidates">Vivier</Link>
      <Link href="/jobs/new">Nouvelle mission</Link>
      <Link href="/candidates/new">Importer CV</Link>
      {user.role === "ADMIN" && <Link href="/admin/users">Utilisateurs</Link>}
      <span className="userBadge">{user.fullName} · {user.organization.name}</span>
      <LogoutButton />
    </>}
  </nav>{children}<footer className="footer">Host Talent AI assiste la revue des candidatures. Les décisions de recrutement restent humaines.</footer></div></body></html>;
}
