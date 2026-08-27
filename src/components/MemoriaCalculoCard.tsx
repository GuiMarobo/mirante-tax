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
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Calculator className="w-4 h-4 text-acento" />
          <h3 className="text-xs font-semibold text-textoPrimario">
            Memória de Cálculo Determinística (Blocos A, B e C)
          </h3>
        </div>

        <span className="text-[10px] px-2 py-1 rounded-full bg-superficieElevada text-textoSecundario">
          Alíquota efetiva: <strong className="text-textoPrimario">{memoria.aliquotaEfetiva.toFixed(2)}%</strong>
        </span>
      </div>

      <div className="overflow-x-auto rounded-lg border border-line">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-line text-textoSecundario text-[10px] uppercase bg-superficieElevada/60">
              <th className="py-2 px-3 font-medium">Bloco</th>
              <th className="py-2 px-3 font-medium">Variável / Indicador</th>
              <th className="py-2 px-3 font-medium">Fórmula com Valores Substituídos</th>
              <th className="py-2 px-3 font-medium text-right">Impacto Calculado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {itens.map((item, idx) => (
              <tr key={idx} className="hover:bg-superficieElevada/50 transition-colors">
                <td className="py-2.5 px-3 text-[10px] text-textoSecundario whitespace-nowrap">
                  <span className="px-1.5 py-0.5 rounded-full bg-superficieElevada">
                    {item.bloco}
                  </span>
                </td>
                <td className="py-2.5 px-3">
                  <div className="font-medium text-textoPrimario">{item.rotulo}</div>
                  <div className="text-[10px] text-textoSecundario leading-relaxed">{item.descricao}</div>
                </td>
                <td className="py-2.5 px-3 text-[11px] text-textoSecundario font-mono">
                  {item.formula}
                </td>
                <td className="py-2.5 px-3 text-right font-semibold text-xs font-mono">
                  <span className={item.corDestaque || 'text-textoPrimario'}>
                    {item.valorFormatado ? item.valorFormatado : `R$ ${Math.round(item.valor ?? 0).toLocaleString('pt-BR')}`}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex items-start gap-1.5 text-[11px] text-textoSecundario">
        <ShieldAlert className="w-3.5 h-3.5 text-alerta shrink-0 mt-0.5" />
        <span>O risco de caixa é proporcional ao <strong className="text-textoPrimario">descasamento de ciclo</strong> ({memoria.descasamentoCiclo}d) e ao <strong className="text-textoPrimario">float retido</strong>.</span>
      </div>
    </div>
  );
};

