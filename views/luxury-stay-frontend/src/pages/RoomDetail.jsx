import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faBed, faUsers, faBuilding, faMoneyBillWave, faCheckCircle } from '@fortawesome/free-solid-svg-icons';

const RoomDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);

  useEffect(() => {
    const fetchRoomDetail = async () => {
      try {
        const { data } = await api.get(`/rooms/${id}`);
        setRoom(data);
      } catch (err) {
        toast.error('Failed to fetch room details');
        navigate('/admin/rooms');
      }
    };
    fetchRoomDetail();
  }, [id, navigate]);

  if (!room) return <div className="text-center py-10">Loading...</div>;

  const totalBeds = room.beds ? room.beds.reduce((acc, curr) => acc + Number(curr.quantity), 0) : 0;
  const bedDescription = room.beds && room.beds.length > 0 
    ? room.beds.map(b => `${b.quantity} ${b.bedType}`).join(', ') 
    : 'No beds info';

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/admin/rooms')} className="text-gray-500 hover:text-blue-600 transition">
          <FontAwesomeIcon icon={faArrowLeft} size="lg" />
        </button>
        <h1 className="text-3xl font-bold text-gray-800">Room {room.roomNumber} Detail</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Image Gallery */}
          <div className="bg-gray-100 p-4 flex flex-col items-center justify-center min-h-[300px]">
            {room.images && room.images.length > 0 ? (
              <>
                <img src={room.images[currentImageIdx]} alt="Room" className="w-full h-80 object-cover rounded-lg shadow-sm mb-4" />
                <div className="flex gap-2 overflow-x-auto pb-2 w-full">
                  {room.images.map((img, idx) => (
                    <img 
                      key={idx} 
                      src={img} 
                      alt={`Thumbnail ${idx}`} 
                      className={`w-20 h-16 object-cover rounded cursor-pointer border-2 ${currentImageIdx === idx ? 'border-blue-600' : 'border-transparent opacity-70 hover:opacity-100'}`}
                      onClick={() => setCurrentImageIdx(idx)}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-gray-400 flex flex-col items-center">
                <FontAwesomeIcon icon={faBed} className="text-6xl mb-4" />
                <p>No images available</p>
              </div>
            )}
          </div>

          {/* Quick Info */}
          <div className="p-8 flex flex-col justify-center">
            <div className="mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold uppercase ${
                room.status === 'available' ? 'bg-green-100 text-green-800' :
                room.status === 'occupied' ? 'bg-blue-100 text-blue-800' :
                room.status === 'cleaning' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {room.status}
              </span>
            </div>
            <h2 className="text-4xl font-bold text-gray-800 mb-2">Room {room.roomNumber}</h2>
            <p className="text-xl text-gray-500 mb-6">{room.type} Room</p>
            
            <div className="grid grid-cols-2 gap-y-6">
              <div>
                <p className="text-sm text-gray-500 mb-1"><FontAwesomeIcon icon={faMoneyBillWave} className="mr-2 text-blue-500"/>Price / Night</p>
                <p className="text-2xl font-bold text-gray-800">${room.pricePerNight}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1"><FontAwesomeIcon icon={faBuilding} className="mr-2 text-blue-500"/>Floor</p>
                <p className="text-xl font-semibold text-gray-800">{room.floor || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1"><FontAwesomeIcon icon={faUsers} className="mr-2 text-blue-500"/>Capacity</p>
                <p className="text-xl font-semibold text-gray-800">{room.capacity ? `${room.capacity} Persons` : 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1"><FontAwesomeIcon icon={faBed} className="mr-2 text-blue-500"/>Total Beds</p>
                <p className="text-xl font-semibold text-gray-800">{totalBeds}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Description</h3>
          <p className="text-gray-600 whitespace-pre-wrap">{room.description || 'No description provided.'}</p>
          
          <h3 className="text-xl font-semibold text-gray-800 mt-8 mb-4 border-b pb-2">Beds Configuration</h3>
          <p className="text-gray-600 font-medium">TOTAL BEDS: {totalBeds}</p>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
            {room.beds && room.beds.map((b, i) => (
              <div key={i} className="bg-gray-50 border p-3 rounded text-center">
                <span className="block text-2xl font-bold text-blue-600">{b.quantity}</span>
                <span className="block text-sm text-gray-500">{b.bedType} Bed(s)</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-fit">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Features</h3>
          {room.features && room.features.length > 0 ? (
            <ul className="space-y-3">
              {room.features.map((feature, idx) => (
                <li key={idx} className="flex items-center text-gray-700">
                  <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 mr-3" />
                  {feature.trim()}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No features listed.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomDetail;
