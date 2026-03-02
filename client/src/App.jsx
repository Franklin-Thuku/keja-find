import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './index.css'; // Standard Vite CSS import

function App() {
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetching from your Node server
    axios.get('http://localhost:5000/api/houses')
      .then((res) => {
        setHouses(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Server not running?", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Navbar with Glassmorphism */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 py-4">
        <div className="container mx-auto flex justify-between items-center px-6 md:px-12">
          <h1 className="text-2xl font-extrabold text-indigo-600 tracking-tight">Keja Find</h1>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-5 rounded-full transition-all shadow-lg shadow-indigo-200">
            List Your Keja
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">Find Your Next Home in Juja</h2>
          <p className="text-indigo-100 mb-8 text-lg">Searching Kenyatta Road, Highpoint, and Kalimoni...</p>
          <div className="max-w-2xl mx-auto">
            <input 
              type="text" 
              placeholder="Search by neighborhood..." 
              className="w-full p-4 rounded-2xl text-gray-900 shadow-2xl focus:ring-4 focus:ring-indigo-400 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Property Grid */}
      <main className="container mx-auto px-6 py-16">
        <h3 className="text-2xl font-bold text-gray-800 mb-8">Featured Kejas</h3>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-80 bg-gray-200 animate-pulse rounded-3xl"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {houses.map((house) => (
              <div key={house.id} className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100">
                <div className="relative h-56 overflow-hidden">
                  <img 
                    src={house.image_url ? `http://localhost:5000${house.image_url}` : 'https://via.placeholder.com/400'} 
                    alt={house.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-sm font-bold text-indigo-600">
                    KSh {house.price.toLocaleString()}
                  </div>
                </div>
                <div className="p-6">
                  <h4 className="text-xl font-bold text-gray-900 mb-1">{house.title}</h4>
                  <p className="text-gray-500 flex items-center gap-2 mb-4">
                    <span className="text-indigo-500">📍</span> {house.location}
                  </p>
                  <button className="w-full py-3 bg-slate-100 hover:bg-indigo-600 hover:text-white text-gray-700 font-semibold rounded-xl transition-colors">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;