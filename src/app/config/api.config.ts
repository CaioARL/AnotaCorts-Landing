import { isDevMode } from '@angular/core';

export const API_BASE_URL = isDevMode()
  ? 'http://localhost:3000/anota-corts'
  : 'https://api.anotacorts.com.br/anota-corts';
