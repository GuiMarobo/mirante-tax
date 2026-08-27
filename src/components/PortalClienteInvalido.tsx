import React from 'react';
import { LinkIcon } from 'lucide-react';

/**
 * Exibido quando a URL declara `?portal=1` mas o token do fragmento está
 * ausente, truncado ou corrompido - o caso comum é o link ter sido cortado
 * ao passar por aplicativo de mensagem.
 */
export const PortalClienteInvalido: React.FC = () => (
  <div className="min-h-screen bg-fundo text-textoPrimario font-sans flex items-center justify-center p-6">
    <div className="max-w-md w-full bg-superficie border border-line rounded-xl p-6 text-center">
      <div className="w-10 h-10 rounded-lg bg-acento/10 text-acento flex items-center justify-center mx-auto mb-4">
        <LinkIcon className="w-5 h-5" />
      </div>

      <h1 className="text-base font-semibold">Link do painel incompleto</h1>

      <p className="text-sm text-textoSecundario mt-2 leading-relaxed">
        Não foi possível ler os dados deste painel. O endereço costuma quebrar quando é copiado pela metade ou
        cortado por um aplicativo de mensagem.
      </p>

      <p className="text-sm text-textoSecundario mt-3 leading-relaxed">
        Peça ao seu escritório contábil para reenviar o link completo do Mirante Tax.
      </p>
    </div>
  </div>
);
