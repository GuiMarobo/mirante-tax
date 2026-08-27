import { Empresa } from '../types';

export function exportarCarteiraCSV(empresas: Empresa[]): void {
  const headers = [
    'ID',
    'Nome',
    'Ramo',
    'CNAE',
    'Regime',
    'Faturamento Mensal',
    'Compras Mensais',
    'Custo Operacional',
    'Carga Atual (%)',
    'Caixa Atual',
    'Prazo Recebimento (dias)',
    'Prazo Pagamento (dias)',
    'Mix Boleto (%)',
    'Mix Pix (%)',
    'Mix Cartao (%)',
    'Mix Faturado (%)',
    'Fornecedores Risco (%)',
    'Reducao Aliquota',
    'Perfil Sazonal',
    'Notas'
  ];

  const rows = empresas.map(e => [
    e.id,
    `"${e.nome.replace(/"/g, '""')}"`,
    `"${e.ramo.replace(/"/g, '""')}"`,
    e.cnae,
    e.regime,
    e.faturamentoMensal,
    e.comprasMensais,
    e.custoOperacional,
    e.cargaAtual,
    e.caixaAtual,
    e.prazoRecebimento,
    e.prazoPagamento,
    e.mixBoleto,
    e.mixPix,
    e.mixCartao,
    e.mixFaturado,
    e.fornecedoresRisco,
    e.reducaoAliquota,
    e.perfilSazonal,
    `"${(e.notas || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `mirante-tax-carteira-${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function parseCarteiraCSV(csvText: string): Empresa[] {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length <= 1) return [];

  const delimiter = lines[0].includes(';') ? ';' : ',';
  const empresas: Empresa[] = [];

  for (let i = 1; i < lines.length; i++) {
    const rawCols = lines[i].split(delimiter);
    if (rawCols.length < 10) continue;

    const cols = rawCols.map(c => c.replace(/^"|"$/g, '').trim());

    empresas.push({
      id: cols[0] || `emp-${Date.now()}-${i}`,
      nome: cols[1] || `Empresa ${i}`,
      ramo: cols[2] || 'Comércio Geral',
      cnae: cols[3] || '47.00-0-00',
      regime: (['simples_unificado', 'simples_regular', 'presumido', 'real'].includes(cols[4]) ? cols[4] : 'simples_unificado') as Empresa['regime'],
      faturamentoMensal: Number(cols[5]) || 100000,
      comprasMensais: Number(cols[6]) || 50000,
      custoOperacional: Number(cols[7]) || 30000,
      cargaAtual: Number(cols[8]) || 6.0,
      caixaAtual: Number(cols[9]) || 40000,
      prazoRecebimento: Number(cols[10]) || 30,
      prazoPagamento: Number(cols[11]) || 30,
      mixBoleto: Number(cols[12]) || 40,
      mixPix: Number(cols[13]) || 30,
      mixCartao: Number(cols[14]) || 20,
      mixFaturado: Number(cols[15]) || 10,
      fornecedoresRisco: Number(cols[16]) || 8,
      reducaoAliquota: (['cheia', 'red30', 'red60', 'zero', 'custom'].includes(cols[17]) ? cols[17] : 'cheia') as Empresa['reducaoAliquota'],
      perfilSazonal: (['varejo', 'estavel', 'industria', 'servicos', 'construcao', 'alimentacao', 'eletronicos', 'ecommerce'].includes(cols[18]) ? cols[18] : 'estavel') as Empresa['perfilSazonal'],
      notas: cols[19] || '',
      dataCriacao: new Date().toISOString().slice(0, 10),
      alavancasAtivas: {
        reajustePreco: false,
        prorrogacaoFornecedor: false,
        corteCusto: false,
      }
    });
  }

  return empresas;
}
