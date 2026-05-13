import { useState, useCallback } from 'react';
import { predict, classifyRisk } from '../services/api';

export function usePredict() {
  const [loading,      setLoading]      = useState(false);
  const [coldStart,    setColdStart]    = useState(false);
  const [result,       setResult]       = useState(null);
  const [error,        setError]        = useState(null);

  const run = useCallback(async (payload) => {
    setLoading(true);
    setError(null);
    setResult(null);
    setColdStart(false);

    const { ok, data, error: err } = await predict(payload, () => setColdStart(true));

    setLoading(false);
    setColdStart(false);

    if (!ok) {
      setError(err);
      return null;
    }

    // Normalise response — backend may return probability as `probability` or `sepsis_probability`
    const prob = data.probability ?? data.sepsis_probability ?? data.risk_score ?? 0;
    const risk = data.risk_category ? data : { ...data, risk_category: classifyRisk(prob).label };
    setResult({ ...risk, probability: prob, _risk: classifyRisk(prob) });
    return risk;
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setColdStart(false);
  }, []);

  return { run, loading, coldStart, result, error, reset };
}
