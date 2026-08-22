import "./globals.css";
import Link from "next/link";
import { getCurrentSession } from "./lib/auth";
import LogoutButton from "./LogoutButton";

export const metadata = { title: "Host Talent AI", description: "Copilote IA pour cabinets de recrutement" };

function NavLink({href,children}:{href:string;children:React.ReactNode}){
  return <Link className="sideLink" href={href}>{children}</Link>;
}

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await getCurrentSession();
  const user = session?.user;
  return <html lang="fr"><body>
    {user ? <div className="appFrame">
      <aside className="sidebar">
        <div className="sidebarBrand"><Link className="brand" href="/">HOST TALENT AI</Link><span>V2.6 · Intelligence du vivier</span></div>
        <nav className="sideNav">
          <NavLink href="/">Tableau de bord</NavLink>
          <div className="navGroup"><div className="navLabel">Recrutement</div><NavLink href="/jobs">Missions</NavLink><NavLink href="/pipeline">Pipeline</NavLink><NavLink href="/actions">Actions</NavLink></div>
          <div className="navGroup"><div className="navLabel">Intelligence</div><NavLink href="/talent">Tendances vivier</NavLink><NavLink href="/audit">Audit candidat</NavLink><NavLink href="/experience">Expérience candidat</NavLink></div>
          <div className="navGroup"><div className="navLabel">Données</div><NavLink href="/candidates">Vivier candidats</NavLink><NavLink href="/search">Recherche</NavLink><NavLink href="/candidates/new">Importer des CV</NavLink></div>
          {user.role === "ADMIN" && <div className="navGroup"><div className="navLabel">Paramètres</div><NavLink href="/admin/automation">Automatisation</NavLink><NavLink href="/admin/users">Utilisateurs</NavLink><NavLink href="/admin/privacy">Confidentialité</NavLink><NavLink href="/admin/audit">Journal</NavLink></div>}
        </nav>
        <div className="sidebarUser"><Link href="/account"><strong>{user.fullName}</strong><span>{user.organization.name}</span></Link><LogoutButton /></div>
      </aside>
      <main className="mainArea"><div className="contentShell">{children}<footer className="footer">Host Talent AI assiste la revue des candidatures. Les décisions de recrutement restent humaines.</footer></div></main>
    </div> : <div className="shell">{children}</div>}
  </body></html>;
}
