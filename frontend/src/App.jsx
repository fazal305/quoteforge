import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { Login } from '@/pages/Login'
import { Dashboard } from '@/pages/Dashboard'
import { Quotes } from '@/pages/Quotes'
import { QuoteBuilder } from '@/pages/QuoteBuilder'
import { QuoteView } from '@/pages/QuoteView'
import { Customers } from '@/pages/Customers'
import { Catalog } from '@/pages/Catalog'
import { Invoices } from '@/pages/Invoices'
import { Settings } from '@/pages/Settings'
import { PublicQuote } from '@/pages/PublicQuote'
import { NotFound } from '@/pages/NotFound'

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/quote/:token" element={<PublicQuote />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/quotes" element={<Quotes />} />
            <Route path="/quotes/new" element={<QuoteBuilder />} />
            <Route path="/quotes/:id/edit" element={<QuoteBuilder />} />
            <Route path="/quotes/:id" element={<QuoteView />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}
