
import React, { useState, useEffect } from "react";
import Modal from "@mui/material/Modal";
import Backdrop from "@mui/material/Backdrop";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import { useState, useCallback } from "react";
import axios from 'axios';
import { useSession } from '@supabase/auth-js';

const HouseUploadModal = () => {
  const [showModal, setShowModal] = useState(false);
  const [houseType, setHouseType] = useState('');
  const [location, setLocation] = useState('');
  const [amenities, setAmenities] = useState('');
  const [price, setPrice] = useState(0);
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const { data: session } = useSession();
  const [error, setError] = useState(false);

  const handleInputChange = (e) => {
    if (e.target.name === 'houseType') setHouseType(e.target.value);
    else if (e.target.name === 'location') setLocation(e.target.value);
    else if (e.target.name === 'amenities') setAmenities(e.target.value);
    else if (e.target.name === 'price') setPrice(parseFloat(e.target.value));
  };

  const handleImageChange = (event) => {
    setImage(event.target.files[0]);
  };

  const handleSubmit = useCallback(async () => {
    try {
      setError(false);

      // Handle image upload to Supabase Storage
      if (image) {
        const formData = new FormData();
        formData.append('file', image);
        const config = { headers: { 'Content-Type': 'multipart/form-data' } };
        const response = await axios.post('/supabase/storage/v1/objects', formData, config);

        // Get Public URL of uploaded image
        setImageUrl(response.data.url);
      }

      // Handle database insertion
      if (imageUrl && houseType && location && price) {
        const config = { headers: { Authorization: `Bearer ${session?.token}` } };
        await axios.post('/supabase/db/v1/objects', {
          name: 'houses',
          columns: ['public_url', 'type', 'location', 'price', 'landlord_id'],
          data: [
            [imageUrl, houseType, location, price.toString(), session.user.id]
          ],
        }, config);

        // Close modal and show success message
        setShowModal(false);
      } else {
        setError(true);
      }
    } catch (error) {
      setError(true);
    }
  }, [image, imageUrl, houseType, location, price, session]);

  return (
    <div>
      {showModal && (
        <Modal open={showModal} onClose={() => setShowModal(false)}>
          <Backdrop sx={{ bgcolor: 'rgba(0,0,0,0.5)', color: '#000' }} />
          <Box sx={{ width: '50%', margin: 'auto', p: 3, background: 'background', borderRadius: '10px' }}>
            <h2>House Upload</h2>
            {error && (
              <p style={{ color: 'red' }}>Error uploading data!</p>
            )}
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label>
                  House Type
                  <input type="text" name="houseType" value={houseType} onChange={handleInputChange} />
                </label>
              </div>
              <div className="mb-4">
                <label>
                  Location Description
                  <textarea name="location" value={location} onChange={handleInputChange} />
                </label>
              </div>
              <div className="mb-4">
                <label>
                  Amenities
                  <input type="text" name="amenities" value={amenities} onChange={handleInputChange} />
                </label>
              </div>
              <div className="mb-4">
                <label>
                  Price (KSh)
                  <input type="number" name="price" value={price} onChange={handleInputChange} />
                </label>
              </div>
              <div className="mb-4">
                <label>
                  Image
                  <input type="file" name="image" onChange={handleImageChange} />
                </label>
              </div>
              <Button variant="contained" color="primary" type="submit">Upload</Button>
            </form>
          </Box>
        </Modal>
      )}
    </div>
  );
};

export default HouseUploadModal;
