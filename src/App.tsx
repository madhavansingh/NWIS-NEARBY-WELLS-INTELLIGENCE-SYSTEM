import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import DocumentIntelligence from './pages/DocumentIntelligence';
import KnowledgeGraph from './pages/KnowledgeGraph';
import GISModule from './pages/GISModule';
import SimilarWells from './pages/SimilarWells';
import AICopilot from './pages/AICopilot';
import PredictiveAnalytics from './pages/PredictiveAnalytics';
import AlertEngine from './pages/AlertEngine';
import FormationHeatmap from './pages/FormationHeatmap';
import InstitutionalMemory from './pages/InstitutionalMemory';
import AdminPanel from './pages/AdminPanel';
import DigitalTwin from './pages/DigitalTwin';

export default function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  return (
    <div className={theme}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route element={<Layout theme={theme} setTheme={setTheme} />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/documents" element={<DocumentIntelligence />} />
            <Route path="/knowledge-graph" element={<KnowledgeGraph />} />
            <Route path="/gis" element={<GISModule />} />
            <Route path="/similar-wells" element={<SimilarWells />} />
            <Route path="/copilot" element={<AICopilot />} />
            <Route path="/analytics" element={<PredictiveAnalytics />} />
            <Route path="/alerts" element={<AlertEngine />} />
            <Route path="/heatmap" element={<FormationHeatmap />} />
            <Route path="/memory" element={<InstitutionalMemory />} />
            <Route path="/digital-twin" element={<DigitalTwin />} />
            <Route path="/admin" element={<AdminPanel />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}
