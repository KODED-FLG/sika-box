# 02 — NORMES OPÉRATIONNELLES : SIKA BOX

> **Version** : 1.0  
> **Date** : 06 mars 2026  
> **Auteur** : Lead Developer & QA Lead (IA)  
> **Documents de référence** : [00_BIBLE_PROJET.md](00_BIBLE_PROJET.md), [01_ARCHITECTURE_TECHNIQUE.md](01_ARCHITECTURE_TECHNIQUE.md)  
> **Statut** : Proposition — en attente de validation

---

## Table des matières

1. [Principes de Développement (The Golden Rules)](#1-principes-de-développement-the-golden-rules)
2. [Stratégie de Test (TDD Workflow)](#2-stratégie-de-test-tdd-workflow)
3. [Gestion des Erreurs & Logs](#3-gestion-des-erreurs--logs)
4. [Git Flow & Conventional Commits](#4-git-flow--conventional-commits)
5. [Fichier de Contexte IA (.github/copilot-instructions.md)](#5-fichier-de-contexte-ia)

---

## 1. Principes de Développement (The Golden Rules)

### 1.1 Principes SOLID — Appliqués à l'architecture Sika Box

> Rappel : Le langage est **TypeScript** sur l'ensemble du monorepo (`@sikabox/core`, `frontend`, `supabase/functions`).

#### S — Single Responsibility Principle (SRP)

**Règle** : Chaque module, classe ou fonction n'a qu'**une seule raison de changer**. Dans le contexte Sika Box, cela signifie que la logique de répartition financière, la persistance des données, et la présentation UI sont dans des couches strictement séparées.

**Exemple concret — `@sikabox/core`** :

```typescript
// ❌ VIOLATION : une seule fonction fait la validation ET la répartition ET la persistance
function enregistrerVente(pv: number, ca: number, designation: string) {
  if (pv < ca) throw new Error("Vente à perte");
  const benefice = pv - ca;
  const salaire = Math.floor(benefice * 0.5);
  const remboursement = Math.floor(benefice * 0.3);
  const reserve = benefice - salaire - remboursement;
  db.transactions.add({ pv, ca, designation, benefice });
  db.caisses.update("STOCK", { solde: db.caisses.get("STOCK").solde + ca });
  // ... etc.
}
```

```typescript
// ✅ CORRECT : chaque fonction a une seule responsabilité

// --- packages/core/src/validation.ts ---
// Responsabilité : valider les données d'entrée d'une vente
export function validerVenteTextile(pv: number, ca: number): ResultatValidation {
  const erreurs: string[] = [];
  if (pv <= 0) erreurs.push("Le Prix de Vente doit être > 0");
  if (ca <= 0) erreurs.push("Le Coût d'Achat doit être > 0");
  if (pv < ca) erreurs.push("Le Prix de Vente doit être ≥ au Coût d'Achat");
  return { valide: erreurs.length === 0, erreurs };
}

// --- packages/core/src/repartition.ts ---
// Responsabilité : calculer la ventilation du bénéfice net
export function calculerRepartition(
  beneficeNet: number,
  ratios: Ratios,
  soldeRemboursement: number,
  plafondCapital: number,
  ratiosPostPlafond: RatiosPostPlafond
): ResultatRepartition {
  // Logique pure de calcul — aucun effet de bord
  // ...
}

// --- packages/frontend/src/db/transactions.repository.ts ---
// Responsabilité : persister les données dans IndexedDB
export class TransactionRepository {
  async creer(transaction: NouvelleTransaction): Promise<Transaction> {
    // Écriture dans Dexie.js — aucune logique métier
    // ...
  }
}
```

#### O — Open/Closed Principle (OCP)

**Règle** : Les modules sont **ouverts à l'extension**, **fermés à la modification**. Le Moteur de Répartition accepte des Ratios en paramètre — il n'a pas besoin d'être modifié quand l'Admin change les ratios ou quand le système bascule en mode post-Plafond.

**Application** : La fonction `calculerRepartition()` reçoit les ratios en argument. Elle ne fait aucune hypothèse sur leur valeur. L'ajout d'un nouveau mode de répartition (ex: V2 avec un 4ème ratio) n'impacte que les appelants, pas le moteur.

#### L — Liskov Substitution Principle (LSP)

**Règle** : Les sous-types doivent être substituables à leurs types de base. Dans Sika Box, tous les types de transaction (`VenteTextile`, `MomoDepot`, `MomoRetrait`, `CommissionMomo`) implémentent une interface commune `Transaction`. Le code qui itère sur les transactions n'a pas besoin de connaître le type spécifique.

#### I — Interface Segregation Principle (ISP)

**Règle** : Aucun module ne doit dépendre d'interfaces qu'il n'utilise pas. La Gestionnaire et l'Admin ont des interfaces d'accès aux données différentes :

```typescript
// Interface pour les opérations Gestionnaire (restreinte)
interface GestionnaireRepository {
  creerTransaction(tx: NouvelleTransaction): Promise<Transaction>;
  lireMesTransactions(): Promise<Transaction[]>;
  lireSoldesCaisses(): Promise<SoldeCaisse[]>;
  corrigerTransaction(id: string, correction: CorrectionTransaction): Promise<Transaction>;
}

// Interface pour les opérations Admin (étendue)
interface AdminRepository extends GestionnaireRepository {
  lireToutesLesTransactions(): Promise<Transaction[]>;
  modifierVariableGlobale(cle: string, valeur: number): Promise<void>;
  genererRapportTrimestriel(trimestre: Trimestre): Promise<Rapport>;
  lireJournalAudit(): Promise<EntreeAudit[]>;
}
```

#### D — Dependency Inversion Principle (DIP)

**Règle** : Les modules de haut niveau (logique métier) ne dépendent pas des modules de bas niveau (base de données). Les deux dépendent d'**abstractions** (interfaces).

**Exemple concret** — Le service de transaction dépend d'une interface `ITransactionRepository`, pas de l'implémentation Dexie.js ou Supabase :

```typescript
// --- packages/core/src/types.ts ---
// Abstraction : interface de persistence (aucune dépendance à Dexie, Supabase, etc.)
export interface ITransactionRepository {
  creer(transaction: NouvelleTransaction): Promise<Transaction>;
  lireParId(id: string): Promise<Transaction | null>;
  mettreAJour(id: string, patch: Partial<Transaction>): Promise<Transaction>;
}

export interface ICaisseRepository {
  lireSolde(caisse: TypeCaisse, operateurId?: string): Promise<number>;
  ajouterMouvement(mouvement: NouveauMouvement): Promise<void>;
}

// --- packages/frontend/src/db/dexie-transaction.repository.ts ---
// Implémentation concrète pour le mode Offline (IndexedDB via Dexie.js)
export class DexieTransactionRepository implements ITransactionRepository {
  constructor(private db: SikaBoxDatabase) {}

  async creer(transaction: NouvelleTransaction): Promise<Transaction> {
    const id = crypto.randomUUID();
    const tx: Transaction = { ...transaction, id, synchronisee: false, cree_le: new Date() };
    await this.db.transactions.add(tx);
    return tx;
  }
  // ...
}

// --- packages/supabase/functions/sync/supabase-transaction.repository.ts ---
// Implémentation concrète pour le mode Cloud (Supabase PostgreSQL)
export class SupabaseTransactionRepository implements ITransactionRepository {
  constructor(private supabase: SupabaseClient) {}

  async creer(transaction: NouvelleTransaction): Promise<Transaction> {
    const { data, error } = await this.supabase
      .from('transactions')
      .insert(transaction)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
  // ...
}
```

**Avantage critique pour Sika Box** : Le même code métier (`calculerRepartition`) fonctionne avec Dexie.js (offline) et Supabase (sync) sans modification. On peut aussi injecter un `MockTransactionRepository` pour les tests.

### 1.2 Design Patterns imposés

| Pattern | Où l'appliquer | Pourquoi |
|---------|---------------|----------|
| **Repository** | Accès aux données (IndexedDB, Supabase) | Abstrait la couche de persistance. Permet de basculer entre Dexie.js (offline) et Supabase (online) de manière transparente. Un repository par agrégat : `TransactionRepository`, `CaisseRepository`, `VariableGlobaleRepository`. |
| **Strategy** | Moteur de Répartition | Deux stratégies de répartition : `RepartitionAvantPlafond` (3 ratios) et `RepartitionApresPlafond` (2 ratios fixes). Le moteur sélectionne la stratégie dynamiquement en fonction du solde de la Caisse Remboursement vs le Plafond de Capital. |
| **Factory Function** | Création de transactions | Fonctions factory `creerVenteTextile()`, `creerOperationMomo()`, `creerCommissionMomo()` qui encapsulent la validation + la construction de l'objet Transaction complet (avec `id`, `cree_le`, `fenetre_expiration`, `synchronisee`, etc.). |
| **Observer / Event Emitter** | Synchronisation, mise à jour des soldes | Le `SyncEngine` émet des événements (`sync:start`, `sync:complete`, `sync:error`) auxquels le UI souscrit pour afficher l'indicateur de statut réseau. Les soldes de caisses sont recalculés automatiquement à chaque nouveau mouvement via un abonnement réactif (Zustand `subscribe`). |
| **Result / Either** | Retour de fonctions métier | Pas d'exceptions pour les erreurs métier prévisibles (vente à perte, fonds insuffisant). Utiliser un type `Result<T, E>` qui encapsule soit la valeur (`ok`), soit l'erreur (`err`). Les exceptions sont réservées aux erreurs techniques (réseau, BDD). |

**Exemple du pattern Result** :

```typescript
// --- packages/core/src/result.ts ---
export type Result<T, E = string> =
  | { ok: true; value: T }
  | { ok: false; error: E };

export const Ok = <T>(value: T): Result<T, never> => ({ ok: true, value });
export const Err = <E>(error: E): Result<never, E> => ({ ok: false, error });

// --- Utilisation ---
export function validerEtCalculerVente(
  pv: number,
  ca: number,
  ratios: Ratios,
  contexte: ContexteRepartition
): Result<ResultatVente, ErreurVente> {
  if (pv < ca) return Err({ code: "VENTE_A_PERTE", message: "PV doit être ≥ CA" });
  if (pv <= 0) return Err({ code: "PV_INVALIDE", message: "PV doit être > 0" });

  const repartition = calculerRepartition(pv - ca, ratios, contexte);
  return Ok({ beneficeNet: pv - ca, repartition });
}
```

### 1.3 Règles de code non négociables

| Règle | Description |
|-------|-------------|
| **Pas de `any`** | TypeScript `strict: true` dans tous les `tsconfig.json`. Le type `any` est interdit (ESLint rule `@typescript-eslint/no-explicit-any: error`). |
| **Pas de nombres flottants pour FCFA** | Tout montant financier est un `number` entier (JavaScript n'a pas d'`int`, mais on utilise `Math.floor()` systématiquement et des assertions). |
| **Fonctions pures dans `@sikabox/core`** | Aucun import de `dexie`, `@supabase/supabase-js`, `react`, ou tout module avec effet de bord. Zéro `fetch`, `console.log`, `Date.now()` — les dépendances temporelles sont injectées. |
| **Pas de `DELETE` SQL** | Aucune opération `DELETE` dans le code applicatif. Les données financières sont immutables (append-only). |
| **Pas de valeurs magiques** | Tous les seuils (10 minutes, ratios par défaut, plafond) sont définis dans `@sikabox/core/src/constants.ts` ou lus depuis les Variables Globales. |
| **Nommage en français pour le domaine** | Les termes du Dictionnaire du Domaine (Bible §3) sont utilisés dans le code : `caisseSalaire`, `beneficeNet`, `plafondCapital`, `fenêtreCorrection`. Les termes techniques (framework, infra) restent en anglais : `repository`, `sync`, `middleware`. |

---

## 2. Stratégie de Test (TDD Workflow)

### 2.1 Stack de test

| Outil | Rôle | Justification |
|-------|------|---------------|
| **Vitest** | Runner de tests unitaires & d'intégration | Natif Vite (même pipeline de build). API compatible Jest. Support TypeScript natif sans config supplémentaire. Rapide (exécution parallèle). |
| **React Testing Library** | Tests de composants React | Teste le comportement utilisateur, pas l'implémentation. Conforme à la philosophie « test what the user sees ». |
| **MSW (Mock Service Worker)** | Mock des appels réseau (Supabase API) | Intercepte les requêtes HTTP au niveau du Service Worker. Les tests d'intégration front ↔ API utilisent de vrais appels HTTP interceptés, pas des mocks de modules. |
| **fake-indexeddb** | Mock d'IndexedDB en Node.js | Permet de tester les repositories Dexie.js dans un environnement Node (où IndexedDB n'existe pas nativement). |
| **Playwright** | Tests E2E (end-to-end) | Tests de bout en bout sur un navigateur réel. Utilisé uniquement pour les workflows critiques (login → saisie vente → vérification soldes). Pas en TDD, en complément. |

### 2.2 Cycle TDD strict : Red → Green → Refactor

> **Ce workflow est OBLIGATOIRE pour tout code dans `@sikabox/core`.** Il est fortement recommandé pour le reste du code, mais peut être assoupli pour le code UI pur (composants de présentation sans logique).

#### Phase 1 : 🔴 RED — Écrire un test qui échoue

Le test décrit le **comportement attendu** en utilisant le vocabulaire du domaine.

```typescript
// --- packages/core/tests/repartition.test.ts ---
import { describe, it, expect } from 'vitest';
import { calculerRepartition } from '../src/repartition';

describe('Moteur de Répartition', () => {
  describe('Avant atteinte du Plafond de Capital', () => {
    it('devrait répartir le Bénéfice Net selon les Ratios 50/30/20', () => {
      // ARRANGE
      const beneficeNet = 10_000; // FCFA
      const ratios = { salaire: 50, remboursement: 30, reserve: 20 };
      const contexte = {
        soldeRemboursement: 0,
        plafondCapital: 500_000,
        ratiosPostPlafond: { salaire: 70, reserve: 30 },
      };

      // ACT
      const resultat = calculerRepartition(beneficeNet, ratios, contexte);

      // ASSERT
      expect(resultat.caisseSalaire).toBe(5_000);
      expect(resultat.caisseRemboursement).toBe(3_000);
      expect(resultat.caisseReserve).toBe(2_000);
      expect(resultat.caisseSalaire + resultat.caisseRemboursement + resultat.caisseReserve)
        .toBe(beneficeNet);
    });
  });
});
```

**À ce stade** : le test est lancé (`pnpm --filter @sikabox/core test`) et **échoue** car `calculerRepartition` n'existe pas encore.

#### Phase 2 : 🟢 GREEN — Écrire le code minimal pour faire passer le test

```typescript
// --- packages/core/src/repartition.ts ---
export function calculerRepartition(
  beneficeNet: number,
  ratios: Ratios,
  contexte: ContexteRepartition
): ResultatRepartition {
  const caisseSalaire = Math.floor(beneficeNet * ratios.salaire / 100);
  const caisseRemboursement = Math.floor(beneficeNet * ratios.remboursement / 100);
  const caisseReserve = beneficeNet - caisseSalaire - caisseRemboursement; // Reste en réserve

  return { caisseSalaire, caisseRemboursement, caisseReserve };
}
```

**À ce stade** : le test passe. ✅

#### Phase 3 : 🔁 REFACTOR — Améliorer sans changer le comportement

Ajouter la gestion du Plafond, extraire les constantes, renommer si nécessaire. **Les tests doivent rester verts après chaque refactor.**

### 2.3 Structure des tests — Pattern AAA (Arrange, Act, Assert)

**Obligatoire.** Chaque test doit suivre ce format avec des commentaires `// ARRANGE`, `// ACT`, `// ASSERT` explicites :

```typescript
it('devrait activer les Ratios post-Plafond quand le Plafond est atteint', () => {
  // ARRANGE — Préparer les données d'entrée et le contexte
  const beneficeNet = 10_000;
  const ratios = { salaire: 50, remboursement: 30, reserve: 20 };
  const contexte = {
    soldeRemboursement: 500_000,   // Plafond déjà atteint
    plafondCapital: 500_000,
    ratiosPostPlafond: { salaire: 70, reserve: 30 },
  };

  // ACT — Exécuter la fonction testée
  const resultat = calculerRepartition(beneficeNet, ratios, contexte);

  // ASSERT — Vérifier le résultat attendu
  expect(resultat.caisseRemboursement).toBe(0);
  expect(resultat.caisseSalaire).toBe(7_000);
  expect(resultat.caisseReserve).toBe(3_000);
});
```

### 2.4 Couverture de test — Objectifs

| Package | Couverture minimale | Justification |
|---------|---------------------|---------------|
| `@sikabox/core` | **100 %** (lignes, branches, fonctions) | C'est le cœur métier financier. Chaque branche de calcul doit être vérifiée. Un bug ici = perte d'argent. |
| `frontend` (hooks, stores) | **80 %** | La logique applicative (sync, état) est critique. |
| `frontend` (composants UI) | **60 %** | Les composants de présentation pure sont testés par les tests E2E. |
| `supabase/functions` | **90 %** | La validation serveur est une couche de sécurité. Elle doit être fiable. |

### 2.5 Tests « cas limites » obligatoires pour le Moteur de Répartition

Ces tests DOIVENT exister avant tout déploiement :

| Cas | Description |
|-----|-------------|
| Bénéfice = 0 | PV = CA → aucune répartition, seul le CA va en Caisse Stock. |
| Bénéfice = 1 FCFA | L'arrondi ne doit pas perdre de centime. Le 1 FCFA va en Caisse Réserve (règle de l'arrondi). |
| Transaction charnière | Le bénéfice fait EXACTEMENT atteindre le Plafond. Remboursement = montant manquant, le reste est redistribué selon les Ratios post-Plafond. |
| Plafond déjà atteint | Remboursement = 0. Ratios post-Plafond (70/30) appliqués. |
| Montants élevés | Vente à 1 000 000 FCFA. Pas de dépassement d'entier (JavaScript `Number.MAX_SAFE_INTEGER` = 9 007 199 254 740 991 → aucun risque en FCFA). |
| Ratios modifiés | L'Admin change les ratios entre deux transactions. Chaque transaction utilise les ratios en vigueur au moment de son enregistrement. |
| Somme des mouvements | Pour chaque test : la somme de tous les mouvements de caisse doit être **exactement égale** au PV (pour une vente textile) ou à la Commission (pour une commission MoMo). Invariant absolu. |

---

## 3. Gestion des Erreurs & Logs

### 3.1 Erreurs API — Standard RFC 7807 (Problem Details)

**Toutes les réponses d'erreur** des Edge Functions Supabase DOIVENT suivre le format [RFC 7807](https://www.rfc-editor.org/rfc/rfc7807) :

```json
{
  "type": "https://sikabox.app/erreurs/validation/vente-a-perte",
  "title": "Vente à perte non autorisée",
  "status": 422,
  "detail": "Le Prix de Vente (8 000 FCFA) est inférieur au Coût d'Achat (10 000 FCFA). La vente à perte est interdite (Règle Métier Q7).",
  "instance": "/api/transactions/550e8400-e29b-41d4-a716-446655440000",
  "extensions": {
    "code": "VENTE_A_PERTE",
    "pv": 8000,
    "ca": 10000,
    "timestamp": "2026-03-06T14:30:00Z"
  }
}
```

#### Types d'erreur standardisés

| Code d'erreur | HTTP Status | `type` URI | Quand ? |
|---------------|-------------|------------|---------|
| `VENTE_A_PERTE` | 422 | `/erreurs/validation/vente-a-perte` | PV < CA |
| `MONTANT_INVALIDE` | 422 | `/erreurs/validation/montant-invalide` | Montant ≤ 0 |
| `FONDS_INSUFFISANT` | 422 | `/erreurs/momo/fonds-insuffisant` | E-float MoMo insuffisant pour un dépôt |
| `FENETRE_EXPIREE` | 403 | `/erreurs/correction/fenetre-expiree` | Tentative de correction > 10 minutes |
| `ACCES_INTERDIT` | 403 | `/erreurs/auth/acces-interdit` | Gestionnaire tente une opération Admin |
| `SESSION_EXPIREE` | 401 | `/erreurs/auth/session-expiree` | Token JWT expiré |
| `CONFLIT_SYNC` | 409 | `/erreurs/sync/conflit` | Conflit de synchronisation non résolvable |
| `RATIOS_INVALIDES` | 422 | `/erreurs/admin/ratios-invalides` | Somme des ratios ≠ 100 % |
| `ERREUR_INTERNE` | 500 | `/erreurs/interne` | Erreur technique inattendue |

#### Implémentation TypeScript

```typescript
// --- packages/core/src/errors.ts ---
export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance?: string;
  extensions?: Record<string, unknown>;
}

export function creerErreur(
  code: string,
  status: number,
  title: string,
  detail: string,
  extensions?: Record<string, unknown>
): ProblemDetails {
  return {
    type: `https://sikabox.app/erreurs/${code.toLowerCase().replace(/_/g, '-')}`,
    title,
    status,
    detail,
    extensions: { ...extensions, code, timestamp: new Date().toISOString() },
  };
}
```

### 3.2 Gestion des erreurs côté client (frontend)

| Type d'erreur | Stratégie |
|---------------|-----------|
| **Erreur métier** (PV < CA, fonds insuffisant) | Affichage d'un message clair dans l'UI. Pas de crash. Pas de toast cryptique. Le message utilise le vocabulaire du domaine. |
| **Erreur réseau** (offline, timeout) | Silencieuse pour l'utilisateur. La transaction est sauvegardée localement. L'indicateur de sync affiche « En attente ». Retry automatique via TanStack Query. |
| **Erreur de synchronisation** | Notification in-app non bloquante. L'Admin est informé. La transaction reste locale. |
| **Erreur technique inattendue** | Capturée par Sentry (error boundary React). L'utilisateur voit un message générique « Une erreur est survenue ». Le développeur reçoit l'alerte. |

### 3.3 Politique de Logs — JSON structuré

**Format obligatoire** : chaque entrée de log est un objet JSON sur une seule ligne. Pas de `console.log("erreur: " + message)`. 

#### Niveaux de log

| Niveau | Quand | Exemples |
|--------|-------|----------|
| `DEBUG` | Détails fins pour le développement. Désactivé en production. | Contenu d'un objet transaction avant écriture, détails du calcul de répartition. |
| `INFO` | Événements métier significatifs. Activé en production. | Transaction créée, synchronisation réussie, Variable Globale modifiée, session ouverte. |
| `WARN` | Situation anormale mais gérée. | Retry de synchronisation, Fenêtre de Correction proche de l'expiration, fonds MoMo bas. |
| `ERROR` | Erreur nécessitant attention. | Échec de synchronisation après 3 retries, erreur de validation serveur, incohérence de données. |

#### Format JSON — Exemple

```json
{
  "level": "INFO",
  "timestamp": "2026-03-06T14:30:00.123Z",
  "service": "frontend",
  "module": "sync-engine",
  "action": "SYNC_TRANSACTION",
  "message": "Transaction synchronisée avec succès",
  "context": {
    "transactionId": "550e8400-e29b-41d4-a716-446655440000",
    "type": "VENTE_TEXTILE",
    "beneficeNet": 3000,
    "dureeSync": 245
  },
  "userId": "gestionnaire-001",
  "traceId": "abc-123-def"
}
```

#### Implémentation — Logger structuré

```typescript
// --- packages/frontend/src/lib/logger.ts ---
type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

interface LogEntry {
  level: LogLevel;
  timestamp: string;
  service: string;
  module: string;
  action: string;
  message: string;
  context?: Record<string, unknown>;
  userId?: string;
  traceId?: string;
}

const LOG_LEVELS: Record<LogLevel, number> = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 };
const MIN_LEVEL: LogLevel = import.meta.env.PROD ? 'INFO' : 'DEBUG';

export function createLogger(module: string) {
  return {
    debug: (action: string, message: string, context?: Record<string, unknown>) =>
      log('DEBUG', module, action, message, context),
    info: (action: string, message: string, context?: Record<string, unknown>) =>
      log('INFO', module, action, message, context),
    warn: (action: string, message: string, context?: Record<string, unknown>) =>
      log('WARN', module, action, message, context),
    error: (action: string, message: string, context?: Record<string, unknown>) =>
      log('ERROR', module, action, message, context),
  };
}

function log(level: LogLevel, module: string, action: string, message: string, context?: Record<string, unknown>) {
  if (LOG_LEVELS[level] < LOG_LEVELS[MIN_LEVEL]) return;

  const entry: LogEntry = {
    level,
    timestamp: new Date().toISOString(),
    service: 'frontend',
    module,
    action,
    message,
    context,
  };

  const output = JSON.stringify(entry);
  if (level === 'ERROR') console.error(output);
  else if (level === 'WARN') console.warn(output);
  else console.log(output);
}
```

### 3.4 Règles sur les données sensibles dans les logs

| Donnée | Peut-on logger ? | Justification |
|--------|-------------------|---------------|
| ID de transaction | ✅ Oui | Nécessaire pour le debugging. |
| Montants (PV, CA, bénéfice) | ✅ Oui | Pas de données personnelles (PII). Nécessaire pour détecter les anomalies. |
| Identifiant utilisateur | ✅ Oui (ID interne) | Pas d'email ni de téléphone dans les logs. |
| Mot de passe | ❌ **JAMAIS** | Même hashé, jamais logué. |
| Token JWT | ❌ **JAMAIS** | Risque de réutilisation. |
| Désignation d'article | ✅ Oui | Texte libre saisi par la Gestionnaire. Pas de PII. |

---

## 4. Git Flow & Conventional Commits

### 4.1 Stratégie de branches

```mermaid
gitgraph
    commit id: "init"
    branch develop
    checkout develop
    commit id: "setup monorepo"
    branch feature/auth
    checkout feature/auth
    commit id: "feat(auth): login"
    commit id: "feat(auth): RBAC"
    checkout develop
    merge feature/auth
    branch feature/vente
    checkout feature/vente
    commit id: "feat(core): moteur répartition"
    commit id: "feat(frontend): formulaire vente"
    checkout develop
    merge feature/vente
    checkout main
    merge develop tag: "v1.0.0"
```

| Branche | Convention de nommage | Durée de vie | Protection |
|---------|----------------------|--------------|------------|
| `main` | `main` | Permanente | Protégée. Merge uniquement depuis `develop` via PR. Chaque commit sur `main` = version déployée en production. |
| `develop` | `develop` | Permanente | Semi-protégée. Merge uniquement depuis les branches `feature/*`, `fix/*`, `refactor/*` via PR. |
| Feature | `feature/<epic>-<description>` | Temporaire (jours) | Non protégée. Créée depuis `develop`, mergée dans `develop`. Supprimée après merge. |
| Fix | `fix/<description>` | Temporaire (heures) | Idem. Pour les corrections de bugs. |
| Hotfix | `hotfix/<description>` | Temporaire (heures) | Créée depuis `main`, mergée dans `main` ET `develop`. Pour les corrections critiques en production. |
| Refactor | `refactor/<description>` | Temporaire (jours) | Idem `feature`. Pour les améliorations techniques sans changement fonctionnel. |

**Exemples de noms de branches** :
- `feature/e1-authentification`
- `feature/e3-saisie-vente-textile`
- `feature/e5-moteur-repartition`
- `fix/correction-arrondi-repartition`
- `hotfix/sync-perte-donnees`
- `refactor/extraction-core-module`

### 4.2 Conventional Commits — Format imposé

**Chaque commit DOIT respecter ce format** :

```
<type>(<scope>): <description courte>

[corps optionnel — détails]

[footer optionnel — breaking changes, références]
```

#### Types autorisés

| Type | Description | Exemple |
|------|-------------|---------|
| `feat` | Nouvelle fonctionnalité | `feat(core): implémenter le moteur de répartition` |
| `fix` | Correction de bug | `fix(core): corriger l'arrondi du reste en Caisse Réserve` |
| `test` | Ajout ou modification de tests | `test(core): ajouter le cas limite bénéfice = 1 FCFA` |
| `refactor` | Refactorisation sans changement fonctionnel | `refactor(frontend): extraire le composant SoldesCaisses` |
| `docs` | Documentation | `docs: mettre à jour le README avec les instructions d'install` |
| `style` | Formatage, espaces, points-virgules | `style(frontend): appliquer le formatage Prettier` |
| `chore` | Maintenance (config, dépendances) | `chore: mettre à jour Vite vers 5.2.0` |
| `ci` | Configuration CI/CD | `ci: ajouter le workflow de déploiement Vercel` |
| `perf` | Amélioration de performance | `perf(frontend): lazy-load du module Admin` |

#### Scopes autorisés

| Scope | Package correspondant |
|-------|----------------------|
| `core` | `packages/core` |
| `frontend` | `packages/frontend` |
| `supabase` | `packages/supabase` |
| `auth` | Authentification (transversal) |
| `sync` | Synchronisation (transversal) |
| `admin` | Module d'administration |
| `momo` | Fonctionnalités MoMo |
| `ci` | GitHub Actions |
| *(aucun)* | Si le changement est global |

#### Règles de commit

| Règle | Description |
|-------|-------------|
| **Atomicité** | Un commit = un changement logique. Pas de commits « divers fixes ». |
| **Description** | Impérative, présent, en minuscules, sans point final. Max 72 caractères. |
| **Langue** | Description en **français** (cohérent avec le Dictionnaire du Domaine). Corps optionnel en français aussi. |
| **Breaking changes** | Footer `BREAKING CHANGE: <description>`. Utilisé si une modification casse la compatibilité d'une interface dans `@sikabox/core`. |

#### Exemples complets

```bash
# Fonctionnalité simple
feat(core): implémenter calculerRepartition avec ratios 50/30/20

# Bug fix avec explication
fix(core): corriger la transaction charnière quand le plafond est exactement atteint

Le montant restant pour atteindre le plafond était calculé sur le solde
avant le mouvement, pas après. Le surplus était perdu.

# Test
test(core): couvrir le cas limite bénéfice net = 0

# Refactor avec breaking change
refactor(core): renommer BeneficeNet en ResultatRepartition

BREAKING CHANGE: l'interface BeneficeNet est renommée ResultatRepartition.
Tous les consommateurs de calculerRepartition() doivent mettre à jour
le type de retour.
```

### 4.3 Outils d'enforcement

| Outil | Rôle | Configuration |
|-------|------|---------------|
| **commitlint** | Valide le format des commits | `@commitlint/config-conventional` avec les types/scopes ci-dessus |
| **husky** | Git hooks (pre-commit, commit-msg) | `pre-commit` → ESLint + Prettier + Vitest. `commit-msg` → commitlint. |
| **lint-staged** | Lint uniquement les fichiers modifiés | Exécute ESLint + Prettier sur les fichiers staged. |

---

## 5. Fichier de Contexte IA

> Le bloc ci-dessous est à placer dans `.github/copilot-instructions.md` (GitHub Copilot) ou `.cursorrules` (Cursor) ou `.windsurfrules` (Windsurf). Il résume les normes de ce document pour que l'assistant IA les respecte automatiquement.

```markdown
# SIKA BOX — Règles de développement pour l'IA

## Contexte projet
Sika Box est une PWA Mobile-First, Offline-First pour la gestion financière de micro-entreprises au Bénin.
Architecture : Monolithe Modulaire Client-Heavy + BaaS (Supabase).
Monorepo Turborepo + pnpm : packages/core (logique métier pure), packages/frontend (React PWA), packages/supabase (migrations + edge functions).

## Langage & Typage
- TypeScript strict everywhere. `any` interdit.
- Montants financiers : `number` entier (FCFA). Toujours `Math.floor()`. Jamais de flottants.
- Nommage domaine en français (caisseSalaire, beneficeNet, plafondCapital). Nommage technique en anglais (repository, middleware, sync).

## Architecture & Patterns
- SOLID obligatoire. DIP : la logique métier dépend d'interfaces, pas d'implémentations.
- Repository Pattern pour tout accès données (ITransactionRepository, ICaisseRepository).
- Strategy Pattern pour le Moteur de Répartition (avant/après plafond).
- Result<T, E> pour les erreurs métier. Exceptions uniquement pour les erreurs techniques.
- @sikabox/core : fonctions pures uniquement. Zéro import I/O, zéro framework, zéro effet de bord.

## Tests
- TDD obligatoire pour @sikabox/core. Red → Green → Refactor.
- Vitest + React Testing Library + MSW + fake-indexeddb.
- Pattern AAA (Arrange, Act, Assert) avec commentaires explicites.
- Couverture : core 100%, hooks/stores 80%, UI 60%.

## Erreurs & Logs
- API errors : RFC 7807 (ProblemDetails). Toujours { type, title, status, detail }.
- Logs : JSON structuré. Niveaux : DEBUG (dev only), INFO, WARN, ERROR.
- Jamais logger : mots de passe, tokens JWT. Toujours logger : transaction IDs, montants.

## Git
- Conventional Commits en français : feat(core): implémenter X, fix(momo): corriger Y.
- Scopes : core, frontend, supabase, auth, sync, admin, momo, ci.
- Branches : main (prod), develop (intégration), feature/<epic>-<desc>, fix/<desc>, hotfix/<desc>.

## Domaine métier (Dictionnaire — UTILISER CES TERMES EXACTEMENT)
- Caisse Stock, Caisse Salaire, Caisse Remboursement, Caisse Réserve, Fonds de Roulement MoMo
- Plafond de Capital (500 000 FCFA), Ratios de Répartition (50/30/20), Ratios post-Plafond (70/30)
- Bénéfice Net = PV - CA (textile) ou Commission (MoMo)
- Opérateur MoMo : MTN Mobile Money, Moov Money, Celtis Cash
- Fenêtre de Correction : 10 minutes. Transaction immutable après.
- Commission MoMo : saisie différée, pas à chaque transaction.
- Vente à perte interdite : PV ≥ CA.
- Devise : FCFA (XOF) uniquement, entiers uniquement.

## Règles de sécurité
- Pas de DELETE SQL. Données financières append-only.
- RBAC : 3 niveaux (UI routes, API JWT, PostgreSQL RLS).
- Admin et Gestionnaire sur appareils séparés.
- Pas de valeurs magiques. Tout dans constants.ts ou Variables Globales.
```

---

*Ce document définit les normes de développement contraignantes pour le projet Sika Box. Toute déviation doit être justifiée par un commentaire dans le code et approuvée en revue.*
