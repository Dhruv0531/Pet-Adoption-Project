const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// --- MIDDLEWARE ---
app.use(cors()); 
app.use(express.json());

// --- DATABASE CONNECTION ---
// Reads the MONGO_URI from your .env file (locally) or Vercel's settings
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => console.log('Successfully connected to MongoDB Atlas'))
  .catch(err => console.error('MongoDB connection error:', err));

// --- DATABASE MODEL (Schema) ---
const petSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  breed: { type: String, required: true },
  age: { type: String, required: true },
  location: { type: String, required: true },
  bio: { type: String, required: true },
  image: { type: String, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Unknown'], default: 'Unknown' },
  size: { type: String, enum: ['Small', 'Medium', 'Large'], default: 'Medium' },
  adoptionStatus: { type: String, enum: ['Available', 'Pending', 'Adopted'], default: 'Available' }
});

// Create the 'Pet' model.
const Pet = mongoose.models.Pet || mongoose.model('Pet', petSchema);

// --- API ROUTES ---
const router = express.Router();

// GET all available pets
router.get('/pets', async (req, res) => {
  try {
    const pets = await Pet.find({ adoptionStatus: 'Available' });
    res.json(pets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET a single pet by its ID
router.get('/pets/:id', async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) return res.status(404).json({ message: 'Pet not found' });
    res.json(pet);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST (CREATE) a new pet
router.post('/pets', async (req, res) => {
  const pet = new Pet(req.body);
  try {
    const newPet = await pet.save();
    res.status(201).json(newPet);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT (UPDATE) a pet by ID
router.put('/pets/:id', async (req, res) => {
  try {
    const updatedPet = await Pet.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedPet) return res.status(404).json({ message: 'Pet not found' });
    res.json(updatedPet);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE a pet by ID
router.delete('/pets/:id', async (req, res) => {
  try {
    const deletedPet = await Pet.findByIdAndDelete(req.params.id);
    if (!deletedPet) return res.status(404).json({ message: 'Pet not found' });
    res.json({ message: 'Pet deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- TELL OUR APP TO USE THESE ROUTES ---
app.use('/api', router); 

// --- EXPORT FOR VERCEL ---
module.exports = app;