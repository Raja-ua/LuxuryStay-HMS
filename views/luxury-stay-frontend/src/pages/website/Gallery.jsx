const Gallery = () => {
  const images = [
    { id: 1, url: 'https://pix10.agoda.net/hotelImages/729/72904/72904_13062415500013487467.jpg?s=1024x768', title: 'Luxury Stay Exterior' },
    { id: 2, url: 'https://makkah-madinah.accor.com/wp-content/uploads/2024/08/classic-room-Movenpick-Hotel-Residence-Makkah-Hajar-Tower-5.jpg', title: 'Classic Room' },
    { id: 3, url: 'https://www.gloss.ee/wp-content/uploads/2025/05/Movenpick-Hotel-Budapest-Centre-Deluxe-Room-with-Sofa--scaled.jpg', title: 'Deluxe Room' },
    { id: 4, url: 'https://q-xx.bstatic.com/xdata/images/hotel/max1024x768/583958422.jpg?k=02adf2af2e97a688365970dea99261b40521f351882079136dff3ee8d05b5781&o=&s=1024x', title: 'Luxury Stay Pool' },
    { id: 5, url: 'https://pix10.agoda.net/hotelImages/1348067/-1/b94a134db7e2001153af42b5a8d5e066.jpg', title: 'Executive Lounge' },
    { id: 6, url: 'https://bynder.onthebeach.co.uk/cdn-cgi/image/width=1400,quality=80,fit=cover,format=auto/m/67a5445131d7588f/original/Movenpick-Hotel-Nurnberg-Airport-Germany-NUREMBERG-Room-8.jpg', title: 'Executive Room' },
    { id: 7, url: 'https://www.ahstatic.com/photos/b4x7_rotwd_00_p_2048x1536.jpg', title: 'Grand Suite' },
    { id: 8, url: 'https://www.ahstatic.com/photos/b9x8_rotwags_00_p_1024x768.jpg', title: 'Fine Dining' },
    { id: 9, url: 'https://www.ahstatic.com/photos/b4m6_ropssup_00_p_2048x1536.jpg', title: 'Spa & Wellness' },
    { id: 10, url: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2b/e5/f7/bb/classic-room-at-movenpick.jpg?w=1400&h=-1&s=1', title: 'Premium Room' },
    { id: 11, url: 'https://www.ahstatic.com/photos/b8b6_rokgbsv_00_p_1024x768.jpg', title: 'Elegant Lobby' },
    { id: 12, url: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1b/8b/66/e7/anwar-al-madinah-movenpick.jpg?w=1200&h=-1&s=1', title: 'Modern Bathroom' },
    { id: 13, url: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/21/86/d2/03/movenpick-hotel-and-residences.jpg?w=1200&h=-1&s=1', title: 'Luxury Stay Residences' },
    { id: 14, url: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0d/09/5d/ae/movenpick-hotel-mansour.jpg?w=1200&h=-1&s=1', title: 'Luxury Stay Exterior' },
    { id: 15, url: 'https://www.ahstatic.com/photos/b4p0_rokgb_00_p_1024x768.jpg', title: 'Luxury Suite' },
    { id: 16, url: 'https://www.ahstatic.com/photos/b4x7_rokgd_00_p_1024x768.jpg', title: 'Standard Room' },
    { id: 17, url: 'https://bynder.onthebeach.co.uk/cdn-cgi/image/width=1400,quality=80,fit=cover,format=auto/m/2e8f256190b60596/original/Movenpick-Hotel-Jumeirah-Lakes-Towers-Room-11.jpg', title: 'Luxury Stay Suite' },
    { id: 18, url: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1b/8b/68/29/anwar-al-madinah-movenpick.jpg?w=1200&h=-1&s=1', title: 'Luxury Stay Plaza' },
    { id: 19, url: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/17/45/ac/79/movenpick-hotel-qassim.jpg?w=1200&h=-1&s=1', title: 'Luxury Stay Resort' },
    { id: 20, url: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/15/d1/25/ac/movenpick-hotel-apartments.jpg?w=1200&h=-1&s=1', title: 'Luxury Stay Apartments' },
    { id: 21, url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80', title: 'Luxury Pool' },
    { id: 22, url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80', title: 'Luxury Stay Exterior' },
    { id: 23, url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80', title: 'Indoor Pool' },
    { id: 24, url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80', title: 'Private Villa Exterior' },
    { id: 25, url: 'https://images.unsplash.com/photo-1499955085172-a104c9463ece?auto=format&fit=crop&w=800&q=80', title: 'Balcony View' },
    { id: 26, url: 'https://images.unsplash.com/photo-1517840901100-8179e982acb7?auto=format&fit=crop&w=800&q=80', title: 'Hotel Lobby Exterior' },
    { id: 27, url: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=800&q=80', title: 'Fitness Pool' },
    { id: 28, url: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80', title: 'Premium Bedroom' }
  ];

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Header */}
      <div 
        className="relative bg-gray-900 text-white py-24 px-4 mb-16 flex items-center justify-center text-center"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1517840901100-8179e982acb7?auto=format&fit=crop&w=1920&q=80')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundBlendMode: 'overlay'
        }}
      >
        <div className="absolute inset-0 bg-gray-900/70"></div>
        <div className="relative z-10">
          <p className="text-blue-500 font-sans tracking-[0.3em] uppercase text-sm mb-4 font-bold">Discover</p>
          <h1 className="text-5xl md:text-6xl font-serif text-white mb-6">Our Gallery</h1>
          <div className="w-24 h-1 bg-blue-600 mx-auto"></div>
        </div>
      </div>

      {/* Gallery Bento Grid */}
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[250px] grid-flow-dense">
          {images.map((img, index) => (
            <div 
              key={img.id} 
              className={`group relative overflow-hidden rounded-2xl shadow-lg cursor-pointer bg-gray-100 ${
                index % 4 === 0 ? 'md:col-span-2 md:row-span-2' : 
                index % 9 === 0 ? 'md:col-span-2' : 
                ''
              }`}
            >
              <img 
                src={img.url} 
                alt={img.title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent flex flex-col justify-end p-6">
                <div className="w-12 h-1 bg-blue-500 mt-2 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Gallery;
