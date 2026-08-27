import React from 'react';
import { ProjecaoResultado, Empresa } from '../types';
import { AlertCircle, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';

interface VereditoCardProps {
  projecao: ProjecaoResultado;
  empresa: Empresa;
  onAplicarAlavancasRecomendadas?: () => void;
}

export const VereditoCard: React.FC<VereditoCardProps> = ({
  projecao,
  empresa
}) => {
  const { cenarioBase, cenarioComAlavancas, risco, memoriaCalculo } = projecao;
  const mesCriticoPonto = cenarioBase.primeiroCritico !== null ? cenarioBase.pontos[cenarioBase.primeiroCritico] : null;

  const temAlavancasAtivas = !!cenarioComAlavancas;
  const recuperouComAlavancas = cenarioComAlavancas && cenarioComAlavancas.mesesAbaixoPiso === 0 && !cenarioComAlavancas.ficaNegativo;
  const melhoriaMeses = cenarioComAlavancas ? cenarioBase.mesesAbaixoPiso - cenarioComAlavancas.mesesAbaixoPiso : 0;
  const diferencaMenorSaldo = cenarioComAlavancas ? cenarioComAlavancas.menorSaldo - cenarioBase.menorSaldo : 0;

  const borderColor = risco.nivel === 'Crítico' ? 'border-l-[3px] border-l-alerta' :
    risco.nivel === 'Alto' ? 'border-l-[3px] border-l-amber-500' :
    risco.nivel === 'Baixo' ? 'border-l-[3px] border-l-confirmacao' : 'border-l-[3px] border-l-yellow-500';

  return (
    <div className={`bg-superficie border border-line rounded-xl ${borderColor} p-5`}>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-line">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-lg ${
            risco.nivel === 'Crítico' ? 'bg-alerta/15 text-alerta' :
            risco.nivel === 'Alto' ? 'bg-amber-500/15 text-amber-500' :
            risco.nivel === 'Médio' ? 'bg-yellow-500/15 text-yellow-500' :
            'bg-confirmacao/15 text-confirmacao'
          }`}>
            {risco.nivel === 'Crítico' ? <AlertCircle className="w-5 h-5" /> :
             risco.nivel === 'Alto' ? <AlertTriangle className="w-5 h-5" /> :
             <ShieldCheck className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-textoPrimario">
              Veredito Executivo do Escritório
            </h3>
            <p className="text-xs text-textoSecundario">
              Diagnóstico determinístico de resiliência e capital de giro
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div>
            <span className="text-textoSecundario block text-[10px]">1ª Ruptura</span>
            <strong className={mesCriticoPonto ? 'text-alerta text-sm' : 'text-confirmacao text-sm'}>
              {mesCriticoPonto ? mesCriticoPonto.rotulo : 'Nenhuma'}
            </strong>
          </div>
          <div className="border-l border-line pl-4">
            <span className="text-textoSecundario block text-[10px]">Menor Saldo</span>
            <strong className={`text-sm ${cenarioBase.menorSaldo < 0 ? 'text-alerta' : (cenarioBase.menorSaldo < memoriaCalculo.pisoOperacional ? 'text-alerta' : 'text-confirmacao')}`}>
              R$ {cenarioBase.menorSaldo.toLocaleString('pt-BR')}
            </strong>
          </div>
          <div className="border-l border-line pl-4">
            <span className="text-textoSecundario block text-[10px]">Meses no Piso</span>
            <strong className="text-sm text-textoPrimario">
              {cenarioBase.mesesAbaixoPiso} / 24
            </strong>
          </div>
        </div>
      </div>

      <div className="text-xs leading-relaxed text-textoPrimario bg-superficieElevada rounded-lg p-4">
        <p className="mb-2">
          <strong>Diagnóstico:</strong> A empresa <em>{empresa.nome}</em> apresenta perfil com <strong>descasamento de ciclo de {memoriaCalculo.descasamentoCiclo > 0 ? `+${memoriaCalculo.descasamentoCiclo}` : memoriaCalculo.descasamentoCiclo} dias</strong> (recebimento em {empresa.prazoRecebimento}d vs pagamento em {empresa.prazoPagamento}d) e forte concentração de vendas em meios eletrônicos sujeitos ao Split Payment ({memoriaCalculo.mixExpostoSplit}% da receita).
        </p>

        {mesCriticoPonto ? (
          <p className="mb-2 text-textoSecundario">
            Com a entrada do Split Payment em Julho/2027, o caixa sofrerá um <strong className="text-textoPrimario">choque de R$ {memoriaCalculo.choqueUnico.toLocaleString('pt-BR')}</strong> (perda do float de R$ {memoriaCalculo.retidoNoSplit.toLocaleString('pt-BR')} + capital preso de crédito de R$ {memoriaCalculo.capitalPreso.toLocaleString('pt-BR')}), rompendo o piso operacional de segurança em <strong className="text-textoPrimario">{mesCriticoPonto.mesNome}</strong> e atingindo a mínima de <strong className="text-textoPrimario">R$ {cenarioBase.menorSaldo.toLocaleString('pt-BR')}</strong>.
          </p>
        ) : (
          <p className="mb-2 text-confirmacao">
            A empresa mantém fluxo de caixa saudável durante todo o horizonte projetado, com caixa mínimo de <strong>R$ {cenarioBase.menorSaldo.toLocaleString('pt-BR')}</strong>, preservando o piso operacional de R$ {memoriaCalculo.pisoOperacional.toLocaleString('pt-BR')}.
          </p>
        )}

        {temAlavancasAtivas && (
          <div className="mt-3 pt-3 border-t border-line/70">
            <div className="flex items-center gap-2 text-acento font-semibold text-xs mb-1">
              <Zap className="w-3.5 h-3.5" />
              <span>Efeito das alavancas ativadas</span>
            </div>
            <p className="text-xs text-textoPrimario">
              {recuperouComAlavancas ? (
                <span>As alavancas ativadas <strong>eliminaram todos os meses de risco</strong>, restaurando a resiliência operacional com menor saldo de <strong>R$ {cenarioComAlavancas?.menorSaldo.toLocaleString('pt-BR')}</strong> (+R$ {diferencaMenorSaldo.toLocaleString('pt-BR')} de liquidez).</span>
              ) : (
                <span>As ações reduziram o período crítico em <strong>{melhoriaMeses} meses</strong>, elevando o menor saldo de R$ {cenarioBase.menorSaldo.toLocaleString('pt-BR')} para <strong>R$ {cenarioComAlavancas?.menorSaldo.toLocaleString('pt-BR')}</strong> (+R$ {diferencaMenorSaldo.toLocaleString('pt-BR')}).</span>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
