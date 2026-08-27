import React, { useState, useMemo } from 'react';
import { Empresa, ParametrosGlobais, NivelRisco } from '../types';
import { calcularProjecaoCompleta } from '../motor/motorCalculo';
import {
  Building2,
  AlertOctagon,
  AlertTriangle,
  ShieldCheck,
  Search,
  Plus,
  Download,
  Upload,
  ArrowRight,
  Clock,
  Zap,
} from 'lucide-react';

interface CarteiraViewProps {
  empresas: Empresa[];
  parametros: ParametrosGlobais;
  onSelecionarEmpresa: (empresa: Empresa) => void;
  onNovaEmpresa: () => void;
  onExportarCSV: () => void;
  onImportarCSV: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRestaurarPerfisPadrao: () => void;
  onIniciarDemo20s: () => void;
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
        projecao,
        risco: projecao.risco,
        primeiroCritico: projecao.cenarioBase.primeiroCritico,
        mesesAbaixoPiso: projecao.cenarioBase.mesesAbaixoPiso,
        menorSaldo: projecao.cenarioBase.menorSaldo,
        pontos: projecao.cenarioBase.pontos,
        descasamento: projecao.memoriaCalculo.descasamentoCiclo,
        choqueUnico: projecao.memoriaCalculo.choqueUnico,
      };
    });
  }, [empresas, parametros]);

  // Contadores Agregados de Cabeçalho Bento
  const contadores = useMemo(() => {
    let critico = 0;
    let alto = 0;
    let medio = 0;
    let baixo = 0;
    let totalChoque = 0;

    empresasComProjecao.forEach(item => {
      if (item.risco.nivel === 'Crítico') critico++;
      else if (item.risco.nivel === 'Alto') alto++;
      else if (item.risco.nivel === 'Médio') medio++;
      else baixo++;
      totalChoque += item.choqueUnico;
    });

    const percentualRisco = empresas.length > 0 ? Math.round(((critico + alto) / empresas.length) * 100) : 0;

    return {
      total: empresas.length,
      critico,
      alto,
      medio,
      baixo,
      percentualRisco,
      totalChoque
    };
  }, [empresasComProjecao, empresas.length]);

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
          if (b.risco.ordem !== a.risco.ordem) {
            return b.risco.ordem - a.risco.ordem;
          }
          const mesA = a.primeiroCritico ?? 999;
          const mesB = b.primeiroCritico ?? 999;
          return mesA - mesB;
        }
        if (ordenacao === 'faturamento') {
          return b.empresa.faturamentoMensal - a.empresa.faturamentoMensal;
        }
        if (ordenacao === 'descasamento') {
          return b.descasamento - a.descasamento;
        }
        return 0;
      });
  }, [empresasComProjecao, busca, filtroRisco, ordenacao]);

  return (
    <div className="space-y-4">
      {/* Bento Grid Top Panel */}
      <div className="bg-superficie border border-line p-5">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-confirmacao animate-pulse"></span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-textoSecundario font-semibold">
                Carteira Prioritária · Diagnóstico Transição LC 214/2025
              </span>
            </div>
            <h1 className="text-xl font-bold uppercase tracking-tight text-textoPrimario mt-1">
              Painel de Monitoramento da Carteira
            </h1>
            <p className="text-xs text-textoSecundario font-mono mt-0.5">
              <span className="text-alerta font-bold font-mono">{contadores.critico + contadores.alto} empresas</span> com risco alto ou crítico na retenção do Split Payment
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onIniciarDemo20s}
              className="px-3 py-1.5 bg-superficie border border-acento text-acento font-mono font-bold text-xs hover:bg-acento hover:text-black transition-all flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>TOUR DEMO 20s</span>
            </button>

            <button
              type="button"
              onClick={onNovaEmpresa}
              className="px-3 py-1.5 bg-acento text-black font-mono font-bold text-xs hover:opacity-90 transition-opacity flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>NOVA EMPRESA</span>
            </button>
          </div>
        </div>

        {/* 4 Bento Metric Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1 bg-line p-1">
          <div className="bg-superficie p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-textoSecundario">
              <span className="text-[9px] font-mono uppercase tracking-wider">Taxa Exposição a Risco</span>
              <AlertTriangle className="w-4 h-4 text-alerta" />
            </div>
            <div className="mt-2">
              <div className="text-2xl font-mono font-bold text-textoPrimario">
                {contadores.percentualRisco}%
              </div>
              <span className="text-[10px] font-mono text-alerta">
                {contadores.critico + contadores.alto} empresas no limite
              </span>
            </div>
          </div>

          <div className="bg-superficie p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-textoSecundario">
              <span className="text-[9px] font-mono uppercase tracking-wider">Float Médio no Split</span>
              <Clock className="w-4 h-4 text-acento" />
            </div>
            <div className="mt-2">
              <div className="text-2xl font-mono font-bold text-acento">
                R$ {Math.round(contadores.totalChoque / (contadores.total || 1)).toLocaleString('pt-BR')}
              </div>
              <span className="text-[10px] font-mono text-textoSecundario">
                Drenado na liquidação inicial
              </span>
            </div>
          </div>

          <div className="bg-superficie p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-textoSecundario">
              <span className="text-[9px] font-mono uppercase tracking-wider">Status Crítico</span>
              <AlertOctagon className="w-4 h-4 text-alerta" />
            </div>
            <div className="mt-2">
              <div className="text-2xl font-mono font-bold text-alerta">
                {String(contadores.critico).padStart(2, '0')}
              </div>
              <span className="text-[10px] font-mono text-textoSecundario">
                Saldo negativo ou ≥8m no piso
              </span>
            </div>
          </div>

          <div className="bg-superficie p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-textoSecundario">
              <span className="text-[9px] font-mono uppercase tracking-wider">Resilientes</span>
              <ShieldCheck className="w-4 h-4 text-confirmacao" />
            </div>
            <div className="mt-2">
              <div className="text-2xl font-mono font-bold text-confirmacao">
                {String(contadores.baixo + contadores.medio).padStart(2, '0')}
              </div>
              <span className="text-[10px] font-mono text-confirmacao">
                {Math.round(((contadores.baixo + contadores.medio) / (contadores.total || 1)) * 100)}% da carteira
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bento Controls & Filter Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-superficie p-3 border border-line">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 transform -translate-y-1/2 text-textoSecundario" />
            <input
              type="text"
              placeholder="Buscar por nome, ramo ou CNAE..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-superficieElevada border border-line text-xs font-mono text-textoPrimario placeholder:text-textoSecundario focus:outline-none focus:border-acento"
            />
          </div>

          {/* Chips de Risco */}
          <div className="flex items-center gap-1 bg-superficieElevada p-0.5 border border-line">
            {(['TODOS', 'Crítico', 'Alto', 'Médio', 'Baixo'] as const).map((nivel) => (
              <button
                key={nivel}
                type="button"
                onClick={() => setFiltroRisco(nivel)}
                className={`px-2.5 py-1 text-[11px] font-mono transition-colors ${
                  filtroRisco === nivel
                    ? 'bg-acento text-black font-bold'
                    : 'text-textoSecundario hover:text-textoPrimario'
                }`}
              >
                {nivel.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* CSV & Ordenação */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <select
            value={ordenacao}
            onChange={(e) => setOrdenacao(e.target.value as any)}
            className="px-2.5 py-1.5 bg-superficieElevada border border-line text-xs font-mono text-textoPrimario focus:outline-none focus:border-acento uppercase"
          >
            <option value="urgencia">ORDENAR: URGÊNCIA</option>
            <option value="faturamento">ORDENAR: FATURAMENTO</option>
            <option value="descasamento">ORDENAR: DESCASAMENTO</option>
          </select>

          <label className="px-2.5 py-1.5 bg-superficieElevada border border-line hover:border-acento text-xs font-mono text-textoPrimario cursor-pointer transition-colors flex items-center gap-1">
            <Upload className="w-3 h-3 text-textoSecundario" />
            <span>IMPORTAR</span>
            <input
              type="file"
              accept=".csv"
              onChange={onImportarCSV}
              className="hidden"
            />
          </label>

          <button
            type="button"
            onClick={onExportarCSV}
            className="px-2.5 py-1.5 bg-superficieElevada border border-line hover:border-acento text-xs font-mono text-textoPrimario transition-colors flex items-center gap-1"
            title="Exportar Carteira em CSV"
          >
            <Download className="w-3 h-3 text-textoSecundario" />
            <span>EXPORTAR</span>
          </button>

          <button
            type="button"
            onClick={onRestaurarPerfisPadrao}
            className="px-2.5 py-1.5 bg-superficieElevada border border-line hover:border-acento text-xs font-mono text-textoSecundario hover:text-textoPrimario transition-colors"
            title="Restaurar os 8 Perfis Oficiais"
          >
            PADRÕES
          </button>
        </div>
      </div>

      {/* Bento Grid: Lista de Empresas */}
      <div className="space-y-2">
        {listaFiltrada.map(({ empresa, risco, primeiroCritico, mesesAbaixoPiso, menorSaldo, pontos, descasamento }) => {
          const primeiroCriticoRotulo = primeiroCritico !== null ? pontos[primeiroCritico]?.rotulo : '-';
          const ehCritico = risco.nivel === 'Crítico';
          const ehAlto = risco.nivel === 'Alto';
          const ehBaixo = risco.nivel === 'Baixo';

          const borderColor = ehCritico ? 'border-l-4 border-l-alerta' :
            ehAlto ? 'border-l-4 border-l-amber-500' :
            ehBaixo ? 'border-l-4 border-l-confirmacao' : 'border-l-4 border-l-yellow-500';

          return (
            <div
              key={empresa.id}
              onClick={() => onSelecionarEmpresa(empresa)}
              className={`bg-superficie hover:bg-superficieElevada border border-line ${borderColor} p-4 transition-all cursor-pointer group`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Coluna 1: Nome & CNAE */}
                <div className="lg:w-1/3">
                  <div className="flex items-center justify-between sm:justify-start gap-2.5">
                    <h3 className="text-sm font-bold uppercase tracking-tight text-textoPrimario group-hover:text-acento transition-colors">
                      {empresa.nome}
                    </h3>
                    <span className={`text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 ${
                      ehCritico ? 'text-alerta bg-alerta/10' :
                      ehAlto ? 'text-amber-500 bg-amber-500/10' :
                      ehBaixo ? 'text-confirmacao bg-confirmacao/10' :
                      'text-yellow-500 bg-yellow-500/10'
                    }`}>
                      {risco.nivel}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-textoSecundario font-mono mt-1">
                    <span>{empresa.ramo}</span>
                    <span>·</span>
                    <span>CNAE {empresa.cnae}</span>
                    <span>·</span>
                    <span>FAT R$ {(empresa.faturamentoMensal / 1000).toFixed(0)}k/m</span>
                  </div>
                </div>

                {/* Coluna 2: 24 Meses Heatmap Segmentado */}
                <div className="lg:w-1/3">
                  <div className="flex items-center justify-between text-[10px] font-mono text-textoSecundario mb-1">
                    <span>MESES NO RISCO: {String(mesesAbaixoPiso).padStart(2, '0')}</span>
                    <span className={mesesAbaixoPiso > 0 ? 'text-alerta font-bold' : 'text-confirmacao'}>
                      {primeiroCriticoRotulo !== '-' ? `RUPTURA: ${primeiroCriticoRotulo.toUpperCase()}` : 'SEGURO'}
                    </span>
                  </div>

                  <div className="flex h-2.5 gap-0.5 bg-fundo p-0.5 border border-line">
                    {pontos.map((p, i) => (
                      <div
                        key={i}
                        title={`${p.rotulo}: Saldo R$ ${p.saldo.toLocaleString('pt-BR')} ${p.abaixoPiso ? '(Abaixo do piso!)' : ''}`}
                        className={`flex-1 transition-colors ${
                          p.saldo < 0 ? 'bg-red-600' :
                          p.abaixoPiso ? 'bg-alerta' :
                          p.ehMesSplit ? 'bg-acento' :
                          'bg-confirmacao/50'
                        }`}
                      />
                    ))}
                  </div>

                  <div className="flex justify-between text-[9px] font-mono text-textoSecundario mt-1">
                    <span>AGO/26</span>
                    <span className="text-acento font-bold">JUL/27 (SPLIT)</span>
                    <span>JUL/28</span>
                  </div>
                </div>

                {/* Coluna 3: Indicadores e Ação */}
                <div className="lg:w-1/3 flex items-center justify-between lg:justify-end gap-6 pt-2 lg:pt-0 border-t lg:border-t-0 border-line">
                  <div className="text-left lg:text-right">
                    <span className="text-[9px] font-mono uppercase text-textoSecundario block">1º Ruptura</span>
                    <span className={`text-xs font-mono font-bold ${primeiroCritico !== null ? 'text-alerta' : 'text-confirmacao'}`}>
                      {primeiroCriticoRotulo.toUpperCase()}
                    </span>
                  </div>

                  <div className="text-left lg:text-right">
                    <span className="text-[9px] font-mono uppercase text-textoSecundario block">Menor Saldo</span>
                    <span className={`text-xs font-mono font-bold ${menorSaldo < 0 ? 'text-alerta' : (menorSaldo < empresa.custoOperacional ? 'text-alerta' : 'text-textoPrimario')}`}>
                      R$ {menorSaldo.toLocaleString('pt-BR')}
                    </span>
                  </div>

                  <div className="text-left lg:text-right hidden sm:block">
                    <span className="text-[9px] font-mono uppercase text-textoSecundario block">Descasamento</span>
                    <span className={`text-xs font-mono font-bold ${descasamento > 15 ? 'text-alerta' : 'text-textoPrimario'}`}>
                      {descasamento > 0 ? `+${descasamento}` : descasamento}d
                    </span>
                  </div>

                  <div className="p-1.5 bg-superficieElevada border border-line group-hover:bg-acento group-hover:text-black text-textoSecundario transition-all">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {listaFiltrada.length === 0 && (
          <div className="bg-superficie border border-line p-12 text-center">
            <Building2 className="w-10 h-10 text-textoSecundario/40 mx-auto mb-2" />
            <h4 className="text-sm font-mono uppercase font-bold text-textoPrimario">Nenhuma empresa encontrada</h4>
            <p className="text-xs font-mono text-textoSecundario mt-1">
              Verifique os filtros ou adicione uma nova empresa à carteira.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

