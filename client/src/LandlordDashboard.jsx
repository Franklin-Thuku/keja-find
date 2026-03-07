import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './index.css';
import HouseUploadModal from './HouseUploadModal';
import PhoneUpdateModal from './PhoneUpdateModal';
import { supabase } from './supabaseClient';
import { AlertCircle, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

function LandlordDashboard() {
    const [houses, setHouses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [editingHouse, setEditingHouse] = useState(null); // Tracks the house being edited
    const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState(null);
    const navigate = useNavigate();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/');
        toast.success("Logged out successfully");
    };

    useEffect(() => {
        // Fetching properties from the Node server endpoint
        const fetchLandlordData = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {

                    // 1. Fetch Phone Number safely
                    const { data: profileData, error: profileError } = await supabase
                        .from('profiles')
                        .select('phone_number')
                        .eq('id', user.id)
                        .maybeSingle();

                    if (profileData?.phone_number) {
                        setPhoneNumber(profileData.phone_number);
                    } else if (profileError && profileError.code !== 'PGRST116') {
                        console.error("Profile Fetch Error:", profileError);
                    }

                    // 2. Fetch Houses
                    axios.get('http://192.168.0.103:5000/api/houses')
                        .then((res) => {
                            // Filter logic updated to ONLY show houses owned by this user
                            const myHouses = res.data.filter(h => h.landlord_id === user.id);
                            // Removed the sneaky "res.data" fallback that leaked all houses
                            setHouses(myHouses);
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

        fetchLandlordData();
    }, []);

    const handleRemove = async (houseId) => {
        // Switch to a Toast Custom Confirmation later, but for safety in this scope we'll use a prompt
        if (!window.confirm("Are you sure you want to delete this property? it cannot be undone.")) return;

        try {
            const { error } = await supabase
                .from('houses')
                .delete()
                .eq('id', houseId);

            if (error) throw error;

            toast.success("Property deleted successfully.");
            setHouses((prevHouses) => prevHouses.filter((house) => house.id !== houseId));
        } catch (error) {
            console.error("Error deleting house:", error);
            toast.error("Failed to delete property.");
        }
    };

    const openForEdit = (house) => {
        setEditingHouse(house);
        setIsUploadModalOpen(true);
    };

    const openForCreate = () => {
        setEditingHouse(null);
        setIsUploadModalOpen(true);
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Navbar with Glassmorphism */}
            <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 py-3 md:py-4">
                <div className="container mx-auto flex justify-between items-center px-4 md:px-12">
                    <Link to="/" className="text-xl md:text-2xl font-extrabold text-indigo-600 tracking-tight hover:text-indigo-700 transition">Keja Find</Link>
                    <div className="flex items-center gap-2 md:gap-4 shrink-0">
                        <span className="text-gray-600 font-medium hidden lg:inline">Landlord Portal</span>
                        <button
                            onClick={() => setIsPhoneModalOpen(true)}
                            className="bg-green-100 hover:bg-green-200 text-green-700 font-bold py-2 px-3 md:px-4 rounded-xl md:rounded-full transition-all border border-green-200 text-xs md:text-base hidden sm:block">
                            {phoneNumber ? 'Update WhatsApp' : 'Add WhatsApp'}
                        </button>
                        <button
                            onClick={openForCreate}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 md:px-5 rounded-xl md:rounded-full transition-all shadow-lg shadow-indigo-200 text-sm md:text-base hidden sm:block whitespace-nowrap">
                            List Your Keja
                        </button>
                        <button
                            onClick={handleLogout}
                            className="flex items-center justify-center p-2 md:px-3 text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 transition rounded-xl"
                            title="Log Out"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
            </nav>

            {/* Missing Phone Number Alert Banner */}
            {!loading && !phoneNumber && (
                <div className="pt-24 pb-2 px-4">
                    <div className="max-w-4xl mx-auto bg-amber-50 border border-amber-200 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-4 gap-4 sm:gap-2">
                        <div className="flex items-start sm:items-center gap-3">
                            <div className="p-2 bg-amber-100 rounded-lg text-amber-600 shrink-0">
                                <AlertCircle size={20} />
                            </div>
                            <p className="text-amber-800 font-medium text-sm md:text-base">
                                <span className="font-bold block sm:inline">Missing Info:</span> Please add your WhatsApp number so students can contact you!
                            </p>
                        </div>
                        <button
                            onClick={() => setIsPhoneModalOpen(true)}
                            className="w-full sm:w-auto bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold py-2 px-4 rounded-xl transition text-sm whitespace-nowrap shrink-0"
                        >
                            Setup Now
                        </button>
                    </div>
                </div>
            )}

            {/* Hero Section - Simplified for Landlords */}
            <div className="relative pt-24 pb-12 md:pt-32 md:pb-12 bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">Manage Your Listings</h2>
                    <p className="text-indigo-100 text-base md:text-lg max-w-2xl mx-auto px-2">
                        View your active properties and attract more students in Juja.
                    </p>
                </div>
            </div>

            {/* Property Grid */}
            <main className="container mx-auto px-4 md:px-6 py-12 md:py-16">
                <div className="flex justify-between items-center mb-6 md:mb-8">
                    <h3 className="text-xl md:text-2xl font-bold text-gray-800">Your Properties</h3>
                    <button
                        onClick={openForCreate}
                        className="md:hidden bg-indigo-100 text-indigo-700 font-bold py-2 px-4 rounded-xl text-sm whitespace-nowrap"
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
                                        src={house.image_url ? (house.image_url.startsWith('http') ? house.image_url : `http://192.168.0.103:5000${house.image_url}`) : 'https://via.placeholder.com/400'}
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
                                        <button
                                            onClick={() => openForEdit(house)}
                                            className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-gray-700 font-semibold rounded-xl transition-colors"
                                        >
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
                        {houses.length === 0 && (
                            <div className="col-span-1 md:col-span-3 text-center py-20 bg-white rounded-3xl border border-gray-100">
                                <h4 className="text-2xl font-bold text-gray-400 mb-2">No Properties Listed</h4>
                                <p className="text-gray-500 mb-6">Click "List Your Keja" to upload your first house.</p>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Upload/Edit Modal */}
            <HouseUploadModal
                isOpen={isUploadModalOpen}
                onClose={() => {
                    setIsUploadModalOpen(false);
                    setEditingHouse(null);
                }}
                initialData={editingHouse}
            />

            {/* Phone Modal */}
            <PhoneUpdateModal
                isOpen={isPhoneModalOpen}
                onClose={() => setIsPhoneModalOpen(false)}
                currentPhone={phoneNumber}
                onUpdateSuccess={(newPhone) => setPhoneNumber(newPhone)}
            />
        </div>
    );
}

export default LandlordDashboard;
