import React from 'react';
import { BookOpen, CheckCircle2, ShieldCheck, FileSpreadsheet, Cpu, Layers } from 'lucide-react';

export const MetodologiaView: React.FC = () => {
  return (
    <div className="space-y-4">
      {/* Cabeçalho */}
      <div className="bg-superficie border border-line rounded-xl p-5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-acento/10 text-acento">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-textoPrimario">
              Metodologia, Evidências & Fundamentação Normativa
            </h1>
            <p className="text-xs text-textoSecundario">
              Base técnica e determinística do motor Mirante Tax · Solveathon SESCAP 2026
            </p>
          </div>
        </div>
      </div>

      {/* Grid de Fundamentação */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Bloco 1: O Efeito Split Payment e o Float */}
        <div className="bg-superficie border border-line rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2.5 text-acento font-semibold text-xs uppercase tracking-wide">
            <Cpu className="w-4 h-4" />
            <h3>1. A Dinâmica do Split Payment (Bloco A)</h3>
          </div>
          <p className="text-xs text-textoSecundario leading-relaxed">
            Hoje, as empresas recebem 100% do valor da venda de seus clientes e retêm os tributos até a data de vencimento da guia mensal (dia 20 do mês seguinte). Esse intervalo temporal funciona como um <strong className="text-textoPrimario">financiamento operacional gratuito (float tributário)</strong>.
          </p>
          <p className="text-xs text-textoSecundario leading-relaxed">
            Com a implantação do Split Payment da CBS/IBS (LC 214/2025), o valor do imposto é segregado instantaneamente na liquidação financeira de pagamentos eletrônicos (Boleto, PIX, Cartões). O caixa da PME perde o float de forma imediata, sofrendo um <strong className="text-textoPrimario">choque de liquidez</strong> no mês de transição.
          </p>
        </div>

        {/* Bloco 2: O Ciclo do Crédito Tributário */}
        <div className="bg-superficie border border-line rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2.5 text-confirmacao font-semibold text-xs uppercase tracking-wide">
            <Layers className="w-4 h-4" />
            <h3>2. Dependência do Crédito de Insumos (Blocos B e C)</h3>
          </div>
          <p className="text-xs text-textoSecundario leading-relaxed">
            No novo modelo não-cumulativo pleno, a apropriação do crédito tributário depende do recolhimento efetivo pelo fornecedor. Se o fornecedor estiver em atraso fiscal, o crédito fica retido até a regularização.
          </p>
          <p className="text-xs text-textoSecundario leading-relaxed">
            Além disso, o ciclo de homologação e compensação de créditos leva em média <strong className="text-textoPrimario">60 dias</strong>, imobilizando capital de giro durante o período de apuração.
          </p>
        </div>

        {/* Bloco 3: O Prazo de Decisão como Atributo de Primeira Classe */}
        <div className="bg-superficie border border-line rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2.5 text-acento font-semibold text-xs uppercase tracking-wide">
            <ShieldCheck className="w-4 h-4" />
            <h3>3. A Inovação dos Prazos de Decisão</h3>
          </div>
          <p className="text-xs text-textoSecundario leading-relaxed">
            Ferramentas tradicionais limitam-se a calcular o imposto devido no mês. O <strong className="text-textoPrimario">Mirante Tax</strong> inova ao projetar a curva de liquidez futura e fixar um <strong className="text-textoPrimario">prazo-limite de decisão</strong> para cada alavanca estratégica.
          </p>
          <p className="text-xs text-textoSecundario leading-relaxed">
            Se a empresa precisar reajustar tabelas de preços ou renegociar contratos de fornecimento, ela precisa agir de <strong className="text-textoPrimario">2 a 3 meses antes</strong> do mês em que o saldo romperá o piso operacional.
          </p>
        </div>

        {/* Bloco 4: Princípios de Design & Auditabilidade */}
        <div className="bg-superficie border border-line rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2.5 text-sky-500 font-semibold text-xs uppercase tracking-wide">
            <FileSpreadsheet className="w-4 h-4" />
            <h3>4. Motor 100% Determinístico e Auditável</h3>
          </div>
          <ul className="space-y-2 text-xs text-textoSecundario">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-confirmacao shrink-0" />
              <span>Nenhuma inferência probabilística ou IA oculta no cálculo de caixa.</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-confirmacao shrink-0" />
              <span>Memória de cálculo aberta com substituição numérica passo a passo.</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-confirmacao shrink-0" />
              <span>Pareceres emitidos e assinados sob a responsabilidade do escritório.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

