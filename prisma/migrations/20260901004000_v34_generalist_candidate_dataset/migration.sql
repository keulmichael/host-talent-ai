-- V3.4 generalist synthetic CV dataset.
-- Purpose: exercise Host Talent AI across multiple recruitment specialties without changing external study data.
-- All records are fictitious, isolated in the host-demo organization and explicitly marked SYNTHETIC_V34.

WITH cv_defs AS (
  SELECT * FROM (VALUES
    (1,'Camille Durand','Paris',8,'Comptabilité, clôture mensuelle, bilan, liasse fiscale, Excel, Sage','Responsable comptable','Responsable comptable avec 8 ans d''expérience. Supervision de la comptabilité générale, clôtures mensuelles, bilan, liasse fiscale, management de 4 comptables, Excel avancé et Sage.'),
    (2,'Julien Perrin','Lyon',5,'Comptabilité fournisseurs, rapprochements bancaires, SAP, Excel, facturation','Comptable fournisseurs','Comptable fournisseurs avec 5 ans d''expérience. Traitement des factures, rapprochements bancaires, suivi des échéances, SAP et Excel.'),
    (3,'Nadia Benali','Paris',7,'Contrôle de gestion, budget, forecast, Power BI, Excel, SAP','Contrôleuse de gestion','Contrôleuse de gestion avec 7 ans d''expérience. Construction budgétaire, forecast, analyse des écarts, reporting de direction, Power BI, Excel et SAP.'),

    (4,'Thomas Morel','Paris',9,'Recrutement, talent acquisition, sourcing, entretiens, ATS, management','Responsable recrutement','Responsable recrutement avec 9 ans d''expérience. Pilotage d''une équipe de recruteurs, sourcing, entretiens, relations managers, suivi des KPI et administration ATS.'),
    (5,'Sarah Cohen','Lille',4,'Ressources humaines, paie, administration du personnel, droit social, SIRH','Chargée RH','Chargée RH généraliste avec 4 ans d''expérience. Administration du personnel, préparation de paie, contrats, suivi disciplinaire, droit social et SIRH.'),
    (6,'Lucas Garnier','Nantes',6,'Formation, développement RH, GPEC, compétences, accompagnement, conduite du changement','Responsable développement RH','Responsable développement RH avec 6 ans d''expérience. Plans de formation, GPEC, cartographie des compétences, mobilité interne et conduite du changement.'),

    (7,'Élodie Martin','Paris',7,'Business development, prospection B2B, négociation, CRM, Salesforce, grands comptes','Business Developer','Business Developer B2B avec 7 ans d''expérience. Prospection, ouverture de comptes, négociation, gestion du pipe commercial, Salesforce et contrats grands comptes.'),
    (8,'Mehdi Laurent','Bordeaux',5,'Vente, account management, fidélisation, upsell, CRM, SaaS B2B','Account Manager','Account Manager avec 5 ans d''expérience. Gestion d''un portefeuille B2B, renouvellement, upsell, négociation, CRM et environnement SaaS.'),
    (9,'Amandine Robert','Lyon',10,'Direction commerciale, management, stratégie commerciale, grands comptes, forecast, CRM','Directrice commerciale','Directrice commerciale avec 10 ans d''expérience. Management de 12 commerciaux, stratégie de conquête, grands comptes, forecast et pilotage CRM.'),

    (10,'Sophie Lambert','Paris',6,'Marketing, communication, campagnes multicanales, CRM, contenu, événements','Responsable marketing','Responsable marketing avec 6 ans d''expérience. Stratégie marketing, campagnes multicanales, CRM, contenus, événements et pilotage agences.'),
    (11,'Hugo Bernard','Nantes',4,'Communication, relations presse, réseaux sociaux, rédaction, événementiel','Chargé de communication','Chargé de communication avec 4 ans d''expérience. Relations presse, communication corporate, réseaux sociaux, rédaction éditoriale et événementiel.'),
    (12,'Inès Fontaine','Paris',5,'E-commerce, acquisition, Google Ads, SEO, analytics, CRM, conversion','E-commerce Manager','E-commerce Manager avec 5 ans d''expérience. Acquisition payante, SEO, analytics, optimisation conversion, CRM et pilotage catalogue.'),

    (13,'Arthur Petit','Paris',8,'Droit social, contrats de travail, contentieux, relations sociales, CSE','Juriste droit social','Juriste droit social avec 8 ans d''expérience. Conseil RH, contrats de travail, procédures disciplinaires, contentieux prud''homal, relations sociales et CSE.'),
    (14,'Claire Lefèvre','Lyon',6,'Droit des affaires, contrats commerciaux, conformité, RGPD, négociation','Juriste contrats','Juriste contrats avec 6 ans d''expérience. Rédaction et négociation de contrats commerciaux, conformité, RGPD et support aux équipes opérationnelles.'),
    (15,'Romain Girard','Paris',9,'Compliance, KYC, AML, contrôle interne, risques, réglementation bancaire','Compliance Officer','Compliance Officer avec 9 ans d''expérience. KYC, AML, contrôle interne, cartographie des risques et réglementation bancaire.'),

    (16,'Manon Rousseau','Toulouse',7,'Achats, appels d''offres, négociation fournisseurs, sourcing, contrats, savings','Acheteuse','Acheteuse avec 7 ans d''expérience. Sourcing fournisseurs, appels d''offres, négociation, contractualisation, suivi qualité et plans de savings.'),
    (17,'Yassine Mercier','Lille',8,'Supply chain, S&OP, prévisions, stocks, SAP, Excel, management','Supply Chain Manager','Supply Chain Manager avec 8 ans d''expérience. S&OP, prévisions de vente, stocks, approvisionnements, SAP et management d''équipe.'),
    (18,'Chloé Faure','Lyon',5,'Logistique, transport, entrepôt, WMS, KPI, amélioration continue','Responsable logistique','Responsable logistique avec 5 ans d''expérience. Gestion d''entrepôt, transport, WMS, indicateurs de performance et amélioration continue.'),

    (19,'Alexandre Roux','Strasbourg',9,'Maintenance industrielle, GMAO, mécanique, électrotechnique, sécurité, management','Responsable maintenance','Responsable maintenance industrielle avec 9 ans d''expérience. Management de techniciens, maintenance préventive et curative, GMAO, électrotechnique et sécurité.'),
    (20,'Pauline Chevalier','Lyon',6,'Production industrielle, lean manufacturing, qualité, sécurité, management, KPI','Responsable production','Responsable production avec 6 ans d''expérience. Management d''atelier, lean manufacturing, qualité, sécurité, productivité et pilotage KPI.'),
    (21,'Kévin Marchand','Toulouse',4,'Méthodes, industrialisation, CAO, amélioration continue, process, qualité','Ingénieur méthodes','Ingénieur méthodes avec 4 ans d''expérience. Industrialisation, optimisation process, CAO, amélioration continue et résolution de problèmes qualité.'),

    (22,'Marine Lopez','Paris',10,'BTP, conduite de travaux, planning, budget, sous-traitants, sécurité','Conductrice de travaux','Conductrice de travaux BTP avec 10 ans d''expérience. Pilotage de chantiers, planning, budget, coordination sous-traitants, réception et sécurité.'),
    (23,'Nicolas Henry','Lille',7,'Chef de chantier, gros œuvre, équipes terrain, sécurité, planning, qualité','Chef de chantier','Chef de chantier gros œuvre avec 7 ans d''expérience. Encadrement des équipes terrain, planning, sécurité, contrôle qualité et coordination entreprises.'),
    (24,'Laura Vidal','Bordeaux',5,'Immobilier, gestion locative, copropriété, relation clients, juridique immobilier','Gestionnaire immobilier','Gestionnaire immobilier avec 5 ans d''expérience. Gestion locative, copropriété, relation propriétaires et locataires, suivi technique et juridique immobilier.'),

    (25,'Julie Picard','Lyon',8,'Infirmière, soins, coordination, patient, dossier médical, équipe pluridisciplinaire','Infirmière coordinatrice','Infirmière coordinatrice avec 8 ans d''expérience. Coordination des soins, suivi patient, dossier médical, planning et animation d''équipe pluridisciplinaire.'),
    (26,'Karim Dupont','Strasbourg',6,'Aide-soignant, soins, EHPAD, personnes âgées, accompagnement, hygiène','Aide-soignant','Aide-soignant avec 6 ans d''expérience en EHPAD. Soins d''hygiène et de confort, accompagnement des personnes âgées et travail en équipe soignante.'),
    (27,'Céline Masson','Paris',7,'Médico-social, direction établissement, budget, qualité, RH, accompagnement','Directrice établissement médico-social','Directrice d''établissement médico-social avec 7 ans d''expérience. Gestion budgétaire, RH, qualité, relations familles et pilotage de projets d''accompagnement.'),

    (28,'Maxime Aubert','Paris',8,'Hôtellerie, réception, revenue management, management, expérience client, anglais','Directeur adjoint hôtel','Directeur adjoint d''hôtel avec 8 ans d''expérience. Supervision réception, expérience client, revenue management, planning, management et anglais courant.'),
    (29,'Anaïs Blanchard','Nice',5,'Restauration, service, management équipe, planning, hygiène HACCP, relation client','Responsable de salle','Responsable de salle avec 5 ans d''expérience. Management des équipes, planning, service, relation client, gestion des réservations et HACCP.'),
    (30,'Victor Leclerc','Paris',6,'Tourisme, voyages, partenariats, ventes, relation client, anglais','Chef de produit tourisme','Chef de produit tourisme avec 6 ans d''expérience. Conception d''offres, négociation partenaires, analyse ventes, relation client et anglais professionnel.'),

    (31,'Léa Moulin','Paris',7,'Retail, management magasin, merchandising, stocks, KPI, vente','Responsable magasin','Responsable de magasin avec 7 ans d''expérience. Management de 15 collaborateurs, merchandising, stocks, objectifs commerciaux et pilotage KPI.'),
    (32,'Baptiste Renard','Lyon',4,'Service client, centre de contacts, CRM, réclamations, qualité, KPI','Superviseur service client','Superviseur service client avec 4 ans d''expérience. Management de conseillers, CRM, traitement des réclamations, qualité et suivi KPI.'),
    (33,'Mélanie Roy','Nantes',5,'ADV, commandes, facturation, relation client, ERP, Excel','Responsable ADV','Responsable administration des ventes avec 5 ans d''expérience. Commandes, facturation, litiges, relation clients, ERP et Excel.'),

    (34,'Quentin Lemaire','Paris',6,'Banque, crédit, analyse financière, risques, relation entreprises, conformité','Chargé d’affaires entreprises','Chargé d''affaires entreprises avec 6 ans d''expérience en banque. Analyse financière, crédit, risques, développement portefeuille et conformité.'),
    (35,'Fatima Diallo','Lyon',5,'Assurance, souscription, risques, contrats, courtage, relation clients','Souscriptrice assurance','Souscriptrice assurance avec 5 ans d''expérience. Analyse des risques, tarification, contrats, relations courtiers et suivi portefeuille.'),
    (36,'Jérôme Colin','Paris',9,'Audit, contrôle interne, finance, risques, IFRS, management','Manager audit','Manager audit avec 9 ans d''expérience. Missions d''audit financier, contrôle interne, IFRS, risques et management d''équipes.'),

    (37,'Noémie Gauthier','Paris',5,'Office management, administration, fournisseurs, événements, budget, anglais','Office Manager','Office Manager avec 5 ans d''expérience. Administration générale, fournisseurs, organisation d''événements, suivi budget et anglais professionnel.'),
    (38,'Adrien Dumas','Bordeaux',6,'Gestion de projet, PMO, planning, budget, risques, reporting, coordination','PMO','PMO avec 6 ans d''expérience. Gouvernance projet, planning, budget, risques, reporting et coordination de parties prenantes.'),
    (39,'Eva Caron','Lille',4,'Qualité, ISO 9001, audit qualité, procédures, amélioration continue, KPI','Responsable qualité','Responsable qualité avec 4 ans d''expérience. ISO 9001, audits, procédures, non-conformités, amélioration continue et KPI.'),

    (40,'Antoine Meyer','Lyon',7,'QHSE, sécurité, environnement, ISO 14001, prévention, audit','Responsable QHSE','Responsable QHSE avec 7 ans d''expérience. Prévention sécurité, environnement, ISO 14001, audits terrain et plans d''actions.'),
    (41,'Caroline André','Paris',6,'Immobilier commercial, asset management, baux, valorisation, finance, reporting','Asset Manager immobilier','Asset Manager immobilier avec 6 ans d''expérience. Gestion d''actifs, baux commerciaux, valorisation, business plans et reporting investisseurs.'),
    (42,'Samuel Arnaud','Toulouse',5,'Énergie, photovoltaïque, gestion de projet, chantier, fournisseurs, réglementation','Chef de projet énergie','Chef de projet énergie renouvelable avec 5 ans d''expérience. Projets photovoltaïques, coordination chantier, fournisseurs, budget et réglementation.'),

    (43,'Maëlle Barbier','Paris',5,'Product management, SaaS B2B, roadmap, discovery, analytics, anglais','Product Manager','Product Manager SaaS B2B avec 5 ans d''expérience. Discovery, roadmap, priorisation, analytics, coordination design et tech, anglais professionnel.'),
    (44,'Olivier Tessier','Nantes',8,'Développement web, JavaScript, TypeScript, React, Node.js, API REST','Lead Developer','Lead Developer avec 8 ans d''expérience. JavaScript, TypeScript, React, Node.js, API REST, revue de code et mentorat.'),
    (45,'Maya Boucher','Paris',6,'Data, SQL, Power BI, Python, reporting, analyse de données','Data Analyst','Data Analyst avec 6 ans d''expérience. SQL, Power BI, Python, modélisation, tableaux de bord et analyse de données métier.'),

    (46,'Rayan Philippe','Paris',4,'Cybersécurité, SOC, SIEM, incidents, ISO 27001, risques','Analyste cybersécurité','Analyste cybersécurité avec 4 ans d''expérience. SOC, SIEM, gestion d''incidents, analyse de risques et ISO 27001.'),
    (47,'Océane Lacroix','Lyon',5,'Paie, DSN, droit social, SIRH, administration du personnel, Excel','Gestionnaire paie','Gestionnaire paie avec 5 ans d''expérience. Production de paie, DSN, administration du personnel, droit social, SIRH et Excel.'),
    (48,'Damien Rey','Paris',7,'Conseil, transformation, stratégie, gestion de projet, conduite du changement, process','Consultant transformation','Consultant transformation avec 7 ans d''expérience. Cadrage stratégique, optimisation de processus, gestion de projet, conduite du changement et animation d''ateliers.')
  ) AS t(n,full_name,location,years,skills,role,profile_text)
)
INSERT INTO "Candidate" (
  "id","organizationId","fullName","email","location","sourceFileName","rawText","summary","skills","experienceYears","dataSource","privacyNote","retentionUntil","createdAt"
)
SELECT
  'v34-generalist-candidate-' || lpad(n::text,3,'0'),
  'host-demo',
  full_name,
  'profil.v34.' || lpad(n::text,3,'0') || '@example.test',
  location,
  'cv-generaliste-v34-' || lpad(n::text,3,'0') || '.txt',
  full_name || E'\n' ||
  role || E'\n' ||
  'Localisation : ' || location || E'\n' ||
  years || ' ans d''expérience professionnelle.' || E'\n' ||
  'Compétences : ' || skills || E'\n' ||
  profile_text,
  role || ' · profil synthétique généraliste V3.4',
  skills,
  years,
  'SYNTHETIC_V34',
  'Donnée fictive générée uniquement pour tester le fonctionnement généraliste de Host Talent AI. Aucun individu réel.',
  CURRENT_TIMESTAMP + INTERVAL '24 months',
  CURRENT_TIMESTAMP - ((n % 45) || ' days')::interval
FROM cv_defs
ON CONFLICT ("id") DO NOTHING;
