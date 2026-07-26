# Contrat Frontend -> Backend

Ce document decrit ce que le frontend envoie actuellement au backend pour chaque endpoint consomme. Il sert a aligner les DTO, query params, headers et champs de reponse utiles.

Base URL par defaut :

```txt
NEXT_PUBLIC_DEPLOYED_API || http://localhost:9000
```

## Format global attendu

La plupart des endpoints sont lus sous ce format :

```ts
{
  data?: T;
  success?: boolean;
  message?: string;
}
```

## Headers

### Endpoints publics

Endpoints publics appeles sans bearer :

- `POST /users`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/accept-invitation`

Headers envoyes :

```http
Content-Type: application/json
```

### Endpoints proteges

Tous les appels via `apiFetchJson` ajoutent :

```http
Content-Type: application/json
Authorization: Bearer <accessToken>
```

Si le backend retourne `401`, le front appelle `POST /auth/refresh` avec le `refreshToken`, met a jour le store auth, puis rejoue la requete initiale.

## Auth

### Login

```http
POST /auth/login
```

Payload envoye :

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

Champs de reponse utilises :

```ts
{
  success: boolean;
  message?: string;
  data?: {
    token: string;
    refreshToken: string;
    user: {
      id: string;
      userName: string;
      email: string;
      isOnline?: boolean;
      avatar?: string | null;
    };
  };
}
```

Le front stocke `token`, `refreshToken` et `data.user` dans le store auth.

### Register

```http
POST /users
```

Payload envoye strictement :

```json
{
  "userName": "John",
  "email": "john@example.com",
  "password": "password123",
  "avatar": "https://example.com/avatar.png"
}
```

Notes :

- `avatar` est optionnel.
- Le front n'envoie pas `conditions`.
- Le front n'envoie pas `id`, `createdAt`, `updatedAt`, `isOnline`, `status`.
- Le front attend `success` et `message`; si `success=true`, redirection vers `/login`.

### Refresh Token

```http
POST /auth/refresh
```

Payload envoye :

```json
{
  "refreshToken": "refresh-token"
}
```

Champs de reponse utilises :

```ts
{
  success: boolean;
  message?: string;
  data: {
    token: string;
    refreshToken?: string;
  };
}
```

### Accept Invitation

```http
POST /auth/accept-invitation
```

Payload envoye :

```json
{
  "token": "invitation-token-from-url",
  "password": "newPassword123"
}
```

Contexte front :

- Route front : `/accept-invitation?token=...`
- Le token est lu depuis la query string.
- Si `success=true`, redirection vers `/login`.

### Logout

```http
POST /auth/logout/:id
Authorization: Bearer <token>
```

Path param :

```ts
id = currentUser.id
```

Payload :

```txt
aucun body
```

Si `success=true`, le front reset le store auth et le workspace courant, puis redirige vers `/login`.

## Users

### Get User

```http
GET /users/:id
Authorization: Bearer <token>
```

Path param :

```ts
id = currentUser.id
```

Champs de reponse utilises :

```ts
{
  id: string;
  userName: string;
  email: string;
  avatar?: string;
  isOnline?: boolean;
  lastSeen?: string;
  createdAt?: string;
  updatedAt?: string;
  status?: "ACTIVE" | "INACTIVE" | "BANNED" | "SUSPENDED";
}
```

### Update User

```http
PATCH /users/:id
Authorization: Bearer <token>
```

Payload possible cote service :

```json
{
  "userName": "John Updated",
  "email": "john.updated@example.com",
  "avatar": "data:image/png;base64,..."
}
```

Usage actuel dans l'UI :

```json
{
  "avatar": "data:image/png;base64,..."
}
```

Notes :

- Le backend ne gere plus l'upload fichier.
- Le front lit le fichier localement et envoie une string `avatar`.

### Update Password

```http
PATCH /users/:id/password
Authorization: Bearer <token>
```

Payload envoye :

```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword123"
}
```

### Delete User

```http
DELETE /users/:id
Authorization: Bearer <token>
```

Payload :

```txt
aucun body
```

Si `success=true`, le front reset la session et redirige vers `/login`.

### List Users

```http
GET /users?page=1&page_size=100000&workspaceId=<workspaceId>&search=john
Authorization: Bearer <token>
```

Query params envoyes par le service :

```ts
page: number;        // default 1
page_size: number;   // default 100000
workspaceId?: string;
search?: string;
```

Note : l'UI actuelle prefere `GET /workspaces/:workspaceId/users` pour la selection d'utilisateurs.

## Workspaces

### List My Workspaces

```http
GET /workspaces
Authorization: Bearer <token>
```

Payload :

```txt
aucun body
```

Champs de reponse utilises :

```ts
Array<{
  id: string;
  name: string;
  role?: "OWNER" | "ADMIN" | "MEMBER";
  createdAt?: string;
  updatedAt?: string;
}>
```

Usage front :

- Charge les workspaces dans la sidebar.
- Si aucun workspace courant n'est selectionne, le front prend le premier de la liste.
- Le `workspaceId` courant est stocke dans `Workspace-store`.

### Create Workspace

```http
POST /workspaces
Authorization: Bearer <token>
```

Payload cote service :

```json
{
  "name": "Acme Inc"
}
```

Note : service disponible cote front, pas encore expose dans l'UI principale.

### List Workspace Users

```http
GET /workspaces/:workspaceId/users?search=john
Authorization: Bearer <token>
```

Path param :

```ts
workspaceId = currentWorkspaceId
```

Query params :

```ts
search?: string;
```

Champs de reponse utilises :

```ts
Array<{
  id: string;
  userName: string;
  email: string;
  avatar?: string;
  isOnline?: boolean;
}>
```

Usage front :

- Selection d'un utilisateur pour creer une DM.
- Selection de membres pendant le wizard de creation de room.

### Import Users From CSV

```http
POST /workspaces/:workspaceId/users/import
Authorization: Bearer <token>
```

Payload cote service :

```json
{
  "dryRun": true,
  "csv": "email,userName,role\njohn@example.com,John Doe,MEMBER"
}
```

ou :

```json
{
  "dryRun": false,
  "csv": "email,userName,role\njohn@example.com,John Doe,MEMBER"
}
```

Champs de reponse typés cote front :

```ts
{
  imported?: Array<{
    email: string;
    userId?: string;
    action: string;
    invitationUrl?: string;
  }>;
  errors?: Array<{
    email?: string;
    line?: number;
    message: string;
  }>;
}
```

Note : service disponible cote front, pas encore expose dans l'UI principale.

### Create Or Get Direct Message

```http
POST /workspaces/:workspaceId/dms
Authorization: Bearer <token>
```

Path param :

```ts
workspaceId = currentWorkspaceId
```

Payload envoye :

```json
{
  "targetUserId": "target-user-id"
}
```

Champs de reponse utilises :

```ts
{
  id?: string;
  name: string;
  displayName?: string;
  description?: string;
  isPrivate: boolean;
  isDirectMessage: boolean;
  isDeleted?: boolean;
  lastMessage?: string;
  otherUser?: {
    id?: string;
    userName?: string;
    avatar?: string;
    isOnline?: boolean;
  } | null;
  createdAt?: string;
}
```

Apres reponse, le front envoie le premier message via `POST /messages`.

## Rooms

### List Group Rooms

```http
GET /rooms?workspaceId=<workspaceId>&isDirectMessage=false&search=general
Authorization: Bearer <token>
```

Query params envoyes :

```ts
workspaceId: string;
isDirectMessage: "false";
search?: string;
```

### List Direct Messages

```http
GET /rooms?workspaceId=<workspaceId>&isDirectMessage=true&search=john
Authorization: Bearer <token>
```

Query params envoyes :

```ts
workspaceId: string;
isDirectMessage: "true";
search?: string;
```

### Create Room

```http
POST /rooms
Authorization: Bearer <token>
```

Payload envoye :

```json
{
  "workspaceId": "workspace-id",
  "name": "General",
  "description": "Salle créée par John",
  "isPrivate": false,
  "isDirectMessage": false
}
```

Notes :

- Le front n'envoie pas `isDeleted`.
- Le front n'envoie pas de liste de membres dans ce payload.
- Le front suppose que le backend ajoute le createur comme `OWNER`.

### Get Room Members

```http
GET /rooms/members/:id
Authorization: Bearer <token>
```

Path param :

```ts
id = roomId
```

Champs de reponse utilises :

```ts
Array<{
  id: string;
  role: "OWNER" | "ADMIN" | "MODERATOR" | "MEMBER";
  isActive: boolean;
  userId: string;
  roomId: string;
  joinedAt: string;
  user: {
    id: string;
    userName: string;
    avatar?: string;
  };
}>
```

### Update Member Role

```http
PATCH /room-members/:memberId/role
Authorization: Bearer <token>
```

Payload envoye :

```json
{
  "role": "ADMIN"
}
```

Roles possibles cote front :

```ts
"OWNER" | "ADMIN" | "MODERATOR" | "MEMBER"
```

### Kick Member

```http
DELETE /room-members/:memberId/kick
Authorization: Bearer <token>
```

Payload :

```txt
aucun body
```

### Join Room

```http
POST /room-members
Authorization: Bearer <token>
```

Payload cote service :

```json
{
  "roomId": "room-id"
}
```

Note : service disponible cote front, pas utilise dans le wizard de creation de room actuel.

## Messages

### List Room Messages

```http
GET /messages/room/:id?search=hello
Authorization: Bearer <token>
```

Path param :

```ts
id = roomId
```

Query params :

```ts
search?: string;
```

Champs de reponse utilises :

```ts
Array<{
  id: string;
  content: string;
  isDeleted: boolean;
  type: "TEXT" | "IMAGE" | "FILE" | "SYSTEM" | string;
  createdAt: string;
  updatedAt: string;
  sender: {
    userName: string;
    avatar?: string;
  };
}>
```

### Create Message

```http
POST /messages
Authorization: Bearer <token>
```

Payload envoye :

```json
{
  "roomId": "room-id",
  "content": "Hello",
  "type": "TEXT"
}
```

Notes :

- Le front n'envoie pas `senderId`.
- Le front n'envoie pas `isDeleted`.
- Le backend doit deduire l'auteur depuis le JWT.

### Update Message

```http
PATCH /messages/:id
Authorization: Bearer <token>
```

Payload envoye :

```json
{
  "content": "Message modifié"
}
```

### Delete Message

```http
DELETE /messages/:id
Authorization: Bearer <token>
```

Payload :

```txt
aucun body
```

## Statistics

### User Overview

```http
GET /statistics/user/:userId/overview
Authorization: Bearer <token>
```

Path param :

```ts
userId = currentUser.id
```

Query params :

```txt
aucun query param envoye actuellement
```

Champs de reponse utilises :

```ts
{
  messagesByDay: Array<{
    date: string;
    count: number;
  }>;
  averageResponseTime: number;
  topConversations: Array<{
    roomId: string;
    roomName: string;
    messageCount: number;
    lastMessageAt: string;
  }>;
  activeConversations: Array<{
    roomId: string;
    roomName: string;
    messageCount: number;
  }>;
  recentActivities: Array<{
    type: string;
    description: string;
    roomId: string;
    roomName: string;
    timestamp: string;
  }>;
  totalMessagesSent: number;
}
```

## Etat local important

Le front s'appuie sur deux stores persistés :

```ts
User-store = {
  result?: {
    id?: string;
    userName: string;
    email: string;
    avatar?: string;
    isOnline?: boolean;
    lastSeen?: string;
    status?: string;
    token?: string;
    refreshToken?: string;
  }
}
```

```ts
Workspace-store = {
  currentWorkspaceId?: string;
}
```

## Points a valider avec le backend

- `PATCH /users/:id` accepte-t-il une string `avatar` en data URL base64, ou uniquement une URL externe ?
- `POST /rooms` ajoute-t-il bien automatiquement le createur comme `OWNER` ?
- `GET /rooms?workspaceId=...&isDirectMessage=...` retourne-t-il un tableau simple dans `data`, sans pagination ?
- `GET /workspaces/:workspaceId/users` retourne-t-il un tableau simple dans `data`, sans wrapper pagination ?
- Les rooms DM retournees contiennent-elles toujours `displayName`, `otherUser` ou au minimum `name` exploitable par le front ?

