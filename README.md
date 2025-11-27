

# 🚀 Portfolio Website with Admin Panel

A full-stack portfolio management system built with HTML, CSS, JavaScript, Node.js, Express, and MongoDB.

## ✨ Features

### Portfolio Website
- Modern, responsive design
- Dynamic project showcase
- Contact form with backend integration
- Smooth scrolling and animations
- Mobile-friendly navigation

### Admin Panel
- Secure authentication with JWT
- Dashboard with statistics
- Message management (view, read, delete)
- Project management (create, edit, delete)
- Real-time updates

## 🛠️ Tech Stack

**Frontend:**
- HTML5
- CSS3
- Vanilla JavaScript

**Backend:**
- Node.js
- Express.js
- MongoDB
- JWT Authentication
- bcrypt for password hashing

## 📁 Project Structure

```
portfolio-system/
├── public/
│   ├── index.html           # Main portfolio page
│   ├── admin.html           # Admin panel
│   ├── styles.css           # Portfolio styles
│   ├── script.js            # Portfolio JavaScript
│   ├── admin-styles.css     # Admin panel styles
│   └── admin-script.js      # Admin panel JavaScript
├── server.js                # Express server
├── package.json
├── .env                     # Environment variables
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone or download the project files**

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the root directory:
```env
MONGODB_URI=mongodb://localhost:27017/portfolio
JWT_SECRET=your-super-secret-jwt-key-change-this
PORT=5000
```

For MongoDB Atlas, use:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/portfolio
```

4. **Start MongoDB** (if using local MongoDB)
```bash
mongod
```

5. **Create admin account**

Run this once to create your admin account:
```bash
curl -X POST http://localhost:5000/api/admin/setup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@example.com",
    "password": "yourpassword"
  }'
```

Or use Postman/Thunder Client to send a POST request to `/api/admin/setup` with the JSON body above.

6. **Start the server**
```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## 📖 Usage

### Portfolio Website
- Visit `http://localhost:5000/index.html`
- Browse projects, skills, and about sections
- Use the contact form to send messages

### Admin Panel
- Visit `http://localhost:5000/admin.html`
- Login with your admin credentials
- Manage messages and projects from the dashboard

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Protected API endpoints
- CORS configuration
- Input validation

## 🌐 Deployment

### Deploying to Render

1. **Prepare for deployment**
- Make sure your code is in a Git repository
- Update `MONGODB_URI` in environment variables to use MongoDB Atlas

2. **Create a new Web Service on Render**
- Connect your GitHub repository
- Set environment variables:
  - `MONGODB_URI`: Your MongoDB Atlas connection string
  - `JWT_SECRET`: A secure random string
  - `PORT`: 5000 (or leave default)

3. **Deploy**
- Render will automatically install dependencies and start your server

### Deploying Frontend to Vercel

1. **Upload frontend files to a separate repository**
- Include: `index.html`, `styles.css`, `script.js`

2. **Update API URL in `script.js`**
```javascript
const API_URL = 'https://your-render-app.onrender.com/api';
```

3. **Deploy to Vercel**
- Import your repository
- Deploy!

## 📝 API Endpoints

### Public Endpoints
- `GET /api/projects` - Get all projects
- `POST /api/messages` - Submit contact message

### Admin Endpoints (require authentication)
- `POST /api/admin/login` - Admin login
- `POST /api/admin/setup` - Create admin (first time only)
- `GET /api/admin/messages` - Get all messages
- `PATCH /api/admin/messages/:id/read` - Mark message as read
- `DELETE /api/admin/messages/:id` - Delete message
- `GET /api/admin/stats` - Get dashboard statistics
- `POST /api/admin/projects` - Create project
- `PUT /api/admin/projects/:id` - Update project
- `DELETE /api/admin/projects/:id` - Delete project

## 🎨 Customization

### Colors
Edit CSS variables in `styles.css` and `admin-styles.css`:
```css
:root {
    --primary: #6366f1;
    --secondary: #10b981;
    --dark: #0f172a;
    /* ... more colors */
}
```

### Content
Update the HTML files to change text, add sections, or modify layout.

## 🤝 Contributing

Feel free to fork this project and customize it for your needs!

## 📧 Contact

For questions or suggestions, use the contact form on the portfolio site.

## 📄 License

MIT License - feel free to use this project for your portfolio!

---

Built with ❤️ from Kenya 🇰🇪