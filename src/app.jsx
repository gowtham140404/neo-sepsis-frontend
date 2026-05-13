import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import PredictionPage from './pages/PredictionPage';
import AlertsPage from './pages/AlertsPage';
import PatientDetail from './pages/PatientDetail';
import SettingsPage from './pages/SettingsPage';
import { usePatients } from './hooks/usePatients';
import { createContext, useContext } from 'react';

export const PatientCtx = createContext(null);
export const usePatientCtx = () => useContext(PatientCtx);

export default function App() {
  const patientStore = usePatients();

  return (
    <PatientCtx.Provider value={patientStore}>
      <Routes>
        <Route element={<Layout />}>
          <Route index             element={<Dashboard />} />
          <Route path="predict"    element={<PredictionPage />} />
          <Route path="alerts"     element={<AlertsPage />} />
          <Route path="patient/:id" element={<PatientDetail />} />
          <Route path="settings"   element={<SettingsPage />} />
        </Route>
      </Routes>
    </PatientCtx.Provider>
  );
}
