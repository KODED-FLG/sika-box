# 02 — RECOMMANDATIONS STRATÉGIQUES

> **Version** : 1.0  
> **Date** : 09 mars 2026  
> **Source** : Analyse rétrospective du projet Sika Box  
> **Objectif** : Recommandations actionnables, priorisées, pour maximiser les chances de livrer une V1 fonctionnelle en solo.

---

## Matrice de priorité

| Priorité | Signification | Critère |
|----------|---------------|---------|
| 🅿️1 | **IMMÉDIAT** | Bloquer si non corrigé — risque de refaire du travail |
| 🅿️2 | **AVANT IMPLÉMENTATION** | À traiter avant de commencer la phase concernée |
| 🅿️3 | **SOUHAITABLE** | Améliore la qualité, non bloquant |

---

## REC-01 🅿️1 — Découper la V1 en sous-versions incrémentales

**Constat** : 242 tâches pour un développeur solo. La première version utilisable (vente textile bout en bout) arrive à M8, soit après ~150 tâches. C'est beaucoup trop tard pour obtenir du feedback utilisateur.

**Recommandation** : Définir 3-4 sous-versions avec des livrables utilisables à chaque étape :

| Sous-version | Périmètre fonctionnel | Tâches estimées |
|-------------|----------------------|----------------|
| **V0.1** | Vente Textile + Dashboard simple (online only) | ~50-60 |
| **V0.2** | + Commissions MoMo + opérateurs | ~40 |
| **V0.3** | + Corrections + Reporting + Config admin | ~40 |
| **V1.0** | + Offline complet + Sync + PWA install | ~50-60 |

**Bénéfice** : Feedback utilisateur dès V0.1 (~3-4 semaines). Chaque sous-version est déployable et testable.

**Voir** : [03_PROPOSITION_SOUS_VERSIONS.md](./03_PROPOSITION_SOUS_VERSIONS.md) pour le découpage détaillé.

---

## REC-02 🅿️1 — Corriger les 2 incohérences critiques avant de coder

**Constat** : INC-02 (champ `commission` redondant) et INC-03 (algorithme d'arrondi ambigu) sont des bombes à retardement. Si on commence à coder sans les résoudre, il faudra refaire des migrations SQL et réécrire des tests.

**Recommandation** :
1. **INC-02** : Supprimer `commission` du schéma Mermaid dans `01_ARCHITECTURE_TECHNIQUE.md`. Mettre à jour le diagramme ER.
2. **INC-03** : Choisir et documenter l'algorithme d'arrondi exact. Recommandation : **Largest Remainder Method** avec priorité à la Caisse Réserve en cas d'égalité. Mettre à jour la Bible (doc 00), les normes (doc 02), et le test B3.8 (doc 04).

**Voir** : [01_INCOHERENCES.md](./01_INCOHERENCES.md), INC-02 et INC-03.

---

## REC-03 🅿️1 — Simplifier drastiquement le scope du Sync Engine

**Constat** : L'ADR-004 (Custom Sync Engine) est la fonctionnalité la plus risquée du projet. L'estimation de "2-3 jours" en B6 est irréaliste. Un sync engine fiable pour des données financières (avec gestion des conflits, idempotence, et réconciliation) demande des semaines de travail, même en mono-utilisateur.

**Recommandation** : Repousser le sync engine à V1.0 (dernière sous-version) et simplifier :

### Phase 1 (V0.1-V0.3) — Online Only
- L'app fonctionne uniquement avec une connexion Supabase.
- Pas d'IndexedDB, pas de Dexie.js, pas de sync.
- Les données sont lues/écrites directement via TanStack Query + Supabase Client.
- **Avantage** : Supprime ~40 tâches de la V0.1.

### Phase 2 (V1.0) — Offline avec sync simplifié
- Ajouter Dexie.js comme cache local (lecture seule d'abord).
- File d'attente d'écriture pour les opérations offline.
- Sync au retour réseau : push des opérations en file, dans l'ordre chronologique.
- **Pas de merge complexe** : en cas de conflit, l'opération en file est rejetée et l'utilisateur est notifié.

### Ce qu'on ne fait PAS en V1.0
- Pas de CRDT.
- Pas de merge automatique de conflits.
- Pas de sync bidirectionnel en temps réel.

**Justification** : Sika Box est mono-utilisateur. Les conflits de données sont rares (un seul appareil écrit à la fois). Un système simple de file d'attente FIFO suffit largement pour la V1.

---

## REC-04 🅿️2 — Supprimer Pact, garder Prism + MSW + Playwright

**Constat** : Le document `03_MOCKING_ET_CONTRACT_TESTING.md` introduit Pact pour le contract testing. C'est un excellent outil pour les équipes avec des APIs maintenues par des équipes séparées. Pour un développeur solo qui contrôle à la fois le frontend et le backend (Supabase), Pact est surdimensionné.

**Recommandation** :

| Outil | Garder ? | Rôle |
|-------|----------|------|
| **Prism** | ✅ Oui | Mock server basé sur `openapi.yaml` pour les tests d'intégration frontend |
| **MSW** | ✅ Oui | Mock au niveau réseau pour les tests unitaires React (TanStack Query) |
| **Playwright** | ✅ Oui | Tests E2E contre Supabase local (via `supabase start`) |
| **Pact** | ❌ Non | Retirer — le contract testing est assuré par Prism + l'OpenAPI spec |
| **fake-indexeddb** | 🔄 Reporter | Reporter à V1.0 (quand IndexedDB est ajouté) |

**Bénéfice** : Simplifie la stack de test. Retire ~8 tâches liées à Pact (B5.1-B5.4 et dépendances). La conformité contractuelle est assurée par Prism qui valide les réponses contre l'OpenAPI.

---

## REC-05 🅿️2 — Documenter le schéma IndexedDB au même niveau que PostgreSQL

**Constat** : Le schéma PostgreSQL est documenté en détail (diagramme ER Mermaid, RLS policies, triggers). Le schéma IndexedDB (Dexie.js) n'est documenté nulle part. Pour une app Offline-First, les deux schémas sont aussi importants.

**Recommandation** : Quand le Sync Engine sera implémenté (V1.0), ajouter dans `01_ARCHITECTURE_TECHNIQUE.md` :

1. **Schéma Dexie.js** : Toutes les tables IndexedDB, leurs index, et le mapping avec PostgreSQL.
2. **Contrat de sync** : Quels champs sont synchronisés, lesquels sont locaux uniquement.
3. **Gestion de version du schéma** : `db.version(n).stores({...})` avec stratégie de migration.
4. **Politique de rétention** : Combien de données garder localement (toutes les transactions ? Les 3 derniers mois ?).

**Note** : Si REC-03 est suivie (reporter IndexedDB à V1.0), cette recommandation est à traiter à ce moment-là.

---

## REC-06 🅿️2 — Ajouter une stratégie de backup/restauration

**Constat** : L'app gère des données financières. Il n'y a aucune mention de backup, restauration, ou export de données dans les 7 documents. L'utilisatrice (Awa) n'a aucun moyen de récupérer ses données si :
- Son téléphone est volé/cassé.
- Supabase a un incident.
- Une mauvaise manipulation supprime des données.

**Recommandation** :

### Court terme (V0.1) — Minimal
- Activer les **Point-in-Time Recovery (PITR)** de Supabase (disponible dès le plan Pro, ~$25/mois).
- Ou : **pg_dump quotidien** automatisé via un cron GitHub Actions → stocké sur un bucket S3/MinIO.

### Moyen terme (V0.3) — Export utilisateur
- Ajouter un bouton "Exporter mes données" dans les paramètres → génère un fichier CSV ou JSON téléchargeable.
- Permet à Awa de garder une copie de ses données sur son téléphone.

### Long terme (V1.0) — Restauration
- Si PITR est disponible, documenter la procédure de restauration.
- Si export CSV : permettre le ré-import des données.

---

## REC-07 🅿️2 — Ajouter des tests d'accessibilité (a11y)

**Constat** : Le persona principal (Awa, 42 ans) est explicitement décrit comme "pas très à l'aise avec la technologie". L'app cible l'Afrique de l'Ouest où les conditions d'utilisation sont variées (écrans petits, luminosité forte, connexion lente). Pourtant, aucun test d'accessibilité n'est mentionné.

**Recommandation** :

### Outillage minimal (à ajouter en V0.1)
```
pnpm add -D @axe-core/playwright axe-core
```

### Tests Playwright avec axe
Ajouter dans les tests E2E existants (phase F6) :
```typescript
import AxeBuilder from '@axe-core/playwright';

test('dashboard a11y', async ({ page }) => {
  await page.goto('/dashboard');
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
```

### Critères à vérifier en priorité
- **Contraste minimum** : WCAG AA (ratio 4.5:1) — critique sous lumière forte du soleil.
- **Taille des zones cliquables** : minimum 44×44px (WCAG 2.5.5) — doigts sur écran tactile.
- **Labels des formulaires** : tous les inputs ont un label associé.
- **Navigation au clavier** : focus visible sur tous les éléments interactifs.

---

## REC-08 🅿️2 — Gérer le risque Supabase Free Tier

**Constat** : Le plan gratuit de Supabase met en pause les projets inactifs après 7 jours sans requête. Pour une gestionnaire de boutique qui pourrait ne pas utiliser l'app pendant une semaine (maladie, voyage), le backend disparaît silencieusement.

**Recommandation** :

### Option A — Heartbeat automatique (gratuit)
- Créer un cron GitHub Actions qui ping l'API Supabase toutes les 48h.
- Coût : 0 FCFA. Empêche la pause automatique.

```yaml
# .github/workflows/keepalive.yml
name: Supabase Keepalive
on:
  schedule:
    - cron: '0 6 */2 * *'  # Toutes les 48h à 6h UTC
jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - run: curl -s "${{ secrets.SUPABASE_URL }}/rest/v1/" -H "apikey: ${{ secrets.SUPABASE_ANON_KEY }}"
```

### Option B — Passer au plan Pro dès que possible
- $25/mois = ~15.000 FCFA/mois.
- Pas de pause. Backups quotidiens inclus. 8 Go de BDD.
- À considérer dès que Sika Box génère son premier revenu ou a son premier utilisateur payant.

### Option C — Ajouter une alerte de réveil
- Si l'app détecte que Supabase est en pause (erreur réseau spécifique), afficher un message "Votre base de données est en cours de redémarrage, veuillez patienter 30 secondes" au lieu d'un écran d'erreur.

---

## REC-09 🅿️3 — Corriger les incohérences mineures (INC-06, INC-10, INC-11)

**Constat** : 3 incohérences mineures qui ne bloquent pas l'implémentation mais polluent la documentation.

**Recommandation** : Faire un commit unique "fix: corrige incohérences mineures dans la documentation" qui :
1. (INC-06) Remplace `.eslintrc.cjs` par `eslint.config.js` dans `04_ROADMAP_BACKEND.md`.
2. (INC-10) Remplace `"SQL / Prisma"` par `"Supabase Client / PostgREST"` dans le diagramme C4 de `01_ARCHITECTURE_TECHNIQUE.md`.
3. (INC-11) Ajoute une note dans `02_NORMES_OPERATIONNELLES.md` précisant la convention de nommage français/anglais.

---

## REC-10 🅿️3 — Ajouter un ADR pour les choix de la rétrospective

**Constat** : Les ADR existants (001-005) documentent les choix architecturaux initiaux. Les recommandations de cette rétrospective (reporter le Sync Engine, supprimer Pact, découper en sous-versions) sont aussi des décisions architecturales importantes.

**Recommandation** : Ajouter des ADR pour chaque décision prise suite à cette rétrospective :
- **ADR-006** : Reporter le mode Offline et le Sync Engine à V1.0.
- **ADR-007** : Supprimer Pact du pipeline de test.
- **ADR-008** : Adopter un cycle de sous-versions incrémentales (V0.1 → V0.2 → V0.3 → V1.0).

Cela permet de garder une trace du **pourquoi** ces changements ont été faits, pour ne pas les défaire par erreur plus tard.

---

## Tableau récapitulatif des recommandations

| ID | Priorité | Résumé | Impact (tâches) |
|----|----------|--------|-----------------|
| REC-01 | 🅿️1 | Découper V1 en sous-versions | Restructure le plan |
| REC-02 | 🅿️1 | Corriger INC-02 et INC-03 | 2-3 docs à modifier |
| REC-03 | 🅿️1 | Simplifier/reporter le Sync Engine | -40 tâches en V0.1 |
| REC-04 | 🅿️2 | Supprimer Pact | -8 tâches |
| REC-05 | 🅿️2 | Documenter schéma IndexedDB | Reporter à V1.0 |
| REC-06 | 🅿️2 | Stratégie backup/restauration | +3-5 tâches |
| REC-07 | 🅿️2 | Tests d'accessibilité | +2-3 tâches E2E |
| REC-08 | 🅿️2 | Gérer risque Supabase Free Tier | +1 tâche (keepalive) |
| REC-09 | 🅿️3 | Corriger incohérences mineures | 1 commit |
| REC-10 | 🅿️3 | ADR pour les décisions rétrospective | 3 ADR à rédiger |

**Impact net estimé** : -45 tâches en V0.1 (de ~120 à ~55-60), +6-8 tâches ajoutées. **Gain net : ~40 tâches en moins avant la première version utilisable.**

---

*Les recommandations sont numérotées par priorité décroissante. Les 🅿️1 doivent être traitées avant d'écrire la première ligne de code. Les 🅿️2 avant la phase concernée. Les 🅿️3 quand le temps le permet.*
