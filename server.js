import express from 'express';
import nodemailer from 'nodemailer';
import mongoose from 'mongoose';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB connection
const MONGO_URI = 'mongodb://auraops_user:470309Nith@ac-avuct5e-shard-00-00.1bzhqrf.mongodb.net:27017,ac-avuct5e-shard-00-01.1bzhqrf.mongodb.net:27017,ac-avuct5e-shard-00-02.1bzhqrf.mongodb.net:27017/auraops_db?ssl=true&replicaSet=atlas-dzdygj-shard-0&authSource=admin&appName=Cluster0';
mongoose.connect(MONGO_URI).then(() => console.log('✅ Connected to MongoDB Atlas')).catch(err => console.error('MongoDB error:', err));

// Schema & Model
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  resetOtp: String,
  resetOtpExpires: Date,
});
const User = mongoose.model('User', userSchema, 'users');

const projectSchema = new mongoose.Schema({
  userId: String,
  name: String,
  repoUrl: String,
  condition: String,
  githubPat: String,
  createdAt: { type: Date, default: Date.now },
});
const Project = mongoose.model('Project', projectSchema, 'projects');

const JWT_SECRET = 'auraops-super-secret-key-that-is-long-enough-for-hs256-encryption-standard';

// Middleware to protect routes
const auth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token' });
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// ─── AUTHENTICATION ─────────────────────────────────────
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    const token = jwt.sign({ userId: user._id, name: user.name }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });

    const token = jwt.sign({ userId: user._id, name: user.name }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'shreenithya111@gmail.com',
    pass: 'qzoy xxfl hvmq htbn', // App password provided by user
  },
});

app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'No account found with that email' });

    // Generate random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    user.resetOtp = otp;
    user.resetOtpExpires = Date.now() + 60 * 1000; // 1 minute valid
    await user.save();

    const mailOptions = {
      from: 'AuraOps <shreenithya111@gmail.com>',
      to: email,
      subject: 'AuraOps - Password Reset OTP',
      text: `Hello ${user.name},\n\nYour OTP for password reset is: ${otp}\nIt is valid for exactly 1 minute.\n\nBest,\nThe AuraOps Team`,
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: 'OTP sent to your email.' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: 'Error sending email. Try again later.' });
  }
});

app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.resetOtp !== otp) return res.status(400).json({ message: 'Invalid OTP' });
    if (Date.now() > user.resetOtpExpires) return res.status(400).json({ message: 'OTP has expired' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetOtp = undefined;
    user.resetOtpExpires = undefined;
    await user.save();

    res.json({ success: true, message: 'Password successfully reset' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── PROJECTS ───────────────────────────────────────────
app.get('/api/projects', auth, async (req, res) => {
  const projects = await Project.find({ userId: req.user.userId });
  res.json(projects);
});

app.post('/api/projects', auth, async (req, res) => {
  const project = new Project({ ...req.body, userId: req.user.userId });
  await project.save();
  res.json(project);
});

app.get('/api/projects/:id', auth, async (req, res) => {
  const project = await Project.findOne({ _id: req.params.id, userId: req.user.userId });
  if (!project) return res.status(404).json({ message: 'Not found' });
  res.json(project);
});

app.put('/api/projects/:id', auth, async (req, res) => {
  const project = await Project.findOneAndUpdate({ _id: req.params.id, userId: req.user.userId }, req.body, { new: true });
  res.json(project);
});

app.delete('/api/projects/:id', auth, async (req, res) => {
  await Project.deleteOne({ _id: req.params.id, userId: req.user.userId });
  res.json({ success: true });
});

app.get('/api/projects/:id/stats', auth, async (req, res) => {
  res.json({ totalRuns: 14, successRate: 98, failed: 2, errorsFixed: 5, openPRs: 1 });
});

// Start Server
app.listen(8080, () => {
  console.log('✅ AuraOps Node Backend running on port 8080');
});
