import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { AppStateProvider } from './store/AppState'
import { registerServiceWorker, requestPersistentStorage } from './services/pwa'
import './styles/global.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppStateProvider>
      <App />
    </AppStateProvider>
  </StrictMode>,
)

// Kicked off after render so neither call delays first paint. The worker is
// skipped in dev, where a cached shell fights the Vite dev server.
if (import.meta.env.PROD) void registerServiceWorker()
void requestPersistentStorage()
