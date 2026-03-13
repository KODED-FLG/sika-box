# 00 — BIBLE PROJET : SIKA BOX

> **Version** : 1.2  
> **Date** : 06 mars 2026  
> **Auteur** : Lead Product Manager (IA)  
> **Statut** : Validé — Toutes les Questions Ouvertes résolues

---

## Table des matières

1. [Vision & Objectifs (Elevator Pitch)](#1-vision--objectifs-elevator-pitch)
2. [Acteurs & Personas](#2-acteurs--personas)
3. [Dictionnaire du Domaine (Ubiquitous Language)](#3-dictionnaire-du-domaine-ubiquitous-language)
4. [Scope Fonctionnel (Macro)](#4-scope-fonctionnel-macro)
5. [Questions Ouvertes](#5-questions-ouvertes)

---

## 1. Vision & Objectifs (Elevator Pitch)

### 1.1 Problème résolu

Les micro-entrepreneures qui gèrent plusieurs activités simultanées (commerce de détail + services financiers comme le Mobile Money) font face à un problème structurel : **la confusion des fonds**. Sans outil adapté, le capital de roulement, les bénéfices, les fonds MoMo confiés par les clients et les dépenses personnelles se mélangent dans une seule poche. Ce phénomène conduit à :

- L'érosion invisible du capital de roulement (on dépense l'argent qui devait racheter le stock).
- L'impossibilité de rembourser un investisseur de manière structurée.
- L'absence totale de visibilité sur la rentabilité réelle de chaque activité.
- Un risque de faillite silencieuse malgré un chiffre d'affaires apparent.

### 1.2 Solution proposée

**Sika Box** est une application mobile (PWA Mobile-First, Offline-First) qui impose une **séparation automatique et stricte des caisses**. À chaque transaction enregistrée (vente textile ou opération MoMo), l'application ventile instantanément les flux financiers dans des caisses virtuelles isolées, selon des règles paramétrables. La gestionnaire n'a aucune décision d'allocation à prendre : le système le fait pour elle.

### 1.3 Proposition de valeur unique

> **Sika Box transforme chaque vente en une décision financière automatisée** : reconstitution du stock, rémunération de la gestionnaire, remboursement de l'investisseur et constitution d'une réserve — sans effort cognitif, sans connexion internet requise, et avec une traçabilité complète.

Aucune application grand public de gestion financière ne propose ce niveau de séparation des fonds avec des règles de répartition dynamiques et configurables, adaptées au contexte des micro-entreprises d'Afrique de l'Ouest.

### 1.4 KPIs de succès

| KPI | Cible V1 | Fréquence de mesure |
|-----|----------|---------------------|
| Taux d'adoption | La gestionnaire utilise l'app pour 100 % de ses transactions quotidiennes | Hebdomadaire |
| Intégrité du capital stock | Solde de la Caisse Stock ≥ somme des Coûts d'Achat des articles en inventaire | Continue (invariant système) |
| Progression du remboursement | Réduction mensuelle mesurable du solde restant à rembourser | Mensuelle |
| Isolation MoMo | Zéro prélèvement sur le Fonds de Roulement MoMo pour des dépenses hors MoMo | Continue (invariant système) |
| Disponibilité hors-ligne | 100 % des fonctionnalités critiques (saisie de vente, consultation des soldes) utilisables sans réseau | Continue |
| Temps de saisie d'une transaction | < 15 secondes pour enregistrer une vente complète (PV + CA) | Trimestrielle (audit UX) |
| Fiabilité de synchronisation | Zéro perte de données lors des synchronisations Cloud | Continue |

---

## 2. Acteurs & Personas

### 2.1 Persona 1 : L'Administrateur / Investisseur

| Attribut | Description |
|----------|-------------|
| **Rôle système** | `ADMIN` |
| **Profil réel** | L'ingénieur développeur (toi) ou toute personne ayant investi le capital initial. N'utilise pas l'app au quotidien pour les transactions. |
| **Objectif principal** | Avoir une visibilité totale sur la santé financière des deux activités, suivre le remboursement de son capital, et garantir que les règles de gestion sont respectées. |
| **Besoins** | — Consulter les soldes de toutes les caisses en temps réel. |
| | — Consulter l'historique complet des transactions. |
| | — Modifier les Variables Globales (Plafond de Capital, Ratios de Répartition). |
| | — Accéder aux rapports trimestriels consolidés. |
| | — Créer ou désactiver le compte Gestionnaire. |
| **Permissions métiers** | — Lecture/écriture sur les Variables Globales Configurables. |
| | — Lecture sur toutes les caisses et tous les historiques. |
| | — Gestion des comptes utilisateurs. |
| | — Accès aux rapports et exports de données. |
| | — **Ne saisit PAS de transactions** (ce n'est pas son rôle opérationnel). |
| **Frustrations** | — Ne pas savoir si le capital est en train d'être grignoté. |
| | — Devoir appeler pour avoir un état des lieux. |

### 2.2 Persona 2 : La Gestionnaire / Opératrice

| Attribut | Description |
|----------|-------------|
| **Rôle système** | `GESTIONNAIRE` |
| **Profil réel** | L'entrepreneuse partenaire au Bénin. Utilise l'app quotidiennement, souvent debout, d'une seule main, avec une connectivité réseau intermittente. Maîtrise limitée des outils numériques complexes. |
| **Objectif principal** | Enregistrer rapidement chaque transaction, voir combien elle peut dépenser pour elle-même (Caisse Salaire), et ne jamais toucher à l'argent qui ne lui appartient pas. |
| **Besoins** | — Saisir une vente textile en moins de 15 secondes. |
| | — Saisir une opération MoMo (dépôt/retrait + commission). |
| | — Visualiser instantanément le solde de ses caisses autorisées. |
| | — Comprendre visuellement quel argent est « libre » vs « bloqué ». |
| | — Fonctionner sans réseau internet. |
| **Permissions métiers** | — Création de transactions (ventes textiles, opérations MoMo). |
| | — Lecture des soldes de caisses (toutes les caisses, en lecture seule). |
| | — Consultation de son propre historique de transactions. |
| | — **Ne peut PAS modifier les Variables Globales.** |
| | — **Peut corriger une transaction dans les 10 minutes suivant sa saisie (Fenêtre de Correction).** |
| | — **Ne peut PAS supprimer ou altérer une transaction au-delà de la Fenêtre de Correction.** |
| **Frustrations** | — Interfaces complexes avec trop de champs. |
| | — Peur de « se tromper » (atténuée par la Fenêtre de Correction de 10 min). |
| | — Ne pas savoir combien elle peut réellement dépenser. |

---

## 3. Dictionnaire du Domaine (Ubiquitous Language)

> **Règle absolue** : Ces termes sont les seuls autorisés dans le code, les interfaces, la documentation et les échanges. Tout synonyme ou terme alternatif est proscrit pour éviter toute ambiguïté.

### 3.1 Concepts fondamentaux

| Terme | Définition | Exemple |
|-------|------------|---------|
| **Caisse** | Conteneur virtuel isolé qui accumule des fonds selon une fonction précise. Une caisse a un solde, un historique de mouvements et des règles d'accès. Aucun transfert manuel entre caisses n'est autorisé. | Caisse Stock, Caisse Salaire |
| **Mouvement de Caisse** | Enregistrement unitaire d'une entrée ou sortie de fonds dans une Caisse. Chaque mouvement est lié à une Transaction source. Immutable une fois créé. | +3 000 FCFA dans Caisse Salaire suite à la Vente #042 |
| **Transaction** | Événement commercial enregistré par la Gestionnaire. Génère automatiquement un ou plusieurs Mouvements de Caisse. Immutable une fois validée. | Vente textile, Opération MoMo |

### 3.2 Les Caisses

| Terme | Définition | Règles |
|-------|------------|--------|
| **Caisse Stock** | Reçoit le Coût d'Achat de chaque article vendu. Représente le capital nécessaire pour reconstituer le stock à l'identique. | Bloquée. Aucun retrait autorisé sauf rachat de stock (V2 potentiellement). En V1, cette caisse ne fait que croître. |
| **Caisse Salaire** | Reçoit la part du Bénéfice Net destinée aux dépenses personnelles de la Gestionnaire. | Libre. La Gestionnaire peut considérer ce solde comme son « argent disponible ». |
| **Caisse Remboursement** | Reçoit la part du Bénéfice Net destinée au remboursement du capital investi, jusqu'à atteindre le Plafond de Capital. | Bloquée. Active tant que le Plafond de Capital n'est pas atteint. Passe à 0 % de prélèvement une fois le plafond atteint. |
| **Caisse Réserve** | Reçoit la part du Bénéfice Net destinée au réinvestissement dans le stock ou à la croissance de l'activité. | Semi-bloquée. Consultable mais non retirable sans décision Admin (hors scope V1). |
| **Fonds de Roulement MoMo** | Capital dédié exclusivement aux opérations de dépôt/retrait Mobile Money. Totalement isolé des autres activités. **Un Fonds de Roulement distinct existe par Opérateur MoMo** (voir section 3.6). | Bloqué et isolé. Son solde initial est saisi à la configuration de l'app (Variable Globale Configurable par l'Admin). Les dépôts clients diminuent l'e-float (le kiosque avance le solde mobile), les retraits clients augmentent l'e-float. Seule la Commission en sort vers le circuit de répartition. |

### 3.3 Variables et mécanismes

| Terme | Définition | Valeur initiale |
|-------|------------|-----------------|
| **Plafond de Capital** | Montant total que la Caisse Remboursement doit atteindre pour que l'investissement initial soit considéré comme remboursé. Variable Globale Configurable. | 500 000 FCFA |
| **Ratios de Répartition** | Triplet de pourcentages (S/R/Re) qui définit comment le Bénéfice Net est ventilé entre la Caisse Salaire (S), la Caisse Remboursement (R) et la Caisse Réserve (Re). Variable Globale Configurable. La somme doit toujours égaler 100 %. | 50 / 30 / 20 |
| **Ratios post-Plafond** | Doublet de pourcentages (S/Re) appliqué automatiquement lorsque le Plafond de Capital est atteint. Remplace les Ratios de Répartition. **Valeur fixe**, non proportionnelle aux Ratios initiaux. Variable Globale Configurable. | 70 / 30 |
| **Bénéfice Net** | Gain réel dégagé par une transaction, après soustraction de tous les coûts. Pour une vente textile : PV − CA. Pour une opération MoMo : la Commission. C'est la seule somme soumise à la répartition par les Ratios. | — |
| **Prix de Vente (PV)** | Montant effectivement encaissé auprès du client pour un article textile vendu. Doit être ≥ au Coût d'Achat (vente à perte interdite). | — |
| **Coût d'Achat (CA)** | Prix payé par la Gestionnaire pour acquérir l'article textile auprès de son fournisseur. | — |
| **Commission** | Somme globale des frais perçus par le kiosque MoMo sur une période donnée. La Commission peut être saisie de manière différée (pas nécessairement après chaque transaction MoMo). C'est le Bénéfice Net de l'activité MoMo. | — |
| **Opérateur MoMo** | Fournisseur de services Mobile Money. Trois opérateurs sont actifs au Bénin : **MTN Mobile Money**, **Moov Money** et **Celtis Cash**. Chaque opérateur dispose de son propre Fonds de Roulement MoMo et de ses propres taux de commission. | — |
| **Solde Initial MoMo** | Montant du Fonds de Roulement MoMo saisi à la configuration de l'application, par Opérateur. Variable Globale Configurable par l'Admin. Nécessaire pour activer le contrôle de solde lors des retraits. | — |
| **Fenêtre de Correction** | Délai (fixé à 10 minutes) pendant lequel la Gestionnaire peut modifier une transaction qu'elle vient de saisir. Passé ce délai, la transaction devient immutable. | 10 minutes |
| **Rappel de Commission** | Mécanisme de notification in-app qui suggère à la Gestionnaire de saisir les commissions MoMo accumulées depuis la dernière saisie de commission. Fréquence configurable. | — |
| **Variable Globale Configurable** | Paramètre système modifiable uniquement par l'Admin. Affecte le comportement de la répartition financière pour toutes les transactions futures. La modification n'a pas d'effet rétroactif. | — |

### 3.4 Mécanisme de Redistribution post-Plafond

| Terme | Définition |
|-------|------------|
| **Redistribution** | Mécanisme activé automatiquement lorsque le solde de la Caisse Remboursement atteint le Plafond de Capital. Le ratio de la Caisse Remboursement tombe à 0 %. Les **Ratios post-Plafond** (Variable Globale Configurable) prennent le relais. Contrairement à un recalcul proportionnel, ces ratios sont **fixes et définis explicitement par l'Admin** pour éviter les montants non ronds. |

> **Exemple avec les valeurs par défaut** :  
> Avant plafond : Salaire 50 %, Remboursement 30 %, Réserve 20 % (Ratios de Répartition).  
> Après plafond : Remboursement 0 %. **Ratios post-Plafond appliqués : Salaire 70 %, Réserve 30 %.** Plus aucune somme n'alimente la Caisse Remboursement.

### 3.5 Types de transaction

| Terme | Définition | Données saisies | Mouvements générés |
|-------|------------|-----------------|-------------------|
| **Vente Textile** | Vente d'un article du commerce de détail (Guipures, Dallas, tissus). | PV, CA, Désignation de l'article (texte libre) | CA → Caisse Stock. Bénéfice Net (PV−CA) → réparti selon les Ratios vers Caisse Salaire, Caisse Remboursement, Caisse Réserve. Modifiable pendant la Fenêtre de Correction (10 min). |
| **Opération MoMo — Dépôt** | Un client confie de l'argent pour le déposer sur son compte mobile. La Gestionnaire avance le solde e-float. | Montant du dépôt, Opérateur MoMo (MTN / Moov / Celtis) | Le Fonds de Roulement MoMo de l'opérateur **diminue** du montant du dépôt (l'e-float est consommé). La Commission n'est **pas saisie ici** — elle est saisie séparément de manière différée. |
| **Opération MoMo — Retrait** | Un client retire de l'argent liquide depuis son compte mobile. | Montant du retrait, Opérateur MoMo (MTN / Moov / Celtis) | Le Fonds de Roulement MoMo de l'opérateur **augmente** du montant du retrait (l'e-float est recrédité). La Commission n'est **pas saisie ici**. |
| **Saisie de Commission MoMo** | Enregistrement de la commission accumulée sur une période pour un Opérateur donné. Peut être saisie à tout moment, le système rappelle périodiquement la Gestionnaire via un Rappel de Commission. | Montant de la commission, Opérateur MoMo (MTN / Moov / Celtis) | Commission → traitée comme un Bénéfice Net → répartie selon les Ratios vers Caisse Salaire, Caisse Remboursement, Caisse Réserve. |

### 3.6 Opérateurs MoMo

| Opérateur | Description |
|-----------|-------------|
| **MTN Mobile Money** | Service MoMo de l'opérateur MTN. Fonds de Roulement et taux de commission propres. |
| **Moov Money** | Service MoMo de l'opérateur Moov Africa. Fonds de Roulement et taux de commission propres. |
| **Celtis Cash** | Service MoMo de l'opérateur Celtis (Celtiis). Fonds de Roulement et taux de commission propres. |

> **Recommandation validée** : Chaque Opérateur dispose de son propre Fonds de Roulement MoMo isolé. Ce choix reflète la réalité opérationnelle (chaque opérateur a son propre e-float/SIM) et permet un suivi précis par opérateur, utile pour la réconciliation et le reporting.

### 3.7 Mécanisme de Correction de Transaction

| Terme | Définition |
|-------|------------|
| **Correction** | Modification d'une transaction par la Gestionnaire dans les **10 minutes** suivant sa création. Passé ce délai, la transaction devient immutable. La correction recalcule et annule les Mouvements de Caisse initiaux, puis génère les nouveaux mouvements basés sur les valeurs corrigées. Un historique de correction est conservé (valeur avant / valeur après). |

---

## 4. Scope Fonctionnel (Macro)

### 4.1 Épics

| # | Épic | Description |
|---|------|-------------|
| E1 | **Authentification & Gestion des accès** | Système de connexion sécurisé avec deux rôles distincts (Admin, Gestionnaire). Gestion des sessions. |
| E2 | **Module d'Administration** | Interface Admin pour configurer les Variables Globales, gérer le compte Gestionnaire, et consulter toutes les données. |
| E3 | **Saisie de Vente Textile** | Formulaire de saisie rapide d'une vente avec PV, CA et désignation. Ventilation automatique instantanée. |
| E4 | **Saisie d'Opération MoMo** | Formulaire de saisie rapide d'une opération de dépôt ou retrait par Opérateur. Saisie différée des Commissions. Isolation du fonds de roulement par Opérateur. |
| E5 | **Moteur de Répartition** | Cœur métier. Calcule et exécute la ventilation du Bénéfice Net selon les Ratios. Gère le mécanisme de Redistribution post-Plafond (ratios fixes 70/30). |
| E6 | **Tableau de Bord & Soldes** | Affichage en temps réel des soldes de chaque Caisse avec codes couleurs (bloqué/libre). Vue adaptée au rôle. |
| E7 | **Historique des Transactions** | Journal chronologique de toutes les transactions avec détails de la ventilation. Filtres par type, date, activité. |
| E8 | **Reporting Trimestriel** | Génération de rapports synthétiques par trimestre : CA total, bénéfice total, progression du remboursement, évolution des caisses. |
| E9 | **Mode Offline & Synchronisation** | Fonctionnement complet hors-ligne. File d'attente de synchronisation. Résolution de conflits. Indicateur de statut réseau. |
| E10 | **PWA & Installation Mobile** | Manifest PWA, Service Workers, installation sur écran d'accueil, notifications de synchronisation. |
| E11 | **Correction de Transaction** | Fenêtre de 10 minutes pour corriger une transaction erronée. Recalcul automatique des mouvements de caisse. |

### 4.2 IN SCOPE — V1 (Production)

> **Rappel** : La V1 n'est pas un prototype. Chaque fonctionnalité listée ci-dessous doit être **implémentée de manière robuste, sécurisée et définitive**.

#### E1 — Authentification & Gestion des accès
- Connexion par identifiant (format email) + mot de passe (hashé, salé).

  > ⚠️ **Précision technique** : Supabase GoTrue impose un format email comme identifiant. L'identifiant de la Gestionnaire sera de la forme `gestionnaire@sikabox.app` (ou équivalent). Cela ne nécessite PAS une vraie boîte email — c'est un identifiant technique au format email.

- Deux rôles : `ADMIN` et `GESTIONNAIRE`, appliqués côté client et côté serveur.
- **Appareils séparés** : l'Admin et la Gestionnaire utilisent chacun leur propre smartphone. Pas de mécanisme de basculement de session sur un même appareil.
- Protection de toutes les routes et actions par vérification de rôle.
- Gestion sécurisée des sessions (token JWT ou équivalent).
- Déconnexion manuelle.
- Verrouillage automatique après inactivité (durée configurable).

#### E2 — Module d'Administration
- Interface dédiée à l'Admin (inaccessible à la Gestionnaire).
- Modification du Plafond de Capital avec journal d'audit (ancienne valeur, nouvelle valeur, date, auteur).
- Modification des Ratios de Répartition avec validation (somme = 100 %) et journal d'audit.
- Modification des Ratios post-Plafond avec validation (somme = 100 %) et journal d'audit.
- **Configuration des Opérateurs MoMo** : saisie du Solde Initial du Fonds de Roulement MoMo pour chaque Opérateur (MTN Mobile Money, Moov Money, Celtis Cash).
- Configuration de la fréquence du Rappel de Commission (ex: tous les 3 jours, hebdomadaire).
- Création du compte Gestionnaire (identifiant + mot de passe temporaire).
- Désactivation/réactivation du compte Gestionnaire.
- Consultation de tous les soldes de caisses (y compris soldes par Opérateur MoMo).
- Consultation de l'historique complet des transactions.

#### E3 — Saisie de Vente Textile
- Formulaire minimal : Désignation (texte libre), Prix de Vente (numérique), Coût d'Achat (numérique).
- Validation : PV > 0, CA > 0, PV ≥ CA (pas de vente à perte autorisée par défaut).
- Affichage du Bénéfice Net calculé avant confirmation.
- Confirmation de la transaction en un tap.
- Ventilation automatique et immédiate après confirmation.
- Feedback visuel : récapitulatif de la répartition (combien va où).

#### E4 — Saisie d'Opération MoMo

**4a. Saisie de transaction MoMo (Dépôt / Retrait)**
- Sélection de l'Opérateur MoMo : MTN Mobile Money, Moov Money ou Celtis Cash.
- Sélection du type : Dépôt ou Retrait.
- Formulaire minimal : Montant de l'opération (numérique).
- Validation : Montant > 0.
- Pour un dépôt : le Fonds de Roulement MoMo de l'Opérateur **diminue** (e-float consommé). Vérification que le fonds est suffisant.
- Pour un retrait : le Fonds de Roulement MoMo de l'Opérateur **augmente** (e-float recrédité).
- **Aucune commission n'est saisie lors de cette transaction.** La transaction sert uniquement au suivi des mouvements du Fonds de Roulement.
- Historique complet des dépôts/retraits par Opérateur.

**4b. Saisie de Commission MoMo (différée)**
- Formulaire dédié accessible à tout moment.
- Sélection de l'Opérateur MoMo.
- Saisie du montant global de la Commission accumulée (numérique, > 0).
- Ventilation automatique de la Commission comme Bénéfice Net selon les Ratios.
- **Rappel de Commission** : notification in-app qui suggère la saisie lorsque le délai configuré est écoulé depuis la dernière saisie de commission. Le rappel est non bloquant (la Gestionnaire peut le repousser).

#### E5 — Moteur de Répartition
- Application des Ratios de Répartition au Bénéfice Net de chaque transaction (Vente Textile ou Saisie de Commission MoMo).
- Détection automatique de l'atteinte du Plafond de Capital.
- Gestion de la transaction « charnière » : si un bénéfice fait dépasser le Plafond, seul le montant manquant va en Caisse Remboursement, le surplus est redistribué selon les Ratios post-Plafond.
- Activation du mécanisme de Redistribution post-Plafond : bascule vers les **Ratios post-Plafond fixes** (par défaut 70 % Salaire / 30 % Réserve). Pas de recalcul proportionnel.
- Tous les calculs en nombres entiers (FCFA, pas de centimes). L'algorithme de répartition utilise la **méthode du plus grand reste** (Largest Remainder Method) :
  1. Calculer la part brute de chaque caisse : `bénéfice × ratio / 100`.
  2. Prendre le `Math.floor()` de chaque part.
  3. Calculer le reste total : `bénéfice - somme(floors)`.
  4. Distribuer le reste (1 FCFA à la fois) aux caisses ayant les plus gros restes fractionnaires.
  5. En cas d'égalité de restes, la **Caisse Réserve** est prioritaire.

#### E11 — Correction de Transaction
- Fenêtre de correction de **10 minutes** après la saisie d'une transaction.
- Pendant la fenêtre : la Gestionnaire peut modifier les champs de la transaction (PV, CA, Désignation pour une vente — Montant, Opérateur pour une opération MoMo — Montant, Opérateur pour une commission).
- La correction **annule les Mouvements de Caisse initiaux** et **génère de nouveaux mouvements** basés sur les valeurs corrigées.
- Journal de correction conservé : valeurs avant, valeurs après, horodatage de la correction.
- Après expiration de la Fenêtre de Correction : la transaction est **immutable**. Aucune modification possible, même par l'Admin.
- Indicateur visuel : chronomètre ou badge « Modifiable » affiché sur les transactions récentes encore dans la fenêtre.

#### E6 — Tableau de Bord & Soldes
- Vue Gestionnaire : soldes des caisses, avec code couleur.
  - 🟢 Vert : Caisse Salaire (argent libre).
  - 🔴 Rouge : Caisse Stock, Caisse Remboursement (argent bloqué).
  - 🟠 Orange : Caisse Réserve (semi-bloqué).
  - 🔵 Bleu : Fonds de Roulement MoMo — affiché **par Opérateur** (MTN / Moov / Celtis) avec sous-totaux et total consolidé.
- Vue Admin : mêmes soldes + indicateur de progression du remboursement (barre de progression vers le Plafond).
- Montant total libre (Caisse Salaire) mis en évidence comme information principale.
- Actualisation instantanée après chaque transaction.
- Indicateur de Rappel de Commission : badge visuel si des commissions sont en attente de saisie.

#### E7 — Historique des Transactions
- Liste chronologique inversée (les plus récentes en premier).
- Chaque entrée affiche : date/heure, type (Vente Textile / MoMo Dépôt / MoMo Retrait), désignation ou montant, Bénéfice Net, détail de la ventilation par caisse.
- Filtres : par type de transaction, par plage de dates, par Opérateur MoMo.
- Badge « Corrigée » sur les transactions ayant fait l'objet d'une correction.
- Accessible à la Gestionnaire (ses transactions) et à l'Admin (toutes les transactions).

#### E8 — Reporting Trimestriel
- Génération à la demande (pas automatique) par l'Admin.
- Contenu du rapport :
  - Période couverte.
  - Nombre de transactions par type.
  - Chiffre d'affaires total (somme des PV textiles + commissions MoMo).
  - Bénéfice Net total.
  - Ventilation cumulée par caisse sur la période.
  - Solde actuel de chaque caisse (y compris par Opérateur MoMo).
  - Progression du remboursement (montant remboursé / Plafond de Capital).
  - Nombre de corrections effectuées sur la période.
- Format : affichage dans l'app (pas d'export PDF en V1).

#### E9 — Mode Offline & Synchronisation
- Toutes les transactions saisissables hors-ligne.
- Stockage local persistant (IndexedDB ou équivalent).
- File d'attente de synchronisation avec statut visible (en attente / synchronisé).
- Synchronisation automatique dès le retour du réseau.
- Gestion des conflits : stratégie « dernier écrit gagne » pour les Variables Globales, « ajout seul » pour les transactions (pas de suppression possible). Les corrections dans la Fenêtre de 10 minutes sont synchronisées comme des mises à jour de la transaction d'origine.
- Indicateur visuel permanent du statut de connexion (en ligne / hors-ligne / synchronisation en cours).

#### E10 — PWA & Installation Mobile
- Manifest valide pour installation sur écran d'accueil (Android prioritaire).
- Service Worker pour le cache des assets et le fonctionnement hors-ligne.
- Splash screen et icône de l'application.
- Design responsive Mobile-First (optimisé pour écrans 5"–6.5").

### 4.3 OUT OF SCOPE — V1

| Fonctionnalité | Raison de l'exclusion | Horizon envisagé |
|----------------|----------------------|------------------|
| Gestion du catalogue / inventaire des articles en stock | Complexité métier élevée (suivi des quantités, alertes de réapprovisionnement). La V1 se concentre sur le flux financier, pas sur la logistique. | V2 |
| Décaissement depuis la Caisse Stock (rachat de stock) | Nécessite un module de gestion d'inventaire pour être cohérent. | V2 |
| Décaissement depuis la Caisse Réserve (réinvestissement) | Nécessite des workflows de validation Admin + un suivi de l'utilisation. | V2 |
| Multi-utilisateurs Gestionnaire | Un seul compte Gestionnaire suffit pour le cas d'usage actuel. | V2+ |
| Export PDF / impression des rapports | Ajout de valeur marginal en V1. L'affichage in-app est suffisant. | V2 |
| Notifications push | Pas critique pour l'usage quotidien. L'indicateur de synchro suffit. | V2 |
| Intégration directe avec les API Mobile Money (MTN, Moov) | La Gestionnaire saisit manuellement la commission. L'intégration API est un chantier technique disproportionné pour la V1. | V3+ |
| Multi-activités / multi-business | L'architecture doit le permettre, mais l'interface V1 est mono-business (textile + MoMo en dur). | V3+ |
| Tableau de bord analytique avancé (graphiques, tendances) | Le reporting trimestriel couvre le besoin minimal. | V2 |
| Support multilingue | L'interface sera en français. Le Bénin est francophone. | V2+ |
| Mode tablette / desktop | Mobile-First. L'app sera utilisable sur desktop par le PWA mais pas optimisée. | V2 |

---

## 5. Décisions Validées & Questions Ouvertes

### 5.1 Décisions validées (anciennement Questions Ouvertes)

| # | Question initiale | Décision |
|---|-------------------|----------|
| Q1 | Redistribution post-Plafond : proportionnel ou fixe ? | **Ratios post-Plafond fixes : 70 % Salaire / 30 % Réserve.** Configurable par l'Admin. Évite les montants à virgule. |
| Q2 | Impact des opérations MoMo sur le Fonds de Roulement ? | **Suivi complet par opérateur.** Dépôt = e-float diminue, Retrait = e-float augmente. Commission saisie de manière **différée** (pas à chaque transaction). Rappel périodique. |
| Q3 | Correction de transaction : quel mécanisme ? | **Fenêtre de Correction de 10 minutes.** Au-delà, la transaction est immutable. Recalcul automatique des mouvements de caisse. |
| Q4 | Admin et Gestionnaire sur le même appareil ? | **Appareils séparés.** L'Admin utilise son propre smartphone. Pas de basculement de session. |
| Q5 | Saisie du Solde Initial MoMo ? | **Oui, par Opérateur.** Le Solde Initial de chaque Opérateur MoMo est une Variable Globale Configurable par l'Admin. |
| Q6 | Désignation : texte libre ou liste prédéfinie ? | **Texte libre** à chaque vente. Pas de liste imposée. |
| Q7 | Vente à perte autorisée ? | **Non.** PV doit être ≥ CA. Aucune exception. |
| Q8 | Devise unique FCFA ? | **Confirmé.** FCFA (XOF) uniquement. Pas de multi-devises. |
| Q9 | Fréquence par défaut du Rappel de Commission ? | **3 jours.** Valeur par défaut : la Gestionnaire est rappelée toutes les 72 heures depuis la dernière saisie de commission. Configurable par l'Admin via les Variables Globales. |
| Q10 | Vérification de dépôt MoMo (e-float suffisant) ? | **Oui, vérification obligatoire.** Le dépôt est refusé si le Fonds de Roulement MoMo de l'Opérateur est insuffisant (erreur `FONDS_INSUFFISANT`). Pas de solde négatif autorisé. |
| Q11 | Durée du verrouillage automatique après inactivité ? | **5 minutes.** Après 5 minutes d'inactivité, l'app se verrouille et demande une reconnexion. Configurable par l'Admin via les Variables Globales (`verrouillage_inactivite_minutes`). |

### 5.2 Toutes les questions résolues

> Aucune question ouverte restante. Toutes les décisions nécessaires pour la V1 ont été prises.

---

*Ce document constitue la source de vérité fonctionnelle du projet Sika Box. Toute décision technique ultérieure (choix de stack, architecture, modèle de données) doit être alignée avec les définitions et règles énoncées ici. Aucune modification de ce document ne peut être faite sans validation explicite du Product Owner.*
