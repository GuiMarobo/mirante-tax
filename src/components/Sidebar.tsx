import React, { useState, useRef } from 'react';
import { Empresa, NivelRisco } from '../types';
import { useClickOutside } from '../hooks/useClickOutside';
import {
  Building2,
  Settings,
  BookOpen,
  Sun,
  Moon,
  Zap,
  Search,
  Compass,
  ChevronDown,
} from 'lucide-react';

interface EmpresaPrioritaria {
  empresa: Empresa;
  nivel: NivelRisco;
}

interface SidebarProps {
  abaAtiva: 'carteira' | 'projecao' | 'parametros' | 'metodologia';
  onMudarAba: (aba: 'carteira' | 'parametros' | 'metodologia') => void;
  empresas: Empresa[];
  empresasPrioritarias: EmpresaPrioritaria[];
  onSelecionarEmpresa: (empresa: Empresa) => void;
  modoEscuro: boolean;
  onToggleModoEscuro: () => void;
  onAbrirDemo: () => void;
}

const CORES_RISCO: Record<NivelRisco, string> = {
  'Crítico': '#DC2626',
  'Alto': '#F59E0B',
  'Médio': '#EAB308',
  'Baixo': '#16A34A',
};

export const Sidebar: React.FC<SidebarProps> = ({
  abaAtiva,
  onMudarAba,
  empresas,
  empresasPrioritarias,
  onSelecionarEmpresa,
  modoEscuro,
  onToggleModoEscuro,
  onAbrirDemo,
}) => {
  const [buscaAberta, setBuscaAberta] = useState(false);
  const [busca, setBusca] = useState('');
  const buscaRef = useRef<HTMLDivElement>(null);

  useClickOutside(buscaRef, () => setBuscaAberta(false));

  const resultados = busca.trim()
    ? empresas.filter(e => e.nome.toLowerCase().includes(busca.toLowerCase())).slice(0, 6)
    : [];

  const itemNav = (
    aba: 'carteira' | 'parametros' | 'metodologia',
    label: string,
    Icone: React.ElementType,
    ativoTambem?: 'carteira' | 'projecao'
  ) => {
    const ativo = abaAtiva === aba || (ativoTambem && abaAtiva === ativoTambem);
    return (
      <button
        type="button"
        onClick={() => onMudarAba(aba)}
        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          ativo
            ? 'bg-acento/12 text-acento'
            : 'text-textoSecundario hover:bg-superficieElevada hover:text-textoPrimario'
        }`}
      >
        <Icone className="w-4 h-4 shrink-0" />
        <span className="truncate">{label}</span>
      </button>
    );
  };

  return (
    <aside className="w-64 shrink-0 h-screen sticky top-0 flex flex-col bg-superficie border-r border-line">
      {/* Marca */}
      <div className="flex items-center gap-2.5 px-4 h-16 border-b border-line shrink-0">
        <div className="w-7 h-7 rounded-lg bg-acento flex items-center justify-center font-bold text-[11px] text-black">
          MT
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1 text-sm font-semibold text-textoPrimario truncate">
            <span>Mirante Tax</span>
            <ChevronDown className="w-3.5 h-3.5 text-textoSecundario shrink-0" />
          </div>
          <div className="text-[11px] text-textoSecundario truncate">Ledger Labs</div>
        </div>
      </div>

      {/* Busca rápida */}
      <div className="p-3 border-b border-line relative shrink-0" ref={buscaRef}>
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-textoSecundario" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            onFocus={() => setBuscaAberta(true)}
            placeholder="Buscar empresa..."
            className="w-full pl-8 pr-3 py-1.5 bg-superficieElevada border border-line rounded-lg text-xs text-textoPrimario placeholder:text-textoSecundario focus:outline-none focus:border-acento"
          />
        </div>

        {buscaAberta && resultados.length > 0 && (
          <div className="absolute left-3 right-3 top-full mt-1 bg-superficie border border-line rounded-lg shadow-lg overflow-hidden z-50">
            {resultados.map(e => (
              <button
                key={e.id}
                type="button"
                onClick={() => {
                  onSelecionarEmpresa(e);
                  setBusca('');
                  setBuscaAberta(false);
                }}
                className="w-full text-left px-3 py-2 text-xs text-textoPrimario hover:bg-superficieElevada transition-colors truncate"
              >
                {e.nome}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Navegação */}
      <nav className="p-3 space-y-0.5 shrink-0">
        {itemNav('carteira', 'Carteira', Building2, 'projecao')}
        {itemNav('parametros', 'Parâmetros Globais', Settings)}
        {itemNav('metodologia', 'Metodologia', BookOpen)}
      </nav>

      {/* Prioritárias */}
      {empresasPrioritarias.length > 0 && (
        <div className="px-3 pt-2 pb-3 shrink-0">
          <div className="px-1 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-textoSecundario">
            Prioritárias
          </div>
          <div className="space-y-0.5">
            {empresasPrioritarias.map(({ empresa, nivel }) => (
              <button
                key={empresa.id}
                type="button"
                onClick={() => onSelecionarEmpresa(empresa)}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-textoSecundario hover:bg-superficieElevada hover:text-textoPrimario transition-colors"
              >
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: CORES_RISCO[nivel] }}
                />
                <span className="truncate">{empresa.nome}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1" />

      {/* Rodapé */}
      <div className="p-3 border-t border-line space-y-1.5 shrink-0">
        <button
          type="button"
          onClick={onAbrirDemo}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-acento hover:bg-acento/10 transition-colors"
        >
          <Zap className="w-4 h-4 shrink-0" />
          <span>Tour Demo 20s</span>
        </button>

        <div className="flex items-center justify-between px-3 py-1.5">
          <div className="flex items-center gap-2 text-[11px] text-textoSecundario">
            <Compass className="w-3.5 h-3.5" />
            <span>v1.0.26</span>
          </div>
          <button
            type="button"
            onClick={onToggleModoEscuro}
            className="p-1.5 rounded-lg hover:bg-superficieElevada text-textoSecundario hover:text-textoPrimario transition-colors"
            title={modoEscuro ? 'Modo claro' : 'Modo escuro'}
          >
            {modoEscuro ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </aside>
  );
};
