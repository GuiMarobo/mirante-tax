import React, { useState, useId, useRef } from 'react';
import { ProjecaoResultado } from '../types';

interface GraficoProjecaoProps {
  projecao: ProjecaoResultado;
  horizonteMeses: number;
  onMudarHorizonte: (meses: number) => void;
  modoEscuro: boolean;
}

export const GraficoProjecao: React.FC<GraficoProjecaoProps> = ({
  projecao,
  horizonteMeses,
  onMudarHorizonte,
  modoEscuro
}) => {
  const chartUid = useId();
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const { cenarioBase, cenarioConservador, cenarioPessimista, cenarioComAlavancas, memoriaCalculo } = projecao;
  const piso = memoriaCalculo.pisoOperacional;

  const pontos = cenarioBase.pontos;
  const pontosComAlavanca = cenarioComAlavancas?.pontos;

  // Dimensões do SVG
  const width = 860;
  const height = 360;
  const padLeft = 75;
  const padRight = 35;
  const padTop = 30;
  const padBottom = 45;

  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  // Determinar limites Y
  const todosSaldos = [
    ...cenarioBase.saldos,
    ...cenarioConservador.saldos,
    ...cenarioPessimista.saldos,
    ...(cenarioComAlavancas ? cenarioComAlavancas.saldos : []),
    piso,
    0
  ];

  const minSaldoReal = Math.min(...todosSaldos);
  const maxSaldoReal = Math.max(...todosSaldos);

  // Margem de respiro
  const minY = Math.floor(Math.min(minSaldoReal * 1.15, -20000) / 10000) * 10000;
  const maxY = Math.ceil(Math.max(maxSaldoReal * 1.15, piso * 1.4) / 20000) * 20000;

  const scaleX = (index: number) => padLeft + (index / (pontos.length - 1)) * chartW;
  const scaleY = (val: number) => padTop + chartH - ((val - minY) / (maxY - minY)) * chartH;

  // Suporte a toque: mapeia a posição do dedo para o mês mais próximo (mobile não tem hover)
  const handleTouch = (e: React.TouchEvent<SVGSVGElement>) => {
    const touch = e.touches[0];
    if (!touch || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const relX = touch.clientX - rect.left;
    const svgX = (relX / rect.width) * width;
    const idx = Math.round(((svgX - padLeft) / chartW) * (pontos.length - 1));
    setHoverIndex(Math.max(0, Math.min(pontos.length - 1, idx)));
  };

  // Gerar caminhos de linhas e áreas
  const pathConservador = cenarioConservador.pontos
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(i).toFixed(1)} ${scaleY(p.saldo).toFixed(1)}`)
    .join(' ');

  const pathPessimistaRev = [...cenarioPessimista.pontos]
    .reverse()
    .map((p, i) => `L ${scaleX(pontos.length - 1 - i).toFixed(1)} ${scaleY(p.saldo).toFixed(1)}`)
    .join(' ');

  const areaFaixaCenarios = `${pathConservador} ${pathPessimistaRev} Z`;

  const pathBase = cenarioBase.pontos
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(i).toFixed(1)} ${scaleY(p.saldo).toFixed(1)}`)
    .join(' ');

  const pathAlavancas = pontosComAlavanca
    ? pontosComAlavanca.map((p, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(i).toFixed(1)} ${scaleY(p.saldo).toFixed(1)}`).join(' ')
    : null;

  // Ponto crítico (primeiro cruzamento do piso)
  const primeiroCritico = cenarioBase.primeiroCritico;
  const pontoCritico = primeiroCritico !== null ? pontos[primeiroCritico] : null;

  // Mês do Split
  const splitPontoIndex = pontos.findIndex(p => p.ehMesSplit);
  const xSplit = splitPontoIndex !== -1 ? scaleX(splitPontoIndex) : null;

  // Grid lines em Y
  const numGridLines = 5;
  const stepY = (maxY - minY) / numGridLines;
  const gridVals = Array.from({ length: numGridLines + 1 }, (_, i) => minY + i * stepY);

  const hoverPonto = hoverIndex !== null ? pontos[hoverIndex] : null;
  const hoverPontoAlavanca = hoverIndex !== null && pontosComAlavanca ? pontosComAlavanca[hoverIndex] : null;

  // Cores dinâmicas para tema
  const strokeGrid = modoEscuro ? '#29334A' : '#E7E9ED';
  const textMuted = modoEscuro ? '#8B95AB' : '#667085';
  const baseColor = cenarioComAlavancas ? (modoEscuro ? '#8B95AB' : '#94A3B8') : (modoEscuro ? '#34B27A' : '#16A34A');

  return (
    <div className="w-full bg-superficie rounded-xl border border-line p-4">
      {/* Controles de Topo do Gráfico */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-line">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-xs font-medium text-textoSecundario">
              {cenarioComAlavancas ? 'Curva base (ref.)' : 'Projeção base (8,8% CBS)'}
            </span>
          </div>

          {cenarioComAlavancas && (
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-400"></span>
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                Curva ajustada c/ alavancas
              </span>
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-0.5 bg-red-500"></span>
            <span className="text-xs text-textoSecundario">
              Piso op. (R$ {piso.toLocaleString('pt-BR')})
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 bg-emerald-500/20 rounded-sm"></span>
            <span className="text-xs text-textoSecundario">
              Faixa de cenários (8,4% a 9,21%)
            </span>
          </div>
        </div>

        {/* Seletor de Horizonte */}
        <div className="flex items-center gap-1 bg-superficieElevada p-1 rounded-lg">
          <button
            type="button"
            onClick={() => onMudarHorizonte(24)}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              horizonteMeses === 24 ? 'bg-superficie text-textoPrimario shadow-sm' : 'text-textoSecundario hover:text-textoPrimario'
            }`}
          >
            24 meses
          </button>
          <button
            type="button"
            onClick={() => onMudarHorizonte(36)}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              horizonteMeses === 36 ? 'bg-superficie text-textoPrimario shadow-sm' : 'text-textoSecundario hover:text-textoPrimario'
            }`}
          >
            36 meses
          </button>
          <button
            type="button"
            onClick={() => onMudarHorizonte(84)}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              horizonteMeses === 84 ? 'bg-superficie text-textoPrimario shadow-sm' : 'text-textoSecundario hover:text-textoPrimario'
            }`}
          >
            Até 2033 (84m)
          </button>
        </div>
      </div>

      {/* Container SVG Responsivo */}
      <div className="relative w-full overflow-hidden" ref={containerRef}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto select-none touch-none"
          onMouseLeave={() => setHoverIndex(null)}
          onTouchStart={handleTouch}
          onTouchMove={handleTouch}
        >
          <defs>
            {/* Gradiente da Faixa de Cenários */}
            <linearGradient id={`faixaGrad-${chartUid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4A9188" stopOpacity={modoEscuro ? 0.35 : 0.25} />
              <stop offset="100%" stopColor="#4A9188" stopOpacity={modoEscuro ? 0.08 : 0.05} />
            </linearGradient>

            {/* Gradiente Zona de Perigo (Abaixo do Piso) */}
            <linearGradient id={`dangerZoneGrad-${chartUid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#C4552F" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#C4552F" stopOpacity={0.02} />
            </linearGradient>
          </defs>

          {/* Grid Horizontal de Valores Y */}
          {gridVals.map((val, idx) => {
            const y = scaleY(val);
            return (
              <g key={idx}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={width - padRight}
                  y2={y}
                  stroke={val === 0 ? (modoEscuro ? '#EF4444' : '#DC2626') : strokeGrid}
                  strokeDasharray={val === 0 ? '4 4' : '2 2'}
                  strokeWidth={val === 0 ? 1.5 : 1}
                />
                <text
                  x={padLeft - 10}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="10"
                  fontFamily="IBM Plex Mono, monospace"
                  fill={val < 0 ? '#EF4444' : textMuted}
                >
                  {val >= 1000 || val <= -1000 ? `${(val / 1000).toFixed(0)}k` : val}
                </text>
              </g>
            );
          })}

          {/* Linha do Piso Operacional */}
          <g>
            <line
              x1={padLeft}
              y1={scaleY(piso)}
              x2={width - padRight}
              y2={scaleY(piso)}
              stroke="#C4552F"
              strokeDasharray="6 4"
              strokeWidth="1.8"
            />
            {/* Zona Sombreada Abaixo do Piso */}
            <rect
              x={padLeft}
              y={scaleY(piso)}
              width={chartW}
              height={Math.max(0, scaleY(minY) - scaleY(piso))}
              fill={`url(#dangerZoneGrad-${chartUid})`}
            />
          </g>

          {/* Marcador Vertical: Mês de Entrada do Split (Julho/2027) */}
          {xSplit !== null && (
            <g>
              <line
                x1={xSplit}
                y1={padTop}
                x2={xSplit}
                y2={height - padBottom}
                stroke="#D4A24C"
                strokeWidth="1.8"
                strokeDasharray="4 3"
              />
              <rect
                x={xSplit - 48}
                y={padTop - 2}
                width="96"
                height="18"
                rx="4"
                fill="#D4A24C"
              />
              <text
                x={xSplit}
                y={padTop + 11}
                textAnchor="middle"
                fontSize="9"
                fontFamily="IBM Plex Mono, monospace"
                fontWeight="bold"
                fill="#0E1A24"
              >
                SPLIT PAYMENT
              </text>
            </g>
          )}

          {/* Faixa Sombreada entre Cenários (8,4% a 9,21%) */}
          <path d={areaFaixaCenarios} fill={`url(#faixaGrad-${chartUid})`} />

          {/* Linha Base de Projeção */}
          <path
            d={pathBase}
            fill="none"
            stroke={baseColor}
            strokeWidth={cenarioComAlavancas ? 1.8 : 2.5}
            strokeDasharray={cenarioComAlavancas ? '4 3' : 'none'}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Linha com Alavancas Ativas */}
          {pathAlavancas && (
            <path
              d={pathAlavancas}
              fill="none"
              stroke="#D4A24C"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Ponto de Primeiro Cruzamento do Piso (Mês Crítico) */}
          {pontoCritico && primeiroCritico !== null && (
            <g transform={`translate(${scaleX(primeiroCritico)}, ${scaleY(pontoCritico.saldo)})`}>
              <circle r="9" fill="#C4552F" fillOpacity="0.25" className="animate-ping" />
              <circle r="6" fill="#C4552F" stroke="#FFFFFF" strokeWidth="2" />
              <text
                y="-14"
                textAnchor="middle"
                fontSize="10"
                fontFamily="IBM Plex Mono, monospace"
                fontWeight="bold"
                fill="#C4552F"
              >
                1º Mês Crítico ({pontoCritico.rotulo})
              </text>
            </g>
          )}

          {/* Rótulos no Eixo X (Meses) */}
          {pontos.map((p, i) => {
            const showLabel = horizonteMeses > 36 ? (i % 6 === 0) : (horizonteMeses === 36 ? (i % 3 === 0) : (i % 2 === 0));
            if (!showLabel && i !== pontos.length - 1 && i !== splitPontoIndex) return null;

            const x = scaleX(i);
            return (
              <g key={i}>
                <line
                  x1={x}
                  y1={height - padBottom}
                  x2={x}
                  y2={height - padBottom + 5}
                  stroke={strokeGrid}
                />
                <text
                  x={x}
                  y={height - padBottom + 18}
                  textAnchor="middle"
                  fontSize="10"
                  fontFamily="IBM Plex Mono, monospace"
                  fill={p.ehMesSplit ? '#D4A24C' : textMuted}
                  fontWeight={p.ehMesSplit ? 'bold' : 'normal'}
                >
                  {p.rotulo}
                </text>
              </g>
            );
          })}

          {/* Interatividade de Scrubbing / Hover */}
          {pontos.map((p, i) => {
            const x = scaleX(i);
            return (
              <rect
                key={i}
                x={x - chartW / (pontos.length * 2)}
                y={padTop}
                width={chartW / pontos.length}
                height={chartH}
                fill="transparent"
                className="cursor-crosshair"
                onMouseEnter={() => setHoverIndex(i)}
              />
            );
          })}

          {/* Linha e Pontos de Hover */}
          {hoverIndex !== null && hoverPonto && (
            <g>
              <line
                x1={scaleX(hoverIndex)}
                y1={padTop}
                x2={scaleX(hoverIndex)}
                y2={height - padBottom}
                stroke="#D4A24C"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
              <circle
                cx={scaleX(hoverIndex)}
                cy={scaleY(hoverPonto.saldo)}
                r="5"
                fill={cenarioComAlavancas ? baseColor : '#4A9188'}
                stroke="#FFFFFF"
                strokeWidth="2"
              />
              {hoverPontoAlavanca && (
                <circle
                  cx={scaleX(hoverIndex)}
                  cy={scaleY(hoverPontoAlavanca.saldo)}
                  r="6"
                  fill="#D4A24C"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                />
              )}
            </g>
          )}
        </svg>

        {/* Tooltip Overlay Dinâmico */}
        {hoverIndex !== null && hoverPonto && (() => {
          // Posição calculada a partir da largura real renderizada do SVG (não do viewBox),
          // para não desalinhar em telas estreitas onde o SVG é escalado para baixo.
          const containerWidth = containerRef.current?.clientWidth || width;
          const scaleFactor = containerWidth / width;
          const tooltipWidth = 190;
          const leftPx = Math.min(
            Math.max(scaleX(hoverIndex) * scaleFactor - 90 * scaleFactor, 8),
            containerWidth - tooltipWidth - 8
          );
          return (
          <div
            className="absolute top-4 pointer-events-none bg-superficieElevada border border-line p-3 rounded-lg shadow-xl text-xs font-mono z-30 transition-all w-[190px]"
            style={{
              left: `${leftPx}px`,
            }}
          >
            <div className="font-bold text-textoPrimario border-b border-line pb-1 mb-1.5 flex items-center justify-between">
              <span>{hoverPonto.mesNome}</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] ${hoverPonto.abaixoPiso ? 'bg-alerta/20 text-alerta' : 'bg-confirmacao/20 text-confirmacao'}`}>
                {hoverPonto.abaixoPiso ? 'Abaixo do Piso' : 'Saudável'}
              </span>
            </div>
            
            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between gap-4">
                <span className="text-textoSecundario">Saldo Base:</span>
                <span className={`font-bold ${hoverPonto.saldo < 0 ? 'text-red-500' : (hoverPonto.abaixoPiso ? 'text-alerta' : 'text-textoPrimario')}`}>
                  R$ {hoverPonto.saldo.toLocaleString('pt-BR')}
                </span>
              </div>

              {hoverPontoAlavanca && (
                <div className="flex justify-between gap-4 text-acento">
                  <span className="font-semibold">Saldo c/ Alavancas:</span>
                  <span className="font-bold">
                    R$ {hoverPontoAlavanca.saldo.toLocaleString('pt-BR')}
                  </span>
                </div>
              )}

              <div className="flex justify-between gap-4 text-textoSecundario pt-1 border-t border-line/60">
                <span>Geração Líquida:</span>
                <span>R$ {hoverPonto.geracao.toLocaleString('pt-BR')}</span>
              </div>

              {hoverPonto.ehMesSplit && (
                <div className="text-amber-400 font-bold text-[10px] pt-1">
                  ⚡ Choque Split: -R$ {memoriaCalculo.choqueUnico.toLocaleString('pt-BR')}
                </div>
              )}
            </div>
          </div>
          );
        })()}
      </div>
    </div>
  );
};
