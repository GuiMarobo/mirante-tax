import React, { useRef } from 'react';
import { Empresa, ParametrosGlobais } from '../types';
import { calcularProjecaoCompleta } from '../motor/motorCalculo';
import { X, Printer, FileText } from 'lucide-react';

interface RelatorioModalProps {
  empresa: Empresa;
  parametros: ParametrosGlobais;
  onFechar: () => void;
}

export const RelatorioModal: React.FC<RelatorioModalProps> = ({
  empresa,
  parametros,
  onFechar
}) => {
  const relatorioRef = useRef<HTMLDivElement>(null);
  const projecao = calcularProjecaoCompleta(
    empresa,
    parametros,
    empresa.alavancasAtivas || { reajustePreco: false, prorrogacaoFornecedor: false, corteCusto: false },
    24
  );

  const { memoriaCalculo, risco, alavancasInfo } = projecao;

  const handleImprimir = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-superficie border border-line rounded-xl w-full max-w-4xl max-h-[95vh] flex flex-col shadow-2xl print:max-h-none print:border-none print:shadow-none print:w-full print:rounded-none">
        {/* Cabeçalho do Modal (Oculto na Impressão) */}
        <div className="flex items-center justify-between p-4 border-b border-line print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-acento" />
            <h2 className="text-sm font-semibold text-textoPrimario">
              Relatório Executivo de Projeção de Capital de Giro
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleImprimir}
              className="px-3 py-1.5 rounded-lg bg-acento text-black font-semibold text-xs flex items-center gap-1.5 hover:opacity-90 transition-all shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / PDF</span>
            </button>

            <button
              type="button"
              onClick={onFechar}
              className="p-1.5 rounded-lg text-textoSecundario hover:text-textoPrimario hover:bg-superficieElevada transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Conteúdo do Relatório Formatado */}
        <div
          ref={relatorioRef}
          className="p-6 overflow-y-auto space-y-4 flex-1 text-textoPrimario font-mono print:p-0 print:text-black print:bg-white text-xs leading-relaxed"
        >
          {/* Cabeçalho do Laudo */}
          <div className="flex items-start justify-between border-b border-line pb-3">
            <div>
              <div className="text-lg font-bold uppercase tracking-wider text-acento print:text-black">
                MIRANTE TAX
              </div>
              <div className="text-[10px] text-textoSecundario uppercase print:text-gray-600">
                Ledger Labs · Avaliação Técnica de Impacto Tributário e Liquidez
              </div>
            </div>

            <div className="text-right text-[10px] text-textoSecundario print:text-gray-600">
              <div>Data: {new Date().toLocaleDateString('pt-BR')}</div>
              <div>Base: LC 214/2025</div>
            </div>
          </div>

          {/* Dados da Empresa em Bento Grid */}
          <div className="bg-superficieElevada/50 p-3 border border-line print:bg-gray-50 print:border-gray-300">
            <h3 className="uppercase font-bold text-acento text-[10px] tracking-wider mb-2 print:text-black">
              1. Identificação do Cliente
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div>
                <span className="text-textoSecundario block text-[9px] uppercase print:text-gray-500">Razão Social:</span>
                <strong className="text-textoPrimario print:text-black">{empresa.nome}</strong>
              </div>
              <div>
                <span className="text-textoSecundario block text-[9px] uppercase print:text-gray-500">CNAE / Ramo:</span>
                <strong className="text-textoPrimario print:text-black">{empresa.cnae} ({empresa.ramo})</strong>
              </div>
              <div>
                <span className="text-textoSecundario block text-[9px] uppercase print:text-gray-500">Faturamento:</span>
                <strong className="text-textoPrimario print:text-black">R$ {empresa.faturamentoMensal.toLocaleString('pt-BR')}</strong>
              </div>
              <div>
                <span className="text-textoSecundario block text-[9px] uppercase print:text-gray-500">Regime:</span>
                <strong className="text-textoPrimario uppercase print:text-black">{empresa.regime.replace('_', ' ')}</strong>
              </div>
            </div>
          </div>

          {/* Veredito e Classificação de Risco */}
          <div className="p-3 border border-line bg-superficieElevada/30 print:bg-gray-50 print:border-gray-300 space-y-1.5">
            <div className="flex items-center justify-between">
              <h3 className="uppercase font-bold text-[10px] tracking-wider text-textoPrimario print:text-black">
                2. Diagnóstico Executivo de Risco
              </h3>
              <span className={`px-2 py-0.5 font-bold text-[10px] ${
                risco.nivel === 'Crítico' ? 'bg-alerta text-white print:bg-red-600' :
                risco.nivel === 'Alto' ? 'bg-amber-500 text-black print:bg-amber-500' :
                'bg-confirmacao text-white print:bg-green-600'
              }`}>
                RISCO: {risco.nivel.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-textoSecundario print:text-gray-700">
              {risco.motivo}. A empresa apresenta descasamento de ciclo de <strong>{memoriaCalculo.descasamentoCiclo} dias</strong> e retenção imediata de <strong>R$ {memoriaCalculo.retidoNoSplit.toLocaleString('pt-BR')}/mês</strong> com o Split Payment.
            </p>
          </div>

          {/* Memória de Cálculo Auditável */}
          <div>
            <h3 className="uppercase font-bold text-acento text-[10px] tracking-wider mb-2 print:text-black">
              3. Memória de Cálculo Auditável (Blocos A, B e C)
            </h3>
            <table className="w-full text-left text-xs border border-line print:border-gray-300">
              <thead className="bg-superficieElevada print:bg-gray-100 border-b border-line print:border-gray-300 text-[9px] uppercase text-textoSecundario">
                <tr>
                  <th className="p-2">Variável</th>
                  <th className="p-2">Fórmula Aplicada</th>
                  <th className="p-2 text-right">Valor Calculado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line print:divide-gray-200">
                <tr>
                  <td className="p-2 font-bold">Débito Bruto Mensal</td>
                  <td className="p-2 text-textoSecundario print:text-gray-600">{memoriaCalculo.formulas.debitoBruto}</td>
                  <td className="p-2 text-right font-bold">R$ {memoriaCalculo.debitoBruto.toLocaleString('pt-BR')}</td>
                </tr>
                <tr>
                  <td className="p-2 font-bold">Retido no Split (Float Perdido)</td>
                  <td className="p-2 text-textoSecundario print:text-gray-600">{memoriaCalculo.formulas.retidoNoSplit}</td>
                  <td className="p-2 text-right font-bold text-alerta print:text-red-700">R$ {memoriaCalculo.retidoNoSplit.toLocaleString('pt-BR')}</td>
                </tr>
                <tr>
                  <td className="p-2 font-bold">Crédito Mensal de Insumos</td>
                  <td className="p-2 text-textoSecundario print:text-gray-600">{memoriaCalculo.formulas.creditoMensal}</td>
                  <td className="p-2 text-right font-bold">R$ {memoriaCalculo.creditoMensal.toLocaleString('pt-BR')}</td>
                </tr>
                <tr>
                  <td className="p-2 font-bold">Capital Preso no Ciclo ({parametros.prazoRecuperacaoCredito}d)</td>
                  <td className="p-2 text-textoSecundario print:text-gray-600">{memoriaCalculo.formulas.capitalPreso}</td>
                  <td className="p-2 text-right font-bold">R$ {memoriaCalculo.capitalPreso.toLocaleString('pt-BR')}</td>
                </tr>
                <tr className="bg-superficieElevada/40 print:bg-gray-100 font-bold">
                  <td className="p-2">Choque Único no Mês do Split</td>
                  <td className="p-2 text-textoSecundario print:text-gray-600">{memoriaCalculo.formulas.choqueUnico}</td>
                  <td className="p-2 text-right text-alerta print:text-red-700">R$ {memoriaCalculo.choqueUnico.toLocaleString('pt-BR')}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Alavancas Recomendadas com Prazos de Decisão */}
          <div>
            <h3 className="uppercase font-bold text-acento text-[10px] tracking-wider mb-2 print:text-black">
              4. Alavancas de Correção & Prazos-Limite de Decisão
            </h3>
            <div className="space-y-1.5">
              {alavancasInfo.map(alavanca => (
                <div
                  key={alavanca.id}
                  className="p-2 border border-line print:border-gray-300 flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-textoPrimario print:text-black text-xs">{alavanca.nome}</div>
                    <div className="text-[10px] text-textoSecundario print:text-gray-600">
                      Prazo Limite: <strong>{alavanca.prazoDecisaoData}</strong> ({alavanca.prazoDecisao})
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-confirmacao print:text-green-700 block">
                      +R$ {alavanca.impactoCalculado.toLocaleString('pt-BR')} {alavanca.impactoTipo === 'recorrente' ? '/mês' : 'pontual'}
                    </span>
                    <span className="text-[9px] text-textoSecundario print:text-gray-500">
                      {alavanca.ativa ? '✓ Ativada' : '○ Proposta'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Premissas Declaradas */}
          <div className="text-[9px] text-textoSecundario print:text-gray-500 pt-2 border-t border-line">
            <strong>Premissas:</strong> Alíquota CBS 8,8% (LC 214/2025), Split em Julho/2027, Prazo de recuperação de crédito de 60 dias. Estimativa determinística de suporte à decisão.
          </div>

          {/* Assinaturas */}
          <div className="pt-6 mt-4 border-t border-line print:border-gray-400 grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 text-center text-xs">
            <div>
              <div className="border-t border-line/80 print:border-gray-500 pt-1.5 w-48 mx-auto">
                <div className="font-bold print:text-black">Responsável Técnico</div>
                <div className="text-[9px] text-textoSecundario print:text-gray-500">CRC / Escritório Contábil</div>
              </div>
            </div>

            <div>
              <div className="border-t border-line/80 print:border-gray-500 pt-1.5 w-48 mx-auto">
                <div className="font-bold print:text-black">Representante Legal</div>
                <div className="text-[9px] text-textoSecundario print:text-gray-500">{empresa.nome}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

