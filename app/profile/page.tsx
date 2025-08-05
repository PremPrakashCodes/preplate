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
  Store, 
  UtensilsCrossed,
  Loader2,
  AlertCircle,
  Star,
  Clock,
  Package,
  TrendingUp,
  Heart,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";
import { useEffect, useState } from "react";

interface UserStats {
  totalOrders: number;
  totalSpent: number;
  favoriteRestaurants: number;
  averageRating: number;
}

interface RestaurantStats {
  totalOrders: number;
  totalRevenue: number;
  averageRating: number;
  totalReviews: number;
}

export default function Profile() {
  const { user, restaurant, userType, logout, loading, token } = useAuth();
  const router = useRouter();
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [restaurantStats, setRestaurantStats] = useState<RestaurantStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("Profile: Loading state:", loading);
    console.log("Profile: User:", user);
    console.log("Profile: Restaurant:", restaurant);
    console.log("Profile: UserType:", userType);
    console.log("Profile: Token:", token ? "exists" : "none");
  }, [loading, user, restaurant, userType, token]);

  const fetchStats = async () => {
    if (!token) return;

    try {
      setIsLoading(true);
      setError(null);

      if (userType === "user") {
        // Fetch user statistics
        const [ordersResponse, favoritesResponse] = await Promise.all([
          fetch("/api/orders", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("/api/favorites", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (ordersResponse.ok && favoritesResponse.ok) {
          const ordersData = await ordersResponse.json();
          const favoritesData = await favoritesResponse.json();

          const totalSpent = ordersData.orders.reduce(
            (sum: number, order: { total: number }) => sum + order.total,
            0
          );

          const totalRating = ordersData.orders.reduce(
            (sum: number, order: any) => {
              // This would need to be calculated from reviews
              return sum + (order.restaurant?.rating || 0);
            },
            0
          );

          setUserStats({
            totalOrders: ordersData.orders.length,
            totalSpent,
            favoriteRestaurants: favoritesData.favorites?.length || 0,
            averageRating: ordersData.orders.length > 0 ? totalRating / ordersData.orders.length : 0,
          });
        }
      } else if (userType === "restaurant") {
        // Fetch restaurant statistics
        const [ordersResponse, reviewsResponse] = await Promise.all([
          fetch("/api/orders", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("/api/restaurants/reviews", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (ordersResponse.ok) {
          const ordersData = await ordersResponse.json();
          const reviewsData = reviewsResponse.ok ? await reviewsResponse.json() : { reviews: [] };

          const totalRevenue = ordersData.orders.reduce(
            (sum: number, order: { subtotal: number }) => sum + (order.subtotal || 0),
            0
          );

          const totalRating = reviewsData.reviews.reduce(
            (sum: number, review: { rating: number }) => sum + review.rating,
            0
          );

          setRestaurantStats({
            totalOrders: ordersData.orders.length,
            totalRevenue,
            totalReviews: reviewsData.reviews.length,
            averageRating: reviewsData.reviews.length > 0 ? totalRating / reviewsData.reviews.length : 0,
          });
        }
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
      setError("Failed to load profile statistics");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchStats();
    }
  }, [token]);

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
              <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
              <p className="text-sm text-gray-600 -mt-1">
                Manage your account settings
              </p>
            </div>
          </div>
          <Button
            onClick={logout}
            variant="outline"
            className="flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50">
                            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* User Profile */}
        {userType === "user" && user && (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Profile Information
                  </CardTitle>
                  <User className="h-4 w-4 ml-auto text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{user.name}</div>
                  <div className="space-y-1 mt-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-3 h-3" />
                      {user.email}
                    </div>
                    {user.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-3 h-3" />
                        {user.phone}
                      </div>
                    )}
                    {user.address && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-3 h-3" />
                        {user.address}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Order Statistics
                  </CardTitle>
                  <Package className="h-4 w-4 ml-auto text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm text-gray-500">Loading...</span>
                    </div>
                  ) : (
                    <>
                      <div className="text-2xl font-bold">
                        {userStats?.totalOrders || 0}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Total orders placed
                      </p>
                      {userStats && userStats.totalSpent > 0 && (
                        <div className="mt-2 text-sm text-green-600 font-medium">
                          ${userStats.totalSpent.toFixed(2)} total spent
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Favorites
                  </CardTitle>
                  <Heart className="h-4 w-4 ml-auto text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm text-gray-500">Loading...</span>
                    </div>
                  ) : (
                    <>
                      <div className="text-2xl font-bold">
                        {userStats?.favoriteRestaurants || 0}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Favorite restaurants
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* User Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Account Management</CardTitle>
                <CardDescription>
                  Manage your profile settings and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 py-0">
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col gap-2"
                  onClick={() => router.push("/orders")}
                >
                  <Package className="w-6 h-6" />
                  Order History
                </Button>
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col gap-2"
                >
                  <Heart className="w-6 h-6" />
                  Favorites
                </Button>
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col gap-2"
                >
                  <User className="w-6 h-6" />
                  Edit Profile
                </Button>
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col gap-2"
                >
                  <User className="w-6 h-6" />
                  Payment Methods
                </Button>
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col gap-2"
                >
                  <MapPin className="w-6 h-6" />
                  Delivery Addresses
                </Button>
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col gap-2"
                >
                  <User className="w-6 h-6" />
                  Account Settings
                </Button>
              </CardContent>
            </Card>
          </>
        )}

        {/* Restaurant Profile */}
        {userType === "restaurant" && restaurant && (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Restaurant Profile
                  </CardTitle>
                  <Store className="h-4 w-4 ml-auto text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{restaurant.name}</div>
                  <div className="space-y-1 mt-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-3 h-3" />
                      {restaurant.email}
                    </div>
                    {restaurant.cuisine && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <UtensilsCrossed className="w-3 h-3" />
                        {restaurant.cuisine}
                      </div>
                    )}
                    {restaurant.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-3 h-3" />
                        {restaurant.phone}
                      </div>
                    )}
                    {restaurant.address && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-3 h-3" />
                        {restaurant.address}
                      </div>
                    )}
                    {restaurant.description && (
                      <p className="text-xs text-gray-500 mt-2">
                        {restaurant.description}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Business Statistics
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 ml-auto text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm text-gray-500">Loading...</span>
                    </div>
                  ) : (
                    <>
                      <div className="text-2xl font-bold">
                        {restaurantStats?.totalOrders || 0}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Orders received
                      </p>
                      {restaurantStats && restaurantStats.totalRevenue > 0 && (
                        <div className="mt-2 text-sm text-green-600 font-medium">
                          ${restaurantStats.totalRevenue.toFixed(2)} total revenue
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Rating</CardTitle>
                  <Star className="h-4 w-4 ml-auto text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm text-gray-500">Loading...</span>
                    </div>
                  ) : (
                    <>
                      <div className="text-2xl font-bold">
                        {restaurantStats?.averageRating 
                          ? restaurantStats.averageRating.toFixed(1) 
                          : restaurant.rating 
                            ? restaurant.rating.toFixed(1) 
                            : "N/A"}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Average rating
                      </p>
                      {restaurantStats && restaurantStats.totalReviews > 0 && (
                        <div className="mt-2 text-sm text-gray-600">
                          {restaurantStats.totalReviews} reviews
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Restaurant Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Restaurant Management</CardTitle>
                <CardDescription>
                  Manage your restaurant settings and operations
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col gap-2"
                  onClick={() => router.push("/orders")}
                >
                  <Package className="w-6 h-6" />
                  Order Management
                </Button>
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col gap-2"
                >
                  <Store className="w-6 h-6" />
                  Edit Restaurant Info
                </Button>
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col gap-2"
                >
                  <UtensilsCrossed className="w-6 h-6" />
                  Manage Menu
                </Button>
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col gap-2"
                >
                  <Clock className="w-6 h-6" />
                  Business Hours
                </Button>
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col gap-2"
                >
                  <TrendingUp className="w-6 h-6" />
                  Analytics
                </Button>
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col gap-2"
                >
                  <Store className="w-6 h-6" />
                  Account Settings
                </Button>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
