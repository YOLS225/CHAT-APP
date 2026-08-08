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
      platformRole?: "SUPER_ADMIN" | "USER";
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
- `avatar` peut etre une URL ou une data URL base64.
- Le front n'envoie pas `conditions`.
- Le front n'envoie pas `id`, `createdAt`, `updatedAt`, `isOnline`, `status`.
- Si un champ technique arrive quand meme, le backend le whitelist/ignore.
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

Usage front :

- Le bouton de creation workspace est visible uniquement si `currentUser.platformRole === "SUPER_ADMIN"`.
- Si aucun workspace n'existe et que l'utilisateur n'est pas `SUPER_ADMIN`, le front affiche un message indiquant qu'un administrateur plateforme doit creer le workspace.
- Apres creation, le workspace devient le workspace courant.

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
  avatar?: string | null;
  isOnline: boolean;
  lastSeen?: string;
  role?: "OWNER" | "ADMIN" | "MEMBER";
  memberId?: string;
  membershipStatus?: "ACTIVE" | "INVITED" | "DISABLED";
}>
```

Usage front :

- Annuaire `/team`.
- Selection d'un utilisateur pour creer une DM.
- Les actions de gestion membres sont visibles uniquement pour `OWNER` et `ADMIN`.
- Un `ADMIN` ne peut pas gerer un membre `OWNER` ni assigner `OWNER`.
- Un `OWNER` peut assigner `OWNER`, `ADMIN` ou `MEMBER`.

### Update Workspace Member

```http
PATCH /workspaces/:workspaceId/users/:userId
Authorization: Bearer <token>
```

Payload envoye selon l'action UI :

```json
{
  "role": "ADMIN"
}
```

ou :

```json
{
  "status": "ACTIVE"
}
```

Usage front :

- Action exposee dans `/team`, annuaire, menu actions membre.
- Roles proposés : `MEMBER`, `ADMIN`, et `OWNER` seulement si l'utilisateur courant est `OWNER`.
- Sert aussi a reactiver un membre si `membershipStatus !== ACTIVE`.

### Disable Workspace Member

```http
DELETE /workspaces/:workspaceId/users/:userId
Authorization: Bearer <token>
```

Payload :

```txt
aucun body
```

Usage front :

- Action exposee dans `/team`, annuaire, menu actions membre.
- Affiche `Désactiver`.
- Le backend desactive seulement la membership du workspace.

### Invite One User

```http
POST /workspaces/:workspaceId/users/invite
Authorization: Bearer <token>
```

Payload envoye :

```json
{
  "email": "john@example.com",
  "userName": "John Doe",
  "role": "MEMBER"
}
```

Notes front :

- Action exposee dans `/team`, onglet `Inviter`.
- `role` vaut `MEMBER`, `ADMIN`, ou `OWNER` seulement si l'utilisateur courant est `OWNER`.
- Le front bloque l'envoi avec `OWNER` si le role courant workspace n'est pas `OWNER`.
- Le resultat affiche `invitationUrl`, `emailSent`, `emailSkipped` et `emailError`.
- Apres succes, le front invalide `GET /workspaces/:workspaceId/users`.

Champs de reponse utilises :

```ts
{
  imported: Array<{
    email: string;
    userName: string;
    userId: string;
    action: string;
    invitationUrl?: string;
    emailSent?: boolean;
    emailSkipped?: boolean;
    emailError?: string;
  }>;
}
```

### Import Users From Excel/File

```http
POST /workspaces/:workspaceId/users/import/excel?dryRun=true
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

ou :

```http
POST /workspaces/:workspaceId/users/import/excel?dryRun=false
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

FormData envoye :

```ts
const formData = new FormData();
formData.append("file", file);
```

Important cote front :

- Le front n'ajoute pas manuellement `Content-Type`.
- Le navigateur ajoute le boundary multipart.
- Fichiers acceptes dans l'UI : `.xlsx`, `.xls`, `.csv`.
- Taille max verifiee cote front : `2MB`.
- Reponse immediate attendue : `data.jobId`, `data.status`, `data.dryRun`, `data.fileName`.
- Le front poll ensuite `GET /workspaces/:workspaceId/import-jobs/:jobId`.
- Si le job dry-run est `COMPLETED`, `result.preview` alimente l'aperçu.
- Si `result.preview.length > 0` et aucune erreur, le bouton `Créer les invitations` est actif.
- Apres l'import reel, les liens `invitationUrl` retournes dans `result.imported` sont affiches et copiables.
- Le front affiche les statuts mail `emailSent`, `emailSkipped` et `emailError` apres import reel.

### List Import Jobs

```http
GET /workspaces/:workspaceId/import-jobs
Authorization: Bearer <token>
```

Usage front :

- Service disponible pour afficher l'historique des 20 derniers imports.

### Get Import Job

```http
GET /workspaces/:workspaceId/import-jobs/:jobId
Authorization: Bearer <token>
```

Champs de reponse utilises :

```ts
{
  id: string;
  workspaceId: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  dryRun: boolean;
  fileName?: string;
  totalRows: number;
  validRows: number;
  errorRows: number;
  invitationsCreated: number;
  emailsSent: number;
  emailsFailed: number;
  result?: {
    preview?: Array<{
      email: string;
      userName: string;
      role: "OWNER" | "ADMIN" | "MEMBER";
      action: string;
    }>;
    imported?: Array<{
      email: string;
      userName?: string;
      userId?: string;
      action: string;
      invitationUrl?: string;
      emailSent?: boolean;
      emailSkipped?: boolean;
      emailError?: string;
    }>;
    errors?: string[];
  };
  error?: string | null;
}
```

Polling front :

- Toutes les 2.5 secondes tant que `status` vaut `PENDING` ou `PROCESSING`.
- Stop sur `COMPLETED` ou `FAILED`.
- En cas de `FAILED`, afficher `error` dans un toast et dans le panneau de suivi.

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
  id: string;
  name: string;
  displayName: string;
  description?: string | null;
  isPrivate: boolean;
  isDirectMessage: boolean;
  createdAt?: string;
  lastMessage?: string | null;
  otherUser?: {
    id: string;
    userName?: string;
    avatar?: string | null;
    isOnline: boolean;
  } | null;
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

Reponse attendue :

```ts
Array<{
  id: string;
  name: string;
  displayName: string;
  description?: string | null;
  isPrivate: boolean;
  isDirectMessage: boolean;
  createdAt: string;
  otherUser?: {
    id: string;
    userName: string;
    avatar?: string | null;
    isOnline: boolean;
  } | null;
  lastMessage?: string | null;
}>
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

Notes :

- Utilise uniquement pour rejoindre une room publique.
- Les rooms privees utilisent `POST /room-members/:roomId/members`.
- Les DMs sont verrouillees.

### Add Room Member

```http
POST /room-members/:roomId/members
Authorization: Bearer <token>
```

Payload envoye :

```json
{
  "userId": "target-user-id",
  "role": "MEMBER"
}
```

Notes :

- `role` est optionnel et vaut `MEMBER` par defaut cote backend.
- Permission attendue : room `OWNER` ou `ADMIN`.

## Attachments

### Create Upload URL

```http
POST /attachments/upload-url
Authorization: Bearer <token>
```

Payload envoye :

```json
{
  "fileName": "note-vocale.webm",
  "mimeType": "audio/webm",
  "size": 120000,
  "durationMs": 4200
}
```

Usage front :

- Appeler cet endpoint avant un envoi fichier/audio.
- Uploader ensuite le fichier brut avec `PUT data.uploadUrl`.
- Pour audio, envoyer obligatoirement `durationMs`.
- Puis envoyer le message avec `attachmentIds: [data.attachmentId]`.

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
  type: "TEXT" | "IMAGE" | "FILE" | "AUDIO" | "SYSTEM" | string;
  createdAt: string;
  updatedAt: string;
  sender: {
    id?: string;
    userName: string;
    avatar?: string | null;
  };
  attachments?: Array<{
    id: string;
    key: string;
    url?: string | null;
    fileName: string;
    mimeType: string;
    size: number;
    kind: "IMAGE" | "DOCUMENT" | "AUDIO";
    durationMs?: number | null;
  }>;
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

Payload fichier ou note vocale :

```json
{
  "roomId": "room-id",
  "type": "AUDIO",
  "attachmentIds": ["attachment-id"]
}
```

Notes :

- `content` peut etre omis si `attachmentIds` contient au moins un attachment.
- Types acceptes cote front : `TEXT`, `IMAGE`, `FILE`, `AUDIO`, `SYSTEM`.

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

## Notifications

### List Notifications

```http
GET /notifications?workspaceId=<workspaceId>&unreadOnly=true
Authorization: Bearer <token>
```

### Unread Count

```http
GET /notifications/unread-count?workspaceId=<workspaceId>
Authorization: Bearer <token>
```

Reponse utile :

```ts
{
  count: number;
}
```

### Mark One As Read

```http
PATCH /notifications/:id/read
Authorization: Bearer <token>
```

### Mark All As Read

```http
PATCH /notifications/read-all?workspaceId=<workspaceId>
Authorization: Bearer <token>
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

## Points confirmes avec le backend

- `avatar` accepte une URL ou une data URL base64.
- Le backend ignore les champs techniques non attendus grace au whitelist global.
- `POST /rooms` ajoute automatiquement le createur comme `OWNER`.
- `GET /rooms?workspaceId=...&isDirectMessage=...` retourne les rooms dont l'utilisateur connecte est membre actif.
- Pour les DMs, le front utilise `displayName` pour afficher le nom de l'autre utilisateur.
