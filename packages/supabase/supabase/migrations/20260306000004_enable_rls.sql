-- B2.11 — Activer RLS sur toutes les tables
ALTER TABLE utilisateurs ENABLE ROW LEVEL SECURITY;
ALTER TABLE variables_globales ENABLE ROW LEVEL SECURITY;
ALTER TABLE operateurs_momo ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mouvements_caisse ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_audit ENABLE ROW LEVEL SECURITY;

-- B2.12 — RLS utilisateurs
-- ADMIN voit tous les utilisateurs, GESTIONNAIRE voit uniquement son propre profil
CREATE POLICY "utilisateurs_select" ON utilisateurs
  FOR SELECT TO authenticated
  USING (
    (auth.jwt() ->> 'role') = 'ADMIN'
    OR id = auth.uid()
  );

-- B2.13 — RLS transactions
-- ADMIN peut tout lire, GESTIONNAIRE seulement ses propres transactions
CREATE POLICY "transactions_select" ON transactions
  FOR SELECT TO authenticated
  USING (
    (auth.jwt() ->> 'role') = 'ADMIN'
    OR cree_par = auth.uid()
  );

-- GESTIONNAIRE peut insérer ses propres transactions
CREATE POLICY "transactions_insert" ON transactions
  FOR INSERT TO authenticated
  WITH CHECK (
    cree_par = auth.uid()
  );

-- Correction uniquement dans la fenêtre de 10 minutes, par le créateur
CREATE POLICY "transactions_update_correction" ON transactions
  FOR UPDATE TO authenticated
  USING (
    (auth.jwt() ->> 'role') = 'GESTIONNAIRE'
    AND cree_par = auth.uid()
    AND now() <= fenetre_expiration
  )
  WITH CHECK (
    (auth.jwt() ->> 'role') = 'GESTIONNAIRE'
    AND cree_par = auth.uid()
    AND now() <= fenetre_expiration
  );

-- Personne ne peut supprimer une transaction (immutabilité)
CREATE POLICY "transactions_no_delete" ON transactions
  FOR DELETE TO authenticated
  USING (false);

-- B2.14 — RLS mouvements_caisse
-- Lecture : via jointure sur transactions.cree_par
CREATE POLICY "mouvements_caisse_select" ON mouvements_caisse
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM transactions t
      WHERE t.id = mouvements_caisse.transaction_id
      AND (
        (auth.jwt() ->> 'role') = 'ADMIN'
        OR t.cree_par = auth.uid()
      )
    )
  );

-- INSERT par service_role uniquement (triggers/fonctions)
CREATE POLICY "mouvements_caisse_insert_service" ON mouvements_caisse
  FOR INSERT TO service_role
  WITH CHECK (true);

-- Pas de DELETE/UPDATE
CREATE POLICY "mouvements_caisse_no_delete" ON mouvements_caisse
  FOR DELETE TO authenticated
  USING (false);

CREATE POLICY "mouvements_caisse_no_update" ON mouvements_caisse
  FOR UPDATE TO authenticated
  USING (false);

-- B2.15 — RLS variables_globales
-- SELECT pour tous les authentifiés
CREATE POLICY "variables_globales_select" ON variables_globales
  FOR SELECT TO authenticated
  USING (true);

-- UPDATE uniquement pour ADMIN
CREATE POLICY "variables_globales_update" ON variables_globales
  FOR UPDATE TO authenticated
  USING ((auth.jwt() ->> 'role') = 'ADMIN')
  WITH CHECK ((auth.jwt() ->> 'role') = 'ADMIN');

-- B2.16 — RLS journal_audit
-- SELECT uniquement pour ADMIN
CREATE POLICY "journal_audit_select" ON journal_audit
  FOR SELECT TO authenticated
  USING ((auth.jwt() ->> 'role') = 'ADMIN');

-- INSERT par service_role (triggers)
CREATE POLICY "journal_audit_insert_service" ON journal_audit
  FOR INSERT TO service_role
  WITH CHECK (true);

-- B2.17 + B2.27 — RLS operateurs_momo
-- SELECT pour tous les authentifiés
CREATE POLICY "operateurs_momo_select" ON operateurs_momo
  FOR SELECT TO authenticated
  USING (true);

-- UPDATE par ADMIN (solde_initial, actif) et par service_role (triggers)
CREATE POLICY "operateurs_momo_update_admin" ON operateurs_momo
  FOR UPDATE TO authenticated
  USING ((auth.jwt() ->> 'role') = 'ADMIN')
  WITH CHECK ((auth.jwt() ->> 'role') = 'ADMIN');

CREATE POLICY "operateurs_momo_update_service" ON operateurs_momo
  FOR UPDATE TO service_role
  USING (true)
  WITH CHECK (true);
