import Link from "next/link";

export default function DemoGuide(){
  return <section className="card sectionCard" style={{marginBottom:18}}>
    <div className="sectionHeader"><div><div className="eyebrow">PARCOURS GUIDÉ · 5 MINUTES</div><h2>Découvrez Host Talent AI en 4 étapes</h2><p className="muted">Le jeu de démonstration est prêt. Suivez ce parcours ou explorez librement l’application.</p></div></div>
    <div className="criteriaGrid">
      <Link className="featureTile" href="/jobs"><strong>1 · Ouvrir une mission</strong><span>Découvrez les critères et les candidats automatiquement rapprochés.</span><em>Voir les missions →</em></Link>
      <Link className="featureTile" href="/pipeline"><strong>2 · Explorer la sélection</strong><span>Observez les profils déjà placés en short-list, contacté ou entretien.</span><em>Voir le pipeline →</em></Link>
      <Link className="featureTile" href="/candidates"><strong>3 · Examiner un profil</strong><span>Consultez le CV structuré, les scores, preuves et points à confirmer.</span><em>Voir le vivier →</em></Link>
      <Link className="featureTile" href="/talent"><strong>4 · Lire l’Observatoire Talent</strong><span>Identifiez tensions, compétences disponibles et potentiel du vivier.</span><em>Ouvrir l’Observatoire →</em></Link>
    </div>
  </section>;
}
