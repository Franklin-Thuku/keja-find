import React, { useState } from 'react';
import { X, Phone } from 'lucide-react';
import { supabase } from './supabaseClient';
import toast from 'react-hot-toast';

const PhoneUpdateModal = ({ isOpen, onClose, currentPhone, onUpdateSuccess }) => {
    const [phone, setPhone] = useState(currentPhone || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Authentication error. Please log in again.");

            const cleanPhone = phone.trim();

            const { error: updateError } = await supabase
                .from('profiles')
                .upsert({ id: user.id, phone_number: cleanPhone });

            if (updateError) throw updateError;

            toast.success("WhatsApp number saved successfully!");
            onUpdateSuccess(cleanPhone);
            onClose();
        } catch (err) {
            console.error("Failed to save phone:", err);
            toast.error(err.message || "An unexpected error occurred.");
            setError(err.message || "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl relative my-auto animate-in fade-in zoom-in duration-300 border border-white/20 p-6 sm:p-8">

                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-all z-10"
                >
                    <X size={20} />
                </button>

                <div className="mb-6 sm:mb-8 text-center">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Phone size={28} className="sm:w-8 sm:h-8" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Update WhatsApp</h2>
                    <p className="text-gray-500 text-xs sm:text-sm mt-2 px-2">Enter your active WhatsApp number so students can easily reach out regarding your Kejas.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">WhatsApp Number</label>
                        <input
                            type="tel"
                            placeholder="e.g. 0712345678"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full p-4 text-lg font-medium rounded-xl bg-slate-50 border-2 border-transparent focus:border-green-500 outline-none transition-all shadow-sm"
                            required
                        />
                    </div>

                    {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#25D366] hover:bg-[#20b858] text-white py-4 rounded-xl font-bold text-lg transition-all shadow-xl hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
                    >
                        {loading ? "Saving..." : "Save Number"}
                    </button>
                </form>

            </div>
        </div>
    );
};

export default PhoneUpdateModal;
