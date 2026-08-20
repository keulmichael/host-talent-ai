import { prisma } from "../../../lib/db";
import { stageLabel } from "../../../lib/pipeline";
import { apiUser, audit } from "../../../lib/auth";

function cell(value: unknown) {
  const s = String(value ?? "").replace(/"/g, '""');
  return `"${s}"`;
}

export async function GET() {
  const user = await apiUser();
  if (!user) return new Response("Authentification requise", { status: 401 });
  const candidates = await prisma.candidate.findMany({
    where: { organizationId: user.organizationId },
    include: { matches: { where: { organizationId:user.organizationId }, include: { job:true }, orderBy: { score:"desc" } } },
    orderBy: { createdAt:"desc" }
  });
  const rows = [["Candidat","Email","Localisation","Experience","Competences","Origine","Conservation jusqu'au","CV original prive","Meilleure mission","Score","Etape","Prochaine action"]];
  for (const c of candidates) {
    const best = c.matches[0];
    rows.push([
      c.fullName, c.email || "", c.location || "", c.experienceYears ? String(c.experienceYears) : "", c.skills,
      c.dataSource, c.retentionUntil ? c.retentionUntil.toISOString().slice(0,10) : "", c.filePathname ? "OUI" : "NON",
      best?.job.title || "", best ? String(best.score) : "", best ? stageLabel(best.stage) : "", best?.nextAction || ""
    ]);
  }
  await audit({ organizationId:user.organizationId, userId:user.id, action:"CANDIDATES_EXPORTED", details:`${candidates.length} candidats` }).catch(()=>undefined);
  const csv = "\uFEFF" + rows.map((r) => r.map(cell).join(";")).join("\r\n");
  return new Response(csv, { headers: { "Content-Type":"text/csv; charset=utf-8", "Content-Disposition":"attachment; filename=host-talent-vivier.csv", "Cache-Control":"private, no-store" } });
}
