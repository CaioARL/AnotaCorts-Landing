/**
 * Google Analytics 4 (fluxo "Site" da mesma propriedade do app no Firebase).
 * O ID de medição é público: aparece no código de qualquer página que usa o GA4.
 */
export const GA_MEASUREMENT_ID = 'G-J2F7XTS1XZ';

/** Só mede no domínio oficial: visitas de desenvolvimento (localhost) não entram nos relatórios. */
export const GA_HOSTNAMES = ['www.anotacorts.com.br', 'anotacorts.com.br'];

/** Chave no localStorage com a escolha do visitante no aviso de cookies. */
export const CONSENT_STORAGE_KEY = 'anotacorts-consent';
