import React from 'react';
import { MemoriaCalculo, Empresa, ParametrosGlobais } from '../types';
import { Calculator, ShieldAlert } from 'lucide-react';

interface MemoriaCalculoCardProps {
  memoria: MemoriaCalculo;
  empresa: Empresa;
  parametros: ParametrosGlobais;
}

export const MemoriaCalculoCard: React.FC<MemoriaCalculoCardProps> = ({
  memoria,
  empresa,
  parametros
}) => {
  const itens = [
    {
      bloco: 'Bloco A',
      rotulo: 'Débito Bruto Mensal',
      valor: memoria.debitoBruto,
      formula: memoria.formulas.debitoBruto,
      descricao: 'Total apurado de CBS sobre as vendas brutas da empresa.',
      destaque: false,
    },
    {
      bloco: 'Bloco A',
      rotulo: 'Float Tributário Perdido (Retido no Split)',
      valor: memoria.retidoNoSplit,
      formula: `${memoria.formulas.retidoNoSplit} = ${empresa.mixBoleto + empresa.mixPix + empresa.mixCartao}% (Boleto+Pix+Cartão)`,
      descricao: 'Dinheiro que transitava pelo caixa e agora é segregado na liquidação.',
      destaque: true,
      corDestaque: 'text-alerta',
    },
    {
      bloco: 'Bloco B',
      rotulo: 'Crédito Mensal de Insumos',
      valor: memoria.creditoMensal,
      formula: memoria.formulas.creditoMensal,
      descricao: 'Direito a crédito gerado nas compras de fornecedores.',
      destaque: false,
    },
    {
      bloco: 'Bloco B',
      rotulo: 'Capital Preso no Ciclo de Crédito',
      valor: memoria.capitalPreso,
      formula: memoria.formulas.capitalPreso,
      descricao: `Crédito imobilizado durante o prazo de apuração (${parametros.prazoRecuperacaoCredito} dias).`,
      destaque: true,
      corDestaque: 'text-acento',
    },
    {
      bloco: 'Consolidação',
      rotulo: 'Choque Único no Mês do Split',
      valor: memoria.choqueUnico,
      formula: memoria.formulas.choqueUnico,
      descricao: 'Impacto pontual imediato no mês de entrada do Split Payment.',
      destaque: true,
      corDestaque: 'text-alerta font-bold',
    },
    {
      bloco: 'Bloco C',
      rotulo: 'Crédito Não Realizado (Risco Fornecedor)',
      valor: memoria.creditoPerdido,
      formula: memoria.formulas.creditoPerdido,
      descricao: `Perda recorrente por inadimplência fiscal de parceiros (${empresa.fornecedoresRisco}%).`,
      destaque: false,
    },
    {
      bloco: 'Operação',
      rotulo: 'Geração Operacional de Caixa',
      valor: memoria.geracaoCaixaMensal,
      formula: memoria.formulas.geracaoCaixa,
      descricao: 'Resultado mensal líquido antes da entrada do novo regime.',
      destaque: false,
    },
    {
      bloco: 'Ciclo',
      rotulo: 'Descasamento de Ciclo Financeiro',
      valorFormatado: `${memoria.descasamentoCiclo > 0 ? '+' : ''}${memoria.descasamentoCiclo} dias`,
      formula: `${empresa.prazoRecebimento}d (Recebimento) - ${empresa.prazoPagamento}d (Pagamento)`,
      descricao: 'Diferença entre o tempo de receber dos clientes e pagar fornecedores.',
      destaque: memoria.descasamentoCiclo > 15,
      corDestaque: 'text-alerta',
    }
  ];

  return (
    <div className="bg-superficie border border-line p-5 h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-line">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-acento/10 text-acento">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-mono uppercase tracking-wider font-bold text-textoPrimario">
                Memória de Cálculo Determinística
              </h3>
              <p className="text-xs text-textoSecundario font-mono">
                Todas as etapas auditáveis com substituição explícita de fórmulas (Blocos A, B e C)
              </p>
            </div>
          </div>

          <span className="text-[10px] font-mono px-2 py-1 bg-superficieElevada border border-line text-textoSecundario">
            ALÍQUOTA EFETIVA: <strong className="text-textoPrimario">{memoria.aliquotaEfetiva.toFixed(2)}%</strong>
          </span>
        </div>

        {/* Grid de Memória de Cálculo Bento */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-line text-textoSecundario font-mono text-[10px] uppercase">
                <th className="pb-2 font-medium">Bloco</th>
                <th className="pb-2 font-medium">Variável / Indicador</th>
                <th className="pb-2 font-medium">Fórmula com Valores Substituídos</th>
                <th className="pb-2 font-medium text-right">Impacto Calculado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line font-mono">
              {itens.map((item, idx) => (
                <tr key={idx} className="hover:bg-superficieElevada/50 transition-colors">
                  <td className="py-2.5 pr-2 text-[10px] text-textoSecundario">
                    <span className="px-1.5 py-0.5 bg-superficieElevada border border-line uppercase">
                      {item.bloco}
                    </span>
                  </td>
                  <td className="py-2.5 pr-4">
                    <div className="font-semibold text-textoPrimario">{item.rotulo}</div>
                    <div className="text-[10px] text-textoSecundario font-sans leading-relaxed">{item.descricao}</div>
                  </td>
                  <td className="py-2.5 pr-4 text-[11px] text-textoSecundario bg-superficieElevada/40 px-2">
                    {item.formula}
                  </td>
                  <td className="py-2.5 pl-2 text-right font-bold text-xs">
                    <span className={item.corDestaque || 'text-textoPrimario'}>
                      {item.valorFormatado ? item.valorFormatado : `R$ ${Math.round(item.valor ?? 0).toLocaleString('pt-BR')}`}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-line flex flex-wrap items-center justify-between gap-3 text-[11px] text-textoSecundario font-mono">
        <div className="flex items-center gap-1.5">
          <ShieldAlert className="w-4 h-4 text-alerta shrink-0" />
          <span>O risco de caixa é proporcional ao <strong>descasamento de ciclo</strong> ({memoria.descasamentoCiclo}d) e ao <strong>float retido</strong>.</span>
        </div>
        <div className="text-[10px] text-acento">
          LC 214/2025 · MOTOR DETERMINÍSTICO AUDITÁVEL
        </div>
      </div>
    </div>
  );
};

