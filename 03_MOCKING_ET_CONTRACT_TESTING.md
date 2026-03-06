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

## 2. Contract Testing avec Pact

[Pact](https://pact.io/) garantit que le contrat entre le frontend (consumer) et le backend (provider) reste synchronisé.

### Stratégie

```
┌──────────────────┐        ┌───────────────────┐
│   Consumer        │        │   Provider         │
│   (React PWA)     │───────▶│   (Supabase +      │
│                   │ Pact   │    Edge Functions)  │
│   Génère les      │ File   │                    │
│   contrats        │        │   Vérifie les      │
│                   │        │   contrats          │
└──────────────────┘        └───────────────────┘
```

### Workflow

1. **Consumer-Side** : Le frontend écrit des **Pact Tests** qui décrivent les interactions attendues avec l'API.
2. **Pact File** : Un fichier `.json` est généré, décrivant chaque interaction (requête → réponse attendue).
3. **Provider-Side** : Le backend vérifie que ses réponses réelles correspondent au contrat Pact.

### Installation

```bash
# Consumer (frontend)
cd packages/frontend
pnpm add -D @pact-foundation/pact

# Provider (supabase edge functions — si vérification locale)
cd packages/supabase
pnpm add -D @pact-foundation/pact
```

### Exemple — Test Consumer (Vente Textile)

```typescript
// packages/frontend/src/api/__tests__/vente-textile.pact.ts
import { PactV4, MatchersV3 } from '@pact-foundation/pact';
import { venteTextileApi } from '../vente-textile.api';

const { like, integer, uuid, iso8601DateTimeWithMillis } = MatchersV3;

const provider = new PactV4({
  consumer: 'SikaBox-Frontend',
  provider: 'SikaBox-API',
});

describe('API Vente Textile — Contract', () => {
  it('créer une vente textile valide', async () => {
    await provider
      .addInteraction()
      .given('la Gestionnaire est connectée')
      .given('les Variables Globales sont à leur valeur par défaut')
      .uponReceiving('une vente textile valide')
      .withRequest('POST', '/rest/v1/transactions/vente-textile', (builder) => {
        builder
          .headers({ Authorization: like('Bearer jwt-token') })
          .jsonBody({
            prix_de_vente: integer(15000),
            cout_achat: integer(10000),
            designation: like('Guipure bleue brodée'),
          });
      })
      .willRespondWith(201, (builder) => {
        builder.jsonBody({
          id: uuid(),
          type: 'VENTE_TEXTILE',
          montant: integer(15000),
          cout_achat: integer(10000),
          benefice_net: integer(5000),
          designation: like('Guipure bleue brodée'),
          corrigee: false,
          synchronisee: false,
          cree_le: iso8601DateTimeWithMillis(),
          fenetre_expiration: iso8601DateTimeWithMillis(),
          fenetre_active: true,
          ventilation: [
            {
              id: uuid(),
              caisse: 'STOCK',
              montant: integer(10000),
            },
            {
              id: uuid(),
              caisse: 'SALAIRE',
              montant: integer(2500),
            },
            {
              id: uuid(),
              caisse: 'REMBOURSEMENT',
              montant: integer(1500),
            },
            {
              id: uuid(),
              caisse: 'RESERVE',
              montant: integer(1000),
            },
          ],
        });
      })
      .executeTest(async (mockServer) => {
        const result = await venteTextileApi.creer(
          { prix_de_vente: 15000, cout_achat: 10000, designation: 'Guipure bleue brodée' },
          { baseUrl: mockServer.url }
        );
        expect(result.type).toBe('VENTE_TEXTILE');
        expect(result.benefice_net).toBe(5000);
        expect(result.ventilation).toHaveLength(4);
      });
  });

  it('rejette une vente à perte', async () => {
    await provider
      .addInteraction()
      .given('la Gestionnaire est connectée')
      .uponReceiving('une vente textile à perte (PV < CA)')
      .withRequest('POST', '/rest/v1/transactions/vente-textile', (builder) => {
        builder
          .headers({ Authorization: like('Bearer jwt-token') })
          .jsonBody({
            prix_de_vente: integer(8000),
            cout_achat: integer(10000),
            designation: like('Article test'),
          });
      })
      .willRespondWith(422, (builder) => {
        builder.jsonBody({
          type: like('https://sikabox.app/erreurs/validation/vente-a-perte'),
          title: like('Vente à perte non autorisée'),
          status: 422,
          detail: like('Le Prix de Vente est inférieur au Coût d\'Achat.'),
          extensions: {
            code: 'VENTE_A_PERTE',
          },
        });
      })
      .executeTest(async (mockServer) => {
        await expect(
          venteTextileApi.creer(
            { prix_de_vente: 8000, cout_achat: 10000, designation: 'Article test' },
            { baseUrl: mockServer.url }
          )
        ).rejects.toThrow();
      });
  });
});
```

### Script CI

```json
{
  "scripts": {
    "test:contract": "vitest run --config vitest.pact.config.ts",
    "test:contract:publish": "pact-broker publish pacts/ --consumer-app-version $(git rev-parse --short HEAD)"
  }
}
```

### Intégration dans le Pipeline CI

```yaml
# .github/workflows/ci.yml (extrait)
contract-tests:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: pnpm/action-setup@v4
    - run: pnpm install --frozen-lockfile
    - run: pnpm --filter frontend test:contract
    - uses: actions/upload-artifact@v4
      with:
        name: pact-files
        path: packages/frontend/pacts/
```

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
