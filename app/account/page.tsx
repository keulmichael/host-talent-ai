import { requireUser } from "../lib/auth";
import PasswordForm from "./PasswordForm";

export const dynamic="force-dynamic";

export default async function AccountPage(){
 const user=await requireUser();
 return <div className="grid adminGrid"><div className="card"><div className="eyebrow">MON COMPTE</div><h1>{user.fullName}</h1><p className="muted">{user.email}</p><p><strong>Cabinet :</strong> {user.organization.name}</p><p><strong>Rôle :</strong> {user.role==="ADMIN"?"Administrateur":"Recruteur"}</p></div><div className="card"><h2>Sécurité</h2><PasswordForm/></div></div>;
}
