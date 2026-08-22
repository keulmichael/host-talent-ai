-- V2.6 synthetic dataset for Talent Observatory stress-testing.
-- All records are explicitly marked as synthetic test data.

WITH profiles AS (
  SELECT gs,
    CASE (gs % 10)
      WHEN 0 THEN 'CRM, HubSpot, Salesforce, Marketing Automation, SQL, Anglais professionnel'
      WHEN 1 THEN 'Intelligence artificielle générative, OpenAI / LLM, n8n, API REST, Automatisation des processus, Python'
      WHEN 2 THEN 'CRM, Salesforce, Analyse des besoins métiers, Gestion de projet digital, Anglais professionnel'
      WHEN 3 THEN 'Power BI, SQL, Python, Azure, Analyse des besoins métiers, Anglais professionnel'
      WHEN 4 THEN 'SEO, GEO, Google Ads, HubSpot, CRM, Anglais professionnel'
      WHEN 5 THEN 'Next.js, TypeScript, JavaScript, React, Node.js, Docker'
      WHEN 6 THEN 'AWS, Docker, Kubernetes, Node.js, API REST, Anglais professionnel'
      WHEN 7 THEN 'SAP, Gestion de projet digital, Analyse des besoins métiers, Anglais professionnel'
      WHEN 8 THEN 'Figma, Gestion de projet digital, SaaS B2B, CRM, Anglais professionnel'
      ELSE 'CRM, SaaS B2B, HubSpot, Analyse des besoins métiers, Anglais professionnel'
    END AS skills,
    CASE (gs % 8)
      WHEN 0 THEN 'Paris' WHEN 1 THEN 'Lyon' WHEN 2 THEN 'Bordeaux' WHEN 3 THEN 'Lille'
      WHEN 4 THEN 'Nantes' WHEN 5 THEN 'Toulouse' WHEN 6 THEN 'Strasbourg' ELSE 'Rennes'
    END AS location,
    1 + (gs % 14) AS years
  FROM generate_series(1,120) gs
)
INSERT INTO "Candidate" (
  "id","organizationId","fullName","email","location","sourceFileName","rawText","summary","skills","experienceYears","dataSource","privacyNote","retentionUntil","createdAt"
)
SELECT
  'v26-synth-candidate-' || lpad(gs::text,3,'0'),
  'host-demo',
  'Profil Test V2.6 ' || lpad(gs::text,3,'0'),
  'profil.v26.' || lpad(gs::text,3,'0') || '@example.test',
  location,
  'cv-synthetique-v26-' || lpad(gs::text,3,'0') || '.txt',
  'Profil Test V2.6 ' || lpad(gs::text,3,'0') || E'\n' ||
  'Localisation : ' || location || E'\n' ||
  years || ' ans d''expérience professionnelle.' || E'\n' ||
  'Compétences : ' || skills || E'\n' ||
  CASE (gs % 10)
    WHEN 0 THEN 'Responsable CRM et Marketing Automation. Lead nurturing, segmentation, reporting et workflows automatisés.'
    WHEN 1 THEN 'Consultant IA et automatisation. Agents IA, LLM, API REST, n8n et optimisation de processus.'
    WHEN 2 THEN 'Consultant CRM fonctionnel. Recueil des besoins, Salesforce et conduite de projet digital.'
    WHEN 3 THEN 'Data analyst / BI. SQL, Power BI, Python, Azure et reporting décisionnel.'
    WHEN 4 THEN 'Consultant acquisition digitale. SEO, GEO, Google Ads, HubSpot et stratégie de contenu.'
    WHEN 5 THEN 'Développeur web full-stack. Next.js, TypeScript, React, Node.js et Docker.'
    WHEN 6 THEN 'Ingénieur cloud / DevOps. AWS, Docker, Kubernetes, API et automatisation.'
    WHEN 7 THEN 'Chef de projet ERP. SAP, cadrage métier, conduite du changement et pilotage.'
    WHEN 8 THEN 'Product / UX project manager. Figma, SaaS B2B, CRM et gestion de projet digital.'
    ELSE 'Customer Success / RevOps. CRM, HubSpot, SaaS B2B, analyse des besoins et anglais professionnel.'
  END,
  CASE (gs % 10)
    WHEN 0 THEN 'Profil CRM / Marketing Automation'
    WHEN 1 THEN 'Profil IA / Automatisation'
    WHEN 2 THEN 'Profil CRM fonctionnel'
    WHEN 3 THEN 'Profil Data / BI'
    WHEN 4 THEN 'Profil Acquisition / SEO-GEO'
    WHEN 5 THEN 'Profil Développement Web'
    WHEN 6 THEN 'Profil Cloud / DevOps'
    WHEN 7 THEN 'Profil ERP / Projet'
    WHEN 8 THEN 'Profil Product / UX'
    ELSE 'Profil Customer Success / RevOps'
  END,
  skills,
  years,
  'SYNTHETIC_V26',
  'Donnée fictive générée uniquement pour les tests fonctionnels et statistiques de Host Talent AI V2.6.',
  CURRENT_TIMESTAMP + INTERVAL '24 months',
  CURRENT_TIMESTAMP - ((gs % 90) || ' days')::interval
FROM profiles
ON CONFLICT ("id") DO NOTHING;

WITH job_defs AS (
  SELECT * FROM (VALUES
    (1,'[DEMO V2.6] Responsable CRM & Marketing Automation','Demo Retail','Paris','CRM; Marketing Automation; HubSpot; Salesforce; 5 ans d''expérience minimum','SQL; API REST; Anglais professionnel','n8n; Power BI'),
    (2,'[DEMO V2.6] Consultant IA Générative & Automatisation','Demo Industrie','Paris','Intelligence artificielle générative; OpenAI / LLM; Automatisation des processus; API REST','n8n; Python; Analyse des besoins métiers','Azure; Docker'),
    (3,'[DEMO V2.6] Consultant Salesforce CRM','Demo Conseil','Lyon','Salesforce; CRM; Analyse des besoins métiers; 4 ans d''expérience minimum','Gestion de projet digital; Anglais professionnel','HubSpot'),
    (4,'[DEMO V2.6] Data Analyst Power BI','Demo Finance','Paris','Power BI; SQL; Analyse des besoins métiers','Python; Azure; Anglais professionnel','AWS'),
    (5,'[DEMO V2.6] Consultant SEO / GEO Senior','Demo Media','Paris','SEO; GEO; 5 ans d''expérience minimum','Google Ads; HubSpot; Anglais professionnel','CRM'),
    (6,'[DEMO V2.6] Développeur Next.js / TypeScript','Demo SaaS','Nantes','Next.js; TypeScript; JavaScript; React','Node.js; API REST; Docker','AWS'),
    (7,'[DEMO V2.6] Ingénieur DevOps Cloud','Demo Tech','Toulouse','AWS; Docker; Kubernetes','Azure; API REST; Anglais professionnel','Node.js'),
    (8,'[DEMO V2.6] Chef de projet SAP','Demo Industrie','Strasbourg','SAP; Gestion de projet digital; Analyse des besoins métiers','Anglais professionnel; 5 ans d''expérience minimum','Power BI'),
    (9,'[DEMO V2.6] Product Manager SaaS B2B','Demo SaaS','Bordeaux','SaaS B2B; Gestion de projet digital; Analyse des besoins métiers','Figma; CRM; Anglais professionnel','SQL'),
    (10,'[DEMO V2.6] Customer Success Manager','Demo SaaS','Paris','CRM; SaaS B2B; Analyse des besoins métiers','HubSpot; Anglais professionnel','Salesforce'),
    (11,'[DEMO V2.6] RevOps Manager','Demo Scale-up','Paris','CRM; HubSpot; Salesforce; Automatisation des processus','SQL; SaaS B2B; Anglais professionnel','n8n'),
    (12,'[DEMO V2.6] Consultant Automatisation n8n','Demo Services','Lille','n8n; Automatisation des processus; API REST','OpenAI / LLM; Analyse des besoins métiers','Python'),
    (13,'[DEMO V2.6] Consultant IA métier','Demo RH','Paris','Intelligence artificielle générative; Analyse des besoins métiers; Assistants / Agents IA','OpenAI / LLM; Gestion de projet digital','n8n'),
    (14,'[DEMO V2.6] Marketing Operations Manager','Demo E-commerce','Lyon','Marketing Automation; CRM; HubSpot','SQL; Google Ads; Anglais professionnel','Salesforce'),
    (15,'[DEMO V2.6] CRM Data Manager','Demo Retail','Paris','CRM; SQL; Salesforce','Power BI; Analyse des besoins métiers','HubSpot'),
    (16,'[DEMO V2.6] Consultant Acquisition Digitale','Demo Agence','Bordeaux','SEO; Google Ads; CRM','GEO; HubSpot; Anglais professionnel','Power BI'),
    (17,'[DEMO V2.6] Lead Developer React / Node.js','Demo Tech','Paris','React; JavaScript; Node.js; API REST','TypeScript; Docker; Anglais professionnel','AWS'),
    (18,'[DEMO V2.6] Cloud Engineer Azure','Demo Industrie','Lille','Azure; Docker; Kubernetes','API REST; Anglais professionnel','AWS'),
    (19,'[DEMO V2.6] Business Analyst Digital','Demo Banque','Paris','Analyse des besoins métiers; Gestion de projet digital','CRM; SQL; Anglais professionnel','Power BI'),
    (20,'[DEMO V2.6] Consultant Transformation Digitale','Demo Conseil','Paris','Gestion de projet digital; Analyse des besoins métiers; Automatisation des processus','CRM; Anglais professionnel','OpenAI / LLM'),
    (21,'[DEMO V2.6] Product Designer SaaS','Demo Startup','Nantes','Figma; SaaS B2B','Gestion de projet digital; Anglais professionnel','CRM'),
    (22,'[DEMO V2.6] CRM Project Manager','Demo Assurance','Paris','CRM; Gestion de projet digital; Salesforce','Analyse des besoins métiers; Anglais professionnel','HubSpot'),
    (23,'[DEMO V2.6] Consultant BI Senior','Demo Conseil','Lyon','Power BI; SQL; 5 ans d''expérience minimum','Python; Azure; Anglais professionnel','SAP'),
    (24,'[DEMO V2.6] AI Product Manager','Demo Tech','Paris','Intelligence artificielle générative; Gestion de projet digital; SaaS B2B','OpenAI / LLM; Analyse des besoins métiers; Anglais professionnel','Figma; n8n')
  ) AS t(n,title,client,location,must_have,should_have,optional)
)
INSERT INTO "Job" ("id","organizationId","title","clientName","location","description","mustHave","shouldHave","optional","createdAt")
SELECT
 'v26-synth-job-' || lpad(n::text,2,'0'),
 'host-demo',title,client,location,
 'Mission synthétique V2.6 créée pour tester le matching, les tendances du vivier et les écarts offre/demande. Ne correspond à aucune entreprise réelle.',
 must_have,should_have,optional,
 CURRENT_TIMESTAMP - ((n % 30) || ' days')::interval
FROM job_defs
ON CONFLICT ("id") DO NOTHING;
