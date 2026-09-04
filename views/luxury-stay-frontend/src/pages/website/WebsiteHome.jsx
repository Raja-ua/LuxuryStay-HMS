import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBed, faCalendarCheck, faShieldAlt, faConciergeBell, faUserFriends, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import api from '../../services/api';

const WebsiteHome = () => {
  const [featuredRooms, setFeaturedRooms] = useState([]);

  const [currentSlide, setCurrentSlide] = useState(0);

  const heroSlides = [
    {
      image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1920&q=80",
      subtitle: "Five Star Hotel",
      title: "Welcome to LuxuryStay"
    },
    {
      image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1920&q=80",
      subtitle: "Unwind & Relax",
      title: "Your Perfect Getaway"
    },
    {
      image: "https://images.unsplash.com/photo-1517840901100-8179e982acb7?auto=format&fit=crop&w=1920&q=80",
      subtitle: "Exquisite Dining",
      title: "Taste the Luxury"
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? heroSlides.length - 1 : prev - 1));
  };

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const { data } = await api.get('/rooms');
        const availableRooms = data.filter(r => r.status === 'available').slice(0, 3);
        setFeaturedRooms(availableRooms);
      } catch (error) {
        console.error("Failed to fetch featured rooms");
      }
    };
    fetchRooms();
  }, []);

  return (
    <div className="bg-[#f9f9f7] font-sans text-gray-800 mb-16">
      {/* 1. HERO SECTION WITH SLIDER */}
      <div className="relative min-h-[90vh] flex items-center justify-center bg-gray-900 overflow-hidden group">
        
        {/* Slider Images */}
        {heroSlides.map((slide, index) => (
          <div 
            key={index}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-105 z-0'}`}
            style={{
              backgroundImage: `url(${slide.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="absolute inset-0 bg-black/50"></div>
          </div>
        ))}
        
        {/* Slider Navigation Arrows */}
        <button 
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/70 text-white w-12 h-12 flex items-center justify-center rounded-none opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm"
        >
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>
        <button 
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/70 text-white w-12 h-12 flex items-center justify-center rounded-none opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm"
        >
          <FontAwesomeIcon icon={faChevronRight} />
        </button>

        {/* Slide Content */}
        <div className="container mx-auto text-center relative z-20 flex flex-col items-center px-4 pt-16">
          <div key={currentSlide} className="animate-fadeIn">
            <p className="text-blue-500 font-sans tracking-[0.3em] uppercase text-sm mb-4 font-semibold">
              {heroSlides[currentSlide].subtitle}
            </p>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-normal mb-6 text-white drop-shadow-lg font-serif">
              {heroSlides[currentSlide].title}
            </h1>
          </div>
          
          <p className="text-lg md:text-xl mb-12 max-w-2xl mx-auto font-light drop-shadow-md text-gray-200 font-sans relative z-20">
            Experience comfort, classic elegance, and exceptional hospitality.
          </p>
          

          
          {/* Slide Indicators */}
          <div className="flex gap-3 mt-12 relative z-20">
            {heroSlides.map((_, index) => (
              <button 
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentSlide ? 'bg-blue-500 scale-125' : 'bg-white/50 hover:bg-white/80'}`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 2. FEATURED ROOMS */}
      <div className="py-24 bg-[#f9f9f7]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-blue-600 uppercase tracking-[0.2em] text-sm font-bold mb-3">Discover</p>
            <h2 className="text-4xl md:text-5xl font-serif text-gray-900 mb-6">Our Classic Rooms</h2>
            <div className="w-24 h-1 bg-blue-600 mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {featuredRooms.map(room => (
              <div key={room._id} className="bg-white shadow-xl border border-gray-100 overflow-hidden flex flex-col group hover:-translate-y-2 transition duration-500 rounded-none">
                <div className="h-72 bg-gray-200 relative overflow-hidden">
                  {room.images && room.images.length > 0 ? (
                    <img src={room.images[0]} alt={room.type} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-200">No Image</div>
                  )}
                  <div className="absolute top-4 right-4 bg-blue-600 text-white px-5 py-2 font-bold shadow-md rounded-none">
                    ${room.pricePerNight} <span className="text-xs font-normal uppercase tracking-wider">/ Night</span>
                  </div>
                </div>
                
                <div className="p-8 flex-1 flex flex-col items-center text-center">
                  <h3 className="text-2xl font-serif text-gray-900 mb-4">{room.type}</h3>
                  <p className="text-gray-500 mb-6 flex-1 line-clamp-3 font-light leading-relaxed">{room.description || 'Comfortable and elegant room for a relaxing stay.'}</p>
                  
                  <div className="flex items-center text-gray-400 mb-8 font-medium text-sm uppercase tracking-widest border-t border-b border-gray-100 py-3 w-full justify-center">
                    <FontAwesomeIcon icon={faUserFriends} className="text-blue-600 mr-2" />
                    {room.capacity ? `${room.capacity} Guests` : '2 Guests'}
                  </div>
                  
                  <Link to="/rooms" className="block w-full text-center border border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white font-bold uppercase tracking-widest text-sm py-3 px-4 rounded-none transition duration-300">
                    View Details
                  </Link>
                </div>
              </div>
            ))}
            {featuredRooms.length === 0 && (
              <div className="col-span-full text-center text-gray-500 py-10">Loading featured rooms...</div>
            )}
          </div>
        </div>
      </div>

      {/* 3. WHY CHOOSE LUXURYSTAY */}
      <div className="py-24 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-blue-600 uppercase tracking-[0.2em] text-sm font-bold mb-3">Amenities</p>
            <h2 className="text-4xl md:text-5xl font-serif text-gray-900 mb-6">Why Choose Us</h2>
            <div className="w-24 h-1 bg-blue-600 mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div className="p-10 rounded-none bg-white border border-gray-100 hover:shadow-xl hover:border-blue-200 transition duration-500 group">
              <div className="w-20 h-20 mx-auto bg-gray-50 text-gray-800 group-hover:bg-blue-600 group-hover:text-white rounded-none flex items-center justify-center text-3xl mb-8 transition duration-500">
                <FontAwesomeIcon icon={faBed} />
              </div>
              <h3 className="text-xl font-serif text-gray-900 mb-3">Comfortable Rooms</h3>
              <p className="text-gray-500 font-light leading-relaxed">Spacious and beautifully designed rooms for your ultimate comfort.</p>
            </div>
            
            <div className="p-10 rounded-none bg-white border border-gray-100 hover:shadow-xl hover:border-blue-200 transition duration-500 group">
              <div className="w-20 h-20 mx-auto bg-gray-50 text-gray-800 group-hover:bg-blue-600 group-hover:text-white rounded-none flex items-center justify-center text-3xl mb-8 transition duration-500">
                <FontAwesomeIcon icon={faCalendarCheck} />
              </div>
              <h3 className="text-xl font-serif text-gray-900 mb-3">Easy Booking</h3>
              <p className="text-gray-500 font-light leading-relaxed">Seamless and fast reservation process to secure your stay instantly.</p>
            </div>
            
            <div className="p-10 rounded-none bg-white border border-gray-100 hover:shadow-xl hover:border-blue-200 transition duration-500 group">
              <div className="w-20 h-20 mx-auto bg-gray-50 text-gray-800 group-hover:bg-blue-600 group-hover:text-white rounded-none flex items-center justify-center text-3xl mb-8 transition duration-500">
                <FontAwesomeIcon icon={faShieldAlt} />
              </div>
              <h3 className="text-xl font-serif text-gray-900 mb-3">Secure Stay</h3>
              <p className="text-gray-500 font-light leading-relaxed">24/7 security and strict safety measures for your peace of mind.</p>
            </div>
            
            <div className="p-10 rounded-none bg-white border border-gray-100 hover:shadow-xl hover:border-blue-200 transition duration-500 group">
              <div className="w-20 h-20 mx-auto bg-gray-50 text-gray-800 group-hover:bg-blue-600 group-hover:text-white rounded-none flex items-center justify-center text-3xl mb-8 transition duration-500">
                <FontAwesomeIcon icon={faConciergeBell} />
              </div>
              <h3 className="text-xl font-serif text-gray-900 mb-3">Quality Service</h3>
              <p className="text-gray-500 font-light leading-relaxed">Exceptional hospitality and room service dedicated to you.</p>
            </div>
          </div>
        </div>
      </div>

      {/* NEW: FACILITIES & ACTIVITIES */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center max-w-5xl">
          <p className="text-blue-500 uppercase tracking-widest text-xs font-bold mb-3">Facilities & Activities</p>
          <h2 className="text-3xl md:text-5xl font-serif text-blue-600 mb-6 uppercase">Where Life Tastes Sweeter</h2>
          <p className="text-gray-500 font-light leading-relaxed mb-12 px-4 md:px-12 text-sm md:text-base">
            Experience the good life at LuxuryStay Hotel, from sunny pool days to indulgent spa time, energising workouts to immersive cultural experiences, we invite you to drink it all in.
          </p>
          
          <div className="w-full h-[60vh] md:h-[70vh] bg-gray-100 overflow-hidden mb-6">
            <img 
              src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1920&q=80" 
              alt="Spa and Wellness" 
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000"
            />
          </div>
          
          <div className="text-left text-blue-600 font-serif text-xl md:text-2xl mt-4">
            Spa & Health Club | 5-Star LuxuryStay Hotel
          </div>
        </div>
      </div>

      {/* NEW: MEETINGS & CELEBRATIONS */}
      <div className="py-24 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <p className="text-blue-500 uppercase tracking-widest text-xs font-bold mb-3">Meetings & Celebrations</p>
          <h2 className="text-3xl md:text-5xl font-serif text-blue-600 mb-16 uppercase">Memorable Meetings &<br/>Sparkling Celebrations</h2>
          
          <div className="max-w-6xl mx-auto border border-blue-600 flex flex-col md:flex-row bg-white h-auto md:h-[600px]">
            {/* Left Image */}
            <div className="w-full md:w-1/2 h-[400px] md:h-full overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=800&q=80" 
                alt="Weddings" 
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Right Content */}
            <div className="w-full md:w-1/2 p-12 md:p-20 flex flex-col justify-center items-center text-center">
              <h3 className="text-3xl font-serif text-blue-600 mb-6">Weddings</h3>
              <p className="text-gray-500 font-light leading-relaxed mb-8 text-sm md:text-base">
                We create magical memories to last a lifetime when you say 'I do' to a spectacular wedding at LuxuryStay. Whether you're planning a lavish banquet or a more intimate celebration for close family and friends, our dedicated team of experts will be with you every step of the way.
              </p>
              
              <Link to="/contact-us" className="text-blue-600 font-serif hover:text-blue-700 hover:underline transition mb-16 text-lg">
                Find out more
              </Link>
              
              {/* Fake Slider Controls for exact UI match */}
              <div className="flex items-center gap-6 text-gray-400 mt-auto">
                <button className="w-10 h-10 border rounded-full border-gray-300 flex items-center justify-center hover:border-blue-500 hover:text-blue-500 transition">
                  <FontAwesomeIcon icon={faChevronLeft} className="text-xs" />
                </button>
                <div className="flex items-center gap-4 text-xs tracking-widest font-bold">
                  <span className="w-12 h-px bg-gray-300"></span>
                  1/2
                  <span className="w-12 h-px bg-gray-300"></span>
                </div>
                <button className="w-10 h-10 border rounded-full border-gray-300 flex items-center justify-center hover:border-blue-500 hover:text-blue-500 transition">
                  <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. CALL TO ACTION */}
      <div className="bg-gray-900 py-24 px-4 text-center border-t-4 border-blue-600">
        <div className="container mx-auto">
          <p className="text-blue-500 uppercase tracking-[0.2em] text-sm font-bold mb-4">Book Your Stay</p>
          <h2 className="text-4xl md:text-5xl font-serif text-white mb-10">Ready for Your Perfect Stay?</h2>
          <Link to="/rooms" className="inline-block bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase tracking-widest text-sm py-4 px-10 rounded-none transition duration-300 shadow-xl border border-blue-600">
            Explore Our Rooms
          </Link>
        </div>
      </div>

      {/* GALLERY PREVIEW */}
      <div className="py-24 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4 text-center">
          <p className="text-blue-500 uppercase tracking-[0.2em] text-sm font-bold mb-3">Snapshot</p>
          <h2 className="text-4xl md:text-5xl font-serif text-gray-900 mb-10">Our Gallery</h2>
          
          <div className="relative group max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 h-64 md:h-96">
              <div className="overflow-hidden">
                <img src="https://pix10.agoda.net/hotelImages/729/72904/72904_13062415500013487467.jpg?s=1024x768" alt="Gallery 1" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              <div className="overflow-hidden">
                <img src="https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80" alt="Gallery 2" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              <div className="overflow-hidden">
                <img src="https://q-xx.bstatic.com/xdata/images/hotel/max1024x768/583958422.jpg?k=02adf2af2e97a688365970dea99261b40521f351882079136dff3ee8d05b5781&o=&s=1024x" alt="Gallery 3" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              <div className="overflow-hidden">
                <img src="https://makkah-madinah.accor.com/wp-content/uploads/2024/08/classic-room-Movenpick-Hotel-Residence-Makkah-Hajar-Tower-5.jpg" alt="Gallery 4" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
            </div>
            
            {/* Overlay Button */}
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500 flex items-center justify-center pointer-events-none">
              <div className="pointer-events-auto">
                <Link to="/gallery" className="bg-white/90 backdrop-blur-sm text-gray-900 hover:bg-gray-900 hover:text-white font-bold uppercase tracking-widest text-sm py-4 px-10 transition duration-300 shadow-xl border border-white inline-block">
                  See More
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebsiteHome;
