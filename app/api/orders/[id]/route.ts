import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;
    
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

    const { status, paymentStatus } = await request.json();

    // Validate status if provided
    const validStatuses = ["PENDING", "CONFIRMED", "PREPARING", "READY", "COMPLETED", "CANCELLED"];
    const validPaymentStatuses = ["PENDING", "PAID", "FAILED", "REFUNDED"];

    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    if (paymentStatus && !validPaymentStatuses.includes(paymentStatus)) {
      return NextResponse.json(
        { error: "Invalid payment status" },
        { status: 400 }
      );
    }

    // Check if order exists and user has permission
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        restaurant: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Check permissions
    if (payload.type === "user" && order.userId !== payload.id) {
      return NextResponse.json(
        { error: "Unauthorized - Can only update your own orders" },
        { status: 403 }
      );
    }

    if (payload.type === "restaurant" && order.restaurantId !== payload.id) {
      return NextResponse.json(
        { error: "Unauthorized - Can only update orders for your restaurant" },
        { status: 403 }
      );
    }

    // Update order
    const updateData: { status?: string; paymentStatus?: string } = {};
    if (status) updateData.status = status;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
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

    return NextResponse.json({
      message: "Order updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;
    
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

    const order = await prisma.order.findUnique({
      where: { id: orderId },
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

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Check permissions
    if (payload.type === "user" && order.userId !== payload.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    if (payload.type === "restaurant" && order.restaurantId !== payload.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
} 