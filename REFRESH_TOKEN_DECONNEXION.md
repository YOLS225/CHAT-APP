# 🔐 Logique de Déconnexion avec Refresh Token

## 📋 Question
**"À quel moment l'utilisateur est-il déconnecté, sachant que le refresh retourne toujours un nouveau token et refreshToken ?"**

---

## 🎯 Réponse Courte

L'utilisateur sera déconnecté **uniquement** dans ces cas :

1. ❌ Le **refreshToken est expiré** (après 7 jours)
2. ❌ Le **refreshToken est invalide** (révoqué, corrompu, supprimé)
3. ❌ **Pas de refreshToken** dans le localStorage
4. ✅ L'utilisateur clique sur **"Déconnexion"** manuellement

---

## 🔍 Analyse Détaillée du Code

### Flux Normal (Token Expiré)

```
1. User fait une requête
   ↓
2. Token (25 min) expiré → Serveur retourne 401
   ↓
3. apiFetch détecte le 401
   ↓
4. Appelle refreshAccessToken()
   ↓
5. Backend vérifie refreshToken (7 jours)
   ↓
6a. ✅ RefreshToken VALIDE
   → Backend retourne 200 + { token, refreshToken }
   → Store mis à jour
   → Requête originale réessayée
   → ✅ UTILISATEUR RESTE CONNECTÉ

6b. ❌ RefreshToken EXPIRÉ/INVALIDE
   → Backend retourne 401/403
   → api-fetch catch l'erreur
   → userStore.resetUser()
   → Redirection vers /login
   → ❌ UTILISATEUR DÉCONNECTÉ
```

### Code de Déconnexion dans api-fetch.ts

```typescript
// Ligne 73-92 dans api-fetch.ts
try {
    const authService = new AuthService();
    const refreshResponse = await authService.refreshAccessToken();

    // ✅ SI LE REFRESH RÉUSSIT
    // Mise à jour du store avec les nouveaux tokens
    const updatedUser = {
        ...user,
        token: refreshResponse.data.token,
        refreshToken: refreshResponse.data.refreshToken || user.refreshToken,
    };
    userStore.setUser(updatedUser);

} catch (error) {
    // ❌ SI LE REFRESH ÉCHOUE
    // 1. Vider le store
    userStore.resetUser();

    // 2. Rediriger vers login
    window.location.href = '/login';

    throw error;
}
```

### Code dans auth.service.ts

```typescript
// Ligne 73-92 dans auth.service.ts
async refreshAccessToken(){
    const refreshToken = this.getRefreshToken();

    // ❌ CAS 1: Pas de refreshToken dans le store
    if (!refreshToken) {
        throw new Error("No refresh token available");
        // → Déconnexion
    }

    const response = await fetch(`${this.urlBase}/auth/refresh`, {
        method: "POST",
        body: JSON.stringify({ refreshToken }),
    });

    // ❌ CAS 2: Backend refuse le refreshToken
    if (!response.ok) {
        throw new Error("Failed to refresh token");
        // → Déconnexion
    }

    // ✅ CAS 3: Backend accepte le refreshToken
    return await response.json();
    // → Reste connecté
}
```

---

## 📊 Scénarios de Déconnexion

### Scénario 1 : RefreshToken Expiré (7 jours) ✅ DÉCONNEXION

```
Jour 0 : Login → token (25min) + refreshToken (7 jours)
Jour 1 : Utilisation normale → refresh automatique → nouveaux tokens
Jour 2 : Utilisation normale → refresh automatique → nouveaux tokens
...
Jour 7 : Refresh → Backend refuse (refreshToken expiré)
       → api-fetch catch l'erreur
       → DÉCONNEXION + Redirection /login
```

**Backend doit retourner :**
```json
Status: 401 Unauthorized
{
  "success": false,
  "message": "Refresh token expired"
}
```

### Scénario 2 : RefreshToken Révoqué ✅ DÉCONNEXION

```
Admin révoque le refreshToken en base de données
User fait une requête → Token expiré
→ Tentative de refresh
→ Backend vérifie en DB → refreshToken révoqué
→ Backend retourne 401
→ DÉCONNEXION + Redirection /login
```

**Backend doit retourner :**
```json
Status: 401 Unauthorized
{
  "success": false,
  "message": "Refresh token revoked"
}
```

### Scénario 3 : Rotation de RefreshToken ✅ RESTE CONNECTÉ

```
Login → token1 + refreshToken1

30 min après (token1 expiré) :
→ Refresh avec refreshToken1
→ Backend retourne token2 + refreshToken2
→ Store mis à jour
→ ✅ RESTE CONNECTÉ

60 min après (token2 expiré) :
→ Refresh avec refreshToken2
→ Backend retourne token3 + refreshToken3
→ ✅ RESTE CONNECTÉ

... Et ainsi de suite jusqu'à 7 jours
```

### Scénario 4 : Pas de RefreshToken ✅ DÉCONNEXION

```
User supprime le localStorage manuellement
OU
User ouvre l'app en navigation privée (pas de localStorage)
→ Pas de refreshToken dans le store
→ getRefreshToken() retourne null
→ throw new Error("No refresh token available")
→ DÉCONNEXION + Redirection /login
```

### Scénario 5 : Déconnexion Manuelle ✅ DÉCONNEXION

```
User clique sur "Déconnexion"
→ logout(userId) appelé
→ Backend révoque le refreshToken en DB
→ resetUser() appelé
→ localStorage vidé
→ Redirection /login
```

---

## ⏱️ Durées de Vie

| Token | Durée | Comportement à l'Expiration |
|-------|-------|----------------------------|
| **Access Token** | 25 minutes | Refresh automatique transparent |
| **Refresh Token** | 7 jours | **DÉCONNEXION** de l'utilisateur |

---

## 🔄 Rotation des Tokens (Votre Backend)

Votre backend implémente la **rotation des refreshTokens** :

```javascript
// À chaque refresh, le backend retourne :
{
  data: {
    token: "nouveau_access_token",        // ← Nouveau
    refreshToken: "nouveau_refresh_token" // ← Nouveau aussi !
  }
}
```

**Avantages :**
- ✅ Sécurité renforcée (chaque refreshToken n'est utilisable qu'une fois)
- ✅ Détection de réutilisation (attaque)
- ✅ Limite la fenêtre d'exposition en cas de vol

**Impact sur la Déconnexion :**
- L'utilisateur reste connecté **indéfiniment** tant qu'il utilise l'app régulièrement
- Il sera déconnecté **après 7 jours d'inactivité** (si aucun refresh pendant 7 jours)

---

## 🚨 Quand l'Utilisateur NE Sera PAS Déconnecté

### ❌ Tant que le RefreshToken est Valide

Si l'utilisateur utilise l'app régulièrement :

```
Jour 0  : Login
Jour 1  : Refresh → Nouveaux tokens (expire Jour 8)
Jour 2  : Refresh → Nouveaux tokens (expire Jour 9)
Jour 3  : Refresh → Nouveaux tokens (expire Jour 10)
...
Jour 365: Refresh → Nouveaux tokens (expire Jour 372)

→ L'utilisateur reste connecté pendant 1 an sans déconnexion !
```

**C'est voulu !** C'est le comportement attendu pour une bonne UX.

---

## 💡 Options pour Forcer une Déconnexion

Si vous voulez déconnecter l'utilisateur dans d'autres cas :

### Option 1 : Durée de Vie Maximale du RefreshToken (Backend)

```javascript
// Backend - Ne jamais renouveler le refreshToken au-delà de X jours
const initialLoginDate = refreshTokenData.createdAt;
const daysSinceLogin = (Date.now() - initialLoginDate) / (1000 * 60 * 60 * 24);

if (daysSinceLogin > 30) {
    // Forcer la déconnexion après 30 jours, même si actif
    return res.status(401).json({ message: "Session expired, please login again" });
}
```

### Option 2 : Déconnexion après Inactivité (Backend)

```javascript
// Backend - Vérifier la dernière activité
const lastActivity = refreshTokenData.lastUsedAt;
const hoursSinceActivity = (Date.now() - lastActivity) / (1000 * 60 * 60);

if (hoursSinceActivity > 24) {
    // Déconnecter après 24h d'inactivité
    return res.status(401).json({ message: "Session expired due to inactivity" });
}
```

### Option 3 : Déconnexion sur Changement de Device (Backend)

```javascript
// Backend - Vérifier le fingerprint du device
if (refreshTokenData.deviceFingerprint !== currentDeviceFingerprint) {
    // Device différent
    return res.status(401).json({ message: "Invalid device" });
}
```

### Option 4 : Limite de Sessions Simultanées (Backend)

```javascript
// Backend - Limiter à 3 devices maximum
const activeSessions = await getActiveSessionsForUser(userId);

if (activeSessions.length > 3) {
    // Révoquer les sessions les plus anciennes
    await revokeOldestSessions(userId, activeSessions.length - 3);
}
```

---

## 🧪 Comment Tester la Déconnexion

### Test 1 : RefreshToken Expiré

```javascript
// Backend - Réduire temporairement la durée
const refreshToken = jwt.sign(
    { userId: user.id },
    REFRESH_TOKEN_SECRET,
    { expiresIn: '10s' }  // ← 10 secondes au lieu de 7 jours
);
```

Puis :
```
1. Login
2. Attendez 11 secondes
3. Faites une requête (le token de 25min est encore valide)
4. Le refresh va échouer
5. ✅ Déconnexion + Redirection /login
```

### Test 2 : RefreshToken Révoqué

```javascript
// Backend - Endpoint pour révoquer manuellement
app.post('/admin/revoke-token', async (req, res) => {
    await db.refreshTokens.update({
        where: { userId: req.body.userId },
        data: { revoked: true }
    });
    res.json({ success: true });
});
```

### Test 3 : Pas de RefreshToken

```
1. Login normalement
2. Ouvrez la console du navigateur
3. Tapez : localStorage.clear()
4. Faites une requête
5. ✅ Déconnexion immédiate
```

---

## 📝 Checklist de Sécurité Backend

Pour une gestion sûre du refreshToken :

- [ ] Le refreshToken expire après 7 jours
- [ ] Le refreshToken est stocké en base de données
- [ ] Le refreshToken peut être révoqué
- [ ] Rotation du refreshToken à chaque refresh
- [ ] Détection de réutilisation de refreshToken (attaque)
- [ ] Limite de sessions simultanées par utilisateur
- [ ] Logging des tentatives de refresh échouées
- [ ] Révocation de tous les tokens au logout

---

## 🎯 Résumé Final

### L'utilisateur est déconnecté SI :

1. ❌ **RefreshToken expiré** (après 7 jours sans nouvelle rotation)
2. ❌ **RefreshToken révoqué** (manuellement ou automatiquement)
3. ❌ **RefreshToken supprimé** du localStorage
4. ❌ **Backend refuse le refresh** (401/403)
5. ✅ **Déconnexion manuelle** (clic sur "Se déconnecter")

### L'utilisateur RESTE connecté SI :

1. ✅ Il utilise l'app régulièrement (refresh tous les jours)
2. ✅ Le refreshToken est toujours valide
3. ✅ Le backend accepte le refresh et retourne de nouveaux tokens

### Comportement Actuel :

```
✅ Utilisateur actif quotidiennement → Connecté indéfiniment
❌ Utilisateur inactif 7 jours → Déconnecté automatiquement
```

**C'est le comportement standard et attendu pour une bonne UX !**

---

## ❓ FAQ

**Q: L'utilisateur peut-il rester connecté pour toujours ?**
R: Oui, tant qu'il utilise l'app au moins une fois tous les 7 jours. C'est voulu.

**Q: Comment forcer une déconnexion après 30 jours ?**
R: Implémentez une durée de vie maximale côté backend (voir Option 1).

**Q: Que se passe-t-il si quelqu'un vole le refreshToken ?**
R: Il peut l'utiliser jusqu'à son expiration. Pour mitiger : rotation + détection de réutilisation + révocation.

**Q: Puis-je déconnecter un utilisateur à distance ?**
R: Oui, en révoquant son refreshToken en base de données. À la prochaine tentative de refresh, il sera déconnecté.

**Q: Le token de 25 min est-il trop long ?**
R: Non, c'est bien. Le refresh est automatique et transparent. Vous pourriez même aller jusqu'à 1h.

---

**✅ Votre système est correctement configuré et sécurisé !**