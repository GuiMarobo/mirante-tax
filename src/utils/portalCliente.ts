/**
 * Mirante Tax - Portal do Cliente
 *
 * Gera um link autocontido de leitura para a empresa analisada.
 * O pacote completo (empresa + parâmetros vigentes) viaja codificado no
 * fragmento da URL, que o navegador nunca envia ao servidor. Isso permite
 * abrir o dashboard em qualquer máquina sem backend e sem autenticação.
 *
 * Modelo de acesso: o link é a credencial. Quem tem o link vê o painel.
 * Não é controle de acesso robusto e a interface declara isso ao contador.
 */

import { Empresa, ParametrosGlobais } from '../types';

export interface PacotePortalCliente {
  v: 1;
  emitidoEm: string; // ISO
  escritorio: string;
  empresa: Empresa;
  parametros: ParametrosGlobais;
}

const CHAVE_ESCRITORIO = 'mirante_tax_escritorio';

export function lerNomeEscritorio(): string {
  return localStorage.getItem(CHAVE_ESCRITORIO) || 'Ledger Labs';
}

export function salvarNomeEscritorio(nome: string): void {
  localStorage.setItem(CHAVE_ESCRITORIO, nome.trim() || 'Ledger Labs');
}

/** UTF-8 -> base64 url-safe (sem padding) */
function codificarBase64Url(texto: string): string {
  const bytes = new TextEncoder().encode(texto);
  let binario = '';
  bytes.forEach(b => { binario += String.fromCharCode(b); });
  return btoa(binario).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** base64 url-safe -> UTF-8 */
function decodificarBase64Url(token: string): string {
  const base64 = token.replace(/-/g, '+').replace(/_/g, '/');
  const preenchido = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  const binario = atob(preenchido);
  const bytes = Uint8Array.from(binario, c => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function montarPacote(
  empresa: Empresa,
  parametros: ParametrosGlobais,
  escritorio: string
): PacotePortalCliente {
  // `notas` é o registro interno do escritório sobre o que ainda precisa ser
  // confirmado com o cliente. Não acompanha o pacote.
  const { notas: _notas, ...empresaPublica } = empresa;

  return {
    v: 1,
    emitidoEm: new Date().toISOString(),
    escritorio,
    empresa: empresaPublica,
    parametros,
  };
}

export function construirLinkPortal(pacote: PacotePortalCliente): string {
  const token = codificarBase64Url(JSON.stringify(pacote));
  const { origin, pathname } = window.location;

  // O GitHub Pages serve o projeto em um subdiretório (/mirante-tax/) e
  // responde com 301 quando a barra final está ausente. Como o link do
  // cliente é longo e será aberto em navegadores embutidos de aplicativo de
  // mensagem, normalizamos aqui em vez de depender do redirecionamento
  // preservar a query e o fragmento.
  const caminho = pathname.endsWith('/') || /\.[a-z0-9]+$/i.test(pathname)
    ? pathname
    : `${pathname}/`;

  return `${origin}${caminho}?portal=1#d=${token}`;
}

/**
 * Lê o pacote da URL atual. Retorna null quando a sessão não é do portal
 * ou quando o token está ausente, corrompido ou de versão incompatível.
 */
export function lerPacoteDaURL(): PacotePortalCliente | null {
  if (typeof window === 'undefined') return null;

  const params = new URLSearchParams(window.location.search);
  if (params.get('portal') !== '1') return null;

  const hash = window.location.hash;
  if (!hash.startsWith('#d=')) return null;

  try {
    const pacote = JSON.parse(decodificarBase64Url(hash.slice(3))) as PacotePortalCliente;
    if (pacote?.v !== 1 || !pacote.empresa?.id || !pacote.parametros) return null;
    return pacote;
  } catch (e) {
    console.error('Link do portal do cliente inválido ou corrompido:', e);
    return null;
  }
}

/** Verifica se a sessão foi aberta como portal, mesmo com token inválido. */
export function ehSessaoPortal(): boolean {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).get('portal') === '1';
}
