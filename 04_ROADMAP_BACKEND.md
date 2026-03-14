# 04 — Roadmap Backend

> Rôle : Technical PM & Scrum Master  
> Sources : `00_BIBLE_PROJET.md` v1.2 · `01_ARCHITECTURE_TECHNIQUE.md` · `02_NORMES_OPERATIONNELLES.md` · `openapi.yaml` v1.0  
> Règle : chaque tâche ≤ 2h · TDD obligatoire · format **ID | Titre | Dépendance | Critère de fin**

---

## Phase B0 — Légende

| Icône | Signification |
|---|---|
| 🧪 | Tâche de test (écriture du test EN PREMIER) |
| 🏗️ | Tâche d'implémentation (faire passer le test) |
| ⚙️ | Tâche de setup / configuration |
| 📦 | Tâche de migration BDD |
| 🚀 | Tâche d'exposition endpoint |

---

## Phase B1 — Setup (Repo, Linter, CI) `[V0.1]`

> Objectif : monorepo opérationnel, CI verte, Supabase local fonctionnel.

| ID | Titre | Dépendance | Critère de fin |
|---|---|---|---|
| B1.1 | ⚙️ Initialiser le monorepo Turborepo + pnpm workspaces | — | `pnpm install` passe, `turbo build` vide sans erreur. Structure : `packages/core`, `packages/frontend`, `packages/supabase`. |
| B1.2 | ⚙️ Configurer `@sikabox/core` (TypeScript strict) | B1.1 | `packages/core/tsconfig.json` avec `strict: true`, `noUncheckedIndexedAccess: true`. `pnpm --filter core build` compile un fichier vide sans erreur. |
| B1.3 | ⚙️ Configurer `packages/supabase` (CLI + config) | B1.1 | `supabase init` exécuté, `supabase/config.toml` présent. `supabase start` démarre les containers Docker (PostgreSQL, GoTrue, PostgREST). |
| B1.4 | ⚙️ Configurer ESLint + Prettier (racine monorepo) | B1.1 | `eslint.config.js` (flat config ESLint 9+) + `.prettierrc` à la racine. `pnpm lint` passe sur tous les packages. Config partagée via un fichier de config flat exporté. |
| B1.5 | ⚙️ Configurer Vitest (racine + core) | B1.2 | `vitest.config.ts` dans `packages/core`. `pnpm --filter core test` exécute 0 tests, exit 0. Coverage configuré (Istanbul, seuil 80%). |
| B1.6 | ⚙️ Configurer GitHub Actions CI | B1.4, B1.5 | `.github/workflows/ci.yml` : checkout → install → lint → typecheck → test → build. Push sur `develop` déclenche le pipeline. |
| B1.7 | ⚙️ Configurer Husky + commitlint + lint-staged | B1.4 | `npx husky install` fonctionnel, `git commit -m "bad"` rejeté, `git commit -m "feat(core): init"` accepté. |

**Total Phase B1 : 7 tâches**

---

## Phase B2 — BDD (Migrations PostgreSQL) `[V0.1]` `[V0.2]`

> Objectif : schéma complet, RLS activé, données initiales seedées.  
> Chaque migration est un fichier SQL dans `supabase/migrations/`.

### B2.A — Tables et Types

| ID | Titre | Dépendance | Critère de fin |
|---|---|---|---|
| B2.1 | 📦 Migration : créer les types ENUM | B1.3 | Enums créés : `role_utilisateur`, `type_transaction`, `type_caisse`, `statut_caisse`, `action_audit`. `supabase db reset` passe. |
| B2.2 | 📦 Migration : créer la table `utilisateurs` | B2.1 | Table `utilisateurs` (id UUID PK, identifiant, role, actif, cree_le). Index sur `identifiant`. `supabase db reset` passe. |
| B2.3 | 📦 Migration : créer la table `variables_globales` | B2.1 | Table `variables_globales` (id, cle UNIQUE, valeur INTEGER, modifie_le, modifie_par FK). Contrainte CHECK `valeur >= 0`. |
| B2.4 | 📦 Seed : insérer les Variables Globales par défaut `[V0.1]` | B2.3 | `supabase/seed.sql` insère les 8 clés : `plafond_capital=500000`, `ratio_salaire=50`, `ratio_remboursement=30`, `ratio_reserve=20`, `ratio_post_plafond_salaire=70`, `ratio_post_plafond_reserve=30`, `frequence_rappel_commission_jours=3`, `verrouillage_inactivite_minutes=5`. |
| B2.5 | 📦 Migration : créer la table `operateurs_momo` | B2.1 | Table `operateurs_momo` (id, nom, solde_initial INTEGER, solde_courant INTEGER, actif BOOLEAN). Contrainte CHECK `solde_initial >= 0`. |
| B2.6 | 📦 Seed : insérer les 3 Opérateurs MoMo | B2.5 | Seed 3 lignes : MTN Mobile Money, Moov Money, Celtis Cash. `solde_initial = solde_courant = 0` (sera configuré par l'Admin). |
| B2.7 | 📦 Migration : créer la table `transactions` | B2.2, B2.5 | Table `transactions` (id, type, designation, montant, cout_achat, benefice_net, operateur_momo_id FK, cree_par FK, cree_le, corrigee, corrigee_le, valeurs_avant_correction JSONB, fenetre_expiration TIMESTAMPTZ, synchronisee). Index sur `cree_par`, `type`, `cree_le`. |
| B2.8 | 📦 Migration : créer la table `mouvements_caisse` | B2.7 | Table `mouvements_caisse` (id, transaction_id FK, caisse, operateur_momo_id FK nullable, montant INTEGER, cree_le). Index sur `transaction_id`, `caisse`. |
| B2.9 | 📦 Migration : créer la table `journal_audit` | B2.2 | Table `journal_audit` (id, utilisateur_id FK, action, details JSONB, cree_le). Index sur `utilisateur_id`, `action`. |
| B2.10 | 📦 Migration : créer la vue `soldes_caisses` | B2.8 | Vue matérialisée ou fonction SQL qui agrège les mouvements par caisse. `SELECT caisse, SUM(montant) AS solde FROM mouvements_caisse GROUP BY caisse`. |

### B2.B — Row Level Security (RLS)

| ID | Titre | Dépendance | Critère de fin |
|---|---|---|---|
| B2.11 | 📦 Migration : activer RLS sur toutes les tables | B2.10 | `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` sur les 5 tables. Sans politique → accès refusé par défaut. Test : requête anonyme retourne 0 lignes. |
| B2.12 | 📦 Migration : RLS `utilisateurs` | B2.11 | Politique : ADMIN voit tout, GESTIONNAIRE voit uniquement son propre profil. Test SQL avec `set_config('request.jwt.claims', ...)`. |
| B2.13 | 📦 Migration : RLS `transactions` | B2.11 | Politique : ADMIN SELECT all. GESTIONNAIRE SELECT/INSERT ses propres transactions. UPDATE uniquement si `fenetre_expiration > now()`. Pas de DELETE. |
| B2.14 | 📦 Migration : RLS `mouvements_caisse` | B2.11 | Politique : SELECT via jointure sur `transactions.cree_par`. INSERT uniquement par fonctions/triggers (service_role). Pas de DELETE/UPDATE. |
| B2.15 | 📦 Migration : RLS `variables_globales` | B2.11 | SELECT pour tous les rôles authentifiés. UPDATE uniquement pour ADMIN. |
| B2.16 | 📦 Migration : RLS `journal_audit` | B2.11 | SELECT uniquement pour ADMIN. INSERT par triggers/service_role. |
| B2.17 | 📦 Migration : RLS `operateurs_momo` | B2.11 | SELECT pour tous les rôles authentifiés. UPDATE uniquement pour ADMIN et triggers. |

### B2.C — Fonctions et Triggers PostgreSQL

| ID | Titre | Dépendance | Critère de fin |
|---|---|---|---|
| B2.18 | 📦 Fonction SQL : `calculer_fenetre_expiration()` | B2.7 | Trigger BEFORE INSERT sur `transactions` → `NEW.fenetre_expiration = NEW.cree_le + interval '10 minutes'`. Test : INSERT retourne `fenetre_expiration` correcte. |
| B2.19 | 📦 Fonction SQL : `calculer_benefice_net()` | B2.7 | Trigger BEFORE INSERT/UPDATE sur `transactions` → calcule `benefice_net` selon le type. Test : VENTE_TEXTILE avec PV=15000, CA=10000 → benefice_net=5000. |
| B2.20 | 📦 Fonction SQL : `verifier_vente_a_perte()` | B2.7 | Trigger BEFORE INSERT/UPDATE → RAISE EXCEPTION si PV < CA pour VENTE_TEXTILE. Test : INSERT avec PV=8000, CA=10000 → erreur. |
| B2.21 | 📦 Fonction SQL : `verifier_fonds_momo()` | B2.5, B2.7 | Trigger BEFORE INSERT → pour MOMO_DEPOT, vérifie `operateurs_momo.solde_courant >= montant`. RAISE EXCEPTION si insuffisant. |
| B2.22 | 📦 Fonction SQL : `mettre_a_jour_solde_momo()` | B2.5, B2.8 | Trigger AFTER INSERT sur `mouvements_caisse` → si caisse = FONDS_ROULEMENT_MOMO, UPDATE `operateurs_momo.solde_courant`. |
| B2.23 | 📦 Fonction SQL : `journaliser_modification_variable()` | B2.3, B2.9 | Trigger AFTER UPDATE sur `variables_globales` → INSERT dans `journal_audit` avec OLD et NEW values. |
| B2.24 | 📦 Migration : seed utilisateur Admin initial | B2.2 | Seed un utilisateur Admin (via GoTrue API ou SQL direct) pour les tests manuels. Documenté dans README. |
| B2.25 | 📦 Fonction SQL : `tableau_de_bord()` | B2.10, B2.5 | Fonction PL/pgSQL qui retourne le schéma complet `TableauDeBord` : soldes des 4 caisses (avec statut/couleur), fonds de roulement par opérateur MoMo, progression remboursement (pourcentage, plafond_atteint), total_libre (= solde Caisse Salaire), rappels_commission_en_attente. Test : la fonction retourne un JSON conforme au schéma `TableauDeBord` de l'OpenAPI. |
| B2.26 | 📦 Fonction SQL : `verifier_rappel_commission()` | B2.5, B2.7, B2.3 | Fonction PL/pgSQL qui retourne un tableau de `RappelCommission` : pour chaque opérateur MoMo, vérifie si la dernière saisie de commission dépasse `frequence_rappel_commission_jours` (Variable Globale, défaut 3 jours). Retourne `rappel_du: true/false`, `derniere_saisie`, `jours_depuis_derniere_saisie`. |
| B2.27 | 📦 Migration : RLS `operateurs_momo` UPDATE par ADMIN | B2.17 | Politique RLS complémentaire : permettre à l'ADMIN de PATCH (UPDATE) `solde_initial` et `actif` sur `operateurs_momo`. Ajouter un trigger de journalisation dans `journal_audit`. |
| B2.28 | 📦 Vue `transactions_enrichies` (champs calculés) | B2.7, B2.5 | Vue PostgreSQL qui expose les transactions avec les champs calculés : `fenetre_active` (= `NOW() < fenetre_expiration`), `operateur_momo_nom` (JOIN sur `operateurs_momo.nom`). Le endpoint `GET /rest/v1/transactions` utilise cette vue au lieu de la table directe. PostgREST sert les vues comme des tables. RLS héritée via `security_invoker = true`. |

**Total Phase B2 : 28 tâches**

---

## Phase B3 — Tests TDD (`@sikabox/core`) `[V0.1]` `[V0.2]` `[V0.3]`

> Objectif : écrire **tous les tests d'abord**, 0 test ne passe (phase Rouge du TDD).  
> Les tests définissent le contrat comportemental du module `@sikabox/core`.

### B3.A — Types et Patterns de base

| ID | Titre | Dépendance | Critère de fin |
|---|---|---|---|
| B3.1 | 🧪 Créer le test : `Result<T, E>` pattern (Ok et Err) | B1.5 | Test unitaire : `Result.ok(42).isOk() === true`, `Result.err('nope').isErr() === true`, `unwrap()` sur Err throw. Fichier : `core/src/result.test.ts`. **Test écrit, test ROUGE.** |
| B3.2 | 🧪 Créer le test : types/enums du domaine | B1.5 | Test unitaire : `TypeTransaction`, `TypeCaisse`, `RoleUtilisateur` existent et ont les bonnes valeurs. Fichier : `core/src/domain/types.test.ts`. **Test ROUGE.** |

### B3.B — Moteur de Répartition

| ID | Titre | Dépendance | Critère de fin |
|---|---|---|---|
| B3.3 | 🧪 Test : répartition cas nominal (50/30/20) | B3.2 | Bénéfice=5000 → Stock=0 (CA va en Stock), Salaire=2500, Remboursement=1500, Réserve=1000. **Test ROUGE.** |
| B3.4 | 🧪 Test : répartition bénéfice net = 0 | B3.2 | PV = CA = 10000 → Bénéfice=0, toutes caisses bénéfice=0, Stock=10000. **Test ROUGE.** |
| B3.5 | 🧪 Test : répartition quand Plafond de Capital atteint | B3.2 | Plafond=500000, déjà remboursé=500000. Ratios post-plafond (70/30) → Salaire=70%, Réserve=30%, Remboursement=0. **Test ROUGE.** |
| B3.6 | 🧪 Test : répartition Plafond partiellement atteint (ce bénéfice dépasse le plafond) | B3.2 | Remboursé=499000, plafond=500000, bénéfice=5000 → Remboursement reçoit 1000 (complète à 500000), reste 4000 réparti en post-plafond (70/30). **Test ROUGE.** |
| B3.7 | 🧪 Test : répartition montant non divisible (arrondi) | B3.2 | Bénéfice=1 → vérifier que la somme des caisses = 1 (pas de perte/gain d'arrondi). **Test ROUGE.** |
| B3.8 | 🧪 Test : répartition bénéfice=3 avec ratios 50/30/20 (arrondi critique) `[V0.1]` | B3.2 | Algorithme Largest Remainder Method : `floor(3×50%)=1` (reste 0.5), `floor(3×30%)=0` (reste 0.9), `floor(3×20%)=0` (reste 0.6). Somme floors=1, reste=2. Distribution : +1 Remboursement (reste 0.9), +1 Réserve (reste 0.6). **Résultat attendu : Salaire=1, Remboursement=1, Réserve=1. Somme=3.** Vérifier l'algo de répartition du reste. **Test ROUGE.** |

### B3.C — Validation Vente Textile

| ID | Titre | Dépendance | Critère de fin |
|---|---|---|---|
| B3.9 | 🧪 Test : vente textile valide (PV ≥ CA) | B3.2 | `validerVenteTextile({pv: 15000, ca: 10000, designation: "X"})` → `Result.ok(...)`. **Test ROUGE.** |
| B3.10 | 🧪 Test : vente textile à perte (PV < CA) → VENTE_A_PERTE | B3.2 | `validerVenteTextile({pv: 8000, ca: 10000, ...})` → `Result.err({code: 'VENTE_A_PERTE'})`. **Test ROUGE.** |
| B3.11 | 🧪 Test : vente textile PV = CA (bénéfice = 0, valide) | B3.2 | `validerVenteTextile({pv: 10000, ca: 10000, ...})` → `Result.ok(...)`, benefice_net=0. **Test ROUGE.** |
| B3.12 | 🧪 Test : vente textile montant ≤ 0 → MONTANT_INVALIDE | B3.2 | PV=0 ou CA=-1 → `Result.err({code: 'MONTANT_INVALIDE'})`. **Test ROUGE.** |
| B3.13 | 🧪 Test : vente textile montant décimal → MONTANT_INVALIDE | B3.2 | PV=15000.5 → rejeté (FCFA entier uniquement). **Test ROUGE.** |

### B3.D — Opérations MoMo

| ID | Titre | Dépendance | Critère de fin |
|---|---|---|---|
| B3.14 | 🧪 Test : dépôt MoMo valide (fonds suffisant) | B3.2 | Solde=200000, dépôt=50000 → ok, nouveau_solde=150000. **Test ROUGE.** |
| B3.15 | 🧪 Test : dépôt MoMo fonds insuffisant → FONDS_INSUFFISANT | B3.2 | Solde=30000, dépôt=50000 → `Result.err({code: 'FONDS_INSUFFISANT'})`. **Test ROUGE.** |
| B3.16 | 🧪 Test : retrait MoMo (augmente e-float) | B3.2 | Solde=200000, retrait=50000 → ok, nouveau_solde=250000. **Test ROUGE.** |
| B3.17 | 🧪 Test : commission MoMo → bénéfice net ventilé | B3.2 | Commission=5000 → ventilation identique à bénéfice net vente textile (50/30/20). **Test ROUGE.** |

### B3.E — Fenêtre de Correction

| ID | Titre | Dépendance | Critère de fin |
|---|---|---|---|
| B3.18 | 🧪 Test : fenêtre active (< 10 min) | B3.2 | `cree_le` = `now() - 5min` → `estFenetreActive(cree_le)` retourne `true`. **Test ROUGE.** |
| B3.19 | 🧪 Test : fenêtre expirée (≥ 10 min) → FENETRE_EXPIREE | B3.2 | `cree_le` = `now() - 11min` → `estFenetreActive(cree_le)` retourne `false`. **Test ROUGE.** |
| B3.20 | 🧪 Test : correction génère écritures inverses | B3.2 | Vente initiale (PV=15000, CA=10000) corrigée en (PV=12000, CA=7000) → mouvements inverses (-ancien) + nouveaux mouvements. Somme cohérente. **Test ROUGE.** |

### B3.F — Validation des Ratios

| ID | Titre | Dépendance | Critère de fin |
|---|---|---|---|
| B3.21 | 🧪 Test : ratios valides (somme = 100%) | B3.2 | `validerRatios({salaire: 50, remboursement: 30, reserve: 20})` → ok. **Test ROUGE.** |
| B3.22 | 🧪 Test : ratios invalides (somme ≠ 100%) → RATIOS_INVALIDES | B3.2 | `validerRatios({salaire: 50, remboursement: 30, reserve: 25})` → err. **Test ROUGE.** |
| B3.23 | 🧪 Test : ratios post-plafond valides (somme = 100%) | B3.2 | `validerRatiosPostPlafond({salaire: 70, reserve: 30})` → ok. **Test ROUGE.** |

### B3.G — Rapport Trimestriel

| ID | Titre | Dépendance | Critère de fin |
|---|---|---|---|
| B3.24 | 🧪 Test : agrégation rapport — 0 transactions | B3.2 | Période vide → `nombre_transactions.total = 0`, tous les montants = 0. **Test ROUGE.** |
| B3.25 | 🧪 Test : agrégation rapport — données mixtes | B3.2 | 3 ventes textiles + 2 dépôts MoMo + 1 commission → agrégation correcte par type. **Test ROUGE.** |

**Total Phase B3 : 25 tâches (tous tests ROUGE)**

---

## Phase B4 — Logique Métier (`@sikabox/core` — Implémentation) `[V0.1]` `[V0.2]` `[V0.3]`

> Objectif : faire passer tous les tests écrits en B3 (phase Verte du TDD).

### B4.A — Fondations

| ID | Titre | Dépendance | Critère de fin |
|---|---|---|---|
| B4.1 | 🏗️ Implémenter `Result<T, E>` (Ok / Err / match / map) | B3.1 | Tests B3.1 passent au VERT. Export depuis `@sikabox/core`. |
| B4.2 | 🏗️ Implémenter les types/enums du domaine | B3.2 | Tests B3.2 passent au VERT. Types : `TypeTransaction`, `TypeCaisse`, `RoleUtilisateur`, `CodeErreur`, `VariableGlobale`, `Transaction`, `MouvementCaisse`, etc. |
| B4.3 | 🏗️ Implémenter les constantes du domaine | B4.2 | `DUREE_FENETRE_CORRECTION_MS = 10 * 60 * 1000`, `DEVISE = 'XOF'`. Exportées depuis `@sikabox/core/constants`. |

### B4.B — Moteur de Répartition

| ID | Titre | Dépendance | Critère de fin |
|---|---|---|---|
| B4.4 | 🏗️ Implémenter `calculerRepartition()` — cas nominal | B3.3, B4.2 | Tests B3.3, B3.4 passent au VERT. Fonction pure : `(beneficeNet, ratios) → MouvementCaisse[]`. |
| B4.5 | 🏗️ Implémenter `calculerRepartition()` — plafond atteint | B3.5, B3.6, B4.4 | Tests B3.5, B3.6 passent au VERT. Gère la bascule vers les ratios post-plafond. |
| B4.6 | 🏗️ Implémenter `calculerRepartition()` — arrondi entier `[V0.1]` | B3.7, B3.8, B4.4 | Tests B3.7, B3.8 passent au VERT. Algorithme : **Largest Remainder Method** — `Math.floor()` chaque part, puis distribuer le reste (1 FCFA à la fois) aux caisses avec les plus gros restes fractionnaires. En cas d'égalité, Caisse Réserve prioritaire. |

### B4.C — Validations

| ID | Titre | Dépendance | Critère de fin |
|---|---|---|---|
| B4.7 | 🏗️ Implémenter `validerVenteTextile()` | B3.9–B3.13, B4.1 | Tests B3.9 à B3.13 passent au VERT. Retourne `Result<VenteTextileValidee, ErreurValidation>`. |
| B4.8 | 🏗️ Implémenter `validerOperationMomo()` | B3.14–B3.16, B4.1 | Tests B3.14 à B3.16 passent au VERT. Valide dépôt (solde suffisant) et retrait. |
| B4.9 | 🏗️ Implémenter `validerCommissionMomo()` | B3.17, B4.4 | Test B3.17 passe au VERT. Commission ventilée comme bénéfice net. |
| B4.10 | 🏗️ Implémenter `validerRatios()` et `validerRatiosPostPlafond()` | B3.21–B3.23, B4.1 | Tests B3.21 à B3.23 passent au VERT. Somme = 100% obligatoire. |

### B4.D — Correction

| ID | Titre | Dépendance | Critère de fin |
|---|---|---|---|
| B4.11 | 🏗️ Implémenter `estFenetreActive()` | B3.18, B3.19 | Tests B3.18, B3.19 passent au VERT. Fonction pure `(cree_le, maintenant?) → boolean`. |
| B4.12 | 🏗️ Implémenter `genererCorrectionTransaction()` | B3.20, B4.4, B4.11 | Test B3.20 passe au VERT. Génère écritures inverses + nouvelles écritures. |

### B4.E — Rapport

| ID | Titre | Dépendance | Critère de fin |
|---|---|---|---|
| B4.13 | 🏗️ Implémenter `agregerRapportTrimestriel()` | B3.24, B3.25, B4.2 | Tests B3.24, B3.25 passent au VERT. Agrège un tableau de transactions en `RapportTrimestriel`. |

### B4.F — Refactoring

| ID | Titre | Dépendance | Critère de fin |
|---|---|---|---|
| B4.14 | 🏗️ Refactoring post-vert : extraire helpers, simplifier | B4.1–B4.13 | Couverture ≥ 90% sur `@sikabox/core`. Tous les tests restent VERTS. `pnpm --filter core lint` passe. |

**Total Phase B4 : 14 tâches**

---

## Phase B5 — Edge Functions (Endpoints Supabase) `[V0.1]` `[V0.2]` `[V0.3]` `[V1.0]`

> Objectif : implémenter les endpoints qui NE sont PAS auto-gérés par PostgREST.  
> PostgREST gère automatiquement le CRUD sur les tables avec RLS.  
> Les Edge Functions gèrent : sync, reporting, et logique métier complexe.

### B5.A — Setup Edge Functions

| ID | Titre | Dépendance | Critère de fin |
|---|---|---|---|
| B5.1 | ⚙️ Configurer l'import de `@sikabox/core` dans les Edge Functions `[V0.1]` | B4.14, B1.3 | `import { calculerRepartition } from '@sikabox/core'` fonctionne dans une Edge Function Deno. Import map configuré. Le build de `@sikabox/core` produit un ESM bundle compatible Deno (pas de dépendances Node-only, pas de CommonJS). Vérifier avec `deno run --check`. |
| B5.2 | ⚙️ Créer le middleware d'authentification Edge Function | B5.1 | Helper `getAuthUser(req)` qui extrait et vérifie le JWT, retourne `{id, role}`. Retourne 401 si invalide. |
| B5.3 | ⚙️ Créer le helper de réponse RFC 7807 | B5.1 | Helper `problemResponse(status, code, title, detail, extensions?)` pour formater les erreurs. |

### B5.B — Edge Function : Sync

| ID | Titre | Dépendance | Critère de fin |
|---|---|---|---|
| B5.4 | 🧪 Créer le test d'abord : Edge Function `sync/push` — cas nominal | B5.2, B5.3 | Test d'intégration : POST `/functions/v1/sync/push` avec 2 transactions valides → 200, les 2 IDs retournés dans `synchronisees`. **Test ROUGE.** |
| B5.5 | 🧪 Créer le test d'abord : Edge Function `sync/push` — transaction invalide | B5.4 | Test : 1 valide + 1 invalide (vente à perte) → 200, 1 dans `synchronisees`, 1 dans `echouees` avec ProblemDetails. **Test ROUGE.** |
| B5.6 | 🚀 Implémenter Edge Function `sync/push` | B5.4, B5.5 | Tests B5.4, B5.5 passent au VERT. La fonction revalide chaque transaction via `@sikabox/core`, persiste les valides, retourne les erreurs. |
| B5.7 | 🧪 Créer le test d'abord : Edge Function `sync/pull` | B5.2 | Test : GET `/functions/v1/sync/pull?depuis=2026-01-01T00:00:00Z` → 200, retourne `variables_globales` modifiées et `compte_actif`. **Test ROUGE.** |
| B5.8 | 🚀 Implémenter Edge Function `sync/pull` | B5.7 | Test B5.7 passe au VERT. Query les tables avec filtre `modifie_le > depuis`. |

### B5.C — Edge Function : Rapport

| ID | Titre | Dépendance | Critère de fin |
|---|---|---|---|
| B5.9 | 🧪 Créer le test d'abord : Edge Function `rapports/trimestriel` | B5.2, B4.13 | Test : POST `/functions/v1/rapports/trimestriel` avec `{annee: 2026, trimestre: 1}` → 200. Vérifie la structure du rapport. **Test ROUGE.** |
| B5.10 | 🚀 Implémenter Edge Function `rapports/trimestriel` | B5.9 | Test B5.9 passe au VERT. Requête les transactions de la période, passe à `agregerRapportTrimestriel()`. Rôle ADMIN requis. |

### B5.D — Edge Function : Vente Textile (validation enrichie)

| ID | Titre | Dépendance | Critère de fin |
|---|---|---|---|
| B5.11 | 🧪 Créer le test d'abord : RPC `creer_vente_textile` | B2.18–B2.20, B4.7 | Test : appel RPC avec PV=15000, CA=10000 → row insertée + 4 mouvements de caisse créés automatiquement. **Test ROUGE.** |
| B5.12 | 🚀 Implémenter fonction PostgreSQL `creer_vente_textile()` | B5.11 | Test B5.11 passe au VERT. Fonction PL/pgSQL qui : valide, INSERT transaction, calcule ventilation via trigger, retourne transaction + ventilation. |

### B5.E — Edge Function : Opération et Commission MoMo

| ID | Titre | Dépendance | Critère de fin |
|---|---|---|---|
| B5.13 | 🧪 Créer le test d'abord : RPC `creer_operation_momo` | B2.21, B4.8 | Test : dépôt 50000 sur MTN (solde=200000) → solde diminue à 150000. **Test ROUGE.** |
| B5.14 | 🚀 Implémenter fonction PostgreSQL `creer_operation_momo()` | B5.13 | Test B5.13 passe au VERT. Vérifie fonds, insert transaction, crée mouvement FONDS_ROULEMENT_MOMO, update solde opérateur. |
| B5.15 | 🧪 Créer le test d'abord : RPC `creer_commission_momo` | B4.9 | Test : commission 5000 sur MTN → ventilation 50/30/20 du bénéfice. **Test ROUGE.** |
| B5.16 | 🚀 Implémenter fonction PostgreSQL `creer_commission_momo()` | B5.15 | Test B5.15 passe au VERT. Insert transaction, ventile commission comme bénéfice net. |

### B5.F — Edge Function : Correction

| ID | Titre | Dépendance | Critère de fin |
|---|---|---|---|
| B5.17 | 🧪 Créer le test d'abord : RPC `corriger_transaction` | B4.12 | Test : corriger vente dans la fenêtre → écritures inverses + nouvelles écritures. Soldes caisses mis à jour. **Test ROUGE.** |
| B5.18 | 🚀 Implémenter fonction PostgreSQL `corriger_transaction()` | B5.17 | Test B5.17 passe au VERT. Vérifie fenêtre, sauvegarde `valeurs_avant_correction`, inverse + recrée mouvements. |
| B5.19 | 🧪 Créer le test d'abord : RPC `corriger_transaction` — fenêtre expirée | B5.17 | Test : corriger une transaction de 11 min → erreur FENETRE_EXPIREE. **Test ROUGE.** |
| B5.20 | 🚀 Implémenter la vérification fenêtre dans `corriger_transaction()` | B5.19 | Test B5.19 passe au VERT. RAISE EXCEPTION avec code FENETRE_EXPIREE. |
| B5.21 | 🧪 Créer le test d'abord : RPC `configurer_operateur_momo` (Admin) | B2.27 | Test : Admin PATCH MTN Mobile Money avec `solde_initial=200000` → `solde_courant` mis à jour si première config. Entrée dans `journal_audit`. GESTIONNAIRE → 403. **Test ROUGE.** |
| B5.22 | 🚀 Implémenter fonction PostgreSQL `configurer_operateur_momo()` | B5.21 | Test B5.21 passe au VERT. Valide rôle ADMIN, met à jour `solde_initial` (et `solde_courant` si c'est la première config), journalise. |

### B5.G — Edge Functions : Gestion Utilisateur (GoTrue)

| ID | Titre | Dépendance | Critère de fin |
|---|---|---|---|
| B5.23 | 🧪 Créer le test d'abord : Edge Function `creer-gestionnaire` | B5.2, B5.3 | Test d'intégration : POST `/functions/v1/admin/gestionnaire` avec `{identifiant, mot_de_passe_temporaire}` (rôle ADMIN) → 201. Vérifie : utilisateur créé dans GoTrue (auth.users) + ligne insérée dans `public.utilisateurs` avec role=GESTIONNAIRE. GESTIONNAIRE → 403. **Test ROUGE.** |
| B5.24 | 🚀 Implémenter Edge Function `creer-gestionnaire` | B5.23 | Test B5.23 passe au VERT. L'Edge Function utilise `supabase.auth.admin.createUser()` (service_role) pour créer le user GoTrue avec custom claim `role: GESTIONNAIRE`, puis INSERT dans `public.utilisateurs`. Marque le mot de passe comme temporaire dans les user metadata. |
| B5.25 | 🧪 Créer le test d'abord : Edge Function `modifier-statut-gestionnaire` | B5.2, B5.3 | Test : POST `/functions/v1/admin/gestionnaire/{id}/statut` avec `{actif: false}` (rôle ADMIN) → 200. Vérifie : user GoTrue banni (ne peut plus se connecter) + `public.utilisateurs.actif = false`. Réactivation : `{actif: true}` → user débanni. Entrée dans journal_audit. **Test ROUGE.** |
| B5.26 | 🚀 Implémenter Edge Function `modifier-statut-gestionnaire` | B5.25 | Test B5.25 passe au VERT. Utilise `supabase.auth.admin.updateUserById(id, {banned: true/false})` + UPDATE `public.utilisateurs SET actif = ...`. Journalise l'action (DESACTIVATION_COMPTE / ACTIVATION_COMPTE). |

**Total Phase B5 : 26 tâches**

---

## Phase B6 — Tests d'intégration End-to-End Backend `[V0.1]` `[V0.2]` `[V0.3]`

> Objectif : valider les flux complets sur Supabase local.

| ID | Titre | Dépendance | Critère de fin |
|---|---|---|---|
| B6.1 | 🧪 Test E2E : flux complet vente textile | B5.12 | Login → créer vente → vérifier soldes caisses → vérifier historique transaction. Supabase local. |
| B6.2 | 🧪 Test E2E : flux complet MoMo (dépôt + commission) | B5.14, B5.16 | Login → dépôt MoMo → vérifier solde opérateur → saisir commission → vérifier ventilation. |
| B6.3 | 🧪 Test E2E : flux correction dans la fenêtre | B5.18 | Login → créer vente → corriger (< 10 min) → vérifier écritures inverses → vérifier soldes. |
| B6.4 | 🧪 Test E2E : flux correction fenêtre expirée | B5.20 | Login → créer vente → attendre 10+ min (mock time) → corriger → erreur 403. |
| B6.5 | 🧪 Test E2E : flux sync push/pull | B5.6, B5.8 | Login → push 3 transactions → pull → vérifier cohérence. |
| B6.6 | 🧪 Test E2E : Admin — modifier Variable Globale | B2.15, B2.23 | Login Admin → PATCH ratio_salaire=60 → vérifier journal_audit → nouvelle vente utilise 60%. |
| B6.7 | 🧪 Test E2E : RLS — Gestionnaire ne voit pas les autres | B2.13 | Login Gestionnaire A → créer vente → Login Gestionnaire B (si futur multi) → ne voit pas la vente de A. |
| B6.8 | 🧪 Test E2E : génération rapport trimestriel | B5.10 | Créer 5+ transactions variées → générer rapport Q1 2026 → vérifier agrégation. |

**Total Phase B6 : 8 tâches**

---

## Récapitulatif Backend

| Phase | Nb tâches | Objectif |
|---|---|---|
| B1 — Setup | 7 | Monorepo + CI opérationnels |
| B2 — BDD | 28 | Schéma complet + RLS + triggers + fonctions SQL + vue enrichie |
| B3 — Tests TDD | 25 | Tous les tests ROUGES écrits |
| B4 — Logique métier | 14 | Tous les tests VERTS |
| B5 — Endpoints | 26 | Edge Functions + RPC (incl. gestion utilisateur GoTrue) |
| B6 — Tests E2E | 8 | Flux complets validés |
| **TOTAL** | **108** | — |

---

> **Version** : 1.0  
> **Dernière mise à jour** : Phase 5 — Roadmaps
