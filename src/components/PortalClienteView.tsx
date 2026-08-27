import React, { useState, useEffect, useMemo } from 'react';
import { AlavancasAtivas, PontoMes } from '../types';
import { PacotePortalCliente } from '../utils/portalCliente';
import { calcularProjecaoCompleta } from '../motor/motorCalculo';
import { GraficoProjecao } from './GraficoProjecao';
import { MiniSparkline } from './MiniSparkline';
import {
  AlertCircle,
  AlertTriangle,
  ShieldCheck,
  Sun,
  Moon,
  CalendarClock,
  Zap,
  Info,
  Printer,
} from 'lucide-react';

interface PortalClienteViewProps {
  pacote: PacotePortalCliente;
}

const ALAVANCAS_NEUTRAS: AlavancasAtivas = {
  reajustePreco: false,
  prorrogacaoFornecedor: false,
  corteCusto: false,
  opcaoRegimeRegular: false,
};

function brl(valor: number): string {
  return `R$ ${Math.round(valor).toLocaleString('pt-BR')}`;
}

interface ResumoAno {
  ano: number;
  saldoFinal: number;
  mesesNoPiso: number;
  curva: number[];
  ehAnoSplit: boolean;
}

function resumirPorAno(pontos: PontoMes[]): ResumoAno[] {
  const grupos = new Map<number, PontoMes[]>();
  pontos.forEach(p => {
    if (!grupos.has(p.ano)) grupos.set(p.ano, []);
    grupos.get(p.ano)!.push(p);
  });

  return Array.from(grupos.keys())
    .sort((a, b) => a - b)
    .map(ano => {
      const ptsAno = grupos.get(ano)!;
      return {
        ano,
        saldoFinal: ptsAno[ptsAno.length - 1].saldo,
        mesesNoPiso: ptsAno.filter(p => p.abaixoPiso).length,
        curva: ptsAno.map(p => p.saldo),
        ehAnoSplit: ptsAno.some(p => p.ehMesSplit),
      };
    });
}

export const PortalClienteView: React.FC<PortalClienteViewProps> = ({ pacote }) => {
  const { empresa, parametros, escritorio, emitidoEm } = pacote;

  const [horizonteMeses, setHorizonteMeses] = useState<number>(24);
  const [modoEscuro, setModoEscuro] = useState<boolean>(() => {
    return localStorage.getItem('mirante_tax_tema') === 'escuro';
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('tema-escuro', modoEscuro);
    root.classList.toggle('tema-claro', !modoEscuro);
    localStorage.setItem('mirante_tax_tema', modoEscuro ? 'escuro' : 'claro');
  }, [modoEscuro]);

  const alavancasAtivas = empresa.alavancasAtivas || ALAVANCAS_NEUTRAS;

  const projecao = useMemo(
    () => calcularProjecaoCompleta(empresa, parametros, alavancasAtivas, horizonteMeses),
    [empresa, parametros, alavancasAtivas, horizonteMeses]
  );

  const resumosAnuais = useMemo(() => {
    const longa = calcularProjecaoCompleta(empresa, parametros, alavancasAtivas, 84);
    return resumirPorAno(longa.cenarioBase.pontos);
  }, [empresa, parametros, alavancasAtivas]);

  const { cenarioBase, cenarioConservador, cenarioPessimista, risco, memoriaCalculo, alavancasInfo } = projecao;

  const pontoCritico = cenarioBase.primeiroCritico !== null
    ? cenarioBase.pontos[cenarioBase.primeiroCritico]
    : null;

  const alavancasUrgentes = alavancasInfo.filter(a => a.venceAntesDoMesCritico);

  const paletaRisco = {
    'Crítico': { texto: 'text-alerta', fundo: 'bg-alerta/12', Icone: AlertCircle },
    'Alto': { texto: 'text-amber-600 dark:text-amber-400', fundo: 'bg-amber-500/12', Icone: AlertTriangle },
    'Médio': { texto: 'text-yellow-600 dark:text-yellow-400', fundo: 'bg-yellow-500/12', Icone: AlertTriangle },
    'Baixo': { texto: 'text-confirmacao', fundo: 'bg-confirmacao/12', Icone: ShieldCheck },
  }[risco.nivel];

  const IconeRisco = paletaRisco.Icone;

  const indicadores = [
    { rotulo: 'Caixa hoje', valor: brl(empresa.caixaAtual) },
    {
      rotulo: 'Menor saldo projetado',
      valor: brl(cenarioBase.menorSaldo),
      destaque: cenarioBase.menorSaldo < memoriaCalculo.pisoOperacional ? 'alerta' : undefined,
    },
    {
      rotulo: 'Piso de segurança',
      valor: brl(memoriaCalculo.pisoOperacional),
      nota: 'um mês de custo fixo',
    },
    {
      rotulo: 'Primeiro mês de aperto',
      valor: pontoCritico ? pontoCritico.rotulo : 'Nenhum',
      destaque: pontoCritico ? 'alerta' : undefined,
    },
  ];

  return (
    <div className="min-h-screen bg-fundo text-textoPrimario font-sans">
      {/* Cabeçalho do portal */}
      <header className="border-b border-line bg-superficie print:border-b-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-acento flex items-center justify-center font-bold text-[11px] text-black shrink-0">
              MT
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold truncate">Painel do Cliente</div>
              <div className="text-[11px] text-textoSecundario truncate">
                Preparado por {escritorio} · {new Date(emitidoEm).toLocaleDateString('pt-BR')}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 print:hidden">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-superficieElevada border border-line rounded-lg text-xs text-textoPrimario hover:border-acento/50 transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5 text-textoSecundario" />
              <span className="hidden sm:inline">Imprimir</span>
            </button>
            <button
              type="button"
              onClick={() => setModoEscuro(v => !v)}
              title={modoEscuro ? 'Modo claro' : 'Modo escuro'}
              className="p-2 rounded-lg text-textoSecundario hover:text-textoPrimario hover:bg-superficieElevada transition-colors"
            >
              {modoEscuro ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        {/* Identificação */}
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold">{empresa.nome}</h1>
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-textoSecundario mt-1">
            <span>CNAE {empresa.cnae}</span>
            <span>·</span>
            <span>{empresa.ramo}</span>
            <span>·</span>
            <span className="capitalize">{empresa.regime.replace('_', ' ')}</span>
          </div>
        </div>

        {/* Veredito em linguagem de negócio */}
        <section className={`rounded-xl border border-line bg-superficie p-5`}>
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg shrink-0 ${paletaRisco.fundo} ${paletaRisco.texto}`}>
              <IconeRisco className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold">Situação do seu caixa na transição</span>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${paletaRisco.fundo} ${paletaRisco.texto}`}>
                  Risco {risco.nivel}
                </span>
              </div>

              <p className="text-sm text-textoSecundario mt-2 leading-relaxed">
                {pontoCritico ? (
                  <>
                    A partir de <strong className="text-textoPrimario">{pontoCritico.mesNome}</strong> o saldo
                    projetado cai abaixo do piso de segurança de{' '}
                    <strong className="text-textoPrimario">{brl(memoriaCalculo.pisoOperacional)}</strong>, o
                    equivalente a um mês de custo fixo da empresa. No pior momento do período o caixa chega a{' '}
                    <strong className={cenarioBase.menorSaldo < 0 ? 'text-alerta' : 'text-textoPrimario'}>
                      {brl(cenarioBase.menorSaldo)}
                    </strong>
                    , e são <strong className="text-textoPrimario">{cenarioBase.mesesAbaixoPiso} mês(es)</strong>{' '}
                    de aperto no horizonte de {horizonteMeses} meses.
                  </>
                ) : (
                  <>
                    O saldo projetado permanece acima do piso de segurança de{' '}
                    <strong className="text-textoPrimario">{brl(memoriaCalculo.pisoOperacional)}</strong> em todos
                    os {horizonteMeses} meses do horizonte. O ponto mais baixo é{' '}
                    <strong className="text-textoPrimario">{brl(cenarioBase.menorSaldo)}</strong>.
                  </>
                )}
              </p>

              <p className="text-sm text-textoSecundario mt-2 leading-relaxed">
                A causa é o split payment: hoje a empresa recebe o valor cheio da venda e recolhe o tributo
                semanas depois, e nesse intervalo o dinheiro do Fisco financia a operação. A partir de{' '}
                <strong className="text-textoPrimario">{parametros.dataEntradaSplitNome}</strong> o tributo passa
                a ser separado no momento em que o pagamento é liquidado.{' '}
                <strong className="text-textoPrimario">{memoriaCalculo.mixExpostoSplit}%</strong> do seu
                faturamento entra por meios sujeitos a essa separação. Não é perda de margem: é a perda de uma
                linha de financiamento que a empresa usava sem contabilizar como dívida.
              </p>
            </div>
          </div>
        </section>

        {/* Indicadores */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {indicadores.map(item => (
            <div key={item.rotulo} className="bg-superficie border border-line rounded-xl p-3">
              <span className="text-[10px] text-textoSecundario block">{item.rotulo}</span>
              {/* Mono encolhe no mobile: em card de meia largura, valores de 8
                  dígitos estouram a linha em text-base. */}
              <span className={`text-sm sm:text-base font-semibold mt-0.5 block font-mono tabular-nums ${
                item.destaque === 'alerta' ? 'text-alerta' : 'text-textoPrimario'
              }`}>
                {item.valor}
              </span>
              {item.nota && <span className="text-[10px] text-textoSecundario">{item.nota}</span>}
            </div>
          ))}
        </section>

        {/* Curva */}
        <GraficoProjecao
          projecao={projecao}
          horizonteMeses={horizonteMeses}
          onMudarHorizonte={setHorizonteMeses}
          modoEscuro={modoEscuro}
        />

        {/* Faixa de cenários */}
        <section className="bg-superficie border border-line rounded-xl p-4">
          <h2 className="text-sm font-semibold mb-1">Faixa de projeção</h2>
          <p className="text-[11px] text-textoSecundario mb-3">
            As alíquotas da Reforma ainda estão em consolidação. Por isso o resultado é apresentado como faixa, e
            nunca como número único.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              { nome: 'Conservador', cenario: cenarioConservador },
              { nome: 'Base', cenario: cenarioBase },
              { nome: 'Pessimista', cenario: cenarioPessimista },
            ].map(({ nome, cenario }) => (
              <div key={nome} className="bg-superficieElevada rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium">{nome}</span>
                  <span className="text-[10px] font-mono text-acento">{cenario.aliquota}%</span>
                </div>
                <div className="text-sm font-mono font-semibold tabular-nums mt-1.5">{brl(cenario.menorSaldo)}</div>
                <div className="text-[10px] text-textoSecundario">
                  menor saldo · {cenario.mesesAbaixoPiso} mês(es) abaixo do piso
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Ano a ano */}
        <section className="bg-superficie border border-line rounded-xl p-4">
          <h2 className="text-sm font-semibold mb-1">Ano a ano até 2033</h2>
          <p className="text-[11px] text-textoSecundario mb-3">
            Saldo de caixa ao final de cada ano civil da transição.
            <span className="sm:hidden"> Arraste para o lado para ver os demais anos.</span>
          </p>
          <div className="flex gap-2.5 overflow-x-auto pb-2">
            {resumosAnuais.map(resumo => (
              <div
                key={resumo.ano}
                className={`shrink-0 w-40 rounded-lg border p-3 ${
                  resumo.ehAnoSplit ? 'border-acento/50 bg-acento/[0.04]' : 'border-line bg-superficieElevada'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-semibold">{resumo.ano}</span>
                  {resumo.ehAnoSplit && (
                    <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-acento/15 text-acento text-[9px] font-semibold uppercase">
                      <Zap className="w-2.5 h-2.5" />
                      Split
                    </span>
                  )}
                </div>
                <div className="text-sm font-mono font-semibold tabular-nums">{brl(resumo.saldoFinal)}</div>
                <div className="my-2">
                  <MiniSparkline
                    valores={resumo.curva}
                    cor={resumo.mesesNoPiso > 0 ? '#DC2626' : '#16A34A'}
                    largura={130}
                    altura={30}
                  />
                </div>
                {resumo.mesesNoPiso > 0 ? (
                  <div className="flex items-center gap-1 text-[10px] text-alerta">
                    <AlertTriangle className="w-3 h-3 shrink-0" />
                    <span>{resumo.mesesNoPiso} mês(es) no aperto</span>
                  </div>
                ) : (
                  <div className="text-[10px] text-confirmacao">Sem ruptura no ano</div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Alavancas com prazo de decisão */}
        <section className="bg-superficie border border-line rounded-xl p-4">
          <div className="flex items-start gap-2.5 mb-1">
            <CalendarClock className="w-4 h-4 text-acento shrink-0 mt-0.5" />
            <div>
              <h2 className="text-sm font-semibold">O que ainda dá para fazer, e até quando</h2>
              <p className="text-[11px] text-textoSecundario mt-0.5">
                Cada ação tem um prazo-limite de decisão. Depois dele, a alavanca deixa de estar disponível e só
                resta crédito emergencial.
              </p>
            </div>
          </div>

          {alavancasUrgentes.length > 0 && pontoCritico && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-alerta/8 border border-alerta/25 text-xs my-3">
              <AlertTriangle className="w-4 h-4 text-alerta shrink-0 mt-0.5" />
              <span className="text-textoSecundario">
                <strong className="text-alerta">{alavancasUrgentes.length} ação(ões)</strong> precisam ser
                decididas <strong className="text-textoPrimario">antes</strong> de {pontoCritico.mesNome}, o
                primeiro mês de aperto. É o momento em que a decisão ainda é barata.
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
            {alavancasInfo.map(alavanca => (
              <div
                key={alavanca.id}
                className={`rounded-lg border p-3 ${
                  alavanca.venceAntesDoMesCritico
                    ? 'border-acento/40 bg-acento/[0.04]'
                    : 'border-line bg-superficieElevada'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-medium leading-snug">{alavanca.nome}</span>
                  {alavanca.ativa && (
                    <span className="shrink-0 px-1.5 py-0.5 rounded-full bg-confirmacao/15 text-confirmacao text-[9px] font-semibold uppercase">
                      Em curso
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-textoSecundario mt-1.5">{alavanca.descricao}</p>

                <div className="flex items-baseline gap-1.5 mt-2">
                  <span className="text-sm font-mono font-semibold tabular-nums text-confirmacao">
                    +{brl(alavanca.impactoCalculado)}
                  </span>
                  <span className="text-[10px] text-textoSecundario">
                    {alavanca.impactoTipo === 'recorrente' ? 'por mês' : 'uma vez'}
                  </span>
                </div>

                <div className="mt-2.5 pt-2.5 border-t border-line space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <CalendarClock
                      className={`w-3 h-3 shrink-0 ${alavanca.venceAntesDoMesCritico ? 'text-acento' : 'text-textoSecundario'}`}
                    />
                    <span className="text-textoSecundario">Decidir até</span>
                    <strong className={alavanca.venceAntesDoMesCritico ? 'text-acento' : 'text-textoPrimario'}>
                      {alavanca.prazoDecisaoData}
                    </strong>
                  </div>
                  <div className="text-[10px] text-textoSecundario">
                    Contrapartida: {alavanca.custoAssociado}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-textoSecundario mt-3">
            A simulação de cada ação é feita pelo seu escritório contábil. Fale com {escritorio} para avaliar
            qual combinação faz sentido para a sua operação.
          </p>
        </section>

        {/* Como o número foi construído */}
        <section className="bg-superficie border border-line rounded-xl p-4">
          <h2 className="text-sm font-semibold mb-3">Como este número foi construído</h2>
          <div className="space-y-2">
            {[
              {
                titulo: 'Valor retido na liquidação',
                valor: brl(memoriaCalculo.retidoNoSplit),
                nota: `Tributo separado no momento do recebimento, sobre os ${memoriaCalculo.mixExpostoSplit}% do faturamento que entram por boleto, Pix ou cartão.`,
              },
              {
                titulo: 'Crédito preso no ciclo',
                valor: brl(memoriaCalculo.capitalPreso),
                nota: `O tributo sai na venda, mas o crédito das compras só volta em cerca de ${parametros.prazoRecuperacaoCredito} dias. Esse descasamento imobiliza capital.`,
              },
              {
                titulo: 'Impacto único na entrada do split',
                valor: brl(memoriaCalculo.choqueUnico),
                nota: `Soma das duas linhas acima, aplicada em ${parametros.dataEntradaSplitNome}.`,
                destaque: true,
              },
              {
                titulo: 'Crédito que pode não se realizar',
                valor: `${brl(memoriaCalculo.creditoPerdido)} / mês`,
                nota: `O direito ao crédito depende de o fornecedor ter recolhido. Estimativa de ${empresa.fornecedoresRisco}% dos fornecedores em risco. É a única variável fora do seu controle.`,
              },
              {
                titulo: 'Descasamento do ciclo',
                valor: `${memoriaCalculo.descasamentoCiclo > 0 ? '+' : ''}${memoriaCalculo.descasamentoCiclo} dias`,
                nota: `Recebe em ${empresa.prazoRecebimento} dias e paga em ${empresa.prazoPagamento}. Quanto maior a diferença, mais a empresa dependia do float tributário para fechar o mês.`,
              },
            ].map(linha => (
              <div
                key={linha.titulo}
                className={`p-3 rounded-lg ${
                  linha.destaque ? 'bg-acento/[0.06] border border-acento/25' : 'bg-superficieElevada'
                }`}
              >
                {/* Rótulo e valor na mesma linha, explicação em largura cheia
                    abaixo: em telas estreitas a nota não sobra espaço ao lado
                    do número. */}
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-xs font-medium min-w-0">{linha.titulo}</span>
                  <span className={`text-sm font-mono font-semibold tabular-nums shrink-0 ${linha.destaque ? 'text-acento' : 'text-textoPrimario'}`}>
                    {linha.valor}
                  </span>
                </div>
                <p className="text-[10px] text-textoSecundario mt-1">{linha.nota}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Premissas e limites */}
        <section className="bg-superficie border border-line rounded-xl p-4">
          <div className="flex items-start gap-2.5 mb-3">
            <Info className="w-4 h-4 text-textoSecundario shrink-0 mt-0.5" />
            <div>
              <h2 className="text-sm font-semibold">O que ainda não está fechado</h2>
              <p className="text-[11px] text-textoSecundario mt-0.5">
                Parte das regras da Reforma segue em consolidação. Declaramos abaixo o que é norma publicada e o
                que é premissa do modelo.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {projecao.premissas.map(premissa => (
              <div key={premissa.campo} className="bg-superficieElevada rounded-lg p-3">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="text-[11px] font-medium leading-snug">{premissa.nome}</span>
                  <span className={`shrink-0 text-[9px] px-1.5 py-0.5 rounded-full ${
                    premissa.validado ? 'bg-confirmacao/15 text-confirmacao' : 'bg-acento/15 text-acento'
                  }`}>
                    {premissa.validado ? 'Oficial' : 'Premissa'}
                  </span>
                </div>
                <div className="text-xs font-mono text-acento">{premissa.valorFormatado}</div>
                <div className="text-[10px] text-textoSecundario mt-1">{premissa.nota}</div>
              </div>
            ))}
          </div>
        </section>

        <footer className="text-[11px] text-textoSecundario leading-relaxed pb-8 border-t border-line pt-4">
          Projeção gerada pelo Mirante Tax a partir dos parâmetros informados por {escritorio} em{' '}
          {new Date(emitidoEm).toLocaleDateString('pt-BR')}. Este painel é material de apoio à conversa com o seu
          contador e não constitui parecer tributário. Qualquer decisão de regime, preço ou prazo deve ser
          validada e assinada pelo responsável técnico do escritório.
        </footer>
      </main>
    </div>
  );
};
