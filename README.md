# SportCardLib - Sport Card Collection Manager

A full-stack web application for managing sport card collections with user authentication, collection organization, and detailed card tracking.

## 🎯 Features

### User Authentication
- Secure OAuth-based authentication via Manus
- User profile management
- Session persistence

### Collection Management
- Create multiple collections to organize cards by player, team, or category
- Edit collection names and descriptions
- Delete collections (with confirmation)
- View all collections at a glance

### Card Management
- **Multi-step card input flow** following the specification:
  1. Player name
  2. Brand (with dropdown suggestions or manual entry)
  3. Series (with dropdown suggestions or manual entry)
  4. Season (year range like "1998-99" or single year)
  5. Card number (numeric or alphanumeric like "ST-XYZ")
  6. Optional notes
- **Smart defaults**: Brand and series selections are remembered for quick consecutive entries
- **Quick entry**: Press Enter to save and immediately add another card
- View all cards in a collection with sortable table
- Edit card details
- Delete cards with confirmation

### User Experience
- Clean, modern UI with gradient backgrounds
- Responsive design for mobile, tablet, and desktop
- Loading states and skeleton screens
- Toast notifications for user feedback
- Error handling with helpful messages

## 🛠️ Technology Stack

### Frontend
- **React 19** - Modern UI library
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Utility-first styling
- **shadcn/ui** - High-quality component library
- **tRPC** - End-to-end type-safe APIs
- **Wouter** - Lightweight routing

### Backend
- **Node.js** with **Express 4**
- **tRPC 11** - Type-safe API layer
- **Drizzle ORM** - SQL database toolkit
- **MySQL/TiDB** - Cloud database with free tier

### Infrastructure
- **Manus Platform** - Hosting and deployment
- **GitHub** - Version control
- **OAuth** - Authentication service

## 📦 Installation

### Prerequisites
- Node.js 22+ installed
- pnpm package manager
- Access to a MySQL/TiDB database

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/ghud78/SportCardLib.git
   cd SportCardLib
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   
   The project uses Manus platform environment variables (automatically injected in production):
   - `DATABASE_URL` - MySQL connection string
   - `JWT_SECRET` - Session signing secret
   - `VITE_APP_ID` - OAuth application ID
   - `OAUTH_SERVER_URL` - OAuth backend URL
   - `VITE_OAUTH_PORTAL_URL` - OAuth login portal URL

4. **Push database schema**
   ```bash
   pnpm db:push
   ```

5. **Start development server**
   ```bash
   pnpm dev
   ```

6. **Access the application**
   - Open http://localhost:3000 in your browser

## 🗄️ Database Schema

### users
- `id` - Auto-increment primary key
- `openId` - OAuth identifier (unique)
- `name` - User display name
- `email` - User email
- `role` - User role (user/admin)
- `createdAt`, `updatedAt`, `lastSignedIn` - Timestamps

### collections
- `id` - Auto-increment primary key
- `userId` - Foreign key to users
- `name` - Collection name (e.g., "John Stockton")
- `description` - Optional description
- `createdAt`, `updatedAt` - Timestamps

### cards
- `id` - Auto-increment primary key
- `collectionId` - Foreign key to collections
- `playerName` - Player name
- `brand` - Card brand (e.g., "Panini", "Topps")
- `series` - Card series (e.g., "Hoops", "Prizm", "Revolution")
- `season` - Season identifier (e.g., "1998-99", "2014-15")
- `cardNumber` - Card number (e.g., "214", "ST-XYZ")
- `notes` - Optional notes
- `createdAt`, `updatedAt` - Timestamps

## 🚀 Deployment

The application is designed to be deployed on the Manus platform:

1. **Save a checkpoint** in the Manus interface
2. **Click "Publish"** in the Management UI
3. Your app will be live at `https://your-app.manus.space`

### Custom Domain
You can configure a custom domain in the Manus Management UI under Settings → Domains.

## 📱 Usage Guide

### Getting Started
1. Visit the home page and click "Sign In"
2. Complete OAuth authentication
3. Click "View My Collections" to start

### Creating a Collection
1. Navigate to Collections page
2. Click "New Collection"
3. Enter collection name (e.g., "Michael Jordan")
4. Optionally add a description
5. Click "Create Collection"

### Adding Cards
1. Open a collection
2. Click "Add Card"
3. Follow the multi-step form:
   - Enter player name
   - Select or type brand
   - Select or type series
   - Enter season (e.g., "1998-99")
   - Enter card number
   - Optionally add notes
4. Press Enter or click "Add Card"
5. The form remembers brand and series for quick consecutive entries
6. Click "Done" when finished

### Managing Cards
- **View**: All cards are displayed in a table within the collection
- **Edit**: Click the edit icon to modify card details
- **Delete**: Click the trash icon to remove a card (with confirmation)

## 🔒 Security

- OAuth-based authentication ensures secure user access
- All API endpoints verify user authentication
- Users can only access their own collections and cards
- Database queries use parameterized statements to prevent SQL injection
- Session cookies are HTTP-only and signed

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Built with [Manus Platform](https://manus.im)
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Icons from [Lucide](https://lucide.dev)

## 📞 Support

For questions or issues, please open an issue on GitHub or contact the development team.

---

**Repository**: https://github.com/ghud78/SportCardLib

**Live Demo**: Available after deployment on Manus platform
