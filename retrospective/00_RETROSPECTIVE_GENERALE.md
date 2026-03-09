# 00 — RÉTROSPECTIVE GÉNÉRALE : SIKA BOX

> **Version** : 1.0  
> **Date** : 09 mars 2026  
> **Auteur** : Revue Architecturale (IA)  
> **Scope** : Analyse complète des documents 00 à 06 + `openapi.yaml`  
> **Objectif** : Identifier les forces, faiblesses, incohérences et recommandations avant le lancement de l'implémentation.

---

## Table des matières

1. [Synthèse Exécutive](#1-synthèse-exécutive)
2. [Forces du Projet](#2-forces-du-projet)
3. [Risques et Faiblesses](#3-risques-et-faiblesses)
4. [Verdict Global](#4-verdict-global)

---

## 1. Synthèse Exécutive

Le projet Sika Box repose sur **7 documents fondateurs** totalisant une couverture fonctionnelle, technique et opérationnelle remarquable pour un projet personnel :

| Document | Rôle | Qualité |
|----------|------|---------|
| `00_BIBLE_PROJET.md` | Source de vérité fonctionnelle | ★★★★★ Exemplaire |
| `01_ARCHITECTURE_TECHNIQUE.md` | Décisions techniques, stack, sécurité | ★★★★★ Exemplaire |
| `02_NORMES_OPERATIONNELLES.md` | Standards de code, TDD, gestion d'erreurs | ★★★★☆ Solide |
| `03_MOCKING_ET_CONTRACT_TESTING.md` | Stratégie de mocking et contract testing | ★★★☆☆ Sur-dimensionné |
| `04_ROADMAP_BACKEND.md` | 103 tâches backend structurées | ★★★★☆ Solide |
| `05_ROADMAP_FRONTEND.md` | 139 tâches frontend structurées | ★★★★☆ Solide |
| `06_PLAN_GENERAL.md` | Plan d'exécution, milestones, parallélisme | ★★★★☆ Solide |
| `openapi.yaml` | Contrat API REST complet | ★★★★☆ Solide |

**Conclusion en une phrase** : Le projet est **sur-documenté pour sa taille** (ce qui est un luxe, pas un défaut), mais **sous-découpé pour l'exécution** — 242 tâches monolithiques risquent de provoquer l'abandon avant la mise en production.

---

## 2. Forces du Projet

### 2.1 Clarté du domaine métier (Bible Projet — doc 00)

La Bible Projet est un modèle du genre. Elle atteint un niveau de rigueur rarement vu dans les projets personnels :

- **Dictionnaire du Domaine (Ubiquitous Language)** : Chaque terme a une définition unique, non ambiguë, avec des exemples concrets. Les termes du domaine sont en français (`caisseSalaire`, `beneficeNet`, `plafondCapital`), les termes techniques en anglais (`repository`, `sync`, `middleware`). Cette convention élimine toute ambiguïté.

- **Questions Ouvertes toutes résolues** : Les 11 questions identifiées (Q1–Q11) ont chacune une décision documentée avec sa justification. Aucun flou n'est laissé pour l'implémentation.

- **Personas réalistes** : L'Admin (investisseur technique) et la Gestionnaire (micro-entrepreneuse au Bénin avec connectivité intermittente) sont décrits avec leurs frustrations réelles, pas des personas théoriques.

- **Scope IN/OUT explicite** : La section 4.3 (Out of Scope) est aussi importante que le scope — elle empêche le scope creep en listant clairement ce qui n'est PAS dans la V1 et pourquoi.

- **Invariants métier formalisés** : Les règles comme "PV ≥ CA", "pas de DELETE", "somme des ratios = 100%", "fenêtre de correction de 10 minutes" sont énoncées comme des invariants système, pas comme des souhaits.

### 2.2 Choix architecturaux parfaitement calibrés (Architecture — doc 01)

Les 5 ADR (Architecture Decision Records) sont excellents :

| ADR | Décision | Qualité de la justification |
|-----|----------|----------------------------|
| ADR-001 | Monolithe Client-Heavy + BaaS vs Microservices | Parfaite. Le tableau Critère / Réalité du projet / Conséquence est imparable. |
| ADR-002 | PostgreSQL vs MongoDB vs Firestore | Excellente. L'argument ACID + INTEGER pour FCFA + RLS est le bon. |
| ADR-003 | React + Vite vs SvelteKit vs Next.js | Bonne. L'argument "taille de l'écosystème pour un dev solo" est pragmatique. |
| ADR-004 | Sync Engine custom vs PouchDB/CouchDB | Correcte mais le risque est sous-estimé (voir §3.2). |
| ADR-005 | Module partagé `@sikabox/core` | Excellente. C'est la meilleure décision architecturale du projet. |

**Points forts spécifiques** :

- Chaque ADR documente les **alternatives considérées** ET les **conséquences négatives acceptées** (dette technique). C'est de l'architecture honnête.
- Le choix de Supabase pour 2 utilisateurs est pragmatique — pas de surengineering, coût quasi nul, et la porte de sortie (self-host open-source) est documentée.
- Le diagramme C4 et le diagramme de séquence du flux de vente textile sont clairs et complets.

### 2.3 Le module `@sikabox/core` — décision structurante

C'est la meilleure décision technique du projet. Elle résout 3 problèmes simultanément :

1. **Pas de divergence client/serveur** : Le même code de répartition financière tourne dans le navigateur (offline) et dans les Edge Functions (validation serveur). Un bug corrigé dans `core` est corrigé partout.

2. **Testabilité maximale** : Fonctions pures (zéro I/O, zéro `Date.now()`, zéro `fetch`) → tests unitaires triviaux. La cible de 100% de couverture sur `@sikabox/core` est atteignable précisément grâce à cette pureté.

3. **Portabilité** : Si demain le frontend migre vers un autre framework ou si le backend quitte Supabase, la logique financière ne bouge pas.

Le fait que `@sikabox/core` n'importe ni `dexie`, ni `@supabase/supabase-js`, ni `react` garantit cette isolation. C'est du **Dependency Inversion Principle** appliqué à l'échelle du projet.

### 2.4 Le contrat API comme pivot de parallélisme

L'approche **API-First** (`openapi.yaml` → Prism mock → développement parallèle) est la bonne stratégie pour un développeur solo :

- Le frontend peut avancer avec le mock server Prism **sans attendre le backend**.
- Le backend peut avancer avec les tests SQL **sans attendre le frontend**.
- Les deux se rejoignent au SYNC POINT 1 (M8) pour une intégration maîtrisée.

Cette décision transforme un problème séquentiel (back → front) en un problème parallèle, ce qui réduit le chemin critique.

### 2.5 Sécurité en profondeur (Defense-in-Depth)

La sécurité est appliquée à **3 niveaux indépendants** :

| Niveau | Mécanisme | Ce qu'il protège |
|--------|-----------|------------------|
| **UI** | `AuthGuard`, `RoleGuard`, routes protégées, lazy loading conditionnel | L'Admin ne voit pas les routes Gestionnaire et vice versa. Le code Admin n'est même pas dans le bundle JS de la Gestionnaire. |
| **API** | JWT avec custom claims (`role: ADMIN / GESTIONNAIRE`), validation des requêtes | Même si l'UI est contournée, l'API refuse les opérations non autorisées. |
| **BDD** | Row Level Security (RLS) PostgreSQL | Même si l'API est contournée (accès direct à la BDD), les politiques RLS empêchent un GESTIONNAIRE de lire les transactions d'un autre ou de modifier une Variable Globale. |

**Points forts additionnels** :
- **Pas de `DELETE` SQL** : Les données financières sont immutables (append-only). Une correction crée des écritures inverses, pas une suppression.
- **Journal d'audit** : Chaque modification de Variable Globale est journalisée (ancienne valeur, nouvelle valeur, auteur, date).
- **Fenêtre de correction de 10 minutes** : Compromis entre flexibilité utilisateur et intégrité des données.

### 2.6 Normes opérationnelles rigoureuses (doc 02)

- **TDD obligatoire sur `@sikabox/core`** : Le workflow Red → Green → Refactor est documenté avec des exemples concrets. Les tests cas limites (bénéfice = 0, bénéfice = 1 FCFA, transaction charnière, montants élevés) sont listés explicitement.
- **Pattern Result/Either** : Les erreurs métier prévisibles (`VENTE_A_PERTE`, `FONDS_INSUFFISANT`) sont gérées par un type `Result<T, E>`, pas par des exceptions. Les exceptions sont réservées aux erreurs techniques.
- **Erreurs API RFC 7807** : Toutes les réponses d'erreur suivent un standard (Problem Details), avec mapping typé des codes d'erreur.
- **Logs JSON structurés** : Format standardisé avec niveaux (DEBUG/INFO/WARN/ERROR), module, action, contexte. Pas de `console.log("erreur: " + message)`.

### 2.7 Roadmaps granulaires (docs 04 et 05)

- Chaque tâche a un **identifiant unique** (B1.1, F3.14), des **dépendances explicites**, et un **critère de fin mesurable**.
- La **contrainte ≤ 2h par tâche** force la décomposition fine et empêche les tâches floues.
- Le format **test d'abord (🧪) → implémentation (🏗️)** dans les roadmaps rend le TDD structurel, pas optionnel.

---

## 3. Risques et Faiblesses

### 3.1 Risque #1 — Volume écrasant pour un développeur solo

**Constat** : 242 tâches réparties en 11 milestones, avec un chemin critique de 10 semaines (estimation optimiste). Pour un développeur solo travaillant en temps partiel sur un projet personnel, c'est un plan qui risque de provoquer l'abandon par épuisement avant d'atteindre un produit utilisable.

**Pourquoi c'est un vrai risque** :
- La première version utilisable (M8 — SYNC POINT 1) arrive après **~150 tâches** achevées. C'est trop tard pour un premier retour terrain.
- La Gestionnaire au Bénin ne peut rien tester tant que les 10 jalons ne sont pas atteints. Pas de feedback loop pendant des semaines.
- La motivation d'un développeur solo dépend de résultats tangibles rapides. Écrire 25 tests rouges (B3) sans jamais voir une UI est un exercice de discipline, pas de motivation.

**Impact** : Élevé. C'est le risque n°1 du projet.

**Détail** : voir [02_RECOMMANDATIONS.md](02_RECOMMANDATIONS.md) §1 (Découpage en sous-versions).

### 3.2 Risque #2 — Le Sync Engine custom est sous-estimé

**Constat** : L'ADR-004 estime le sync engine à "2-3 jours de développement". C'est optimiste. Les cas limites de synchronisation offline/online sont les bugs les plus vicieux d'une application offline-first.

**Cas limites critiques non détaillés** :
- Correction d'une transaction pendant une synchronisation en cours.
- Perte de réseau en plein milieu d'un POST `sync/push` (3 transactions envoyées, 2 reçues côté serveur, le client ne sait pas lesquelles).
- Reprise après crash du navigateur pendant une écriture IndexedDB.
- Conflit de version si l'Admin modifie une Variable Globale pendant que la Gestionnaire est offline.
- Quota IndexedDB dépassé sur un téléphone Android bas de gamme.

**Impact** : Élevé. Ces bugs apparaissent tard, en production, sur le terrain au Bénin — pas dans les tests unitaires.

**Détail** : voir [02_RECOMMANDATIONS.md](02_RECOMMANDATIONS.md) §2 (Simplification du sync).

### 3.3 Risque #3 — Contract Testing (Pact) sur-dimensionné

**Constat** : Le document 03 introduit Pact (contract testing framework) pour valider la cohérence entre le frontend (consumer) et le backend (provider). Pact est conçu pour des **équipes distinctes** qui ne partagent pas le même codebase.

**Pourquoi c'est sur-dimensionné** :
- Le même développeur écrit les deux côtés (consumer + provider).
- Le contrat est déjà garanti par 3 mécanismes :
  1. `openapi.yaml` — source de vérité du contrat.
  2. Prism — valide les requêtes/réponses contre le schéma OpenAPI.
  3. MSW (Mock Service Worker) — les tests frontend utilisent des mocks conformes à l'OpenAPI.
- Pact ajoute une infrastructure (Pact Broker, pipeline CI dédié, fichiers `.json` intermédiaires) qui consomme du temps de maintenance sans valeur proportionnelle pour un projet solo.

**Impact** : Moyen. Ce n'est pas un risque technique (Pact ne va rien casser), mais un coût d'opportunité — le temps investi dans Pact serait mieux dépensé sur le sync engine ou l'UX.

**Détail** : voir [02_RECOMMANDATIONS.md](02_RECOMMANDATIONS.md) §3.

### 3.4 Risque #4 — Schéma IndexedDB sous-documenté

**Constat** : Le schéma PostgreSQL est documenté en détail (tables, types, contraintes CHECK, index, RLS policies, triggers, fonctions SQL). En revanche, le **schéma IndexedDB** (source de vérité locale en mode offline) est mentionné en une ligne :

> `db.ts` avec schéma Dexie : tables `transactions`, `mouvements_caisse`, `variables_globales`, `operateurs_momo`, `sync_queue`. (F1.8)

**Ce qui manque** :
- Les index Dexie.js (nécessaires pour les requêtes de filtrage par type, date, opérateur).
- La stratégie de migration de schéma IndexedDB (Dexie supporte les versions, mais ça doit être planifié).
- Les invariants de cohérence locale (le solde des caisses calculé localement doit-il être un cache dérivé ou un champ stocké ?).
- La stratégie de purge (combien de transactions garder localement ? Toutes ? Les 30 derniers jours ?).
- Le format de la `sync_queue` (quels champs ? statut ? nombre de retries ?).

**Impact** : Moyen. L'implémentation nécessitera des décisions ad hoc qui auraient dû être documentées.

### 3.5 Risque #5 — Pas de stratégie de backup/restore

**Constat** : L'application manipule des données financières réelles (FCFA). Les données vivent à deux endroits :
- **IndexedDB** (navigateur du téléphone) — volatile, effacé si le cache est vidé, le téléphone est perdu, ou le navigateur est réinstallé.
- **PostgreSQL Supabase** — persistant, mais ne contient que les transactions synchronisées.

**Scénario catastrophe non adressé** :
1. La Gestionnaire saisit 15 transactions sur 2 jours sans connexion internet.
2. Son téléphone tombe dans l'eau / est volé / le navigateur crash.
3. Les 15 transactions sont perdues car jamais synchronisées.

**Ce qui manque** :
- Un indicateur visuel proéminent : "Dernière synchronisation : il y a X heures" avec alerte si > 24h.
- Une stratégie de backup périodique (export local ? sync forcé via Wi-Fi ?).
- Une documentation du processus de recovery (comment repartir de zéro si les données locales sont perdues).

**Impact** : Élevé pour la crédibilité du produit. Perdre les données financières d'une micro-entrepreneuse est un échec fonctionnel.

### 3.6 Risque #6 — Pas de tests d'accessibilité

**Constat** : La Gestionnaire est décrite comme ayant une "maîtrise limitée des outils numériques complexes", utilisant l'app "debout, d'une seule main, avec une connectivité réseau intermittente" sur un smartphone Android (probablement écran 5"–6.5").

**Ce qui n'est pas testé** :
- **Taille des cibles tactiles** : les boutons et inputs sont-ils assez grands pour une utilisation d'une seule main ? (Minimum recommandé : 48x48dp selon les guidelines Android Material).
- **Contraste des couleurs** : le code couleur des caisses (vert/rouge/orange/bleu) est-il accessible pour les daltoniens ? (WCAG 2.1 AA minimum).
- **Taille de police** : les montants FCFA (information critique) sont-ils lisibles en plein soleil sur un écran de 5" ?
- **Feedback haptique/sonore** : la confirmation d'une transaction est-elle perceptible dans un environnement bruyant (marché) ?

**Impact** : Moyen à élevé. Une app financière inutilisable sur le terrain est une app inutile. shadcn/ui (Radix UI) offre une base accessible, mais les tests doivent le vérifier.

### 3.7 Risque #7 — Dépendance au tier gratuit Supabase

**Constat** : Le projet est dimensionné pour fonctionner sur le tier gratuit de Supabase. C'est pragmatique, mais les limites du tier gratuit de Supabase doivent être connues :

| Limite | Tier gratuit Supabase | Impact Sika Box |
|--------|----------------------|-----------------|
| Base de données | 500 MB | Suffisant pour des milliers de transactions (estimé < 10 MB pour V1). |
| Edge Functions | 500 000 invocations/mois | Suffisant pour 2 utilisateurs. |
| Auth | 50 000 MAU | Largement suffisant. |
| Stockage fichier | 1 GB | Non utilisé en V1. |
| **Pause après inactivité** | **7 jours sans requête → BDD pausée** | **Risque si la Gestionnaire ne se connecte pas pendant 7 jours** (vacances, maladie). |

**Le risque principal** : le projet free-tier de Supabase est **pausé automatiquement** après 7 jours d'inactivité réseau. Si la Gestionnaire travaille uniquement offline pendant une semaine, la BDD est pausée. La prochaine sync échouera tant que le projet n'est pas réactivé manuellement.

**Impact** : Moyen. Mitigeable en ajoutant un cron job de "keep-alive" (un simple ping toutes les 48h) ou en passant au tier Pro ($25/mois) si le projet devient sérieux.

---

## 4. Verdict Global

### 4.1 Score par dimension

| Dimension | Score | Commentaire |
|-----------|-------|-------------|
| **Clarté du besoin** | ★★★★★ | Personas, dictionnaire du domaine, scope IN/OUT — tout est limpide. |
| **Architecture** | ★★★★★ | ADR documentés, choix calibrés, defense-in-depth. |
| **Sécurité** | ★★★★★ | RBAC à 3 niveaux, append-only, audit trail. |
| **Normes de code** | ★★★★☆ | SOLID, TDD, Result pattern, logs structurés. Point perfectible : ESLint flat config. |
| **Testabilité** | ★★★★★ | `@sikabox/core` pur, fake-indexeddb, MSW, Playwright. |
| **Faisabilité solo** | ★★★☆☆ | 242 tâches en un seul bloc. Besoin de sous-versions incrémentales. |
| **Résilience offline** | ★★★☆☆ | L'architecture est là, mais le sync engine et le backup sont sous-documentés. |
| **Accessibilité terrain** | ★★☆☆☆ | Pas de tests d'accessibilité planifiés malgré un persona explicitement non-technique. |

### 4.2 Recommandation finale

> **Le projet a des fondations exceptionnelles. Le plan est trop ambitieux en une seule itération.**  
> La priorité absolue avant de commencer l'implémentation est de **découper la V1 en sous-versions livrables** (V0.1 → V0.2 → V0.3 → V1.0), chacune avec un produit utilisable sur le terrain.

Les détails opérationnels sont dans les documents suivants de cette rétrospective :

| Document | Contenu |
|----------|---------|
| [01_INCOHERENCES.md](01_INCOHERENCES.md) | Liste détaillée des incohérences entre les documents |
| [02_RECOMMANDATIONS.md](02_RECOMMANDATIONS.md) | Recommandations actionnables avec priorités |
| [03_PROPOSITION_SOUS_VERSIONS.md](03_PROPOSITION_SOUS_VERSIONS.md) | Découpage proposé en V0.1, V0.2, V0.3, V1.0 |

---

*Ce document constitue une rétrospective analytique du projet Sika Box. Il ne modifie aucun document existant — les mises à jour éventuelles des documents 00–06 sont à effectuer après validation de cette rétrospective.*
