import React from 'react';
import {createRoot} from 'react-dom/client';
import '../src/index.css';
import '../src/i18n';
import Avaliacoes from '../src/components/AvaliacoesServico';
const tipo = new URLSearchParams(location.search).get('tipo') || 'alojamento';
createRoot(document.getElementById('root')).render(<main style={{padding:'26px 20px',maxWidth:700,margin:'auto'}}><Avaliacoes tipo={tipo} itemId={41} usuarioLogado={{id:7,nome:'Teste',email:'teste@example.invalid'}} /></main>);
