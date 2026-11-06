import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';

import { AnalyticsService } from './analytics.service';
import { ExperimentService } from './experiment.service';

const KEY = 'anotacorts-ab-versao_funcionalidades';

function setup(search = '', saved?: string, random = 0.2) {
  const storage = new Map<string, string>();
  if (saved) storage.set(KEY, saved);
  const userProperties: Record<string, string> = {};
  const doc = {
    defaultView: {
      location: { search },
      localStorage: {
        getItem: (key: string) => storage.get(key) ?? null,
        setItem: (key: string, value: string) => void storage.set(key, value),
      },
    },
  };
  TestBed.configureTestingModule({
    providers: [
      { provide: DOCUMENT, useValue: doc },
      {
        provide: AnalyticsService,
        useValue: {
          setUserProperty: (name: string, value: string) => (userProperties[name] = value),
        },
      },
    ],
  });
  vi.spyOn(Math, 'random').mockReturnValue(random);
  const service = TestBed.inject(ExperimentService);
  const variant = () => service.variant('versao_funcionalidades', ['A', 'B'] as const);
  return { variant, storage, userProperties };
}

describe('ExperimentService', () => {
  afterEach(() => vi.restoreAllMocks());

  it('sorteia uma versão, guarda no navegador e envia ao analytics', () => {
    const { variant, storage, userProperties } = setup('', undefined, 0.7);

    expect(variant()).toBe('B');
    expect(storage.get(KEY)).toBe('B');
    expect(userProperties['versao_funcionalidades']).toBe('B');
  });

  it('mantém a mesma versão nas visitas seguintes', () => {
    const { variant } = setup('', 'A', 0.9);

    expect(variant()).toBe('A');
  });

  it('a URL força uma versão (para ver as duas) e passa a valer daí em diante', () => {
    const { variant, storage } = setup('?versao_funcionalidades=B', 'A');

    expect(variant()).toBe('B');
    expect(storage.get(KEY)).toBe('B');
  });

  it('ignora valores inválidos na URL e no navegador', () => {
    const { variant } = setup('?versao_funcionalidades=Z', 'X', 0.1);

    expect(variant()).toBe('A');
  });
});
