
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.5.9')
.then(() => console.log('✓ MongoDB connected'))
.catch(err => {
    console.error('✗ MongoDB connection error:', err);
    process.exit(1);
});

// Admin Schema
const adminSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const Admin = mongoose.model('Admin', adminSchema);

// Project Schema
const projectSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    features: [String],
    technologies: [String],
    liveUrl: String,
    githubUrl: String,
    featured: { type: Boolean, default: false },
    status: { type: String, enum: ['completed', 'in-progress'], default: 'completed' },
    order: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

const Project = mongoose.model('Project', projectSchema);

// Setup function
async function setup() {
    try {
        console.log('\n🚀 Setting up your portfolio system...\n');

        // Check if admin exists
        const adminCount = await Admin.countDocuments();
        
        if (adminCount === 0) {
            console.log('Creating admin account...');
            
            // Create admin
            const hashedPassword = await bcrypt.hash('admin123', 10);
            const admin = new Admin({
                username: 'admin',
                email: 'admin@portfolio.com',
                password: hashedPassword
            });
            
            await admin.save();
            console.log('✓ Admin account created');
            console.log('  Username: admin');
            console.log('  Password: admin123');
            console.log('  ⚠️  IMPORTANT: Change this password after first login!\n');
        } else {
            console.log('✓ Admin account already exists\n');
        }

        // Check if projects exist
        const projectCount = await Project.countDocuments();
        
        if (projectCount === 0) {
            console.log('Adding sample projects...');
            
            // Add sample projects
            const sampleProjects = [
                {
                    title: 'BA-Tours Management & Booking System',
                    description: 'A full-featured web platform for managing tours and bookings, built for a local tour company. Includes both Admin and Client Dashboards.',
                    features: [
                        '🧾 Bookings & Reports',
                        '💰 Financial Records',
                        '📦 Inventory Management',
                        '👤 User Management'
                    ],
                    technologies: ['HTML', 'CSS', 'JavaScript', 'Node.js', 'Express', 'MongoDB'],
                    liveUrl: 'https://codewithshadyy.github.io/BA-tours-rentals/',
                    featured: true,
                    status: 'completed',
                    order: 1
                },
                {
                    title: 'Low-Data App for Local Creatives',
                    description: 'A lightweight platform designed to empower local creatives in rural Kenya, helping them share and sell their art with limited internet access.',
                    features: [
                        '🌍 Rural-Focused',
                        '⚡ Speed Optimized',
                        '♿ Accessibility',
                        '📱 Mobile-First'
                    ],
                    technologies: ['Node.js', 'Express', 'MongoDB'],
                    featured: false,
                    status: 'in-progress',
                    order: 2
                }
            ];

            await Project.insertMany(sampleProjects);
            console.log('✓ Sample projects added\n');
        } else {
            console.log('✓ Projects already exist\n');
        }

        console.log('✨ Setup complete!\n');
        console.log('Next steps:');
        console.log('1. Start the server: npm start');
        console.log('2. Visit http://localhost:2005/index.html for the portfolio');
        console.log('3. Visit http://localhost:2005/admin.html for the admin panel');
        console.log('4. Login with username: admin, password: admin123\n');
        
        process.exit(0);
    } catch (error) {
        console.error('✗ Setup failed:', error);
        process.exit(1);
    }
}

// Run setup
setup();