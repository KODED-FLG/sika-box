# 03 — PROPOSITION DE SOUS-VERSIONS INCRÉMENTALES

> **Version** : 1.0  
> **Date** : 09 mars 2026  
> **Réf** : REC-01 de [02_RECOMMANDATIONS.md](./02_RECOMMANDATIONS.md)  
> **Objectif** : Découper les 242 tâches (103 backend + 139 frontend) en sous-versions livrables, chacune apportant une valeur utilisable à Awa.

---

## Philosophie

La roadmap actuelle organise les tâches par **couche technique** (B1→B6, F1→F6). C'est excellent pour la rigueur. Mais ça signifie que la première version utilisable n'arrive qu'après ~150 tâches (M8).

La proposition ci-dessous réorganise les tâches par **tranche fonctionnelle** : chaque sous-version livre un produit utilisable, testable, et déployable. Les numéros de tâches (B*.*, F*.*) restent les mêmes — on les regroupe différemment.

### Principes

1. **Online-first** : V0.1 à V0.3 fonctionnent exclusivement avec Supabase en ligne. Pas d'IndexedDB, pas de sync.
2. **1 slice fonctionnel par version** : chaque sous-version ajoute un domaine métier complet (saisie → calculs → affichage → tests E2E).
3. **Feedback dès V0.1** : Awa peut tester la saisie de ventes textiles dès la fin de V0.1.
4. **Les tâches ne changent pas** : seul leur ordre d'exécution est réarrangé.

---

## Vue d'ensemble

```
V0.1 ─── Vente Textile + Dashboard ───── ⏱ ~3-4 semaines ───── 🎯 Premier feedback Awa
  │
V0.2 ─── + MoMo (Dépôt/Retrait/Commission) ── ⏱ ~2-3 semaines
  │
V0.3 ─── + Admin + Corrections + Rapport ──── ⏱ ~2-3 semaines ── 🎯 App complète (online)
  │
V1.0 ─── + Mode Offline + Sync + PWA Install ── ⏱ ~3-4 semaines ── 🎯 Version finale
```

---

## V0.1 — Vente Textile + Dashboard

> **Objectif** : Awa peut saisir une vente textile, voir la ventilation automatique, consulter son dashboard avec les 4 caisses, et voir l'historique de ses ventes. Authentification fonctionnelle.
>
> **Persona cible** : Gestionnaire (Awa)  
> **Mode** : Online uniquement  
> **Livrable** : PWA déployée sur Vercel/Netlify, Supabase en production (free tier)

### Périmètre fonctionnel

| Fonctionnalité | Incluse ? | Notes |
|----------------|-----------|-------|
| Login / Changer mot de passe | ✅ | Auth Supabase GoTrue |
| Dashboard (4 caisses + progression) | ✅ | Sans alertes MoMo |
| Saisie vente textile | ✅ | Aperçu bénéfice en temps réel |
| Ventilation automatique (50/30/20) | ✅ | Moteur de répartition complet |
| Gestion plafond capital | ✅ | Bascule ratios post-plafond |
| Historique des transactions | ✅ | Filtré ventes textiles uniquement |
| Opérations MoMo | ❌ | → V0.2 |
| Corrections de transaction | ❌ | → V0.3 |
| Admin (variables, gestionnaires) | ❌ | → V0.3 |
| Rapport trimestriel | ❌ | → V0.3 |
| Mode offline / sync | ❌ | → V1.0 |

### Tâches Backend (V0.1)

| Phase | Tâches incluses | Nb | Justification |
|-------|-----------------|-----|----------------|
| **B1** | B1.1 → B1.7 | 7 | Setup complet (irréductible) |
| **B2** | B2.1 → B2.4, B2.7 → B2.16, B2.18 → B2.20, B2.23 → B2.25 | 20 | Tables, RLS, triggers, vue soldes. Sans B2.5-B2.6 (opérateurs MoMo), B2.17 (RLS MoMo), B2.21-B2.22 (fonds MoMo), B2.26-B2.27 (rappel commission) |
| **B3** | B3.1 → B3.13, B3.21 → B3.23 | 15 | Tests : Result, types, répartition, validation vente, ratios. Sans MoMo (B3.14-B3.17), sans correction (B3.18-B3.20), sans rapport (B3.24-B3.25) |
| **B4** | B4.1 → B4.7, B4.10 | 8 | Implémentation : foundations, moteur répartition, validation vente, ratios |
| **B5** | B5.1 → B5.3, B5.11 → B5.12 | 5 | Setup Edge Functions + RPC `creer_vente_textile` |
| **B6** | B6.1 | 1 | E2E flux vente textile |
| | | **56** | |

### Tâches Frontend (V0.1)

| Phase | Tâches incluses | Nb | Justification |
|-------|-----------------|-----|----------------|
| **F1** | F1.1 → F1.7, F1.9 → F1.13 | 12 | Setup complet sauf F1.8 (Dexie → V1.0) |
| **F2** | F2.1 → F2.8 | 8 | Routing complet (nécessaire dès le début) |
| **F3** | F3.1 → F3.4, F3.9 → F3.14, F3.25 → F3.32, F3.39 → F3.43 | 23 | Caisses, transactions, formulaire vente, composants communs, login, toast/skeleton/empty. Sans MoMo (F3.5-F3.8, F3.15-F3.18), sans admin (F3.21-F3.24, F3.33-F3.38), sans correction (F3.19-F3.20), sans changement MDP (F3.44-F3.45) |
| **F4** | F4.1 → F4.6, F4.23 → F4.26, F4.29 → F4.30, F4.41 → F4.43 | 15 | API client, mutation vente, pages Dashboard + Vente + Historique, auth |
| **F5** | — | 0 | Reporté à V1.0 |
| **F6** | F6.1 → F6.3 | 3 | E2E : setup + login + vente |
| | | **61** | |

### Total V0.1 : ~117 tâches

> C'est encore un volume conséquent, mais c'est incompressible pour avoir un produit fonctionnel. La bonne nouvelle : ~40 de ces tâches sont du setup/infrastructure qui ne sera fait qu'une fois.

---

## V0.2 — Opérations MoMo

> **Objectif** : Awa peut enregistrer les dépôts, retraits, et commissions Mobile Money. Le dashboard affiche les fonds de roulement par opérateur et les alertes de rappel commission.
>
> **Prérequis** : V0.1 déployée

### Périmètre fonctionnel additionnel

| Fonctionnalité | Statut |
|----------------|--------|
| Dashboard : fonds roulement MoMo par opérateur | ✅ Ajouté |
| Dashboard : alertes rappel commission | ✅ Ajouté |
| Saisie dépôt / retrait MoMo | ✅ Ajouté |
| Saisie commission MoMo | ✅ Ajouté |
| Vérification fonds avant dépôt | ✅ Ajouté |
| Historique : inclut transactions MoMo | ✅ Ajouté |

### Tâches Backend (V0.2)

| Phase | Tâches incluses | Nb |
|-------|-----------------|-----|
| **B2** | B2.5 → B2.6, B2.17, B2.21 → B2.22, B2.26 → B2.27 | 7 |
| **B3** | B3.14 → B3.17 | 4 |
| **B4** | B4.8 → B4.9 | 2 |
| **B5** | B5.13 → B5.16 | 4 |
| **B6** | B6.2 | 1 |
| | | **18** |

### Tâches Frontend (V0.2)

| Phase | Tâches incluses | Nb |
|-------|-----------------|-----|
| **F3** | F3.5 → F3.8, F3.15 → F3.18 | 8 |
| **F4** | F4.7 → F4.10, F4.27 → F4.28 | 6 |
| **F6** | F6.4 | 1 |
| | | **15** |

### Total V0.2 : ~33 tâches

> Sprint rapide. Beaucoup d'infrastructure est déjà en place (moteur de répartition, formulaires, pattern TDD). Les commissions MoMo réutilisent le même moteur que les ventes textiles.

---

## V0.3 — Admin + Corrections + Rapport

> **Objectif** : L'Admin peut gérer les variables globales, créer des gestionnaires, configurer les opérateurs MoMo. Awa peut corriger une transaction dans la fenêtre de 10 min. Rapport trimestriel disponible.
>
> **Prérequis** : V0.2 déployée

### Périmètre fonctionnel additionnel

| Fonctionnalité | Statut |
|----------------|--------|
| Correction de transaction (fenêtre 10 min) | ✅ Ajouté |
| Page Admin : Variables Globales (ratios, plafond) | ✅ Ajouté |
| Page Admin : Créer/Désactiver Gestionnaire | ✅ Ajouté |
| Page Admin : Configurer Opérateurs MoMo | ✅ Ajouté |
| Page Admin : Journal d'Audit | ✅ Ajouté |
| Page Admin : Rapport Trimestriel | ✅ Ajouté |
| Changement de mot de passe (première connexion) | ✅ Ajouté |
| Verrouillage automatique par inactivité | ✅ Ajouté |

### Tâches Backend (V0.3)

| Phase | Tâches incluses | Nb |
|-------|-----------------|-----|
| **B3** | B3.18 → B3.20, B3.24 → B3.25 | 5 |
| **B4** | B4.11 → B4.14 | 4 |
| **B5** | B5.9 → B5.10, B5.17 → B5.22 | 8 |
| **B6** | B6.3 → B6.4, B6.6 → B6.8 | 5 |
| | | **22** |

### Tâches Frontend (V0.3)

| Phase | Tâches incluses | Nb |
|-------|-----------------|-----|
| **F3** | F3.19 → F3.24, F3.33 → F3.38, F3.44 → F3.45 | 14 |
| **F4** | F4.11 → F4.22, F4.31 → F4.40, F4.44 → F4.45 | 24 |
| **F6** | F6.5 → F6.6 | 2 |
| | | **40** |

### Total V0.3 : ~62 tâches

> À la fin de V0.3, l'app est **fonctionnellement complète en mode online**. Toutes les fonctionnalités de la Bible sont couvertes, sauf le mode offline.

---

## V1.0 — Mode Offline + Sync + PWA Install

> **Objectif** : L'app fonctionne sans connexion Internet. Les transactions sont stockées localement et synchronisées au retour du réseau. PWA installable sur le téléphone d'Awa.
>
> **Prérequis** : V0.3 déployée et stable

### Périmètre fonctionnel additionnel

| Fonctionnalité | Statut |
|----------------|--------|
| Stockage local IndexedDB (Dexie.js) | ✅ Ajouté |
| File d'attente offline (OfflineQueue) | ✅ Ajouté |
| Sync push/pull automatique | ✅ Ajouté |
| Service Worker (cache Workbox) | ✅ Ajouté |
| Notification de mise à jour | ✅ Ajouté |
| Invite d'installation PWA (A2HS) | ✅ Ajouté |
| Indicateur online/offline contextuel | ✅ Renforcé |

### Tâches Backend (V1.0)

| Phase | Tâches incluses | Nb |
|-------|-----------------|-----|
| **B5** | B5.4 → B5.8 (Edge Functions sync push/pull) | 5 |
| **B6** | B6.5 (E2E sync) | 1 |
| | | **6** |

> **Note** : Si REC-04 est suivie (supprimer Pact), les tâches de contract testing Pact sont retirées. Les 5 tâches sync restent car elles sont nécessaires.

### Tâches Frontend (V1.0)

| Phase | Tâches incluses | Nb |
|-------|-----------------|-----|
| **F1** | F1.8 (Setup Dexie.js + fake-indexeddb) | 1 |
| **F5** | F5.1 → F5.21 (Stores, IndexedDB, Queue, Sync, SW) | 21 |
| **F6** | F6.7 (E2E mode offline) | 1 |
| | | **23** |

### Total V1.0 : ~29 tâches

> C'est la partie la plus **risquée techniquement** (sync engine), mais le scope fonctionnel est le plus petit. L'app est déjà complète en mode online — V1.0 ajoute la résilience.

---

## Tableau récapitulatif

| Version | Scope fonctionnel | Backend | Frontend | Total | Cumulé |
|---------|-------------------|---------|----------|-------|--------|
| **V0.1** | Vente Textile + Dashboard + Auth | 56 | 61 | **117** | 117 |
| **V0.2** | + MoMo (dépôt/retrait/commission) | 18 | 15 | **33** | 150 |
| **V0.3** | + Admin + Corrections + Rapport | 22 | 40 | **62** | 212 |
| **V1.0** | + Offline + Sync + PWA | 6 | 23 | **29** | 241 |

> **Note** : 241 au lieu de 242 car B6.7 (test RLS multi-gestionnaire) est optionnel dans la V1 mono-utilisateur.

---

## Jalons et critères de passage

### V0.1 → V0.2

| Critère | Description |
|---------|-------------|
| ✅ Awa peut se connecter | Login fonctionnel avec Supabase |
| ✅ Saisie vente textile | Formulaire → ventilation → confirmation |
| ✅ Dashboard affiche les soldes | 4 caisses avec montants corrects |
| ✅ Historique consultable | Liste des ventes avec filtres |
| ✅ CI verte | Lint + TypeCheck + Tests + Build passent |
| ✅ Déployée | Accessible sur une URL publique |
| 🗣 Feedback | Awa a testé et ses retours sont intégrés |

### V0.2 → V0.3

| Critère | Description |
|---------|-------------|
| ✅ Dépôt/Retrait MoMo fonctionnels | Sélection opérateur, vérification fonds |
| ✅ Commission MoMo fonctionnelle | Ventilation comme bénéfice net |
| ✅ Dashboard MoMo complet | Fonds roulement + alertes rappel |
| 🗣 Feedback | Awa a testé les opérations MoMo |

### V0.3 → V1.0

| Critère | Description |
|---------|-------------|
| ✅ Admin peut configurer | Variables, gestionnaires, opérateurs |
| ✅ Correction fonctionne | Fenêtre 10 min, écritures inverses |
| ✅ Rapport trimestriel | Agrégation correcte, données fiables |
| ✅ App stable en mode online | Aucun bug bloquant depuis 1 semaine |
| 🗣 Feedback | Admin + Gestionnaire ont validé tous les flux |

### V1.0 — Release

| Critère | Description |
|---------|-------------|
| ✅ Saisie hors ligne | Transaction enregistrée localement |
| ✅ Sync automatique | Push au retour réseau, pull des mises à jour |
| ✅ PWA installable | A2HS sur Android Chrome |
| ✅ Tests E2E offline | Playwright network emulation vert |
| ✅ Stress test sync | 50 transactions en queue → sync → cohérence |

---

## Impact sur les documents existants

Si cette proposition est adoptée, les documents suivants doivent être mis à jour :

| Document | Modification nécessaire |
|----------|------------------------|
| `04_ROADMAP_BACKEND.md` | Ajouter un tag `[V0.1]` / `[V0.2]` / `[V0.3]` / `[V1.0]` à chaque tâche |
| `05_ROADMAP_FRONTEND.md` | Idem — tag par sous-version |
| `06_PLAN_GENERAL.md` | Redéfinir les milestones M0-M11 en 4 milestones (V0.1, V0.2, V0.3, V1.0) |
| `01_ARCHITECTURE_TECHNIQUE.md` | Ajouter ADR-008 (cycle de sous-versions incrémentales) |
| `03_MOCKING_ET_CONTRACT_TESTING.md` | Retirer Pact si REC-04 est acceptée |

---

## Visualisation temporelle

```
Semaine :  1   2   3   4   5   6   7   8   9  10  11  12
           │───────────────│───────│───────────│──────────│
           │    V0.1       │ V0.2  │   V0.3    │  V1.0    │
           │ Setup + Vente │ MoMo  │ Admin +   │ Offline  │
           │ + Dashboard   │       │ Correct.  │ + Sync   │
           │               │       │ + Rapport │          │
           │       🗣️      │  🗣️   │    🗣️     │   🚀     │
           │   Feedback    │Feedbk │  Feedback │ Release  │
```

> Les durées sont indicatives. Avec un rythme de 3-5 tâches/jour (tâches de ≤2h), les estimations sont réellement atteignables pour un développeur solo à temps plein.

---

## FAQ

### Pourquoi ne pas commencer par MoMo ?

La vente textile est le flux le plus simple (2 inputs : PV + CA) et le plus fréquent pour Awa. Il valide toute la chaîne : saisie → calcul → ventilation → persistance → affichage. Une fois ce flux rodé, ajouter MoMo est incrémental.

### Pourquoi reporter les corrections à V0.3 ?

La correction est indépendante de la saisie. Awa peut toujours faire une nouvelle saisie pour corriger une erreur en V0.1/V0.2. La mécanique de correction (fenêtre 10 min, écritures inverses) est complexe et nécessite un moteur de répartition déjà mature.

### Pourquoi reporter l'offline à V1.0 ?

Le mode offline est la fonctionnalité la plus risquée techniquement (sync engine, gestion de conflits, file d'attente). En le reportant, on s'assure que l'app est fonctionnellement correcte en mode online avant d'ajouter cette couche de complexité. De plus, Awa utilise l'app principalement dans sa boutique, qui a généralement du réseau.

### Les tâches de setup (B1, F1) sont-elles vraiment si nombreuses ?

Oui, mais elles sont rapides (< 1h chacune en moyenne). Le monorepo, la CI, les linters, les outils de test — tout cela est fait une seule fois et sert pour toutes les sous-versions.

---

*Ce document est une proposition. Il doit être validé avant de modifier les roadmaps existantes. Une fois validé, les tags `[V0.1]`–`[V1.0]` seront ajoutés à chaque tâche dans les documents 04 et 05.*
