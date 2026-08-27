import React, { useState } from 'react';
import { Zap, ArrowRight, ArrowLeft, Clock, X } from 'lucide-react';
import confetti from 'canvas-confetti';

interface DemoTourModalProps {
  onFechar: () => void;
  onIrParaComercialSilva: () => void;
}

export const DemoTourModal: React.FC<DemoTourModalProps> = ({
  onFechar,
  onIrParaComercialSilva
}) => {
  const [passo, setPasso] = useState<number>(1);

  const passos = [
    {
      numero: 1,
      titulo: '1. Diagnóstico Instantâneo da Carteira (5 segundos)',
      tempo: '0s - 5s',
      destaque: 'Por onde o escritório contábil deve começar?',
      conteudo: 'Na tela da Carteira, o sistema analisa todas as PMEs instantaneamente. Em 5 segundos, o contador identifica que empresas com descasamento de ciclo e alta exposição ao split payment entram em risco crítico de ruptura.',
      dica: 'A barra temporal segmentada de 24 meses destaca em vermelho os meses em que o caixa rompe o piso de segurança.'
    },
    {
      numero: 2,
      titulo: '2. Abrir Caso Crítico: Comercial Silva Ltda',
      tempo: '5s - 10s',
      destaque: 'Distribuidora alimentar com descasamento de ciclo',
      conteudo: 'Comercial Silva tem recebimento em 45 dias, pagamento em 30 dias e 83% das vendas em boleto/pix/cartão. No modelo tradicional, ela parece saudável, mas a perda do float no Split Payment causará um choque imediato.',
      dica: 'O motor calcula o Débito Bruto, o Float Retido e o Choque Único de forma 100% determinística e auditável.'
    },
    {
      numero: 3,
      titulo: '3. A Curva Cruza o Piso Operacional',
      tempo: '10s - 14s',
      destaque: 'Mês Crítico: Maio de 2027 (antes mesmo do Split pleno!)',
      conteudo: 'A projeção mostra a curva caindo e rompendo o piso operacional de R$ 52.000 em maio/2027, atingindo a mínima de R$ 31.997. A faixa entre 8,4% e 9,21% de CBS dá a segurança necessária para a tomada de decisão.',
      dica: 'A linha vermelha tracejada é o Piso Operacional (custo fixo mensal de sobrevivência da empresa).'
    },
    {
      numero: 4,
      titulo: '4. Ativação da Alavanca Estratégica',
      tempo: '14s - 17s',
      destaque: 'Reajuste planejado de 2,8% restaura o caixa',
      conteudo: 'Ao acionar a alavanca de reajuste de preço (2,8%), a curva sobe em tempo real. O piso operacional deixa de ser rompido e a empresa preserva R$ 85.000+ em liquidez de segurança.',
      dica: 'A alavanca simula o impacto instantaneamente sem necessidade de recálculo manual.'
    },
    {
      numero: 5,
      titulo: '5. O Insight Central: O Prazo-Limite de Decisão',
      tempo: '17s - 20s',
      destaque: 'O prazo de decisão vence antes do mês da crise!',
      conteudo: 'A alavanca tem prazo de decisão em Fevereiro/2027, enquanto o caixa só romperia em Maio/2027. Sem o Mirante Tax, o empresário só descobriria quando o caixa estivesse no vermelho, momento em que reajustar preço já seria tarde demais.',
      dica: 'Transforma o escritório contábil de mero emissor de guias em conselheiro estratégico indispensável.'
    }
  ];

  const passoAtual = passos[passo - 1];

  const avancar = () => {
    if (passo < passos.length) {
      setPasso(passo + 1);
    } else {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
      onIrParaComercialSilva();
    }
  };

  const voltar = () => {
    if (passo > 1) {
      setPasso(passo - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-superficie border border-line rounded-xl w-full max-w-xl shadow-2xl">
        {/* Cabeçalho do Tour */}
        <div className="flex items-center justify-between p-4 border-b border-line">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-acento/10 text-acento">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-textoPrimario">
                Roteiro de Pitch (20 Segundos)
              </h2>
              <p className="text-[10px] text-textoSecundario uppercase tracking-wide">
                Solveathon SESCAP 2026 · Contexto 1 · Desafios D3 e D2
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

        {/* Conteúdo do Passo */}
        <div className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="px-2 py-0.5 rounded-full bg-acento/10 text-acento border border-acento/30 text-[10px] font-semibold uppercase tracking-wide">
              Passo {passo} de {passos.length} ({passoAtual.tempo})
            </span>
            <div className="flex gap-1">
              {passos.map((p) => (
                <div
                  key={p.numero}
                  className={`h-1.5 transition-all ${
                    p.numero === passo ? 'w-5 bg-acento' : p.numero < passo ? 'w-2 bg-confirmacao' : 'w-2 bg-line'
                  }`}
                />
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-textoPrimario">
              {passoAtual.titulo}
            </h3>
            <div className="text-xs font-semibold text-acento mt-0.5">
              {passoAtual.destaque}
            </div>
          </div>

          <p className="text-xs text-textoSecundario leading-relaxed">
            {passoAtual.conteudo}
          </p>

          <div className="bg-superficieElevada/60 rounded-lg p-3 flex items-start gap-2 text-xs">
            <Clock className="w-4 h-4 text-acento shrink-0 mt-0.5" />
            <span className="text-textoSecundario text-[11px]">
              <strong className="text-textoPrimario">Nota técnica:</strong> {passoAtual.dica}
            </span>
          </div>
        </div>

        {/* Footer com Navegação */}
        <div className="p-3 border-t border-line flex items-center justify-between">
          <button
            type="button"
            onClick={voltar}
            disabled={passo === 1}
            className={`px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors ${
              passo === 1 ? 'text-line cursor-not-allowed' : 'text-textoSecundario hover:text-textoPrimario hover:bg-superficieElevada'
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Anterior</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onFechar}
              className="px-3 py-1.5 rounded-lg text-xs text-textoSecundario hover:text-textoPrimario hover:bg-superficieElevada"
            >
              Pular
            </button>

            <button
              type="button"
              onClick={avancar}
              className="px-4 py-1.5 rounded-lg bg-acento text-black font-semibold text-xs flex items-center gap-1.5 hover:opacity-90 transition-all shadow-sm"
            >
              <span>{passo === passos.length ? 'Ver Comercial Silva' : 'Próximo'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

