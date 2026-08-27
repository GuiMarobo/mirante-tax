import React, { useState, useMemo, useRef } from 'react';
import { Empresa, ParametrosGlobais, NivelRisco } from '../types';
import { calcularProjecaoCompleta } from '../motor/motorCalculo';
import { MiniSparkline, MiniBarras } from './MiniSparkline';
import { useClickOutside } from '../hooks/useClickOutside';
import {
  Building2,
  AlertTriangle,
  Search,
  Plus,
  ChevronDown,
  ChevronRight,
  Columns3,
  Upload,
  Download,
  RotateCcw,
  Zap,
  Clock,
  ShieldCheck,
} from 'lucide-react';

interface CarteiraViewProps {
  empresas: Empresa[];
  parametros: ParametrosGlobais;
  onSelecionarEmpresa: (empresa: Empresa) => void;
  onNovaEmpresa: () => void;
  onExportarCSV: (subconjunto?: Empresa[]) => void;
  onImportarCSV: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRestaurarPerfisPadrao: () => void;
  onIniciarDemo20s: () => void;
}

const CORES_RISCO: Record<NivelRisco, { texto: string; fundo: string; dot: string }> = {
  'Crítico': { texto: 'text-red-700 dark:text-red-400', fundo: 'bg-red-500/10', dot: 'bg-red-600' },
  'Alto': { texto: 'text-amber-700 dark:text-amber-400', fundo: 'bg-amber-500/10', dot: 'bg-amber-500' },
  'Médio': { texto: 'text-yellow-700 dark:text-yellow-400', fundo: 'bg-yellow-500/10', dot: 'bg-yellow-500' },
  'Baixo': { texto: 'text-emerald-700 dark:text-emerald-400', fundo: 'bg-emerald-500/10', dot: 'bg-emerald-500' },
};

function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/);
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[1][0]).toUpperCase();
}

const PALETA_AVATAR = ['#C8933E', '#2563EB', '#7C3AED', '#DB2777', '#059669', '#EA580C', '#0891B2', '#DC2626'];

function corAvatar(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return PALETA_AVATAR[hash % PALETA_AVATAR.length];
}

export const CarteiraView: React.FC<CarteiraViewProps> = ({
  empresas,
  parametros,
  onSelecionarEmpresa,
  onNovaEmpresa,
  onExportarCSV,
  onImportarCSV,
  onRestaurarPerfisPadrao,
  onIniciarDemo20s
}) => {
  const [busca, setBusca] = useState('');
  const [filtroRisco, setFiltroRisco] = useState<NivelRisco | 'TODOS'>('TODOS');
  const [ordenacao, setOrdenacao] = useState<'urgencia' | 'faturamento' | 'descasamento'>('urgencia');
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());
  const [menuColunasAberto, setMenuColunasAberto] = useState(false);
  const [menuAcoesAberto, setMenuAcoesAberto] = useState(false);
  const [colunas, setColunas] = useState({ cnae: false, menorSaldo: true, descasamento: false });
  const inputArquivoRef = useRef<HTMLInputElement>(null);
  const menuColunasRef = useRef<HTMLDivElement>(null);
  const menuAcoesRef = useRef<HTMLDivElement>(null);

  useClickOutside(menuColunasRef, () => setMenuColunasAberto(false));
  useClickOutside(menuAcoesRef, () => setMenuAcoesAberto(false));

  // Calcular projeção e risco para cada empresa
  const empresasComProjecao = useMemo(() => {
    return empresas.map(empresa => {
      const projecao = calcularProjecaoCompleta(
        empresa,
        parametros,
        empresa.alavancasAtivas || { reajustePreco: false, prorrogacaoFornecedor: false, corteCusto: false },
        24
      );
      return {
        empresa,
        risco: projecao.risco,
        primeiroCritico: projecao.cenarioBase.primeiroCritico,
        mesesAbaixoPiso: projecao.cenarioBase.mesesAbaixoPiso,
        menorSaldo: projecao.cenarioBase.menorSaldo,
        saldos: projecao.cenarioBase.saldos,
        pontos: projecao.cenarioBase.pontos,
        descasamento: projecao.memoriaCalculo.descasamentoCiclo,
        choqueUnico: projecao.memoriaCalculo.choqueUnico,
      };
    });
  }, [empresas, parametros]);

  // Métricas agregadas de carteira
  const metricas = useMemo(() => {
    const total = empresasComProjecao.length || 1;
    const distribuicao = { 'Baixo': 0, 'Médio': 0, 'Alto': 0, 'Crítico': 0 } as Record<NivelRisco, number>;
    let somaChoque = 0;
    let somaDescasamento = 0;
    empresasComProjecao.forEach(item => {
      distribuicao[item.risco.nivel]++;
      somaChoque += item.choqueUnico;
      somaDescasamento += item.descasamento;
    });

    const emRisco = distribuicao['Alto'] + distribuicao['Crítico'];
    const resilientes = distribuicao['Baixo'] + distribuicao['Médio'];

    const curvaMedia = Array.from({ length: 24 }, (_, i) => {
      const soma = empresasComProjecao.reduce((acc, item) => acc + (item.saldos[i] ?? 0), 0);
      return soma / total;
    });

    const descasamentosOrdenados = [...empresasComProjecao]
      .sort((a, b) => a.descasamento - b.descasamento)
      .map(item => ({
        valor: Math.max(0, item.descasamento),
        cor: item.descasamento > 15 ? '#DC2626' : '#C8933E',
      }));

    return {
      total: empresasComProjecao.length,
      emRisco,
      percentualRisco: Math.round((emRisco / total) * 100),
      resilientes,
      percentualResiliente: Math.round((resilientes / total) * 100),
      choqueMedio: Math.round(somaChoque / total),
      descasamentoMedio: Math.round(somaDescasamento / total),
      curvaMedia,
      barrasDistribuicao: [
        { valor: distribuicao['Baixo'], cor: '#16A34A' },
        { valor: distribuicao['Médio'], cor: '#EAB308' },
        { valor: distribuicao['Alto'], cor: '#F59E0B' },
        { valor: distribuicao['Crítico'], cor: '#DC2626' },
      ],
      barrasDescasamento: descasamentosOrdenados,
    };
  }, [empresasComProjecao]);

  // Filtragem e Ordenação
  const listaFiltrada = useMemo(() => {
    return empresasComProjecao
      .filter(item => {
        const matchesBusca =
          item.empresa.nome.toLowerCase().includes(busca.toLowerCase()) ||
          item.empresa.ramo.toLowerCase().includes(busca.toLowerCase()) ||
          item.empresa.cnae.toLowerCase().includes(busca.toLowerCase());
        const matchesFiltro = filtroRisco === 'TODOS' || item.risco.nivel === filtroRisco;
        return matchesBusca && matchesFiltro;
      })
      .sort((a, b) => {
        if (ordenacao === 'urgencia') {
          if (b.risco.ordem !== a.risco.ordem) return b.risco.ordem - a.risco.ordem;
          const mesA = a.primeiroCritico ?? 999;
          const mesB = b.primeiroCritico ?? 999;
          return mesA - mesB;
        }
        if (ordenacao === 'faturamento') return b.empresa.faturamentoMensal - a.empresa.faturamentoMensal;
        if (ordenacao === 'descasamento') return b.descasamento - a.descasamento;
        return 0;
      });
  }, [empresasComProjecao, busca, filtroRisco, ordenacao]);

  const todasSelecionadas = listaFiltrada.length > 0 && listaFiltrada.every(item => selecionados.has(item.empresa.id));

  const toggleSelecionarTodas = () => {
    if (todasSelecionadas) {
      setSelecionados(new Set());
    } else {
      setSelecionados(new Set(listaFiltrada.map(item => item.empresa.id)));
    }
  };

  const toggleSelecionar = (id: string) => {
    setSelecionados(prev => {
      const novo = new Set(prev);
      if (novo.has(id)) novo.delete(id);
      else novo.add(id);
      return novo;
    });
  };

  return (
    <div className="space-y-5">
      {/* Cabeçalho da Página */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-textoPrimario">Carteira</h1>
          <p className="text-sm text-textoSecundario mt-0.5">{metricas.total} empresas monitoradas na transição da Reforma</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onIniciarDemo20s}
            className="px-3 py-2 bg-superficie border border-line rounded-lg text-xs font-medium text-textoSecundario hover:text-textoPrimario hover:border-acento/50 transition-colors flex items-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5 text-acento" />
            <span>Tour Demo</span>
          </button>
          <button
            type="button"
            onClick={onNovaEmpresa}
            className="px-3.5 py-2 bg-acento text-black rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nova empresa</span>
          </button>
        </div>
      </div>

      {/* Cartões de Métricas com Sparkline */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-superficie border border-line rounded-xl p-4">
          <div className="flex items-center justify-between text-textoSecundario mb-2">
            <span className="text-xs font-medium">Empresas em Risco</span>
            <AlertTriangle className="w-4 h-4 text-alerta" />
          </div>
          <div className="flex items-end justify-between gap-2">
            <div>
              <div className="text-2xl font-semibold text-textoPrimario">{metricas.emRisco}</div>
              <span className="text-[11px] text-textoSecundario">{metricas.percentualRisco}% da carteira</span>
            </div>
            <MiniBarras valores={metricas.barrasDistribuicao} />
          </div>
        </div>

        <div className="bg-superficie border border-line rounded-xl p-4">
          <div className="flex items-center justify-between text-textoSecundario mb-2">
            <span className="text-xs font-medium">Choque Médio no Split</span>
            <Zap className="w-4 h-4 text-acento" />
          </div>
          <div className="flex items-end justify-between gap-2">
            <div>
              <div className="text-2xl font-semibold text-textoPrimario">R$ {(metricas.choqueMedio / 1000).toFixed(0)}k</div>
              <span className="text-[11px] text-textoSecundario">Drenado na liquidação</span>
            </div>
            <MiniSparkline valores={metricas.curvaMedia} cor="#DC2626" />
          </div>
        </div>

        <div className="bg-superficie border border-line rounded-xl p-4">
          <div className="flex items-center justify-between text-textoSecundario mb-2">
            <span className="text-xs font-medium">Resiliência da Carteira</span>
            <ShieldCheck className="w-4 h-4 text-confirmacao" />
          </div>
          <div className="flex items-end justify-between gap-2">
            <div>
              <div className="text-2xl font-semibold text-textoPrimario">{metricas.percentualResiliente}%</div>
              <span className="text-[11px] text-textoSecundario">{metricas.resilientes} empresas estáveis</span>
            </div>
            <MiniSparkline valores={metricas.curvaMedia} cor="#16A34A" />
          </div>
        </div>

        <div className="bg-superficie border border-line rounded-xl p-4">
          <div className="flex items-center justify-between text-textoSecundario mb-2">
            <span className="text-xs font-medium">Descasamento Médio</span>
            <Clock className="w-4 h-4 text-acento" />
          </div>
          <div className="flex items-end justify-between gap-2">
            <div>
              <div className="text-2xl font-semibold text-textoPrimario">{metricas.descasamentoMedio}d</div>
              <span className="text-[11px] text-textoSecundario">Receb. vs pagamento</span>
            </div>
            <MiniBarras valores={metricas.barrasDescasamento} />
          </div>
        </div>
      </div>

      {/* Barra de Ferramentas */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-textoSecundario" />
            <input
              type="text"
              placeholder="Buscar por nome, ramo ou CNAE..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-64 pl-8 pr-3 py-1.5 bg-superficie border border-line rounded-lg text-xs text-textoPrimario placeholder:text-textoSecundario focus:outline-none focus:border-acento"
            />
          </div>

          <div className="flex items-center gap-1 bg-superficieElevada p-0.5 rounded-lg">
            {(['TODOS', 'Crítico', 'Alto', 'Médio', 'Baixo'] as const).map((nivel) => (
              <button
                key={nivel}
                type="button"
                onClick={() => setFiltroRisco(nivel)}
                className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors ${
                  filtroRisco === nivel
                    ? 'bg-superficie text-textoPrimario shadow-sm'
                    : 'text-textoSecundario hover:text-textoPrimario'
                }`}
              >
                {nivel}
              </button>
            ))}
          </div>

          <select
            value={ordenacao}
            onChange={(e) => setOrdenacao(e.target.value as any)}
            className="px-2.5 py-1.5 bg-superficie border border-line rounded-lg text-xs text-textoPrimario focus:outline-none focus:border-acento"
          >
            <option value="urgencia">Ordenar: Urgência</option>
            <option value="faturamento">Ordenar: Faturamento</option>
            <option value="descasamento">Ordenar: Descasamento</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          {selecionados.size > 0 && (
            <button
              type="button"
              onClick={() => onExportarCSV(empresasComProjecao.filter(i => selecionados.has(i.empresa.id)).map(i => i.empresa))}
              className="px-2.5 py-1.5 bg-acento/10 text-acento rounded-lg text-xs font-medium hover:bg-acento/20 transition-colors"
            >
              {selecionados.size} selecionada{selecionados.size > 1 ? 's' : ''} · Exportar
            </button>
          )}

          {/* Menu de Colunas */}
          <div className="relative" ref={menuColunasRef}>
            <button
              type="button"
              onClick={() => setMenuColunasAberto(v => !v)}
              className="px-2.5 py-1.5 bg-superficie border border-line rounded-lg text-xs text-textoSecundario hover:text-textoPrimario transition-colors flex items-center gap-1.5"
            >
              <Columns3 className="w-3.5 h-3.5" />
              <span>Colunas</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            {menuColunasAberto && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-superficie border border-line rounded-lg shadow-lg p-1.5 z-30">
                {([
                  ['cnae', 'CNAE'],
                  ['menorSaldo', 'Menor Saldo'],
                  ['descasamento', 'Descasamento'],
                ] as const).map(([chave, label]) => (
                  <label key={chave} className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-superficieElevada cursor-pointer text-xs text-textoPrimario">
                    <input
                      type="checkbox"
                      checked={colunas[chave]}
                      onChange={() => setColunas(prev => ({ ...prev, [chave]: !prev[chave] }))}
                      className="accent-acento"
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Menu de Ações (Importar/Exportar/Restaurar) */}
          <div className="relative" ref={menuAcoesRef}>
            <button
              type="button"
              onClick={() => setMenuAcoesAberto(v => !v)}
              className="px-2.5 py-1.5 bg-superficie border border-line rounded-lg text-xs text-textoSecundario hover:text-textoPrimario transition-colors flex items-center gap-1.5"
            >
              <span>Importar / Exportar</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            {menuAcoesAberto && (
              <div className="absolute right-0 top-full mt-1 w-52 bg-superficie border border-line rounded-lg shadow-lg p-1.5 z-30">
                <button
                  type="button"
                  onClick={() => { inputArquivoRef.current?.click(); setMenuAcoesAberto(false); }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-superficieElevada text-xs text-textoPrimario"
                >
                  <Upload className="w-3.5 h-3.5 text-textoSecundario" />
                  <span>Importar CSV</span>
                </button>
                <button
                  type="button"
                  onClick={() => { onExportarCSV(); setMenuAcoesAberto(false); }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-superficieElevada text-xs text-textoPrimario"
                >
                  <Download className="w-3.5 h-3.5 text-textoSecundario" />
                  <span>Exportar carteira (CSV)</span>
                </button>
                <div className="my-1 border-t border-line" />
                <button
                  type="button"
                  onClick={() => { onRestaurarPerfisPadrao(); setMenuAcoesAberto(false); }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-superficieElevada text-xs text-textoSecundario"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restaurar 8 perfis padrão</span>
                </button>
              </div>
            )}
            <input ref={inputArquivoRef} type="file" accept=".csv" onChange={onImportarCSV} className="hidden" />
          </div>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-superficie border border-line rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-line text-[11px] uppercase tracking-wide text-textoSecundario">
                <th className="w-10 py-2.5 pl-4">
                  <input type="checkbox" checked={todasSelecionadas} onChange={toggleSelecionarTodas} className="accent-acento" />
                </th>
                <th className="text-left py-2.5 px-2 font-medium">Empresa</th>
                {colunas.cnae && <th className="text-left py-2.5 px-2 font-medium">CNAE</th>}
                <th className="text-left py-2.5 px-2 font-medium">Risco</th>
                <th className="text-right py-2.5 px-2 font-medium">Faturamento</th>
                <th className="text-left py-2.5 px-2 font-medium">1ª Ruptura</th>
                {colunas.menorSaldo && <th className="text-right py-2.5 px-2 font-medium">Menor Saldo</th>}
                {colunas.descasamento && <th className="text-right py-2.5 px-2 font-medium">Descasamento</th>}
                <th className="w-10 py-2.5 pr-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {listaFiltrada.map(({ empresa, risco, primeiroCritico, menorSaldo, pontos, descasamento }) => {
                const rotuloRuptura = primeiroCritico !== null ? pontos[primeiroCritico]?.rotulo : null;
                const cores = CORES_RISCO[risco.nivel];

                return (
                  <tr
                    key={empresa.id}
                    onClick={() => onSelecionarEmpresa(empresa)}
                    className="hover:bg-superficieElevada/60 transition-colors cursor-pointer group"
                  >
                    <td className="py-2.5 pl-4" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selecionados.has(empresa.id)}
                        onChange={() => toggleSelecionar(empresa.id)}
                        className="accent-acento"
                      />
                    </td>
                    <td className="py-2.5 px-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold text-white shrink-0"
                          style={{ backgroundColor: corAvatar(empresa.id) }}
                        >
                          {iniciais(empresa.nome)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-textoPrimario truncate">{empresa.nome}</div>
                          <div className="text-[11px] text-textoSecundario truncate">{empresa.ramo}</div>
                        </div>
                      </div>
                    </td>
                    {colunas.cnae && (
                      <td className="py-2.5 px-2 text-xs text-textoSecundario whitespace-nowrap">{empresa.cnae}</td>
                    )}
                    <td className="py-2.5 px-2">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium ${cores.fundo} ${cores.texto}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cores.dot}`} />
                        {risco.nivel}
                      </span>
                    </td>
                    <td className="py-2.5 px-2 text-right text-xs text-textoPrimario whitespace-nowrap">
                      R$ {(empresa.faturamentoMensal / 1000).toFixed(0)}k
                    </td>
                    <td className="py-2.5 px-2 text-xs whitespace-nowrap">
                      {rotuloRuptura ? (
                        <span className="text-alerta font-medium">{rotuloRuptura}</span>
                      ) : (
                        <span className="text-confirmacao">Seguro</span>
                      )}
                    </td>
                    {colunas.menorSaldo && (
                      <td className={`py-2.5 px-2 text-right text-xs whitespace-nowrap ${menorSaldo < 0 ? 'text-alerta font-medium' : 'text-textoPrimario'}`}>
                        R$ {menorSaldo.toLocaleString('pt-BR')}
                      </td>
                    )}
                    {colunas.descasamento && (
                      <td className={`py-2.5 px-2 text-right text-xs whitespace-nowrap ${descasamento > 15 ? 'text-alerta font-medium' : 'text-textoPrimario'}`}>
                        {descasamento > 0 ? `+${descasamento}` : descasamento}d
                      </td>
                    )}
                    <td className="py-2.5 pr-4">
                      <ChevronRight className="w-4 h-4 text-textoSecundario group-hover:text-acento transition-colors" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {listaFiltrada.length === 0 && (
          <div className="py-16 text-center">
            <Building2 className="w-8 h-8 text-textoSecundario/40 mx-auto mb-2" />
            <h4 className="text-sm font-medium text-textoPrimario">Nenhuma empresa encontrada</h4>
            <p className="text-xs text-textoSecundario mt-1">Verifique os filtros ou adicione uma nova empresa à carteira.</p>
          </div>
        )}
      </div>
    </div>
  );
};
