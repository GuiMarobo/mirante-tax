import React, { useState, useEffect, useMemo } from 'react';
import { Empresa, ParametrosGlobais, AlavancasAtivas } from './types';
import { PERFIS_EMPRESAS_PADRAO, PARAMETROS_GLOBAIS_PADRAO } from './data/defaultData';
import { exportarCarteiraCSV, parseCarteiraCSV } from './utils/csv';
import { calcularProjecaoCompleta } from './motor/motorCalculo';
import { Sidebar } from './components/Sidebar';
import { CarteiraView } from './components/CarteiraView';
import { ProjecaoView } from './components/ProjecaoView';
import { ParametrosGlobaisView } from './components/ParametrosGlobaisView';
import { MetodologiaView } from './components/MetodologiaView';
import { EmpresaModal } from './components/EmpresaModal';
import { RelatorioModal } from './components/RelatorioModal';
import { RegimeComparativoModal } from './components/RegimeComparativoModal';
import { DemoTourModal } from './components/DemoTourModal';

export function App() {
  // Estado das Empresas com Persistência Local
  const [empresas, setEmpresas] = useState<Empresa[]>(() => {
    const saved = localStorage.getItem('mirante_tax_empresas');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Falha ao restaurar empresas do cache:', e);
      }
    }
    return PERFIS_EMPRESAS_PADRAO;
  });

  // Estado dos Parâmetros Globais com Persistência Local
  const [parametros, setParametros] = useState<ParametrosGlobais>(() => {
    const saved = localStorage.getItem('mirante_tax_parametros');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Falha ao restaurar parâmetros do cache:', e);
      }
    }
    return PARAMETROS_GLOBAIS_PADRAO;
  });

  // Navegação e Seleção
  const [abaAtiva, setAbaAtiva] = useState<'carteira' | 'projecao' | 'parametros' | 'metodologia'>('carteira');
  const [empresaSelecionadaId, setEmpresaSelecionadaId] = useState<string | null>(null);

  // Modais
  const [empresaParaEditar, setEmpresaParaEditar] = useState<Empresa | null>(null);
  const [modalEmpresaAberto, setModalEmpresaAberto] = useState(false);
  const [modalRelatorioAberto, setModalRelatorioAberto] = useState(false);
  const [modalRegimesAberto, setModalRegimesAberto] = useState(false);
  const [modalDemoAberto, setModalDemoAberto] = useState(false);

  // Modo Escuro / Claro
  const [modoEscuro, setModoEscuro] = useState<boolean>(() => {
    const saved = localStorage.getItem('mirante_tax_tema');
    return saved !== null ? saved === 'escuro' : false;
  });

  // Sincronizar tema no HTML
  useEffect(() => {
    const root = document.documentElement;
    if (modoEscuro) {
      root.classList.remove('tema-claro');
      root.classList.add('tema-escuro');
      localStorage.setItem('mirante_tax_tema', 'escuro');
    } else {
      root.classList.remove('tema-escuro');
      root.classList.add('tema-claro');
      localStorage.setItem('mirante_tax_tema', 'claro');
    }
  }, [modoEscuro]);

  // Persistir alterações de empresas
  useEffect(() => {
    localStorage.setItem('mirante_tax_empresas', JSON.stringify(empresas));
  }, [empresas]);

  // Persistir alterações de parâmetros
  useEffect(() => {
    localStorage.setItem('mirante_tax_parametros', JSON.stringify(parametros));
  }, [parametros]);

  const empresaAtiva = empresas.find(e => e.id === empresaSelecionadaId) || null;

  // Ranking das empresas mais urgentes para acesso rápido na barra lateral
  const empresasPrioritarias = useMemo(() => {
    return empresas
      .map(empresa => {
        const projecao = calcularProjecaoCompleta(
          empresa,
          parametros,
          empresa.alavancasAtivas || { reajustePreco: false, prorrogacaoFornecedor: false, corteCusto: false },
          24
        );
        return { empresa, nivel: projecao.risco.nivel, ordem: projecao.risco.ordem };
      })
      .filter(item => item.ordem >= 3)
      .sort((a, b) => b.ordem - a.ordem)
      .slice(0, 4)
      .map(({ empresa, nivel }) => ({ empresa, nivel }));
  }, [empresas, parametros]);

  // Handlers de Seleção e Navegação
  const handleSelecionarEmpresa = (empresa: Empresa | null) => {
    if (empresa) {
      setEmpresaSelecionadaId(empresa.id);
      setAbaAtiva('projecao');
    } else {
      setEmpresaSelecionadaId(null);
      setAbaAtiva('carteira');
    }
  };

  const handleVoltarCarteira = () => {
    setAbaAtiva('carteira');
  };

  // Handlers de Edição e Criação de Empresa
  const handleNovaEmpresa = () => {
    setEmpresaParaEditar(null);
    setModalEmpresaAberto(true);
  };

  const handleEditarEmpresa = (empresa: Empresa) => {
    setEmpresaParaEditar(empresa);
    setModalEmpresaAberto(true);
  };

  const handleSalvarEmpresa = (empresaSalva: Empresa) => {
    setEmpresas(prev => {
      const existe = prev.some(e => e.id === empresaSalva.id);
      if (existe) {
        return prev.map(e => e.id === empresaSalva.id ? empresaSalva : e);
      }
      return [empresaSalva, ...prev];
    });

    setModalEmpresaAberto(false);
    setEmpresaParaEditar(null);
  };

  // Atualizar Alavancas de uma Empresa
  const handleAtualizarAlavancas = (empresaId: string, alavancas: AlavancasAtivas) => {
    setEmpresas(prev => prev.map(e => {
      if (e.id === empresaId) {
        return {
          ...e,
          alavancasAtivas: alavancas
        };
      }
      return e;
    }));
  };

  // Alterar Regime da Empresa (Simples Unificado vs Regular)
  const handleAplicarRegime = (regime: Empresa['regime']) => {
    if (!empresaAtiva) return;
    setEmpresas(prev => prev.map(e => {
      if (e.id === empresaAtiva.id) {
        return {
          ...e,
          regime,
          alavancasAtivas: {
            ...e.alavancasAtivas,
            opcaoRegimeRegular: regime === 'simples_regular'
          }
        };
      }
      return e;
    }));
    setModalRegimesAberto(false);
  };

  // Handlers de CSV
  const handleExportarCSV = (subconjunto?: Empresa[]) => {
    exportarCarteiraCSV(subconjunto || empresas);
  };

  const handleImportarCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (text) {
        const importadas = parseCarteiraCSV(text);
        if (importadas.length > 0) {
          setEmpresas(importadas);
          alert(`${importadas.length} empresas importadas com sucesso!`);
        } else {
          alert('Nenhum registro válido encontrado no arquivo CSV.');
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleRestaurarPadroes = () => {
    if (confirm('Deseja restaurar as 8 empresas de referência e os parâmetros globais padrão?')) {
      setEmpresas(PERFIS_EMPRESAS_PADRAO);
      setParametros(PARAMETROS_GLOBAIS_PADRAO);
      setEmpresaSelecionadaId(null);
      setAbaAtiva('carteira');
    }
  };

  // Tour Demo 20s - Ir direto para Comercial Silva e abrir Projeção
  const handleIrParaComercialSilva = () => {
    const comercialSilva = empresas.find(e => e.id === 'comercial-silva') || empresas[0];
    if (comercialSilva) {
      setEmpresaSelecionadaId(comercialSilva.id);
      setAbaAtiva('projecao');
    }
    setModalDemoAberto(false);
  };

  return (
    <div className="min-h-screen bg-fundo text-textoPrimario flex flex-col md:flex-row font-sans transition-colors duration-200">
      {/* Barra Lateral de Navegação */}
      <div className="print:hidden">
        <Sidebar
          abaAtiva={abaAtiva}
          onMudarAba={(aba) => {
            setAbaAtiva(aba);
            if (aba === 'carteira') setEmpresaSelecionadaId(null);
          }}
          empresas={empresas}
          empresasPrioritarias={empresasPrioritarias}
          onSelecionarEmpresa={handleSelecionarEmpresa}
          modoEscuro={modoEscuro}
          onToggleModoEscuro={() => setModoEscuro(prev => !prev)}
          onAbrirDemo={() => setModalDemoAberto(true)}
        />
      </div>

      {/* Conteúdo Principal */}
      <main className="flex-1 min-w-0 px-4 sm:px-6 md:px-8 py-5 md:py-6">
        <div className="max-w-6xl mx-auto">
          {abaAtiva === 'carteira' && (
            <CarteiraView
              empresas={empresas}
              parametros={parametros}
              onSelecionarEmpresa={handleSelecionarEmpresa}
              onNovaEmpresa={handleNovaEmpresa}
              onExportarCSV={handleExportarCSV}
              onImportarCSV={handleImportarCSV}
              onRestaurarPerfisPadrao={handleRestaurarPadroes}
              onIniciarDemo20s={() => setModalDemoAberto(true)}
            />
          )}

          {abaAtiva === 'projecao' && empresaAtiva && (
            <ProjecaoView
              empresa={empresaAtiva}
              parametros={parametros}
              onVoltarCarteira={handleVoltarCarteira}
              onEditarEmpresa={handleEditarEmpresa}
              onAbrirRelatorio={() => setModalRelatorioAberto(true)}
              onAbrirComparativoRegimes={() => setModalRegimesAberto(true)}
              onAtualizarAlavancasEmpresa={handleAtualizarAlavancas}
              modoEscuro={modoEscuro}
            />
          )}

          {abaAtiva === 'parametros' && (
            <ParametrosGlobaisView
              parametros={parametros}
              onSalvarParametros={setParametros}
              onRestaurarPadrao={() => setParametros(PARAMETROS_GLOBAIS_PADRAO)}
            />
          )}

          {abaAtiva === 'metodologia' && (
            <MetodologiaView />
          )}
        </div>
      </main>

      {/* Modais da Aplicação */}
      {modalEmpresaAberto && (
        <EmpresaModal
          empresa={empresaParaEditar}
          onSalvar={handleSalvarEmpresa}
          onFechar={() => {
            setModalEmpresaAberto(false);
            setEmpresaParaEditar(null);
          }}
        />
      )}

      {modalRelatorioAberto && empresaAtiva && (
        <RelatorioModal
          empresa={empresaAtiva}
          parametros={parametros}
          onFechar={() => setModalRelatorioAberto(false)}
        />
      )}

      {modalRegimesAberto && empresaAtiva && (
        <RegimeComparativoModal
          empresa={empresaAtiva}
          parametros={parametros}
          onFechar={() => setModalRegimesAberto(false)}
          onAplicarRegime={handleAplicarRegime}
        />
      )}

      {modalDemoAberto && (
        <DemoTourModal
          onFechar={() => setModalDemoAberto(false)}
          onIrParaComercialSilva={handleIrParaComercialSilva}
        />
      )}
    </div>
  );
}
export default App;
