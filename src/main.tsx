import './i18n'
import './index.css'

import { QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'sonner'
import App from './App.tsx'
import { queryClient } from './lib/queryClient'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster
        theme="dark"
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'var(--color-surface-elevated)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-primary)',
          },
        }}
      />
    </QueryClientProvider>
  </StrictMode>
)
