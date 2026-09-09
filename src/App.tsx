import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { FormPlayground } from './pages/FormPlayground';
import { ControlsLab } from './pages/ControlsLab';
import { NavigationLab } from './pages/NavigationLab';
import { DataTable } from './pages/DataTable';
import { ModalLab } from './pages/ModalLab';
import { DragDropLab } from './pages/DragDropLab';
import { FilesLab } from './pages/FilesLab';
import { ValidationLab } from './pages/ValidationLab';
import { StatePlayground } from './pages/StatePlayground';
import { AccessibilityLab } from './pages/AccessibilityLab';
import { TestScenarios } from './pages/TestScenarios';
import { InteractionCoverage } from './pages/InteractionCoverage';
import { About } from './pages/About';
import { NotFound } from './pages/NotFound';
import './App.css';

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/"              element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard"     element={<Dashboard />} />
            <Route path="/forms"         element={<FormPlayground />} />
            <Route path="/controls"      element={<ControlsLab />} />
            <Route path="/navigation"    element={<NavigationLab />} />
            <Route path="/table"         element={<DataTable />} />
            <Route path="/overlays"      element={<ModalLab />} />
            <Route path="/drag-drop"     element={<DragDropLab />} />
            <Route path="/files"         element={<FilesLab />} />
            <Route path="/validation"    element={<ValidationLab />} />
            <Route path="/accessibility" element={<AccessibilityLab />} />
            <Route path="/state"         element={<StatePlayground />} />
            <Route path="/scenarios"     element={<TestScenarios />} />
            <Route path="/coverage"      element={<InteractionCoverage />} />
            <Route path="/about"         element={<About />} />
            <Route path="*"              element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
