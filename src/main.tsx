import './lib/authLanding';   // must run before the router or Supabase touch the address
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { configError } from './lib/supabase';
import './styles/app.css';
import './styles/card.css';
import './styles/buttons.css';
import './styles/niche.css';
import './styles/sig.css';
import './styles/sig2.css';
import './styles/sig3.css';
import './styles/sig4.css';
import './styles/worship-engine.css';
import './styles/worship-sello.css';
import './styles/miami.css';

const root = createRoot(document.getElementById('root')!);
root.render(configError
  ? <div className="center-msg"><h1>Setup needed</h1><p>{configError}</p></div>
  : <StrictMode><App /></StrictMode>);
