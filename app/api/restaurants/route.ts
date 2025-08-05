import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cuisine = searchParams.get("cuisine");
    const isOpen = searchParams.get("isOpen");
    const featured = searchParams.get("featured");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search");

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, any> = {};

    if (cuisine && cuisine !== "All") {
      where.cuisine = cuisine;
    }

    if (isOpen !== null) {
      where.isOpen = isOpen === "true";
    }

    if (featured === "true") {
      where.featured = true;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { cuisine: { contains: search, mode: "insensitive" } },
      ];
    }

    // Get restaurants with count
    const [restaurants, total] = await Promise.all([
      prisma.restaurant.findMany({
        where,
        include: {
          _count: {
            select: {
              reviews: true,
            },
          },
          reviews: {
            select: {
              rating: true,
            },
          },
        },
        orderBy: [
          { featured: "desc" },
          { rating: "desc" },
          { name: "asc" },
        ],
        skip,
        take: limit,
      }),
      prisma.restaurant.count({ where }),
    ]);

    // Calculate average ratings
    const restaurantsWithRating = restaurants.map((restaurant) => {
      const avgRating =
        restaurant.reviews.length > 0
          ? restaurant.reviews.reduce((sum, review) => sum + review.rating, 0) /
            restaurant.reviews.length
          : restaurant.rating || 0;

      return {
        ...restaurant,
        rating: Math.round(avgRating * 10) / 10, // Round to 1 decimal place
        reviewCount: restaurant._count.reviews,
        reviews: undefined, // Remove reviews array from response
        _count: undefined, // Remove _count from response
      };
    });

    return NextResponse.json({
      restaurants: restaurantsWithRating,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching restaurants:", error);
    return NextResponse.json(
      { error: "Failed to fetch restaurants" },
      { status: 500 }
    );
  }
} 