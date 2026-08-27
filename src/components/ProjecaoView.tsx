import React, { useState } from 'react';
import { Empresa, ParametrosGlobais, AlavancasAtivas } from '../types';
import { calcularProjecaoCompleta } from '../motor/motorCalculo';
import { GraficoProjecao } from './GraficoProjecao';
import { MemoriaCalculoCard } from './MemoriaCalculoCard';
import { PainelAlavancas } from './PainelAlavancas';
import { VereditoCard } from './VereditoCard';
import { ArrowLeft, Edit3, FileText, ArrowRightLeft, Sparkles, Building2, Wallet, Calendar, AlertCircle } from 'lucide-react';

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

  return (
    <div className="space-y-4">
      {/* Bento Grid Header da Empresa & Ações Rápidas */}
      <div className="bg-superficie border border-line p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onVoltarCarteira}
              className="p-2 bg-superficieElevada border border-line text-textoSecundario hover:text-textoPrimario hover:border-acento transition-colors flex items-center gap-1.5 text-xs font-mono"
              title="Voltar para a Carteira"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>CARTEIRA</span>
            </button>

            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold uppercase tracking-tight text-textoPrimario">
                  {empresa.nome}
                </h1>
                <span className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase ${
                  risco.nivel === 'Crítico' ? 'bg-alerta/20 text-alerta border border-alerta/30' :
                  risco.nivel === 'Alto' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                  risco.nivel === 'Médio' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                  'bg-confirmacao/20 text-confirmacao border border-confirmacao/30'
                }`}>
                  RISCO {risco.nivel.toUpperCase()}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-textoSecundario font-mono mt-1">
                <span>CNAE {empresa.cnae}</span>
                <span>·</span>
                <span>{empresa.ramo}</span>
                <span>·</span>
                <span className="uppercase">{empresa.regime.replace('_', ' ')}</span>
                <span>·</span>
                <span className="uppercase">SAZONALIDADE: {empresa.perfilSazonal}</span>
              </div>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            <button
              type="button"
              onClick={() => onAbrirComparativoRegimes(empresa)}
              className="px-3 py-1.5 bg-superficieElevada border border-line text-textoPrimario hover:border-acento transition-colors flex items-center gap-1.5"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-acento" />
              <span>COMPARAR REGIMES</span>
            </button>

            <button
              type="button"
              onClick={() => onEditarEmpresa(empresa)}
              className="px-3 py-1.5 bg-superficieElevada border border-line text-textoPrimario hover:border-acento transition-colors flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5 text-textoSecundario" />
              <span>PARÂMETROS</span>
            </button>

            <button
              type="button"
              onClick={() => onAbrirRelatorio(empresa)}
              className="px-3 py-1.5 bg-acento text-black font-bold hover:opacity-90 transition-opacity flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>RELATÓRIO PDF</span>
            </button>
          </div>
        </div>

        {/* Linha de Indicadores Operacionais em Grid Bento */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1 bg-line p-1 mt-4">
          <div className="bg-superficie p-3">
            <span className="text-[9px] font-mono uppercase tracking-wider text-textoSecundario block">Faturamento Mensal</span>
            <span className="text-sm font-mono font-bold text-textoPrimario mt-0.5 block">
              R$ {empresa.faturamentoMensal.toLocaleString('pt-BR')}
            </span>
          </div>

          <div className="bg-superficie p-3">
            <span className="text-[9px] font-mono uppercase tracking-wider text-textoSecundario block">Caixa Inicial</span>
            <span className="text-sm font-mono font-bold text-textoPrimario mt-0.5 block">
              R$ {empresa.caixaAtual.toLocaleString('pt-BR')}
            </span>
          </div>

          <div className="bg-superficie p-3">
            <span className="text-[9px] font-mono uppercase tracking-wider text-textoSecundario block">Piso Operacional</span>
            <span className="text-sm font-mono font-bold text-alerta mt-0.5 block">
              R$ {memoriaCalculo.pisoOperacional.toLocaleString('pt-BR')}
            </span>
          </div>

          <div className="bg-superficie p-3">
            <span className="text-[9px] font-mono uppercase tracking-wider text-textoSecundario block">Descasamento Ciclo</span>
            <span className={`text-sm font-mono font-bold mt-0.5 block ${memoriaCalculo.descasamentoCiclo > 15 ? 'text-alerta' : 'text-textoPrimario'}`}>
              {memoriaCalculo.descasamentoCiclo > 0 ? `+${memoriaCalculo.descasamentoCiclo}` : memoriaCalculo.descasamentoCiclo} dias
            </span>
          </div>

          <div className="bg-superficie p-3">
            <span className="text-[9px] font-mono uppercase tracking-wider text-textoSecundario block">Exposição ao Split</span>
            <span className="text-sm font-mono font-bold text-acento mt-0.5 block">
              {memoriaCalculo.mixExpostoSplit}%
            </span>
          </div>

          <div className="bg-superficie p-3">
            <span className="text-[9px] font-mono uppercase tracking-wider text-textoSecundario block">Fornecedor em Risco</span>
            <span className="text-sm font-mono font-bold text-textoPrimario mt-0.5 block">
              {empresa.fornecedoresRisco}%
            </span>
          </div>
        </div>
      </div>

      {/* BLOCO 1: Curva de Projeção Interativa */}
      <div className="space-y-4">
        <GraficoProjecao
          projecao={projecao}
          horizonteMeses={horizonteMeses}
          onMudarHorizonte={setHorizonteMeses}
          modoEscuro={modoEscuro}
        />
      </div>

      {/* BLOCO 2: Veredito Executivo do Escritório */}
      <VereditoCard
        projecao={projecao}
        empresa={empresa}
      />

      {/* BLOCO 3: Painel de Alavancas de Correção */}
      <PainelAlavancas
        alavancas={projecao.alavancasInfo}
        alavancasAtivas={alavancasAtivas}
        onToggleAlavanca={handleToggleAlavanca}
        projecao={projecao}
      />

      {/* BLOCO 4: Memória de Cálculo Auditável */}
      <MemoriaCalculoCard
        memoria={memoriaCalculo}
        empresa={empresa}
        parametros={parametros}
      />

      {/* Premissas e Declaração de Risco */}
      <div className="bg-superficie border border-line p-5">
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle className="w-4 h-4 text-acento" />
          <h4 className="text-xs font-mono uppercase tracking-wider font-bold text-textoPrimario">
            Premissas do Modelo e Lacunas Declaradas (Auditabilidade)
          </h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1 bg-line p-1">
          {projecao.premissas.map((prem, idx) => (
            <div key={idx} className="bg-superficie p-3 text-xs font-mono">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-textoPrimario">{prem.nome}</span>
                <span className={`text-[9px] px-1 py-0.5 ${prem.validado ? 'bg-confirmacao/20 text-confirmacao' : 'bg-acento/20 text-acento'}`}>
                  {prem.validado ? 'OFICIAL' : 'PREMISSA'}
                </span>
              </div>
              <div className="text-acento font-bold">{prem.valorFormatado}</div>
              <div className="text-[10px] text-textoSecundario mt-1">{prem.nota}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

