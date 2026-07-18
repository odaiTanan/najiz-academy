import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'

import App from './App'
import './index.css'
import { queryClient } from './lib/queryClient'
import { router } from './routes/router'
import { setAuthRedirectHandler } from './api/axios'

setAuthRedirectHandler((path) => {
  void router.navigate(path, { replace: true })
})

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)