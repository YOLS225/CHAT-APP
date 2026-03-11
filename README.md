# CHAT-APP

Application de messagerie web full-stack permettant des conversations directes et des salles de groupe, construite avec Next.js 15, React 19 et TypeScript côté frontend, et NestJS + PostgreSQL côté backend.

---

## Prérequis

- **Node.js** >= 18.x (recommandé : 20+)
- **npm** >= 9
- Le **backend NestJS** doit être lancé séparément — voir le repo backend pour les instructions de démarrage

---

## Stack Technique

### Frontend
| Technologie | Version | Usage |
|-------------|---------|-------|
| Next.js | 15.5.3 | Framework React avec App Router |
| React | 19.1.0 | Bibliothèque UI |
| TypeScript | ^5 | Typage statique |
| Tailwind CSS | ^4 | Framework CSS utility-first |
| Zustand | ^5.0.8 | State global (auth) |
| TanStack Query | ^5.90.1 | State serveur + cache |
| React Hook Form | ^7.63.0 | Gestion de formulaires |
| Zod | ^4.1.11 | Validation de schémas |
| Radix UI | ^1.x | Composants UI accessibles |
| Sonner | ^2.0.7 | Notifications toast |
| next-themes | ^0.4.6 | Mode sombre |

### Backend (API séparée)
| Technologie | Usage |
|-------------|-------|
| NestJS + TypeScript | Framework backend |
| Prisma ORM + PostgreSQL | Base de données |
| JWT (access 25min + refresh 7j) | Authentification |
| Swagger (`/api`) | Documentation API |

> Le backend est un projet séparé. Une fois lancé, sa documentation Swagger est disponible sur `http://localhost:9000/api`.

---

## Démarrage Rapide

**1. Variables d'environnement**

```bash
cp .env.example .env.local
```

Modifier `.env.local` si le backend tourne sur un port différent :
```env
NEXT_PUBLIC_DEPLOYED_API=http://localhost:9000
```

**2. Installation et lancement**

```bash
# Installation des dépendances
npm install

# Développement (avec Turbopack)
npm run dev

# Build production
npm run build && npm start

# Linter
npm run lint
```

L'application est disponible sur [http://localhost:3000](http://localhost:3000).

> **Note :** Le frontend seul ne fonctionne pas sans le backend. Assurez-vous que l'API tourne sur le port configuré dans `.env.local` avant de lancer le front.

---

## Fonctionnalités

### Authentification
- [x] Inscription (username, email, mot de passe, CGU) — `POST /users`
- [x] Connexion email/password — `POST /auth/login`
- [x] Persistance de session (localStorage via Zustand)
- [x] Déconnexion — `POST /auth/logout/:id`
- [x] Refresh token automatique sur 401 (avec queue des requêtes concurrentes)
- [x] Redirection vers `/login` si le refresh échoue
- [ ] Middleware de protection des routes (actuellement sans garde côté Next.js — la protection repose uniquement sur le backend via JWT)

### Utilisateurs
- [x] Liste paginée avec recherche — `GET /users?page=&page_size=&search=`
- [x] Sélection d'un utilisateur pour créer un DM
- [x] Sélection multiple d'utilisateurs pour créer une room
- [x] Page profil utilisateur — `GET /users/:id`
- [x] Indicateur en ligne / hors ligne (`isOnline`, `lastSeen`)
- [x] Affichage du statut utilisateur (ACTIVE, INACTIVE, BANNED, SUSPENDED)
- [x] Mise à jour de l'avatar (upload image, preview local, `POST /storage/upload/avatar/:id`)
- [x] Changement de mot de passe — `PATCH /users/:id/password`
- [x] Suppression de compte — `DELETE /users/:id`
- [ ] Modification du username / email

### Messagerie Directe (`/chats`)
- [x] Liste des conversations avec recherche
- [x] Affichage des messages groupés par date (Aujourd'hui, Hier, date exacte)
- [x] Messages alignés à droite (soi) / gauche (autres)
- [x] Envoi de message — `POST /messages`
- [x] Édition d'un message inline — `PATCH /messages/:id`
- [x] Suppression d'un message — `DELETE /messages/:id`
- [x] Création de conversation (wizard 3 étapes : sélection user → message → confirmation)
- [x] Auto-refresh toutes les 5 secondes
- [x] Recherche dans les messages d'une conversation
- [ ] Types de messages : IMAGE, FILE (seul TEXT est géré)
- [ ] Upload de fichiers / images dans un message
- [ ] Indicateur de message en cours de frappe
- [ ] Accusés de réception / messages lus

### Salles de Groupe (`/rooms`)
- [x] Liste des rooms avec recherche
- [x] Affichage des messages par room
- [x] Création de room (wizard 3 étapes : sélection membres → config nom/privé → confirmation)
- [x] Créateur ajouté comme OWNER, membres ajoutés comme MEMBER — `POST /room-members`
- [x] Auto-refresh toutes les 5 secondes
- [x] Liste des membres d'une room avec rôles et statut online — `GET /rooms/members/:id`
- [x] Nommer un membre ADMIN — `PATCH /room-members/:id/role`
- [x] Retirer un membre d'une room — `DELETE /room-members/:id/kick`
- [ ] Quitter une room (soft leave)
- [ ] Modifier les informations d'une room (nom, description, visibilité)
- [ ] Supprimer une room

### Dashboard (`/home`)
- [x] Nombre de rooms de l'utilisateur
- [x] Nombre de chats directs de l'utilisateur
- [x] Actions rapides (raccourcis vers `/rooms` et `/chats`)
- [x] Feed d'activités récentes (temps réel via `/statistics/user/:id/overview`)
- [x] Total des messages envoyés (via `/statistics/user/:id/overview`)
- [x] Top conversations (par volume de messages)
- [ ] Messages par jour — données disponibles, graphique non intégré
- [ ] Temps de réponse moyen par conversation
- [ ] Conversations actives sur une période

### Navigation & Layout
- [x] Sidebar avec navigation Home / Rooms / Chats
- [x] Sidebar — dropdown utilisateur avec avatar et déconnexion
- [x] Mode sombre complet (next-themes + variables CSS oklch)
- [x] Responsive mobile-first
- [x] Page "Mon profil" (`/profil`)
- [x] Page "Paramètres" (`/parameters`) — thème, notifications, confidentialité, à propos

---

## Structure du Projet

```
src/app/
├── core/
│   ├── components/
│   │   ├── ui/              # 33+ composants UI (Radix UI / shadcn)
│   │   └── widgets/         # Composants composites
│   │       ├── layout/      # Layout principal (Sidebar + MainContent)
│   │       ├── sidebar/     # Navigation
│   │       ├── modals/      # Modale générique réutilisable
│   │       └── search-bar/  # Barre de recherche
│   ├── service/             # Couche API
│   │   ├── auth.service.ts
│   │   ├── messages.service.ts
│   │   ├── rooms.service.ts
│   │   ├── statistics.service.ts
│   │   └── users.service.ts
│   ├── stores/
│   │   └── auth.store.ts    # Store Zustand (persisté localStorage)
│   └── utils/
│       ├── api-fetch.ts     # Wrapper fetch (auth + refresh token)
│       └── constants.ts     # Routes et clés React Query
│
├── features/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── home/                # Dashboard
│   ├── messages/            # Messagerie directe
│   ├── rooms/               # Salles de groupe
│   ├── profil/              # Page profil utilisateur
│   └── parameters/          # Page paramètres
│
├── (auth)/                  # Route group public
├── (root)/                  # Route group protégé
└── (lab)/                   # Expérimental (widget showcase)
```

---

## Endpoints API utilisés

| Endpoint | Méthode | Usage |
|----------|---------|-------|
| `/auth/login` | POST | Connexion |
| `/auth/logout/:id` | POST | Déconnexion |
| `/auth/refresh` | POST | Refresh du token |
| `/users` | POST | Inscription |
| `/users` | GET | Liste des utilisateurs |
| `/rooms` | POST | Créer une room |
| `/rooms/user-rooms/:id` | GET | Rooms de l'utilisateur |
| `/room-members` | POST | Rejoindre une room |
| `/messages/room/:id` | GET | Messages d'une room |
| `/messages` | POST | Envoyer un message |
| `/messages/:id` | PATCH | Modifier un message |
| `/messages/:id` | DELETE | Supprimer un message |
| `/users/:id` | GET | Profil utilisateur |
| `/users/:id/password` | PATCH | Changer le mot de passe |
| `/users/:id` | DELETE | Supprimer le compte |
| `/storage/upload/avatar/:id` | POST | Upload avatar |
| `/rooms/members/:id` | GET | Membres d'une room |
| `/room-members/:id/role` | PATCH | Modifier le rôle d'un membre |
| `/room-members/:id/kick` | DELETE | Retirer un membre |
| `/statistics/user/:id/overview` | GET | Vue d'ensemble stats utilisateur |

Endpoints backend disponibles mais **non encore intégrés** :

| Endpoint | Méthode | Usage |
|----------|---------|-------|
| `/room-members/:id` | DELETE | Quitter une room (soft leave) |
| `/statistics/messages-per-day` | GET | Messages par jour |
| `/statistics/response-time` | GET | Temps de réponse moyen |
| `/statistics/active-conversations` | GET | Conversations actives |

---

## Patterns & Architecture

- **Service Layer** — toutes les requêtes API encapsulées dans des services dédiés
- **React Query** — cache serveur avec staleTime 60s, retry 2, auto-refresh 5s sur les listes
- **Zustand** — état global auth persisté en localStorage (`"User-store"`)
- **Token Refresh Queue** — les requêtes concurrentes sont mises en attente pendant le refresh, puis relancées
- **Context Wizard** — contextes React (`useChatCreation`, `useRoomCreation`) pour les steppers multi-étapes
- **Zod + React Hook Form** — validation centralisée sur tous les formulaires
- **Radix UI** — composants accessibles WCAG compliant

---

## License

Projet privé.