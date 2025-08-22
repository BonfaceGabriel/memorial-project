import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import Gallery from "@/pages/Gallery";
import Tributes from "@/pages/Tributes";
import Information from "@/pages/Information";
import NotFound from "@/pages/NotFound";
import Eulogy from "@/pages/Eulogy";
import AdminPage from "@/pages/AdminPage";
import Login from "@/pages/Login";
import ScrollToTop from "@/components/ScrollToTop";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <div className="min-h-screen bg-blue-50 text-gray-800">
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/tributes" element={<Tributes />} />
            <Route path="/information" element={<Information />} />
            <Route path="/eulogy" element={<Eulogy />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </div>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
