# Preplate - Food Ordering Platform

A modern food ordering platform built with Next.js, featuring separate authentication for users and restaurants.

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI Components**: Shadcn/UI with Tailwind CSS
- **Forms & Validation**: React Hook Form with Zod validation
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with bcryptjs
- **Icons**: Lucide React

## Features

### Authentication System

- **Dual Authentication**: Separate login/register for Users and Restaurants
- **JWT-based Authentication**: Secure token-based auth system
- **Password Hashing**: bcrypt for secure password storage
- **Form Validation**: Comprehensive client-side validation with Zod schemas
- **React Hook Form**: Performant forms with real-time validation
- **Type Safety**: Full TypeScript integration with form schemas

### User Features

- User registration and login with form validation
- Profile management with required phone and optional address
- Dashboard with order history and favorites
- Restaurant browsing with cuisine filtering
- **Complete Pre-booking System** for scheduling food orders with table reservations
- Menu browsing and item selection with real-time pricing
- Order customization with quantity controls and special requests
- Booking details management (date, time, guests, dietary restrictions)
- Order summary with total calculation and confirmation
- Real-time form validation with error messages

### Restaurant Features

- Restaurant registration and login with business-specific fields
- Business profile with required phone, optional cuisine type, description, location
- Restaurant dashboard with order management
- Rating system
- Enhanced form validation for business information
- Restaurant listing visibility to customers
- Menu display for customer browsing

### Booking System Features

- **Restaurant Selection**: Browse and select from available restaurants
- **Menu Integration**: View restaurant menu with prices and descriptions
- **Order Customization**: Add/remove items, adjust quantities in real-time
- **Booking Details**: Schedule specific date, time, number of guests
- **Special Requests**: Add dietary restrictions or preferences
- **Order Summary**: Live total calculation and order review
- **Confirmation Process**: Complete booking confirmation with all details
- **Navigation Flow**: Seamless flow from restaurant browsing to booking completion

### Home Page Features

- **Guest View**: Modern restaurant discovery interface
- **Authenticated View**: Direct restaurant browsing with personalized welcome message
- **Restaurant Listings**: Comprehensive restaurant cards with ratings, cuisine, location, and contact info
- **Cuisine Filtering**: Filter restaurants by cuisine type (Italian, Chinese, Indian, American, Japanese, Mexican)
- **Pre-Booking System**: Schedule food orders for pickup or delivery
- **Featured Restaurants**: Highlighted top-rated establishments
- **Real-time Status**: Open/closed restaurant indicators
- **Responsive Design**: Mobile-friendly restaurant browsing experience

### Profile Management

- **Dedicated Profile Page**: Separate page for user and restaurant account management
- **User Profile**: Personal information, order statistics, favorites, account settings
- **Restaurant Profile**: Business information, statistics, rating, restaurant management tools
- **Navigation**: Easy access from home page header, back navigation to home
- **Account Actions**: Profile editing, order history, payment methods, business settings

### Validation Features

- **Email Validation**: Proper email format checking with real-time feedback
- **Password Requirements**: Minimum 6 characters, maximum 100 with instant validation
- **Phone Validation**: Required international phone number format support
- **Field Length Limits**: Appropriate limits for all text fields with character counting
- **Optional Fields**: Proper handling of optional profile information (address, description, cuisine)
- **Type Safety**: Full TypeScript integration with validation schemas
- **Error Messages**: User-friendly, specific error messages for each validation rule
- **Form State Management**: Efficient form state with React Hook Form
- **Loading States**: Proper loading indicators during form submission

## Getting Started

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd preplate
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   - Copy `.env.example` to `.env`
   - Update the database URLs and JWT secret

   ```
   DATABASE_URL="your-postgresql-url"
   DIRECT_URL="your-postgresql-direct-url"
   JWT_SECRET="your-secret-key"
   ```

4. **Set up the database**

   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Start the development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

## Authentication Usage

### Accessing the Application

- **Home Page (`/`)**: No authentication required - shows restaurant listings for guests and dashboard for authenticated users
- **Protected Routes**: `/dashboard`, `/profile`, `/orders` - require authentication
- **Auth Page (`/auth`)**: Redirects to home if already authenticated

### Guest Experience

1. Visit the home page to browse available restaurants
2. Filter restaurants by cuisine type using the filter buttons
3. View restaurant details including ratings, cuisine, address, phone, and estimated delivery time
4. Click "Pre-Book Now" to be redirected to the authentication page
5. See featured restaurants and open/closed status indicators

### User Registration/Login

1. Visit `/auth` or click "Sign In" from the home page
2. Select "User" tab
3. For registration: Fill in name, email, password, phone (required), and optional address
4. For login: Use email and password
5. Upon success, you'll be redirected to the user dashboard with personalized content

### Restaurant Registration/Login

1. Visit `/auth` or click "Sign In" from the home page
2. Select "Restaurant" tab
3. For registration: Fill in restaurant details including:
   - Restaurant name
   - Email and password
   - Phone number (required)
   - Optional: address, cuisine type, description
4. For login: Use email and password
5. Upon success, you'll be redirected to the restaurant dashboard with management tools

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register user or restaurant
- `POST /api/auth/login` - Login user or restaurant

### Request/Response Format

#### Registration Request

```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "type": "user", // or "restaurant"
  "phone": "+1234567890", // required
  "address": "123 Main St", // optional
  // For restaurants only:
  "description": "Best pizza in town", // optional
  "cuisine": "Italian" // optional
}
```

#### Login Request

```json
{
  "email": "user@example.com",
  "password": "password123",
  "type": "user" // or "restaurant"
}
```

#### Success Response

```json
{
  "message": "Login successful",
  "token": "jwt-token-here",
  "account": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "John Doe"
    // ... other fields
  },
  "type": "user"
}
```

## Database Schema

### Users Table

- `id`: Unique identifier
- `email`: Email address (unique)
- `password`: Hashed password
- `name`: User's full name
- `role`: USER (default)
- `phone`: Phone number (required)
- `address`: Address (optional)
- `createdAt`, `updatedAt`: Timestamps

### Restaurants Table

- `id`: Unique identifier
- `email`: Email address (unique)
- `password`: Hashed password
- `name`: Restaurant name
- `description`: Restaurant description (optional)
- `phone`: Phone number (required)
- `address`: Restaurant address (optional)
- `cuisine`: Cuisine type (optional)
- `rating`: Average rating (default: 0)
- `createdAt`, `updatedAt`: Timestamps

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Database commands
npm run db:generate    # Generate Prisma client
npm run db:push       # Push schema to database
npm run db:migrate    # Run migrations
npm run db:studio     # Open Prisma Studio
```

## Project Structure

```
app/
├── api/auth/          # Authentication API routes
│   ├── login/         # Login endpoint
│   └── register/      # Registration endpoint
├── auth/              # Auth page
├── book/              # Restaurant booking system
│   └── [restaurantId]/ # Dynamic booking page for specific restaurant
│       └── page.tsx   # Pre-booking interface with menu and scheduling
├── orders/            # Order management
│   └── page.tsx       # Order history and tracking
├── profile/           # User and restaurant profile management
│   └── page.tsx       # Profile page with account settings
├── globals.css        # Global styles
├── layout.tsx         # Root layout with AuthProvider
└── page.tsx           # Home page with restaurant browsing

components/ui/         # Shadcn UI components
├── button.tsx
├── card.tsx
├── input.tsx
├── label.tsx
└── tabs.tsx

lib/
├── auth.ts           # Authentication utilities
├── auth-context.tsx  # Auth context provider
├── prisma.ts         # Prisma client
└── utils.ts          # Utility functions

prisma/
└── schema.prisma     # Database schema
```

## Security Features

- Password hashing with bcrypt (12 rounds)
- JWT tokens with 7-day expiration
- Email validation
- Password strength requirements (minimum 6 characters)
- Duplicate email prevention across both user types
- Input sanitization and validation

## Route Protection

### Public Routes

- **Home (`/`)**: Accessible to everyone - shows restaurant listings for guests, restaurant browsing for authenticated users
- **Auth (`/auth`)**: Registration and login pages

### Protected Routes

- **Profile (`/profile`)**: User/Restaurant profile management and account settings
- **Dashboard (`/dashboard`)**: User/Restaurant specific dashboards (if implemented)
- **Orders (`/orders`)**: Order history and management

### Middleware Behavior

- **Unauthenticated users**: Can access home and auth pages, redirected to `/auth` for protected routes
- **Authenticated users**: Can access all routes, redirected to home if trying to access `/auth`
- **Token validation**: JWT tokens are validated on every protected route access

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License
