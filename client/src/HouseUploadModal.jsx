import React, { useState } from 'react';
import { supabase } from './supabaseClient'; // Import your configured client
import { X, Upload } from 'lucide-react'; // For a better UI

const HouseUploadModal = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [image, setImage] = useState(null);
  const [formData, setFormData] = useState({
    houseType: 'Bedsitter',
    location: '',
    amenities: '',
    price: ''
  });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be logged in to upload.");

      // 1. Upload Image to Supabase Storage
      const fileExt = image.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('house-images')
        .upload(filePath, image);

      if (uploadError) throw uploadError;

      // 2. Get the Public URL for the database
      const { data: { publicUrl } } = supabase.storage
        .from('house-images')
        .getPublicUrl(filePath);

      // 3. Insert record into 'houses' table
      const { error: dbError } = await supabase
        .from('houses')
        .insert([{
          house_type: formData.houseType,
          location_description: formData.location,
          amenities: formData.amenities,
          price: parseFloat(formData.price),
          image_url: publicUrl,
          landlord_id: user.id
        }]);

      if (dbError) throw dbError;

      alert("Success! Your keja is now listed.");
      onClose(); // Close modal on success
      window.location.reload(); // Refresh to show new house
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-white/20 relative animate-in fade-in zoom-in duration-200">
        
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition">
          <X size={24} />
        </button>

        <h2 className="text-3xl font-bold text-gray-900 mb-6">List Your Keja</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">House Type</label>
            <select 
              className="w-full p-4 rounded-xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              value={formData.houseType}
              onChange={(e) => setFormData({...formData, houseType: e.target.value})}
            >
              <option>Single Room</option>
              <option>Bedsitter</option>
              <option>One Bedroom</option>
              <option>Two Bedroom</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Location (Description)</label>
            <textarea 
              placeholder="e.g. Near Gate C, Kenyatta Road"
              className="w-full p-4 rounded-xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-indigo-500 transition-all h-24"
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Price (KSh)</label>
              <input 
                type="number"
                placeholder="5000"
                className="w-full p-4 rounded-xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Amenities</label>
              <input 
                type="text"
                placeholder="WiFi, Water..."
                className="w-full p-4 rounded-xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                onChange={(e) => setFormData({...formData, amenities: e.target.value})}
              />
            </div>
          </div>

          <div className="border-2 border-dashed border-indigo-100 rounded-2xl p-6 text-center bg-indigo-50/30">
            <input 
              type="file" 
              id="file-upload"
              accept="image/*"
              className="hidden"
              onChange={(e) => setImage(e.target.files[0])}
              required
            />
            <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-2">
              <Upload className="text-indigo-500" />
              <span className="text-sm font-medium text-gray-600">
                {image ? image.name : "Upload House Photo"}
              </span>
            </label>
          </div>

          {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-xl font-bold transition shadow-lg shadow-indigo-200 disabled:opacity-50 mt-4"
          >
            {loading ? "Uploading Keja..." : "Post Listing"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default HouseUploadModal;