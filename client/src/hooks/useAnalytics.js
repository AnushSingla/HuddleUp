import { useState, useEffect, useCallback } from 'react';
import { API } from '@/api';

/**
 * Fetches creator-level analytics overview.
 */
export function useAnalyticsOverview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get('/analytics/overview');
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

/**
 * Fetches the list of creator videos with per-video metrics.
 */
export function useAnalyticsVideoList() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    API.get('/analytics/videos')
      .then(res => setData(res.data))
      .catch(err => setError(err.response?.data?.message || 'Failed to load videos'))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}

/**
 * Fetches detailed analytics for a single video.
 * @param {string} videoId
 */
export function useVideoAnalytics(videoId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!videoId) return;
    setLoading(true);
    setError(null);
    API.get(`/analytics/videos/${videoId}`)
      .then(res => setData(res.data))
      .catch(err => setError(err.response?.data?.message || 'Failed to load video analytics'))
      .finally(() => setLoading(false));
  }, [videoId]);

  return { data, loading, error };
}

/**
 * Fetches view trend data over a period.
 * @param {'7d'|'30d'|'90d'} period
 */
export function useAnalyticsTrends(period = '30d') {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    API.get(`/analytics/trends?period=${period}`)
      .then(res => setData(res.data))
      .catch(err => setError(err.response?.data?.message || 'Failed to load trends'))
      .finally(() => setLoading(false));
  }, [period]);

  return { data, loading, error };
}

/**
 * Fetches audience analytics: devices, peak hours, geography.
 */
export function useAudienceAnalytics() {
  const [devices, setDevices] = useState(null);
  const [peakHours, setPeakHours] = useState([]);
  const [geography, setGeography] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      API.get('/analytics/audience/devices'),
      API.get('/analytics/audience/peakHours'),
      API.get('/analytics/audience/geography'),
    ])
      .then(([devRes, peakRes, geoRes]) => {
        setDevices(devRes.data);
        setPeakHours(peakRes.data);
        setGeography(geoRes.data);
      })
      .catch(err => setError(err.response?.data?.message || 'Failed to load audience analytics'))
      .finally(() => setLoading(false));
  }, []);

  return { devices, peakHours, geography, loading, error };
}
