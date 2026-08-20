import { prisma } from "../../lib/db";
import { requireAdmin } from "../../lib/auth";
import UserAdminPanel from "./UserAdminPanel";

export const dynamic="force-dynamic";

export default async function AdminUsersPage(){
 const admin=await requireAdmin();
 const users=await prisma.user.findMany({where:{organizationId:admin.organizationId},select:{id:true,fullName:true,email:true,role:true,active:true},orderBy:{createdAt:"asc"}});
 return <><div className="hero"><div><div className="eyebrow">ADMINISTRATION</div><h1>Utilisateurs du cabinet</h1><p className="muted">Gérer les accès de {admin.organization.name}. Les comptes sont strictement rattachés à ce cabinet.</p></div></div><UserAdminPanel users={users} currentUserId={admin.id}/></>;
}
