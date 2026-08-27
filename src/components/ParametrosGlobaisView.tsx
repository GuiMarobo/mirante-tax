import React, { useState } from 'react';
import { ParametrosGlobais } from '../types';
import { Settings, Save, AlertTriangle, ShieldCheck, RotateCcw, ChevronDown } from 'lucide-react';

interface ParametrosGlobaisViewProps {
  parametros: ParametrosGlobais;
  onSalvarParametros: (novos: ParametrosGlobais) => void;
  onRestaurarPadrao: () => void;
}

export const ParametrosGlobaisView: React.FC<ParametrosGlobaisViewProps> = ({
  parametros,
  onSalvarParametros,
  onRestaurarPadrao
}) => {
  const [formState, setFormState] = useState<ParametrosGlobais>(parametros);
  const [salvoFeedback, setSalvoFeedback] = useState(false);
  const [premissasAbertas, setPremissasAbertas] = useState(false);

  const handleChange = (campo: keyof ParametrosGlobais, valor: any) => {
    setFormState(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    onSalvarParametros(formState);
    setSalvoFeedback(true);
    setTimeout(() => setSalvoFeedback(false), 3000);
  };

  return (
    <div className="space-y-4">
      {/* Bento Header */}
      <div className="bg-superficie border border-line rounded-xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-acento/10 text-acento">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-textoPrimario">
                Parâmetros Globais do Modelo & Premissas Normativas
              </h1>
              <p className="text-xs text-textoSecundario">
                Premissas compartilhadas por todas as projeções da carteira · Versão 1.0 (LC 214/2025)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onRestaurarPadrao}
            className="px-3 py-1.5 bg-superficieElevada border border-line rounded-lg text-xs text-textoSecundario hover:text-textoPrimario hover:border-acento transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restaurar padrão</span>
          </button>
        </div>

        {/* Formulário de Parâmetros em Grid Bento */}
        <form onSubmit={handleSalvar} className="space-y-4 text-xs font-mono">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* 1. Alíquota Referência CBS */}
            <div className="bg-superficieElevada/40 border border-line rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-textoPrimario text-[11px] uppercase">Alíquota CBS (%)</span>
                <span className="px-1.5 py-0.5 rounded-full bg-confirmacao/20 text-confirmacao text-[9px] font-bold">
                  OFICIAL
                </span>
              </div>
              <input
                type="number"
                step="0.1"
                min="0"
                max="30"
                value={formState.aliquotaReferenciaCBS}
                onChange={(e) => handleChange('aliquotaReferenciaCBS', Number(e.target.value))}
                className="w-full px-2.5 py-1.5 bg-superficie border border-line rounded-lg text-textoPrimario focus:outline-none focus:border-acento text-xs"
              />
              <div className="text-[10px] text-textoSecundario">
                Origem: <strong>LC 214/2025</strong>
              </div>
            </div>

            {/* 2. Prazo de Recuperação do Crédito */}
            <div className="bg-superficieElevada/40 border border-line rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-textoPrimario text-[11px] uppercase">Recuperação Crédito</span>
                <span className="px-1.5 py-0.5 rounded-full bg-acento/20 text-acento text-[9px] font-bold">
                  PREMISSA
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="180"
                  value={formState.prazoRecuperacaoCredito}
                  onChange={(e) => handleChange('prazoRecuperacaoCredito', Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-superficie border border-line rounded-lg text-textoPrimario focus:outline-none focus:border-acento text-xs"
                />
                <span className="text-textoSecundario text-[10px]">dias</span>
              </div>
              <div className="text-[10px] text-textoSecundario">
                Requer validação contábil
              </div>
            </div>

            {/* 3. Mês de Entrada do Split */}
            <div className="bg-superficieElevada/40 border border-line rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-textoPrimario text-[11px] uppercase">Entrada do Split</span>
                <span className="px-1.5 py-0.5 rounded-full bg-acento/20 text-acento text-[9px] font-bold">
                  PREMISSA
                </span>
              </div>
              <input
                type="text"
                value={formState.dataEntradaSplitNome}
                onChange={(e) => handleChange('dataEntradaSplitNome', e.target.value)}
                className="w-full px-2.5 py-1.5 bg-superficie border border-line rounded-lg text-textoPrimario focus:outline-none focus:border-acento text-xs"
              />
              <div className="text-[10px] text-textoSecundario">
                Padrão: <strong>Julho/2027</strong>
              </div>
            </div>

            {/* 4. Intensidade Reajuste de Preço */}
            <div className="bg-superficieElevada/40 border border-line rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-textoPrimario text-[11px] uppercase">Reajuste Preço (%)</span>
                <span className="px-1.5 py-0.5 rounded-full bg-sky-500/20 text-sky-400 text-[9px] font-bold">
                  ALAVANCA
                </span>
              </div>
              <input
                type="number"
                step="0.1"
                min="0"
                max="20"
                value={formState.intensidadeReajustePreco}
                onChange={(e) => handleChange('intensidadeReajustePreco', Number(e.target.value))}
                className="w-full px-2.5 py-1.5 bg-superficie border border-line rounded-lg text-textoPrimario focus:outline-none focus:border-acento text-xs"
              />
              <div className="text-[10px] text-textoSecundario">
                Repasse médio: <strong>2,8%</strong>
              </div>
            </div>

            {/* 5. Dias de Prorrogação com Fornecedor */}
            <div className="bg-superficieElevada/40 border border-line rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-textoPrimario text-[11px] uppercase">Prazo Fornecedor</span>
                <span className="px-1.5 py-0.5 rounded-full bg-sky-500/20 text-sky-400 text-[9px] font-bold">
                  ALAVANCA
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={formState.diasProrrogacaoFornecedor}
                  onChange={(e) => handleChange('diasProrrogacaoFornecedor', Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-superficie border border-line rounded-lg text-textoPrimario focus:outline-none focus:border-acento text-xs"
                />
                <span className="text-textoSecundario text-[10px]">dias</span>
              </div>
              <div className="text-[10px] text-textoSecundario">
                Extensão: <strong>+15 dias</strong>
              </div>
            </div>

            {/* 6. Percentual de Corte de Custos */}
            <div className="bg-superficieElevada/40 border border-line rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-textoPrimario text-[11px] uppercase">Corte Custos (%)</span>
                <span className="px-1.5 py-0.5 rounded-full bg-sky-500/20 text-sky-400 text-[9px] font-bold">
                  ALAVANCA
                </span>
              </div>
              <input
                type="number"
                step="0.1"
                min="0"
                max="20"
                value={formState.percentualCorteCusto}
                onChange={(e) => handleChange('percentualCorteCusto', Number(e.target.value))}
                className="w-full px-2.5 py-1.5 bg-superficie border border-line rounded-lg text-textoPrimario focus:outline-none focus:border-acento text-xs"
              />
              <div className="text-[10px] text-textoSecundario">
                Racionalização: <strong>3,5%</strong>
              </div>
            </div>

            {/* 7. Desconto por Pontualidade Perdido */}
            <div className="bg-superficieElevada/40 border border-line rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-textoPrimario text-[11px] uppercase">Perda Pontualidade (%)</span>
                <span className="px-1.5 py-0.5 rounded-full bg-alerta/20 text-alerta text-[9px] font-bold">
                  CUSTO
                </span>
              </div>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={formState.descontoPontualidadePerdido}
                onChange={(e) => handleChange('descontoPontualidadePerdido', Number(e.target.value))}
                className="w-full px-2.5 py-1.5 bg-superficie border border-line rounded-lg text-textoPrimario focus:outline-none focus:border-acento text-xs"
              />
              <div className="text-[10px] text-textoSecundario">
                Custo de prorrogar: <strong>1,2%</strong>
              </div>
            </div>

            {/* 8. Maturação do Corte de Custos */}
            <div className="bg-superficieElevada/40 border border-line rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-textoPrimario text-[11px] uppercase">Maturação Corte</span>
                <span className="px-1.5 py-0.5 rounded-full bg-acento/20 text-acento text-[9px] font-bold">
                  PREMISSA
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="12"
                  value={formState.maturacaoCorteCusto}
                  onChange={(e) => handleChange('maturacaoCorteCusto', Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-superficie border border-line rounded-lg text-textoPrimario focus:outline-none focus:border-acento text-xs"
                />
                <span className="text-textoSecundario text-[10px]">meses</span>
              </div>
              <div className="text-[10px] text-textoSecundario">
                Efeito pleno em: <strong>4 meses</strong>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-line">
            <div className="text-xs text-confirmacao font-bold flex items-center gap-1.5">
              {salvoFeedback && (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Parâmetros globais atualizados e replicados para toda a carteira!</span>
                </>
              )}
            </div>

            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-acento text-black font-semibold flex items-center gap-2 hover:opacity-90 transition-all text-xs shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>Salvar parâmetros</span>
            </button>
          </div>
        </form>
      </div>

      {/* Premissas e Lacunas Declaradas (colapsado por padrão) */}
      <div className="bg-superficie border border-line rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={() => setPremissasAbertas(v => !v)}
          className="w-full flex items-center justify-between gap-3 p-4 hover:bg-superficieElevada/50 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <div className="text-left">
              <h2 className="text-sm font-medium text-textoPrimario">
                Declaração Formal de Premissas e Lacunas Conhecidas
              </h2>
              <p className="text-[11px] text-textoSecundario">
                Seção 8: "Declarar o que não se sabe é parte do produto."
              </p>
            </div>
          </div>
          <ChevronDown className={`w-4 h-4 text-textoSecundario shrink-0 transition-transform ${premissasAbertas ? 'rotate-180' : ''}`} />
        </button>

        {premissasAbertas && (
          <div className="border-t border-line p-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs animar-expandir">
            <div className="bg-superficieElevada/40 rounded-lg p-4 space-y-2">
              <h4 className="font-semibold text-textoPrimario flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                <span>8.1 Premissas sem Fonte Pública Oficial</span>
              </h4>
              <ul className="space-y-1 text-textoSecundario text-[11px] list-disc list-inside">
                <li><strong className="text-textoPrimario">Prazo de recuperação do crédito:</strong> 60 dias (requer validação empírica contábil).</li>
                <li><strong className="text-textoPrimario">Inadimplência fiscal de fornecedores:</strong> configurável (padrão 8%, informado pela empresa).</li>
                <li><strong className="text-textoPrimario">Maturação de corte de custos:</strong> 4 meses (requer calibragem empírica).</li>
                <li><strong className="text-textoPrimario">Perfis sazonais:</strong> normalizados para média 1,0 por setor.</li>
                <li><strong className="text-textoPrimario">Mês de entrada do Split:</strong> Julho de 2027 (fase de testes B2B).</li>
              </ul>
            </div>

            <div className="bg-superficieElevada/40 rounded-lg p-4 space-y-2">
              <h4 className="font-semibold text-textoPrimario flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-alerta"></span>
                <span>8.2 Não Modelado & Limitações</span>
              </h4>
              <ul className="space-y-1 text-textoSecundario text-[11px] list-disc list-inside">
                <li><strong className="text-textoPrimario">Elasticidade de preço:</strong> O modelo trata o reajuste sem retração de volume.</li>
                <li><strong className="text-textoPrimario">Procedimento de split:</strong> Utiliza o débito bruto direto sem compensações judiciais.</li>
                <li><strong className="text-textoPrimario">Mitigação:</strong> Motor determinístico versionado com saídas em faixas e recalibragem normativa.</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

