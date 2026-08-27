import React, { useState, useMemo } from 'react';
import { Empresa, ParametrosGlobais } from '../types';
import {
  montarPacote,
  construirLinkPortal,
  lerNomeEscritorio,
  salvarNomeEscritorio,
} from '../utils/portalCliente';
import { X, Share2, Copy, Check, ExternalLink, ShieldAlert } from 'lucide-react';

interface AcessoClienteModalProps {
  empresa: Empresa;
  parametros: ParametrosGlobais;
  onFechar: () => void;
}

export const AcessoClienteModal: React.FC<AcessoClienteModalProps> = ({
  empresa,
  parametros,
  onFechar,
}) => {
  const [escritorio, setEscritorio] = useState(lerNomeEscritorio);
  const [copiado, setCopiado] = useState(false);

  const link = useMemo(
    () => construirLinkPortal(montarPacote(empresa, parametros, escritorio)),
    [empresa, parametros, escritorio]
  );

  const handleCopiar = async () => {
    salvarNomeEscritorio(escritorio);
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      // Navegadores sem permissão de área de transferência: seleção manual
      const campo = document.getElementById('campo-link-portal') as HTMLInputElement | null;
      campo?.select();
      document.execCommand('copy');
    }
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const handleAbrir = () => {
    salvarNomeEscritorio(escritorio);
    window.open(link, '_blank', 'noopener');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-superficie border border-line rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-line">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-acento/10 text-acento">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-textoPrimario">
                Acesso do Cliente · {empresa.nome}
              </h2>
              <p className="text-[11px] text-textoSecundario">
                Link de leitura para o cliente acompanhar a própria situação
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

        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          <div>
            <label className="block text-[11px] font-medium text-textoSecundario mb-1.5">
              Nome do escritório exibido ao cliente
            </label>
            <input
              type="text"
              value={escritorio}
              onChange={(e) => setEscritorio(e.target.value)}
              onBlur={() => salvarNomeEscritorio(escritorio)}
              className="w-full px-3 py-2 bg-superficieElevada border border-line rounded-lg text-sm text-textoPrimario focus:outline-none focus:border-acento"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-textoSecundario mb-1.5">
              Link do painel
            </label>
            <div className="flex gap-2">
              <input
                id="campo-link-portal"
                type="text"
                readOnly
                value={link}
                onFocus={(e) => e.currentTarget.select()}
                className="flex-1 min-w-0 px-3 py-2 bg-superficieElevada border border-line rounded-lg text-xs font-mono text-textoSecundario focus:outline-none focus:border-acento"
              />
              <button
                type="button"
                onClick={handleCopiar}
                className="shrink-0 px-3 py-2 bg-acento text-black rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-1.5"
              >
                {copiado ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiado ? 'Copiado' : 'Copiar'}</span>
              </button>
              <button
                type="button"
                onClick={handleAbrir}
                title="Abrir em nova aba"
                className="shrink-0 px-3 py-2 bg-superficieElevada border border-line rounded-lg text-xs text-textoPrimario hover:border-acento/50 transition-colors flex items-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5 text-textoSecundario" />
                <span className="hidden sm:inline">Abrir</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-superficieElevada rounded-lg p-3">
              <div className="text-[11px] font-semibold text-textoPrimario mb-1.5">O cliente vê</div>
              <ul className="text-[11px] text-textoSecundario space-y-1 list-disc pl-4">
                <li>Veredito de risco em linguagem de negócio</li>
                <li>Curva de caixa com piso e mês crítico</li>
                <li>Faixa dos três cenários de alíquota</li>
                <li>Evolução ano a ano até 2033</li>
                <li>Alavancas com prazo-limite de decisão</li>
                <li>Premissas declaradas do modelo</li>
              </ul>
            </div>

            <div className="bg-superficieElevada rounded-lg p-3">
              <div className="text-[11px] font-semibold text-textoPrimario mb-1.5">O cliente não vê</div>
              <ul className="text-[11px] text-textoSecundario space-y-1 list-disc pl-4">
                <li>As demais empresas da carteira</li>
                <li>Edição de parâmetros da empresa</li>
                <li>Edição de premissas globais</li>
                <li>Ativação de alavancas na simulação</li>
                <li>Importação e exportação de carteira</li>
              </ul>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-acento/[0.06] border border-acento/25">
            <ShieldAlert className="w-4 h-4 text-acento shrink-0 mt-0.5" />
            <div className="text-[11px] text-textoSecundario leading-relaxed">
              <strong className="text-textoPrimario">O link é a credencial.</strong> Os dados da empresa viajam
              codificados no fragmento da URL, que o navegador não envia a nenhum servidor, e o painel funciona
              sem login em qualquer máquina. Em compensação, quem receber o link consegue abrir o painel: envie
              apenas ao responsável da empresa. O link carrega uma fotografia dos parâmetros no momento da
              geração - ao alterar a empresa ou as premissas globais, gere e envie um link novo.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
