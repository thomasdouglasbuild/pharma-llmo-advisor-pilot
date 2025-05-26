import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { QueryClient } from '@tanstack/react-query';

import Index from '@/pages/Index';
import PharmaDashboard from '@/pages/PharmaDashboard';
import SelectionPage from '@/pages/SelectionPage';
import Dashboard from '@/pages/Dashboard';
import ProductAnalysisPage from '@/pages/ProductAnalysisPage';
import EnhancedAnalysisPage from '@/pages/EnhancedAnalysisPage';
import NotFound from '@/pages/NotFound';
import { Toaster } from '@/components/ui/toaster';

function App() {
  return (
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
  );
}

export default App;
