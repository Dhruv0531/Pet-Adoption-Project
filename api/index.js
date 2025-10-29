const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());

// --- DATABASE CONNECTION ---
const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI)
  .then(() => console.log('Successfully connected to MongoDB Atlas'))
  .catch(err => console.error('MongoDB connection error:', err));

// --- JWT SECRET ---
// You MUST add JWT_SECRET to your Vercel Environment Variables
const JWT_SECRET = process.env.JWT_SECRET || 'a-default-secret-key-that-is-not-secure';

// --- DATABASE MODELS (SCHEMAS) ---

// 1. Pet Schema
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
const Pet = mongoose.models.Pet || mongoose.model('Pet', petSchema);

// 2. Application Schema
const applicationSchema = new mongoose.Schema({
  petId: { type: String, required: true },
  petName: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  message: { type: String }
}, { timestamps: true });
const Application = mongoose.models.Application || mongoose.model('Application', applicationSchema);

// 3. User (Admin) Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

// Automatically hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});
const User = mongoose.models.User || mongoose.model('User', userSchema);

// --- AUTH MIDDLEWARE (Security Guard) ---
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
  if (!token) {
    return res.status(401).json({ message: 'Access Denied: No token provided' });
  }
  
  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ message: 'Access Denied: Invalid token' });
  }
};

// --- API ROUTES ---
const router = express.Router();

// --- Public Routes (No token needed) ---

// GET all *available* pets
router.get('/pets', async (req, res) => {
  try {
    const pets = await Pet.find({ adoptionStatus: 'Available' });
    res.json(pets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST a new application
router.post('/applications', async (req, res) => {
  try {
    const application = new Application(req.body);
    await application.save();
    res.status(201).json({ message: 'Application submitted successfully!' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// --- Auth Routes ---

// POST /api/auth/register (Use ONCE with Postman to create your admin)
router.post('/auth/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = new User({ username, password });
    await user.save();
    res.status(201).json({ message: 'Admin user created successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// POST /api/auth/login
router.post('/auth/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- Admin Routes (Token required) ---

// POST a new pet
router.post('/pets', verifyToken, async (req, res) => {
  const pet = new Pet(req.body);
  try {
    const newPet = await pet.save();
    res.status(201).json(newPet);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT (Update) a pet
router.put('/pets/:id', verifyToken, async (req, res) => {
  try {
    const updatedPet = await Pet.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedPet) return res.status(404).json({ message: 'Pet not found' });
    res.json(updatedPet);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE a pet
router.delete('/pets/:id', verifyToken, async (req, res) => {
  try {
    const deletedPet = await Pet.findByIdAndDelete(req.params.id);
    if (!deletedPet) return res.status(404).json({ message: 'Pet not found' });
    res.json({ message: 'Pet deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET all applications
router.get('/applications', verifyToken, async (req, res) => {
  try {
    const applications = await Application.find().sort({ createdAt: -1 });
    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- Use Router and Export ---
app.use('/api', router);
module.exports = app;