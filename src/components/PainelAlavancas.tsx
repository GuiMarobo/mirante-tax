import React, { useState } from 'react';
import { AlavancaDetalhe, AlavancasAtivas, ProjecaoResultado } from '../types';
import { Sliders, AlertTriangle, Clock, ChevronDown } from 'lucide-react';

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
  const [expandidas, setExpandidas] = useState<Set<string>>(new Set());

  const mesCriticoRotulo = projecao.cenarioBase.primeiroCritico !== null
    ? projecao.cenarioBase.pontos[projecao.cenarioBase.primeiroCritico]?.rotulo
    : 'Nenhum';

  const toggleExpandir = (id: string) => {
    setExpandidas(prev => {
      const novo = new Set(prev);
      if (novo.has(id)) novo.delete(id);
      else novo.add(id);
      return novo;
    });
  };

  return (
    <div className="bg-superficie border border-line rounded-xl p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-acento/10 text-acento">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-textoPrimario">
              Alavancas Estratégicas de Correção
            </h3>
            <p className="text-xs text-textoSecundario">
              Simule em tempo real. Cada alavanca possui um prazo-limite de decisão.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-superficieElevada px-2.5 py-1 rounded-lg text-xs">
          <Clock className="w-3.5 h-3.5 text-alerta" />
          <span className="text-textoSecundario">Mês crítico: <strong className="text-alerta">{mesCriticoRotulo}</strong></span>
        </div>
      </div>

      <div className="space-y-2">
        {alavancas.map((alavanca) => {
          const isAtiva = !!alavancasAtivas[alavanca.id];
          const isUrgente = alavanca.venceAntesDoMesCritico;
          const isExpandida = expandidas.has(alavanca.id);

          return (
            <div
              key={alavanca.id}
              className={`rounded-lg border transition-colors ${
                isAtiva ? 'border-acento/40 bg-acento/[0.04]' : 'border-line bg-superficieElevada/30'
              }`}
            >
              <div className="flex items-center gap-3 p-3">
                <button
                  type="button"
                  onClick={() => onToggleAlavanca(alavanca.id)}
                  aria-pressed={isAtiva}
                  className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
                    isAtiva ? 'bg-acento' : 'bg-line'
                  }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                      isAtiva ? 'translate-x-[18px]' : 'translate-x-0.5'
                    }`}
                  />
                </button>

                <button
                  type="button"
                  onClick={() => toggleExpandir(alavanca.id)}
                  className="flex-1 min-w-0 text-left flex items-center gap-2"
                >
                  <span className="text-sm font-medium text-textoPrimario truncate">{alavanca.nome}</span>
                  {isUrgente && (
                    <span className="shrink-0 px-1.5 py-0.5 rounded-full bg-alerta/15 text-alerta text-[9px] font-semibold uppercase tracking-wide">
                      Prazo vence antes da crise
                    </span>
                  )}
                </button>

                <div className="text-right shrink-0">
                  <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                    +R$ {alavanca.impactoCalculado.toLocaleString('pt-BR')}
                  </span>
                  <span className="text-[10px] text-textoSecundario ml-1">
                    ({alavanca.impactoTipo === 'recorrente' ? '/mês' : 'pontual'})
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => toggleExpandir(alavanca.id)}
                  className="shrink-0 p-1 text-textoSecundario hover:text-textoPrimario transition-colors"
                >
                  <ChevronDown className={`w-4 h-4 transition-transform ${isExpandida ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {isExpandida && (
                <div className="px-3 pb-3 pt-0 space-y-2 animar-expandir">
                  <p className="text-xs text-textoSecundario">{alavanca.descricao}</p>

                  <div
                    className={`p-2.5 rounded-lg text-xs flex items-start gap-2.5 ${
                      isUrgente ? 'bg-alerta/10 text-alerta' : 'bg-superficieElevada text-textoSecundario'
                    }`}
                  >
                    <Clock className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${isUrgente ? 'text-alerta' : 'text-textoSecundario'}`} />
                    <div>
                      <div className="font-semibold text-[11px]">Prazo limite: {alavanca.prazoDecisaoData}</div>
                      <div className="text-[11px] mt-0.5 opacity-90">{alavanca.prazoDecisao}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-1.5 text-[11px] text-textoSecundario">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <span>{alavanca.custoAssociado}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
