# 06 — Plan Général (Master Plan)

> Rôle : Technical PM & Scrum Master  
> Sources : `04_ROADMAP_BACKEND.md` (103 tâches) · `05_ROADMAP_FRONTEND.md` (139 tâches) · `openapi.yaml` v1.1  
> Total : **242 tâches** · Exécution par IA assistée

---

## Vue d'ensemble

```
                         MASTER PLAN — SIKA BOX V1
═══════════════════════════════════════════════════════════════════

  BACKEND (103 tâches)                   FRONTEND (139 tâches)
  ──────────────────                     ────────────────────
  ┌─────────────┐                        ┌──────────────┐
  │  B1 Setup   │────────────────────────│   F1 Setup   │
  │  (7 tâches) │    Monorepo partagé    │  (13 tâches) │
  └──────┬──────┘                        └──────┬───────┘
         │                                      │
  ┌──────▼──────┐                        ┌──────▼───────┐
  │  B2 BDD     │                        │  F2 Routing  │
  │ (27 tâches) │                        │  (8 tâches)  │
  └──────┬──────┘                        └──────┬───────┘
         │                                      │
  ┌──────▼──────┐                        ┌──────▼───────┐
  │  B3 Tests   │                        │  F3 UI Dumb  │ ← Prism
  │ (25 tâches) │                        │ (45 tâches)  │   Mock
  └──────┬──────┘                        └──────┬───────┘   Server
         │                                      │
  ┌──────▼──────┐                        ┌──────▼───────┐
  │  B4 Logic   │                        │  F4 API Smart│ ← Prism
  │ (14 tâches) │                        │ (45 tâches)  │   Mock
  └──────┬──────┘                        └──────┬───────┘
         │                                      │
  ┌──────▼──────┐                               │
  │  B5 Endpts  │                               │
  │ (22 tâches) │                               │
  └──────┬──────┘                               │
         │              ┌──────────────┐        │
         │              │ 🔗 SYNC PT 1 │        │
         └──────────────│  Front ↔ Back│────────┘
                        │  (Supabase)  │
                        └──────┬───────┘
                               │
  ┌──────────────┐      ┌──────▼───────┐
  │  B6 E2E Back │      │  F5 Offline  │
  │  (8 tâches)  │      │ (21 tâches)  │
  └──────────────┘      └──────┬───────┘
                               │
                        ┌──────▼───────┐
                        │  F6 E2E Front│
                        │  (7 tâches)  │
                        └──────┬───────┘
                               │
                        ┌──────▼───────┐
                        │ 🔗 SYNC PT 2 │
                        │  E2E Full    │
                        │  Stack       │
                        └──────┬───────┘
                               │
                          ✅ V1 RELEASE
```

---

## Jalons Majeurs (Milestones)

| # | Jalon | Tâches | Critère de complétion | Dépend de |
|---|---|---|---|---|
| **M0** | 🏁 Monorepo opérationnel | B1.1–B1.7, F1.1 | `pnpm install && turbo build` passe. CI verte. Supabase local démarre. | — |
| **M1** | 📦 BDD complète | B2.1–B2.27 | `supabase db reset` passe. Toutes les tables créées + RLS + triggers + fonctions SQL (tableau_de_bord, rappel_commission) + seed. | M0 |
| **M2** | 🧪 Tests `@sikabox/core` écrits (ROUGE) | B3.1–B3.25 | 25 tests écrits, tous ROUGES. 0% passage. Contrat comportemental défini. | M0 |
| **M3** | ✅ `@sikabox/core` fonctionnel (VERT) | B4.1–B4.14 | 25 tests VERTS. Coverage ≥ 90%. `pnpm --filter core test` passe. | M2 |
| **M4** | 🎨 Frontend mockable | F1.1–F1.13, F2.1–F2.8 | PWA démarre, routes fonctionnelles (incl. admin/gestionnaire, admin/operateurs-momo, changer-mot-de-passe), Prism sert le mock. React Hook Form + Zod configurés. Login factice fonctionne. | M0 |
| **M5** | 🧩 Composants UI complets | F3.1–F3.45 | 45 composants testés en isolation (incl. FormulaireCreationGestionnaire, ConfigOperateurMomoCard, AperçuBeneficeNet, Toast, SkeletonLoader, EmptyState, FormulaireChangementMotDePasse). 100% des composants dumb prêts. | M4 |
| **M6** | 🔌 Frontend connecté (Mock) | F4.1–F4.45 | Toutes les pages connectées à Prism (incl. gestion gestionnaire, config opérateurs MoMo, changement MDP, verrouillage inactivité). Flux complets testables sur le mock. | M5, F1.6 |
| **M7** | 🚀 Backend API opérationnel | B5.1–B5.22, B6.1–B6.8 | Edge Functions + RPC déployées (incl. configurer_operateur_momo). Tests E2E backend passent sur Supabase local. | M1, M3 |
| **M8** | 🔗 **SYNC POINT 1** — Intégration Front ↔ Back | — | Frontend bascule de Prism vers Supabase local. Flux de bout en bout fonctionnel. | M6, M7 |
| **M9** | 📱 Mode Offline complet | F5.1–F5.21 | IndexedDB, sync queue, auto-sync, Service Worker. Tests offline passent. | M8 |
| **M10** | 🧪 **SYNC POINT 2** — Tests E2E Full Stack | F6.1–F6.7 | Playwright tests passent sur Supabase local. Y compris test offline. | M9 |
| **M11** | 🎉 **V1 RELEASE** | — | Déployé sur Vercel + Supabase Cloud. 2 comptes créés (Admin + Gestionnaire). App installable sur mobile. | M10 |

---

## Points de Synchronisation — Détail

### 🔗 SYNC POINT 1 — Basculer le Frontend sur le vrai Backend

**Quand** : Jalon M8 — quand M6 (frontend complet sur mock) ET M7 (backend opérationnel) sont atteints.

**Actions** :

| # | Action | Responsable | Durée estimée |
|---|---|---|---|
| SP1.1 | Modifier `vite.config.ts` : proxy vers `localhost:54321` au lieu de `4010` | Frontend | 15 min |
| SP1.2 | Remplacer les tokens JWT factices par de vrais tokens Supabase GoTrue | Frontend | 30 min |
| SP1.3 | Configurer les variables d'environnement (`.env.local`) | Frontend | 15 min |
| SP1.4 | Adapter les handlers MSW si les réponses Supabase diffèrent légèrement du mock | Frontend | 1h |
| SP1.5 | Valider les 7 parcours critiques sur Supabase local (test exploratoire) | Full Stack | 2h |
| SP1.6 | Corriger les bugs d'intégration découverts (budget : 5 bugs max) | Full Stack | 3h |

**Critère de réussite** : Les mêmes parcours qui passaient sur Prism passent sur Supabase local.

### 🔗 SYNC POINT 2 — Validation E2E Full Stack

**Quand** : Jalon M10 — après M9 (offline complet).

**Actions** :

| # | Action | Responsable | Durée estimée |
|---|---|---|---|
| SP2.1 | Exécuter la suite Playwright complète contre Supabase local | QA | 1h |
| SP2.2 | Valider le scénario offline → online → sync | QA | 1h |
| SP2.3 | Test de performance : 100 transactions → tableau de bord rapide (< 2s) | QA | 1h |
| SP2.4 | Test d'installation PWA sur mobile réel (Android + iOS Safari) | QA | 2h |
| SP2.5 | Rapport des bugs critiques restants | QA | 30 min |

---

## Parallélisme

Le Backend et le Frontend peuvent avancer **en parallèle** grâce au contrat API (`openapi.yaml`) :

```
Semaine 1-2    │  B1 Setup + B2 BDD          ║  F1 Setup + F2 Routing
               │  (en séquence)               ║  (en séquence)
───────────────┼───────────────────────────────╬─────────────────────────
Semaine 3-4    │  B3 Tests ROUGES             ║  F3 Composants UI
               │  B4 Implémentation VERTE     ║  (dumb, testés isolation)
───────────────┼───────────────────────────────╬─────────────────────────
Semaine 5-6    │  B5 Edge Functions            ║  F4 Intégration API
               │  B6 Tests E2E Backend         ║  (connecté à Prism mock)
───────────────┼───────────────────────────────╬─────────────────────────
Semaine 7      │          🔗 SYNC POINT 1 — Front ↔ Back
───────────────┼───────────────────────────────────────────────────────
Semaine 8      │                               ║  F5 Mode Offline
───────────────┼───────────────────────────────╬─────────────────────────
Semaine 9      │          🔗 SYNC POINT 2 — Tests E2E Full Stack
───────────────┼───────────────────────────────────────────────────────
Semaine 10     │          🎉 V1 RELEASE — Déploiement Prod
```

> ⚠️ Les estimations de semaines sont indicatives pour un développeur humain.
> Avec une IA assistée, le rythme peut être significativement plus rapide.

---

## Risques identifiés

| # | Risque | Impact | Mitigation |
|---|---|---|---|
| R1 | Divergence mock Prism vs. réponses Supabase réelles | M8 bloqué | Contract tests Pact (Phase 4). Valider tôt. |
| R2 | Complexité RLS + triggers PostgreSQL | Bugs subtils en B2 | Tests SQL unitaires pour chaque politique RLS (B2.11–B2.17). |
| R3 | IndexedDB quotas sur mobile | Données perdues offline | Limiter le cache local aux 30 derniers jours. Afficher un warning si quota > 80%. |
| R4 | Arrondis FCFA (entiers) dans la répartition | Incohérences comptables | Tests B3.7 + B3.8 : "largest remainder" algorithme (B4.6). |
| R5 | Conflit de sync (même transaction modifiée offline par 2 appareils) | Données incohérentes | Out of scope V1 (appareils séparés Admin/Gestionnaire), mais implémenter `CONFLIT_SYNC` pour le futur. |

---

## Matrice Tâches vs Épics de la Bible

| Épic (Bible) | Tâches Backend | Tâches Frontend | Total |
|---|---|---|---|
| E1 — Authentification | B2.2, B2.12, B2.24 | F2.2–F2.5, F3.29–F3.30, F3.44–F3.45, F4.21–F4.22, F4.41–F4.45, F5.1–F5.2 | 20 |
| E2 — Configuration Admin | B2.3–B2.4, B2.15, B2.23, B2.25–B2.27, B5.21–B5.22 | F3.21–F3.22, F3.33–F3.38, F4.13–F4.20, F4.31–F4.36 | 27 |
| E3 — Vente Textile | B2.7, B2.19–B2.20, B3.3–B3.13, B4.4–B4.7, B5.11–B5.12 | F3.9–F3.14, F3.31–F3.32, F3.39–F3.40, F4.5–F4.6, F4.25–F4.26 | 30 |
| E4 — Opérations MoMo | B2.5–B2.6, B2.21–B2.22, B2.26, B3.14–B3.17, B4.8–B4.9, B5.13–B5.16 | F3.5–F3.8, F3.15–F3.18, F4.7–F4.10, F4.27–F4.28 | 27 |
| E5 — Répartition Automatique | B3.3–B3.8, B4.4–B4.6 | F3.11–F3.12 | 10 |
| E6 — Tableau de Bord | B2.8, B2.10, B2.25 | F3.1–F3.4, F3.42–F3.43, F4.23–F4.24 | 11 |
| E7 — Historique | B2.13 | F3.9–F3.10, F4.29–F4.30 | 5 |
| E8 — Reporting | B3.24–B3.25, B4.13, B5.9–B5.10 | F4.39–F4.40 | 7 |
| E9 — Sync Offline | B5.4–B5.8 | F5.5–F5.21 | 22 |
| E10 — PWA | — | F1.11, F5.19–F5.21 | 4 |
| E11 — Correction | B2.18, B3.18–B3.20, B4.11–B4.12, B5.17–B5.20 | F3.19–F3.20, F4.11–F4.12 | 12 |
| Transversal (Setup, CI, UX, Tests E2E) | B1.1–B1.7, B6.1–B6.8 | F1.1–F1.13, F2.1–F2.8, F3.41, F6.1–F6.7 | 45 |

---

## Checklist de Release V1

- [ ] **M0** — Monorepo opérationnel
- [ ] **M1** — BDD complète (migrations + RLS + triggers + seed)
- [ ] **M2** — Tests `@sikabox/core` ROUGES
- [ ] **M3** — `@sikabox/core` VERT (coverage ≥ 90%)
- [ ] **M4** — Frontend mockable
- [ ] **M5** — Composants UI complets
- [ ] **M6** — Frontend connecté au Mock
- [ ] **M7** — Backend API opérationnel
- [ ] **M8** — 🔗 SYNC POINT 1 (Front ↔ Back)
- [ ] **M9** — Mode Offline complet
- [ ] **M10** — 🔗 SYNC POINT 2 (E2E Full Stack)
- [ ] **M11** — 🎉 V1 RELEASE

---

> **Version** : 1.0  
> **Dernière mise à jour** : Phase 5 — Plan Général
