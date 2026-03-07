import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './index.css';
import HouseDetailsModal from './HouseDetailsModal';
import { supabase } from './supabaseClient';
import { Heart } from 'lucide-react';

function UserDashboard() {
    const [houses, setHouses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedHouse, setSelectedHouse] = useState(null);
    const [user, setUser] = useState(null);
    const [savedHouseIds, setSavedHouseIds] = useState(new Set());
    const [activeTab, setActiveTab] = useState('all'); // 'all' or 'saved'

    useEffect(() => {
        const fetchUserData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUser(user);
                // Fetch their saved houses
                const { data: savedData, error } = await supabase
                    .from('saved_houses')
                    .select('house_id')
                    .eq('user_id', user.id);

                if (!error && savedData) {
                    setSavedHouseIds(new Set(savedData.map(row => row.house_id)));
                }
            }
        };
        fetchUserData();
        // Fetching from your Node server
        axios.get('http://192.168.0.103:5000/api/houses')
            .then((res) => {
                setHouses(res.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Server not running?", err);
                setLoading(false);
            });
    }, []);

    const toggleSaveHouse = async (houseId, e) => {
        e.stopPropagation(); // Prevent opening modal
        if (!user) {
            alert("Please log in to save properties.");
            return;
        }

        const isSaved = savedHouseIds.has(houseId);

        // Optimistic UI update
        const newSavedIds = new Set(savedHouseIds);
        if (isSaved) {
            newSavedIds.delete(houseId);
            setSavedHouseIds(newSavedIds);
            // Remove from DB
            await supabase.from('saved_houses')
                .delete()
                .eq('user_id', user.id)
                .eq('house_id', houseId);
        } else {
            newSavedIds.add(houseId);
            setSavedHouseIds(newSavedIds);
            // Add to DB
            await supabase.from('saved_houses')
                .insert([{ user_id: user.id, house_id: houseId }]);
        }
    };

    const displayedHouses = activeTab === 'all'
        ? houses
        : houses.filter(h => savedHouseIds.has(h.id));

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Navbar with Glassmorphism */}
            <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 py-4">
                <div className="container mx-auto flex justify-between items-center px-6 md:px-12">
                    <h1 className="text-2xl font-extrabold text-indigo-600 tracking-tight">Keja Find</h1>
                    <div className="text-gray-600 font-medium">Student Dashboard</div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="relative pt-24 pb-12 md:pt-32 md:pb-20 bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-3xl md:text-6xl font-bold mb-4 md:mb-6 leading-tight">Find Your Next Home in Juja</h2>
                    <p className="text-indigo-100 mb-6 md:mb-8 text-sm md:text-lg px-2">Searching Kenyatta Road, Highpoint, and Kalimoni...</p>
                    <div className="max-w-2xl mx-auto">
                        <input
                            type="text"
                            placeholder="Search Kenyatta Road, Highpoint..."
                            className="w-full p-3 md:p-4 rounded-xl md:rounded-2xl text-base md:text-lg text-gray-900 bg-white/90 backdrop-blur-sm placeholder:text-gray-500 shadow-2xl focus:ring-4 focus:ring-indigo-300 outline-none transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Property Grid Tabs */}
            <main className="container mx-auto px-6 py-12 md:py-16">

                <div className="flex items-center gap-4 mb-8 border-b border-gray-200 pb-4">
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`text-lg font-bold pb-2 transition-all ${activeTab === 'all' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        Featured Kejas
                    </button>
                    <button
                        onClick={() => setActiveTab('saved')}
                        className={`text-lg font-bold pb-2 transition-all flex items-center gap-2 ${activeTab === 'saved' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <Heart size={20} className={activeTab === 'saved' ? 'fill-indigo-600' : ''} />
                        Saved Kejas
                    </button>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[1, 2, 3].map((n) => (
                            <div key={n} className="h-80 bg-gray-200 animate-pulse rounded-3xl"></div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {displayedHouses.map((house) => (
                            <div key={house.id} className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 relative">
                                <div className="relative h-56 overflow-hidden">
                                    <img
                                        src={house.image_url ? (house.image_url.startsWith('http') ? house.image_url : `http://192.168.0.103:5000${house.image_url}`) : 'https://via.placeholder.com/400'}
                                        alt={house.house_type || house.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-sm font-bold text-indigo-600 z-10">
                                        KSh {house.price.toLocaleString()}
                                    </div>
                                    <button
                                        onClick={(e) => toggleSaveHouse(house.id, e)}
                                        className="absolute top-4 right-4 bg-white/50 hover:bg-white backdrop-blur-md p-2 rounded-full z-10 transition-all shadow-sm group-hover:shadow-md"
                                    >
                                        <Heart
                                            size={20}
                                            className={`${savedHouseIds.has(house.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
                                        />
                                    </button>
                                </div>
                                <div className="p-6">
                                    <h4 className="text-xl font-bold text-gray-900 mb-1">{house.house_type || house.title}</h4>
                                    <p className="text-gray-500 flex items-center gap-2 mb-4">
                                        <span className="text-indigo-500">📍</span> {house.location_description || house.location}
                                    </p>
                                    <button
                                        onClick={() => setSelectedHouse(house)}
                                        className="w-full py-3 bg-slate-100 hover:bg-indigo-600 hover:text-white text-gray-700 font-semibold rounded-xl transition-colors"
                                    >
                                        View Details
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && displayedHouses.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
                        <Heart className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                        <h4 className="text-2xl font-bold text-gray-400 mb-2">No Saved Properties</h4>
                        <p className="text-gray-500 mb-6">Click the heart icon on any keja to save it for later.</p>
                    </div>
                )}
            </main>

            <HouseDetailsModal
                isOpen={!!selectedHouse}
                onClose={() => setSelectedHouse(null)}
                house={selectedHouse}
            />
        </div>
    );
}

export default UserDashboard;
