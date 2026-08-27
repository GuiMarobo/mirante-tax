import React, { useState } from 'react';
import { Empresa, RegimeTributario, ReducaoAliquota, PerfilSazonal } from '../types';
import { X, AlertTriangle, Save, Building } from 'lucide-react';

interface EmpresaModalProps {
  empresa: Empresa | null;
  onSalvar: (empresa: Empresa) => void;
  onFechar: () => void;
}

export const EmpresaModal: React.FC<EmpresaModalProps> = ({
  empresa,
  onSalvar,
  onFechar
}) => {
  const [nome, setNome] = useState(empresa?.nome || '');
  const [ramo, setRamo] = useState(empresa?.ramo || '');
  const [cnae, setCnae] = useState(empresa?.cnae || '47.00-0-00');
  const [regime, setRegime] = useState<RegimeTributario>(empresa?.regime || 'simples_unificado');
  const [faturamentoMensal, setFaturamentoMensal] = useState<number>(empresa?.faturamentoMensal || 200000);
  const [comprasMensais, setComprasMensais] = useState<number>(empresa?.comprasMensais || 130000);
  const [custoOperacional, setCustoOperacional] = useState<number>(empresa?.custoOperacional || 52000);
  const [cargaAtual, setCargaAtual] = useState<number>(empresa?.cargaAtual || 6.5);
  const [caixaAtual, setCaixaAtual] = useState<number>(empresa?.caixaAtual || 62000);
  const [prazoRecebimento, setPrazoRecebimento] = useState<number>(empresa?.prazoRecebimento || 45);
  const [prazoPagamento, setPrazoPagamento] = useState<number>(empresa?.prazoPagamento || 30);
  
  // Mix de Recebimento
  const [mixBoleto, setMixBoleto] = useState<number>(empresa?.mixBoleto || 40);
  const [mixPix, setMixPix] = useState<number>(empresa?.mixPix || 25);
  const [mixCartao, setMixCartao] = useState<number>(empresa?.mixCartao || 18);
  const [mixFaturado, setMixFaturado] = useState<number>(empresa?.mixFaturado || 17);

  const [fornecedoresRisco, setFornecedoresRisco] = useState<number>(empresa?.fornecedoresRisco || 8);
  const [reducaoAliquota, setReducaoAliquota] = useState<ReducaoAliquota>(empresa?.reducaoAliquota || 'cheia');
  const [aliquotaCustom, setAliquotaCustom] = useState<number>(empresa?.aliquotaCustom || 8.8);
  const [perfilSazonal, setPerfilSazonal] = useState<PerfilSazonal>(empresa?.perfilSazonal || 'varejo');
  const [notas, setNotas] = useState<string>(empresa?.notas || '');

  // Validação do Mix
  const somaMix = Number(mixBoleto) + Number(mixPix) + Number(mixCartao) + Number(mixFaturado);
  const mixValido = Math.abs(somaMix - 100) < 0.1;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;

    const novaEmpresa: Empresa = {
      id: empresa?.id || `emp-${Date.now()}`,
      nome: nome.trim(),
      ramo: ramo.trim() || 'Comércio Geral',
      cnae: cnae.trim(),
      regime,
      faturamentoMensal: Number(faturamentoMensal),
      comprasMensais: Number(comprasMensais),
      custoOperacional: Number(custoOperacional),
      cargaAtual: Number(cargaAtual),
      caixaAtual: Number(caixaAtual),
      prazoRecebimento: Number(prazoRecebimento),
      prazoPagamento: Number(prazoPagamento),
      mixBoleto: Number(mixBoleto),
      mixPix: Number(mixPix),
      mixCartao: Number(mixCartao),
      mixFaturado: Number(mixFaturado),
      fornecedoresRisco: Number(fornecedoresRisco),
      reducaoAliquota,
      aliquotaCustom: reducaoAliquota === 'custom' ? Number(aliquotaCustom) : undefined,
      perfilSazonal,
      notas,
      dataCriacao: empresa?.dataCriacao || new Date().toISOString().slice(0, 10),
      alavancasAtivas: empresa?.alavancasAtivas || {
        reajustePreco: false,
        prorrogacaoFornecedor: false,
        corteCusto: false,
      }
    };

    onSalvar(novaEmpresa);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-superficie border border-line rounded-xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl my-auto">
        {/* Cabeçalho do Modal */}
        <div className="flex items-center justify-between p-4 border-b border-line">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-acento/10 text-acento">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-textoPrimario">
                {empresa ? 'Editar Parâmetros da Empresa' : 'Cadastrar Nova Empresa'}
              </h2>
              <p className="text-[11px] text-textoSecundario">
                Parâmetros de entrada para o motor de projeção de capital de giro
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onFechar}
            className="p-1.5 rounded-lg text-textoSecundario hover:text-textoPrimario hover:bg-superficieElevada transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário com Scroll Interno */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Seção 1: Identificação */}
          <div className="space-y-2">
            <h3 className="font-semibold text-acento text-[11px] uppercase tracking-wide">
              01. Identificação & Regime
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div className="md:col-span-2">
                <label className="block text-textoSecundario text-[10px] uppercase mb-1">Nome / Razão Social *</label>
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Comercial Silva Ltda"
                  className="w-full px-2.5 py-1.5 bg-superficieElevada border border-line rounded-lg text-textoPrimario focus:outline-none focus:border-acento"
                />
              </div>

              <div>
                <label className="block text-textoSecundario text-[10px] uppercase mb-1">CNAE Principal</label>
                <input
                  type="text"
                  value={cnae}
                  onChange={(e) => setCnae(e.target.value)}
                  placeholder="Ex: 46.39-7-01"
                  className="w-full px-2.5 py-1.5 bg-superficieElevada border border-line rounded-lg text-textoPrimario focus:outline-none focus:border-acento"
                />
              </div>

              <div>
                <label className="block text-textoSecundario text-[10px] uppercase mb-1">Ramo de Atividade</label>
                <input
                  type="text"
                  value={ramo}
                  onChange={(e) => setRamo(e.target.value)}
                  placeholder="Ex: Varejo de Alimentos"
                  className="w-full px-2.5 py-1.5 bg-superficieElevada border border-line rounded-lg text-textoPrimario focus:outline-none focus:border-acento"
                />
              </div>

              <div>
                <label className="block text-textoSecundario text-[10px] uppercase mb-1">Regime Tributário</label>
                <select
                  value={regime}
                  onChange={(e) => setRegime(e.target.value as RegimeTributario)}
                  className="w-full px-2.5 py-1.5 bg-superficieElevada border border-line rounded-lg text-textoPrimario focus:outline-none focus:border-acento"
                >
                  <option value="simples_unificado">Simples Nacional (Unificado no DAS)</option>
                  <option value="simples_regular">Simples Nacional (Opção CBS/IBS Regular)</option>
                  <option value="presumido">Lucro Presumido</option>
                  <option value="real">Lucro Real</option>
                </select>
              </div>

              <div>
                <label className="block text-textoSecundario text-[10px] uppercase mb-1">Perfil Sazonal</label>
                <select
                  value={perfilSazonal}
                  onChange={(e) => setPerfilSazonal(e.target.value as PerfilSazonal)}
                  className="w-full px-2.5 py-1.5 bg-superficieElevada border border-line rounded-lg text-textoPrimario focus:outline-none focus:border-acento"
                >
                  <option value="varejo">Varejo (Concentração fim de ano)</option>
                  <option value="estavel">Estável (Linear anual)</option>
                  <option value="industria">Indústria (Picos 2º semestre)</option>
                  <option value="servicos">Serviços (Uniforme)</option>
                  <option value="construcao">Construção (Ciclos longos)</option>
                  <option value="alimentacao">Alimentação / Bares</option>
                  <option value="eletronicos">Eletrônicos (Black Friday)</option>
                  <option value="ecommerce">E-commerce</option>
                </select>
              </div>
            </div>
          </div>

          {/* Seção 2: Operação e Finanças */}
          <div className="space-y-2">
            <h3 className="font-semibold text-acento text-[11px] uppercase tracking-wide">
              02. Parâmetros Operacionais e Caixa
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              <div>
                <label className="block text-textoSecundario text-[10px] uppercase mb-1">Faturamento Mensal (R$)</label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={faturamentoMensal}
                  onChange={(e) => setFaturamentoMensal(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-superficieElevada border border-line rounded-lg text-textoPrimario focus:outline-none focus:border-acento"
                />
              </div>

              <div>
                <label className="block text-textoSecundario text-[10px] uppercase mb-1">Compras Mensais (R$)</label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={comprasMensais}
                  onChange={(e) => setComprasMensais(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-superficieElevada border border-line rounded-lg text-textoPrimario focus:outline-none focus:border-acento"
                />
              </div>

              <div>
                <label className="block text-textoSecundario text-[10px] uppercase mb-1">Custo Operacional (R$)</label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={custoOperacional}
                  onChange={(e) => setCustoOperacional(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-superficieElevada border border-line rounded-lg text-textoPrimario focus:outline-none focus:border-acento"
                />
              </div>

              <div>
                <label className="block text-textoSecundario text-[10px] uppercase mb-1">Caixa Atual (R$)</label>
                <input
                  type="number"
                  step="1000"
                  value={caixaAtual}
                  onChange={(e) => setCaixaAtual(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-superficieElevada border border-line rounded-lg text-textoPrimario focus:outline-none focus:border-acento"
                />
              </div>

              <div>
                <label className="block text-textoSecundario text-[10px] uppercase mb-1">Prazo Recebimento (dias)</label>
                <input
                  type="number"
                  min="0"
                  value={prazoRecebimento}
                  onChange={(e) => setPrazoRecebimento(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-superficieElevada border border-line rounded-lg text-textoPrimario focus:outline-none focus:border-acento"
                />
              </div>

              <div>
                <label className="block text-textoSecundario text-[10px] uppercase mb-1">Prazo Pagamento (dias)</label>
                <input
                  type="number"
                  min="0"
                  value={prazoPagamento}
                  onChange={(e) => setPrazoPagamento(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-superficieElevada border border-line rounded-lg text-textoPrimario focus:outline-none focus:border-acento"
                />
              </div>
            </div>
          </div>

          {/* Seção 3: Mix de Recebimento */}
          <div className="bg-superficieElevada/40 rounded-lg p-3 border border-line space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-acento text-[11px] uppercase tracking-wide">
                03. Mix de Liquidação (Exposição ao Split)
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-textoSecundario">Soma:</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  mixValido ? 'bg-confirmacao/20 text-confirmacao' : 'bg-alerta/20 text-alerta'
                }`}>
                  {somaMix}% {mixValido ? '✓' : '≠ 100%'}
                </span>
              </div>
            </div>

            {!mixValido && (
              <div className="p-2 rounded-lg bg-alerta/10 border border-alerta/30 text-alerta text-[11px] flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>O mix de recebimento deve somar exatamente 100%.</span>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <label className="block text-textoSecundario text-[10px] uppercase mb-1">Boleto (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={mixBoleto}
                  onChange={(e) => setMixBoleto(Number(e.target.value))}
                  className="w-full px-2 py-1 bg-superficie border border-line rounded-lg text-textoPrimario focus:outline-none focus:border-acento"
                />
              </div>

              <div>
                <label className="block text-textoSecundario text-[10px] uppercase mb-1">PIX (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={mixPix}
                  onChange={(e) => setMixPix(Number(e.target.value))}
                  className="w-full px-2 py-1 bg-superficie border border-line rounded-lg text-textoPrimario focus:outline-none focus:border-acento"
                />
              </div>

              <div>
                <label className="block text-textoSecundario text-[10px] uppercase mb-1">Cartão (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={mixCartao}
                  onChange={(e) => setMixCartao(Number(e.target.value))}
                  className="w-full px-2 py-1 bg-superficie border border-line rounded-lg text-textoPrimario focus:outline-none focus:border-acento"
                />
              </div>

              <div>
                <label className="block text-textoSecundario text-[10px] uppercase mb-1">TED/Faturado (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={mixFaturado}
                  onChange={(e) => setMixFaturado(Number(e.target.value))}
                  className="w-full px-2 py-1 bg-superficie border border-line rounded-lg text-textoPrimario focus:outline-none focus:border-acento"
                />
              </div>
            </div>

            <div className="text-[10px] text-textoSecundario">
              Exposição ao Split: <strong className="text-acento">{mixBoleto + mixPix + mixCartao}%</strong> da receita líquida
            </div>
          </div>

          {/* Seção 4: Tributação & Risco */}
          <div className="space-y-2">
            <h3 className="font-semibold text-acento text-[11px] uppercase tracking-wide">
              04. Alíquotas e Fornecedores
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <label className="block text-textoSecundario text-[10px] uppercase mb-1">Carga Atual (%)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={cargaAtual}
                  onChange={(e) => setCargaAtual(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-superficieElevada border border-line rounded-lg text-textoPrimario focus:outline-none focus:border-acento"
                />
              </div>

              <div>
                <label className="block text-textoSecundario text-[10px] uppercase mb-1">Redução Alíquota</label>
                <select
                  value={reducaoAliquota}
                  onChange={(e) => setReducaoAliquota(e.target.value as ReducaoAliquota)}
                  className="w-full px-2.5 py-1.5 bg-superficieElevada border border-line rounded-lg text-textoPrimario focus:outline-none focus:border-acento"
                >
                  <option value="cheia">Alíquota Cheia (1.0)</option>
                  <option value="red30">Redução de 30% (0.7)</option>
                  <option value="red60">Redução de 60% (0.4)</option>
                  <option value="zero">Alíquota Zero (0.0)</option>
                  <option value="custom">Customizada</option>
                </select>
              </div>

              <div>
                <label className="block text-textoSecundario text-[10px] uppercase mb-1">Risco Fornecedor (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={fornecedoresRisco}
                  onChange={(e) => setFornecedoresRisco(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-superficieElevada border border-line rounded-lg text-textoPrimario focus:outline-none focus:border-acento"
                />
              </div>

              {reducaoAliquota === 'custom' && (
                <div className="sm:col-span-3">
                  <label className="block text-textoSecundario text-[10px] uppercase mb-1">Alíquota Customizada (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={aliquotaCustom}
                    onChange={(e) => setAliquotaCustom(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-superficieElevada border border-line rounded-lg text-textoPrimario focus:outline-none focus:border-acento"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Seção 5: Notas de Campo */}
          <div>
            <label className="block text-textoSecundario text-[10px] uppercase mb-1">
              Notas e Observações de Auditoria
            </label>
            <textarea
              rows={2}
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Ex: Validar prazo de antecipação e risco fiscal de fornecedores..."
              className="w-full px-2.5 py-1.5 bg-superficieElevada border border-line rounded-lg text-textoPrimario focus:outline-none focus:border-acento text-xs"
            />
          </div>

          {/* Footer com Botões */}
          <div className="pt-3 border-t border-line flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onFechar}
              className="px-3 py-1.5 bg-superficieElevada border border-line rounded-lg text-textoSecundario hover:text-textoPrimario text-xs transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!mixValido}
              className={`px-4 py-1.5 rounded-lg font-semibold text-xs flex items-center gap-1.5 transition-all shadow-sm ${
                mixValido
                  ? 'bg-acento text-black hover:opacity-90'
                  : 'bg-line text-textoSecundario cursor-not-allowed'
              }`}
            >
              <Save className="w-3.5 h-3.5" />
              <span>Salvar empresa</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

