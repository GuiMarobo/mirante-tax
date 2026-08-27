import React from 'react';
import { Building2, Settings, BookOpen, Sun, Moon, Zap } from 'lucide-react';
import { Empresa } from '../types';

interface NavbarProps {
  abaAtiva: 'carteira' | 'projecao' | 'parametros' | 'metodologia';
  onMudarAba: (aba: 'carteira' | 'parametros' | 'metodologia') => void;
  empresaAtiva: Empresa | null;
  onSelecionarEmpresa: (empresa: Empresa | null) => void;
  empresas: Empresa[];
  modoEscuro: boolean;
  onToggleModoEscuro: () => void;
  onAbrirDemo: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  abaAtiva,
  onMudarAba,
  empresaAtiva,
  onSelecionarEmpresa,
  empresas,
  modoEscuro,
  onToggleModoEscuro,
  onAbrirDemo
}) => {
  const empresasCriticas = empresas.filter(e => {
    const alavancas = e.alavancasAtivas || { reajustePreco: false, prorrogacaoFornecedor: false, corteCusto: false };
    const descasamento = e.prazoRecebimento - e.prazoPagamento;
    return descasamento > 15 || e.caixaAtual < e.custoOperacional * 1.5;
  }).length;

  return (
    <header className="sticky top-0 z-40 bg-fundo/95 backdrop-blur-md border-b border-line">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo e Nome Bento Terminal */}
          <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => onMudarAba('carteira')}>
            <div className="w-8 h-8 border-2 border-acento flex items-center justify-center font-mono font-bold text-xs text-acento bg-superficie tracking-tighter">
              MT
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight uppercase text-textoPrimario">
                  Mirante Tax
                </span>
                <span className="text-[10px] font-mono text-textoSecundario opacity-60">
                  v1.0.26
                </span>
              </div>
              <p className="text-[10px] font-mono text-textoSecundario leading-none hidden sm:block">
                Capital de Giro · LC 214/2025
              </p>
            </div>
          </div>

          {/* Abas Centrais de Navegação Estilo Bento */}
          <nav className="hidden md:flex items-center gap-1 bg-superficie p-1 border border-line">
            <button
              type="button"
              onClick={() => onMudarAba('carteira')}
              className={`px-3 py-1.5 text-xs font-mono font-medium transition-all flex items-center gap-2 ${
                abaAtiva === 'carteira' || abaAtiva === 'projecao'
                  ? 'bg-acento text-black font-bold'
                  : 'text-textoSecundario hover:text-textoPrimario'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>CARTEIRA</span>
            </button>

            <button
              type="button"
              onClick={() => onMudarAba('parametros')}
              className={`px-3 py-1.5 text-xs font-mono font-medium transition-all flex items-center gap-2 ${
                abaAtiva === 'parametros'
                  ? 'bg-acento text-black font-bold'
                  : 'text-textoSecundario hover:text-textoPrimario'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>PARÂMETROS</span>
            </button>

            <button
              type="button"
              onClick={() => onMudarAba('metodologia')}
              className={`px-3 py-1.5 text-xs font-mono font-medium transition-all flex items-center gap-2 ${
                abaAtiva === 'metodologia'
                  ? 'bg-acento text-black font-bold'
                  : 'text-textoSecundario hover:text-textoPrimario'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>METODOLOGIA</span>
            </button>
          </nav>

          {/* Bento Header Stats & Ações Rápidas */}
          <div className="flex items-center gap-4 sm:gap-6">
            {/* Header Telemetry Stats */}
            <div className="hidden sm:flex items-center gap-5 border-r border-line pr-4">
              <div className="flex flex-col items-end leading-none">
                <span className="text-[9px] font-mono uppercase text-textoSecundario">Risco Crítico</span>
                <span className="text-alerta font-mono font-bold text-base mt-0.5">
                  {String(empresasCriticas).padStart(2, '0')}
                </span>
              </div>
              <div className="flex flex-col items-end leading-none">
                <span className="text-[9px] font-mono uppercase text-textoSecundario">Total Carteira</span>
                <span className="text-acento font-mono font-bold text-base mt-0.5">
                  {String(empresas.length).padStart(2, '0')}
                </span>
              </div>
            </div>

            {/* Seletor Rápido de Empresa se houver ativa */}
            {empresaAtiva && (
              <select
                value={empresaAtiva.id}
                onChange={(e) => {
                  const emp = empresas.find(item => item.id === e.target.value);
                  if (emp) onSelecionarEmpresa(emp);
                }}
                className="hidden lg:block px-2.5 py-1.5 bg-superficie border border-line text-xs font-mono text-textoPrimario focus:outline-none focus:border-acento max-w-[160px] truncate"
              >
                {empresas.map(e => (
                  <option key={e.id} value={e.id}>
                    {e.nome}
                  </option>
                ))}
              </select>
            )}

            {/* Botão Demo 20s */}
            <button
              type="button"
              onClick={onAbrirDemo}
              className="px-2.5 py-1.5 bg-superficie border border-acento text-acento font-mono font-bold text-xs hover:bg-acento hover:text-black transition-all flex items-center gap-1.5"
              title="Tour Guiado de 20 Segundos"
            >
              <Zap className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">DEMO 20s</span>
            </button>

            {/* Toggle Modo Escuro / Claro */}
            <button
              type="button"
              onClick={onToggleModoEscuro}
              className="p-1.5 bg-superficie border border-line text-textoSecundario hover:text-textoPrimario transition-colors"
              title={modoEscuro ? 'Alternar para Modo Claro' : 'Alternar para Modo Escuro'}
            >
              {modoEscuro ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
