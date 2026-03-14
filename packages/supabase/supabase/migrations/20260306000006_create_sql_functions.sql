-- B2.25 — Fonction SQL : tableau_de_bord()
-- Retourne les données du dashboard au format JSON
CREATE OR REPLACE FUNCTION tableau_de_bord()
RETURNS JSON AS $$
DECLARE
  result JSON;
  plafond_val INTEGER;
  solde_remboursement INTEGER;
  freq_rappel INTEGER;
BEGIN
  -- Récupérer le plafond de capital
  SELECT valeur INTO plafond_val FROM variables_globales WHERE cle = 'plafond_capital';

  -- Calculer le solde de la caisse remboursement
  SELECT COALESCE(SUM(montant), 0) INTO solde_remboursement
  FROM mouvements_caisse WHERE caisse = 'REMBOURSEMENT';

  -- Récupérer la fréquence de rappel commission
  SELECT valeur INTO freq_rappel FROM variables_globales
  WHERE cle = 'frequence_rappel_commission_jours';

  SELECT json_build_object(
    'caisses', (
      SELECT json_agg(json_build_object(
        'caisse', sc.caisse,
        'solde', sc.solde,
        'statut', CASE
          WHEN sc.solde <= 0 THEN 'CRITIQUE'
          WHEN sc.solde < 10000 THEN 'ALERTE'
          ELSE 'NORMAL'
        END
      ))
      FROM soldes_caisses sc
      WHERE sc.caisse != 'FONDS_ROULEMENT_MOMO'
    ),
    'fonds_roulement_momo', (
      SELECT json_agg(json_build_object(
        'operateur_id', om.id,
        'operateur_nom', om.nom,
        'solde_courant', om.solde_courant,
        'actif', om.actif
      ))
      FROM operateurs_momo om
    ),
    'progression_remboursement', json_build_object(
      'solde', solde_remboursement,
      'plafond', COALESCE(plafond_val, 500000),
      'pourcentage', CASE
        WHEN COALESCE(plafond_val, 500000) = 0 THEN 100
        ELSE LEAST(ROUND(solde_remboursement::NUMERIC / COALESCE(plafond_val, 500000) * 100), 100)::INTEGER
      END,
      'plafond_atteint', solde_remboursement >= COALESCE(plafond_val, 500000)
    ),
    'total_libre', (
      SELECT COALESCE(SUM(montant), 0) FROM mouvements_caisse WHERE caisse = 'SALAIRE'
    ),
    'rappels_commission_en_attente', (
      SELECT COUNT(*) FROM (
        SELECT om.id
        FROM operateurs_momo om
        WHERE om.actif = true
        AND NOT EXISTS (
          SELECT 1 FROM transactions t
          WHERE t.operateur_momo_id = om.id
          AND t.type = 'COMMISSION_MOMO'
          AND t.cree_le > now() - (COALESCE(freq_rappel, 3) || ' days')::INTERVAL
        )
      ) AS rappels
    )
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- B2.26 — Fonction SQL : verifier_rappel_commission()
-- Retourne un tableau de rappels de commission par opérateur
CREATE OR REPLACE FUNCTION verifier_rappel_commission()
RETURNS JSON AS $$
DECLARE
  freq_rappel INTEGER;
BEGIN
  SELECT valeur INTO freq_rappel FROM variables_globales
  WHERE cle = 'frequence_rappel_commission_jours';

  RETURN (
    SELECT json_agg(json_build_object(
      'operateur_id', om.id,
      'operateur_nom', om.nom,
      'rappel_du', (
        NOT EXISTS (
          SELECT 1 FROM transactions t
          WHERE t.operateur_momo_id = om.id
          AND t.type = 'COMMISSION_MOMO'
          AND t.cree_le > now() - (COALESCE(freq_rappel, 3) || ' days')::INTERVAL
        )
      ),
      'derniere_saisie', (
        SELECT MAX(t.cree_le)
        FROM transactions t
        WHERE t.operateur_momo_id = om.id
        AND t.type = 'COMMISSION_MOMO'
      ),
      'jours_depuis_derniere_saisie', (
        SELECT COALESCE(
          EXTRACT(DAY FROM now() - MAX(t.cree_le)),
          999
        )::INTEGER
        FROM transactions t
        WHERE t.operateur_momo_id = om.id
        AND t.type = 'COMMISSION_MOMO'
      )
    ))
    FROM operateurs_momo om
    WHERE om.actif = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
