# 01 — INCOHÉRENCES DÉTECTÉES ENTRE LES DOCUMENTS

> **Version** : 1.0  
> **Date** : 09 mars 2026  
> **Source** : Revue croisée exhaustive des documents 00 à 06 + `openapi.yaml`  
> **Convention** : Chaque incohérence est numérotée, localisée, et classée par sévérité.

---

## Légende de sévérité

| Niveau | Signification |
|--------|---------------|
| 🔴 **CRITIQUE** | Peut causer un bug fonctionnel ou une divergence d'implémentation. À corriger avant de coder. |
| 🟡 **MODÉRÉ** | Ambiguïté qui nécessitera une décision ad hoc pendant l'implémentation. À clarifier. |
| 🟢 **MINEUR** | Coquille, inconsistance cosmétique ou convention non alignée. À corriger par hygiène. |

---

## INC-01 🟡 — Version de l'OpenAPI : 1.0 vs 1.1

**Localisation** :
- `openapi.yaml` : déclare `version: 1.0.0`
- `04_ROADMAP_BACKEND.md` : référence `openapi.yaml v1.0`
- `05_ROADMAP_FRONTEND.md` : référence `openapi.yaml v1.0`
- `06_PLAN_GENERAL.md` : référence `openapi.yaml v1.1`

**Incohérence** : Le Plan Général (doc 06) référence une version `v1.1` qui n'existe pas. Toutes les autres sources pointent vers la `v1.0`.

**Risque** : Si quelqu'un cherche un `openapi.yaml v1.1` en pensant qu'il y a eu une mise à jour, il ne trouvera rien. Confusion potentielle.

**Action recommandée** : Corriger `06_PLAN_GENERAL.md` pour référencer `v1.0`, ou si une v1.1 est planifiée, la créer et documenter le delta.

---

## INC-02 🔴 — Champ `commission` redondant dans le schéma TRANSACTION

**Localisation** :
- `01_ARCHITECTURE_TECHNIQUE.md`, section 2.3 (Schéma relationnel) : le schéma Mermaid définit un champ `commission "nullable, pour commission MoMo"` dans la table `TRANSACTION`, **en plus** du champ `montant`.
- `04_ROADMAP_BACKEND.md`, tâche B2.7 : la table `transactions` a les champs `montant`, `cout_achat`, `benefice_net` — pas de champ `commission` distinct.
- `openapi.yaml`, schéma `TransactionVenteTextileResponse` et `CommissionMomoResponse` : utilise `montant` pour le montant principal et `benefice_net` pour le bénéfice.

**Incohérence** : Le schéma Mermaid dans l'architecture a un champ `commission` qui n'apparaît ni dans la roadmap backend (B2.7) ni dans l'OpenAPI. Pour une `COMMISSION_MOMO`, le `montant` de la table `transactions` EST la commission, et le `benefice_net` est égal au `montant` (la commission entière est le bénéfice).

**Risque** : Un développeur suivant le diagramme Mermaid de l'architecture créerait un champ `commission` dans la migration SQL. Un développeur suivant la roadmap backend ne le créerait pas. Divergence structurelle de la BDD.

**Action recommandée** : Supprimer le champ `commission` du schéma Mermaid dans `01_ARCHITECTURE_TECHNIQUE.md`. Le champ `montant` de la transaction suffit. Pour `COMMISSION_MOMO` : `montant = commission`, `benefice_net = montant`, `cout_achat = NULL`.

---

## INC-03 🔴 — Arrondi "Math.floor" vs "Largest Remainder" — ambiguïté dans le test B3.8

**Localisation** :
- `00_BIBLE_PROJET.md`, section E5 : _"Tous les calculs en nombres entiers (FCFA, pas de centimes) — arrondi au franc inférieur, le reste va en Caisse Réserve."_
- `02_NORMES_OPERATIONNELLES.md`, section 1.3 : _"Pas de nombres flottants pour FCFA [...] on utilise Math.floor()"_
- `04_ROADMAP_BACKEND.md`, tâche B3.8 : _"3×50%=1.5→2, 3×30%=0.9→1, 3×20%=0.6→0. Somme=3."_
- `04_ROADMAP_BACKEND.md`, tâche B4.6 : _"Algorithme : 'largest remainder method' pour distribuer sans perte."_

**Incohérence** : Le test B3.8 annote `3×50%=1.5→2`, ce qui est un arrondi au **supérieur**. Or la Bible et les normes imposent `Math.floor()` (arrondi à l'inférieur). Avec `Math.floor` :
- `3 × 50% = 1.5 → 1`
- `3 × 30% = 0.9 → 0`
- `3 × 20% = 0.6 → 0`
- Somme = 1. Il manque 2 FCFA.

Le "largest remainder method" (mentionné en B4.6) résout ce problème en distribuant le reste aux caisses avec les plus gros restes fractionnaires. Mais le libellé du test B3.8 est trompeur car il montre un arrondi vers le haut.

**Risque** : Si le développeur implémente `Math.floor()` strict (comme dit la Bible), le test B3.8 tel qu'annoté échoue. Si le développeur implémente "largest remainder", le résultat est différent de l'annotation du test.

**Action recommandée** :
1. Clarifier dans la Bible que l'algorithme est "largest remainder method" (pas un simple `Math.floor`).
2. Corriger l'annotation du test B3.8 avec les valeurs réelles attendues selon l'algorithme choisi.
3. Documenter l'algorithme exact. Proposition :
   - Étape 1 : Calculer la part brute de chaque caisse : `benefice * ratio / 100`.
   - Étape 2 : Prendre le `Math.floor()` de chaque part.
   - Étape 3 : Calculer le reste total : `benefice - somme(floors)`.
   - Étape 4 : Distribuer le reste (1 FCFA à la fois) aux caisses ayant les plus gros restes fractionnaires.
   - Étape 5 : En cas d'égalité, la Caisse Réserve est prioritaire (conformément à la Bible).

---

## INC-04 🟡 — Unité de la fréquence de rappel commission non stockée

**Localisation** :
- `00_BIBLE_PROJET.md`, Q9 : _"3 jours. La Gestionnaire est rappelée toutes les 72 heures."_
- `04_ROADMAP_BACKEND.md`, B2.4 (seed) : `frequence_rappel_commission=3`
- `01_ARCHITECTURE_TECHNIQUE.md`, schéma : `VARIABLE_GLOBALE.valeur` est un `INTEGER`.

**Incohérence** : La valeur stockée est `3` (un entier), mais l'unité n'est documentée nulle part dans le schéma. Est-ce 3 jours ? 3 heures ? 3 opérations MoMo ? La Bible dit "3 jours", mais le code devra faire l'hypothèse que `frequence_rappel_commission` est en **jours** sans que ce soit formalisé.

**Risque** : Un développeur qui lit uniquement le schéma BDD ne sait pas quelle unité utiliser. Le code interprétera `3` et devra deviner l'unité.

**Action recommandée** :
- Option A : Renommer la clé en `frequence_rappel_commission_jours` pour rendre l'unité explicite.
- Option B : Ajouter un commentaire SQL dans la migration et une constante dans `@sikabox/core/constants.ts` : `UNITE_FREQUENCE_RAPPEL = 'jours'`.
- Option C : Ajouter une table de métadonnées des Variables Globales (clé, unité, description, min, max).

---

## INC-05 🟡 — Unité du verrouillage d'inactivité non stockée

**Localisation** : Même problème que INC-04 pour `verrouillage_inactivite=5`.

- `00_BIBLE_PROJET.md`, Q11 : _"5 minutes"_.
- `04_ROADMAP_BACKEND.md`, B2.4 : `verrouillage_inactivite=5`.

**Incohérence** : `5` est stocké sans unité. C'est 5 minutes selon la Bible, mais le schéma ne le dit pas.

**Action recommandée** : Même traitement que INC-04 — renommer en `verrouillage_inactivite_minutes` ou documenter l'unité.

---

## INC-06 🟢 — ESLint `.eslintrc.cjs` vs flat config

**Localisation** :
- `04_ROADMAP_BACKEND.md`, B1.4 : _"`.eslintrc.cjs` + `.prettierrc` à la racine."_
- Contexte technique : ESLint 9+ (sorti en avril 2024) utilise nativement le format "flat config" (`eslint.config.js` ou `eslint.config.mjs`). Le format `.eslintrc.*` est déprécié depuis ESLint 8.56 et sera supprimé dans ESLint 10.

**Risque** : Un développeur installant ESLint en mars 2026 obtiendra ESLint 9+ par défaut, qui ne supporte plus `.eslintrc.cjs` nativement (nécessite `ESLINT_USE_FLAT_CONFIG=false` ou le package `@eslint/eslintrc`).

**Action recommandée** : Mettre à jour B1.4 pour utiliser `eslint.config.js` (flat config). La config partagée `eslint-config-custom` doit être refactorisée en conséquence.

---

## INC-07 🟡 — Bible v1.1 vs v1.2

**Localisation** :
- `00_BIBLE_PROJET.md` : déclare `Version : 1.2` en en-tête.
- `04_ROADMAP_BACKEND.md` : référence `00_BIBLE_PROJET.md v1.1`.
- `05_ROADMAP_FRONTEND.md` : référence `00_BIBLE_PROJET.md v1.1`.

**Incohérence** : Les roadmaps ont été écrites en se basant sur la Bible v1.1. La Bible est maintenant en v1.2. Si des changements ont été faits entre v1.1 et v1.2 (ajout de Q10, Q11 par exemple), les roadmaps pourraient ne pas couvrir les fonctionnalités ajoutées.

**Risque** : Des fonctionnalités ajoutées en v1.2 de la Bible (verrouillage inactivité Q11, vérification e-float Q10) pourraient ne pas avoir de tâches correspondantes dans les roadmaps.

**Analyse** : En vérifiant les roadmaps :
- Q10 (vérification e-float) → couvert par B2.21 (`verifier_fonds_momo`) et B3.15 (test fonds insuffisant). ✅
- Q11 (verrouillage inactivité) → couvert par F4.45 et B2.4 (seed `verrouillage_inactivite=5`). ✅

**Conclusion** : Pas de tâche manquante identifiée, mais les roadmaps devraient référencer la v1.2 pour être à jour.

**Action recommandée** : Mettre à jour les références de version dans les roadmaps de `v1.1` à `v1.2`.

---

## INC-08 🟡 — `solde_courant` des opérateurs MoMo : stocké ou calculé ?

**Localisation** :
- `01_ARCHITECTURE_TECHNIQUE.md`, schéma : `OPERATEUR_MOMO.solde_courant INTEGER` — champ stocké dans la table.
- `04_ROADMAP_BACKEND.md`, B2.22 : _"Trigger AFTER INSERT sur mouvements_caisse → UPDATE operateurs_momo.solde_courant"_ — le solde est mis à jour par trigger.
- Pattern général : Les soldes des **caisses** (Stock, Salaire, etc.) sont calculés via une vue/fonction d'agrégation (B2.10 : `SUM(montant) FROM mouvements_caisse GROUP BY caisse`).

**Incohérence** : Deux stratégies différentes pour les soldes :
- **Caisses** : solde **calculé** par agrégation des mouvements (pas de champ stocké).
- **Opérateurs MoMo** : solde **stocké** dans un champ `solde_courant` (mis à jour par trigger).

Ce n'est pas forcément une erreur (le `solde_courant` MoMo est nécessaire pour la vérification rapide avant dépôt, sans agréger les mouvements). Mais c'est une **asymétrie architecturale** qui doit être documentée et justifiée.

**Risque** : Si le trigger B2.22 a un bug, le `solde_courant` diverge de la somme réelle des mouvements. Il n'y a pas de mécanisme de réconciliation documenté.

**Action recommandée** :
1. Documenter explicitement pourquoi les soldes MoMo sont stockés (performance de la vérification pré-dépôt) alors que les soldes de caisses sont calculés.
2. Ajouter une vérification périodique ou un invariant : `solde_courant = solde_initial + SUM(mouvements FONDS_ROULEMENT_MOMO WHERE operateur_id = ?)`.
3. Ajouter un test (dans B6) qui vérifie cette cohérence après une série d'opérations.

---

## INC-09 🟡 — Schéma OpenAPI : champs `montant` ambigus selon le type de transaction

**Localisation** :
- `openapi.yaml` : Le schéma `CreerVenteTextileRequest` utilise `prix_de_vente` et `cout_achat`.
- `01_ARCHITECTURE_TECHNIQUE.md`, schéma Mermaid : Le champ `TRANSACTION.montant` est annoté `"PV pour vente, montant pour MoMo"`.

**Incohérence** : Le champ `montant` dans la table `transactions` a un **sens différent** selon le type de transaction :
- `VENTE_TEXTILE` : `montant = PV (prix_de_vente)`
- `MOMO_DEPOT` / `MOMO_RETRAIT` : `montant = montant de l'opération`
- `COMMISSION_MOMO` : `montant = montant de la commission`

Ce polymorphisme est documenté dans le commentaire Mermaid, mais pas dans un document de référence.

**Risque** : Un développeur qui écrit une requête SQL `SELECT SUM(montant) FROM transactions` obtiendra un nombre qui mélange des PV et des montants MoMo — ce n'est pas comparable.

**Action recommandée** : Documenter le mapping exact dans un tableau de référence :

| Type de transaction | `montant` représente | `cout_achat` | `benefice_net` |
|---------------------|---------------------|--------------|----------------|
| `VENTE_TEXTILE` | Prix de Vente (PV) | Coût d'Achat | PV - CA |
| `MOMO_DEPOT` | Montant du dépôt | NULL | 0 |
| `MOMO_RETRAIT` | Montant du retrait | NULL | 0 |
| `COMMISSION_MOMO` | Montant de la commission | NULL | = montant |

---

## INC-10 🟢 — Diagramme de séquence : Edge Function écrit via "SQL / Prisma"

**Localisation** :
- `01_ARCHITECTURE_TECHNIQUE.md`, diagramme C4 : `Rel(edge_functions, supabase_db, "Valide et écrit", "SQL / Prisma")`

**Incohérence** : Le projet n'utilise pas Prisma. Les Edge Functions Supabase accèdent à PostgreSQL via le client Supabase (`@supabase/supabase-js`) ou via des appels REST PostgREST. Prisma n'est mentionné nulle part ailleurs.

**Risque** : Aucun impact fonctionnel (c'est un label dans un diagramme), mais un développeur pourrait installer Prisma inutilement.

**Action recommandée** : Remplacer `"SQL / Prisma"` par `"Supabase Client / PostgREST"` dans le diagramme C4.

---

## INC-11 🟢 — Nommage `cree_le` vs `created_at`

**Localisation** :
- `00_BIBLE_PROJET.md`, section 1.3 : _"Nommage en français pour le domaine."_
- `01_ARCHITECTURE_TECHNIQUE.md`, schéma : Champs en français (`cree_le`, `modifie_le`, `corrigee`).
- `openapi.yaml` : Champs en français (`cree_le`, `modifie_le`). ✅ Cohérent.

**Observation** : La convention est cohérente — tous les noms de colonnes SQL et de champs API sont en français (domaine). Cependant, Supabase génère automatiquement certains champs en anglais (`created_at` pour les timestamps auto-générés par GoTrue). Il y aura une tension entre les champs auto-générés par Supabase (anglais) et les champs du schéma Sika Box (français).

**Risque** : Mineur. Le schéma SQL contrôlé (migrations) utilise le français. Les champs GoTrue (table `auth.users`) restent en anglais — c'est un système externe.

**Action recommandée** : Documenter cette convention explicitement : "Les tables du schéma `public` utilisent le français. Les tables du schéma `auth` (géré par Supabase GoTrue) restent en anglais. Pas de mapping."

---

## Tableau récapitulatif

| ID | Sévérité | Résumé | Documents impactés |
|----|----------|--------|--------------------|
| INC-01 | 🟡 | Version OpenAPI 1.0 vs 1.1 | doc 06 |
| INC-02 | 🔴 | Champ `commission` redondant dans le schéma TRANSACTION | doc 01, doc 04 |
| INC-03 | 🔴 | Arrondi `Math.floor` vs "Largest Remainder" — test B3.8 trompeur | doc 00, 02, 04 |
| INC-04 | 🟡 | Unité `frequence_rappel_commission` non stockée | doc 00, 04 |
| INC-05 | 🟡 | Unité `verrouillage_inactivite` non stockée | doc 00, 04 |
| INC-06 | 🟢 | ESLint `.eslintrc.cjs` déprécié — utiliser flat config | doc 04 |
| INC-07 | 🟡 | Bible v1.2 mais roadmaps référencent v1.1 | doc 04, 05 |
| INC-08 | 🟡 | Solde MoMo stocké vs solde caisses calculé — asymétrie non justifiée | doc 01, 04 |
| INC-09 | 🟡 | Champ `montant` polymorphe selon le type de transaction | doc 01, openapi |
| INC-10 | 🟢 | Référence à Prisma dans le diagramme C4 (non utilisé) | doc 01 |
| INC-11 | 🟢 | Convention français/anglais pour les noms de colonnes — à expliciter | doc 01, 02 |

**Total : 2 critiques, 6 modérées, 3 mineures.**

---

*Toutes les incohérences listées ici sont des observations factuelles basées sur le contenu des documents. Les actions recommandées sont des suggestions — la décision de correction appartient au propriétaire du projet.*
