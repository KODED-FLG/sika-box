-- B2.10 — Vue soldes_caisses (agrège les mouvements par caisse)
CREATE OR REPLACE VIEW soldes_caisses AS
SELECT
  caisse,
  COALESCE(SUM(montant), 0)::INTEGER AS solde
FROM mouvements_caisse
GROUP BY caisse;

-- B2.28 — Vue transactions_enrichies (champs calculés)
CREATE OR REPLACE VIEW transactions_enrichies
WITH (security_invoker = true) AS
SELECT
  t.*,
  (now() < t.fenetre_expiration) AS fenetre_active,
  om.nom AS operateur_momo_nom
FROM transactions t
LEFT JOIN operateurs_momo om ON om.id = t.operateur_momo_id;
