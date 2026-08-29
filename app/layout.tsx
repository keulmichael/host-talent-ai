import "./globals.css";
import "./theme.css";
import "./sidebar-fix.css";
import Link from "next/link";
import { getCurrentSession } from "./lib/auth";
import {prisma} from "./lib/db";
import LogoutButton from "./LogoutButton";
import DemoGuide from "./DemoGuide";

export const metadata = { title: "Host Talent AI", description: "Copilote IA pour cabinets de recrutement" };

function NavLink({href,children}:{href:string;children:React.ReactNode}){
  return <Link className="sideLink" href={href}>{children}</Link>;
}

export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await getCurrentSession();
  const user = session?.user;
  const demoMode=Boolean(user?.organizationId?.startsWith("demo-"));
  let demoMissionId:string|null=null;
  let demoCandidateId:string|null=null;
  if(demoMode&&user){
    const [mission,candidate]=await Promise.all([
      prisma.job.findFirst({where:{organizationId:user.organizationId,title:"Responsable CRM & Marketing Automation"},select:{id:true}}),
      prisma.candidate.findFirst({where:{organizationId:user.organizationId,fullName:"Camille Renaud"},select:{id:true}})
    ]);
    demoMissionId=mission?.id||null;demoCandidateId=candidate?.id||null;
  }
  return <html lang="fr"><body>
    {user ? <div className="appFrame">
      <aside className="sidebar">
        <div className="sidebarBrand"><Link className="brand" href="/">HOST TALENT AI</Link><span>L’IA au service de vos recrutements</span></div>
        <nav className="sideNav">
          <NavLink href="/">Tableau de bord</NavLink>
          {demoMode&&<NavLink href="/demo">Parcours démo</NavLink>}
          <div className="navGroup"><div className="navLabel">Recrutement</div><NavLink href="/jobs">Missions</NavLink><NavLink href="/pipeline">Pipeline</NavLink><NavLink href="/actions">Actions</NavLink><NavLink href="/prequalifications">Préqualification</NavLink></div>
          <div className="navGroup"><div className="navLabel">Observatoires</div><NavLink href="/market">Observatoire général</NavLink><NavLink href="/talent">Observatoire Talent</NavLink><NavLink href="/experience">Expérience candidat</NavLink><NavLink href="/audit">Audit candidat</NavLink></div>
          <div className="navGroup"><div className="navLabel">Données</div><NavLink href="/candidates">Vivier candidats</NavLink><NavLink href="/search">Recherche</NavLink><NavLink href="/candidates/new">Importer des CV</NavLink></div>
          {user.role === "ADMIN" && <div className="navGroup"><div className="navLabel">Paramètres</div><NavLink href="/admin/automation">Automatisation</NavLink><NavLink href="/admin/users">Utilisateurs</NavLink><NavLink href="/admin/privacy">Confidentialité</NavLink><NavLink href="/admin/audit">Journal</NavLink></div>}
        </nav>
        <div className="sidebarUser"><Link href="/account"><strong>{user.fullName}</strong><span>{user.organization.name}</span></Link><LogoutButton /></div>
      </aside>
      <main className="mainArea">{demoMode&&<div style={{background:"linear-gradient(90deg,#eef2ff,#f5f3ff)",borderBottom:"1px solid #d8d8ff",padding:"10px 22px",fontSize:14}}><strong>Mode démonstration</strong> · Données 100 % fictives et isolées. <Link href="/demo" style={{fontWeight:700}}>Reprendre le parcours guidé →</Link></div>}<div className="contentShell">{demoMode&&<DemoGuide missionId={demoMissionId} candidateId={demoCandidateId}/>} {children}<footer className="footer">Host Talent AI assiste la revue des candidatures. Les décisions de recrutement restent humaines.</footer></div></main>
    </div> : <div className="shell">{children}</div>}
  </body></html>;
}
