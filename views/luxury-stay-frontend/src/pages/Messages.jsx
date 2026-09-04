import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faEnvelope, faEnvelopeOpen, faEye } from '@fortawesome/free-solid-svg-icons';

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchMessages = async () => {
    try {
      const { data } = await api.get('/contacts');
      setMessages(data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load messages');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/contacts/${id}`, { status: newStatus });
      toast.success('Status updated');
      fetchMessages();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleViewMessage = async (msg) => {
    setSelectedMessage(msg);
    setIsModalOpen(true);
    if (msg.status === 'unread') {
      try {
        await api.put(`/contacts/${msg._id}`, { status: 'read' });
        fetchMessages();
      } catch (err) {
        // Ignore silent error
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        await api.delete(`/contacts/${id}`);
        toast.success('Message deleted');
        fetchMessages();
      } catch (err) {
        toast.error('Failed to delete message');
      }
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500 font-bold">Loading Messages...</div>;

  return (
    <div className="p-8 admin-panel">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Messages</h1>
          <p className="text-gray-500 font-medium mt-1">View inquiries from the Contact Us form.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-[0_2px_20px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100">
                <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Subject</th>
                <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Message</th>
                <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="p-5 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {messages.map(msg => (
                <tr key={msg._id} className={`hover:bg-blue-50/30 transition-colors group ${msg.status === 'unread' ? 'bg-blue-50/10' : ''}`}>
                  <td className="p-5 font-bold text-gray-800 whitespace-nowrap">{msg.name}</td>
                  <td className="p-5 text-gray-600 font-medium">{msg.email}</td>
                  <td className="p-5 text-gray-800 font-bold">{msg.subject || 'No Subject'}</td>
                  <td className="p-5 text-gray-600 max-w-xs truncate" title={msg.message}>{msg.message}</td>
                  <td className="p-5 text-gray-500 font-medium whitespace-nowrap">{new Date(msg.createdAt).toLocaleDateString()}</td>
                  <td className="p-5">
                    <select 
                      value={msg.status}
                      onChange={(e) => handleStatusChange(msg._id, e.target.value)}
                      className={`px-3 py-1.5 rounded-full text-[10px] uppercase font-bold tracking-wide shadow-sm border cursor-pointer outline-none status-select ${
                        msg.status === 'read' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'
                      }`}
                    >
                      <option value="unread">UNREAD</option>
                      <option value="read">READ</option>
                    </select>
                  </td>
                  <td className="p-5 text-right space-x-2 whitespace-nowrap">
                    <button onClick={() => handleViewMessage(msg)} className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 hover:bg-blue-100 hover:text-blue-700 transition-colors inline-flex items-center justify-center" title="View Message">
                      <FontAwesomeIcon icon={faEye} />
                    </button>
                    <button onClick={() => handleDelete(msg._id)} className="w-8 h-8 rounded-full bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 transition-colors inline-flex items-center justify-center" title="Delete">
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </td>
                </tr>
              ))}
              {messages.length === 0 && (
                <tr>
                  <td colSpan="7" className="p-10 text-center text-gray-500 font-medium">No messages found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Message Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Message Details">
        {selectedMessage && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Sender Name</p>
                <p className="text-gray-900 font-bold">{selectedMessage.name}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Email Address</p>
                <p className="text-gray-900 font-bold">{selectedMessage.email}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 col-span-2">
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Subject</p>
                <p className="text-gray-900 font-bold">{selectedMessage.subject || 'N/A'}</p>
              </div>
            </div>
            
            <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100">
              <p className="text-xs text-blue-500 uppercase font-bold tracking-wider mb-3">Full Message</p>
              <p className="text-blue-900 leading-relaxed whitespace-pre-wrap">{selectedMessage.message}</p>
            </div>
            
            <div className="flex justify-between items-center text-sm font-bold text-gray-400">
              <span>Received: {new Date(selectedMessage.createdAt).toLocaleString()}</span>
              <span className={`uppercase px-2 py-1 rounded-md ${selectedMessage.status === 'read' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {selectedMessage.status}
              </span>
            </div>
            
            <button onClick={() => setIsModalOpen(false)} className="w-full mt-4 bg-gray-100 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors">
              Close
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Messages;
