import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../lib/auth';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.review.deleteMany();
  await prisma.favoriteRestaurant.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.category.deleteMany();
  await prisma.businessHour.deleteMany();
  await prisma.restaurant.deleteMany();
  await prisma.user.deleteMany();

  console.log('🗑️ Cleared existing data');

  // Create sample users
  const userPassword = await hashPassword('user@password');
  
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'john@example.com',
        password: userPassword,
        name: 'John Doe',
        phone: '+1234567890',
        address: '123 Main St, Downtown',
      },
    }),
    prisma.user.create({
      data: {
        email: 'jane@example.com',
        password: userPassword,
        name: 'Jane Smith',
        phone: '+1234567891',
        address: '456 Oak Ave, Midtown',
      },
    }),
  ]);

  console.log('👥 Created sample users');

  // Create sample restaurants
  const restaurantPassword = await hashPassword('restaurant@password');

  const restaurants = await Promise.all([
    prisma.restaurant.create({
      data: {
        email: 'bella@italia.com',
        password: restaurantPassword,
        name: 'Bella Italia',
        description: 'Authentic Italian cuisine with fresh ingredients and traditional recipes passed down through generations.',
        phone: '+1234567890',
        address: '123 Main St, Downtown',
        cuisine: 'Italian',
        rating: 4.5,
        isOpen: true,
        featured: true,
        estimatedTime: '30-45 min',
        image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop',
      },
    }),
    prisma.restaurant.create({
      data: {
        email: 'dragon@palace.com',
        password: restaurantPassword,
        name: 'Dragon Palace',
        description: 'Traditional Chinese dishes with modern twist, featuring authentic flavors and fresh ingredients.',
        phone: '+1234567891',
        address: '456 Oak Ave, Chinatown',
        cuisine: 'Chinese',
        rating: 4.2,
        isOpen: true,
        featured: false,
        estimatedTime: '25-40 min',
        image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400&h=300&fit=crop',
      },
    }),
    prisma.restaurant.create({
      data: {
        email: 'spice@garden.com',
        password: restaurantPassword,
        name: 'Spice Garden',
        description: 'Aromatic spices and authentic Indian flavors in a warm, welcoming atmosphere.',
        phone: '+1234567892',
        address: '789 Curry Lane, Midtown',
        cuisine: 'Indian',
        rating: 4.7,
        isOpen: false,
        featured: true,
        estimatedTime: '35-50 min',
        image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop',
      },
    }),
    prisma.restaurant.create({
      data: {
        email: 'burger@hub.com',
        password: restaurantPassword,
        name: 'Burger Hub',
        description: 'Gourmet burgers and classic American food with premium ingredients and creative toppings.',
        phone: '+1234567893',
        address: '321 Burger St, Food District',
        cuisine: 'American',
        rating: 4.0,
        isOpen: true,
        featured: false,
        estimatedTime: '15-25 min',
        image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=300&fit=crop',
      },
    }),
    prisma.restaurant.create({
      data: {
        email: 'sushi@master.com',
        password: restaurantPassword,
        name: 'Sushi Master',
        description: 'Fresh sushi and traditional Japanese cuisine prepared by expert chefs with years of experience.',
        phone: '+1234567894',
        address: '654 Sushi Blvd, Downtown',
        cuisine: 'Japanese',
        rating: 4.8,
        isOpen: true,
        featured: true,
        estimatedTime: '40-60 min',
        image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop',
      },
    }),
    prisma.restaurant.create({
      data: {
        email: 'taco@fiesta.com',
        password: restaurantPassword,
        name: 'Taco Fiesta',
        description: 'Vibrant Mexican flavors and fresh ingredients in a festive, colorful atmosphere.',
        phone: '+1234567895',
        address: '987 Taco Street, Market District',
        cuisine: 'Mexican',
        rating: 4.3,
        isOpen: true,
        featured: false,
        estimatedTime: '20-30 min',
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
      },
    }),
  ]);

  console.log('🍽️ Created sample restaurants');

  // Create business hours for each restaurant
  const businessHours = [];
  for (const restaurant of restaurants) {
    // Monday to Friday: 9 AM - 10 PM
    for (let day = 1; day <= 5; day++) {
      businessHours.push({
        restaurantId: restaurant.id,
        dayOfWeek: day,
        openTime: '09:00',
        closeTime: '22:00',
        isOpen: true,
      });
    }
    // Saturday: 10 AM - 11 PM
    businessHours.push({
      restaurantId: restaurant.id,
      dayOfWeek: 6,
      openTime: '10:00',
      closeTime: '23:00',
      isOpen: true,
    });
    // Sunday: 11 AM - 9 PM
    businessHours.push({
      restaurantId: restaurant.id,
      dayOfWeek: 0,
      openTime: '11:00',
      closeTime: '21:00',
      isOpen: true,
    });
  }

  await prisma.businessHour.createMany({
    data: businessHours,
  });

  console.log('🕐 Created business hours');

  // Create categories for Bella Italia
  const bellaItalia = restaurants[0];
  const bellaCategories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Pizza',
        description: 'Authentic Italian pizzas with fresh ingredients',
        restaurantId: bellaItalia.id,
        sortOrder: 1,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Pasta',
        description: 'Traditional Italian pasta dishes',
        restaurantId: bellaItalia.id,
        sortOrder: 2,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Salads',
        description: 'Fresh and healthy Italian salads',
        restaurantId: bellaItalia.id,
        sortOrder: 3,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Desserts',
        description: 'Sweet Italian treats and desserts',
        restaurantId: bellaItalia.id,
        sortOrder: 4,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Appetizers',
        description: 'Perfect starters for your Italian meal',
        restaurantId: bellaItalia.id,
        sortOrder: 5,
      },
    }),
  ]);

  // Create menu items for Bella Italia
  await Promise.all([
    prisma.menuItem.create({
      data: {
        name: 'Margherita Pizza',
        description: 'Fresh tomatoes, mozzarella, basil, and our signature tomato sauce',
        price: 18.99,
        originalPrice: 21.99,
        discount: 14,
        categoryId: bellaCategories[0].id,
        isFeatured: true,
        image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400&h=300&fit=crop',
        allergens: ['Gluten', 'Dairy'],
        nutrition: {
          calories: 285,
          protein: 12,
          carbs: 35,
          fat: 8,
        },
      },
    }),
    prisma.menuItem.create({
      data: {
        name: 'Spaghetti Carbonara',
        description: 'Creamy pasta with pancetta, parmesan, and black pepper',
        price: 22.99,
        originalPrice: 25.99,
        discount: 12,
        categoryId: bellaCategories[1].id,
        isFeatured: true,
        image: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400&h=300&fit=crop',
        allergens: ['Gluten', 'Dairy', 'Eggs'],
        nutrition: {
          calories: 420,
          protein: 18,
          carbs: 45,
          fat: 15,
        },
      },
    }),
    prisma.menuItem.create({
      data: {
        name: 'Caesar Salad',
        description: 'Romaine lettuce, croutons, parmesan cheese, and caesar dressing',
        price: 14.99,
        originalPrice: 16.99,
        discount: 12,
        categoryId: bellaCategories[2].id,
        image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=300&fit=crop',
        allergens: ['Gluten', 'Dairy', 'Eggs'],
        nutrition: {
          calories: 180,
          protein: 8,
          carbs: 12,
          fat: 10,
        },
      },
    }),
    prisma.menuItem.create({
      data: {
        name: 'Tiramisu',
        description: 'Classic Italian dessert with coffee-soaked ladyfingers and mascarpone cream',
        price: 8.99,
        originalPrice: 10.99,
        discount: 18,
        categoryId: bellaCategories[3].id,
        image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=300&fit=crop',
        allergens: ['Gluten', 'Dairy', 'Eggs'],
        nutrition: {
          calories: 320,
          protein: 6,
          carbs: 28,
          fat: 18,
        },
      },
    }),
    prisma.menuItem.create({
      data: {
        name: 'Bruschetta',
        description: 'Toasted bread with tomatoes, garlic, basil, and olive oil',
        price: 12.99,
        originalPrice: 14.99,
        discount: 13,
        categoryId: bellaCategories[4].id,
        image: 'https://images.unsplash.com/photo-1572442388796-11668a64e141?w=400&h=300&fit=crop',
        allergens: ['Gluten'],
        nutrition: {
          calories: 150,
          protein: 4,
          carbs: 18,
          fat: 6,
        },
      },
    }),
  ]);

  // Create categories for Dragon Palace
  const dragonPalace = restaurants[1];
  const dragonCategories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Dim Sum',
        description: 'Traditional Chinese dumplings and small plates',
        restaurantId: dragonPalace.id,
        sortOrder: 1,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Main Dishes',
        description: 'Classic Chinese main courses',
        restaurantId: dragonPalace.id,
        sortOrder: 2,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Noodles',
        description: 'Hand-pulled noodles and rice dishes',
        restaurantId: dragonPalace.id,
        sortOrder: 3,
      },
    }),
  ]);

  // Create menu items for Dragon Palace
  await Promise.all([
    prisma.menuItem.create({
      data: {
        name: 'Pork Dumplings',
        description: 'Steamed pork dumplings with ginger and green onions',
        price: 12.99,
        categoryId: dragonCategories[0].id,
        isFeatured: true,
        image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop',
        allergens: ['Gluten', 'Soy'],
        nutrition: {
          calories: 180,
          protein: 8,
          carbs: 25,
          fat: 4,
        },
      },
    }),
    prisma.menuItem.create({
      data: {
        name: 'Kung Pao Chicken',
        description: 'Spicy chicken with peanuts, vegetables, and chili peppers',
        price: 18.99,
        categoryId: dragonCategories[1].id,
        image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&h=300&fit=crop',
        allergens: ['Soy', 'Peanuts'],
        nutrition: {
          calories: 320,
          protein: 25,
          carbs: 15,
          fat: 12,
        },
      },
    }),
    prisma.menuItem.create({
      data: {
        name: 'Beef Lo Mein',
        description: 'Stir-fried noodles with beef, vegetables, and soy sauce',
        price: 16.99,
        categoryId: dragonCategories[2].id,
        image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop',
        allergens: ['Gluten', 'Soy'],
        nutrition: {
          calories: 380,
          protein: 18,
          carbs: 45,
          fat: 8,
        },
      },
    }),
  ]);

  // Create categories for Spice Garden
  const spiceGarden = restaurants[2];
  const spiceCategories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Curries',
        description: 'Aromatic Indian curries with rich spices',
        restaurantId: spiceGarden.id,
        sortOrder: 1,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Breads',
        description: 'Fresh-baked Indian breads',
        restaurantId: spiceGarden.id,
        sortOrder: 2,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Rice Dishes',
        description: 'Fragrant rice dishes and biryanis',
        restaurantId: spiceGarden.id,
        sortOrder: 3,
      },
    }),
  ]);

  // Create menu items for Spice Garden
  await Promise.all([
    prisma.menuItem.create({
      data: {
        name: 'Butter Chicken',
        description: 'Tender chicken in rich tomato and butter sauce',
        price: 19.99,
        categoryId: spiceCategories[0].id,
        isFeatured: true,
        image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop',
        allergens: ['Dairy'],
        nutrition: {
          calories: 420,
          protein: 22,
          carbs: 18,
          fat: 25,
        },
      },
    }),
    prisma.menuItem.create({
      data: {
        name: 'Garlic Naan',
        description: 'Fresh-baked flatbread with garlic and herbs',
        price: 3.99,
        categoryId: spiceCategories[1].id,
        image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop',
        allergens: ['Gluten'],
        nutrition: {
          calories: 180,
          protein: 6,
          carbs: 32,
          fat: 2,
        },
      },
    }),
    prisma.menuItem.create({
      data: {
        name: 'Biryani Rice',
        description: 'Fragrant basmati rice with aromatic spices',
        price: 14.99,
        categoryId: spiceCategories[2].id,
        image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop',
        nutrition: {
          calories: 280,
          protein: 6,
          carbs: 55,
          fat: 3,
        },
      },
    }),
  ]);

  // Create categories for Burger Hub
  const burgerHub = restaurants[3];
  const burgerCategories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Burgers',
        description: 'Gourmet burgers with premium ingredients',
        restaurantId: burgerHub.id,
        sortOrder: 1,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Sides',
        description: 'Classic American sides and appetizers',
        restaurantId: burgerHub.id,
        sortOrder: 2,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Desserts',
        description: 'Sweet treats and milkshakes',
        restaurantId: burgerHub.id,
        sortOrder: 3,
      },
    }),
  ]);

  // Create menu items for Burger Hub
  await Promise.all([
    prisma.menuItem.create({
      data: {
        name: 'Classic Cheeseburger',
        description: 'Angus beef patty with cheddar, lettuce, tomato, and special sauce',
        price: 15.99,
        categoryId: burgerCategories[0].id,
        isFeatured: true,
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop',
        allergens: ['Gluten', 'Dairy'],
        nutrition: {
          calories: 580,
          protein: 28,
          carbs: 35,
          fat: 32,
        },
      },
    }),
    prisma.menuItem.create({
      data: {
        name: 'Truffle Fries',
        description: 'Crispy fries tossed with truffle oil and parmesan',
        price: 8.99,
        categoryId: burgerCategories[1].id,
        image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&h=300&fit=crop',
        allergens: ['Dairy'],
        nutrition: {
          calories: 320,
          protein: 6,
          carbs: 42,
          fat: 14,
        },
      },
    }),
    prisma.menuItem.create({
      data: {
        name: 'Chocolate Milkshake',
        description: 'Rich chocolate milkshake with whipped cream',
        price: 6.99,
        categoryId: burgerCategories[2].id,
        allergens: ['Dairy'],
        nutrition: {
          calories: 420,
          protein: 8,
          carbs: 58,
          fat: 18,
        },
      },
    }),
  ]);

  // Create categories for Sushi Master
  const sushiMaster = restaurants[4];
  const sushiCategories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Sushi Rolls',
        description: 'Fresh sushi rolls with premium fish',
        restaurantId: sushiMaster.id,
        sortOrder: 1,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Sashimi',
        description: 'Fresh raw fish slices',
        restaurantId: sushiMaster.id,
        sortOrder: 2,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Hot Dishes',
        description: 'Grilled and cooked Japanese dishes',
        restaurantId: sushiMaster.id,
        sortOrder: 3,
      },
    }),
  ]);

  // Create menu items for Sushi Master
  await Promise.all([
    prisma.menuItem.create({
      data: {
        name: 'California Roll',
        description: 'Crab, avocado, and cucumber with tobiko',
        price: 12.99,
        categoryId: sushiCategories[0].id,
        isFeatured: true,
        image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop',
        allergens: ['Fish', 'Soy'],
        nutrition: {
          calories: 220,
          protein: 8,
          carbs: 28,
          fat: 6,
        },
      },
    }),
    prisma.menuItem.create({
      data: {
        name: 'Salmon Sashimi',
        description: 'Fresh salmon sashimi (6 pieces)',
        price: 16.99,
        categoryId: sushiCategories[1].id,
        image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop',
        allergens: ['Fish'],
        nutrition: {
          calories: 180,
          protein: 22,
          carbs: 0,
          fat: 8,
        },
      },
    }),
    prisma.menuItem.create({
      data: {
        name: 'Teriyaki Chicken',
        description: 'Grilled chicken with teriyaki sauce and vegetables',
        price: 18.99,
        categoryId: sushiCategories[2].id,
        image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop',
        allergens: ['Soy'],
        nutrition: {
          calories: 320,
          protein: 28,
          carbs: 15,
          fat: 12,
        },
      },
    }),
  ]);

  // Create categories for Taco Fiesta
  const tacoFiesta = restaurants[5];
  const tacoCategories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Tacos',
        description: 'Authentic Mexican tacos with fresh ingredients',
        restaurantId: tacoFiesta.id,
        sortOrder: 1,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Quesadillas',
        description: 'Grilled tortillas with cheese and fillings',
        restaurantId: tacoFiesta.id,
        sortOrder: 2,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Sides',
        description: 'Mexican sides and appetizers',
        restaurantId: tacoFiesta.id,
        sortOrder: 3,
      },
    }),
  ]);

  // Create menu items for Taco Fiesta
  await Promise.all([
    prisma.menuItem.create({
      data: {
        name: 'Carne Asada Tacos',
        description: 'Grilled steak tacos with onions, cilantro, and lime',
        price: 14.99,
        categoryId: tacoCategories[0].id,
        isFeatured: true,
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
        allergens: ['Gluten'],
        nutrition: {
          calories: 280,
          protein: 18,
          carbs: 22,
          fat: 12,
        },
      },
    }),
    prisma.menuItem.create({
      data: {
        name: 'Chicken Quesadilla',
        description: 'Grilled tortilla with chicken, cheese, and peppers',
        price: 12.99,
        categoryId: tacoCategories[1].id,
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
        allergens: ['Gluten', 'Dairy'],
        nutrition: {
          calories: 420,
          protein: 22,
          carbs: 28,
          fat: 18,
        },
      },
    }),
    prisma.menuItem.create({
      data: {
        name: 'Guacamole & Chips',
        description: 'Fresh guacamole with crispy tortilla chips',
        price: 8.99,
        categoryId: tacoCategories[2].id,
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
        allergens: ['Avocado'],
        nutrition: {
          calories: 320,
          protein: 4,
          carbs: 28,
          fat: 18,
        },
      },
    }),
  ]);

  console.log('🍕 Created menu items');

  // Create some sample orders
  const sampleOrders = await Promise.all([
    prisma.order.create({
      data: {
        orderNumber: 'ORD-001',
        status: 'COMPLETED',
        paymentStatus: 'PAID',
        subtotal: 45.97,
        platformFee: 9.19,
        total: 55.16,
        bookingDateTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
        guests: 2,
        specialRequests: 'Extra cheese on pizza',
        userId: users[0].id,
        restaurantId: bellaItalia.id,
      },
    }),
    prisma.order.create({
      data: {
        orderNumber: 'ORD-002',
        status: 'CONFIRMED',
        paymentStatus: 'PAID',
        subtotal: 32.97,
        platformFee: 6.59,
        total: 39.56,
        bookingDateTime: new Date(Date.now() + 3 * 60 * 60 * 1000), // 3 hours from now
        guests: 1,
        userId: users[1].id,
        restaurantId: dragonPalace.id,
      },
    }),
  ]);

  // Get menu items for order creation
  const bellaMenuItems = await prisma.menuItem.findMany({
    where: { category: { restaurantId: bellaItalia.id } },
    take: 3,
  });

  const dragonMenuItems = await prisma.menuItem.findMany({
    where: { category: { restaurantId: dragonPalace.id } },
    take: 2,
  });

  // Create order items
  await Promise.all([
    prisma.orderItem.create({
      data: {
        quantity: 2,
        price: 18.99,
        discount: 14,
        orderId: sampleOrders[0].id,
        menuItemId: bellaMenuItems[0].id,
      },
    }),
    prisma.orderItem.create({
      data: {
        quantity: 1,
        price: 22.99,
        discount: 12,
        orderId: sampleOrders[0].id,
        menuItemId: bellaMenuItems[1].id,
      },
    }),
    prisma.orderItem.create({
      data: {
        quantity: 1,
        price: 12.99,
        discount: 14,
        orderId: sampleOrders[1].id,
        menuItemId: dragonMenuItems[0].id,
      },
    }),
    prisma.orderItem.create({
      data: {
        quantity: 1,
        price: 18.99,
        orderId: sampleOrders[1].id,
        menuItemId: dragonMenuItems[1].id,
      },
    }),
  ]);

  console.log('📦 Created sample orders');

  // Create some reviews
  await Promise.all([
    prisma.review.create({
      data: {
        rating: 5,
        comment: 'Amazing Italian food! The pizza was perfect and the service was excellent.',
        userId: users[0].id,
        restaurantId: bellaItalia.id,
        orderId: sampleOrders[0].id,
      },
    }),
    prisma.review.create({
      data: {
        rating: 4,
        comment: 'Great Chinese food, very authentic flavors. Will definitely order again!',
        userId: users[1].id,
        restaurantId: dragonPalace.id,
        orderId: sampleOrders[1].id,
      },
    }),
  ]);

  console.log('⭐ Created sample reviews');

  // Create some favorites
  await Promise.all([
    prisma.favoriteRestaurant.create({
      data: {
        userId: users[0].id,
        restaurantId: bellaItalia.id,
      },
    }),
    prisma.favoriteRestaurant.create({
      data: {
        userId: users[0].id,
        restaurantId: sushiMaster.id,
      },
    }),
    prisma.favoriteRestaurant.create({
      data: {
        userId: users[1].id,
        restaurantId: dragonPalace.id,
      },
    }),
  ]);

  console.log('❤️ Created sample favorites');

  console.log('✅ Database seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`- ${users.length} users created`);
  console.log(`- ${restaurants.length} restaurants created`);
  console.log(`- ${businessHours.length} business hours created`);
  console.log(`- ${sampleOrders.length} sample orders created`);
  console.log(`- Reviews and favorites created`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 