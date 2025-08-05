# 🍽️ PrePlate - Restaurant Booking Platform

A modern, full-stack restaurant booking platform built with Next.js 15, TypeScript, and PostgreSQL.

## 🚀 Features

- **User & Restaurant Authentication** - Secure login/register for both users and restaurants
- **Restaurant Discovery** - Browse restaurants with filters and search
- **Menu Management** - Restaurants can manage their menus with categories and items
- **Order System** - Users can place orders with booking times
- **Order Status Updates** - Restaurants can update order status in real-time
- **Review System** - Users can leave reviews and ratings
- **Favorites** - Users can save favorite restaurants
- **Responsive Design** - Works perfectly on all devices
- **Modern UI** - Beautiful interface with Shadcn UI components

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React, TypeScript
- **Styling**: Tailwind CSS, Shadcn UI
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with HTTP-only cookies
- **Deployment**: Vercel-ready

## 📋 User Credentials

### 👥 User Accounts
| Email | Password | Type |
|-------|----------|------|
| `john@example.com` | `user@password` | User |
| `jane@example.com` | `user@password` | User |

### 🏪 Restaurant Accounts
| Email | Password | Restaurant Name | Cuisine |
|-------|----------|-----------------|---------|
| `bella@italia.com` | `restaurant@password` | Bella Italia | Italian |
| `dragon@palace.com` | `restaurant@password` | Dragon Palace | Chinese |
| `spice@garden.com` | `restaurant@password` | Spice Garden | Indian |
| `burger@hub.com` | `restaurant@password` | Burger Hub | American |
| `sushi@master.com` | `restaurant@password` | Sushi Master | Japanese |
| `taco@fiesta.com` | `restaurant@password` | Taco Fiesta | Mexican |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/PremPrakashCodes/preplate.git
   cd preplate
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your database URL:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/preplate"
   JWT_SECRET="your-super-secret-jwt-key-for-preplate-app-2025"
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 How to Use

### For Users:
1. **Register/Login** using the user credentials above
2. **Browse Restaurants** on the home page
3. **View Restaurant Details** and menus
4. **Add Items** to your order
5. **Set Booking Time** and number of guests
6. **Place Order** and track status
7. **Leave Reviews** for restaurants you've visited

### For Restaurants:
1. **Register/Login** using restaurant credentials above
2. **View Orders** in the orders page
3. **Update Order Status** (Pending → Confirmed → Preparing → Ready → Completed)
4. **Manage Menu** items and categories
5. **View Reviews** and ratings from customers

## 📁 Project Structure

```
preplate/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── orders/        # Order management
│   │   └── restaurants/   # Restaurant data
│   ├── auth/              # Login/Register pages
│   ├── book/              # Restaurant booking
│   ├── orders/            # Order history
│   └── profile/           # User profiles
├── components/            # Reusable UI components
│   └── ui/               # Shadcn UI components
├── lib/                   # Utility functions
│   ├── auth.ts           # Authentication utilities
│   ├── prisma.ts         # Database client
│   └── validations/      # Form validations
├── prisma/               # Database schema & migrations
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Sample data
└── middleware.ts         # Authentication middleware
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User/Restaurant login
- `POST /api/auth/register` - User/Restaurant registration
- `POST /api/auth/logout` - Logout

### Restaurants
- `GET /api/restaurants` - List restaurants with filters
- `GET /api/restaurants/[id]` - Get restaurant details
- `GET /api/restaurants/reviews` - Get restaurant reviews

### Orders
- `GET /api/orders` - Get user/restaurant orders
- `POST /api/orders` - Create new order
- `PATCH /api/orders/[id]` - Update order status

## 🎨 UI Components

The application uses Shadcn UI components for a consistent, modern design:
- **Cards** - Restaurant listings and order summaries
- **Forms** - Login, registration, and booking forms
- **Dialogs** - Order confirmations and modals
- **Date/Time Pickers** - Booking time selection
- **Buttons** - Action buttons with loading states

## 🗄️ Database Schema

### Core Models:
- **User** - Customer accounts
- **Restaurant** - Restaurant accounts and details
- **Category** - Menu categories
- **MenuItem** - Food items with images
- **Order** - Customer orders with status tracking
- **Review** - Customer reviews and ratings
- **BusinessHour** - Restaurant operating hours

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment
1. Build the application: `npm run build`
2. Start production server: `npm start`

## 🔒 Security Features

- **JWT Authentication** with secure token storage
- **HTTP-only Cookies** for server-side authentication
- **Password Hashing** using SHA-256
- **Input Validation** on all forms
- **CORS Protection** for API routes
- **Type Safety** with TypeScript

## 🧪 Testing

The application includes:
- **TypeScript** for compile-time error checking
- **ESLint** for code quality
- **Prisma** for database type safety
- **Form validation** with Zod schemas

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **Shadcn UI** for beautiful components
- **Prisma** for excellent database tooling
- **Next.js** for the amazing framework
- **Tailwind CSS** for utility-first styling

---

**Built with ❤️ by [Prem Prakash](https://github.com/PremPrakashCodes)**

For support or questions, please open an issue on GitHub.
