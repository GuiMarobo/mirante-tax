import React from 'react';
import { Empresa, ParametrosGlobais } from '../types';
import { calcularProjecaoCompleta } from '../motor/motorCalculo';
import { X, ArrowRightLeft, Zap } from 'lucide-react';

interface RegimeComparativoModalProps {
  empresa: Empresa;
  parametros: ParametrosGlobais;
  onFechar: () => void;
  onAplicarRegime: (regime: Empresa['regime']) => void;
}

export const RegimeComparativoModal: React.FC<RegimeComparativoModalProps> = ({
  empresa,
  parametros,
  onFechar,
  onAplicarRegime
}) => {
  // Simular a empresa no Simples Unificado
  const empresaUnificado: Empresa = {
    ...empresa,
    regime: 'simples_unificado',
    alavancasAtivas: { ...empresa.alavancasAtivas, opcaoRegimeRegular: false }
  };
  const projUnificado = calcularProjecaoCompleta(empresaUnificado, parametros, empresaUnificado.alavancasAtivas, 24);

  // Simular a empresa optando pelo Regime Regular de CBS/IBS
  const empresaRegular: Empresa = {
    ...empresa,
    regime: 'simples_regular',
    alavancasAtivas: { ...empresa.alavancasAtivas, opcaoRegimeRegular: true }
  };
  const projRegular = calcularProjecaoCompleta(empresaRegular, parametros, empresaRegular.alavancasAtivas, 24);

  const diferencaSaldo = projRegular.cenarioBase.menorSaldo - projUnificado.cenarioBase.menorSaldo;
  const recomendacao = projRegular.cenarioBase.menorSaldo > projUnificado.cenarioBase.menorSaldo
    ? 'Regime Regular de CBS/IBS (Aproveita Crédito Amplo)'
    : 'Simples Nacional Unificado (Menor impacto inicial)';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-superficie border border-line w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header Bento do Modal */}
        <div className="flex items-center justify-between p-4 border-b border-line">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-acento/10 text-acento">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-tight text-textoPrimario font-mono">
                Comparativo de Regimes na Transição · {empresa.nome}
              </h2>
              <p className="text-[11px] text-textoSecundario font-mono">
                Simulação: Simples Unificado (DAS) vs. Opção CBS/IBS Regular (Não-Cumulativo)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onFechar}
            className="p-1.5 text-textoSecundario hover:text-textoPrimario hover:bg-superficieElevada transition-colors border border-transparent hover:border-line"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo Comparativo */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs font-mono">
          {/* Veredito Comparativo */}
          <div className="p-3 bg-acento/10 border border-acento/30 flex items-start gap-3">
            <Zap className="w-5 h-5 text-acento shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-textoPrimario text-xs uppercase tracking-tight">
                Recomendação Técnica: <span className="text-acento">{recomendacao}</span>
              </h4>
              <p className="text-textoSecundario mt-1 text-[11px]">
                {diferencaSaldo > 0 ? (
                  <span>A opção pelo regime regular gera um <strong>ganho de liquidez de R$ {diferencaSaldo.toLocaleString('pt-BR')}</strong> no menor saldo devido ao creditamento amplo de compras (R$ {empresa.comprasMensais.toLocaleString('pt-BR')}/mês).</span>
                ) : (
                  <span>O Simples unificado preserva <strong>R$ {Math.abs(diferencaSaldo).toLocaleString('pt-BR')} a mais de caixa</strong> no período crítico.</span>
                )}
              </p>
            </div>
          </div>

          {/* Cards Bento Lado a Lado */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1 bg-line p-1">
            {/* Coluna 1: Simples Unificado */}
            <div className={`p-4 ${empresa.regime === 'simples_unificado' ? 'bg-superficieElevada border-2 border-acento' : 'bg-superficie'}`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-xs uppercase tracking-tight text-textoPrimario">
                  Simples Nacional Unificado
                </h3>
                {empresa.regime === 'simples_unificado' && (
                  <span className="px-1.5 py-0.5 text-[9px] bg-acento text-black font-bold">
                    ATUAL
                  </span>
                )}
              </div>

              <p className="text-[10px] text-textoSecundario mb-3">
                Tributação recolhida integralmente via DAS com alíquota única. Não transfere crédito integral e não se apropria de créditos amplos de insumos.
              </p>

              <div className="space-y-2 pt-2 border-t border-line text-[11px]">
                <div className="flex justify-between">
                  <span className="text-textoSecundario">Nível de Risco:</span>
                  <strong className={projUnificado.risco.nivel === 'Crítico' ? 'text-alerta' : 'text-textoPrimario'}>
                    {projUnificado.risco.nivel.toUpperCase()}
                  </strong>
                </div>

                <div className="flex justify-between">
                  <span className="text-textoSecundario">Menor Saldo:</span>
                  <strong className="text-textoPrimario">
                    R$ {projUnificado.cenarioBase.menorSaldo.toLocaleString('pt-BR')}
                  </strong>
                </div>

                <div className="flex justify-between">
                  <span className="text-textoSecundario">Meses Abaixo do Piso:</span>
                  <strong className="text-textoPrimario">
                    {projUnificado.cenarioBase.mesesAbaixoPiso} de 24
                  </strong>
                </div>

                <div className="flex justify-between">
                  <span className="text-textoSecundario">Choque no Split:</span>
                  <strong className="text-alerta">
                    -R$ {projUnificado.memoriaCalculo.choqueUnico.toLocaleString('pt-BR')}
                  </strong>
                </div>
              </div>

              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => onAplicarRegime('simples_unificado')}
                  className={`w-full py-1.5 text-xs font-bold transition-colors ${
                    empresa.regime === 'simples_unificado'
                      ? 'bg-line text-textoSecundario cursor-default'
                      : 'bg-acento text-black hover:opacity-90'
                  }`}
                >
                  {empresa.regime === 'simples_unificado' ? 'REGIME ATIVO' : 'ADOTAR SIMPLES UNIFICADO'}
                </button>
              </div>
            </div>

            {/* Coluna 2: Opção pelo Regime Regular CBS/IBS */}
            <div className={`p-4 ${empresa.regime === 'simples_regular' ? 'bg-superficieElevada border-2 border-acento' : 'bg-superficie'}`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-xs uppercase tracking-tight text-textoPrimario">
                  Opção CBS/IBS Regime Regular
                </h3>
                {empresa.regime === 'simples_regular' && (
                  <span className="px-1.5 py-0.5 text-[9px] bg-acento text-black font-bold">
                    ATUAL
                  </span>
                )}
              </div>

              <p className="text-[10px] text-textoSecundario mb-3">
                Permite apurar CBS/IBS fora do DAS no regime não-cumulativo pleno, transferindo e tomando créditos integrais nas compras de insumos.
              </p>

              <div className="space-y-2 pt-2 border-t border-line text-[11px]">
                <div className="flex justify-between">
                  <span className="text-textoSecundario">Nível de Risco:</span>
                  <strong className={projRegular.risco.nivel === 'Crítico' ? 'text-alerta' : 'text-textoPrimario'}>
                    {projRegular.risco.nivel.toUpperCase()}
                  </strong>
                </div>

                <div className="flex justify-between">
                  <span className="text-textoSecundario">Menor Saldo:</span>
                  <strong className="text-textoPrimario">
                    R$ {projRegular.cenarioBase.menorSaldo.toLocaleString('pt-BR')}
                  </strong>
                </div>

                <div className="flex justify-between">
                  <span className="text-textoSecundario">Meses Abaixo do Piso:</span>
                  <strong className="text-textoPrimario">
                    {projRegular.cenarioBase.mesesAbaixoPiso} de 24
                  </strong>
                </div>

                <div className="flex justify-between">
                  <span className="text-textoSecundario">Crédito Mensal Estimado:</span>
                  <strong className="text-confirmacao">
                    +R$ {projRegular.memoriaCalculo.creditoMensal.toLocaleString('pt-BR')}
                  </strong>
                </div>
              </div>

              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => onAplicarRegime('simples_regular')}
                  className={`w-full py-1.5 text-xs font-bold transition-colors ${
                    empresa.regime === 'simples_regular'
                      ? 'bg-line text-textoSecundario cursor-default'
                      : 'bg-acento text-black hover:opacity-90'
                  }`}
                >
                  {empresa.regime === 'simples_regular' ? 'REGIME ATIVO' : 'ADOTAR REGIME REGULAR'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

