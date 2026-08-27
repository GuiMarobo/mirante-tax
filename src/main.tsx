import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import {PortalClienteView} from './components/PortalClienteView.tsx';
import {PortalClienteInvalido} from './components/PortalClienteInvalido.tsx';
import {lerPacoteDaURL, ehSessaoPortal} from './utils/portalCliente.ts';
import './index.css';

// O portal do cliente é uma raiz separada: nenhum estado, navegação ou dado
// da carteira do escritório é montado quando a sessão vem por link de cliente.
const pacoteCliente = lerPacoteDaURL();

const raiz = pacoteCliente
  ? <PortalClienteView pacote={pacoteCliente} />
  : ehSessaoPortal()
    ? <PortalClienteInvalido />
    : <App />;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {raiz}
  </StrictMode>,
);
