# BMAD FRAMEWORK
## Méthode de développement sécurisé d'applications
**Version 2.0 — Juillet 2026**
*Direction Générale du Budget et des Finances (DGBF) — Côte d'Ivoire*

---

## Table des matières

1. [Vue d'ensemble](#1-vue-densemble)
2. [Règles non-négociables](#2-règles-non-négociables)
3. [Phase 1 — Discovery / Brainstorming](#3-phase-1--discovery--brainstorming)
4. [Phase 2 — PRD](#4-phase-2--prd)
5. [Phase 3 — Architecture](#5-phase-3--architecture)
6. [Phase 4 — Développement](#6-phase-4--développement)
7. [Phase 5 — QA & Tests](#7-phase-5--qa--tests)
8. [Catalogue des failles de sécurité](#8-catalogue-des-failles-de-sécurité)
9. [Phase 6 — Pre-Launch Gate](#9-phase-6--pre-launch-gate)

---

## 1. Vue d'ensemble

BMAD est une méthode séquentielle de développement d'applications structurée en **6 phases obligatoires**. Chaque phase produit un livrable validé avant de passer à la suivante. La sécurité est intégrée dès la phase de découverte et vérifiée à chaque étape.

### 1.1 Les 6 phases BMAD

| Phase | Commande | Livrable | Responsable |
|---|---|---|---|
| 1 | `bmad analyste` | `01-brainstorming.md` | Analyste |
| 2 | `bmad pm` | `02-prd.md` (Epics/Stories X.Y) | Product Manager |
| 3 | `bmad archi` | `03-architecture.md` | Architecte |
| 4 | `bmad dev X.Y` | Code story par story | Développeur |
| 5 | `bmad qa X.Y` | `04-tests.md` + rapports de tests | QA |
| 6 | `bmad prelaunch` | Checklist go/no-go production | Équipe complète |

### 1.2 Commandes utilitaires

- `bmad next` — passer à la story suivante
- `bmad status` — tableau de progression
- `bmad adr` — documenter une décision architecturale

### 1.3 Structure standard du projet

```
projet/
├── CLAUDE.md                  # contexte du projet
├── docs/
│   ├── BMAD_FRAMEWORK.md
│   ├── 01-brainstorming.md
│   ├── 02-prd.md
│   ├── 03-architecture.md
│   ├── 04-tests.md
│   └── 05-status.md
├── specs/                     # spécifications détaillées
├── src/                       # code source
└── tests/                     # tests automatisés
```

---

## 2. Règles non-négociables

Les règles suivantes s'appliquent à **tous les projets sans exception**. Toute dérogation est documentée dans un ADR.

1. **(1) Ne jamais sauter une phase** — chaque livrable est validé avant de passer à la suivante.
2. **(2) Une seule story par session de développement** — jamais 2+ simultanément.
3. **(3) Les docs font foi** — si le code et la doc divergent, on corrige le code.
4. **(4) Aucune improvisation architecturale** — toute déviation = ADR documenté.
5. **(5) Epic 1 = MVP fonctionnel minimal complet.**
6. **(6) Jamais de modification directe du schéma BDD en production** — toujours via migrations.
7. **(7) Toute API doit valider les inputs côté serveur sans exception.**

---

## 3. Phase 1 — Discovery / Brainstorming

**Commande :** `bmad analyste` → produit `01-brainstorming.md`

### 3.1 Sections obligatoires du brainstorming

- **Problème** — description du problème à résoudre
- **Personas** — qui sont les utilisateurs cibles
- **Scénarios** — parcours utilisateurs principaux
- **MoSCoW** — Must have / Should have / Could have / Won't have
- **Contraintes** — techniques, budgétaires, temporelles
- **Critères de succès** — métriques mesurables
- **Questions ouvertes** — incertitudes à lever

### 3.2 Section "Risques & Contraintes de production" (OBLIGATOIRE)

Cette section doit anticiper **dès la découverte** les enjeux de production, avant toute ligne de code.

#### Sécurité
- Authentification et gestion des sessions
- Rate limiting et protection anti-bot
- Validation des inputs (côté serveur obligatoire)
- Identification des flux métier sensibles à protéger

#### Performance
- Risques N+1 queries — identifier les relations à précharger
- Index BDD — colonnes filtrées/triées à indexer
- Background jobs — tâches lentes à sortir de la requête HTTP
- Pagination — toutes les listes sans exception

#### Observabilité
- Monitoring d'erreurs dès le départ
- Journalisation des actions sensibles
- Alertes sur anomalies

#### Environnements
- Séparation stricte dev / staging / production
- Politique de secrets (coffre-fort, rotation)
- Stratégie de backup et de rollback

---

## 4. Phase 2 — PRD

**Commande :** `bmad pm` → produit `02-prd.md` avec Epics et Stories numérotés X.Y

### 4.1 Format des Stories

> *"En tant que [persona], je veux [action], afin de [bénéfice]"*

- Critères d'acceptation **binaires** (fait / pas fait)
- Estimation : **S** (< 1h) / **M** (1–2h) / **L** (2–3h)
- Chaque story doit être implémentable en **1–3h maximum**
- **Epic 1 = MVP fonctionnel minimal complet**

---

## 5. Phase 3 — Architecture

**Commande :** `bmad archi` → produit `03-architecture.md`

### 5.1 Contenu obligatoire

- Stack technique + justification
- Arborescence des fichiers
- Modèle de données (avec protections N+1 documentées)
- Flows et séquences
- APIs (contrats, formats, erreurs)
- ADR — Architecture Decision Records
- Mapping Story → Fichiers affectés
- Marqueurs de statut : ✅ Done | 🟡 En cours | 🔴 À faire

### 5.2 Checklist sécurité & performance obligatoire

Ces points doivent être traités et documentés dans `03-architecture.md` avant validation.

| # | Contrôle | Détail |
|---|---|---|
| a | **Index BDD** | Index sur toutes colonnes filtrées/triées |
| b | **Background jobs** | Pas de tâche lente dans la requête HTTP → job asynchrone |
| c | **Pagination** | Obligatoire sur toutes les listes sans exception |
| d | **Secrets** | Clés API côté serveur uniquement — jamais exposées au client |
| e | **Migrations** | Tout changement de schéma BDD via fichier de migration |
| f | **N+1** | Protections N+1 documentées dans le modèle de données |
| g | **TLS** | HTTPS imposé sur toutes les communications externes |
| h | **CORS** | Configuration restrictive — pas de wildcard `*` |
| i | **CSP** | Content Security Policy stricte déployée sur le front |
| j | **Coffre secrets** | Variables d'environnement via gestionnaire de secrets dédié |

### 5.3 Couche d'abstraction LLM (projets IA uniquement)

- Toujours planifier une couche **LiteLLM** ou **LangChain**
- Documenter **Scénario A** (APIs payantes) vs **Scénario B** (open source local)
- OCR préféré : **Mistral OCR 3**
- Embedding open source préféré : **BGE-M3** ou **Qwen3-Embedding-8B**
- LLM open source préféré : **Mistral Small 3.2 24B** (Ollama)
- Métriques RAG : faithfulness, answer relevance, context recall (RAGAS)

---

## 6. Phase 4 — Développement

**Commande :** `bmad dev X.Y` → implémente la story X.Y, story par story

### 6.1 Règles de développement

- Une seule story active à la fois
- Chaque story doit passer ses critères d'acceptation avant `bmad next`
- Tout écart architectural → ADR immédiat
- Les tests unitaires sont écrits avec le code, pas après
- Validation des inputs systématique côté serveur sur chaque endpoint
- Messages d'erreur génériques côté client, logs détaillés côté serveur
- Cookies : `HttpOnly` + `Secure` + `SameSite` sur tous les tokens de session

---

## 7. Phase 5 — QA & Tests

**Commande :** `bmad qa X.Y` → produit `04-tests.md` et rapports de tests

Chaque story est testée par couche. Les failles de priorité **Critique** sont testées en premier.

### 7.1 Ordre de priorité des tests

- 🔴 **Critique** — tests bloquants (accès croisé, injection, CSRF, BOLA, secrets CI/CD)
- 🟡 **Haute** — tests importants avant go-live (XSS, CORS, rate limiting, supply chain)
- 🟢 **Moyenne** — tests de robustesse (monitoring, envs non-prod, patching)

---

## 8. Catalogue des failles de sécurité

Ce catalogue structure les contrôles à appliquer par couche lors des phases **Dev (4)** et **QA (5)**. Toute faille **Critique** non traitée bloque la validation de la story.

> **Code couleur priorité :** 🔴 Critique | 🟡 Haute | 🟢 Moyenne

---

### 8.1 Couche Backend — API (BE-01 à BE-09)

| ID | Faiblesse | Prévention clé | Test de validation | Priorité |
|---|---|---|---|---|
| BE-01 | Contrôle d'accès cassé (BOLA/IDOR) | Vérifier l'autorisation par objet à chaque requête | Tester l'accès croisé entre 2 comptes en modifiant les IDs | 🔴 Critique |
| BE-02 | Authentification défaillante | MFA, expiration courte, invalidation sessions, politique MDP | Bruteforce limité, jeton invalide après logout, flux reset MDP sécurisé | 🔴 Critique |
| BE-03 | Injection SQL/NoSQL/commande | Requêtes paramétrées, validation stricte, moindre privilège | Payloads d'injection classiques sans comportement anormal | 🔴 Critique |
| BE-04 | Exposition de données sensibles | Minimisation, masquage, chiffrement, suppression secrets des sorties | Inspecter logs/JSON pour secrets ou données privées en clair | 🟡 Haute |
| BE-05 | Mauvaise configuration sécurité | CORS restrictif, headers sécurité, debug désactivé en prod | Vérifier absence `/debug`, CORS non `*`, headers X-Frame-Options etc. | 🟡 Haute |
| BE-06 | Défaillance cryptographique | TLS imposé, algorithmes modernes, clés en coffre-fort | HTTPS sur comms externes, données sensibles chiffrées en BDD | 🟡 Haute |
| BE-07 | Conception non sécurisée | Rate limiting, contrôles métier, validation flux critiques | Simuler répétition massive d'opérations sensibles → blocage vérifié | 🟡 Haute |
| BE-08 | Journalisation insuffisante | Journaliser actions sensibles, centraliser, alerter anomalies | Provoquer erreurs/accès interdits → présence dans logs vérifiée | 🟢 Moyenne |
| BE-09 | Gestion des erreurs inadéquate | Messages génériques client, logs détaillés serveur uniquement | Erreurs volontaires → client reçoit message générique sans stack trace | 🟢 Moyenne |

---

### 8.2 Couche Frontend (FE-01 à FE-08)

| ID | Faiblesse | Prévention clé | Test de validation | Priorité |
|---|---|---|---|---|
| FE-01 | XSS stocké | Encodage sortie, sanitation, CSP, frameworks sûrs | Poster HTML/JS dans commentaire → encodé, jamais exécuté | 🔴 Critique |
| FE-02 | XSS réfléchi | Encodage contextuel systématique, rejet entrées inattendues | Paramètre URL avec script → apparaît encodé sans exécution | 🟡 Haute |
| FE-03 | DOM XSS | Éviter sinks dangereux (innerHTML), API sûres, assainir entrées | Données injectées via DOM → pas d'insertion non contrôlée | 🟡 Haute |
| FE-04 | CSRF | Tokens anti-CSRF, SameSite, validation du contexte | Page externe déclenche action protégée → refus sans token légitime | 🔴 Critique |
| FE-05 | Mauvaise gestion tokens client | Cookies HttpOnly/Secure/SameSite, éviter localStorage exposé | Inspecter localStorage/cookies → tokens non lisibles par JS | 🟡 Haute |
| FE-06 | CSP absente ou faible | Déployer CSP stricte | Dev tools → CSP présente et robuste, script externe non autorisé bloqué | 🟢 Moyenne |
| FE-07 | Fuite via source maps/HTML | Zéro secret dans bundles, nettoyer artefacts de prod | Inspecter bundles/source maps → aucune donnée sensible | 🟢 Moyenne |
| FE-08 | Validation seulement côté client | Toujours valider côté serveur, front-end = UX uniquement | Requête directe backend avec données invalides → rejet serveur | 🔴 Critique |

---

### 8.3 Couche API — OWASP API Top 10 (API-01 à API-10)

| ID | Faiblesse | Prévention clé | Test de validation | Priorité |
|---|---|---|---|---|
| API-01 | BOLA (Broken Object Level Auth) | Autorisation par objet à chaque requête | Modifier ID dans URL avec autre compte → pas d'accès aux données d'autrui | 🔴 Critique |
| API-02 | Broken Authentication | MFA, rotation, expiration, validation stricte | Expiration, invalidation, impossible d'utiliser jeton d'un autre user | 🔴 Critique |
| API-03 | Broken Object Property Level Auth | Liste blanche champs autorisés, validation propriété par propriété | Modifier champ non exposé dans UI → ignoré ou rejeté | 🟡 Haute |
| API-04 | Unrestricted Resource Consumption | Quotas, rate limiting, limites de taille, timeouts | Tests de charge → limites et erreurs appropriées présentes | 🟡 Haute |
| API-05 | Broken Function Level Auth | Contrôle d'accès par fonction, séparation stricte des rôles | Routes sensibles testées avec rôle faible → refus systématique | 🔴 Critique |
| API-06 | Unrestricted Access to Business Flows | Anti-bot, quotas métier, étapes de confirmation | Automatisation répétée du flux → limites métier et anti-robot actifs | 🟡 Haute |
| API-07 | SSRF | Liste blanche destinations, filtrage strict | URLs internes (localhost, IP privées) → refus systématique | 🟡 Haute |
| API-08 | Security Misconfiguration | Config durcie, suppression routes inutiles, CORS strict | Scanner API → pas d'endpoint inattendu, CORS vérifié, debug désactivé | 🟡 Haute |
| API-09 | Improper Inventory Management | Catalogue à jour, dépréciation contrôlée | Doc vs endpoints réels → aucune incohérence ou version non documentée | 🟢 Moyenne |
| API-10 | Unsafe Consumption of APIs | Valider/normaliser données externes, contrats stricts | Réponses malveillantes API tierce simulées → validation robuste côté app | 🟢 Moyenne |

---

### 8.4 Couche Déploiement (DEV-01 à DEV-03)

| ID | Faiblesse | Prévention clé | Test de validation | Priorité |
|---|---|---|---|---|
| DEV-01 | Secrets dans le code/variables | Coffre de secrets, rotation, interdiction secrets dans le code | Scan de secrets sur dépôt et pipelines → exempts de secrets | 🔴 Critique |
| DEV-02 | Dépendances vulnérables / supply chain | Pinning, validation sources, mise à jour contrôlée (SCA) | Scan SCA → aucune vulnérabilité critique persistante | 🟡 Haute |
| DEV-03 | Pipeline CI/CD non protégé | Accès minimal, signatures artefacts, protections de branche | Séparation des rôles, protections branches, traçabilité vérifiées | 🔴 Critique |

---

### 8.5 Couche Production (PROD-01 à PROD-03)

| ID | Faiblesse | Prévention clé | Test de validation | Priorité |
|---|---|---|---|---|
| PROD-01 | Absence de monitoring utile | Observabilité, SIEM, alertes sur événements sensibles | Événements anormaux simulés → alerte générée et visible | 🟡 Haute |
| PROD-02 | Exposition d'envs non-prod | Séparation stricte, filtrage accès, fermeture endpoints de test | Scanner domaines/IP → envs non-prod non accessibles publiquement | 🟡 Haute |
| PROD-03 | Mauvaise gestion des mises à jour | Politique de patching, fenêtres de maintenance, rollback testé | Chaque composant = version supportée + historique patch + rollback testé | 🟢 Moyenne |

---

## 9. Phase 6 — Pre-Launch Gate

**Commande :** `bmad prelaunch` → checklist bloquante avant toute mise en production

> ⚠️ Toutes les cases doivent être cochées. **Un seul point non validé = go-live bloqué.**

### 9.1 Checklist fonctionnelle

- [ ] Login et reset de mot de passe testés en environnement de **production réelle**
- [ ] Paiements testés en **mode réel** (pas seulement test mode)
- [ ] **SSL actif** sur le domaine de production
- [ ] Environnements dev / staging / production **strictement séparés**
- [ ] Clés API **non exposées** côté client — scan de secrets effectué
- [ ] **Backups** de la BDD de production vérifiés fonctionnels
- [ ] **Vérification email** activée
- [ ] **Pagination** active sur toutes les listes

### 9.2 Checklist sécurité

- [ ] **Rate limiting** actif sur tous les endpoints sensibles
- [ ] **Protection anti-bot/spam** activée
- [ ] **Validation des inputs** testée côté serveur (bypass front-end vérifié)
- [ ] **CSRF** protégé sur tous les formulaires et actions mutatives
- [ ] **Headers de sécurité** présents (X-Frame-Options, CSP, X-Content-Type-Options)
- [ ] Aucun **endpoint de debug ou test** exposé en production
- [ ] Variables d'environnement depuis un **coffre de secrets** (pas en dur dans le code)
- [ ] **Pipeline CI/CD protégé** : accès minimal, protections de branche actives
- [ ] **Scan SCA** des dépendances : aucune vulnérabilité critique

### 9.3 Checklist observabilité & performance

- [ ] **Monitoring d'erreurs** actif et alertes configurées
- [ ] **Journalisation** des actions sensibles centralisée
- [ ] **Tests de charge** effectués — pas de bottleneck identifié
- [ ] **Politique de patching** définie et rollback testé

---

*BMAD Framework v2.0 — DGBF Côte d'Ivoire — Juillet 2026*
