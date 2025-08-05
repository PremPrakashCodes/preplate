import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const skip = (page - 1) * limit;

    const where: { status?: string; userId?: string; restaurantId?: string } = {};

    if (status && status !== "all") {
      where.status = status;
    }

    if (payload.type === "user") {
      where.userId = payload.id;
    } else if (payload.type === "restaurant") {
      where.restaurantId = payload.id;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: where as any,
        include: {
          user: {
            select: {
              name: true,
              email: true,
              phone: true,
            },
          },
          restaurant: {
            select: {
              name: true,
              phone: true,
            },
          },
          orderItems: {
            include: {
              menuItem: {
                select: {
                  name: true,
                  description: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.order.count({ where: where as any }),
    ]);

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const payload = await verifyToken(token);
    if (!payload || payload.type !== "user") {
      return NextResponse.json(
        { error: "Unauthorized - User access required" },
        { status: 401 }
      );
    }

    const {
      restaurantId,
      items,
      bookingDateTime,
      guests,
      specialRequests,
    } = await request.json();

    if (!restaurantId || !items || !bookingDateTime) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify restaurant exists
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 }
      );
    }

    if (!restaurant.isOpen) {
      return NextResponse.json(
        { error: "Restaurant is currently closed" },
        { status: 400 }
      );
    }

    // Calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const menuItem = await prisma.menuItem.findUnique({
        where: { id: item.menuItemId },
      });

      if (!menuItem || !menuItem.isAvailable) {
        return NextResponse.json(
          { error: `Menu item ${item.name} is not available` },
          { status: 400 }
        );
      }

      const itemTotal = menuItem.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        price: menuItem.price,
        discount: menuItem.discount || 0,
        notes: item.notes,
      });
    }

    const platformFee = subtotal * 0.2; // 20% platform fee
    const total = subtotal + platformFee;

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create order with items
    const order = await prisma.order.create({
      data: {
        orderNumber,
        status: "PENDING",
        paymentStatus: "PENDING",
        subtotal,
        platformFee,
        total,
        bookingDateTime: new Date(bookingDateTime),
        guests: guests || 1,
        specialRequests,
        userId: payload.id,
        restaurantId,
        orderItems: {
          create: orderItems,
        },
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
        restaurant: {
          select: {
            name: true,
            phone: true,
          },
        },
        orderItems: {
          include: {
            menuItem: {
              select: {
                name: true,
                description: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: "Order created successfully",
        order,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
} 