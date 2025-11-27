
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('docs'));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.5.9')
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Models
const messageSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

const projectSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    features: [String],
    technologies: [String],
    liveUrl: String,
    githubUrl: String,
    imageUrl: String,
    featured: { type: Boolean, default: false },
    status: { type: String, enum: ['completed', 'in-progress'], default: 'completed' },
    order: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

const adminSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', messageSchema);
const Project = mongoose.model('Project', projectSchema);
const Admin = mongoose.model('Admin', adminSchema);

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'superdad10';

// Authentication Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ message: 'Access token required' });
    }
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

// Public Routes

// Get all projects (public)
app.get('/api/projects', async (req, res) => {
    try {
        const projects = await Project.find().sort({ order: 1, createdAt: -1 });
        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Submit contact message
app.post('/api/messages', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        
        if (!name || !email || !subject || !message) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        
        const newMessage = new Message({ name, email, subject, message });
        await newMessage.save();
        
        res.status(201).json({ message: 'Message sent successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Admin Routes

// Admin login
app.post('/api/admin/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        const admin = await Admin.findOne({username});
        if (!admin) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        const isValidPassword = await bcrypt.compare(password, admin.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        const token = jwt.sign(
            { id: admin._id, username: admin.username },
            JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        res.json({ 
            token, 
            admin: { 
                id: admin._id, 
                username: admin.username, 
                email: admin.email 
            } 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create admin (first time setup - should be protected in production)
app.post('/api/admin/setup', async (req, res) => {
    try {
        const adminCount = await Admin.countDocuments();
        if (adminCount > 0) {
            return res.status(400).json({ message: 'Admin already exists' });
        }
        
        const { username , password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const admin = new Admin({
            username ,
            
            password: hashedPassword
        });
        
        await admin.save();
        res.status(201).json({ message: 'Admin created successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all messages (protected)
app.get('/api/admin/messages', authenticateToken, async (req, res) => {
    try {
        const messages = await Message.find().sort({ createdAt: -1 });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Mark message as read (protected)
app.patch('/api/admin/messages/:id/read', authenticateToken, async (req, res) => {
    try {
        const message = await Message.findByIdAndUpdate(
            req.params.id,
            { read: true },
            { new: true }
        );
        res.json(message);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete message (protected)
app.delete('/api/admin/messages/:id', authenticateToken, async (req, res) => {
    try {
        await Message.findByIdAndDelete(req.params.id);
        res.json({ message: 'Message deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create project (protected)
app.post('/api/admin/projects', authenticateToken, async (req, res) => {
    try {
        const project = new Project(req.body);
        await project.save();
        res.status(201).json(project);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update project (protected)
app.put('/api/admin/projects/:id', authenticateToken, async (req, res) => {
    try {
        const project = await Project.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json(project);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete project (protected)
app.delete('/api/admin/projects/:id', authenticateToken, async (req, res) => {
    try {
        await Project.findByIdAndDelete(req.params.id);
        res.json({ message: 'Project deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Dashboard stats (protected)
app.get('/api/admin/stats', authenticateToken, async (req, res) => {
    try {
        const totalMessages = await Message.countDocuments();
        const unreadMessages = await Message.countDocuments({ read: false });
        const totalProjects = await Project.countDocuments();
        
        res.json({
            totalMessages,
            unreadMessages,
            totalProjects
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

const PORT = process.env.PORT || 2005;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});