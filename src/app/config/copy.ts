/**
 * Centralized static text / copy for all pages.
 * Update this file to change any UI text across the entire app.
 */
export const COPY = {
  brand: {
    logoAccent: 'Anota',
    logoRest: 'Corts',
    fullName: 'AnotaCorts',
  },

  nav: {
    links: [
      { label: 'Início', route: '/' },
      { label: 'Sobre', route: '/sobre' },
      { label: 'Métricas', route: '/metricas' },
      { label: 'Tutorial', route: '/tutorial' },
    ],
  },

  footer: {
    copy: '© 2026 AnotaCorts. Todos os direitos reservados.',
    links: [
      { label: 'Tutorial', route: '/tutorial' },
      { label: 'Sobre', route: '/sobre' },
      { label: 'Privacidade', route: '/privacidade' },
      { label: 'Termos', route: '/termos' },
    ],
  },

  home: {
    hero: {
      eyebrow: 'App de gestão para barbearias',
      title: 'Sua barbearia,',
      titleHighlight: 'no próximo nível.',
      description: 'Gerencie atendimentos, despesas e faturamento em um só lugar.',
    },
    store: {
      googlePlay: { prefix: 'DISPONÍVEL NO', label: 'Google Play' },
      appStore: { prefixAvailable: 'BAIXAR NA', prefixSoon: 'EM BREVE NA', label: 'App Store' },
    },
    stats: {
      sectionTag: 'Ecossistema',
      title: 'A evolução do nosso',
      titleHighlight: 'ecossistema',
      subtitle:
        'Acompanhe em tempo real os indicadores de escala, frequência e engajamento das barbearias que crescem com o AnotaCorts.',
      cards: [
        { label: 'Barbearias ativas', badge: 'Profissionais de elite' },
        { label: 'Cortes realizados', badge: 'Atendimentos concluídos' },
        { label: 'Média de cortes', badge: 'Por estabelecimento' },
      ],
      engagement: {
        title: 'Fidelização e uso recorrente',
        description:
          'O AnotaCorts é inserido no coração da rotina diária das barbearias. O índice de engajamento mostra a proporção de estabelecimentos ativos por volume de cortes registrados.',
        bars: [
          { label: 'Uso regular (≥ 10 cortes)' },
          { label: 'Uso frequente (≥ 50 cortes)' },
          { label: 'Uso intenso (≥ 100 cortes)' },
        ],
      },
      states: {
        title: 'Atividade por estado',
        subtitle: 'Abrangência nos estados com barbearias ativas:',
        empty: 'Nenhuma barbearia ativa cadastrada ainda.',
      },
    },
    cta: {
      sectionTag: 'COMECE AGORA',
      title: 'Pronto para transformar sua barbearia?',
      description: 'Baixe o AnotaCorts e comece a ter controle total do seu negócio.',
    },
    loading: 'Carregando indicadores de atividade...',
  },

  about: {
    hero: {
      eyebrow: 'Sobre nós',
      title: 'Conheça o',
      titleHighlight: 'AnotaCorts',
      description:
        'A plataforma completa de gestão criada especialmente para barbearias. Simplifique sua rotina, controle suas finanças e leve seu negócio para o próximo nível.',
    },
    story: {
      tag: 'Nossa história',
      title: 'Feito por quem entende o dia a dia da barbearia',
      p1: 'Sabemos que a rotina de um barbeiro vai muito além do corte. São despesas para controlar, pagamentos para acompanhar, metas para bater e um negócio inteiro para gerenciar.',
      p2: 'O AnotaCorts nasceu dessa necessidade real. Desenvolvemos uma ferramenta intuitiva que coloca todas as informações do seu negócio em um único lugar, com uma interface limpa e objetiva — para que você gaste menos tempo com planilhas e mais tempo fazendo o que faz de melhor.',
    },
    features: {
      tag: 'Funcionalidades',
      title: 'Por que escolher o AnotaCorts?',
      subtitle: 'Tudo pensado para facilitar a gestão da sua barbearia.',
      items: [
        {
          number: '01',
          title: 'Dashboard Inteligente',
          description:
            'Visualize lucro, faturamento e despesas com gráficos dinâmicos. Tenha a saúde financeira do seu negócio sempre à vista.',
        },
        {
          number: '02',
          title: 'Controle de Despesas',
          description:
            'Organize cada gasto por categoria. Saiba exatamente para onde vai cada centavo e mantenha sua barbearia no verde.',
        },
        {
          number: '03',
          title: 'Tempo Real',
          description:
            'Receba atualizações instantâneas sobre pagamentos e status do negócio. Informação na hora que você precisa.',
        },
        {
          number: '04',
          title: 'Seguro e Confiável',
          description:
            'Seus dados protegidos com criptografia de ponta. Acesse de qualquer lugar com total segurança.',
        },
        {
          number: '05',
          title: 'Atendimentos Completos',
          description:
            'Registre cortes, gerencie clientes, controle status e acompanhe cada atendimento do começo ao fim.',
        },
        {
          number: '06',
          title: 'Notificações em Tempo Real',
          description:
            'Receba alertas instantâneos sobre pagamentos confirmados, novos atendimentos e atualizações importantes.',
        },
      ],
    },
    gallery: {
      tag: 'Galeria',
      title: 'Veja o app em ação',
      subtitle: 'Navegue pelas telas e conheça a experiência AnotaCorts.',
    },
    cta: {
      title: 'Pronto para transformar sua barbearia?',
      description: 'Baixe o AnotaCorts e comece a ter controle total do seu negócio.',
    },
  },

  metrics: {
    hero: {
      eyebrow: 'Métricas em tempo real',
      title: 'Os números que movem o',
      titleHighlight: 'AnotaCorts',
      subtitle:
        'Transparência sobre a escala, o engajamento e o alcance das barbearias que crescem com a nossa plataforma. Dados agregados e atualizados continuamente.',
    },
    status: { online: 'Plataforma Online', unstable: 'Plataforma Instável' },
    loading: 'Carregando métricas da plataforma...',
    error: 'Não foi possível carregar as métricas no momento.',
    retry: 'Tentar novamente',
    cache: {
      nextUpdate: 'Dados serão atualizados em',
      fresh: 'Dados recém-atualizados',
    },
    userStats: {
      registered: {
        label: 'Usuários cadastrados',
        sub: 'total de contas registradas na plataforma',
      },
      active: { label: 'Usuários ativos', subSuffix: '% da base — não excluíram a conta' },
    },
    kpis: {
      barbeariasAtivas: { label: 'Barbearias ativas', badge: 'cadastradas no total' },
      cortes: { label: 'Cortes realizados', badge: 'Atendimentos concluídos' },
      clientes: { label: 'Clientes gerenciados', badge: 'Base de clientes das barbearias' },
      servicos: { label: 'Serviços cadastrados', badge: 'Cortes, barbas e combos' },
      atendimentos: { label: 'Atendimentos registrados', badge: 'Todos os status' },
      despesas: { label: 'Despesas registradas', badge: 'Controle financeiro ativo' },
    },
    highlights: {
      mediaCortes: 'Média de cortes por barbearia',
      estados: 'Estados com barbearias ativas',
      uptime: 'Disponibilidade da plataforma',
    },
    growth: {
      sectionTag: 'Crescimento',
      title: 'Crescimento da base de usuários',
      description:
        'Entradas representam novos cadastros. Os totais deixam explícita a base monitorada e quantos usuários seguem ativos dentro da janela observada.',
      legend: 'Entradas',
      noData: 'Ainda não há histórico suficiente para exibir o gráfico.',
      monthly: 'Mensal',
      daily: 'Diário',
      apply: 'Aplicar',
      kpis: {
        monitorados: {
          label: 'Usuários na base monitorada',
          note: 'Cadastros identificados na janela do gráfico',
        },
        ativos: { label: 'Usuários ativos', note: 'Não solicitaram exclusão nesse período' },
        saldo: { label: 'Saldo líquido da janela' },
      },
    },
    engagement: {
      title: 'Fidelização e uso recorrente',
      description:
        'O AnotaCorts é inserido no coração da rotina diária das barbearias. O índice de engajamento mostra a proporção de estabelecimentos ativos por volume de cortes registrados na plataforma.',
      bars: [
        { label: 'Uso regular (≥ 10 cortes)' },
        { label: 'Uso frequente (≥ 50 cortes)' },
        { label: 'Uso intenso (≥ 100 cortes)' },
      ],
      states: {
        title: 'Atividade por estado',
        subtitle: 'Abrangência nos estados com barbearias ativas:',
        empty: 'Ainda não há distribuição geográfica disponível.',
      },
    },
    cta: {
      title: 'Faça parte desses números',
      description: 'Junte-se às barbearias que profissionalizam a gestão com o AnotaCorts.',
      button: 'Conhecer o app',
    },
  },

  tutorial: {
    hero: {
      eyebrow: 'Guia completo',
      title: 'Tutorial',
      titleHighlight: 'AnotaCorts',
      description:
        'Aprenda passo a passo como usar todas as funcionalidades do app para gerenciar sua barbearia — do cadastro às finanças, atendimentos e ranking.',
    },
    search: {
      placeholder: 'Buscar tópico (ex: cadastro, despesa, ranking...)',
      empty: 'Nenhum resultado encontrado.',
    },
  },

  privacy: {
    title: 'Política de Privacidade',
    updatedAt: 'Atualizado em 25 de Janeiro de 2026',
    intro:
      'O Anota Corts tem o compromisso de proteger sua privacidade e seus dados pessoais. Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e protegemos suas informações, em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).',
    controller: 'Anota Corts Tecnologia LTDA',
    dpoEmail: 'anotacorts@gmail.com',
  },

  terms: {
    title: 'Termos de Uso',
    updatedAt: 'Atualizado em 25 de Janeiro de 2026',
    intro:
      'Bem-vindo ao Anota Corts! Ao utilizar nosso aplicativo, você concorda com os termos e condições descritos abaixo. Leia atentamente antes de continuar.',
  },
} as const;

export type Copy = typeof COPY;
