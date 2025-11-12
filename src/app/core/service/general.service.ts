export const API_URL = process.env.NEXT_PUBLIC_DEPLOYED_API || 'http://localhost:9000';

/**
 * Interface générique pour les réponses API uniformes
 */
export interface Action<T> {
  data?: T;
  success?: boolean;
  message?: string;
}