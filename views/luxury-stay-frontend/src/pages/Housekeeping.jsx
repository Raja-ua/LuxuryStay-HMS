import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBroom, faCheckCircle, faTimesCircle, faSpinner, 
  faSearch, faFilter
} from '@fortawesome/free-solid-svg-icons';

const Housekeeping = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  const fetchRooms = async () => {
    try {
      const { data } = await api.get('/rooms');
      setRooms(data || []);
    } catch (error) {
      toast.error('Failed to fetch rooms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleStatusChange = async (roomId, newStatus) => {
    try {
      // Optimistic UI update
      setRooms(rooms.map(room => room._id === roomId ? { ...room, cleaningStatus: newStatus } : room));
      
      await api.put(`/rooms/${roomId}`, { cleaningStatus: newStatus });
      toast.success(`Room marked as ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update status');
      fetchRooms(); // Revert on failure
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Clean': return 'bg-green-100 text-green-700 border-green-200';
      case 'Dirty': return 'bg-red-100 text-red-700 border-red-200';
      case 'Cleaning': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Inspected': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Clean': return faCheckCircle;
      case 'Dirty': return faTimesCircle;
      case 'Cleaning': return faSpinner;
      case 'Inspected': return faCheckCircle;
      default: return faBroom;
    }
  };

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.roomNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'All' || (room.cleaningStatus || 'Clean') === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (loading) return <div className="p-8 text-center text-gray-500">Loading housekeeping data...</div>;

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <FontAwesomeIcon icon={faBroom} className="text-blue-600" /> Housekeeping
          </h1>
          <p className="text-gray-500 text-sm mt-1">Manage room cleaning schedules and statuses</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-1 sm:w-64">
            <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input 
              type="text" 
              placeholder="Search room number..." 
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="relative">
            <FontAwesomeIcon icon={faFilter} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <select 
              className="pl-9 pr-8 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none bg-white cursor-pointer font-bold text-gray-700"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Clean">Clean</option>
              <option value="Dirty">Dirty</option>
              <option value="Cleaning">Cleaning in Progress</option>
              <option value="Inspected">Inspected & Ready</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Dirty Rooms', count: rooms.filter(r => (r.cleaningStatus || 'Clean') === 'Dirty').length, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Cleaning', count: rooms.filter(r => (r.cleaningStatus || 'Clean') === 'Cleaning').length, color: 'text-yellow-600', bg: 'bg-yellow-50' },
          { label: 'Clean', count: rooms.filter(r => (r.cleaningStatus || 'Clean') === 'Clean').length, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Inspected', count: rooms.filter(r => (r.cleaningStatus || 'Clean') === 'Inspected').length, color: 'text-blue-600', bg: 'bg-blue-50' },
        ].map((stat, i) => (
          <div key={i} className={`${stat.bg} p-4 rounded-2xl border border-gray-100 flex flex-col justify-center items-center`}>
            <span className={`text-2xl font-bold ${stat.color}`}>{stat.count}</span>
            <span className="text-xs font-bold text-gray-600 uppercase mt-1 tracking-wider">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Rooms Grid */}
      {filteredRooms.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-gray-100 text-gray-500">
          <FontAwesomeIcon icon={faBroom} className="text-4xl text-gray-300 mb-3" />
          <p>No rooms found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredRooms.map(room => {
            const status = room.cleaningStatus || 'Clean';
            const colorClass = getStatusColor(status);
            
            return (
              <div key={room._id} className={`bg-white rounded-2xl border-2 p-5 shadow-sm transition-all hover:shadow-md ${colorClass.split(' ')[2]}`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{room.roomNumber}</h3>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{room.type}</p>
                  </div>
                  <div className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${colorClass.split(' ')[0]} ${colorClass.split(' ')[1]}`}>
                    <FontAwesomeIcon icon={getStatusIcon(status)} className={status === 'Cleaning' ? 'animate-spin mr-1' : 'mr-1'} />
                    {status}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Update Status</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Clean', 'Dirty', 'Cleaning', 'Inspected'].map(s => (
                      <button
                        key={s}
                        onClick={() => handleStatusChange(room._id, s)}
                        className={`py-1.5 text-xs font-bold rounded-lg transition-colors border ${
                          status === s 
                            ? 'bg-gray-900 text-white border-gray-900' 
                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Housekeeping;
