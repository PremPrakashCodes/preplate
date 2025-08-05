"use client";

import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { 
  LogOut, 
  User, 
  UtensilsCrossed, 
  Clock, 
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Package,
  Calendar,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  discount?: number;
  notes?: string;
  menuItem: {
    name: string;
    description: string;
  };
}

interface Order {
  id: string;
  orderNumber: string;
  status: "PENDING" | "CONFIRMED" | "PREPARING" | "READY" | "COMPLETED" | "CANCELLED";
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  subtotal: number;
  platformFee: number;
  total: number;
  bookingDateTime: string;
  guests: number;
  specialRequests?: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
    phone: string;
  };
  restaurant: {
    name: string;
    phone: string;
  };
  orderItems: OrderItem[];
}

export default function Orders() {
  const { user, restaurant, userType, logout, loading, token } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);

  const statusOptions = [
    { value: "all", label: "All Orders" },
    { value: "PENDING", label: "Pending" },
    { value: "CONFIRMED", label: "Confirmed" },
    { value: "PREPARING", label: "Preparing" },
    { value: "READY", label: "Ready" },
    { value: "COMPLETED", label: "Completed" },
    { value: "CANCELLED", label: "Cancelled" },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case "CONFIRMED":
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
      case "PREPARING":
        return <Package className="w-4 h-4 text-orange-600" />;
      case "READY":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "COMPLETED":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "CANCELLED":
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "CONFIRMED":
        return "bg-blue-100 text-blue-800";
      case "PREPARING":
        return "bg-orange-100 text-orange-800";
      case "READY":
        return "bg-green-100 text-green-800";
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    if (!token) return;

    try {
      setUpdatingOrder(orderId);
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update order status");
      }

      const data = await response.json();
      
      // Update the order in the local state
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus as Order['status'] } : order
      ));

      setSuccessMessage(`Order status updated to ${newStatus}`);
      setTimeout(() => setSuccessMessage(null), 3000);
      console.log("Order status updated successfully:", data);
    } catch (error) {
      console.error("Error updating order status:", error);
      setError(error instanceof Error ? error.message : "Failed to update order status");
    } finally {
      setUpdatingOrder(null);
    }
  };

  useEffect(() => {
    if (!loading && !user && !restaurant) {
      router.push("/auth");
      return;
    }

    const fetchOrders = async () => {
      if (!token) return;

      try {
        setIsLoading(true);
        setError(null);
        
        const params = new URLSearchParams();
        if (selectedStatus !== "all") {
          params.append("status", selectedStatus);
        }
        
        const response = await fetch(`/api/orders?${params.toString()}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          throw new Error("Failed to fetch orders");
        }
        
        const data = await response.json();
        setOrders(data.orders);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("Failed to load orders. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchOrders();
    }
  }, [loading, user, restaurant, router, token, selectedStatus]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-lg text-gray-700">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user && !restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-lg">Redirecting...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => router.push("/")}
              className="flex items-center justify-center w-12 h-12 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
            >
              <UtensilsCrossed className="w-7 h-7 text-white" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Order History
              </h1>
              <p className="text-sm text-gray-600 -mt-1">
                View your past and upcoming orders
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => router.push("/profile")}
              variant="outline"
              className="flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              Profile
            </Button>
            <Button
              onClick={logout}
              variant="outline"
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-green-800 font-medium">{successMessage}</span>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-red-800 font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Status Filter */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filter Orders</CardTitle>
            <CardDescription>
              Filter orders by their current status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((option) => (
                <Button
                  key={option.value}
                  onClick={() => setSelectedStatus(option.value)}
                  variant={selectedStatus === option.value ? "default" : "outline"}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  {getStatusIcon(option.value)}
                  {option.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Your Orders</CardTitle>
            <CardDescription>
              {userType === "user"
                ? "Track your food orders and bookings"
                : "Manage incoming orders for your restaurant"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                  <span className="text-gray-600">Loading orders...</span>
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Error</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <Button onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  No orders found
                </h3>
                <p className="text-gray-500 mb-6">
                  {selectedStatus === "all"
                    ? userType === "user"
                      ? "Start exploring restaurants and place your first order!"
                      : "Orders from customers will appear here."
                    : `No ${selectedStatus.toLowerCase()} orders found.`}
                </p>
                {userType === "user" && selectedStatus === "all" && (
                  <Button onClick={() => router.push("/")}>
                    Browse Restaurants
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <Card key={order.id} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">
                            {order.restaurant.name}
                          </CardTitle>
                          <p className="text-sm text-gray-600">
                            Order #{order.orderNumber}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            order.paymentStatus === "PAID" 
                              ? "bg-green-100 text-green-800" 
                              : "bg-yellow-100 text-yellow-800"
                          }`}>
                            {order.paymentStatus}
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {/* Status Update Section for Restaurant Users */}
                      {userType === "restaurant" && (
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">Update Status:</span>
                            <div className="flex gap-2">
                              {["PENDING", "CONFIRMED", "PREPARING", "READY", "COMPLETED", "CANCELLED"].map((status) => (
                                <Button
                                  key={status}
                                  size="sm"
                                  variant={order.status === status ? "default" : "outline"}
                                  onClick={() => updateOrderStatus(order.id, status)}
                                  disabled={updatingOrder === order.id}
                                  className="text-xs"
                                >
                                  {updatingOrder === order.id && order.status === status ? (
                                    <Loader2 className="w-3 h-3 animate-spin mr-1" />
                                  ) : null}
                                  {status}
                                </Button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="space-y-4">
                        {/* Order Items */}
                        <div className="space-y-2">
                          {order.orderItems.map((item) => (
                            <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">
                                  {item.quantity}x {item.menuItem.name}
                                </p>
                                <p className="text-sm text-gray-600">
                                  ₹{item.price} each
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-gray-900">
                                  ₹{(item.price * item.quantity).toFixed(2)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Order Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Calendar className="w-4 h-4" />
                              <span>
                                {new Date(order.bookingDateTime).toLocaleDateString("en-US", {
                                  weekday: "long",
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Users className="w-4 h-4" />
                              <span>{order.guests} guest{order.guests !== 1 ? "s" : ""}</span>
                            </div>
                            {order.specialRequests && (
                              <div className="text-sm text-gray-600">
                                <span className="font-medium">Special Requests:</span> {order.specialRequests}
                              </div>
                            )}
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Subtotal:</span>
                              <span className="font-medium">₹{order.subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Platform Fee:</span>
                              <span className="font-medium">₹{order.platformFee.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-lg font-semibold border-t border-gray-200 pt-2">
                              <span>Total:</span>
                              <span className="text-green-600">₹{order.total.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Order Date */}
                        <div className="text-xs text-gray-500 pt-2 border-t border-gray-100">
                          Ordered on {new Date(order.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
