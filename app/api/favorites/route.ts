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
    if (!payload || payload.type !== "user") {
      return NextResponse.json(
        { error: "Unauthorized - User access required" },
        { status: 401 }
      );
    }

    const favorites = await prisma.favoriteRestaurant.findMany({
      where: {
        userId: payload.id,
      },
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
            cuisine: true,
            rating: true,
            address: true,
            phone: true,
            description: true,
            estimatedTime: true,
            isOpen: true,
            featured: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      favorites: favorites.map(fav => ({
        id: fav.id,
        createdAt: fav.createdAt,
        restaurant: fav.restaurant,
      })),
    });
  } catch (error) {
    console.error("Error fetching favorites:", error);
    return NextResponse.json(
      { error: "Failed to fetch favorites" },
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

    const { restaurantId } = await request.json();

    if (!restaurantId) {
      return NextResponse.json(
        { error: "Restaurant ID is required" },
        { status: 400 }
      );
    }

    // Check if restaurant exists
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 }
      );
    }

    // Check if already favorited
    const existingFavorite = await prisma.favoriteRestaurant.findUnique({
      where: {
        userId_restaurantId: {
          userId: payload.id,
          restaurantId: restaurantId,
        },
      },
    });

    if (existingFavorite) {
      return NextResponse.json(
        { error: "Restaurant is already in favorites" },
        { status: 409 }
      );
    }

    // Add to favorites
    const favorite = await prisma.favoriteRestaurant.create({
      data: {
        userId: payload.id,
        restaurantId: restaurantId,
      },
      include: {
        restaurant: {
          select: {
            id: true,
            name: true,
            cuisine: true,
            rating: true,
            address: true,
            phone: true,
            description: true,
            estimatedTime: true,
            isOpen: true,
            featured: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: "Restaurant added to favorites",
        favorite: {
          id: favorite.id,
          createdAt: favorite.createdAt,
          restaurant: favorite.restaurant,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding to favorites:", error);
    return NextResponse.json(
      { error: "Failed to add to favorites" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get("restaurantId");

    if (!restaurantId) {
      return NextResponse.json(
        { error: "Restaurant ID is required" },
        { status: 400 }
      );
    }

    // Remove from favorites
    const deletedFavorite = await prisma.favoriteRestaurant.deleteMany({
      where: {
        userId: payload.id,
        restaurantId: restaurantId,
      },
    });

    if (deletedFavorite.count === 0) {
      return NextResponse.json(
        { error: "Restaurant not found in favorites" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Restaurant removed from favorites",
    });
  } catch (error) {
    console.error("Error removing from favorites:", error);
    return NextResponse.json(
      { error: "Failed to remove from favorites" },
      { status: 500 }
    );
  }
} 