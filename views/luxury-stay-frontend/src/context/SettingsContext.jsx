import { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    hotelName: 'LuxuryStay',
    taxRate: 10,
    checkoutTime: '12:00 PM',
    cancellationPolicy: 'Free cancellation up to 24 hours before check-in.'
  });
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const { data } = await api.get('/settings');
      if (data) setSettings(data);
    } catch (error) {
      console.error('Failed to fetch settings', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, fetchSettings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
