import React, { useState } from 'react';
import { Empresa, ParametrosGlobais, AlavancasAtivas } from '../types';
import { calcularProjecaoCompleta } from '../motor/motorCalculo';
import { GraficoProjecao } from './GraficoProjecao';
import { MemoriaCalculoCard } from './MemoriaCalculoCard';
import { PainelAlavancas } from './PainelAlavancas';
import { VereditoCard } from './VereditoCard';
import { ComparativoAnualModal } from './ComparativoAnualModal';
import { ArrowLeft, Edit3, FileText, ArrowRightLeft, ChevronDown, ClipboardList, CalendarRange } from 'lucide-react';

interface ProjecaoViewProps {
  empresa: Empresa;
  parametros: ParametrosGlobais;
  onVoltarCarteira: () => void;
  onEditarEmpresa: (empresa: Empresa) => void;
  onAbrirRelatorio: (empresa: Empresa) => void;
  onAbrirComparativoRegimes: (empresa: Empresa) => void;
  onAtualizarAlavancasEmpresa: (empresaId: string, alavancas: AlavancasAtivas) => void;
  modoEscuro: boolean;
}

const CORES_RISCO: Record<string, string> = {
  'Crítico': 'text-red-700 dark:text-red-400 bg-red-500/10',
  'Alto': 'text-amber-700 dark:text-amber-400 bg-amber-500/10',
  'Médio': 'text-yellow-700 dark:text-yellow-400 bg-yellow-500/10',
  'Baixo': 'text-emerald-700 dark:text-emerald-400 bg-emerald-500/10',
};

export const ProjecaoView: React.FC<ProjecaoViewProps> = ({
  empresa,
  parametros,
  onVoltarCarteira,
  onEditarEmpresa,
  onAbrirRelatorio,
  onAbrirComparativoRegimes,
  onAtualizarAlavancasEmpresa,
  modoEscuro
}) => {
  const [horizonteMeses, setHorizonteMeses] = useState<number>(24);
  const [auditoriaAberta, setAuditoriaAberta] = useState(false);
  const [comparativoAnualAberto, setComparativoAnualAberto] = useState(false);
  const alavancasAtivas = empresa.alavancasAtivas || {
    reajustePreco: false,
    prorrogacaoFornecedor: false,
    corteCusto: false,
    opcaoRegimeRegular: false,
  };

  const projecao = calcularProjecaoCompleta(empresa, parametros, alavancasAtivas, horizonteMeses);

  const handleToggleAlavanca = (id: keyof AlavancasAtivas) => {
    const novasAlavancas = {
      ...alavancasAtivas,
      [id]: !alavancasAtivas[id]
    };
    onAtualizarAlavancasEmpresa(empresa.id, novasAlavancas);
  };

  const { memoriaCalculo, risco } = projecao;

  const indicadores = [
    { label: 'Faturamento Mensal', valor: `R$ ${empresa.faturamentoMensal.toLocaleString('pt-BR')}` },
    { label: 'Caixa Inicial', valor: `R$ ${empresa.caixaAtual.toLocaleString('pt-BR')}` },
    { label: 'Piso Operacional', valor: `R$ ${memoriaCalculo.pisoOperacional.toLocaleString('pt-BR')}`, destaque: 'alerta' as const },
    { label: 'Descasamento Ciclo', valor: `${memoriaCalculo.descasamentoCiclo > 0 ? '+' : ''}${memoriaCalculo.descasamentoCiclo}d`, destaque: memoriaCalculo.descasamentoCiclo > 15 ? 'alerta' as const : undefined },
    { label: 'Exposição ao Split', valor: `${memoriaCalculo.mixExpostoSplit}%`, destaque: 'acento' as const },
    { label: 'Fornecedor em Risco', valor: `${empresa.fornecedoresRisco}%` },
  ];

  return (
    <div className="space-y-5">
      {/* Cabeçalho */}
      <div>
        <button
          type="button"
          onClick={onVoltarCarteira}
          className="text-xs text-textoSecundario hover:text-textoPrimario transition-colors flex items-center gap-1.5 mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Carteira</span>
        </button>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-semibold text-textoPrimario">{empresa.nome}</h1>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${CORES_RISCO[risco.nivel]}`}>
              Risco {risco.nivel}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setComparativoAnualAberto(true)}
              className="px-3 py-1.5 bg-superficie border border-line rounded-lg text-xs text-textoPrimario hover:border-acento/50 transition-colors flex items-center gap-1.5"
            >
              <CalendarRange className="w-3.5 h-3.5 text-acento" />
              <span>Comparativo Anual</span>
            </button>
            <button
              type="button"
              onClick={() => onAbrirComparativoRegimes(empresa)}
              className="px-3 py-1.5 bg-superficie border border-line rounded-lg text-xs text-textoPrimario hover:border-acento/50 transition-colors flex items-center gap-1.5"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-acento" />
              <span>Comparar Regimes</span>
            </button>
            <button
              type="button"
              onClick={() => onEditarEmpresa(empresa)}
              className="px-3 py-1.5 bg-superficie border border-line rounded-lg text-xs text-textoPrimario hover:border-acento/50 transition-colors flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5 text-textoSecundario" />
              <span>Parâmetros</span>
            </button>
            <button
              type="button"
              onClick={() => onAbrirRelatorio(empresa)}
              className="px-3 py-1.5 bg-acento text-black rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-sm"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Relatório PDF</span>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-xs text-textoSecundario mt-1.5">
          <span>CNAE {empresa.cnae}</span>
          <span>·</span>
          <span>{empresa.ramo}</span>
          <span>·</span>
          <span className="capitalize">{empresa.regime.replace('_', ' ')}</span>
          <span>·</span>
          <span className="capitalize">Sazonalidade: {empresa.perfilSazonal}</span>
        </div>
      </div>

      {/* Indicadores rápidos */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {indicadores.map((item, idx) => (
          <div key={idx} className="bg-superficie border border-line rounded-xl p-3">
            <span className="text-[10px] text-textoSecundario block">{item.label}</span>
            <span className={`text-sm font-semibold mt-0.5 block ${
              item.destaque === 'alerta' ? 'text-alerta' : item.destaque === 'acento' ? 'text-acento' : 'text-textoPrimario'
            }`}>
              {item.valor}
            </span>
          </div>
        ))}
      </div>

      {/* Curva de Projeção */}
      <GraficoProjecao
        projecao={projecao}
        horizonteMeses={horizonteMeses}
        onMudarHorizonte={setHorizonteMeses}
        modoEscuro={modoEscuro}
      />

      {/* Veredito */}
      <VereditoCard projecao={projecao} empresa={empresa} />

      {/* Alavancas */}
      <PainelAlavancas
        alavancas={projecao.alavancasInfo}
        alavancasAtivas={alavancasAtivas}
        onToggleAlavanca={handleToggleAlavanca}
        projecao={projecao}
      />

      {/* Auditoria: Memória de Cálculo + Premissas (colapsado por padrão) */}
      <div className="bg-superficie border border-line rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={() => setAuditoriaAberta(v => !v)}
          className="w-full flex items-center justify-between gap-3 p-4 hover:bg-superficieElevada/50 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <ClipboardList className="w-4 h-4 text-acento" />
            <div className="text-left">
              <div className="text-sm font-medium text-textoPrimario">Memória de Cálculo e Premissas Declaradas</div>
              <div className="text-[11px] text-textoSecundario">Auditoria completa das fórmulas aplicadas e lacunas do modelo</div>
            </div>
          </div>
          <ChevronDown className={`w-4 h-4 text-textoSecundario shrink-0 transition-transform ${auditoriaAberta ? 'rotate-180' : ''}`} />
        </button>

        {auditoriaAberta && (
          <div className="border-t border-line p-4 space-y-4 animar-expandir">
            <MemoriaCalculoCard memoria={memoriaCalculo} empresa={empresa} parametros={parametros} />

            <div>
              <h4 className="text-xs font-semibold text-textoPrimario mb-2">Premissas do Modelo e Lacunas Declaradas</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {projecao.premissas.map((prem, idx) => (
                  <div key={idx} className="bg-superficieElevada rounded-lg p-3 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-textoPrimario">{prem.nome}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${prem.validado ? 'bg-confirmacao/15 text-confirmacao' : 'bg-acento/15 text-acento'}`}>
                        {prem.validado ? 'Oficial' : 'Premissa'}
                      </span>
                    </div>
                    <div className="text-acento font-semibold">{prem.valorFormatado}</div>
                    <div className="text-[10px] text-textoSecundario mt-1">{prem.nota}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {comparativoAnualAberto && (
        <ComparativoAnualModal
          empresa={empresa}
          parametros={parametros}
          alavancasAtivas={alavancasAtivas}
          onFechar={() => setComparativoAnualAberto(false)}
        />
      )}
    </div>
  );
};
