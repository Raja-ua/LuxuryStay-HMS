import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';
import api from '../../services/api';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [loading, setLoading] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    { question: 'Where is LuxuryStay Hotel located?', answer: 'LuxuryStay is located in the heart of Cityville, offering easy access to the business district and major tourist attractions.' },
    { question: 'What is the address of LuxuryStay Hotel?', answer: '123 Luxury Avenue, Hotel District, Cityville, State 12345, United States.' },
    { question: 'Which popular attractions are close to LuxuryStay Hotel?', answer: 'We are within walking distance of the Grand Museum, City Park, and the premier shopping avenue.' },
    { question: 'How long has LuxuryStay Hotel been open?', answer: 'LuxuryStay opened its doors in 2015 and has been offering 5-star hospitality ever since.' },
    { question: 'What are some of the property amenities at LuxuryStay Hotel?', answer: 'Our amenities include a world-class spa, infinity pool, fitness center, multiple fine-dining restaurants, and 24/7 concierge service.' }
  ];

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/contacts', formData);
      toast.success('Your message has been sent successfully! We will get back to you soon.');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="bg-white min-h-screen pb-20">
      {/* Hero Section */}
      <div 
        className="relative bg-gray-900 text-white py-24 flex items-center justify-center text-center px-4"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1517840901100-8179e982acb7?auto=format&fit=crop&w=1920&q=80')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundBlendMode: 'overlay'
        }}
      >
        <div className="absolute inset-0 bg-gray-900/70"></div>
        <div className="relative z-10 max-w-3xl">
          <p className="text-blue-500 font-sans tracking-[0.3em] uppercase text-sm mb-4 font-bold">Reach Out</p>
          <h1 className="text-4xl md:text-6xl font-serif mb-6 text-white">Contact Us</h1>
          <div className="w-24 h-1 bg-blue-600 mx-auto"></div>
        </div>
      </div>

      {/* Premium Contact Form Section */}
      <div className="container mx-auto px-4 py-20 max-w-4xl">
        <div className="bg-white p-10 md:p-16 border border-gray-200 shadow-xl rounded-none">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-serif text-blue-600 mb-4 uppercase">Send Us a Message</h2>
            <p className="text-gray-500 font-light">We would love to hear from you. Please fill out the form below.</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2" htmlFor="name">Full Name</label>
                <input 
                  type="text" 
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border-b-2 border-gray-200 text-gray-900 p-3 px-4 focus:bg-white focus:border-blue-600 outline-none transition-all rounded-none"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2" htmlFor="email">Email Address</label>
                <input 
                  type="email" 
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border-b-2 border-gray-200 text-gray-900 p-3 px-4 focus:bg-white focus:border-blue-600 outline-none transition-all rounded-none"
                  placeholder="john@example.com"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2" htmlFor="subject">Subject</label>
              <input 
                type="text" 
                id="subject"
                name="subject"
                required
                value={formData.subject}
                onChange={handleChange}
                className="w-full bg-gray-50 border-b-2 border-gray-200 text-gray-900 p-3 px-4 focus:bg-white focus:border-blue-600 outline-none transition-all rounded-none"
                placeholder="How can we help you?"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2" htmlFor="message">Your Message</label>
              <textarea 
                id="message"
                name="message"
                required
                rows="5"
                value={formData.message}
                onChange={handleChange}
                className="w-full bg-gray-50 border-b-2 border-gray-200 text-gray-900 p-3 px-4 focus:bg-white focus:border-blue-600 outline-none transition-all rounded-none resize-none"
                placeholder="Write your message here..."
              ></textarea>
            </div>
            
            <div className="text-center pt-4">
              <button 
                type="submit" 
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold uppercase tracking-widest text-sm py-4 px-12 rounded-none transition duration-300 shadow-lg"
              >
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <hr className="border-gray-200 w-3/4 mx-auto my-10" />

      {/* Location & Contact Details Section (From Image) */}
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-start mb-16">
          <div className="md:col-span-1">
            <h2 className="text-3xl md:text-4xl font-serif text-blue-600">Location & contact</h2>
          </div>
          
          <div className="md:col-span-1">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Location</h3>
            <p className="text-gray-500 font-light leading-loose underline decoration-gray-300 underline-offset-4 cursor-pointer hover:text-blue-600 transition">
              123 Luxury Avenue<br/>
              Hotel District, 12345<br/>
              CITYVILLE<br/>
              United States
            </p>
          </div>
          
          <div className="md:col-span-1">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Contact</h3>
            <p className="text-gray-500 font-light leading-loose underline decoration-gray-300 underline-offset-4 mb-2 cursor-pointer hover:text-blue-600 transition">
              Tel: +1 (555) 123-4567
            </p>
            <p className="text-gray-500 font-light leading-loose underline decoration-gray-300 underline-offset-4 cursor-pointer hover:text-blue-600 transition">
              Contact email: info@luxurystay.com
            </p>
          </div>
        </div>
      </div>

      {/* Full Width Map */}
      <div className="w-full h-[400px] md:h-[500px] bg-gray-200 mb-20">
        <iframe 
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3620.015447198598!2d67.0740548!3d24.863322000000004!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3eb33ea3dcaf47d9%3A0xe7ec8bb05b628158!2sAptech%20Pakistan!5e0!3m2!1sen!2sus!4v1788008581543!5m2!1sen!2sus"
          width="100%" 
          height="100%" 
          style={{ border: 0 }} 
          allowFullScreen="" 
          loading="lazy"
          title="LuxuryStay Location"
        ></iframe>
      </div>

      {/* Frequently Asked Questions Section (From Image) */}
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          <div className="lg:col-span-1">
            <h2 className="text-3xl md:text-4xl font-serif text-blue-600 pr-8">Frequently asked questions</h2>
          </div>
          
          <div className="lg:col-span-2 space-y-2">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-gray-200">
                <button 
                  onClick={() => toggleFaq(index)}
                  className="w-full py-6 flex justify-between items-center text-left focus:outline-none group"
                >
                  <span className={`text-base font-bold transition-colors ${openFaq === index ? 'text-blue-600' : 'text-gray-700 group-hover:text-blue-600'}`}>
                    {faq.question}
                  </span>
                  <FontAwesomeIcon 
                    icon={openFaq === index ? faChevronUp : faChevronDown} 
                    className={`text-sm transition-colors ${openFaq === index ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-600'}`} 
                  />
                </button>
                <div 
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${openFaq === index ? 'max-h-40 opacity-100 pb-6' : 'max-h-0 opacity-0'}`}
                >
                  <p className="text-gray-500 font-light leading-relaxed">{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default ContactUs;
