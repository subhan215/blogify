# Blogify - Modern Blogging Platform

## 🚀 Overview

**Blogify** is a full-featured, modern blogging platform built with Node.js, Express, MongoDB, and Socket.IO. It provides a comprehensive solution for creating, managing, and sharing blog content with advanced features like real-time messaging, multi-language support, voice reading, and social interactions.

## ✨ Key Features

### 📝 **Blog Management**
- **Create & Edit Blogs**: Rich text editor with 10,000 character limit
- **Image Upload**: Cloudinary integration for image hosting
- **Categories & Tags**: Organize content with categories and tags
- **Draft System**: Save drafts and publish later
- **Search & Filter**: Find blogs by title, content, or author

### 🌍 **Multi-Language Support**
- **Real-time Translation**: Translate blogs to 100+ languages instantly
- **Language Detection**: Automatic content language detection
- **Voice Reading**: Text-to-speech with language-specific voices
- **Smart Voice Selection**: Automatically selects appropriate voice for content language
- **Fallback Handling**: Graceful error handling when voices aren't available

### 💬 **Real-time Communication**
- **Live Chat System**: Real-time private messaging between users
- **Online Status**: See who's online in real-time
- **Message Notifications**: Instant notifications for new messages
- **Chat History**: Persistent chat conversations
- **Unread Message Counts**: Track unread messages per conversation

### 👥 **User Management**
- **User Authentication**: JWT-based secure authentication
- **User Profiles**: Customizable user profiles with avatars
- **Follow System**: Follow other bloggers
- **Activity Feed**: Track user activities and interactions
- **Profile Customization**: Update personal information and preferences

### 💭 **Comments & Interactions**
- **Comment System**: Add comments to blog posts
- **Nested Comments**: Reply to comments (threaded discussions)
- **Comment Moderation**: Manage and moderate comments
- **Like System**: Like and interact with content

### 🎨 **Modern UI/UX**
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Dark/Light Theme**: Toggle between themes
- **Custom Alerts**: Beautiful custom alert system (no browser popups)
- **Loading States**: Smooth loading animations
- **Accessibility**: Keyboard navigation and screen reader support

### 🔧 **Technical Features**
- **Real-time Updates**: Socket.IO for live updates
- **File Upload**: Secure file upload with validation
- **API Security**: JWT authentication and authorization
- **Database**: MongoDB with Mongoose ODM
- **Cloud Storage**: Cloudinary for media storage
- **Health Monitoring**: Automated health checks every 5 minutes via Trigger.dev
- **Keep-Alive System**: Integrated keep-alive functionality to prevent service sleep

## 🏗️ Architecture

### **Backend Stack**
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Real-time**: Socket.IO
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer + Cloudinary
- **Translation**: Google Translate API

### **Frontend Stack**
- **Template Engine**: EJS (Embedded JavaScript)
- **Styling**: CSS3 with custom properties
- **Icons**: Font Awesome
- **JavaScript**: Vanilla JS with modern ES6+ features

### **Project Structure**
```
blogify/
├── config/               # Configuration files
├── connection/           # Database connection
├── controllers/          # Business logic
├── jobs/                 # Trigger.dev job definitions
│   └── health-check.js   # Health check cron job
├── middlewares/          # Express middlewares
├── models/              # MongoDB schemas
├── public/              # Static assets (CSS, JS, images)
├── routes/              # API routes
├── services/            # External service integrations
├── views/               # EJS templates
├── app.js               # Main application file
├── keep-alive.js        # Fallback health monitoring script
├── trigger-server.js    # Trigger.dev server
├── trigger.config.js    # Trigger.dev configuration
├── languages.js         # Language configuration
├── TRIGGER_SETUP.md     # Trigger.dev setup guide
└── render.yaml          # Render deployment config
```

## 🔄 Health Monitoring System

### **Overview**
The application uses Trigger.dev for reliable health monitoring that runs every 5 minutes, providing better reliability than GitHub Actions and more detailed monitoring capabilities.

### **Features**
- **Scheduled Health Checks**: Runs every 5 minutes via Trigger.dev cron jobs
- **Detailed Logging**: Comprehensive logs with metrics and uptime tracking
- **Error Handling**: Graceful error handling with detailed error reporting
- **Monitoring Dashboard**: View health check history and metrics in Trigger.dev dashboard
- **Alerting**: Built-in alerting for failed health checks
- **Fallback System**: Integrated keep-alive system as backup

### **Trigger.dev Setup**
1. **Create Account**: Sign up at [Trigger.dev](https://trigger.dev)
2. **Configure**: Follow the setup guide in `TRIGGER_SETUP.md`
3. **Deploy**: Run `npm run trigger:deploy` to deploy health check jobs
4. **Monitor**: View results in your Trigger.dev dashboard

### **Configuration**
```bash
# Environment Variables
TRIGGER_API_KEY=your_trigger_dev_api_key
APP_URL=https://your-app-url.onrender.com
NODE_ENV=production
```

### **Health Endpoint**
The application provides a health check endpoint at `/health` that returns:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "environment": "production"
}
```

### **Fallback Keep-Alive**
For additional reliability, the app also includes an integrated keep-alive system:
```bash
npm run keep-alive  # Manual keep-alive script
```

## 🚀 Getting Started

### **Prerequisites**
- Node.js (v14 or higher)
- MongoDB database
- Cloudinary account
- GitHub account (for deployment)

### **Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/blogify.git
   cd blogify
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   NODE_ENV=development
   PORT=3000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   Open your browser and navigate to `http://localhost:3000`

## 🌐 Deployment

### **Render Deployment (Recommended)**

The project is configured for easy deployment on Render. See [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md) for detailed instructions.

**Quick Setup:**
1. Connect your GitHub repository to Render
2. Configure environment variables
3. Deploy automatically

### **Health Monitoring**

The application includes automated health monitoring:
- **GitHub Actions**: Runs every 5 minutes
- **Health Endpoint**: `/health` for monitoring
- **Keep-Alive Script**: Prevents service sleep

## 🔧 Configuration

### **Environment Variables**

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | Environment (development/production) | Yes |
| `PORT` | Server port | Yes |
| `MONGODB_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | Yes |
| `CLOUDINARY_API_KEY` | Cloudinary API key | Yes |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | Yes |

### **Features Configuration**

#### **Voice Reading**
- Automatically detects content language
- Selects appropriate voice for the language
- Gracefully handles unavailable voices
- Custom error messages for unsupported languages

#### **Translation**
- Supports 100+ languages
- Real-time translation without page reload
- Preserves original content
- URL-based language switching

#### **Real-time Features**
- WebSocket connections for live updates
- User online/offline status
- Real-time messaging
- Live notifications

## 📱 API Endpoints

### **Authentication**
- `POST /user/signup` - User registration
- `POST /user/signin` - User login
- `POST /user/signout` - User logout

### **Blogs**
- `GET /` - Home page with blogs
- `GET /blog/:id` - View specific blog
- `POST /blog` - Create new blog
- `PUT /blog/:id` - Update blog
- `DELETE /blog/:id` - Delete blog

### **User Management**
- `GET /profile` - User profile
- `PUT /profile` - Update profile
- `GET /user/:id` - View user profile

### **Comments**
- `POST /blog/comment/:blogId` - Add comment
- `GET /blog/:id/comments` - Get blog comments

### **Chat**
- `GET /chat` - Chat interface
- `POST /chat/message` - Send message
- `GET /chat/history` - Get chat history

### **Health**
- `GET /health` - Health check endpoint

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md) for deployment issues
2. Review the troubleshooting section in the deployment guide
3. Open an issue on GitHub with detailed information

## 🔮 Future Enhancements

- [ ] Email notifications
- [ ] Social media sharing
- [ ] Advanced analytics
- [ ] Multi-media blog posts
- [ ] Advanced search with filters
- [ ] Blog templates
- [ ] RSS feeds
- [ ] SEO optimization
- [ ] Mobile app
- [ ] API rate limiting
- [ ] Content moderation tools

---

**Built with ❤️ using Node.js, Express, MongoDB, and Socket.IO** 