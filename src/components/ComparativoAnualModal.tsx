import React, { useMemo } from 'react';
import { Empresa, ParametrosGlobais, AlavancasAtivas, PontoMes } from '../types';
import { calcularProjecaoCompleta } from '../motor/motorCalculo';
import { MiniSparkline } from './MiniSparkline';
import { X, CalendarRange, ArrowUp, ArrowDown, Minus, AlertTriangle, Zap } from 'lucide-react';

interface ComparativoAnualModalProps {
  empresa: Empresa;
  parametros: ParametrosGlobais;
  alavancasAtivas: AlavancasAtivas;
  onFechar: () => void;
}

interface ResumoAno {
  ano: number;
  saldoInicial: number;
  saldoFinal: number;
  saldoFinalComAlavancas?: number;
  menorSaldo: number;
  mesesNoPiso: number;
  totalMeses: number;
  geracaoAcumulada: number;
  ehAnoSplit: boolean;
  curva: number[];
}

function agruparPorAno(
  pontos: PontoMes[],
  pontosComAlavancas: PontoMes[] | undefined,
  saldoInicialGlobal: number
): ResumoAno[] {
  const grupos = new Map<number, PontoMes[]>();
  pontos.forEach(p => {
    if (!grupos.has(p.ano)) grupos.set(p.ano, []);
    grupos.get(p.ano)!.push(p);
  });

  const anos = Array.from(grupos.keys()).sort((a, b) => a - b);
  let saldoAnterior = saldoInicialGlobal;

  return anos.map(ano => {
    const ptsAno = grupos.get(ano)!;
    const saldoFinal = ptsAno[ptsAno.length - 1].saldo;
    const menorSaldo = Math.min(...ptsAno.map(p => p.saldo));
    const mesesNoPiso = ptsAno.filter(p => p.abaixoPiso).length;
    const geracaoAcumulada = ptsAno.reduce((acc, p) => acc + p.geracao + p.pontual, 0);
    const ehAnoSplit = ptsAno.some(p => p.ehMesSplit);

    let saldoFinalComAlavancas: number | undefined;
    if (pontosComAlavancas) {
      const indicesAno = ptsAno.map(p => p.indice);
      const ultimoIndice = indicesAno[indicesAno.length - 1];
      saldoFinalComAlavancas = pontosComAlavancas.find(p => p.indice === ultimoIndice)?.saldo;
    }

    const resumo: ResumoAno = {
      ano,
      saldoInicial: saldoAnterior,
      saldoFinal,
      saldoFinalComAlavancas,
      menorSaldo,
      mesesNoPiso,
      totalMeses: ptsAno.length,
      geracaoAcumulada,
      ehAnoSplit,
      curva: ptsAno.map(p => p.saldo),
    };
    saldoAnterior = saldoFinal;
    return resumo;
  });
}

export const ComparativoAnualModal: React.FC<ComparativoAnualModalProps> = ({
  empresa,
  parametros,
  alavancasAtivas,
  onFechar,
}) => {
  const temAlavancaAtiva = Object.values(alavancasAtivas).some(Boolean);

  const resumosAnuais = useMemo(() => {
    const projecao = calcularProjecaoCompleta(empresa, parametros, alavancasAtivas, 84);
    return agruparPorAno(
      projecao.cenarioBase.pontos,
      projecao.cenarioComAlavancas?.pontos,
      empresa.caixaAtual
    );
  }, [empresa, parametros, alavancasAtivas]);

  const primeiro = resumosAnuais[0];
  const ultimo = resumosAnuais[resumosAnuais.length - 1];
  const variacaoTotal = ultimo ? ultimo.saldoFinal - empresa.caixaAtual : 0;
  const variacaoTotalPct = empresa.caixaAtual !== 0 ? (variacaoTotal / Math.abs(empresa.caixaAtual)) * 100 : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-superficie border border-line rounded-xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between p-4 border-b border-line">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-acento/10 text-acento">
              <CalendarRange className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-textoPrimario">
                Comparativo Ano a Ano · {empresa.nome}
              </h2>
              <p className="text-[11px] text-textoSecundario">
                Evolução do saldo de caixa projetado, ano civil a ano civil, até {ultimo?.ano ?? ''}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onFechar}
            className="p-1.5 rounded-lg text-textoSecundario hover:text-textoPrimario hover:bg-superficieElevada transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {/* Resumo do período */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-superficieElevada/50 text-xs">
            {variacaoTotal >= 0 ? (
              <ArrowUp className="w-4 h-4 text-confirmacao shrink-0" />
            ) : (
              <ArrowDown className="w-4 h-4 text-alerta shrink-0" />
            )}
            <span className="text-textoSecundario">
              De <strong className="text-textoPrimario">R$ {empresa.caixaAtual.toLocaleString('pt-BR')}</strong> (caixa atual) para{' '}
              <strong className={variacaoTotal >= 0 ? 'text-confirmacao' : 'text-alerta'}>
                R$ {ultimo?.saldoFinal.toLocaleString('pt-BR')}
              </strong>{' '}
              ao final de {ultimo?.ano}: variação de{' '}
              <strong className={variacaoTotal >= 0 ? 'text-confirmacao' : 'text-alerta'}>
                {variacaoTotal >= 0 ? '+' : ''}R$ {variacaoTotal.toLocaleString('pt-BR')} ({variacaoTotalPct >= 0 ? '+' : ''}{variacaoTotalPct.toFixed(0)}%)
              </strong>
              {temAlavancaAtiva && <span className="text-acento"> · valores com as alavancas ativas aplicadas</span>}
            </span>
          </div>

          {/* Cards lado a lado, um por ano */}
          <div className="flex gap-3 overflow-x-auto pb-2">
            {resumosAnuais.map((resumo, idx) => {
              const variacaoAno = resumo.saldoFinal - resumo.saldoInicial;
              const variacaoAnoPct = resumo.saldoInicial !== 0 ? (variacaoAno / Math.abs(resumo.saldoInicial)) * 100 : 0;
              const primeiroAno = idx === 0;

              return (
                <div
                  key={resumo.ano}
                  className={`shrink-0 w-48 rounded-xl border p-4 ${
                    resumo.ehAnoSplit ? 'border-acento/50 bg-acento/[0.04]' : 'border-line bg-superficie'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-textoPrimario">{resumo.ano}</span>
                    {resumo.ehAnoSplit && (
                      <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-acento/15 text-acento text-[9px] font-semibold uppercase">
                        <Zap className="w-2.5 h-2.5" />
                        Split
                      </span>
                    )}
                  </div>

                  <div className="text-lg font-semibold text-textoPrimario">
                    R$ {(resumo.saldoFinal / 1000).toFixed(0)}k
                  </div>
                  <div className="text-[10px] text-textoSecundario mb-2">Saldo ao final do ano ({resumo.totalMeses}m)</div>

                  <MiniSparkline
                    valores={resumo.curva}
                    cor={resumo.mesesNoPiso > 0 ? '#DC2626' : '#16A34A'}
                    largura={160}
                    altura={36}
                  />

                  <div className="mt-3 pt-3 border-t border-line space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs">
                      {variacaoAno > 0 ? (
                        <ArrowUp className="w-3.5 h-3.5 text-confirmacao shrink-0" />
                      ) : variacaoAno < 0 ? (
                        <ArrowDown className="w-3.5 h-3.5 text-alerta shrink-0" />
                      ) : (
                        <Minus className="w-3.5 h-3.5 text-textoSecundario shrink-0" />
                      )}
                      <span className={variacaoAno >= 0 ? 'text-confirmacao font-medium' : 'text-alerta font-medium'}>
                        {variacaoAno >= 0 ? '+' : ''}R$ {Math.round(variacaoAno).toLocaleString('pt-BR')}
                      </span>
                      <span className="text-textoSecundario text-[10px]">
                        ({variacaoAnoPct >= 0 ? '+' : ''}{variacaoAnoPct.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="text-[10px] text-textoSecundario">
                      {primeiroAno ? 'vs. caixa atual' : 'vs. final do ano anterior'}
                    </div>

                    {resumo.mesesNoPiso > 0 ? (
                      <div className="flex items-center gap-1 text-[10px] text-alerta">
                        <AlertTriangle className="w-3 h-3 shrink-0" />
                        <span>{resumo.mesesNoPiso} mês(es) abaixo do piso</span>
                      </div>
                    ) : (
                      <div className="text-[10px] text-confirmacao">Sem ruptura no ano</div>
                    )}

                    {temAlavancaAtiva && resumo.saldoFinalComAlavancas !== undefined && (
                      <div className="text-[10px] text-acento pt-1 border-t border-line/60">
                        Com alavancas: <strong>R$ {Math.round(resumo.saldoFinalComAlavancas).toLocaleString('pt-BR')}</strong>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-[10px] text-textoSecundario">
            Cada cartão soma os meses do respectivo ano civil dentro do horizonte de 84 meses (Ago/2026 a Jul/2033). O primeiro e o último ano podem ter menos de 12 meses.
          </p>
        </div>
      </div>
    </div>
  );
};
