/**
 * Mirante Tax - Definições de Tipos do Domínio
 * Versão 1.0 · Solveathon SESCAP 2026 · Ledger Labs
 */

export type RegimeTributario = 'simples_unificado' | 'simples_regular' | 'presumido' | 'real';

export type ReducaoAliquota = 'cheia' | 'red30' | 'red60' | 'zero' | 'custom';

export type PerfilSazonal = 
  | 'varejo' 
  | 'estavel' 
  | 'industria' 
  | 'servicos' 
  | 'construcao' 
  | 'alimentacao' 
  | 'eletronicos'
  | 'ecommerce';

export type NivelRisco = 'Crítico' | 'Alto' | 'Médio' | 'Baixo';

export type CenarioAliquota = 'conservador' | 'base' | 'pessimista';

export interface Empresa {
  id: string;
  nome: string;
  ramo: string;
  cnae: string;
  regime: RegimeTributario;
  faturamentoMensal: number;
  comprasMensais: number;
  custoOperacional: number;
  cargaAtual: number; // % sobre faturamento no regime atual (ex: 6.5%)
  caixaAtual: number;
  prazoRecebimento: number; // dias
  prazoPagamento: number; // dias
  mixBoleto: number; // %
  mixPix: number; // %
  mixCartao: number; // %
  mixFaturado: number; // %
  fornecedoresRisco: number; // %
  reducaoAliquota: ReducaoAliquota;
  aliquotaCustom?: number; // %
  perfilSazonal: PerfilSazonal;
  notas?: string;
  dataCriacao?: string;
  alavancasAtivas?: AlavancasAtivas;
}

export interface ParametrosGlobais {
  aliquotaReferenciaCBS: number; // padrão 8.8%
  prazoRecuperacaoCredito: number; // dias (padrão 60)
  mesEntradaSplit: number; // índice mês (padrão mês 11 = Julho 2027 assumindo início em Ago 2026)
  dataEntradaSplitNome: string; // "Julho de 2027"
  intensidadeReajustePreco: number; // padrão 2.8%
  diasProrrogacaoFornecedor: number; // padrão 15 dias
  percentualCorteCusto: number; // padrão 3.5%
  descontoPontualidadePerdido: number; // padrão 1.2%
  maturacaoCorteCusto: number; // meses (padrão 4)
  anoInicioProjecao: number; // 2026
  mesInicioProjecao: number; // 8 (Agosto)
}

export interface AlavancasAtivas {
  reajustePreco: boolean;
  prorrogacaoFornecedor: boolean;
  corteCusto: boolean;
  opcaoRegimeRegular?: boolean;
}

export interface MemoriaCalculo {
  aliquotaEfetiva: number;
  mixExpostoSplit: number;
  debitoBruto: number;
  retidoNoSplit: number;
  creditoMensal: number;
  capitalPreso: number;
  choqueUnico: number;
  creditoPerdido: number;
  geracaoCaixaMensal: number;
  pisoOperacional: number;
  descasamentoCiclo: number;
  formulas: {
    debitoBruto: string;
    retidoNoSplit: string;
    creditoMensal: string;
    capitalPreso: string;
    choqueUnico: string;
    creditoPerdido: string;
    geracaoCaixa: string;
  };
}

export interface PontoMes {
  indice: number;
  mesNome: string;
  ano: number;
  rotulo: string; // "Ago/26"
  saldo: number;
  saldoSemAlavanca?: number;
  geracao: number;
  pontual: number;
  abaixoPiso: boolean;
  fatorSazonal: number;
  ehMesSplit: boolean;
}

export interface CenarioResultado {
  aliquota: number;
  saldos: number[];
  pontos: PontoMes[];
  mesesAbaixoPiso: number;
  primeiroCritico: number | null; // índice do primeiro mês < piso
  menorSaldo: number;
  menorSaldoMesIndice: number;
  ficaNegativo: boolean;
}

export interface ProjecaoResultado {
  memoriaCalculo: MemoriaCalculo;
  cenarioBase: CenarioResultado;
  cenarioConservador: CenarioResultado;
  cenarioPessimista: CenarioResultado;
  cenarioComAlavancas?: CenarioResultado;
  risco: {
    nivel: NivelRisco;
    ordem: number; // 4: Crítico, 3: Alto, 2: Médio, 1: Baixo
    motivo: string;
  };
  alavancasInfo: AlavancaDetalhe[];
  premissas: PremissaDeclarada[];
}

export interface AlavancaDetalhe {
  id: keyof AlavancasAtivas;
  nome: string;
  descricao: string;
  impactoCalculado: number;
  impactoTipo: 'recorrente' | 'unico';
  momento: string;
  prazoDecisao: string;
  prazoDecisaoData: string;
  prazoDecisaoMesIndice: number;
  venceAntesDoMesCritico: boolean;
  custoAssociado: string;
  ativa: boolean;
}

export interface PremissaDeclarada {
  campo: string;
  nome: string;
  valorFormatado: string;
  origem: string;
  validado: boolean;
  nota: string;
}
