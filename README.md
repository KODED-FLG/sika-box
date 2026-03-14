# Sika Box

> Application PWA de gestion financière pour petites entreprises en Afrique de l'Ouest — cash, Mobile Money et ventes textile — conçue pour fonctionner hors-ligne.

## Le problème

Les petites entreprises du secteur informel gèrent simultanément plusieurs caisses physiques (FCFA), des opérations Mobile Money (Orange, MTN, Moov) et des ventes de textile. Les outils existants ne couvrent pas ces trois axes, ni le fonctionnement hors-ligne indispensable dans les zones à connectivité instable.

## La solution

**Sika Box** est une PWA mono-utilisateur (1 admin, 1 gestionnaire) qui centralise :

- **4 caisses** : Grande Caisse, Petite Caisse, Caisse MoMo, Caisse Textile
- **3 opérateurs MoMo** : Orange Money, MTN MoMo, Moov Money (dépôts, retraits, commissions)
- **Ventes textile** : avec répartition automatique (60 % Grande Caisse / 40 % investissement)
- **Tableau de bord** : soldes temps réel, transactions récentes, alertes
- **Mode offline-first** : fonctionne sans connexion, synchronise au retour du réseau

## Stack technique

| Couche | Technologie |
|---|---|
| Monorepo | Turborepo + pnpm workspaces |
| Module partagé | `@sikabox/core` — Zod schemas, logique métier pure |
| Frontend | React 18 · Vite 5 · TypeScript 5 strict · Tailwind 3 · shadcn/ui |
| État local | Dexie.js 4 (IndexedDB) · Zustand 4 (UI state) |
| Data fetching | TanStack Query 5 |
| Formulaires | React Hook Form + Zod |
| Backend (BaaS) | Supabase Cloud — GoTrue (auth) · PostgreSQL 15+ (RLS) · PostgREST · Edge Functions (Deno) |
| Monitoring | Sentry |
| CI/CD | GitHub Actions |

## Structure du projet

```
sika-box/
├── packages/
│   └── core/               # @sikabox/core — schemas Zod, logique métier, types partagés
├── frontend/                # PWA React (Vite)
├── supabase/
│   ├── migrations/          # Fichiers SQL versionnés
│   ├── functions/           # Edge Functions (Deno/TypeScript)
│   └── seed.sql             # Données initiales
├── openapi.yaml             # Contrat API — source de vérité absolue
└── docs/                    # Documentation projet (00–06)
```

## Documentation

| # | Document | Description |
|---|---|---|
| 00 | `00_BIBLE_PROJET.md` | Bible du projet — vision, règles métier, 11 épics |
| 01 | `01_ARCHITECTURE_TECHNIQUE.md` | Architecture technique détaillée |
| 02 | `02_NORMES_OPERATIONNELLES.md` | Normes de dev, conventions, CI/CD |
| 03 | `03_MOCKING_ET_CONTRACT_TESTING.md` | Stratégie de mocking et contract testing |
| 04 | `04_ROADMAP_BACKEND.md` | Roadmap backend — 108 tâches en 6 phases |
| 05 | `05_ROADMAP_FRONTEND.md` | Roadmap frontend — 139 tâches en 6 phases |
| 06 | `06_PLAN_GENERAL.md` | Plan général — 247 tâches, 11 jalons, matrice épics |
| — | `openapi.yaml` | Spécification OpenAPI 3.1 complète |

## Démarrage rapide

### Prérequis

- Node.js ≥ 18
- pnpm ≥ 8
- Supabase CLI
- Docker (pour Supabase local)

### Installation

```bash
# Cloner le repo
git clone https://github.com/esdrasgbedozin/sika-box.git
cd sika-box

# Installer les dépendances
pnpm install

# Démarrer Supabase local
supabase start

# Appliquer les migrations + seed
supabase db reset

# Lancer le frontend
pnpm --filter frontend dev
```

## Conventions

- **Monnaie** : FCFA — entiers uniquement, jamais de décimaux
- **Langue du code** : anglais (variables, fonctions, commits)
- **Langue métier** : français (UI, documentation)
- **Commits** : Conventional Commits (`feat:`, `fix:`, `docs:`, `test:`, `chore:`)
- **Branche principale** : `develop` → `main` (release)

## Licence

Projet privé — tous droits réservés.