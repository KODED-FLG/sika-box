-- B2.18 — Trigger : calculer fenêtre d'expiration (10 minutes après création)
CREATE OR REPLACE FUNCTION calculer_fenetre_expiration()
RETURNS TRIGGER AS $$
BEGIN
  NEW.fenetre_expiration := NEW.cree_le + interval '10 minutes';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_calculer_fenetre_expiration
  BEFORE INSERT ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION calculer_fenetre_expiration();

-- B2.19 — Trigger : calculer bénéfice net
CREATE OR REPLACE FUNCTION calculer_benefice_net()
RETURNS TRIGGER AS $$
BEGIN
  CASE NEW.type
    WHEN 'VENTE_TEXTILE' THEN
      NEW.benefice_net := NEW.montant - COALESCE(NEW.cout_achat, 0);
    WHEN 'COMMISSION_MOMO' THEN
      NEW.benefice_net := NEW.montant;
    ELSE
      NEW.benefice_net := 0;
  END CASE;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_calculer_benefice_net
  BEFORE INSERT OR UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION calculer_benefice_net();

-- B2.20 — Trigger : vérifier vente à perte (PV < CA)
CREATE OR REPLACE FUNCTION verifier_vente_a_perte()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.type = 'VENTE_TEXTILE' AND NEW.cout_achat IS NOT NULL AND NEW.montant < NEW.cout_achat THEN
    RAISE EXCEPTION 'VENTE_A_PERTE: Le prix de vente (%) ne peut pas être inférieur au coût d''achat (%)',
      NEW.montant, NEW.cout_achat;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_verifier_vente_a_perte
  BEFORE INSERT OR UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION verifier_vente_a_perte();

-- B2.21 — Trigger : vérifier fonds MoMo suffisant avant dépôt
CREATE OR REPLACE FUNCTION verifier_fonds_momo()
RETURNS TRIGGER AS $$
DECLARE
  solde_actuel INTEGER;
BEGIN
  IF NEW.type = 'MOMO_DEPOT' AND NEW.operateur_momo_id IS NOT NULL THEN
    SELECT solde_courant INTO solde_actuel
    FROM operateurs_momo
    WHERE id = NEW.operateur_momo_id;

    IF solde_actuel < NEW.montant THEN
      RAISE EXCEPTION 'FONDS_INSUFFISANT: Solde MoMo (%) insuffisant pour le dépôt de %',
        solde_actuel, NEW.montant;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_verifier_fonds_momo
  BEFORE INSERT ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION verifier_fonds_momo();

-- B2.22 — Trigger : mettre à jour le solde MoMo quand un mouvement FONDS_ROULEMENT_MOMO est inséré
CREATE OR REPLACE FUNCTION mettre_a_jour_solde_momo()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.caisse = 'FONDS_ROULEMENT_MOMO' AND NEW.operateur_momo_id IS NOT NULL THEN
    UPDATE operateurs_momo
    SET solde_courant = solde_courant + NEW.montant
    WHERE id = NEW.operateur_momo_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_mettre_a_jour_solde_momo
  AFTER INSERT ON mouvements_caisse
  FOR EACH ROW
  EXECUTE FUNCTION mettre_a_jour_solde_momo();

-- B2.23 — Trigger : journaliser les modifications de variables_globales
CREATE OR REPLACE FUNCTION journaliser_modification_variable()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO journal_audit (utilisateur_id, action, details)
  VALUES (
    NEW.modifie_par,
    'MODIFICATION_VARIABLE',
    jsonb_build_object(
      'cle', NEW.cle,
      'ancienne_valeur', OLD.valeur,
      'nouvelle_valeur', NEW.valeur
    )
  );
  NEW.modifie_le := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_journaliser_modification_variable
  BEFORE UPDATE ON variables_globales
  FOR EACH ROW
  EXECUTE FUNCTION journaliser_modification_variable();
