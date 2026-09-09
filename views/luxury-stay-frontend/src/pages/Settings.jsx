import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faSave, faPercent, faClock, faHotel, faCalendarAlt, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';

const Settings = () => {
  const [settings, setSettings] = useState({
    hotelName: '',
    taxRate: 10,
    checkoutTime: '12:00 PM',
    cancellationPolicy: '',
    weekendSurcharge: 10,
    holidaySurcharge: 15,
    holidays: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newHoliday, setNewHoliday] = useState({ date: '', name: '' });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await api.get('/settings');
        if (data) {
          setSettings({
            ...data,
            weekendSurcharge: data.weekendSurcharge ?? 10,
            holidaySurcharge: data.holidaySurcharge ?? 15,
            holidays: data.holidays || []
          });
        }
      } catch (error) {
        toast.error('Failed to load system settings');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put('/settings', settings);
      setSettings(data.data);
      toast.success('Settings updated successfully!');
    } catch (error) {
      toast.error('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const addHoliday = () => {
    if (!newHoliday.date || !newHoliday.name) return;
    setSettings(prev => ({
      ...prev,
      holidays: [...prev.holidays, newHoliday]
    }));
    setNewHoliday({ date: '', name: '' });
  };

  const removeHoliday = (index) => {
    setSettings(prev => ({
      ...prev,
      holidays: prev.holidays.filter((_, i) => i !== index)
    }));
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading settings...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">System Settings</h1>
          <p className="text-gray-500 mt-1 font-medium">Manage global configurations, pricing rules, and policies</p>
        </div>
        <div className="text-blue-500 bg-blue-50 w-12 h-12 rounded-xl flex items-center justify-center text-xl">
          <FontAwesomeIcon icon={faCog} className="animate-spin-slow" />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          
          {/* General & Financial row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-gray-800 border-b pb-2 flex items-center gap-2">
                <FontAwesomeIcon icon={faHotel} className="text-gray-400" /> General Info
              </h3>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Hotel Name</label>
                <input 
                  type="text" 
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-3 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  value={settings.hotelName}
                  onChange={(e) => setSettings({...settings, hotelName: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Checkout Time</label>
                <div className="relative">
                  <FontAwesomeIcon icon={faClock} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    className="w-full pl-10 bg-gray-50 border border-gray-200 text-gray-900 p-3 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    placeholder="e.g. 12:00 PM"
                    value={settings.checkoutTime}
                    onChange={(e) => setSettings({...settings, checkoutTime: e.target.value})}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-bold text-gray-800 border-b pb-2 flex items-center gap-2">
                <FontAwesomeIcon icon={faPercent} className="text-gray-400" /> Tax & Baseline
              </h3>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Global Tax Rate (%)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    step="0.1"
                    min="0"
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-3 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-bold text-lg"
                    value={settings.taxRate}
                    onChange={(e) => setSettings({...settings, taxRate: e.target.value})}
                    required
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Pricing Section */}
          <div className="space-y-6 pt-4 border-t border-gray-100">
            <h3 className="text-lg font-bold text-blue-800 border-b pb-2 flex items-center gap-2">
              <FontAwesomeIcon icon={faCalendarAlt} className="text-blue-500" /> Dynamic Pricing (Surge/Revenue Management)
            </h3>
            <p className="text-sm text-gray-500 mb-4">Automatically increase room prices on weekends (Sat/Sun) and specific holidays to optimize revenue.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Weekend Surcharge (%)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    step="0.1"
                    min="0"
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-3 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    value={settings.weekendSurcharge}
                    onChange={(e) => setSettings({...settings, weekendSurcharge: e.target.value})}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">%</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Holiday Surcharge (%)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    step="0.1"
                    min="0"
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-3 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    value={settings.holidaySurcharge}
                    onChange={(e) => setSettings({...settings, holidaySurcharge: e.target.value})}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">%</span>
                </div>
              </div>
            </div>

            <div className="mt-6 bg-blue-50/50 p-6 rounded-xl border border-blue-100">
              <label className="block text-sm font-bold text-blue-900 mb-4 uppercase tracking-wide">Manage Holidays</label>
              
              <div className="flex gap-4 mb-6">
                <input 
                  type="date"
                  className="bg-white border border-gray-300 p-2 rounded-lg outline-none focus:border-blue-500 flex-1"
                  value={newHoliday.date}
                  onChange={(e) => setNewHoliday({...newHoliday, date: e.target.value})}
                />
                <input 
                  type="text"
                  placeholder="Holiday Name (e.g., Christmas)"
                  className="bg-white border border-gray-300 p-2 rounded-lg outline-none focus:border-blue-500 flex-2 w-full"
                  value={newHoliday.name}
                  onChange={(e) => setNewHoliday({...newHoliday, name: e.target.value})}
                />
                <button 
                  type="button" 
                  onClick={addHoliday}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition"
                >
                  <FontAwesomeIcon icon={faPlus} /> Add
                </button>
              </div>

              {settings.holidays.length > 0 ? (
                <div className="space-y-2">
                  {settings.holidays.map((h, i) => (
                    <div key={i} className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                      <div>
                        <span className="font-bold text-gray-800">{h.name}</span>
                        <span className="text-gray-500 text-sm ml-4">{h.date}</span>
                      </div>
                      <button 
                        type="button"
                        onClick={() => removeHoliday(i)}
                        className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-lg transition"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">No holidays defined yet.</p>
              )}
            </div>
          </div>

          <div className="space-y-6 pt-4 border-t border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Policies</h3>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Cancellation Policy</label>
              <textarea 
                rows="4" 
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-4 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all leading-relaxed"
                value={settings.cancellationPolicy}
                onChange={(e) => setSettings({...settings, cancellationPolicy: e.target.value})}
              ></textarea>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex justify-end">
            <button 
              type="submit" 
              disabled={saving}
              className={`px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 active:scale-95 transition-all shadow-lg flex items-center gap-2 ${saving ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              <FontAwesomeIcon icon={faSave} /> {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default Settings;
