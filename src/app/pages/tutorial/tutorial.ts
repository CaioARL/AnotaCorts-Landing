import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { APP_VERSION, AppVersion } from '../../config/version.config';
import { COPY } from '../../config/copy';
import { Navbar } from '../../shared/navbar/navbar';
import { Footer } from '../../shared/footer/footer';

interface SectionLink {
  id: string;
  label: string;
  number: string;
}

interface SearchItem {
  sectionId: string;
  title: string;
  description: string;
  keywords: string;
}

@Component({
  selector: 'app-tutorial',
  imports: [CommonModule, Navbar, Footer],
  templateUrl: './tutorial.html',
  styleUrl: './tutorial.css',
})
export class Tutorial {
  readonly appVersion: AppVersion = APP_VERSION;
  readonly t = COPY.tutorial;
  searchQuery = signal('');
  activeSection = signal<string>('inicio');
  menuOpen = signal(false);
  searchFocused = signal(false);

  sections: SectionLink[] = [
    { id: 'inicio', label: 'Primeiros passos', number: '01' },
    { id: 'dashboard', label: 'Dashboard', number: '02' },
    { id: 'gerenciar', label: 'Gerenciar', number: '03' },
    // { id: 'ranking', label: 'Ranking', number: '04' },
    { id: 'perfil', label: 'Perfil', number: '05' },
    { id: 'assinatura', label: 'Assinatura', number: '06' },
    { id: 'notificacoes', label: 'Notificações', number: '07' },
    { id: 'tema', label: 'Modo escuro/claro', number: '08' },
    { id: 'faq', label: 'Perguntas frequentes', number: '09' },
    { id: 'suporte', label: 'Suporte', number: '10' },
  ];

  searchIndex: SearchItem[] = [
    {
      sectionId: 'inicio',
      title: 'Criar uma conta (Cadastro)',
      description: 'Como cadastrar uma nova conta no AnotaCorts em 3 etapas',
      keywords:
        'cadastro cadastrar registrar nova conta criar barbeiro etapa nome email senha cpf telefone cep endereço cnpj',
    },
    {
      sectionId: 'inicio',
      title: 'Fazer login',
      description: 'Como entrar na sua conta',
      keywords: 'login entrar acessar conta email senha',
    },
    {
      sectionId: 'inicio',
      title: 'Esqueci minha senha',
      description: 'Recuperar acesso à conta quando você não lembra a senha',
      keywords: 'esqueci senha recuperar redefinir codigo email perdi nova senha',
    },
    {
      sectionId: 'dashboard',
      title: 'Escolher o período (Semana, Mês, Ano)',
      description: 'Filtrar dados por semana, mês, ano ou período personalizado',
      keywords: 'periodo semana mes ano personalizado data filtro datas dashboard',
    },
    {
      sectionId: 'dashboard',
      title: 'Indicadores financeiros',
      description: 'Receita, lucro, ticket médio, margem, novos clientes, retorno',
      keywords:
        'receita lucro ticket medio margem clientes novos retorno frequencia indicadores cards',
    },
    {
      sectionId: 'dashboard',
      title: 'Gráficos e rankings',
      description: 'Evolução financeira, horários de pico, serviços mais vendidos',
      keywords:
        'grafico evolução financeira custos atendimentos dia semana horarios pico serviços vendidos despesas categoria pagamento',
    },
    {
      sectionId: 'gerenciar',
      title: 'Editar barbearia e horários',
      description: 'Atualizar dados da barbearia e horários de funcionamento',
      keywords:
        'barbearia editar nome telefone endereço horario funcionamento abertura fechamento dias semana',
    },
    {
      sectionId: 'gerenciar',
      title: 'Cadastrar cliente',
      description: 'Adicionar um novo cliente à sua base',
      keywords: 'cliente cadastrar adicionar novo nome telefone email base',
    },
    {
      sectionId: 'gerenciar',
      title: 'Editar ou excluir cliente',
      description: 'Atualizar ou remover um cliente cadastrado',
      keywords: 'cliente editar excluir remover deletar atualizar lapis lixeira',
    },
    {
      sectionId: 'gerenciar',
      title: 'Buscar cliente',
      description: 'Procurar cliente por nome, e-mail ou telefone',
      keywords: 'cliente buscar pesquisar procurar achar nome email telefone',
    },
    {
      sectionId: 'gerenciar',
      title: 'Criar novo atendimento',
      description: 'Agendar um corte, barba ou serviço para um cliente',
      keywords:
        'criar novo corte barba servico cliente data hora pagamento status',
    },
    {
      sectionId: 'gerenciar',
      title: 'Mudar status do atendimento',
      description: 'Agendado, confirmado, em andamento, concluído, cancelado, não compareceu',
      keywords:
        'status atendimento agendado confirmado andamento concluido cancelado nao compareceu mudar alterar etiqueta',
    },
    {
      sectionId: 'gerenciar',
      title: 'Filtrar e ordenar atendimentos',
      description: 'Filtrar por status, ordenar por data, valor ou nome',
      keywords: 'atendimento filtro filtrar ordenar buscar pesquisar status data valor nome',
    },
    {
      sectionId: 'gerenciar',
      title: 'Cadastrar serviço',
      description: 'Adicionar serviços com preço e duração',
      keywords: 'servico cadastrar adicionar novo preço duração corte barba sobrancelha categoria',
    },
    {
      sectionId: 'gerenciar',
      title: 'Ativar/desativar serviço',
      description: 'Ligar ou desligar um serviço sem excluir o histórico',
      keywords: 'servico ativar desativar ligar desligar toggle interruptor histórico',
    },
    {
      sectionId: 'gerenciar',
      title: 'Registrar nova despesa',
      description: 'Cadastrar gastos da barbearia (aluguel, produtos, salários)',
      keywords:
        'despesa gasto registrar adicionar nova aluguel produto salario conta categoria subcategoria pagamento',
    },
    // {
    //   sectionId: 'ranking',
    //   title: 'Ver ranking de cortes',
    //   description: 'Pódio dos top 3 e lista a partir do 4º lugar',
    //   keywords: 'ranking pódio podium top 3 cortes posição competição campanha ouro prata bronze movimento',
    // },
    {
      sectionId: 'perfil',
      title: 'Editar dados pessoais',
      description: 'Atualizar nome, e-mail, telefone, CPF, endereço',
      keywords: 'perfil editar dados pessoais nome email telefone cpf data nascimento endereço cep',
    },
    {
      sectionId: 'perfil',
      title: 'Alterar senha',
      description: 'Trocar a senha atual por uma nova',
      keywords: 'senha alterar trocar mudar nova atual',
    },
    {
      sectionId: 'perfil',
      title: 'Excluir conta',
      description: 'Solicitar exclusão definitiva — você tem 90 dias para desistir',
      keywords: 'excluir conta deletar remover apagar 90 dias cancelar exclusão definitiva',
    },
    {
      sectionId: 'perfil',
      title: 'Cancelar exclusão e reativar conta',
      description: 'Reverter solicitação de exclusão pelo app ou pela tela de login',
      keywords:
        'reativar conta cancelar exclusão login tela acesso reativar restaurar 90 dias pendente',
    },
    {
      sectionId: 'perfil',
      title: 'Sair (Logout)',
      description: 'Como deslogar da sua conta',
      keywords: 'sair logout deslogar desconectar',
    },
    {
      sectionId: 'assinatura',
      title: 'Assinar um plano',
      description: 'Escolher e assinar um plano AnotaCorts',
      keywords:
        'assinatura plano assinar contratar comprar app store iphone android pix cartão pagamento',
    },
    {
      sectionId: 'assinatura',
      title: 'Ver histórico de pagamentos',
      description: 'Conferir cobranças anteriores',
      keywords: 'histórico pagamentos cobrança valor data status forma',
    },
    {
      sectionId: 'assinatura',
      title: 'Gerenciar cartões',
      description: 'Adicionar, remover e definir cartão padrão',
      keywords: 'cartão cartao credito debito adicionar novo remover excluir padrão renovação',
    },
    {
      sectionId: 'assinatura',
      title: 'Cancelar assinatura',
      description: 'Como cancelar seu plano',
      keywords: 'cancelar assinatura plano encerrar parar',
    },
    {
      sectionId: 'notificacoes',
      title: 'Ver e gerenciar notificações',
      description: 'Marcar como lidas, excluir, selecionar várias',
      keywords:
        'notificação notificações sino aviso mensagem ler marcar lida excluir selecionar todas',
    },
    {
      sectionId: 'tema',
      title: 'Mudar tema (claro/escuro)',
      description: 'Alternar entre modo claro e escuro',
      keywords: 'tema modo escuro claro dark light sol lua aparência cor',
    },
    {
      sectionId: 'faq',
      title: 'Perguntas frequentes',
      description: 'Dúvidas mais comuns dos usuários',
      keywords: 'faq pergunta perguntas frequentes duvida ajuda',
    },
    {
      sectionId: 'suporte',
      title: 'Falar com o suporte',
      description: 'Entrar em contato com a equipe AnotaCorts',
      keywords: 'suporte contato ajuda atendimento equipe falar contatar',
    },
  ];

  filteredResults = computed<SearchItem[]>(() => {
    const q = this.searchQuery().trim().toLowerCase();
    if (!q) return [];
    const tokens = q.split(/\s+/).filter(Boolean);
    return this.searchIndex
      .filter((item) => {
        const haystack = `${item.title} ${item.description} ${item.keywords}`.toLowerCase();
        return tokens.every((t) => haystack.includes(t));
      })
      .slice(0, 8);
  });

  currentIndex = computed(() => this.sections.findIndex((s) => s.id === this.activeSection()));

  currentSection = computed(() => this.sections[this.currentIndex()] ?? this.sections[0]);

  prevSection = computed<SectionLink | null>(() => {
    const i = this.currentIndex();
    return i > 0 ? this.sections[i - 1] : null;
  });

  nextSection = computed<SectionLink | null>(() => {
    const i = this.currentIndex();
    return i < this.sections.length - 1 ? this.sections[i + 1] : null;
  });

  onSearchInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
  }

  clearSearch() {
    this.searchQuery.set('');
  }

  setSearchFocused(value: boolean) {
    if (!value) {
      setTimeout(() => this.searchFocused.set(false), 150);
      return;
    }
    this.searchFocused.set(true);
  }

  selectSearchResult(item: SearchItem) {
    this.goTo(item.sectionId);
    this.searchQuery.set('');
    this.searchFocused.set(false);
  }

  goTo(id: string) {
    this.activeSection.set(id);
    this.menuOpen.set(false);
  }

  toggleMenu() {
    this.menuOpen.update((v) => !v);
  }
}
