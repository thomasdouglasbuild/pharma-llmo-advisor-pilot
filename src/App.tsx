
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { QueryClient } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';

import Index from '@/pages/Index';
import PharmaDashboard from '@/pages/PharmaDashboard';
import SelectionPage from '@/pages/SelectionPage';
import Dashboard from '@/pages/Dashboard';
import ProductAnalysisPage from '@/pages/ProductAnalysisPage';
import EnhancedAnalysisPage from '@/pages/EnhancedAnalysisPage';
import NotFound from '@/pages/NotFound';
import { Toaster } from '@/components/ui/toaster';

function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
        <p className="text-gray-600 mb-4">{error.message}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Reload page
        </button>
      </div>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <QueryClientProvider client={new QueryClient()}>
        <BrowserRouter>
          <div className="min-h-screen bg-background">
            <Toaster />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/pharma-dashboard" element={<PharmaDashboard />} />
              <Route path="/selection" element={<SelectionPage />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/product-analysis" element={<ProductAnalysisPage />} />
              <Route path="/enhanced-analysis" element={<EnhancedAnalysisPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
