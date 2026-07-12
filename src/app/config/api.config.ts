import { isDevMode } from '@angular/core';

export const API_BASE_URL = isDevMode()
  ? 'https://api.anotacorts.com.br/anota-corts'
  : 'https://api.anotacorts.com.br/anota-corts';
