/**
 * Mirante Tax - Motor de Cálculo Determinístico e Auditável
 * Versão 1.0 · Solveathon SESCAP 2026 · Ledger Labs
 * 
 * Regra: Nenhuma etapa usa inferência ou modelo de linguagem.
 * Toda saída deve poder ser reconstruída e auditada manualmente.
 */

import {
  Empresa,
  ParametrosGlobais,
  AlavancasAtivas,
  MemoriaCalculo,
  PontoMes,
  CenarioResultado,
  ProjecaoResultado,
  AlavancaDetalhe,
  PremissaDeclarada,
  NivelRisco,
  PerfilSazonal
} from '../types';

export const FATORES_REDUCAO: Record<string, number> = {
  cheia: 1.0,
  red30: 0.7,
  red60: 0.4,
  zero: 0.0,
  custom: 1.0,
};

// Vetores sazonais originais da especificação (jan a dez)
export const PERFIS_SAZONAIS_RAW: Record<PerfilSazonal, number[]> = {
  varejo: [-1.5, -0.9, 0.7, 0.9, 1.0, 0.9, 0.9, 1.0, 1.0, 1.2, 1.6, 5.2],
  estavel: [0.7, 0.8, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.1, 1.1, 1.3],
  industria: [-1.2, 0.4, 0.9, 1.0, 1.1, 1.0, 0.9, 1.1, 1.5, 1.7, 1.8, 1.8],
  servicos: [0.3, 0.7, 1.1, 1.1, 1.1, 1.1, 1.0, 1.1, 1.1, 1.2, 1.2, 1.0],
  construcao: [-2.0, -1.0, 0.8, 1.2, 1.4, 1.3, 1.2, 1.4, 1.5, 1.6, 1.8, 2.8],
  alimentacao: [-0.8, 0.2, 0.9, 1.0, 1.1, 1.2, 1.4, 1.2, 1.1, 1.2, 1.3, 2.2],
  eletronicos: [-0.6, 0.2, 0.8, 0.9, 1.5, 1.0, 0.9, 1.0, 1.1, 1.1, 2.3, 1.8],
  ecommerce: [-0.6, 0.2, 0.8, 0.9, 1.5, 1.0, 0.9, 1.0, 1.1, 1.1, 2.3, 1.8],
};

// Normalizar cada vetor sazonal para ter média 1.0
export function getFatorSazonalNormalizado(perfil: PerfilSazonal, mesCalendario0a11: number): number {
  const vetor = PERFIS_SAZONAIS_RAW[perfil] || PERFIS_SAZONAIS_RAW.estavel;
  const soma = vetor.reduce((acc, val) => acc + val, 0);
  const media = soma / vetor.length;
  const valor = vetor[mesCalendario0a11 % 12];
  if (media === 0) return 1.0;
  return valor / media;
}

export const MESES_NOMES = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
];

export const MESES_NOMES_COMPLETOS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export function formatarMesAno(anoInicio: number, mesInicio1a12: number, offsetMeses: number): { rotulo: string; nomeCompleto: string; ano: number; mes0: number } {
  const totalMeses = (anoInicio * 12) + (mesInicio1a12 - 1) + offsetMeses;
  const ano = Math.floor(totalMeses / 12);
  const mes0 = totalMeses % 12;
  const ano2d = String(ano).slice(-2);
  return {
    rotulo: `${MESES_NOMES[mes0]}/${ano2d}`,
    nomeCompleto: `${MESES_NOMES_COMPLETOS[mes0]} de ${ano}`,
    ano,
    mes0,
  };
}

/**
 * Calcula a Alíquota Efetiva considerando redução ou customização
 */
export function calcularAliquotaEfetiva(
  reducaoAliquota: Empresa['reducaoAliquota'],
  aliquotaReferencia: number,
  aliquotaCustom?: number
): number {
  if (reducaoAliquota === 'custom' && aliquotaCustom !== undefined) {
    return aliquotaCustom;
  }
  const fator = FATORES_REDUCAO[reducaoAliquota] ?? 1.0;
  return aliquotaReferencia * fator;
}

/**
 * Memória de cálculo detalhada (Blocos A, B e C)
 */
export function calcularMemoriaCalculo(
  empresa: Empresa,
  parametros: ParametrosGlobais,
  aliquotaCBS: number = parametros.aliquotaReferenciaCBS
): MemoriaCalculo {
  const aliquotaEfetiva = calcularAliquotaEfetiva(
    empresa.reducaoAliquota,
    aliquotaCBS,
    empresa.aliquotaCustom
  );

  const mixExpostoSplit = empresa.mixBoleto + empresa.mixPix + empresa.mixCartao;

  // Bloco A - Float tributário perdido
  const debitoBruto = (empresa.faturamentoMensal * aliquotaEfetiva) / 100;
  const retidoNoSplit = (debitoBruto * mixExpostoSplit) / 100;

  // Bloco B - Capital preso no ciclo de crédito
  const creditoMensal = (empresa.comprasMensais * aliquotaEfetiva) / 100;
  const capitalPreso = creditoMensal * (parametros.prazoRecuperacaoCredito / 30);

  // Bloco C - Crédito não realizado
  const creditoPerdido = (creditoMensal * empresa.fornecedoresRisco) / 100;

  // Consolidação
  const choqueUnico = retidoNoSplit + capitalPreso;
  const geracaoCaixaMensal =
    empresa.faturamentoMensal -
    empresa.comprasMensais -
    empresa.custoOperacional -
    (empresa.faturamentoMensal * empresa.cargaAtual) / 100;
  const pisoOperacional = empresa.custoOperacional;
  const descasamentoCiclo = empresa.prazoRecebimento - empresa.prazoPagamento;

  return {
    aliquotaEfetiva,
    mixExpostoSplit,
    debitoBruto,
    retidoNoSplit,
    creditoMensal,
    capitalPreso,
    choqueUnico,
    creditoPerdido,
    geracaoCaixaMensal,
    pisoOperacional,
    descasamentoCiclo,
    formulas: {
      debitoBruto: `${empresa.faturamentoMensal.toLocaleString('pt-BR')} × ${aliquotaEfetiva.toFixed(2)}%`,
      retidoNoSplit: `${debitoBruto.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} × ${mixExpostoSplit}%`,
      creditoMensal: `${empresa.comprasMensais.toLocaleString('pt-BR')} × ${aliquotaEfetiva.toFixed(2)}%`,
      capitalPreso: `${creditoMensal.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} × (${parametros.prazoRecuperacaoCredito}/30)`,
      choqueUnico: `${retidoNoSplit.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} + ${capitalPreso.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}`,
      creditoPerdido: `${creditoMensal.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} × ${empresa.fornecedoresRisco}%`,
      geracaoCaixa: `${empresa.faturamentoMensal.toLocaleString('pt-BR')} - ${empresa.comprasMensais.toLocaleString('pt-BR')} - ${empresa.custoOperacional.toLocaleString('pt-BR')} - (${empresa.cargaAtual}%)`,
    },
  };
}

/**
 * Executa a projeção temporal de saldos
 */
export function projetarCenario(
  empresa: Empresa,
  parametros: ParametrosGlobais,
  aliquotaCBS: number,
  alavancas: AlavancasAtivas = { reajustePreco: false, prorrogacaoFornecedor: false, corteCusto: false },
  horizonteMeses: number = 24
): CenarioResultado {
  const memoria = calcularMemoriaCalculo(empresa, parametros, aliquotaCBS);
  const { geracaoCaixaMensal, choqueUnico, creditoPerdido, pisoOperacional, aliquotaEfetiva } = memoria;

  const saldos: number[] = [];
  const pontos: PontoMes[] = [];

  let saldoAtual = empresa.caixaAtual;
  saldos.push(saldoAtual);

  const mesInicioOffset = parametros.mesInicioProjecao; // ex: 8 (Agosto)
  const anoInicio = parametros.anoInicioProjecao; // ex: 2026

  // Cálculos de Alavancas
  const impactoReajustePreco = alavancas.reajustePreco
    ? (empresa.faturamentoMensal * (parametros.intensidadeReajustePreco / 100) * (1 - aliquotaEfetiva / 100))
    : 0;

  const impactoProrrogacaoUnico = alavancas.prorrogacaoFornecedor
    ? (empresa.comprasMensais * parametros.diasProrrogacaoFornecedor) / 30
    : 0;

  const custoProrrogacaoRecorrente = alavancas.prorrogacaoFornecedor
    ? (empresa.comprasMensais * (parametros.descontoPontualidadePerdido / 100))
    : 0;

  const impactoCorteCusto = alavancas.corteCusto
    ? (empresa.custoOperacional * (parametros.percentualCorteCusto / 100))
    : 0;

  let mesesAbaixoPiso = 0;
  let primeiroCritico: number | null = null;
  let menorSaldo = saldoAtual;
  let menorSaldoMesIndice = 0;
  let ficaNegativo = false;

  for (let i = 0; i < horizonteMeses; i++) {
    const dataMes = formatarMesAno(anoInicio, mesInicioOffset, i);
    const fatorSazonal = getFatorSazonalNormalizado(empresa.perfilSazonal, dataMes.mes0);
    
    // Geração base ponderada por sazonalidade
    let geracao = geracaoCaixaMensal * fatorSazonal;
    let pontual = 0;

    const ehMesSplit = (i === parametros.mesEntradaSplit);

    // Choque único no mês de entrada do split (ex: Julho/2027)
    if (ehMesSplit) {
      pontual -= choqueUnico;
    }

    // Crédito não realizado (recorrente a partir do split)
    if (i >= parametros.mesEntradaSplit) {
      geracao -= creditoPerdido;
    }

    // Aplicação de Alavancas:
    // 1. Reajuste de preço (imediato / recorrente)
    if (alavancas.reajustePreco) {
      geracao += impactoReajustePreco;
    }

    // 2. Prorrogação de fornecedor
    if (alavancas.prorrogacaoFornecedor) {
      if (ehMesSplit) {
        pontual += impactoProrrogacaoUnico;
      }
      if (i >= parametros.mesEntradaSplit) {
        geracao -= custoProrrogacaoRecorrente;
      }
    }

    // 3. Corte de custo (após período de maturação)
    if (alavancas.corteCusto) {
      if (i >= parametros.maturacaoCorteCusto) {
        geracao += impactoCorteCusto;
      }
    }

    // Saldo do mês
    if (i === 0) {
      // No primeiro mês, aplica variação sobre o caixa inicial
      saldoAtual = empresa.caixaAtual + geracao + pontual;
    } else {
      saldoAtual = saldoAtual + geracao + pontual;
    }

    saldos[i] = saldoAtual;

    const abaixoPiso = saldoAtual < pisoOperacional;
    if (abaixoPiso) {
      mesesAbaixoPiso++;
      if (primeiroCritico === null) {
        primeiroCritico = i;
      }
    }

    if (saldoAtual < 0) {
      ficaNegativo = true;
    }

    if (saldoAtual < menorSaldo) {
      menorSaldo = saldoAtual;
      menorSaldoMesIndice = i;
    }

    pontos.push({
      indice: i,
      mesNome: dataMes.nomeCompleto,
      ano: dataMes.ano,
      rotulo: dataMes.rotulo,
      saldo: Math.round(saldoAtual),
      geracao: Math.round(geracao),
      pontual: Math.round(pontual),
      abaixoPiso,
      fatorSazonal,
      ehMesSplit,
    });
  }

  return {
    aliquota: aliquotaCBS,
    saldos,
    pontos,
    mesesAbaixoPiso,
    primeiroCritico,
    menorSaldo: Math.round(menorSaldo),
    menorSaldoMesIndice,
    ficaNegativo,
  };
}

/**
 * Classificação formal de risco
 */
export function classificarRisco(cenarioBase: CenarioResultado): { nivel: NivelRisco; ordem: number; motivo: string } {
  const { ficaNegativo, mesesAbaixoPiso, primeiroCritico, menorSaldo } = cenarioBase;

  if (ficaNegativo) {
    return {
      nivel: 'Crítico',
      ordem: 4,
      motivo: `Caixa entra em saldo negativo (menor saldo: R$ ${menorSaldo.toLocaleString('pt-BR')})`,
    };
  }

  if (mesesAbaixoPiso >= 8) {
    return {
      nivel: 'Crítico',
      ordem: 4,
      motivo: `${mesesAbaixoPiso} meses operando abaixo do piso operacional de segurança`,
    };
  }

  if (mesesAbaixoPiso >= 4) {
    return {
      nivel: 'Alto',
      ordem: 3,
      motivo: `${mesesAbaixoPiso} meses abaixo do piso operacional a partir do mês ${primeiroCritico !== null ? primeiroCritico + 1 : '-'}`,
    };
  }

  if (mesesAbaixoPiso >= 1) {
    return {
      nivel: 'Médio',
      ordem: 2,
      motivo: `${mesesAbaixoPiso} mês(es) temporariamente abaixo do piso de segurança`,
    };
  }

  return {
    nivel: 'Baixo',
    ordem: 1,
    motivo: 'Fluxo de caixa permanece resiliente e acima do piso operacional em todo o período',
  };
}

/**
 * Geração completa da Projeção para a Empresa
 */
export function calcularProjecaoCompleta(
  empresa: Empresa,
  parametros: ParametrosGlobais,
  alavancas: AlavancasAtivas,
  horizonteMeses: number = 24
): ProjecaoResultado {
  const cenarioConservador = projetarCenario(
    empresa,
    parametros,
    8.4, // LC 214/2025 art 347
    { reajustePreco: false, prorrogacaoFornecedor: false, corteCusto: false },
    horizonteMeses
  );

  const cenarioBase = projetarCenario(
    empresa,
    parametros,
    8.8, // Alíquota de referência
    { reajustePreco: false, prorrogacaoFornecedor: false, corteCusto: false },
    horizonteMeses
  );

  const cenarioPessimista = projetarCenario(
    empresa,
    parametros,
    9.21, // Estimativa Comitê Gestor IBS
    { reajustePreco: false, prorrogacaoFornecedor: false, corteCusto: false },
    horizonteMeses
  );

  // Cenário com Alavancas ativas
  const temAlavancaAtiva = alavancas.reajustePreco || alavancas.prorrogacaoFornecedor || alavancas.corteCusto;
  const cenarioComAlavancas = temAlavancaAtiva
    ? projetarCenario(empresa, parametros, 8.8, alavancas, horizonteMeses)
    : undefined;

  const memoriaCalculo = calcularMemoriaCalculo(empresa, parametros, 8.8);
  const risco = classificarRisco(cenarioBase);

  // Detalhamento das 4 Alavancas com prazos e destaque de urgência
  const primeiroMesCriticoIndice = cenarioBase.primeiroCritico ?? 999;
  const aliquotaEfetiva = memoriaCalculo.aliquotaEfetiva;

  const alavancasInfo: AlavancaDetalhe[] = [
    {
      id: 'reajustePreco',
      nome: 'Reajuste de Preço de Venda',
      descricao: `Repasse calculado de ${parametros.intensidadeReajustePreco}% sobre o faturamento mensal.`,
      impactoCalculado: Math.round(empresa.faturamentoMensal * (parametros.intensidadeReajustePreco / 100) * (1 - aliquotaEfetiva / 100)),
      impactoTipo: 'recorrente',
      momento: 'Recorrente, a partir do início da vigência',
      prazoDecisao: 'Janeiro do ano de vigência comercial',
      prazoDecisaoData: 'Janeiro de 2027',
      prazoDecisaoMesIndice: 5, // Jan/2027 (mês 5 a partir de Ago/2026)
      venceAntesDoMesCritico: 5 < primeiroMesCriticoIndice,
      custoAssociado: 'Elasticidade da demanda não modelada (potencial atrito comercial)',
      ativa: !!alavancas.reajustePreco,
    },
    {
      id: 'prorrogacaoFornecedor',
      nome: 'Alongamento de Prazo com Fornecedores',
      descricao: `Extensão média de +${parametros.diasProrrogacaoFornecedor} dias nos prazos de contas a pagar.`,
      impactoCalculado: Math.round((empresa.comprasMensais * parametros.diasProrrogacaoFornecedor) / 30),
      impactoTipo: 'unico',
      momento: 'Alívio único no mês de entrada do split',
      prazoDecisao: '2 meses antes da entrada do Split Payment',
      prazoDecisaoData: 'Maio de 2027',
      prazoDecisaoMesIndice: 9, // Maio/2027 (mês 9 a partir de Ago/2026)
      venceAntesDoMesCritico: 9 < primeiroMesCriticoIndice,
      custoAssociado: `Perda de desconto por pontualidade estimada em ${parametros.descontoPontualidadePerdido}% recorrente (-R$ ${Math.round((empresa.comprasMensais * parametros.descontoPontualidadePerdido) / 100).toLocaleString('pt-BR')}/mês)`,
      ativa: !!alavancas.prorrogacaoFornecedor,
    },
    {
      id: 'corteCusto',
      nome: 'Racionalização de Custos Operacionais',
      descricao: `Redução de ${parametros.percentualCorteCusto}% em folha, despesas administrativas e ocupação.`,
      impactoCalculado: Math.round((empresa.custoOperacional * parametros.percentualCorteCusto) / 100),
      impactoTipo: 'recorrente',
      momento: `Recorrente, após maturação de ${parametros.maturacaoCorteCusto} meses`,
      prazoDecisao: `Exige maturação de ${parametros.maturacaoCorteCusto} meses antes do Split`,
      prazoDecisaoData: 'Março de 2027',
      prazoDecisaoMesIndice: 7, // Março/2027 (mês 7)
      venceAntesDoMesCritico: 7 < primeiroMesCriticoIndice,
      custoAssociado: 'Custos de rescisão/reestruturação e risco de atrito operacional',
      ativa: !!alavancas.corteCusto,
    },
    {
      id: 'opcaoRegimeRegular',
      nome: 'Opção pelo Regime Regular de CBS/IBS',
      descricao: 'Recolher CBS e IBS fora do DAS para permitir transferência integral de créditos a clientes B2B.',
      impactoCalculado: Math.round(memoriaCalculo.retidoNoSplit),
      impactoTipo: 'recorrente',
      momento: 'Janela semestral formal de opção',
      prazoDecisao: 'Janela de opção: 01 a 30 de setembro de 2026',
      prazoDecisaoData: '30 de Setembro de 2026',
      prazoDecisaoMesIndice: 1, // Set/2026
      venceAntesDoMesCritico: 1 < primeiroMesCriticoIndice,
      custoAssociado: 'Sujeita a empresa integralmente ao Split Payment na liquidação e apuração débito/crédito',
      ativa: !!alavancas.opcaoRegimeRegular,
    }
  ];

  // Premissas declaradas
  const premissas: PremissaDeclarada[] = [
    {
      campo: 'aliquotaReferenciaCBS',
      nome: 'Alíquota de Referência CBS',
      valorFormatado: `${parametros.aliquotaReferenciaCBS}%`,
      origem: 'Lei Complementar 214/2025 (Estimativa de Referência)',
      validado: true,
      nota: 'Alíquota oficial base para a transição',
    },
    {
      campo: 'prazoRecuperacaoCredito',
      nome: 'Prazo Médio de Recuperação do Crédito',
      valorFormatado: `${parametros.prazoRecuperacaoCredito} dias`,
      origem: 'Premissa operacional de modelo',
      validado: false,
      nota: 'Tempo entre a compra faturada e a efetiva compensação na apuração fiscal',
    },
    {
      campo: 'mesEntradaSplit',
      nome: 'Data de Início do Split Payment',
      valorFormatado: parametros.dataEntradaSplitNome,
      origem: 'Calendário de transição da Reforma',
      validado: false,
      nota: 'Em 2027 o split é restrito a operações B2B e transações eletrônicas',
    },
    {
      campo: 'fornecedoresRisco',
      nome: 'Inadimplência Fiscal de Fornecedores',
      valorFormatado: `${empresa.fornecedoresRisco}%`,
      origem: 'Estimativa por carteira / segmento',
      validado: false,
      nota: 'Sem fonte pública oficial. O direito ao crédito depende do recolhimento pelo fornecedor',
    },
    {
      campo: 'elasticidadePreco',
      nome: 'Elasticidade de Demanda',
      valorFormatado: 'Não modelada',
      origem: 'Lacuna conhecida do modelo',
      validado: false,
      nota: 'O reajuste de preço assume volume inalterado de vendas',
    },
  ];

  return {
    memoriaCalculo,
    cenarioBase,
    cenarioConservador,
    cenarioPessimista,
    cenarioComAlavancas,
    risco,
    alavancasInfo,
    premissas,
  };
}
