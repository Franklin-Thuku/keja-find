import React, { useState } from 'react';
import { X, MapPin, CheckCircle, Wifi, Droplets, Shield, Zap, MessageCircle } from 'lucide-react';
import { supabase } from './supabaseClient';

const HouseDetailsModal = ({ isOpen, onClose, house }) => {
    const [contacting, setContacting] = useState(false);

    if (!isOpen || !house) return null;

    // Basic utility to map amenities strings to icons
    const renderAmenityBadge = (amenity) => {
        const text = amenity.trim().toLowerCase();

        let Icon = CheckCircle;
        let bg = 'bg-gray-100/50';
        let textCol = 'text-gray-700';

        if (text.includes('wifi') || text.includes('internet')) {
            Icon = Wifi;
            bg = 'bg-blue-50';
            textCol = 'text-blue-600';
        }
        if (text.includes('water') || text.includes('borehole')) {
            Icon = Droplets;
            bg = 'bg-cyan-50';
            textCol = 'text-cyan-600';
        }
        if (text.includes('security') || text.includes('guard')) {
            Icon = Shield;
            bg = 'bg-green-50';
            textCol = 'text-green-600';
        }
        if (text.includes('tokens') || text.includes('electricity') || text.includes('power')) {
            Icon = Zap;
            bg = 'bg-amber-50';
            textCol = 'text-amber-600';
        }

        return (
            <div key={amenity} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-semibold border border-white/40 shadow-sm ${bg} ${textCol}`}>
                <Icon size={14} />
                {amenity.trim()}
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl relative my-auto animate-in fade-in zoom-in duration-300 flex flex-col md:flex-row overflow-hidden border border-white/20">

                {/* Close Button - Responsive Position */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 md:top-6 md:right-6 bg-white/50 backdrop-blur-md hover:bg-white text-gray-600 hover:text-gray-900 p-2 rounded-full transition-all z-10 shadow-sm border border-gray-100"
                >
                    <X size={20} className="md:w-6 md:h-6" />
                </button>

                {/* Image Section */}
                <div className="w-full md:w-1/2 h-56 sm:h-64 md:h-auto relative bg-gray-100">
                    <img
                        src={house.image_url ? (house.image_url.startsWith('http') ? house.image_url : `http://192.168.0.103:5000${house.image_url}`) : 'https://via.placeholder.com/600'}
                        alt={house.house_type || house.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent md:hidden" />
                    <div className="absolute bottom-4 left-4 md:hidden">
                        <div className="bg-white/90 backdrop-blur px-4 py-1.5 rounded-full text-lg font-bold text-indigo-600 shadow-lg">
                            KSh {house.price.toLocaleString()}
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="w-full md:w-1/2 p-4 sm:p-6 md:p-10 flex flex-col bg-slate-50/50">

                    <div className="hidden md:inline-block bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-2xl text-xl font-bold text-indigo-600 w-max mb-6">
                        KSh {house.price.toLocaleString()} / month
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2 leading-tight">
                        {house.house_type || house.title}
                    </h2>

                    <div className="flex items-center gap-2 text-slate-600 font-medium mb-8">
                        <span className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg">
                            <MapPin size={16} />
                        </span>
                        {house.location_description || house.location}
                    </div>

                    <div className="space-y-6 flex-grow">
                        {house.amenities && (
                            <div>
                                <h3 className="text-sm font-bold text-slate-400 tracking-wider uppercase mb-3">Amenities Included</h3>
                                <div className="flex flex-wrap gap-2">
                                    {house.amenities.split(',').map(renderAmenityBadge)}
                                </div>
                            </div>
                        )}

                        <div>
                            <h3 className="text-sm font-bold text-slate-400 tracking-wider uppercase mb-3">About the Area</h3>
                            <p className="text-slate-600 leading-relaxed text-sm">
                                Located strategically in Juja, this {house.house_type?.toLowerCase() || 'property'} offers easy access to JKUAT and local shopping centers. Ideal for students prioritizing convenience and security.
                            </p>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-200">
                        <button
                            onClick={async () => {
                                setContacting(true);
                                try {
                                    const { data, error } = await supabase
                                        .from('profiles')
                                        .select('phone_number')
                                        .eq('id', house.landlord_id)
                                        .maybeSingle();

                                    if (error || !data || !data.phone_number) {
                                        alert("Landlord's phone number is unavailable.");
                                        return;
                                    }

                                    // Format phone number (ensure international format for WhatsApp)
                                    let formattedPhone = data.phone_number.trim();
                                    // simple naive formatting assumption (stripping leading 0 and adding 254)
                                    if (formattedPhone.startsWith('0')) {
                                        formattedPhone = '254' + formattedPhone.slice(1);
                                    }

                                    const houseName = house.house_type || house.title || 'the property';
                                    const message = encodeURIComponent(`Hi, I'm interested in ${houseName} listed on Keja Find for KSh ${house.price.toLocaleString()}. Is it still available?`);

                                    window.open(`https://wa.me/${formattedPhone}?text=${message}`, '_blank');
                                } catch (err) {
                                    console.error("Error contacting landlord:", err);
                                    alert("Something went wrong while trying to contact landlord.");
                                } finally {
                                    setContacting(false);
                                }
                            }}
                            disabled={contacting}
                            className="w-full bg-[#25D366] hover:bg-[#20b858] text-white py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg transition-all shadow-xl hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 disabled:opacity-75"
                        >
                            <MessageCircle size={24} className="w-5 h-5 sm:w-6 sm:h-6" />
                            {contacting ? "Connecting..." : "WhatsApp Landlord"}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default HouseDetailsModal;
