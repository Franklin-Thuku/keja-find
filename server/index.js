import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import { supabase } from './config/supabase.js'; // Fixed path

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Essential for req.body
app.use('/uploads', express.static('uploads')); // Makes images viewable in browser

// Improved Multer Storage (Keeps file extensions like .jpg)
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// GET all houses
app.get('/api/houses', async (req, res) => {
  try {
    const { data, error } = await supabase.from('houses').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST a new house
app.post('/api/houses', upload.single('image'), async (req, res) => {
  try {
    const { title, price, location, description } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const { data, error } = await supabase
      .from('houses')
      .insert([{ title, price, location, description, image_url: imageUrl }])
      .select(); // Added .select() to get back the new record

    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));