# 🎬 Video Review App

A modern, full-featured video review application built with React, Vite, and Supabase. Perfect for video creators, agencies, and teams who need to collect feedback and approvals on video content.

## ✨ Features

- 🎥 **Video Project Management** - Organize videos into projects
- 💬 **Real-time Feedback** - Clients can leave timestamped comments
- ✅ **Approval Workflow** - Track video approvals and revisions
- 🔗 **Shareable Review Links** - Send secure links to clients (no signup required)
- 📱 **Responsive Design** - Works perfectly on desktop and mobile
- 🔔 **Real-time Notifications** - Get notified when feedback is received
- 🎨 **Modern UI** - Beautiful interface built with Tailwind CSS and shadcn/ui
- 🔒 **Secure Authentication** - Powered by Supabase Auth
- ⚡ **Real-time Updates** - See changes instantly across all devices

## 🚀 Quick Start

### Local Development

1. **Clone and install:**
   ```bash
   git clone <your-repo>
   cd video-review-app
   npm install
   ```

2. **Set up environment:**
   ```bash
   cp env.example .env
   # Edit .env with your Supabase credentials
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   ```
   http://localhost:5173
   ```

### Production Deployment

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for complete deployment instructions.

## 🗄️ Database Setup

1. **Create Supabase project** at [supabase.com](https://supabase.com)

2. **Run database schema:**
   - Copy contents of `supabase-schema.sql`
   - Paste into Supabase SQL Editor
   - Click "Run"

3. **Enable real-time features:**
   - Run `setup-realtime.sql` in SQL Editor

4. **Update environment variables:**
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

## 📁 Project Structure

```
├── src/
│   ├── api/                 # API layer and entities
│   │   ├── entities.js      # Database entities (Supabase)
│   │   ├── supabaseClient.js # Supabase client
│   │   ├── functions.js     # Helper functions
│   │   └── integrations.js  # External integrations
│   ├── components/          # React components
│   │   ├── auth/           # Authentication components
│   │   ├── dashboard/      # Dashboard components
│   │   ├── project/        # Project management
│   │   ├── review/         # Video review interface
│   │   ├── ui/            # UI components (shadcn/ui)
│   │   └── ...
│   ├── hooks/              # Custom React hooks
│   ├── pages/              # Page components
│   ├── lib/               # Utilities and configuration
│   └── utils/             # Helper utilities
├── supabase-schema.sql     # Database schema
├── setup-realtime.sql     # Real-time configuration
├── migrate-to-supabase.js  # Migration script (if needed)
├── DEPLOYMENT_GUIDE.md    # Deployment instructions
└── docker-compose.yml     # Docker deployment
```

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run build:prod` - Build with linting
- `npm run serve` - Serve production build

## 🐳 Docker Deployment

### Quick Deploy with Docker

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f
```

### Manual Docker Build

```bash
# Build image
docker build -t video-review-app .

# Run container
docker run -d -p 80:80 video-review-app
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Supabase project URL | ✅ |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | ✅ |
| `VITE_APP_NAME` | Application name | ❌ |
| `VITE_APP_URL` | Application URL | ❌ |
| `VITE_GOOGLE_ANALYTICS_ID` | Google Analytics ID | ❌ |

### Supabase Configuration

The app uses Supabase for:
- **Authentication** - User signup/login
- **Database** - All application data
- **Real-time** - Live updates
- **Storage** - File uploads (future feature)

## 📱 How It Works

1. **Create Project** - Users create video review projects
2. **Upload Videos** - Import videos from Google Drive or upload directly
3. **Share Review Link** - Generate secure, time-limited review links
4. **Collect Feedback** - Clients leave timestamped comments without signing up
5. **Track Approvals** - See which videos are approved and which need changes
6. **Real-time Updates** - All changes sync instantly across devices

## 🎯 Use Cases

- **Video Agencies** - Client review and approval workflow
- **Content Creators** - Get feedback from collaborators
- **Marketing Teams** - Review video campaigns before publishing
- **Freelancers** - Professional client presentation
- **Educational** - Student project reviews

## 🔒 Security Features

- **Row Level Security** - Database access controlled by user
- **Secure Review Links** - Time-limited, token-based access
- **Authentication** - Secure user management via Supabase
- **HTTPS Only** - All traffic encrypted
- **Input Validation** - All user inputs validated

## 🚀 Performance

- **Fast Loading** - Optimized build with code splitting
- **Real-time Updates** - Instant feedback without page refresh
- **Mobile Optimized** - Responsive design for all devices
- **CDN Ready** - Static assets can be served from CDN
- **Database Optimization** - Efficient queries with proper indexing

## 🔄 Migration from Base44

If you're migrating from Base44:

1. Set up Supabase database using the schema files
2. Configure environment variables
3. Run the migration script: `node migrate-to-supabase.js`
4. Test all functionality

See [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) for detailed instructions.

## 🛠️ Development

### Adding New Features

1. Create components in appropriate directories
2. Add database tables via Supabase migrations
3. Update entity classes in `src/api/entities.js`
4. Add proper TypeScript types (future enhancement)

### Database Changes

1. Make changes in Supabase dashboard
2. Export schema updates
3. Update `supabase-schema.sql`
4. Test with fresh database

## 📊 Monitoring

- **Health Check** - Available at `/health`
- **Error Tracking** - Configure Sentry (optional)
- **Analytics** - Google Analytics support
- **Performance** - Monitor via browser dev tools

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- **Documentation** - Check the guides in this repository
- **Issues** - Report bugs via GitHub issues
- **Deployment Help** - See DEPLOYMENT_GUIDE.md

## 🎉 Success Stories

Perfect for:
- Video production companies managing client reviews
- Marketing agencies collecting campaign feedback  
- Content creators collaborating with teams
- Educational institutions for project reviews
- Any business that needs video feedback workflows

---

**Ready to deploy?** Follow the [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) to get your app running on your own domain with Supabase!