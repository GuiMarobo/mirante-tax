import React from 'react';

interface MiniSparklineProps {
  valores: number[];
  cor?: string;
  largura?: number;
  altura?: number;
  preencher?: boolean;
}

export const MiniSparkline: React.FC<MiniSparklineProps> = ({
  valores,
  cor = '#16A34A',
  largura = 96,
  altura = 32,
  preencher = true,
}) => {
  if (!valores || valores.length < 2) {
    return <svg width={largura} height={altura} />;
  }

  const min = Math.min(...valores);
  const max = Math.max(...valores);
  const range = max - min || 1;
  const passo = largura / (valores.length - 1);

  const pontos = valores.map((v, i) => {
    const x = i * passo;
    const y = altura - ((v - min) / range) * (altura - 4) - 2;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const linha = `M ${pontos.join(' L ')}`;
  const area = `${linha} L ${largura},${altura} L 0,${altura} Z`;

  return (
    <svg width={largura} height={altura} viewBox={`0 0 ${largura} ${altura}`} className="overflow-visible">
      {preencher && <path d={area} fill={cor} fillOpacity={0.12} stroke="none" />}
      <path d={linha} fill="none" stroke={cor} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

interface MiniBarrasProps {
  valores: { valor: number; cor: string }[];
  largura?: number;
  altura?: number;
}

export const MiniBarras: React.FC<MiniBarrasProps> = ({ valores, largura = 96, altura = 32 }) => {
  const max = Math.max(...valores.map(v => v.valor), 1);
  const gap = 3;
  const larguraBarra = (largura - gap * (valores.length - 1)) / valores.length;

  return (
    <svg width={largura} height={altura} viewBox={`0 0 ${largura} ${altura}`}>
      {valores.map((v, i) => {
        const h = Math.max(2, (v.valor / max) * (altura - 2));
        const x = i * (larguraBarra + gap);
        return (
          <rect
            key={i}
            x={x}
            y={altura - h}
            width={larguraBarra}
            height={h}
            rx={1.5}
            fill={v.cor}
            fillOpacity={0.85}
          />
        );
      })}
    </svg>
  );
};
