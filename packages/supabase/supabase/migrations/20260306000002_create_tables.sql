-- B2.2 — Créer la table utilisateurs
CREATE TABLE utilisateurs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifiant TEXT NOT NULL UNIQUE,
  role role_utilisateur NOT NULL,
  actif BOOLEAN NOT NULL DEFAULT true,
  cree_le TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_utilisateurs_identifiant ON utilisateurs(identifiant);

-- B2.3 — Créer la table variables_globales
CREATE TABLE variables_globales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cle TEXT NOT NULL UNIQUE,
  valeur INTEGER NOT NULL CHECK (valeur >= 0),
  modifie_le TIMESTAMPTZ NOT NULL DEFAULT now(),
  modifie_par UUID REFERENCES utilisateurs(id)
);

-- B2.5 — Créer la table operateurs_momo
CREATE TABLE operateurs_momo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom TEXT NOT NULL UNIQUE,
  solde_initial INTEGER NOT NULL DEFAULT 0 CHECK (solde_initial >= 0),
  solde_courant INTEGER NOT NULL DEFAULT 0,
  actif BOOLEAN NOT NULL DEFAULT true
);

-- B2.7 — Créer la table transactions
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type type_transaction NOT NULL,
  designation TEXT,
  montant INTEGER NOT NULL CHECK (montant > 0),
  cout_achat INTEGER CHECK (cout_achat >= 0),
  benefice_net INTEGER,
  operateur_momo_id UUID REFERENCES operateurs_momo(id),
  cree_par UUID NOT NULL REFERENCES utilisateurs(id),
  cree_le TIMESTAMPTZ NOT NULL DEFAULT now(),
  corrigee BOOLEAN NOT NULL DEFAULT false,
  corrigee_le TIMESTAMPTZ,
  valeurs_avant_correction JSONB,
  fenetre_expiration TIMESTAMPTZ,
  synchronisee BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX idx_transactions_cree_par ON transactions(cree_par);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_cree_le ON transactions(cree_le);

-- B2.8 — Créer la table mouvements_caisse
CREATE TABLE mouvements_caisse (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES transactions(id),
  caisse type_caisse NOT NULL,
  operateur_momo_id UUID REFERENCES operateurs_momo(id),
  montant INTEGER NOT NULL,
  cree_le TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_mouvements_caisse_transaction_id ON mouvements_caisse(transaction_id);
CREATE INDEX idx_mouvements_caisse_caisse ON mouvements_caisse(caisse);

-- B2.9 — Créer la table journal_audit
CREATE TABLE journal_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  utilisateur_id UUID NOT NULL REFERENCES utilisateurs(id),
  action action_audit NOT NULL,
  details JSONB,
  cree_le TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_journal_audit_utilisateur_id ON journal_audit(utilisateur_id);
CREATE INDEX idx_journal_audit_action ON journal_audit(action);
