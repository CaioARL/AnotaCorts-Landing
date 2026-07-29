import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { API_BASE_URL } from '../config/api.config';
import { LandingMetrics, MetricsService } from './metrics.service';

const TOKEN_URL = `${API_BASE_URL}/v1/metrics/token`;
const OVERVIEW_URL = `${API_BASE_URL}/v1/metrics/overview`;

function fakeToken(expiresInMs = 3_600_000) {
  return {
    accessToken: 'fake-jwt',
    tokenType: 'Bearer',
    scope: 'metrics',
    expiresIn: expiresInMs,
    expiresAt: Date.now() + expiresInMs,
  };
}

const FAKE_METRICS = {
  timestamp: '2026-07-29T00:00:00Z',
  totalBarbeariasAtivas: 10,
  totalBarbeariasCadastradas: 12,
  totalAtendimentosRealizados: 100,
  mediaAtendimentosPorBarbearia: 10,
  totalAgendamentos: 120,
  taxaUsoRegular: 0.5,
  taxaUsoFrequente: 0.3,
  taxaUsoIntenso: 0.1,
  barbeariasPorEstado: { SP: 5, RJ: 3 },
  totalClientesGerenciados: 300,
  totalServicosCadastrados: 40,
  totalDespesasRegistradas: 80,
  crescimentoUsuarios: [{ periodo: '2026-06', entradas: 4, saidas: 1 }],
  statusPlataforma: 'OPERATIONAL',
  uptimePlataforma: 99.9,
} satisfies LandingMetrics;

describe('MetricsService', () => {
  let service: MetricsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(MetricsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('deve solicitar token antes de buscar métricas e enviar Bearer', () => {
    let result: LandingMetrics | undefined;
    service.getOverview().subscribe((m) => (result = m));

    const tokenReq = httpMock.expectOne(TOKEN_URL);
    expect(tokenReq.request.method).toBe('POST');
    tokenReq.flush(fakeToken());

    const overviewReq = httpMock.expectOne(OVERVIEW_URL);
    expect(overviewReq.request.method).toBe('GET');
    expect(overviewReq.request.headers.get('Authorization')).toBe('Bearer fake-jwt');
    overviewReq.flush(FAKE_METRICS);

    expect(result).toEqual(FAKE_METRICS);
  });

  it('deve reutilizar o token em cache em chamadas subsequentes', () => {
    service.getOverview().subscribe();
    httpMock.expectOne(TOKEN_URL).flush(fakeToken());
    httpMock.expectOne(OVERVIEW_URL).flush(FAKE_METRICS);

    // Segunda chamada: NÃO deve pedir token novamente
    service.getOverview().subscribe();
    httpMock.expectNone(TOKEN_URL);
    httpMock.expectOne(OVERVIEW_URL).flush(FAKE_METRICS);
  });

  it('deve renovar o token quando estiver próximo de expirar', () => {
    service.getOverview().subscribe();
    // Token que expira em 30s (dentro da janela de segurança de 60s)
    httpMock.expectOne(TOKEN_URL).flush(fakeToken(30_000));
    httpMock.expectOne(OVERVIEW_URL).flush(FAKE_METRICS);

    service.getOverview().subscribe();
    httpMock.expectOne(TOKEN_URL).flush(fakeToken());
    httpMock.expectOne(OVERVIEW_URL).flush(FAKE_METRICS);
  });

  it('deve repassar parâmetros de granularidade e datas na query', () => {
    service
      .getOverview({ granularity: 'DAILY', startDate: '2026-07-01', endDate: '2026-07-29' })
      .subscribe();

    httpMock.expectOne(TOKEN_URL).flush(fakeToken());
    const req = httpMock.expectOne(
      (r) => r.url === OVERVIEW_URL && r.params.get('granularity') === 'DAILY',
    );
    expect(req.request.params.get('startDate')).toBe('2026-07-01');
    expect(req.request.params.get('endDate')).toBe('2026-07-29');
    req.flush(FAKE_METRICS);
  });
});
