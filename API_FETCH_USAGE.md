# 📘 Guide d'Utilisation de apiFetch

Ce guide explique comment utiliser `apiFetch` et `apiFetchJson` pour vos requêtes API avec gestion automatique du refresh token.

## 🎯 Pourquoi utiliser apiFetch ?

`apiFetch` est un wrapper autour de `fetch` qui :
- ✅ Ajoute automatiquement le header `Authorization: Bearer {token}`
- ✅ Détecte quand le token expire (401)
- ✅ Rafraîchit automatiquement le token en arrière-plan
- ✅ Réessaie la requête avec le nouveau token
- ✅ Gère les requêtes concurrentes pendant le refresh
- ✅ Déconnecte l'utilisateur si le refresh échoue

## 📦 Import

```typescript
import { apiFetch, apiFetchJson } from "@/app/core/utils/api-fetch";
```

## 🚀 Utilisation de Base

### 1️⃣ GET Request - Version Simple

```typescript
import { apiFetchJson } from "@/app/core/utils/api-fetch";
import { API_URL } from "@/app/core/service/general.service";

// Récupérer des données
const messages = await apiFetchJson(`${API_URL}/messages/room/123`);
console.log(messages);
```

### 2️⃣ POST Request - Envoyer des Données

```typescript
import { apiFetchJson } from "@/app/core/utils/api-fetch";
import { API_URL } from "@/app/core/service/general.service";

const newMessage = {
    content: "Hello world!",
    senderId: "user-456",
    roomId: "room-123",
    type: "TEXT",
    isDeleted: false
};

const response = await apiFetchJson(`${API_URL}/messages`, {
    method: "POST",
    body: JSON.stringify(newMessage),
});

console.log(response);
```

### 3️⃣ PUT/PATCH Request - Mise à Jour

```typescript
const updatedRoom = await apiFetchJson(`${API_URL}/rooms/123`, {
    method: "PUT",
    body: JSON.stringify({
        name: "Nouveau nom",
        description: "Nouvelle description"
    }),
});
```

### 4️⃣ DELETE Request

```typescript
const result = await apiFetchJson(`${API_URL}/messages/123`, {
    method: "DELETE",
});
```

## 🏗️ Utilisation dans les Services

### Exemple : MessagesService

**Avant (avec fetch standard) :**
```typescript
export class MessagesService {
    protected urlBase = API_URL;

    private getToken(): string | null {
        if (typeof window !== 'undefined') {
            const user = useUserStore.getState().result;
            return user?.token || null;
        }
        return null;
    }

    async getAllMessages(id: string, search?: string) {
        const url = search === undefined || search === ""
            ? `${this.urlBase}/messages/room/${id}`
            : `${this.urlBase}/messages/room/${id}?search=${search}`;

        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${this.getToken()}`
            },
        })
        return await response.json();
    }
}
```

**Après (avec apiFetchJson) :**
```typescript
import { apiFetchJson } from "@/app/core/utils/api-fetch";

export class MessagesService {
    protected urlBase = API_URL;

    // Plus besoin de getToken() !

    async getAllMessages(id: string, search?: string) {
        const url = search === undefined || search === ""
            ? `${this.urlBase}/messages/room/${id}`
            : `${this.urlBase}/messages/room/${id}?search=${search}`;

        // apiFetchJson gère automatiquement :
        // - Headers (Content-Type, Authorization)
        // - Refresh du token si expiré
        // - Parsing JSON
        return await apiFetchJson(url);
    }

    async sendMessage(data: MessageDTO) {
        return await apiFetchJson(`${this.urlBase}/messages`, {
            method: "POST",
            body: JSON.stringify(data),
        });
    }
}
```

## 🎨 Utilisation dans les Composants React

### Avec React Query

```typescript
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiFetchJson } from "@/app/core/utils/api-fetch";
import { API_URL } from "@/app/core/service/general.service";

// Query GET
export const useGetMessages = (roomId: string) => {
    return useQuery({
        queryKey: ["messages", roomId],
        queryFn: () => apiFetchJson(`${API_URL}/messages/room/${roomId}`),
    });
};

// Mutation POST
export const useSendMessage = () => {
    return useMutation({
        mutationFn: (data: MessageDTO) => {
            return apiFetchJson(`${API_URL}/messages`, {
                method: "POST",
                body: JSON.stringify(data),
            });
        },
    });
};
```

### Utilisation dans un Composant

```typescript
import { useGetMessages, useSendMessage } from "./hooks";

function MessageList({ roomId }: { roomId: string }) {
    const { data: messages, isLoading } = useGetMessages(roomId);
    const sendMessage = useSendMessage();

    const handleSend = () => {
        sendMessage.mutate({
            content: "Hello!",
            senderId: "user-123",
            roomId: roomId,
            type: "TEXT",
            isDeleted: false
        });
    };

    if (isLoading) return <div>Chargement...</div>;

    return (
        <div>
            {messages?.map(msg => <div key={msg.id}>{msg.content}</div>)}
            <button onClick={handleSend}>Envoyer</button>
        </div>
    );
}
```

### Avec le Hook useAuthFetch

```typescript
import { useAuthFetch } from "@/app/core/hooks/useAuthFetch";
import { API_URL } from "@/app/core/service/general.service";

function MyComponent() {
    const { authFetchJson } = useAuthFetch();
    const [data, setData] = useState(null);

    const fetchData = async () => {
        try {
            const result = await authFetchJson(`${API_URL}/messages/room/123`);
            setData(result);
        } catch (error) {
            console.error("Erreur:", error);
        }
    };

    return (
        <div>
            <button onClick={fetchData}>Charger les données</button>
            {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
        </div>
    );
}
```

## 🔄 Flux de Refresh Automatique

```
1. Utilisateur fait une requête
   ↓
2. apiFetch ajoute automatiquement Bearer token
   ↓
3. Envoie la requête au serveur
   ↓
4. Serveur répond 401 (token expiré)
   ↓
5. apiFetch détecte le 401
   ↓
6. Appelle automatiquement /auth/refresh
   ↓
7. Reçoit nouveau token + refreshToken
   ↓
8. Met à jour le store Zustand
   ↓
9. Réessaie la requête originale avec le nouveau token
   ↓
10. Retourne la réponse à l'utilisateur

✅ L'utilisateur ne voit aucune interruption !
```

## 🔐 Gestion des Erreurs

### Erreur Standard

```typescript
try {
    const data = await apiFetchJson(`${API_URL}/messages/room/123`);
    console.log(data);
} catch (error) {
    console.error("Erreur:", error);
    // Gérer l'erreur (toast, message, etc.)
}
```

### Si le Refresh Échoue

Si le `refreshToken` est invalide ou expiré :
1. ❌ L'utilisateur est automatiquement déconnecté
2. 🗑️ Le store est réinitialisé
3. 🔄 Redirection vers `/login`

```typescript
// Aucun code spécial nécessaire - c'est géré automatiquement !
const data = await apiFetchJson(`${API_URL}/messages`);
// Si le refresh échoue, l'utilisateur est redirigé vers /login
```

## 🚫 Quand NE PAS utiliser apiFetch

### ❌ Pour les Endpoints d'Authentification

N'utilisez **PAS** apiFetch pour login, register, ou refresh :

```typescript
// ❌ MAUVAIS - Ne pas utiliser apiFetch
async login(data: {email: string, password: string}) {
    return await apiFetchJson(`${this.urlBase}/auth/login`, {
        method: "POST",
        body: JSON.stringify(data),
    });
}

// ✅ BON - Utiliser fetch standard
async login(data: {email: string, password: string}) {
    const response = await fetch(`${this.urlBase}/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
    return await response.json();
}
```

**Pourquoi ?** Parce que ces endpoints ne doivent **pas** déclencher de refresh automatique.

### ❌ Pour les Requêtes Publiques

Si votre endpoint ne nécessite pas d'authentification :

```typescript
// Endpoint public
const publicData = await fetch(`${API_URL}/public/news`);
```

## 📊 Différence entre apiFetch et apiFetchJson

### `apiFetch` - Retourne Response

```typescript
import { apiFetch } from "@/app/core/utils/api-fetch";

const response: Response = await apiFetch(`${API_URL}/messages`);

// Vous devez parser manuellement
const data = await response.json();
console.log(data);

// Utile si vous voulez accéder aux headers
console.log(response.headers.get('Content-Type'));
console.log(response.status);
```

### `apiFetchJson` - Parse Automatiquement

```typescript
import { apiFetchJson } from "@/app/core/utils/api-fetch";

// Parse automatiquement le JSON
const data = await apiFetchJson(`${API_URL}/messages`);
console.log(data); // Déjà parsé !
```

**Recommandation :** Utilisez `apiFetchJson` dans 99% des cas.

## 🎯 Exemples Complets

### Exemple 1 : RoomsService

```typescript
import { apiFetchJson } from "@/app/core/utils/api-fetch";
import { API_URL } from "@/app/core/service/general.service";

export class RoomsService {
    async getAllRooms(id: string, isDirectMessage: boolean) {
        const url = `${API_URL}/rooms/user-rooms/${id}?isDirectMessage=${isDirectMessage}`;
        return await apiFetchJson(url);
    }

    async createRoom(data: RoomDTO) {
        return await apiFetchJson(`${API_URL}/rooms`, {
            method: "POST",
            body: JSON.stringify(data),
        });
    }

    async joinRoom(data: { userId: string; roomId: string }) {
        return await apiFetchJson(`${API_URL}/room-members`, {
            method: "POST",
            body: JSON.stringify(data),
        });
    }
}
```

### Exemple 2 : UsersService

```typescript
import { apiFetchJson } from "@/app/core/utils/api-fetch";
import { API_URL } from "@/app/core/service/general.service";

export class UsersService {
    async getAllUsers(page: number, pageSize: number, search?: string) {
        const params = new URLSearchParams({
            page: page.toString(),
            page_size: pageSize.toString(),
            ...(search && { search })
        });

        return await apiFetchJson(`${API_URL}/users?${params}`);
    }

    async getUserById(id: string) {
        return await apiFetchJson(`${API_URL}/users/${id}`);
    }
}
```

### Exemple 3 : Requêtes Concurrentes

```typescript
import { apiFetchJson } from "@/app/core/utils/api-fetch";

// Toutes ces requêtes partagent le même refresh si le token expire
const [rooms, users, messages] = await Promise.all([
    apiFetchJson(`${API_URL}/rooms`),
    apiFetchJson(`${API_URL}/users`),
    apiFetchJson(`${API_URL}/messages/room/123`)
]);

console.log("Rooms:", rooms);
console.log("Users:", users);
console.log("Messages:", messages);

// Si le token expire pendant ces requêtes :
// 1. La première requête déclenche le refresh
// 2. Les autres sont mises en file d'attente
// 3. Une fois le refresh terminé, toutes réussissent
```

## 🧪 Testing

### Test du Login

```typescript
// 1. Connectez-vous
const authService = new AuthService();
const response = await authService.login({
    email: "test@example.com",
    password: "password123"
});

// 2. Vérifiez que les tokens sont stockés
const user = useUserStore.getState().result;
console.log("Token:", user?.token);
console.log("Refresh Token:", user?.refreshToken);

// ✅ Les deux doivent être présents
```

### Test du Refresh Automatique

```typescript
// 1. Connectez-vous
// 2. Attendez 26 minutes (ou simulez un token expiré côté backend)
// 3. Faites une requête normale
const messages = await apiFetchJson(`${API_URL}/messages/room/123`);

// ✅ La requête doit réussir grâce au refresh automatique
console.log("Messages:", messages);
```

### Simuler un Token Expiré (Backend)

Pour tester, réduisez temporairement la durée du token côté backend :

```javascript
// Backend - pour les tests seulement
const accessToken = jwt.sign(
    { userId: user.id },
    ACCESS_TOKEN_SECRET,
    { expiresIn: '30s' }  // ← 30 secondes au lieu de 25 minutes
);
```

Ensuite :
1. Connectez-vous
2. Attendez 31 secondes
3. Faites une requête
4. Le refresh doit se déclencher automatiquement

## 🔍 Debug

### Activer les Logs

Ajoutez des `console.log` dans `api-fetch.ts` :

```typescript
export const apiFetch = async (url: string, options: RequestInit = {}) => {
    console.log("🔍 apiFetch - URL:", url);
    console.log("🔑 Token:", token);

    // ... votre code

    if (response.status === 401) {
        console.log("⚠️ Token expiré, refresh en cours...");
    }

    // Après refresh
    console.log("✅ Nouveau token:", refreshResponse.data.token);
};
```

### Vérifier le Store

```typescript
// Dans la console du navigateur
const store = useUserStore.getState();
console.log("User:", store.result);
console.log("Token:", store.result?.token);
console.log("Refresh Token:", store.result?.refreshToken);
```

## 📝 Checklist de Migration

Pour migrer un service existant :

- [ ] Importer `apiFetchJson` depuis `@/app/core/utils/api-fetch`
- [ ] Remplacer `fetch()` par `apiFetchJson()`
- [ ] Supprimer la méthode `getToken()` (si plus utilisée)
- [ ] Supprimer les headers `Authorization` manuels
- [ ] Supprimer `await response.json()` (fait automatiquement)
- [ ] Tester avec un token valide
- [ ] Tester avec un token expiré (doit rafraîchir automatiquement)

## ❓ FAQ

**Q: Dois-je migrer tous mes services immédiatement ?**
R: Non, vous pouvez migrer progressivement. `apiFetch` et `fetch` peuvent coexister.

**Q: Que se passe-t-il si plusieurs requêtes arrivent en même temps avec un token expiré ?**
R: La première déclenche le refresh, les autres sont mises en file d'attente et réessayées avec le nouveau token.

**Q: Le refresh token est stocké où ?**
R: Dans le store Zustand, qui persiste dans `localStorage` avec la clé `"User-store"`.

**Q: Puis-je personnaliser la redirection après expiration ?**
R: Oui, modifiez la ligne `window.location.href = '/login'` dans `api-fetch.ts`.

**Q: Comment gérer les erreurs spécifiques (404, 500, etc.) ?**
R: Utilisez un try/catch standard :
```typescript
try {
    const data = await apiFetchJson(`${API_URL}/messages/123`);
} catch (error) {
    if (error.message.includes('404')) {
        // Message non trouvé
    } else if (error.message.includes('500')) {
        // Erreur serveur
    }
}
```

---

## ✅ Résumé

**Utilisez `apiFetchJson` pour :**
- ✅ Toutes les requêtes nécessitant une authentification
- ✅ GET, POST, PUT, PATCH, DELETE
- ✅ Services (Messages, Rooms, Users, etc.)
- ✅ Composants React avec React Query

**N'utilisez PAS `apiFetchJson` pour :**
- ❌ Login, Register, Refresh
- ❌ Endpoints publics sans auth

**Bénéfices :**
- 🎯 Moins de code répétitif
- 🔒 Refresh automatique transparent
- 🚀 Meilleure UX (pas d'interruption)
- 🧹 Code plus propre et maintenable

---

**🚀 Vous êtes prêt à utiliser apiFetch !**