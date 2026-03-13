# 05 — Roadmap Frontend

> Rôle : Technical PM & Scrum Master  
> Sources : `00_BIBLE_PROJET.md` v1.2 · `01_ARCHITECTURE_TECHNIQUE.md` · `02_NORMES_OPERATIONNELLES.md` · `openapi.yaml` v1.0 · `03_MOCKING_ET_CONTRACT_TESTING.md`  
> Règle : chaque tâche ≤ 2h · TDD obligatoire · format **ID | Titre | Dépendance | Critère de fin**  
> **Stratégie : le Frontend utilise le Mock Server Prism dès le jour 1. Il ne dépend PAS du backend réel.**

---

## Phase F0 — Légende

| Icône | Signification |
|---|---|
| 🧪 | Tâche de test (écriture du test EN PREMIER) |
| 🎨 | Tâche composant UI (dumb / présentationnel) |
| 🔌 | Tâche intégration API (smart component) |
| ⚙️ | Tâche de setup / configuration |
| 📱 | Tâche offline / PWA |

---

## Phase F1 — Setup (Projet, Outillage, Mock Server) `[V0.1]`

> Objectif : PWA React opérationnelle avec mock API, prête pour le développement.

| ID | Titre | Dépendance | Critère de fin |
|---|---|---|---|
| F1.1 | ⚙️ Initialiser React + Vite + TypeScript dans `packages/frontend` | B1.1 | `pnpm --filter frontend dev` démarre un serveur Vite sur `localhost:5173`. Page "Hello Sika Box" affichée. |
| F1.2 | ⚙️ Configurer Tailwind CSS + PostCSS | F1.1 | `tailwind.config.ts` présent. `className="bg-red-500"` s'applique. |
| F1.3 | ⚙️ Installer et configurer shadcn/ui | F1.2 | `components.json` initialisé. `npx shadcn-ui@latest add button` fonctionne. Composant `<Button>` rendu correctement. |
| F1.4 | ⚙️ Configurer les design tokens Sika Box | F1.2 | Fichier `tailwind.config.ts` avec palette FCFA personnalisée : `--color-stock: rouge`, `--color-salaire: vert`, `--color-remboursement: rouge`, `--color-reserve: orange`, `--color-momo: bleu`. Police : Inter ou système. |
| F1.5 | ⚙️ Configurer Vitest + React Testing Library + MSW | F1.1 | `vitest.config.ts` avec `jsdom`. `pnpm --filter frontend test` exécute 0 tests, exit 0. `@testing-library/react`, `msw` installés. |
| F1.6 | ⚙️ Configurer le mock server Prism | F1.1 | Script `pnpm mock:api` à la racine du monorepo. `curl http://localhost:4010/rest/v1/caisses/soldes -H "Authorization: Bearer test"` retourne un JSON conforme au schéma OpenAPI. |
| F1.7 | ⚙️ Configurer le proxy Vite vers Prism | F1.6 | Dans `vite.config.ts` : proxy `/rest` → `4010`, `/auth` → `4010`, `/functions` → `4010`. Fetch depuis le frontend sans CORS. |
| F1.8 | ⚙️ Configurer Dexie.js (IndexedDB) | F1.1 | `db.ts` avec schéma Dexie : tables `transactions`, `mouvements_caisse`, `variables_globales`, `operateurs_momo`, `sync_queue`. `fake-indexeddb` configuré pour les tests. |
| F1.9 | ⚙️ Configurer Zustand (stores skeleton) | F1.1 | Fichiers vides : `authStore.ts`, `uiStore.ts`. `useAuthStore()` retourne `{ user: null, isAuthenticated: false }`. |
| F1.10 | ⚙️ Configurer TanStack Query | F1.1 | `QueryClientProvider` wrappé à la racine de l'app. `queryClient` avec retry=1, staleTime=30s. |
| F1.11 | ⚙️ Configurer vite-plugin-pwa (manifest + SW) | F1.1 | `manifest.json` avec `name: "Sika Box"`, `short_name: "SikaBox"`, icônes, `display: standalone`, `theme_color`. Workbox en mode GenerateSW. `pnpm --filter frontend build` génère `sw.js`. |
| F1.12 | ⚙️ Configurer l'import de `@sikabox/core` dans le frontend | F1.1, B1.2 | `import { TypeTransaction } from '@sikabox/core'` compile sans erreur dans un composant React. |
| F1.13 | ⚙️ Configurer React Hook Form + Zod | F1.1 | `react-hook-form` + `@hookform/resolvers` + `zod` installés. Schémas Zod créés pour chaque formulaire (vente textile, opération MoMo, commission, correction, login). `zodResolver` intégré dans un formulaire de test. |

**Total Phase F1 : 13 tâches**

---

## Phase F2 — Routing & Layout `[V0.1]`

> Objectif : toutes les pages accessibles via URL, garde d'authentification, layout responsive.

| ID | Titre | Dépendance | Critère de fin |
|---|---|---|---|
| F2.1 | ⚙️ Installer React Router v6 + définir les routes | F1.1 | Routes : `/login`, `/changer-mot-de-passe`, `/dashboard`, `/vente`, `/momo`, `/historique`, `/admin`, `/admin/gestionnaire`, `/admin/operateurs-momo`, `/admin/audit`, `/admin/rapport`. 404 catch-all. |
| F2.2 | 🧪 Créer le test d'abord : `AuthGuard` (route protégée) | F1.5 | Test : sans token → redirigé vers `/login`. Avec token → accès autorisé. **Test ROUGE.** |
| F2.3 | 🏗️ Implémenter `AuthGuard` | F2.2 | Test F2.2 passe au VERT. Composant wrapper qui vérifie `useAuthStore().isAuthenticated`. |
| F2.4 | 🧪 Créer le test d'abord : `RoleGuard` (route réservée ADMIN) | F2.3 | Test : GESTIONNAIRE sur `/admin` → redirigé vers `/dashboard`. ADMIN → accès ok. **Test ROUGE.** |
| F2.5 | 🏗️ Implémenter `RoleGuard` | F2.4 | Test F2.4 passe au VERT. Vérifie `user.role === 'ADMIN'`. |
| F2.6 | 🎨 Créer le Layout principal (mobile-first) | F1.3 | Layout responsive : barre de navigation bottom (mobile), sidebar (tablette+). Logo "Sika Box" en haut. Slot pour le contenu. Indicateur online/offline dans le header. |
| F2.7 | 🎨 Créer le composant `NavigationBar` (bottom nav mobile) | F2.6 | 4 onglets : Accueil (dashboard), Vente, MoMo, Historique. Onglet actif visuellement distinct. ADMIN voit un 5e onglet "Admin". |
| F2.8 | 🎨 Créer la page 404 (Not Found) | F2.1 | Page minimaliste avec bouton "Retour à l'accueil". |

**Total Phase F2 : 8 tâches**

---

## Phase F3 — Composants UI (Dumb / Présentationnels) `[V0.1]` `[V0.2]` `[V0.3]`

> Objectif : tous les composants visuels construits et testés en isolation.  
> Aucune dépendance API. Props uniquement. Storybook optionnel.

### F3.A — Composants Caisses (Dashboard)

| ID | Titre | Dépendance | Critère de fin |
|---|---|---|---|
| F3.1 | 🧪 Créer le test d'abord : `CaisseCard` | F1.5 | Test : render avec `{type: 'STOCK', solde: 350000, couleur: 'rouge'}` → affiche "Caisse Stock", "350 000 FCFA", fond de couleur correcte, icône cadenas (bloqué). **Test ROUGE.** |
| F3.2 | 🎨 Implémenter `CaisseCard` | F3.1 | Test F3.1 passe au VERT. Composant shadcn/ui Card. Montant formaté avec séparateur de milliers + " FCFA". Badge statut. |
| F3.3 | 🧪 Créer le test d'abord : `ProgressionRemboursement` | F1.5 | Test : render avec `{solde: 230000, plafond: 500000, pourcentage: 46}` → affiche barre de progression à 46%, texte "230 000 / 500 000 FCFA". **Test ROUGE.** |
| F3.4 | 🎨 Implémenter `ProgressionRemboursement` | F3.3 | Test F3.3 passe au VERT. Barre de progression shadcn/ui. |
| F3.5 | 🧪 Créer le test d'abord : `FondsRoulementMomoCard` | F1.5 | Test : render avec `{operateur: 'MTN Mobile Money', solde: 185000}` → affiche nom opérateur, solde formaté, fond bleu. **Test ROUGE.** |
| F3.6 | 🎨 Implémenter `FondsRoulementMomoCard` | F3.5 | Test F3.5 passe au VERT. |
| F3.7 | 🧪 Créer le test d'abord : `AlerteRappelCommission` | F1.5 | Test : render avec `rappels_en_attente: 2` → affiche alerte orange "2 commissions à saisir". Render avec `0` → rien affiché. **Test ROUGE.** |
| F3.8 | 🎨 Implémenter `AlerteRappelCommission` | F3.7 | Test F3.7 passe au VERT. Composant Alert shadcn/ui. |

### F3.B — Composants Transactions

| ID | Titre | Dépendance | Critère de fin |
|---|---|---|---|
| F3.9 | 🧪 Créer le test d'abord : `TransactionRow` | F1.5 | Test : render avec transaction VENTE_TEXTILE → affiche type, désignation, montant, date. Badge "Corrigée" si `corrigee=true`. Badge horloge si fenêtre active. **Test ROUGE.** |
| F3.10 | 🎨 Implémenter `TransactionRow` | F3.9 | Test F3.9 passe au VERT. Ligne de tableau/liste avec icônes par type. |
| F3.11 | 🧪 Créer le test d'abord : `VentilationDetail` | F1.5 | Test : render avec 4 mouvements de caisse → affiche la répartition (Stock: X, Salaire: Y, Remboursement: Z, Réserve: W). **Test ROUGE.** |
| F3.12 | 🎨 Implémenter `VentilationDetail` | F3.11 | Test F3.11 passe au VERT. Liste colorée des mouvements de caisse. |

### F3.C — Formulaires de Saisie

| ID | Titre | Dépendance | Critère de fin |
|---|---|---|---|
| F3.13 | 🧪 Créer le test d'abord : `FormulaireVenteTextile` | F1.5 | Test : remplit PV, CA, désignation → `onSubmit({pv, ca, designation})` appelé. PV < CA → message d'erreur inline "Vente à perte". PV vide → bouton désactivé. **Test ROUGE.** |
| F3.14 | 🎨 Implémenter `FormulaireVenteTextile` | F3.13 | Test F3.13 passe au VERT. Inputs shadcn/ui avec validation côté client via `@sikabox/core/validerVenteTextile`. Clavier numérique mobile. |
| F3.15 | 🧪 Créer le test d'abord : `FormulaireOperationMomo` | F1.5 | Test : sélection opérateur + type (dépôt/retrait) + montant → `onSubmit(...)`. Montant > solde opérateur en dépôt → erreur inline. **Test ROUGE.** |
| F3.16 | 🎨 Implémenter `FormulaireOperationMomo` | F3.15 | Test F3.15 passe au VERT. Select pour opérateur (3 choix), radio pour dépôt/retrait, input montant. |
| F3.17 | 🧪 Créer le test d'abord : `FormulaireCommissionMomo` | F1.5 | Test : sélection opérateur + montant commission → `onSubmit(...)`. **Test ROUGE.** |
| F3.18 | 🎨 Implémenter `FormulaireCommissionMomo` | F3.17 | Test F3.17 passe au VERT. |
| F3.19 | 🧪 Créer le test d'abord : `FormulaireCorrectionTransaction` | F1.5 | Test : pré-rempli avec valeurs actuelles. Modifier PV → soumet correction. Timer visuel (temps restant fenêtre). Si fenêtre expirée → formulaire désactivé. **Test ROUGE.** |
| F3.20 | 🎨 Implémenter `FormulaireCorrectionTransaction` | F3.19 | Test F3.19 passe au VERT. Compte à rebours en temps réel. |

### F3.D — Composants Admin

| ID | Titre | Dépendance | Critère de fin |
|---|---|---|---|
| F3.21 | 🧪 Créer le test d'abord : `VariableGlobaleEditor` | F1.5 | Test : render avec `{cle: 'plafond_capital', valeur: 500000}` → affiche label lisible + input number. Modifier → `onChange(nouvelle_valeur)`. Somme ratios ≠ 100 → erreur. **Test ROUGE.** |
| F3.22 | 🎨 Implémenter `VariableGlobaleEditor` | F3.21 | Test F3.21 passe au VERT. Validation des ratios en temps réel. |
| F3.23 | 🧪 Créer le test d'abord : `AuditLogRow` | F1.5 | Test : render avec entrée audit → affiche action, utilisateur, détails, date. **Test ROUGE.** |
| F3.24 | 🎨 Implémenter `AuditLogRow` | F3.23 | Test F3.23 passe au VERT. |

### F3.E — Composants Communs

| ID | Titre | Dépendance | Critère de fin |
|---|---|---|---|
| F3.25 | 🧪 Créer le test d'abord : `MontantFCFA` (formatage montant) | F1.5 | Test : `render(<MontantFCFA value={350000} />)` → affiche "350 000 FCFA". `value=0` → "0 FCFA". **Test ROUGE.** |
| F3.26 | 🎨 Implémenter `MontantFCFA` | F3.25 | Test F3.25 passe au VERT. Utilise `Intl.NumberFormat('fr-FR')`. |
| F3.27 | 🧪 Créer le test d'abord : `IndicateurConnexion` (online/offline) | F1.5 | Test : online → badge vert "En ligne". Offline → badge rouge "Hors ligne". **Test ROUGE.** |
| F3.28 | 🎨 Implémenter `IndicateurConnexion` | F3.27 | Test F3.27 passe au VERT. Utilise `navigator.onLine` + event listeners. |
| F3.29 | 🧪 Créer le test d'abord : `PageLogin` (formulaire connexion) | F1.5 | Test : remplit email + mot de passe → `onSubmit({email, password})`. Champs vides → bouton désactivé. **Test ROUGE.** |
| F3.30 | 🎨 Implémenter `PageLogin` | F3.29 | Test F3.29 passe au VERT. Logo Sika Box + formulaire centré. |
| F3.31 | 🧪 Créer le test d'abord : `ConfirmationVentilation` (modal résultat) | F1.5 | Test : affiche le détail de ventilation après une saisie réussie. Bouton "OK" ferme. **Test ROUGE.** |
| F3.32 | 🎨 Implémenter `ConfirmationVentilation` | F3.31 | Test F3.31 passe au VERT. Dialog shadcn/ui. Animation de succès (check). |

### F3.F — Composants Admin Gestionnaire

| ID | Titre | Dépendance | Critère de fin |
|---|---|---|---|
| F3.33 | 🧪 Créer le test d'abord : `FormulaireCreationGestionnaire` | F1.5, F1.13 | Test : remplit identifiant + mot de passe temporaire → `onSubmit({identifiant, mot_de_passe_temporaire})`. Identifiant vide → bouton désactivé. Mot de passe < 8 chars → erreur inline. **Test ROUGE.** |
| F3.34 | 🎨 Implémenter `FormulaireCreationGestionnaire` | F3.33 | Test F3.33 passe au VERT. React Hook Form + Zod validation. |
| F3.35 | 🧪 Créer le test d'abord : `GestionnaireStatusRow` | F1.5 | Test : render avec `{identifiant, actif: true}` → affiche identifiant + badge "Actif". Bouton "Désactiver" → `onToggle(id, false)`. **Test ROUGE.** |
| F3.36 | 🎨 Implémenter `GestionnaireStatusRow` | F3.35 | Test F3.35 passe au VERT. Badge vert/rouge selon statut. Dialog de confirmation avant désactivation. |
| F3.37 | 🧪 Créer le test d'abord : `ConfigOperateurMomoCard` | F1.5 | Test : render avec `{nom: 'MTN Mobile Money', solde_initial: 0, actif: true}` → affiche nom + input solde_initial éditable. Modifier → `onChange(id, solde_initial)`. **Test ROUGE.** |
| F3.38 | 🎨 Implémenter `ConfigOperateurMomoCard` | F3.37 | Test F3.37 passe au VERT. Input numérique + bouton sauvegarder par opérateur. |

### F3.G — Composants UX / Accessibilité

| ID | Titre | Dépendance | Critère de fin |
|---|---|---|---|
| F3.39 | 🧪 Créer le test d'abord : `AperçuBeneficeNet` (preview live) | F1.5, F1.12 | Test : render avec `{pv: 15000, ca: 10000}` → affiche "Bénéfice Net : 5 000 FCFA" en temps réel. `pv=0, ca=0` → rien affiché. `pv < ca` → affiche "Vente à perte" en rouge. **Test ROUGE.** |
| F3.40 | 🎨 Implémenter `AperçuBeneficeNet` | F3.39 | Test F3.39 passe au VERT. Utilise `@sikabox/core` pour le calcul. Affiché en dessous des champs PV/CA du formulaire vente textile. |
| F3.41 | 🎨 Créer le composant `Toast` (notifications succès/erreur) | F1.3 | Toast shadcn/ui configuré. Variantes : succès (vert), erreur (rouge), info (bleu). Auto-fermeture après 4 secondes. Position : bottom-center (mobile). |
| F3.42 | 🎨 Créer les composants `SkeletonLoader` (chargement) | F1.3 | Skeleton shadcn/ui pour : CaisseCard, TransactionRow, full page. Affichés pendant `isLoading` de TanStack Query. |
| F3.43 | 🎨 Créer les composants `EmptyState` (état vide) | F1.3 | Composant avec icône + message pour : "Aucune transaction", "Aucun mouvement de caisse", "Aucune entrée d'audit". Aide l'utilisatrice à comprendre qu'il n'y a pas d'erreur, juste pas de données. |
| F3.44 | 🧪 Créer le test d'abord : `FormulaireChangementMotDePasse` | F1.5, F1.13 | Test : remplit nouveau mot de passe + confirmation → `onSubmit({password})`. Mots de passe différents → erreur "Les mots de passe ne correspondent pas". < 8 chars → erreur. **Test ROUGE.** |
| F3.45 | 🎨 Implémenter `FormulaireChangementMotDePasse` | F3.44 | Test F3.44 passe au VERT. Utilisé lors de la première connexion avec mot de passe temporaire. |

**Total Phase F3 : 45 tâches**

---

## Phase F4 — Intégration API (Smart Components) `[V0.1]` `[V0.2]` `[V0.3]`

> Objectif : connecter les composants dumb à l'API (Prism en dev, Supabase en prod).  
> TanStack Query pour les requêtes, Zustand pour l'état global.

### F4.A — Client API

| ID | Titre | Dépendance | Critère de fin |
|---|---|---|---|
| F4.1 | 🧪 Créer le test d'abord : `apiClient` (fetch wrapper) | F1.5, F1.10 | Test (MSW) : `apiClient.get('/caisses/soldes')` → ajoute automatiquement `Authorization: Bearer ...` et `Content-Type: application/json`. 401 → erreur `SESSION_EXPIREE`. **Test ROUGE.** |
| F4.2 | 🔌 Implémenter `apiClient` | F4.1 | Test F4.1 passe au VERT. Wrapper autour de `fetch`. Intercepte les 401 pour logout automatique. |
| F4.3 | 🧪 Créer le test d'abord : hooks TanStack Query (`useTransactions`, `useSoldesCaisses`, etc.) | F4.2 | Test (MSW) : `renderHook(() => useSoldesCaisses())` → retourne `{ data, isLoading, error }`. Mock MSW répond avec données conformes OpenAPI. **Test ROUGE.** |
| F4.4 | 🔌 Implémenter les hooks TanStack Query (lecture) | F4.3 | Tests F4.3 passent au VERT. Hooks : `useSoldesCaisses`, `useTransactions`, `useTransaction(id)`, `useOperateursMomo`, `useVariablesGlobales`, `useJournalAudit`, `useRappelCommission`. |

### F4.B — Mutations API

| ID | Titre | Dépendance | Critère de fin |
|---|---|---|---|
| F4.5 | 🧪 Créer le test d'abord : mutation `useCreerVenteTextile` | F4.2 | Test (MSW) : appel mutation → POST `/rest/v1/transactions/vente-textile` → 201. Invalide le cache `useTransactions` + `useSoldesCaisses`. **Test ROUGE.** |
| F4.6 | 🔌 Implémenter `useCreerVenteTextile` | F4.5 | Test F4.5 passe au VERT. `useMutation` + invalidation TanStack Query. |
| F4.7 | 🧪 Créer le test d'abord : mutation `useCreerOperationMomo` | F4.2 | Test (MSW) : POST `/rest/v1/transactions/momo/operation` → 201. Invalide `useOperateursMomo` + `useSoldesCaisses`. **Test ROUGE.** |
| F4.8 | 🔌 Implémenter `useCreerOperationMomo` | F4.7 | Test F4.7 passe au VERT. |
| F4.9 | 🧪 Créer le test d'abord : mutation `useCreerCommissionMomo` | F4.2 | Test (MSW) : POST `/rest/v1/transactions/momo/commission` → 201. **Test ROUGE.** |
| F4.10 | 🔌 Implémenter `useCreerCommissionMomo` | F4.9 | Test F4.9 passe au VERT. |
| F4.11 | 🧪 Créer le test d'abord : mutation `useCorrigerTransaction` | F4.2 | Test (MSW) : PATCH `/rest/v1/transactions/{id}/correction` → 200. Gère 403 (fenêtre expirée). **Test ROUGE.** |
| F4.12 | 🔌 Implémenter `useCorrigerTransaction` | F4.11 | Test F4.11 passe au VERT. |
| F4.13 | 🧪 Créer le test d'abord : mutation `useModifierVariableGlobale` (ADMIN) | F4.2 | Test (MSW) : PATCH `/rest/v1/variables_globales/{cle}` → 200. **Test ROUGE.** |
| F4.14 | 🔌 Implémenter `useModifierVariableGlobale` | F4.13 | Test F4.13 passe au VERT. |
| F4.15 | 🧪 Créer le test d'abord : mutation `useCreerGestionnaire` (ADMIN) | F4.2 | Test (MSW) : POST `/rest/v1/utilisateurs` → 201. **Test ROUGE.** |
| F4.16 | 🔌 Implémenter `useCreerGestionnaire` | F4.15 | Test F4.15 passe au VERT. |
| F4.17 | 🧪 Créer le test d'abord : mutation `useModifierStatutGestionnaire` (ADMIN) | F4.2 | Test (MSW) : PATCH `/rest/v1/utilisateurs/{id}/statut` → 200. **Test ROUGE.** |
| F4.18 | 🔌 Implémenter `useModifierStatutGestionnaire` | F4.17 | Test F4.17 passe au VERT. |
| F4.19 | 🧪 Créer le test d'abord : mutation `useConfigurerOperateurMomo` (ADMIN) | F4.2 | Test (MSW) : PATCH `/rest/v1/operateurs_momo/{id}` → 200. **Test ROUGE.** |
| F4.20 | 🔌 Implémenter `useConfigurerOperateurMomo` | F4.19 | Test F4.19 passe au VERT. |
| F4.21 | 🧪 Créer le test d'abord : mutation `useChangerMotDePasse` | F4.2 | Test (MSW) : PUT `/auth/v1/user` avec `{password}` → 200. **Test ROUGE.** |
| F4.22 | 🔌 Implémenter `useChangerMotDePasse` | F4.21 | Test F4.21 passe au VERT. Redirige vers Dashboard après succès. |

### F4.C — Pages Smart (connectées à l'API)

| ID | Titre | Dépendance | Critère de fin |
|---|---|---|---|
| F4.23 | 🧪 Créer le test d'abord : Page Dashboard | F4.4, F3.2, F3.4, F3.6, F3.8, F3.42 | Test : render → affiche 4 CaisseCard + 3 FondsRoulementMomoCard + ProgressionRemboursement + AlerteRappelCommission. Loading → SkeletonLoader. Empty → EmptyState. **Test ROUGE.** |
| F4.24 | 🔌 Implémenter Page Dashboard | F4.23 | Test F4.23 passe au VERT. Appelle `useSoldesCaisses()`. Layout grille responsive. |
| F4.25 | 🧪 Créer le test d'abord : Page Saisie Vente Textile | F4.6, F3.14, F3.32, F3.40 | Test : remplit formulaire → aperçu bénéfice net en temps réel → soumet → affiche ConfirmationVentilation avec le détail. Erreur API → Toast erreur. **Test ROUGE.** |
| F4.26 | 🔌 Implémenter Page Saisie Vente Textile | F4.25 | Test F4.25 passe au VERT. FormulaireVenteTextile + AperçuBeneficeNet + ConfirmationVentilation + Toast succès/erreur. |
| F4.27 | 🧪 Créer le test d'abord : Page Saisie MoMo | F4.8, F4.10, F3.16, F3.18 | Test : onglets Dépôt/Retrait et Commission. Soumet chaque formulaire → résultat affiché. **Test ROUGE.** |
| F4.28 | 🔌 Implémenter Page Saisie MoMo | F4.27 | Test F4.27 passe au VERT. Tabs shadcn/ui (Opération | Commission). |
| F4.29 | 🧪 Créer le test d'abord : Page Historique | F4.4, F3.10, F3.12 | Test : affiche liste de transactions paginée. Filtre par type + dates. Clic → détail avec ventilation. Bouton "Corriger" si fenêtre active. **Test ROUGE.** |
| F4.30 | 🔌 Implémenter Page Historique | F4.29 | Test F4.29 passe au VERT. Liste scrollable + filtres + pagination. |
| F4.31 | 🧪 Créer le test d'abord : Page Admin — Variables Globales | F4.14, F3.22 | Test : affiche les 8 variables. Modifier plafond → sauvegarde. Modifier ratio → validation somme=100%. **Test ROUGE.** |
| F4.32 | 🔌 Implémenter Page Admin — Variables Globales | F4.31 | Test F4.31 passe au VERT. |
| F4.33 | 🧪 Créer le test d'abord : Page Admin — Gestion Gestionnaire | F4.16, F4.18, F3.34, F3.36 | Test : affiche le(s) gestionnaire(s). Formulaire de création. Bouton désactiver/réactiver. Confirmation avant action. **Test ROUGE.** |
| F4.34 | 🔌 Implémenter Page Admin — Gestion Gestionnaire | F4.33 | Test F4.33 passe au VERT. Liste des gestionnaires + formulaire de création + toggle statut. |
| F4.35 | 🧪 Créer le test d'abord : Page Admin — Config Opérateurs MoMo | F4.20, F3.38 | Test : affiche les 3 opérateurs MoMo. Input solde_initial par opérateur. Bouton sauvegarder. **Test ROUGE.** |
| F4.36 | 🔌 Implémenter Page Admin — Config Opérateurs MoMo | F4.35 | Test F4.35 passe au VERT. 3 ConfigOperateurMomoCard. |
| F4.37 | 🧪 Créer le test d'abord : Page Admin — Journal d'Audit | F4.4, F3.24 | Test : affiche liste paginée du journal d'audit. Filtre par action. **Test ROUGE.** |
| F4.38 | 🔌 Implémenter Page Admin — Journal d'Audit | F4.37 | Test F4.37 passe au VERT. |
| F4.39 | 🧪 Créer le test d'abord : Page Admin — Rapport Trimestriel | F4.4 | Test : sélection année + trimestre → clic "Générer" → affiche rapport. **Test ROUGE.** |
| F4.40 | 🔌 Implémenter Page Admin — Rapport Trimestriel | F4.39 | Test F4.39 passe au VERT. |

### F4.D — Authentification

| ID | Titre | Dépendance | Critère de fin |
|---|---|---|---|
| F4.41 | 🧪 Créer le test d'abord : `useLogin` mutation | F4.2 | Test (MSW) : `login(email, password)` → POST `/auth/v1/token?grant_type=password` → sauvegarde token dans Zustand + localStorage. **Test ROUGE.** |
| F4.42 | 🔌 Implémenter `useLogin` + `useLogout` + `useRefreshToken` | F4.41 | Test F4.41 passe au VERT. `useAuthStore` mis à jour. Redirect vers `/dashboard` après login. Refresh token automatique via intercepteur. |
| F4.43 | 🔌 Implémenter Page Login (smart) | F4.42, F3.30 | Login → si mot de passe temporaire → page changement de mot de passe (F3.45) → dashboard. Mauvais identifiants → message d'erreur. Compte désactivé → message spécifique. |
| F4.44 | 🔌 Implémenter Page Changement Mot de Passe (première connexion) | F4.22, F3.45 | FormulaireChangementMotDePasse. Après succès → redirect dashboard. Affichée automatiquement si le serveur indique un mot de passe temporaire. |
| F4.45 | 🔌 Implémenter le verrouillage automatique par inactivité | F4.42, F5.8 | Après `verrouillage_inactivite_minutes` minutes (Variable Globale, défaut 5 min) sans interaction → redirect vers `/login`. Timer réinitialisé à chaque touch/click/keypress. |

**Total Phase F4 : 45 tâches**

---

## Phase F5 — Gestion d'État & Mode Offline (PWA) `[V1.0]`

> Objectif : l'app fonctionne complètement sans connexion internet.  
> Les transactions sont stockées en IndexedDB et synchronisées quand la connexion revient.

### F5.A — Stores Zustand

| ID | Titre | Dépendance | Critère de fin |
|---|---|---|---|
| F5.1 | 🧪 Créer le test d'abord : `useAuthStore` (persistance) | F1.9 | Test : login → state mis à jour → refresh page → state restauré depuis localStorage. Logout → state vidé. **Test ROUGE.** |
| F5.2 | 🏗️ Implémenter `useAuthStore` avec persist | F5.1 | Test F5.1 passe au VERT. Zustand middleware `persist` avec `localStorage`. |
| F5.3 | 🧪 Créer le test d'abord : `useSyncStore` | F1.9 | Test : `pendingCount` = nombre de transactions non synchronisées. `lastSyncAt` = dernier timestamp. `isSyncing` = état de la sync. **Test ROUGE.** |
| F5.4 | 🏗️ Implémenter `useSyncStore` | F5.3 | Test F5.3 passe au VERT. |

### F5.B — IndexedDB (Dexie)

| ID | Titre | Dépendance | Critère de fin |
|---|---|---|---|
| F5.5 | 🧪 Créer le test d'abord : `TransactionLocalRepository` | F1.8 | Test (fake-indexeddb) : `save(transaction)` → stocké en IndexedDB. `findAll()` → retourne toutes les transactions. `findBySyncStatus(false)` → retourne non synchronisées. **Test ROUGE.** |
| F5.6 | 🏗️ Implémenter `TransactionLocalRepository` | F5.5 | Test F5.5 passe au VERT. Implémente l'interface Repository de `@sikabox/core`. |
| F5.7 | 🧪 Créer le test d'abord : `VariableGlobaleLocalRepository` | F1.8 | Test : cache les Variables Globales localement. `getByKey(cle)` retourne la valeur. **Test ROUGE.** |
| F5.8 | 🏗️ Implémenter `VariableGlobaleLocalRepository` | F5.7 | Test F5.7 passe au VERT. |

### F5.C — File d'attente Offline

| ID | Titre | Dépendance | Critère de fin |
|---|---|---|---|
| F5.9 | 🧪 Créer le test d'abord : `OfflineQueue` | F5.6 | Test : en mode offline, `enqueue(transaction)` → transaction sauvée en IndexedDB avec `synchronisee=false`. `processQueue()` en mode online → POST sync/push. **Test ROUGE.** |
| F5.10 | 🏗️ Implémenter `OfflineQueue` | F5.9 | Test F5.9 passe au VERT. File FIFO. Retry sur erreur réseau. |
| F5.11 | 🧪 Créer le test d'abord : hook `useOfflineAwareSubmit` | F5.10 | Test : online → POST direct à l'API. Offline → enqueue dans OfflineQueue. Le formulaire affiche "Sauvegardé localement" en offline. **Test ROUGE.** |
| F5.12 | 🏗️ Implémenter `useOfflineAwareSubmit` | F5.11 | Test F5.11 passe au VERT. Hook réutilisable par tous les formulaires de saisie. |

### F5.D — Synchronisation

| ID | Titre | Dépendance | Critère de fin |
|---|---|---|---|
| F5.13 | 🧪 Créer le test d'abord : `SyncService` — push | F5.10 | Test (MSW) : 3 transactions en queue → `sync()` → POST `/functions/v1/sync/push` → 2 ok, 1 échouée → local DB mis à jour. `useSyncStore.pendingCount` diminue. **Test ROUGE.** |
| F5.14 | 🏗️ Implémenter `SyncService.push()` | F5.13 | Test F5.13 passe au VERT. |
| F5.15 | 🧪 Créer le test d'abord : `SyncService` — pull | F5.8 | Test (MSW) : `pull()` → GET `/functions/v1/sync/pull?depuis=...` → met à jour les Variables Globales locales + Opérateurs MoMo. **Test ROUGE.** |
| F5.16 | 🏗️ Implémenter `SyncService.pull()` | F5.15 | Test F5.15 passe au VERT. |
| F5.17 | 🧪 Créer le test d'abord : auto-sync au retour en ligne | F5.14, F5.16 | Test : simuler passage offline → online → `SyncService.push()` puis `pull()` déclenchés automatiquement. **Test ROUGE.** |
| F5.18 | 🏗️ Implémenter auto-sync (event listener `online`) | F5.17 | Test F5.17 passe au VERT. Listener sur `window.addEventListener('online', ...)`. |

### F5.E — Service Worker

| ID | Titre | Dépendance | Critère de fin |
|---|---|---|---|
| F5.19 | 📱 Configurer le cache Workbox (stratégies) | F1.11 | Stratégie : `CacheFirst` pour les assets statiques, `NetworkFirst` pour les API calls. Manifest de précache. |
| F5.20 | 📱 Configurer la notification de mise à jour (new version available) | F5.19 | Banner "Nouvelle version disponible — Rafraîchir" quand le SW détecte une mise à jour. |
| F5.21 | 📱 Configurer l'invite d'installation PWA (A2HS) | F5.19 | Capture l'événement `beforeinstallprompt`. Affiche un bouton "Installer" sur mobile. |

**Total Phase F5 : 21 tâches**

---

## Phase F6 — Tests End-to-End Frontend (Playwright) `[V0.1]` `[V0.2]` `[V0.3]` `[V1.0]`

> Objectif : valider les parcours utilisateurs complets sur le frontend (avec Prism ou Supabase local).

| ID | Titre | Dépendance | Critère de fin |
|---|---|---|---|
| F6.1 | ⚙️ Configurer Playwright | F4.31 | `playwright.config.ts` configuré. `pnpm --filter frontend test:e2e` exécute 0 tests, exit 0. Navigateur Chromium mobile (viewport 375x812). |
| F6.2 | 🧪 Test E2E : parcours Login → Dashboard | F6.1 | Ouvrir `/login` → remplir identifiants → soumettre → redirect `/dashboard` → 4 cartes caisses visibles. |
| F6.3 | 🧪 Test E2E : parcours Saisie Vente Textile | F6.2 | Dashboard → clic "Vente" → remplir formulaire (PV=15000, CA=10000, "Guipure") → soumettre → modal ventilation affichée → retour dashboard → soldes mis à jour. |
| F6.4 | 🧪 Test E2E : parcours Saisie MoMo | F6.2 | Dashboard → clic "MoMo" → onglet Dépôt → sélectionner MTN → montant 50000 → soumettre → succès. |
| F6.5 | 🧪 Test E2E : parcours Historique + Correction | F6.3 | Après vente textile → onglet Historique → dernière transaction visible → clic "Corriger" → modifier PV → soumettre → badge "Corrigée" affiché. |
| F6.6 | 🧪 Test E2E : parcours Admin Variables Globales | F6.2 | Login Admin → page Admin → modifier plafond_capital → sauvegarder → confirmation. |
| F6.7 | 🧪 Test E2E : mode offline | F6.3 | Couper le réseau (Playwright network emulation) → saisir une vente → badge "Hors ligne" visible → transaction sauvée localement → rétablir réseau → sync automatique. |

**Total Phase F6 : 7 tâches**

---

## Récapitulatif Frontend

| Phase | Nb tâches | Objectif |
|---|---|---|
| F1 — Setup | 13 | PWA + Mock Server + React Hook Form + Zod opérationnels |
| F2 — Routing | 8 | Navigation + guards |
| F3 — Composants UI | 45 | Tous les composants dumb testés (incl. Admin Gestionnaire, Config MoMo, UX) |
| F4 — Intégration API | 45 | Pages connectées à l'API (incl. gestion gestionnaire, config opérateurs, changement MDP) |
| F5 — Offline / PWA | 21 | Mode offline complet |
| F6 — Tests E2E | 7 | Parcours validés |
| **TOTAL** | **139** | — |

---

> **Version** : 1.0  
> **Dernière mise à jour** : Phase 5 — Roadmaps
