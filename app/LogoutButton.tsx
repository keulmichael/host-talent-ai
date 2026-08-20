"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogoutButton(){
 const router=useRouter(); const[loading,setLoading]=useState(false);
 async function logout(){setLoading(true);await fetch("/api/auth/logout",{method:"POST"}).catch(()=>undefined);router.push("/login");router.refresh();}
 return <button className="linkButton" onClick={logout} disabled={loading}>{loading?"…":"Déconnexion"}</button>;
}
