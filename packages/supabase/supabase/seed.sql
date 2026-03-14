-- seed.sql — Données initiales de la base Sika Box
-- B2.4, B2.6, B2.24

-- ============================================================
-- B2.4 — Variables globales (valeurs par défaut)
-- ============================================================
INSERT INTO variables_globales (cle, valeur) VALUES
  ('plafond_capital', 500000),
  ('ratio_salaire', 50),
  ('ratio_remboursement', 30),
  ('ratio_reserve', 20),
  ('ratio_post_plafond_salaire', 70),
  ('ratio_post_plafond_reserve', 30),
  ('frequence_rappel_commission_jours', 3),
  ('verrouillage_inactivite_minutes', 5)
ON CONFLICT (cle) DO NOTHING;

-- ============================================================
-- B2.6 — Opérateurs MoMo
-- ============================================================
INSERT INTO operateurs_momo (nom, solde_courant, actif) VALUES
  ('MTN Mobile Money', 0, true),
  ('Moov Money', 0, true),
  ('Celtis Cash', 0, true)
ON CONFLICT DO NOTHING;

-- ============================================================
-- B2.24 — Utilisateur administrateur par défaut
-- NOTE : En production, l'utilisateur doit être inscrit via GoTrue
--        (supabase auth signup / dashboard / Edge Function).
--        Ce seed crée uniquement l'entrée dans la table publique
--        utilisateurs avec un UUID placeholder.
--        Étape manuelle : créer l'utilisateur dans Supabase Dashboard
--        → Authentication, puis mettre à jour l'UUID ci-dessous.
-- ============================================================
-- L'insertion utilise un UUID fixe pour le développement local.
-- Lors du `supabase db reset`, un utilisateur GoTrue correspondant
-- devrait être créé via le hook supabase/seed.sql ou manuellement.
INSERT INTO utilisateurs (id, identifiant, role, actif) VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin', 'ADMIN', true)
ON CONFLICT (id) DO NOTHING;
