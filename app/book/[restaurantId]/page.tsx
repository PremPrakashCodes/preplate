"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  ChefHat,
  Clock,
  Loader2,
  LogOut,
  MapPin,
  Star,
  Store,
  User,
  Users,
  UtensilsCrossed
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image?: string;
  category?: {
    name: string;
  };
  allergens: string[];
  nutrition?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

interface Restaurant {
  id: string;
  name: string;
  description: string;
  cuisine: string;
  rating: number;
  address: string;
  phone: string;
  estimatedTime: string;
  isOpen: boolean;
  categories: {
    id: string;
    name: string;
    description?: string;
    menuItems: MenuItem[];
  }[];
}

interface SelectedItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  quantity: number;
  category: string;
  image?: string;
}

interface ConfirmationData {
  restaurantName?: string;
  orderNumber: string;
  dateTime: string;
  guests: number;
  subtotal: number;
  platformFee: number;
  total: number;
  items: SelectedItem[];
}

export default function BookRestaurant() {
  const { user, restaurant, logout, loading, token } = useAuth();
  const router = useRouter();
  const params = useParams();
  const restaurantId = params.restaurantId as string;

  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [bookingDateTime, setBookingDateTime] = useState<Date | undefined>(undefined);
  const [isBooking, setIsBooking] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingDetails, setBookingDetails] = useState({
    guests: 1,
    specialRequests: "",
  });
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationData, setConfirmationData] = useState<ConfirmationData | null>(null);

  useEffect(() => {
    if (!loading && !user && !restaurant) {
      router.push("/auth");
      return;
    }

    const fetchRestaurant = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log("Fetching restaurant with ID:", restaurantId);
        const response = await fetch(`/api/restaurants/${restaurantId}`);
        console.log("Response status:", response.status);
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error("API Error:", errorData);
          throw new Error(errorData.error || "Restaurant not found");
        }
        
        const data = await response.json();
        console.log("Restaurant data:", data);
        setSelectedRestaurant(data);
      } catch (err) {
        console.error("Error fetching restaurant:", err);
        setError(`Failed to load restaurant: ${err instanceof Error ? err.message : "Unknown error"}`);
      } finally {
        setIsLoading(false);
      }
    };

    if (restaurantId) {
      fetchRestaurant();
    }
  }, [loading, user, restaurant, restaurantId, router]);

  const addToOrder = (item: MenuItem) => {
    const existingItem = selectedItems.find((i) => i.id === item.id);
    if (existingItem) {
      setSelectedItems(
        selectedItems.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      );
    } else {
      setSelectedItems([
        ...selectedItems,
        {
          id: item.id,
          name: item.name,
          price: item.price,
          originalPrice: item.originalPrice,
          discount: item.discount,
          quantity: 1,
          category: item.category?.name || 'Uncategorized',
          image: item.image,
        },
      ]);
    }
  };

  const removeFromOrder = (itemId: string) => {
    setSelectedItems(selectedItems.filter((i) => i.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromOrder(itemId);
    } else {
      setSelectedItems(
        selectedItems.map((i) => (i.id === itemId ? { ...i, quantity } : i))
      );
    }
  };

  const getTotalPrice = () => {
    return selectedItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const getPlatformCommission = () => {
    const subtotal = getTotalPrice();
    return subtotal * 0.2; // 20% platform commission
  };

  const getFinalTotal = () => {
    return getTotalPrice() + getPlatformCommission();
  };

  const getTotalDiscount = () => {
    return selectedItems.reduce((total, item) => {
      const discountAmount = ((item.originalPrice || item.price) - item.price) * item.quantity;
      return total + discountAmount;
    }, 0);
  };

  const handleBooking = async () => {
    if (!bookingDateTime) {
      alert("Please select date and time for your booking");
      return;
    }

    if (selectedItems.length === 0) {
      alert("Please select at least one item to order");
      return;
    }

    if (!token) {
      alert("Please log in to place an order");
      router.push("/auth");
      return;
    }

    setIsBooking(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          restaurantId,
          items: selectedItems.map(item => ({
            menuItemId: item.id,
            quantity: item.quantity,
            notes: "",
          })),
          bookingDateTime: bookingDateTime.toISOString(),
          guests: bookingDetails.guests,
          specialRequests: bookingDetails.specialRequests,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create order");
      }

      const data = await response.json();
      
      // Format the date and time for display
      const formattedDateTime = bookingDateTime.toLocaleString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      // Set confirmation data and show dialog
      setConfirmationData({
        restaurantName: selectedRestaurant?.name,
        orderNumber: data.order.orderNumber,
        dateTime: formattedDateTime,
        guests: bookingDetails.guests,
        subtotal: getTotalPrice(),
        platformFee: getPlatformCommission(),
        total: getFinalTotal(),
        items: selectedItems,
      });
      setShowConfirmation(true);
    } catch (error) {
      console.error("Error creating order:", error);
      alert(`Failed to create order: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsBooking(false);
    }
  };

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-lg text-gray-700">Loading restaurant...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => router.push("/")}>
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  if (!selectedRestaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <Store className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Restaurant not found</h2>
          <p className="text-gray-600 mb-4">The restaurant you&apos;re looking for doesn&apos;t exist.</p>
          <Button onClick={() => router.push("/")}>
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100/50 backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6">
            <div className="flex items-center space-x-3 sm:space-x-4 w-full sm:w-auto">
              <button
                onClick={() => router.push("/")}
                className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex-shrink-0"
              >
                <UtensilsCrossed className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </button>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 truncate">
                  Pre-Book at {selectedRestaurant.name}
                </h1>
                <p className="text-sm sm:text-base text-gray-600 flex items-center gap-2">
                  <Calendar className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">
                    Schedule your order and table
                  </span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <Button
                onClick={() => router.push("/profile")}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 hover:bg-blue-50 border-blue-200 flex-1 sm:flex-none justify-center"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Profile</span>
              </Button>
              <Button
                onClick={logout}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 hover:bg-red-50 border-red-200 text-red-600 flex-1 sm:flex-none justify-center"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Restaurant Info */}
        <Card className="overflow-hidden border-0 shadow-xl bg-white rounded-2xl">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-6">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 sm:mb-3">
                  {selectedRestaurant.name}
                </CardTitle>
                <CardDescription className="text-blue-100 text-sm sm:text-base lg:text-lg leading-relaxed">
                  {selectedRestaurant.description}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-2 sm:px-4 sm:py-2 backdrop-blur-sm self-start flex-shrink-0">
                <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-yellow-400 text-yellow-400" />
                <span className="text-base sm:text-lg font-bold text-white">
                  {selectedRestaurant.rating}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-orange-50 rounded-xl border border-orange-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-orange-500 rounded-full flex-shrink-0">
                  <ChefHat className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-orange-700">
                    Cuisine
                  </p>
                  <p className="font-bold text-gray-900 text-sm sm:text-base truncate">
                    {selectedRestaurant.cuisine}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-green-50 rounded-xl border border-green-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-green-500 rounded-full flex-shrink-0">
                  <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-green-700">
                    Location
                  </p>
                  <p className="font-bold text-gray-900 text-xs sm:text-sm truncate">
                    {selectedRestaurant.address}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-blue-50 rounded-xl border border-blue-100 sm:col-span-2 lg:col-span-1 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-full flex-shrink-0">
                  <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-blue-700">
                    Prep Time
                  </p>
                  <p className="font-bold text-gray-900 text-sm sm:text-base truncate">
                    {selectedRestaurant.estimatedTime}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
          {/* Menu Items */}
          <div className="xl:col-span-2 space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-lg">
                <ChefHat className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                Our Menu
              </h2>
            </div>
            
            {selectedRestaurant.categories.length === 0 ? (
              <div className="text-center py-12">
                <ChefHat className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  No menu available
                </h3>
                <p className="text-gray-500">
                  This restaurant hasn&apos;t added their menu yet.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {selectedRestaurant.categories.map((category) => (
                  <div key={category.id} className="space-y-4">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
                      {category.name}
                    </h3>
                    {category.description && (
                      <p className="text-sm text-gray-600 mb-4">
                        {category.description}
                      </p>
                    )}
                    <div className="space-y-3 sm:space-y-4">
                      {category.menuItems.map((item) => (
                        <Card
                          key={item.id}
                          className="group hover:shadow-xl transition-all duration-300 border border-gray-200 shadow-sm hover:scale-[1.01] bg-white rounded-xl overflow-hidden"
                        >
                          <CardContent className="p-5 sm:p-6">
                            <div className="flex flex-col gap-4">
                              <div className="flex-1">
                                <div className="flex flex-col sm:flex-row sm:items-start gap-2 mb-3">
                                  <div className="flex-1">
                                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">
                                      {item.name}
                                    </h3>
                                    <span className="inline-flex px-2 py-1 bg-blue-100 text-blue-700 text-xs sm:text-sm font-medium rounded-full">
                                      {item.category?.name || 'Uncategorized'}
                                    </span>
                                  </div>
                                  {item.discount && item.discount > 0 && (
                                    <span className="inline-flex px-2 py-1 bg-red-100 text-red-600 text-xs sm:text-sm font-bold rounded-full self-start">
                                      {item.discount}% OFF
                                    </span>
                                  )}
                                </div>
                                
                                {/* Food Image */}
                                {item.image && (
                                  <div className="mb-4">
                                    <img
                                      src={item.image}
                                      alt={item.name}
                                      className="w-full h-48 sm:h-56 object-cover rounded-lg shadow-md"
                                      onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                      }}
                                    />
                                  </div>
                                )}
                                <p className="text-gray-600 mb-4 leading-relaxed text-sm sm:text-base">
                                  {item.description}
                                </p>
                                
                                {/* Allergens */}
                                {item.allergens && item.allergens.length > 0 && (
                                  <div className="mb-3">
                                    <p className="text-xs text-gray-500 mb-1">Allergens:</p>
                                    <div className="flex flex-wrap gap-1">
                                      {item.allergens.map((allergen) => (
                                        <span
                                          key={allergen}
                                          className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full"
                                        >
                                          {allergen}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xl sm:text-2xl font-bold text-green-600">
                                      ₹{item.price}
                                    </span>
                                    {item.originalPrice && item.originalPrice > item.price && (
                                      <span className="text-base sm:text-lg text-gray-400 line-through">
                                        ₹{item.originalPrice}
                                      </span>
                                    )}
                                    <span className="text-xs sm:text-sm text-gray-500">
                                      per serving
                                    </span>
                                  </div>
                                  <Button
                                    onClick={() => addToOrder(item)}
                                    className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 px-6 py-2.5"
                                    size="sm"
                                  >
                                    Add to Order
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Booking Details & Order Summary */}
          <div className="space-y-6">
            {/* Booking Details */}
            <Card className="border border-gray-200 shadow-xl bg-white rounded-xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg p-4 sm:p-6">
                <CardTitle className="flex items-center gap-3 text-lg sm:text-xl font-semibold">
                  <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
                  Booking Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 sm:p-6 space-y-5 sm:space-y-6">
                <div>
                  <Label
                    htmlFor="datetime"
                    className="text-sm font-semibold text-gray-700 mb-2 sm:mb-3 block"
                  >
                    Select Date & Time
                  </Label>
                  <DateTimePicker
                    date={bookingDateTime}
                    setDate={setBookingDateTime}
                    placeholder="Choose your preferred date and time"
                    className="w-full"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="guests"
                    className="text-sm font-semibold text-gray-700 mb-2 sm:mb-3 block"
                  >
                    Number of Guests
                  </Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    <Input
                      id="guests"
                      type="number"
                      min="1"
                      max="10"
                      value={bookingDetails.guests}
                      onChange={(e) =>
                        setBookingDetails({
                          ...bookingDetails,
                          guests: parseInt(e.target.value),
                        })
                      }
                      className="pl-10 sm:pl-12 h-10 sm:h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base rounded-lg"
                      placeholder="How many guests?"
                    />
                  </div>
                </div>
                <div>
                  <Label
                    htmlFor="requests"
                    className="text-sm font-semibold text-gray-700 mb-2 sm:mb-3 block"
                  >
                    Special Requests
                  </Label>
                  <Input
                    id="requests"
                    placeholder="Any dietary restrictions, allergies, or special requests..."
                    value={bookingDetails.specialRequests}
                    onChange={(e) =>
                      setBookingDetails({
                        ...bookingDetails,
                        specialRequests: e.target.value,
                      })
                    }
                    className="h-10 sm:h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base rounded-lg"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card className="border border-gray-200 shadow-xl bg-white rounded-xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-t-lg p-4 sm:p-6">
                <CardTitle className="flex items-center gap-3 text-lg sm:text-xl font-semibold">
                  <ChefHat className="w-5 h-5 sm:w-6 sm:h-6" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 sm:p-6">
                {selectedItems.length === 0 ? (
                  <div className="text-center py-6 sm:py-8">
                    <div className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full mx-auto mb-3 sm:mb-4">
                      <ChefHat className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-base sm:text-lg font-medium">
                      No items selected
                    </p>
                    <p className="text-gray-400 text-xs sm:text-sm mt-1">
                      Add items from the menu to get started
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {selectedItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex flex-col sm:flex-row justify-between items-start gap-3 p-4 sm:p-5 bg-gray-50 rounded-lg border border-gray-100"
                      >
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg flex-shrink-0"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                              {item.name}
                            </p>
                                                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <p className="text-xs sm:text-sm text-green-600 font-medium">
                                ₹{item.price} each
                              </p>
                              {item.originalPrice && item.originalPrice > item.price && (
                                <p className="text-xs text-gray-400 line-through">
                                  ₹{item.originalPrice}
                                </p>
                              )}
                              {item.discount && item.discount > 0 && (
                                <span className="px-1.5 py-0.5 bg-red-100 text-red-600 text-xs font-bold rounded">
                                  {item.discount}% OFF
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between w-full sm:w-auto gap-3">
                          <div className="flex items-center gap-1 sm:gap-2 bg-white rounded-lg p-1 border border-gray-200">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                updateQuantity(item.id, item.quantity - 1)
                              }
                              className="w-6 h-6 sm:w-8 sm:h-8 p-0 hover:bg-red-50 hover:border-red-200 border-0 text-xs"
                            >
                              -
                            </Button>
                            <span className="w-6 sm:w-8 text-center font-medium text-xs sm:text-base">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                updateQuantity(item.id, item.quantity + 1)
                              }
                              className="w-6 h-6 sm:w-8 sm:h-8 p-0 hover:bg-green-50 hover:border-green-200 border-0 text-xs"
                            >
                              +
                            </Button>
                          </div>
                          <div className="text-right min-w-[60px] sm:min-w-[80px]">
                            <p className="font-bold text-green-600 text-sm sm:text-lg">
                              ₹{(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="border-t-2 border-gray-200 pt-4 sm:pt-5 mt-4 sm:mt-6 space-y-3 sm:space-y-4">
                      {/* Subtotal */}
                      <div className="flex justify-between items-center">
                        <span className="text-sm sm:text-lg font-medium text-gray-700">
                          Subtotal:
                        </span>
                        <span className="text-sm sm:text-lg font-semibold text-gray-900">
                          ₹{getTotalPrice().toFixed(2)}
                        </span>
                      </div>

                      {/* Total Discount */}
                      {getTotalDiscount() > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm sm:text-lg font-medium text-green-600">
                            Total Discount:
                          </span>
                          <span className="text-sm sm:text-lg font-semibold text-green-600">
                            -₹{getTotalDiscount().toFixed(2)}
                          </span>
                        </div>
                      )}

                      {/* Platform Commission */}
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="text-sm sm:text-lg font-medium text-blue-600">
                            Platform Fee (20%):
                          </span>
                          <div className="group relative">
                            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-100 rounded-full flex items-center justify-center cursor-help">
                              <span className="text-blue-600 text-xs font-bold">
                                ?
                              </span>
                            </div>
                            <div className="absolute bottom-6 left-0 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-2 px-3 whitespace-nowrap z-10">
                              Service fee for booking platform
                            </div>
                          </div>
                        </div>
                        <span className="text-sm sm:text-lg font-semibold text-blue-600">
                          +₹{getPlatformCommission().toFixed(2)}
                        </span>
                      </div>

                      {/* Final Total */}
                      <div className="flex justify-between items-center bg-gradient-to-r from-green-50 to-blue-50 p-4 sm:p-5 rounded-lg border border-green-200">
                        <span className="text-base sm:text-xl font-bold text-gray-900">
                          Final Total:
                        </span>
                        <span className="text-lg sm:text-2xl font-bold text-green-600">
                          ₹{getFinalTotal().toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                <Button
                  onClick={handleBooking}
                  className="w-full mt-4 sm:mt-6 h-10 sm:h-12 text-sm sm:text-lg font-semibold bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 rounded-lg"
                  disabled={
                    selectedItems.length === 0 || !bookingDateTime || isBooking || !selectedRestaurant.isOpen
                  }
                >
                  {isBooking ? (
                    <div className="flex items-center gap-2 justify-center">
                      <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs sm:text-base">
                        Processing Booking...
                      </span>
                    </div>
                  ) : !selectedRestaurant.isOpen ? (
                    <span className="text-xs sm:text-base">
                      Restaurant is currently closed
                    </span>
                  ) : selectedItems.length === 0 || !bookingDateTime ? (
                    <span className="text-xs sm:text-base">
                      Please select items and date/time
                    </span>
                  ) : (
                    <span className="text-xs sm:text-base">{`Confirm Pre-Booking • ₹${getFinalTotal().toFixed(
                      2
                    )}`}</span>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Booking Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              Booking Confirmed!
            </DialogTitle>
            <DialogDescription>
              Your order has been successfully placed.
            </DialogDescription>
          </DialogHeader>
          
          {confirmationData && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-2">
                  🎉 Booking confirmed for {confirmationData.restaurantName}!
                </h3>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order Number:</span>
                    <span className="font-medium">{confirmationData.orderNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date & Time:</span>
                    <span className="font-medium">{confirmationData.dateTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Guests:</span>
                    <span className="font-medium">{confirmationData.guests}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-gray-800">Order Summary</h4>
                <div className="space-y-1">
                  {confirmationData.items.map((item: SelectedItem) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.name} × {item.quantity}</span>
                      <span className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                
                <div className="border-t pt-2 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">₹{confirmationData.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Platform Fee:</span>
                    <span className="font-medium">₹{confirmationData.platformFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-green-600">
                    <span>Total:</span>
                    <span>₹{confirmationData.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  Thank you for choosing PrePlate! Your order will be prepared according to your booking time.
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              onClick={() => {
                setShowConfirmation(false);
                router.push("/orders");
              }}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              View Orders
            </Button>
            <Button
              onClick={() => setShowConfirmation(false)}
              variant="outline"
              className="flex-1"
            >
              Continue Shopping
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
