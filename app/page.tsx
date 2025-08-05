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
  Star,
  Clock,
  MapPin,
  Phone,
  ChefHat,
  UtensilsCrossed,
  Search,
  Filter,
  Loader2,
} from "lucide-react";
import { useState, useEffect } from "react";

interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  address: string;
  phone: string;
  description: string;
  estimatedTime: string;
  image: string;
  isOpen: boolean;
  featured: boolean;
  reviewCount: number;
}

export default function Home() {
  const { user, restaurant, userType, logout, loading } = useAuth();
  const router = useRouter();
  const [selectedCuisine, setSelectedCuisine] = useState<string>("All");
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showOnlyOpen, setShowOnlyOpen] = useState(false);

  const cuisines = [
    "All",
    "Italian",
    "Chinese",
    "Indian",
    "American",
    "Japanese",
    "Mexican",
  ];

  // Fetch restaurants from API
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const params = new URLSearchParams();
        if (selectedCuisine !== "All") {
          params.append("cuisine", selectedCuisine);
        }
        if (showOnlyOpen) {
          params.append("isOpen", "true");
        }
        
        const response = await fetch(`/api/restaurants?${params.toString()}`);
        if (!response.ok) {
          throw new Error("Failed to fetch restaurants");
        }
        
        const data = await response.json();
        setRestaurants(data.restaurants);
        setFilteredRestaurants(data.restaurants);
      } catch (err) {
        console.error("Error fetching restaurants:", err);
        setError("Failed to load restaurants. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRestaurants();
  }, [selectedCuisine, showOnlyOpen]);

  // Filter restaurants based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredRestaurants(restaurants);
    } else {
      const filtered = restaurants.filter((r) =>
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.cuisine.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredRestaurants(filtered);
    }
  }, [searchTerm, restaurants]);

  const handlePreBook = (restaurantId: string) => {
    if (!user && !restaurant) {
      router.push("/auth");
      return;
    }
    router.push(`/book/${restaurantId}`);
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

  // Show restaurant browsing for authenticated users
  if (user || restaurant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-7xl mx-auto space-y-6">
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
                <h1 className="text-3xl font-bold text-gray-900">PrePlate</h1>
                <p className="text-sm text-gray-600 -mt-1">
                  Skip the wait, enjoy the plate
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

          {/* Welcome Message */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">
                Welcome back,{" "}
                {userType === "user" ? user?.name : restaurant?.name}!
              </CardTitle>
              <CardDescription>
                {userType === "user"
                  ? "Discover and pre-book from amazing restaurants in your area"
                  : "Browse other restaurants or manage your business from your profile"}
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Search and Filters */}
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search restaurants, cuisines, or dishes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Filters:</span>
              </div>
              
              {/* Cuisine Filter */}
              <div className="flex flex-wrap gap-2">
                {cuisines.map((cuisine) => (
                  <Button
                    key={cuisine}
                    onClick={() => setSelectedCuisine(cuisine)}
                    variant={
                      selectedCuisine === cuisine ? "default" : "outline"
                    }
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <ChefHat className="w-3 h-3" />
                    {cuisine}
                  </Button>
                ))}
              </div>

              {/* Open/Closed Filter */}
              <Button
                onClick={() => setShowOnlyOpen(!showOnlyOpen)}
                variant={showOnlyOpen ? "default" : "outline"}
                size="sm"
                className="flex items-center gap-2"
              >
                <Clock className="w-3 h-3" />
                Open Now
              </Button>
            </div>
          </div>

          {/* Restaurant Browsing Section */}
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Browse Restaurants
              </h2>
              {isLoading && (
                <div className="flex items-center justify-center gap-2 text-gray-600">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Loading restaurants...
                </div>
              )}
              {error && (
                <div className="text-red-600 bg-red-50 p-4 rounded-lg">
                  {error}
                </div>
              )}
            </div>

            {/* Restaurant Grid */}
            {!isLoading && !error && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900 text-center">
                  {filteredRestaurants.length === 0
                    ? "No restaurants found"
                    : `${filteredRestaurants.length} restaurant${filteredRestaurants.length !== 1 ? "s" : ""} found`}
                </h3>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredRestaurants.map((restaurant) => (
                    <Card
                      key={restaurant.id}
                      className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02] bg-white"
                    >
                      <div className="relative">
                        <div className="h-40 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                          {restaurant.image ? (
                            <img
                              src={restaurant.image}
                              alt={restaurant.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Store className="w-12 h-12 text-gray-400" />
                          )}
                        </div>
                        {restaurant.featured && (
                          <div className="absolute top-2 left-2 bg-yellow-400 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                            Featured
                          </div>
                        )}
                        <div
                          className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${
                            restaurant.isOpen
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {restaurant.isOpen ? "Open" : "Closed"}
                        </div>
                      </div>

                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">
                            {restaurant.name}
                          </CardTitle>
                          <div className="flex items-center gap-1 text-yellow-500">
                            <Star className="w-4 h-4 fill-current" />
                            <span className="text-sm font-medium text-gray-700">
                              {restaurant.rating}
                            </span>
                            {restaurant.reviewCount > 0 && (
                              <span className="text-xs text-gray-500">
                                ({restaurant.reviewCount})
                              </span>
                            )}
                          </div>
                        </div>
                        <CardDescription className="text-sm line-clamp-2">
                          {restaurant.description}
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="pt-0">
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <ChefHat className="w-4 h-4" />
                            {restaurant.cuisine}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="w-4 h-4" />
                            <span className="truncate">{restaurant.address}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="w-4 h-4" />
                            {restaurant.estimatedTime}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="w-4 h-4" />
                            {restaurant.phone}
                          </div>
                        </div>

                        <Button
                          onClick={() => handlePreBook(restaurant.id)}
                          className="w-full"
                          disabled={!restaurant.isOpen}
                        >
                          {restaurant.isOpen
                            ? "Pre-Book Now"
                            : "Currently Closed"}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Show restaurant listing for non-authenticated users
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
                <UtensilsCrossed className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">PrePlate</h1>
                <p className="text-xs text-gray-500 -mt-1">
                  Skip the wait, enjoy the plate
                </p>
              </div>
            </div>
            <Button
              onClick={() => router.push("/auth")}
              className="flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="flex items-center justify-center w-20 h-20 bg-blue-600 rounded-2xl">
              <UtensilsCrossed className="w-12 h-12 text-white" />
            </div>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Pre-Book Your Favorite Meals
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Order from the best restaurants in your area and schedule your
            pickup or delivery. Skip the wait, enjoy fresh food.
          </p>
          <Button
            onClick={() => router.push("/auth")}
            size="lg"
            className="text-lg px-8 py-3"
          >
            Start Ordering
          </Button>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-3 justify-center">
            {cuisines.map((cuisine) => (
              <Button
                key={cuisine}
                onClick={() => setSelectedCuisine(cuisine)}
                variant={selectedCuisine === cuisine ? "default" : "outline"}
                className="flex items-center gap-2"
              >
                <ChefHat className="w-4 h-4" />
                {cuisine}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Restaurants */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            {selectedCuisine === "All"
              ? "Featured Restaurants"
              : `${selectedCuisine} Restaurants`}
          </h3>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                <span className="text-gray-600">Loading restaurants...</span>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-600 bg-red-50 p-6 rounded-lg max-w-md mx-auto">
                {error}
              </div>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredRestaurants.slice(0, 6).map((restaurant) => (
                <Card
                  key={restaurant.id}
                  className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02] bg-white"
                >
                  <div className="relative">
                    <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      {restaurant.image ? (
                        <img
                          src={restaurant.image}
                          alt={restaurant.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Store className="w-16 h-16 text-gray-400" />
                      )}
                    </div>
                    {restaurant.featured && (
                      <div className="absolute top-3 left-3 bg-yellow-400 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                        Featured
                      </div>
                    )}
                    <div
                      className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${
                        restaurant.isOpen
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {restaurant.isOpen ? "Open" : "Closed"}
                    </div>
                  </div>

                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{restaurant.name}</CardTitle>
                      <div className="flex items-center gap-1 text-yellow-500">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-sm font-medium text-gray-700">
                          {restaurant.rating}
                        </span>
                        {restaurant.reviewCount > 0 && (
                          <span className="text-xs text-gray-500">
                            ({restaurant.reviewCount})
                          </span>
                        )}
                      </div>
                    </div>
                    <CardDescription className="text-sm line-clamp-2">
                      {restaurant.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <ChefHat className="w-4 h-4" />
                        {restaurant.cuisine}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span className="truncate">{restaurant.address}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        {restaurant.estimatedTime}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4" />
                        {restaurant.phone}
                      </div>
                    </div>

                    <Button
                      onClick={() => handlePreBook(restaurant.id)}
                      className="w-full"
                      disabled={!restaurant.isOpen}
                    >
                      {restaurant.isOpen ? "Pre-Book Now" : "Currently Closed"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center space-y-4">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-lg">
                <UtensilsCrossed className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">PrePlate</h3>
                <p className="text-xs text-gray-500 -mt-1">
                  Skip the wait, enjoy the plate
                </p>
              </div>
            </div>
            <p className="text-gray-600 text-center">
              © 2025 PrePlate. All rights reserved. |
              <Button
                variant="link"
                onClick={() => router.push("/auth")}
                className="ml-2"
              >
                Join as Restaurant
              </Button>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
