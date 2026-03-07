import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import { X, Upload } from 'lucide-react';
import toast from 'react-hot-toast';

const HouseUploadModal = ({ isOpen, onClose, initialData = null }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [image, setImage] = useState(null);
  const [formData, setFormData] = useState({
    houseType: initialData?.house_type || 'Bedsitter',
    location: initialData?.location_description || '',
    amenities: initialData?.amenities || '',
    price: initialData?.price?.toString() || ''
  });

  // Sync form data if initialData changes (e.g. they click Edit on a different house)
  React.useEffect(() => {
    if (initialData) {
      setFormData({
        houseType: initialData.house_type || 'Bedsitter',
        location: initialData.location_description || '',
        amenities: initialData.amenities || '',
        price: initialData.price?.toString() || ''
      });
      setImage(null); // Reset image explicitly
    } else {
      setFormData({ houseType: 'Bedsitter', location: '', amenities: '', price: '' });
      setImage(null);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be logged in to upload/edit.");

      // If creating new, ALWAYS require an image. If editing, image is optional.
      if (!initialData && !image) {
        throw new Error("Please select an image for your keja.");
      }

      let publicUrl = initialData?.image_url;

      // 1. Upload new Image to Storage (if a new one was provided)
      if (image) {
        const fileExt = image.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('house-images')
          .upload(filePath, image);

        if (uploadError) throw uploadError;

        const { data: { publicUrl: newUrl } } = supabase.storage
          .from('house-images')
          .getPublicUrl(filePath);

        publicUrl = newUrl;
      }

      // 2. Build the Payload
      const payload = {
        house_type: formData.houseType,
        location_description: formData.location,
        amenities: formData.amenities,
        price: parseFloat(formData.price),
        image_url: publicUrl,
        landlord_id: user.id
      };

      // 3. Database operation (Update OR Insert)
      let dbError = null;

      if (initialData) {
        // EDIT MODE
        const { error } = await supabase
          .from('houses')
          .update(payload)
          .eq('id', initialData.id);
        dbError = error;
      } else {
        // CREATE MODE
        const { error } = await supabase
          .from('houses')
          .insert([payload]);
        dbError = error;
      }

      if (dbError) throw dbError;

      toast.success(initialData ? "House updated successfully!" : "Success! Your keja is now listed.");
      onClose(); // Close modal on success
      window.location.reload(); // Refresh to reflect the changes cleanly
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-white/20 relative animate-in fade-in zoom-in duration-200">

        {/* Close Button */}
        <button type="button" onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition">
          <X size={24} />
        </button>

        <h2 className="text-3xl font-bold text-gray-900 mb-6">
          {initialData ? "Edit Your Keja" : "List Your Keja"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">House Type</label>
            <select
              className="w-full p-4 rounded-xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              value={formData.houseType}
              onChange={(e) => setFormData({ ...formData, houseType: e.target.value })}
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
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Amenities</label>
              <input
                type="text"
                placeholder="WiFi, Water..."
                className="w-full p-4 rounded-xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
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
              required={!initialData}
            />
            <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-2">
              <Upload className="text-indigo-500" />
              <span className="text-sm font-medium text-gray-600">
                {image ? image.name : (initialData ? "Optional: Change Photo" : "Upload House Photo")}
              </span>
            </label>
          </div>

          {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-xl font-bold transition shadow-lg shadow-indigo-200 disabled:opacity-50 mt-4"
          >
            {loading ? (initialData ? "Saving Changes..." : "Uploading Keja...") : (initialData ? "Save Changes" : "Post Listing")}
          </button>
        </form>
      </div>
    </div>
  );
};

export default HouseUploadModal;