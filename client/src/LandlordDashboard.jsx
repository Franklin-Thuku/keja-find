import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './index.css';
import HouseUploadModal from './HouseUploadModal';
import { supabase } from './supabaseClient';

function LandlordDashboard() {
    const [houses, setHouses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    useEffect(() => {
        // Fetching properties from the Node server endpoint
        const fetchLandlordHouses = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    // We'll call the regular endpoint for now, but in a real app
                    // we might want an endpoint like /api/houses/landlord/:id
                    // For now, we filter on the client side based on landlord_id 
                    // assuming the houses table has a landlord_id column
                    // Or just fetch all and filter.
                    axios.get('http://localhost:5000/api/houses')
                        .then((res) => {
                            const myHouses = res.data.filter(h => h.landlord_id === user.id);
                            if (myHouses.length > 0) {
                                setHouses(myHouses);
                            } else {
                                setHouses(res.data); // Fallback if no matching ID found during this mock
                            }
                            setLoading(false);
                        })
                        .catch((err) => {
                            console.error("Server not running?", err);
                            setLoading(false);
                        });
                }
            } catch (error) {
                console.error("Auth error:", error);
            }
        };

        fetchLandlordHouses();
    }, []);

    const handleRemove = async (houseId) => {
        if (!window.confirm("Are you sure you want to delete this property?")) return;

        try {
            const { error } = await supabase
                .from('houses')
                .delete()
                .eq('id', houseId);

            if (error) throw error;

            // Immediately update the UI without reloading
            setHouses((prevHouses) => prevHouses.filter((house) => house.id !== houseId));
        } catch (error) {
            console.error("Error deleting house:", error);
            alert("Failed to delete property.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Navbar with Glassmorphism */}
            <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 py-4">
                <div className="container mx-auto flex justify-between items-center px-6 md:px-12">
                    <h1 className="text-2xl font-extrabold text-indigo-600 tracking-tight">Keja Find</h1>
                    <div className="flex items-center gap-4">
                        <span className="text-gray-600 font-medium hidden md:inline">Landlord Portal</span>
                        <button
                            onClick={() => setIsUploadModalOpen(true)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-5 rounded-full transition-all shadow-lg shadow-indigo-200">
                            List Your Keja
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section - Simplified for Landlords */}
            <div className="relative pt-32 pb-12 bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-4xl md:text-5xl font-bold mb-4">Manage Your Listings</h2>
                    <p className="text-indigo-100 text-lg max-w-2xl mx-auto">
                        View your active properties and attract more students in Juja.
                    </p>
                </div>
            </div>

            {/* Property Grid */}
            <main className="container mx-auto px-6 py-16">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-800">Your Properties</h3>
                    <button
                        onClick={() => setIsUploadModalOpen(true)}
                        className="md:hidden bg-indigo-100 text-indigo-700 font-bold py-2 px-4 rounded-xl text-sm"
                    >
                        + Add New
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
                        {houses.map((house) => (
                            <div key={house.id} className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100">
                                <div className="relative h-56 overflow-hidden">
                                    <img
                                        src={house.image_url ? (house.image_url.startsWith('http') ? house.image_url : `http://localhost:5000${house.image_url}`) : 'https://via.placeholder.com/400'}
                                        alt={house.house_type || house.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-sm font-bold text-indigo-600">
                                        KSh {house.price.toLocaleString()}
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="text-xl font-bold text-gray-900">{house.house_type || house.title}</h4>
                                        <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-lg font-bold">Active</span>
                                    </div>
                                    <p className="text-gray-500 flex items-center gap-2 mb-4">
                                        <span className="text-indigo-500">📍</span> {house.location_description || house.location}
                                    </p>
                                    <div className="flex gap-2">
                                        <button className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-gray-700 font-semibold rounded-xl transition-colors">
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleRemove(house.id)}
                                            className="flex-1 py-3 bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded-xl transition-colors"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Upload Modal */}
            <HouseUploadModal
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
            />
        </div>
    );
}

export default LandlordDashboard;
