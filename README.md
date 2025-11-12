# 💬 CHAT-APP

Application de messagerie web moderne construite avec Next.js 15, React 19 et TypeScript.

## 📱 Description

**CHAT-APP** est une application de chat en temps réel offrant :
- 💬 **Messages directs** - Conversations privées entre utilisateurs
- 🏠 **Salons de groupe** - Création de rooms publiques/privées
- 📊 **Dashboard** - Statistiques et activité récente
- 👥 **Gestion d'utilisateurs** - Recherche et invitation d'utilisateurs

## 🚀 Démarrage Rapide

### Installation

```bash
npm install
```

### Développement

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

### Build Production

```bash
npm run build
npm start
```

### Linter

```bash
npm run lint
```

## 🏗️ Architecture

### Stack Technique

| Technologie | Version | Usage |
|------------|---------|-------|
| **Next.js** | 15.5.3 | Framework React avec App Router |
| **React** | 19.1.0 | Bibliothèque UI |
| **TypeScript** | ^5 | Typage statique |
| **Turbopack** | - | Build tool ultra-rapide |
| **Tailwind CSS** | ^4 | Framework CSS utility-first |
| **Zustand** | ^5.0.8 | Gestion d'état global |
| **TanStack Query** | ^5.90.1 | Gestion d'état serveur |
| **React Hook Form** | ^7.63.0 | Gestion de formulaires |
| **Zod** | ^4.1.11 | Validation de schémas |

### Structure du Projet

```
src/app/
├── core/
│   ├── components/
│   │   ├── ui/              # 30+ composants UI réutilisables
│   │   │   ├── button.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   └── ...
│   │   └── widgets/         # Composants composites
│   │       ├── sidebar/     # Navigation principale
│   │       ├── modals/      # Gestion des modales
│   │       ├── search-bar/  # Barre de recherche
│   │       └── file-upload/ # Upload de fichiers
│   ├── service/             # Couche de services API
│   │   ├── auth.service.ts
│   │   ├── messages.service.ts
│   │   ├── rooms.service.ts
│   │   └── users.service.ts
│   ├── stores/              # State management
│   │   ├── auth.store.ts    # Store d'authentification
│   │   └── local-storage.ts # Utilitaires localStorage
│   └── utils/
│       └── constants.ts     # Routes et clés React Query
│
├── features/                # Modules fonctionnels
│   ├── (auth)/
│   │   ├── login/           # Page de connexion
│   │   └── register/        # Page d'inscription
│   ├── home/                # Dashboard
│   ├── messages/            # Messagerie directe
│   │   └── components/
│   │       ├── message-list.tsx
│   │       ├── chat-stepper.tsx
│   │       └── ...
│   └── rooms/               # Salons de groupe
│       └── components/
│           ├── card-list.tsx
│           ├── room-stepper.tsx
│           └── ...
│
├── (auth)/                  # Route group - Auth
│   ├── login/
│   └── register/
│
├── (root)/                  # Route group - App principale
│   ├── home/
│   ├── chats/
│   └── rooms/
│
└── (lab)/                   # Route group - Expérimental
    └── widget/
```

## ⚙️ Fonctionnalités

### 🔐 Authentification
- Inscription avec validation (username, email, mot de passe)
- Connexion sécurisée avec token JWT
- Persistance de session (localStorage)
- Déconnexion avec nettoyage

### 💬 Messagerie Directe
- Liste des conversations avec recherche
- Affichage des messages en temps réel
- Création de conversation via wizard 3 étapes :
  1. Sélection d'utilisateur
  2. Composition du message
  3. Confirmation
- Auto-refresh toutes les 5 secondes
- Historique des messages

### 🏠 Salons de Groupe
- Création de salons publics/privés
- Invitation multi-utilisateurs
- Configuration de salle (nom, description)
- Liste des salons avec recherche
- Affichage des messages par salon
- Rejoint des rooms existantes

### 📊 Dashboard
- Statistiques en temps réel :
  - Nombre total de rooms
  - Nombre total de chats
  - Membres actifs
- Cartes d'actions rapides
- Fil d'activité récente
- Raccourcis clavier (Ctrl+K)

### 👥 Gestion des Utilisateurs
- Liste paginée des utilisateurs
- Recherche d'utilisateurs
- Indicateurs de statut (en ligne/hors ligne)
- Profils utilisateurs

## 🔌 API Backend

### Configuration

Définir l'URL de l'API dans `.env.local` :

```env
NEXT_PUBLIC_DEPLOYED_API=http://localhost:9000
```

Par défaut, l'application se connecte à `http://localhost:9000`.

### Endpoints Utilisés

#### Authentification
- `POST /auth/login` - Connexion
- `POST /auth/logout/{id}` - Déconnexion
- `POST /users` - Inscription

#### Salons (Rooms)
- `GET /rooms/user-rooms/{id}?isDirectMessage={bool}` - Liste des salons
- `POST /rooms` - Créer un salon
- `POST /room-members` - Rejoindre un salon

#### Messages
- `GET /messages/room/{id}` - Récupérer les messages
- `GET /messages/room/{id}?search={query}` - Rechercher des messages
- `POST /messages` - Envoyer un message

#### Utilisateurs
- `GET /users?page={page}&page_size={size}&search={query}` - Liste des utilisateurs

### Authentification API

Toutes les requêtes authentifiées incluent un Bearer token :

```
Authorization: Bearer {token}
```

## 🎨 Composants UI

### Bibliothèque de Composants

L'application utilise **Radix UI** + **shadcn/ui** pour une UI accessible et moderne :

**Primitives Radix UI** :
- Accordion, Alert Dialog, Checkbox
- Dialog, Dropdown Menu, Hover Card
- Label, Popover, Radio Group
- Scroll Area, Select, Separator
- Slot, Switch, Tabs, Tooltip

**Composants Personnalisés** :
- MultiSelect - Sélection multiple
- SelectSearch - Select avec recherche
- SvgWrapper - Wrapper pour SVG
- Stepper - Assistant multi-étapes
- PasswordInputWithToggle - Input mot de passe sécurisé

### Design System

- **Palette de couleurs** : Primary (blue), accents (green, purple, orange)
- **Icônes** : Lucide React (50+ icônes)
- **Typographie** : Poppins (weights 100-900)
- **Mode sombre** : Support complet avec next-themes
- **Responsive** : Mobile-first avec Tailwind

## 📦 Dépendances Principales

### Core
```json
{
  "next": "15.5.3",
  "react": "19.1.0",
  "typescript": "^5"
}
```

### State Management
```json
{
  "zustand": "^5.0.8",
  "@tanstack/react-query": "^5.90.1"
}
```

### Forms & Validation
```json
{
  "react-hook-form": "^7.63.0",
  "@hookform/resolvers": "^5.2.2",
  "zod": "^4.1.11"
}
```

### UI & Styling
```json
{
  "@radix-ui/*": "^1.x",
  "tailwindcss": "^4",
  "lucide-react": "^0.544.0",
  "sonner": "^2.0.7",
  "next-themes": "^0.4.6"
}
```

## 🔑 Modèles de Données

### User
```typescript
interface User {
  id?: string;
  userName: string;
  email: string;
  avatar?: string;
  isOnline?: boolean;
  lastSeen?: string;
  status?: string;
  token?: string;
}
```

### Room
```typescript
interface Room {
  id?: string;
  name?: string;
  displayName?: string;
  description?: string;
  isDirectMessage?: boolean;
  isPrivate?: boolean;
  lastMessage?: string;
}
```

### Message
```typescript
interface Message {
  id: string;
  content: string;
  isDeleted: boolean;
  type: "TEXT" | "IMAGE" | "VIDEO";
  createdAt: string;
  sender: {
    userName: string;
  };
}
```

## 🛣️ Routes

### Publiques
- `/login` - Page de connexion
- `/register` - Page d'inscription

### Protégées (nécessite authentification)
- `/home` - Dashboard
- `/chats` - Messagerie directe
- `/rooms` - Salons de groupe

### Expérimental
- `/widget` - Showcase de composants

## 🔒 Gestion d'État

### Zustand Store (Authentification)
```typescript
// Persisté dans localStorage avec key "User-store"
useUserStore({
  user: User | null,
  setUser: (user: User) => void,
  resetUser: () => void,
  initStore: () => void
})
```

### React Query
- **staleTime** : 60 secondes
- **refetchOnWindowFocus** : false
- **retry** : 2 tentatives
- Auto-refresh activé sur certaines queries (5s)

### Clés de Query
```typescript
GET_CHATS, GET_ROOMS, GET_MESSAGES,
GET_USERS, GET_ROOM, GET_CHAT
```

## 🎯 Patterns & Best Practices

✅ **Service Layer Pattern** - Encapsulation API dans des services
✅ **Custom Hooks** - Hooks React Query réutilisables
✅ **Composition** - Composants petits et composables
✅ **Type Safety** - TypeScript strict
✅ **Validation centralisée** - Schémas Zod réutilisables
✅ **State Hydration** - Gestion sûre du localStorage
✅ **Mobile-first** - Design responsive avec Tailwind
✅ **Accessibility** - Primitives Radix UI (WCAG compliant)
✅ **Error Handling** - Toast notifications (Sonner)

## 📖 Exemple de Flux : Créer un Chat

```
1. Utilisateur clique sur "Nouveau message"
   ↓
2. Modal s'ouvre avec ChatStepper (3 étapes)
   ↓
3. Étape 1 : Sélection d'utilisateur (UsersService)
   ↓
4. Étape 2 : Composition du message (MessageForm)
   ↓
5. Étape 3 : Confirmation
   - Création room (RoomsService.createRoom)
   - Envoi message (MessagesService.sendMessage)
   - Invalidation cache React Query
   ↓
6. Modal se ferme, liste se met à jour
   ↓
7. Nouveau chat apparaît dans le panneau gauche
```

## 🚀 Déploiement

### Vercel (Recommandé)

```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel
```

Consultez la [documentation de déploiement Next.js](https://nextjs.org/docs/app/building-your-application/deploying) pour plus de détails.

### Variables d'Environnement

Assurez-vous de définir :
```
NEXT_PUBLIC_DEPLOYED_API=https://votre-api.com
```

## 📚 Ressources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Radix UI](https://www.radix-ui.com/)
- [TanStack Query](https://tanstack.com/query/latest)
- [Zustand](https://zustand-demo.pmnd.rs/)

## 📝 License

Ce projet est privé.

---

**Développé avec ❤️ en utilisant Next.js 15 et React 19**