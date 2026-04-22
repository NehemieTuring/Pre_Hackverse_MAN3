# ⏱️ Hackverse — Gestion Intelligente du Temps Étudiant

## Contexte et problématique

Les étudiants font face à un défi constant : **gérer efficacement leur temps** entre les cours, les projets, les révisions et la vie personnelle. La surcharge de tâches, le manque de visibilité sur les priorités et l'absence d'outils adaptés conduisent souvent à une mauvaise organisation, du stress et des échéances manquées.

**Hackverse** est une application web intelligente de gestion du temps conçue spécifiquement pour les étudiants. Elle combine la **Matrice d'Eisenhower** pour la priorisation automatique, un **moteur de planification intelligent par IA** pour l'optimisation du calendrier, et un **système de notifications par email** pour les rappels proactifs. L'objectif est de transformer la gestion du temps en une expérience fluide, visuelle et assistée par l'intelligence artificielle.

---

## Fonctionnalités

### Obligatoires
- [x] **Gestion des tâches (CRUD)** — Créer, lire, modifier, supprimer des tâches avec titre, description, date d'échéance et durée estimée
- [x] **Attribution de priorité** — Système d'importance (1-5) et d'urgence auto-calculée selon la proximité de la deadline
- [x] **Planification (calendrier)** — Vue hebdomadaire interactive avec navigation temporelle et double-clic pour ajouter des créneaux
- [x] **Authentification sécurisée** — Inscription / Connexion via JWT avec chiffrement BCrypt des mots de passe
- [x] **Tableau de bord** — Vue d'ensemble avec graphiques (camembert, courbes), KPIs et accès rapide aux tâches urgentes

### Bonus
- [x] **Priorisation automatique (Matrice d'Eisenhower)** — Classification automatique en 4 quadrants (Q1: Critique, Q2: Planifié, Q3: Délégué, Q4: Plus tard) avec score de priorité composite
- [x] **Planification intelligente par IA** — Algorithme de scheduling qui analyse les tâches, respecte les indisponibilités, et génère un planning optimal en un clic
- [x] **Chronomètre de focus (Pomodoro intégré)** — Timer start/pause/stop par tâche avec suivi du temps réel passé
- [x] **Notifications par email** — Rappels automatiques 24h avant l'échéance + mail de bienvenue à l'inscription
- [x] **Statistiques avancées** — Taux de complétion, répartition par quadrant, temps moyen de focus, graphiques dynamiques
- [x] **Mode Clair / Sombre** — Thème persistant avec basculement fluide sur toutes les pages (y compris auth)
- [x] **Vue Matrice Eisenhower** — Affichage visuel en grille 2x2 des tâches par quadrant
- [x] **Gestion des indisponibilités** — CRUD complet pour bloquer des créneaux (cours, activités fixes)
- [x] **Paramètres utilisateur** — Modification du profil, mot de passe, préférences de notification
- [x] **Administration** — Panneau d'administration pour la gestion des utilisateurs (ROLE_ADMIN)

---

## Logique métier

### Algorithme de Priorisation (Eisenhower + Score Composite)

Chaque tâche est automatiquement classifiée et scorée à la création et à chaque mise à jour :

```
ENTRÉE : importance (1-5, saisie utilisateur), dueDate (deadline)

1. CALCULER urgency dynamiquement :
   - Si daysRemaining ≤ 1  → urgency = 5
   - Si daysRemaining ≤ 3  → urgency = 4
   - Si daysRemaining ≤ 7  → urgency = 3
   - Si daysRemaining ≤ 14 → urgency = 2
   - Sinon                 → urgency = 1

2. CLASSIFIER quadrant Eisenhower :
   - importance ≥ 4 ET urgency ≥ 4 → Q1 (Critique : Urgent & Important)
   - importance ≥ 4 ET urgency < 4  → Q2 (Planifié : Important, pas urgent)
   - importance < 4  ET urgency ≥ 4 → Q3 (Délégué : Urgent, pas important)
   - Sinon                          → Q4 (Plus tard)

3. CALCULER priorityScore composite :
   bonusDelai = {≤1j: 5, ≤3j: 4, ≤7j: 3, ≤14j: 2, sinon: 1}
   priorityScore = (importance × 3) + (urgency × 2) + bonusDelai

SORTIE : eisenhowerQuadrant, urgency, priorityScore
```

### Algorithme de Planification Intelligente (IA)

Le moteur de planning génère automatiquement un emploi du temps optimal :

```
ENTRÉE : tâches non terminées, indisponibilités utilisateur

1. TRIER les tâches par :
   - Ordre du quadrant (Q1 > Q2 > Q3 > Q4)
   - Score de priorité (décroissant)
   - Date d'échéance (croissant)

2. DÉFINIR la fenêtre de planification :
   - startTime = maintenant + 1h (arrondi à l'heure)
   - endTime = max(deadlines) + 7 jours

3. CRÉER les créneaux libres :
   - Initialiser [startTime → endTime]
   - POUR CHAQUE indisponibilité :
     - Soustraire le créneau occupé
     - Filtrer les créneaux < 15 minutes

4. PLACER chaque tâche :
   - POUR CHAQUE tâche triée :
     - Trouver le premier créneau libre ≥ durée estimée
     - Vérifier que le créneau ne dépasse pas la deadline
     - Assigner [scheduledStart, scheduledEnd]
     - Réduire le créneau libre restant
   - Si aucun créneau disponible → marquer "UNSCHEDULABLE"

5. PERSISTER en base :
   - L'utilisateur valide le planning proposé
   - Les champs scheduledStart/scheduledEnd sont sauvegardés dans la table tasks

SORTIE : planning optimisé avec créneaux assignés
```

### Système de Notifications

```
DÉCLENCHEUR : Scheduler CRON à 8h00 chaque matin

1. RÉCUPÉRER toutes les tâches :
   - status ≠ DONE
   - dueDate entre [maintenant] et [maintenant + 24h]
   - utilisateur.emailNotificationsEnabled = true

2. VÉRIFIER la déduplication :
   - Aucune notification REMINDER_24H envoyée dans les 23 dernières heures

3. ENVOYER email via SMTP Gmail :
   - Sujet : "Rappel : {titre de la tâche}"
   - Corps : Message personnalisé avec le nom de l'utilisateur

4. LOGGER le résultat (SENT / FAILED) dans notification_logs
```

---

## UI/UX

### Design System
L'interface adopte un design **premium glassmorphism** avec deux thèmes persistants :

- **Mode Sombre** : Palette bleu profond (#0a0f1a) avec effets de verre, orbes lumineux animés et accents cyan/violet
- **Mode Clair** : Fond ardoise léger (#f1f5f9) avec cartes blanches, ombres portées élégantes et contrastes renforcés

### Pages principales

| Page | Description |
|------|-------------|
| **Landing Page** | Page d'accueil avec animation d'arrière-plan, CTA vers inscription |
| **Connexion / Inscription** | Formulaires split-screen avec panneau de marque animé et sélecteur de thème |
| **Dashboard** | Vue d'ensemble : 4 KPI cards, graphique camembert Eisenhower, courbe de tendance, tâches urgentes |
| **Mes Tâches** | Liste triable et filtrable + Vue Matrice Eisenhower 2×2, chrono intégré par ligne |
| **Nouvelle Tâche** | Formulaire interactif avec sliders importance/urgence, auto-classification quadrant |
| **Détails Tâche** | Vue complète d'une tâche avec édition inline, statut, chrono et métriques |
| **Planning Intelligent** | Calendrier hebdomadaire interactif, génération IA, gestion des indisponibilités |
| **Statistiques** | Graphiques avancés : barres, courbes, camembert avec données dynamiques |
| **Paramètres** | Profil, mot de passe, préférences de notification, thème |

### Ergonomie
- **Navigation latérale** rétractable avec icônes et labels
- **Transitions fluides** entre toutes les pages
- **Feedback utilisateur** systématique via toasts (succès / erreur)
- **Responsive** : adapté desktop et tablette
- **Micro-animations** : hover effects, transitions CSS, loading spinners

---

## Stack technique

| Couche | Technologie | Version |
|--------|-------------|---------|
| **Frontend** | Next.js (React 18) | 14.x |
| **Styling** | Vanilla CSS + Inline Styles (JSX) | — |
| **Graphiques** | Recharts | 2.x |
| **Icônes** | Lucide React | latest |
| **Notifications UI** | Sonner (Toast) | latest |
| **HTTP Client** | Axios | latest |
| **Backend** | Spring Boot (Java 17+) | 3.x |
| **Sécurité** | Spring Security + JWT | — |
| **ORM** | Spring Data JPA + Hibernate | — |
| **Email** | Spring Mail (JavaMailSender) | — |
| **Scheduler** | Spring Scheduling (@Scheduled) | — |
| **Base de données** | MySQL | 8.x |
| **Build** | Maven | 3.x |

### Architecture Backend

```
com.hackverse/
├── config/           # SecurityConfig, SchedulerConfig
├── controller/       # REST Controllers (Task, Planner, Auth, Statistics, User, Admin, Unavailability)
├── dto/
│   ├── request/      # TaskRequest, LoginRequest, RegisterRequest, ScheduleRequest
│   └── response/     # AuthResponse, UserResponse, ScheduledTaskDTO
├── entity/           # Task, User, TimerSession, Unavailability, NotificationLog
├── enums/            # TaskStatus, EisenhowerQuadrant, TimerStatus, NotificationStatus
├── exception/        # Gestion des erreurs
├── repository/       # JPA Repositories
├── security/         # JwtUtil, JwtAuthFilter, CustomUserDetailsService
└── service/          # TaskService, PlannerService, EisenhowerService, UrgencyCalculatorService,
                      # TimerSessionService, NotificationService, AuthService
```

### Architecture Frontend

```
frontend/
├── app/
│   ├── page.tsx                 # Landing Page
│   ├── globals.css              # Design tokens (thèmes clair/sombre)
│   ├── (auth)/
│   │   ├── login/page.tsx       # Connexion
│   │   └── register/page.tsx    # Inscription
│   └── (dashboard)/
│       ├── layout.tsx           # Sidebar + Theme Toggle
│       ├── dashboard/page.tsx   # Tableau de bord
│       ├── tasks/
│       │   ├── page.tsx         # Liste des tâches + Matrice
│       │   ├── new/page.tsx     # Création de tâche
│       │   └── [id]/page.tsx    # Détails d'une tâche
│       ├── planner/page.tsx     # Planning IA
│       ├── statistics/page.tsx  # Statistiques
│       ├── settings/page.tsx    # Paramètres
│       └── admin/page.tsx       # Administration
├── components/
│   └── ConfirmModal.tsx         # Modal de confirmation réutilisable
├── hooks/
│   ├── useTasks.ts              # Hook de gestion des tâches
│   └── useUnavailabilities.ts   # Hook de gestion des indisponibilités
└── lib/
    ├── api.ts                   # Client Axios configuré
    ├── auth.ts                  # Utilitaires d'authentification (JWT)
    └── types.ts                 # Types TypeScript partagés
```

### Schéma de Base de Données

```
┌──────────────────┐     ┌──────────────────────┐
│      users       │     │     user_roles        │
├──────────────────┤     ├──────────────────────┤
│ id (PK)          │────▶│ user_id (FK)          │
│ full_name        │     │ roles                 │
│ email (UNIQUE)   │     └──────────────────────┘
│ password         │
│ email_notif...   │     ┌──────────────────────┐
│ created_at       │     │   unavailabilities    │
│ updated_at       │     ├──────────────────────┤
└──────────────────┘     │ id (PK)              │
        │                │ user_id (FK)         │
        │                │ title                │
        ├───────────────▶│ start_datetime       │
        │                │ end_datetime         │
        │                │ is_recurring         │
        │                └──────────────────────┘
        │
        │                ┌──────────────────────┐
        │                │       tasks           │
        │                ├──────────────────────┤
        ├───────────────▶│ id (PK)              │
        │                │ user_id (FK)         │
        │                │ title                │
        │                │ description          │
        │                │ importance (1-5)     │
        │                │ urgency (1-5)        │
        │                │ eisenhower_quadrant  │
        │                │ priority_score       │
        │                │ estimated_time_min   │
        │                │ actual_time_spent    │
        │                │ due_date             │
        │                │ status (ENUM)        │
        │                │ scheduled_start      │
        │                │ scheduled_end        │
        │                └──────────┬───────────┘
        │                           │
        │                ┌──────────▼───────────┐
        │                │   timer_sessions     │
        │                ├──────────────────────┤
        │                │ id (PK)              │
        │                │ task_id (FK)         │
        │                │ start_time           │
        │                │ end_time             │
        │                │ duration_seconds     │
        │                │ status (ENUM)        │
        │                └──────────────────────┘
        │
        │                ┌──────────────────────┐
        │                │  notification_logs   │
        │                ├──────────────────────┤
        └───────────────▶│ id (PK)              │
                         │ user_id (FK)         │
                         │ task_id (FK)         │
                         │ sent_at              │
                         │ email_type           │
                         │ status (ENUM)        │
                         │ error_message        │
                         └──────────────────────┘
```

---

## API REST

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `POST` | `/api/auth/register` | Inscription d'un nouvel utilisateur |
| `POST` | `/api/auth/login` | Connexion et récupération du token JWT |
| `GET` | `/api/tasks` | Récupérer toutes les tâches de l'utilisateur |
| `POST` | `/api/tasks` | Créer une nouvelle tâche |
| `GET` | `/api/tasks/{id}` | Détails d'une tâche |
| `PUT` | `/api/tasks/{id}` | Modifier une tâche |
| `DELETE` | `/api/tasks/{id}` | Supprimer une tâche |
| `PATCH` | `/api/tasks/{id}/status` | Changer le statut (TODO, IN_PROGRESS, DONE) |
| `PUT` | `/api/tasks/{id}/schedule` | Mettre à jour le créneau planifié |
| `POST` | `/api/tasks/{id}/timer/start` | Démarrer le chrono |
| `POST` | `/api/tasks/{id}/timer/pause` | Mettre en pause le chrono |
| `POST` | `/api/tasks/{id}/timer/stop` | Arrêter le chrono |
| `GET` | `/api/tasks/{id}/timer` | État actuel du chrono |
| `POST` | `/api/planner/generate` | Générer un planning IA |
| `POST` | `/api/planner/apply` | Appliquer le planning généré |
| `GET` | `/api/statistics` | Statistiques de l'utilisateur |
| `GET` | `/api/unavailabilities` | Lister les indisponibilités |
| `POST` | `/api/unavailabilities` | Créer une indisponibilité |
| `PUT` | `/api/unavailabilities/{id}` | Modifier une indisponibilité |
| `DELETE` | `/api/unavailabilities/{id}` | Supprimer une indisponibilité |
| `GET` | `/api/user/me` | Profil de l'utilisateur connecté |
| `PUT` | `/api/user/me` | Modifier le profil |
| `PUT` | `/api/user/me/password` | Changer le mot de passe |
| `GET` | `/api/admin/users` | Liste des utilisateurs (Admin) |

---

## Installation locale

### Prérequis
- **Java** 17+ (JDK)
- **Maven** 3.x
- **Node.js** 18+ et **npm**
- **MySQL** 8.x

### 1. Cloner le projet

```bash
git clone https://github.com/votre-repo/hackverse.git
cd hackverse
```

### 2. Configurer la base de données

```sql
CREATE DATABASE hackverse CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'nehemie'@'localhost' IDENTIFIED BY 'nehemie';
GRANT ALL PRIVILEGES ON hackverse.* TO 'nehemie'@'localhost';
FLUSH PRIVILEGES;
```

Puis appliquer le schéma :

```bash
python apply_schema.py
# ou manuellement :
mysql -u nehemie -p hackverse < backend/schema.sql
```

### 3. Lancer le Backend

```bash
cd backend
mvn spring-boot:run
```

Le serveur démarre sur `http://localhost:8080`.

### 4. Lancer le Frontend

```bash
cd frontend
npm install
npm run dev
```

L'application est accessible sur `http://localhost:3000`.

### 5. Configuration Email (optionnel)

Dans `backend/src/main/resources/application.properties`, configurez les identifiants SMTP :

```properties
spring.mail.username=votre-email@gmail.com
spring.mail.password=votre-mot-de-passe-app
```

> **Note** : Pour Gmail, utilisez un [mot de passe d'application](https://support.google.com/accounts/answer/185833).

---

## Tests

### Tests API (Python)

Un script de test automatisé est fourni pour valider les endpoints :

```bash
python test_api_hackverse.py
```

Ce script teste :
- Inscription et connexion
- CRUD des tâches
- Changement de statut
- Chronomètre (start / pause / stop)
- Génération et application du planning IA
- Indisponibilités
- Statistiques

### Tests manuels

1. **Créer un compte** via `/register`
2. **Se connecter** via `/login`
3. **Créer des tâches** avec différentes importances et deadlines
4. **Observer la classification automatique** dans la vue Matrice
5. **Générer un planning IA** et vérifier les créneaux proposés
6. **Appliquer le planning** et naviguer — les tâches restent affichées
7. **Démarrer/arrêter le chrono** sur une tâche
8. **Basculer le thème** clair ↔ sombre et vérifier la cohérence visuelle

---

## Équipe

| Nom | Rôle |
|-----|------|
| **Néhémie** | Développeur Full-Stack (Backend Spring Boot + Frontend Next.js) |

---

## Livrables

- **Dépôt GitHub** : https://github.com/votre-repo/hackverse
- **Invitations** envoyées aux trois adresses.
- **Email de soumission** envoyé le [date].
