import React from 'react';
import {createRoot} from 'react-dom/client';
import Vault from './vault';
import './globals.css';
createRoot(document.getElementById('root')!).render(<React.StrictMode><Vault/></React.StrictMode>);
