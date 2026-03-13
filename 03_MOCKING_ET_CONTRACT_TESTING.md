# 03 — Stratégie de Mocking & Contract Testing

> Référence : `openapi.yaml` v1.0 · Architecture : `01_ARCHITECTURE_TECHNIQUE.md`

---

## 1. Mocking avec Prism (Stoplight)

[Prism](https://github.com/stoplightio/prism) génère un serveur mock complet à partir de `openapi.yaml`, sans code backend.

### Installation

```bash
pnpm add -D @stoplight/prism-cli
```

### Démarrage du serveur mock

```bash
# Serveur mock statique (réponses basées sur les examples du YAML)
npx prism mock openapi.yaml --port 4010

# Serveur mock dynamique (réponses générées à partir des schemas)
npx prism mock openapi.yaml --port 4010 --dynamic
```

### Script dans `package.json` (racine monorepo)

```json
{
  "scripts": {
    "mock:api": "prism mock openapi.yaml --port 4010 --dynamic",
    "mock:api:static": "prism mock openapi.yaml --port 4010"
  }
}
```

### Usage dans le développement

| Contexte | Commande | Port | Quand l'utiliser |
|---|---|---|---|
| Dev frontend (sans Supabase) | `pnpm mock:api` | `4010` | Développement composants UI, prototypage |
| Dev frontend (avec Supabase local) | `supabase start` | `54321` | Intégration réelle, tests E2E |
| CI Pipeline | `pnpm mock:api` (background) | `4010` | Tests d'intégration légers |

### Configuration Vite (proxy vers Prism)

```typescript
// packages/frontend/vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/rest': 'http://localhost:4010',
      '/auth': 'http://localhost:4010',
      '/functions': 'http://localhost:4010',
    },
  },
});
```

### Validation des requêtes

Prism valide automatiquement les requêtes et réponses contre le schéma OpenAPI.
Une requête non conforme retourne une `422` avec les détails de la violation.

```bash
# Exemple : requête invalide (PV manquant)
curl -X POST http://localhost:4010/rest/v1/transactions/vente-textile \
  -H "Authorization: Bearer fake-jwt" \
  -H "Content-Type: application/json" \
  -d '{"cout_achat": 10000}'

# → 422 : "prix_de_vente" is required
```

---

## 2. ~~Contract Testing avec Pact~~ — RETIRÉ (ADR-007)

> ⚠️ **Décision rétrospective (mars 2026)** : Pact a été retiré de la stack de test suite à la recommandation REC-04 de la contre-expertise.
>
> **Justification** : Pact est conçu pour les équipes avec des APIs maintenues par des équipes séparées. Pour un développeur solo qui contrôle le frontend ET le backend (Supabase), Pact est surdimensionné. La conformité contractuelle est déjà assurée par :
>
> | Outil | Rôle |
> |-------|------|
> | **Prism** (section 1) | Mock server qui valide les réponses contre `openapi.yaml` |
> | **MSW** | Mock au niveau réseau pour les tests unitaires React (TanStack Query) |
> | **Playwright** | Tests E2E contre Supabase local (`supabase start`) |
>
> Les tâches liées à Pact dans les roadmaps sont supprimées. Le pipeline CI ne contient pas d'étape `test:contract`.
>
> **Référence** : `retrospective/02_RECOMMANDATIONS.md`, REC-04.

---

## 3. Référence des Codes d'Erreur

Récapitulatif des codes d'erreur machine-readable définis dans `openapi.yaml` :

| Code | HTTP | Contexte | Description |
|---|---|---|---|
| `VENTE_A_PERTE` | 422 | Vente Textile | PV < CA |
| `MONTANT_INVALIDE` | 422 | Toute transaction | Montant ≤ 0 ou non-entier |
| `FONDS_INSUFFISANT` | 422 | Dépôt MoMo | Fonds de Roulement < montant dépôt |
| `FENETRE_EXPIREE` | 403 | Correction | Correction après les 10 minutes |
| `ACCES_INTERDIT` | 403 | Toute route | Rôle insuffisant |
| `SESSION_EXPIREE` | 401 | Toute route | JWT absent/expiré |
| `CONFLIT_SYNC` | 409 | Sync Push | Conflit de version détecté |
| `RATIOS_INVALIDES` | 422 | Admin | Somme des ratios ≠ 100% |
| `ERREUR_INTERNE` | 500 | Toute route | Erreur serveur non gérée |

---

> **Version** : 1.0  
> **Dernière mise à jour** : Phase 4 — Contrat API
