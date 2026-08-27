import React from 'react';
import { AlavancaDetalhe, AlavancasAtivas, ProjecaoResultado } from '../types';
import { Sliders, AlertTriangle, Clock } from 'lucide-react';

interface PainelAlavancasProps {
  alavancas: AlavancaDetalhe[];
  alavancasAtivas: AlavancasAtivas;
  onToggleAlavanca: (id: keyof AlavancasAtivas) => void;
  projecao: ProjecaoResultado;
}

export const PainelAlavancas: React.FC<PainelAlavancasProps> = ({
  alavancas,
  alavancasAtivas,
  onToggleAlavanca,
  projecao
}) => {
  const mesCriticoRotulo = projecao.cenarioBase.primeiroCritico !== null
    ? projecao.cenarioBase.pontos[projecao.cenarioBase.primeiroCritico]?.rotulo
    : 'NENHUM';

  return (
    <div className="bg-superficie border border-line p-5 h-full flex flex-col justify-between">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-line">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-acento/10 text-acento">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-mono uppercase tracking-wider font-bold text-textoPrimario">
                Alavancas Estratégicas de Correção
              </h3>
              <p className="text-xs text-textoSecundario font-mono">
                Simule em tempo real. Cada alavanca possui um <strong>prazo-limite de decisão</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-superficieElevada px-2.5 py-1 border border-line">
            <Clock className="w-3.5 h-3.5 text-alerta" />
            <span className="text-xs font-mono">
              MÊS CRÍTICO: <strong className="text-alerta">{mesCriticoRotulo.toUpperCase()}</strong>
            </span>
          </div>
        </div>

        {/* Lista de Alavancas Bento */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {alavancas.map((alavanca) => {
            const isAtiva = !!alavancasAtivas[alavanca.id];
            const isUrgente = alavanca.venceAntesDoMesCritico;

            return (
              <div
                key={alavanca.id}
                className={`relative border p-4 transition-all duration-200 ${
                  isAtiva
                    ? 'bg-superficieElevada border-acento'
                    : 'bg-superficieElevada/40 border-line hover:border-line/80'
                }`}
              >
                {/* Header do Card com Toggle */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold uppercase tracking-tight text-textoPrimario">
                        {alavanca.nome}
                      </h4>
                      {isAtiva && (
                        <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold bg-acento text-black">
                          ATIVA
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-textoSecundario mt-0.5 font-mono">
                      {alavanca.descricao}
                    </p>
                  </div>

                  {/* Switch / Toggle Button */}
                  <button
                    type="button"
                    onClick={() => onToggleAlavanca(alavanca.id)}
                    aria-pressed={isAtiva}
                    className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      isAtiva ? 'bg-acento' : 'bg-line'
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-4 w-4 transform bg-black shadow ring-0 transition duration-200 ease-in-out ${
                        isAtiva ? 'translate-x-5' : 'translate-x-0 bg-white'
                      }`}
                    />
                  </button>
                </div>

                {/* Impacto Calculado */}
                <div className="mt-3 pt-3 border-t border-line flex items-baseline justify-between font-mono">
                  <span className="text-xs text-textoSecundario">Impacto em Caixa:</span>
                  <div className="text-right">
                    <span className="text-sm font-bold text-emerald-400">
                      +R$ {alavanca.impactoCalculado.toLocaleString('pt-BR')}
                    </span>
                    <span className="text-[10px] text-textoSecundario ml-1">
                      ({alavanca.impactoTipo === 'recorrente' ? '/mês' : 'pontual'})
                    </span>
                  </div>
                </div>

                {/* Prazo-Limite de Decisão */}
                <div
                  className={`mt-3 p-2.5 border text-xs font-mono flex items-start gap-2.5 ${
                    isUrgente
                      ? 'bg-alerta/10 border-alerta/40 text-alerta'
                      : 'bg-superficie border-line text-textoSecundario'
                  }`}
                >
                  <Clock className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${isUrgente ? 'text-alerta' : 'text-textoSecundario'}`} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold uppercase tracking-wider text-[10px]">
                        PRAZO LIMITE: {alavanca.prazoDecisaoData}
                      </span>
                      {isUrgente && (
                        <span className="bg-alerta text-white text-[9px] px-1 py-0.5 font-bold uppercase tracking-wider">
                          Vence Antes da Crise
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] mt-0.5 opacity-90">
                      {alavanca.prazoDecisao}
                    </div>
                  </div>
                </div>

                {/* Custo Associado */}
                <div className="mt-2 text-[10px] font-mono text-textoSecundario flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span className="truncate">{alavanca.custoAssociado}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

