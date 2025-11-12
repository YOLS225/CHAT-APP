import { useUserStore } from "@/app/core/stores/auth.store";
import { AuthService } from "@/app/core/service/auth.service";

let isRefreshing = false;
let failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: Error) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else if (token) {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

/**
 * Wrapper autour de fetch qui gère automatiquement le refresh du token
 * @param url - URL de la requête
 * @param options - Options de fetch
 * @returns Promise avec la réponse
 */
export const apiFetch = async (
    url: string,
    options: RequestInit = {}
): Promise<Response> => {
    const userStore = useUserStore.getState();
    const user = userStore.result;
    const token = user?.token;

    // Vérifier si l'utilisateur est connecté AVANT de faire la requête
    if (!user || (!token && !user.refreshToken)) {
        // Pas d'utilisateur dans le store → Déconnecter
        userStore.resetUser();
        if (typeof window !== 'undefined') {
            window.location.href = '/login';
        }
        throw new Error("No user session - User disconnected");
    }

    // Ajouter le token d'authentification si disponible
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string>),
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    // Première tentative de requête
    let response = await fetch(url, {
        ...options,
        headers,
    });

    // Si le token est expiré (401)
    if (response.status === 401) {
        // Si pas de refreshToken, déconnecter immédiatement
        if (!user?.refreshToken) {
            userStore.resetUser();
            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }
            throw new Error("No refresh token available - User disconnected");
        }

        // Sinon, tenter de rafraîchir le token
        if (isRefreshing) {
            // Si un refresh est déjà en cours, mettre la requête en file d'attente
            return new Promise((resolve, reject) => {
                failedQueue.push({
                    resolve: (newToken: string) => {
                        // Réessayer la requête avec le nouveau token
                        const newHeaders = {
                            ...headers,
                            Authorization: `Bearer ${newToken}`,
                        };
                        fetch(url, { ...options, headers: newHeaders })
                            .then(resolve)
                            .catch(reject);
                    },
                    reject,
                });
            });
        }

        isRefreshing = true;

        try {
            const authService = new AuthService();
            const refreshResponse = await authService.refreshAccessToken();

            // Mettre à jour le token dans le store
            const updatedUser = {
                ...user,
                token: refreshResponse.data.token,
                refreshToken: refreshResponse.data.refreshToken || user.refreshToken,
            };
            userStore.setUser(updatedUser);

            // Traiter la file d'attente
            processQueue(null, refreshResponse.data.token);

            // Réessayer la requête originale avec le nouveau token
            const newHeaders = {
                ...headers,
                Authorization: `Bearer ${refreshResponse.data.token}`,
            };
            response = await fetch(url, { ...options, headers: newHeaders });
        } catch (error) {
            // En cas d'échec du refresh, traiter la file d'attente avec l'erreur
            processQueue(error as Error, null);

            // Déconnecter l'utilisateur
            userStore.resetUser();

            // Rediriger vers la page de connexion
            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }

            throw error;
        } finally {
            isRefreshing = false;
        }
    }

    return response;
};

/**
 * Wrapper autour de apiFetch qui parse automatiquement la réponse JSON
 * @param url - URL de la requête
 * @param options - Options de fetch
 * @returns Promise avec les données parsées
 */
export const apiFetchJson = async <T = unknown>(
    url: string,
    options: RequestInit = {}
): Promise<T> => {
    const response = await apiFetch(url, options);

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
};