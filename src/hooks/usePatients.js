import { useState, useEffect, useCallback } from 'react';
import { classifyRisk } from '../services/api';

const STORAGE_KEY = 'neo_sepsis_patients';

function load() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}
function save(patients) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(patients));
}

export function usePatients() {
  const [patients, setPatients] = useState(load);

  useEffect(() => { save(patients); }, [patients]);

  const addPatient = useCallback((formData, predResult) => {
    const prob  = predResult.probability ?? 0;
    const risk  = classifyRisk(prob);
    const entry = {
      id:        Date.now().toString(),
      createdAt: new Date().toISOString(),
      ...formData,
      probability:   prob,
      risk_category: predResult.risk_category || risk.label,
      _risk:         risk,
    };
    setPatients(prev => [entry, ...prev]);
    return entry;
  }, []);

  const removePatient = useCallback((id) => {
    setPatients(prev => prev.filter(p => p.id !== id));
  }, []);

  const getPatient = useCallback((id) => {
    return patients.find(p => p.id === id);
  }, [patients]);

  const highRisk = patients.filter(p => p._risk?.tier >= 2);
  const stats = {
    total:    patients.length,
    low:      patients.filter(p => p._risk?.tier === 0).length,
    moderate: patients.filter(p => p._risk?.tier === 1).length,
    high:     patients.filter(p => p._risk?.tier === 2).length,
    veryHigh: patients.filter(p => p._risk?.tier === 3).length,
  };

  return { patients, addPatient, removePatient, getPatient, highRisk, stats };
}
