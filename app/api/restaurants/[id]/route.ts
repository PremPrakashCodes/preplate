import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: restaurantId } = await params;

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      include: {
        categories: {
          where: { isActive: true },
          include: {
            menuItems: {
              where: { isAvailable: true },
              orderBy: { sortOrder: "asc" },
            },
          },
          orderBy: { sortOrder: "asc" },
        },
        reviews: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        businessHours: {
          orderBy: { dayOfWeek: "asc" },
        },
        _count: {
          select: {
            reviews: true,
          },
        },
      },
    });

    if (!restaurant) {
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 }
      );
    }

    // Calculate average rating
    const avgRating =
      restaurant.reviews.length > 0
        ? restaurant.reviews.reduce((sum, review) => sum + review.rating, 0) /
          restaurant.reviews.length
        : restaurant.rating || 0;

    // Format business hours
    const businessHours = restaurant.businessHours.map((hour) => ({
      ...hour,
      dayName: [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ][hour.dayOfWeek],
    }));

    return NextResponse.json({
      ...restaurant,
      rating: Math.round(avgRating * 10) / 10,
      reviewCount: restaurant._count.reviews,
      businessHours,
      _count: undefined, // Remove _count from response
    });
  } catch (error) {
    console.error("Error fetching restaurant:", error);
    return NextResponse.json(
      { error: "Failed to fetch restaurant" },
      { status: 500 }
    );
  }
} 