"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  User,
  Store,
  Mail,
  Lock,
  Phone,
  MapPin,
  FileText,
  ChefHat,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import {
  userLoginSchema,
  userRegisterSchema,
  restaurantLoginSchema,
  restaurantRegisterSchema,
  type UserLoginForm,
  type UserRegisterForm,
  type RestaurantLoginForm,
  type RestaurantRegisterForm,
} from "@/lib/validations/auth";

export default function AuthPage() {
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [userType, setUserType] = useState<"user" | "restaurant">("user");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { login } = useAuth();

  // User Login Form
  const userLoginForm = useForm<UserLoginForm>({
    resolver: zodResolver(userLoginSchema),
    defaultValues: {
      email: "",
      password: "",
      type: "user",
    },
  });

  // User Register Form
  const userRegisterForm = useForm<UserRegisterForm>({
    resolver: zodResolver(userRegisterSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
      type: "user",
      phone: "",
      address: "",
    },
  });

  // Restaurant Login Form
  const restaurantLoginForm = useForm<RestaurantLoginForm>({
    resolver: zodResolver(restaurantLoginSchema),
    defaultValues: {
      email: "",
      password: "",
      type: "restaurant",
    },
  });

  // Restaurant Register Form
  const restaurantRegisterForm = useForm<RestaurantRegisterForm>({
    resolver: zodResolver(restaurantRegisterSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
      type: "restaurant",
      phone: "",
      address: "",
      description: "",
      cuisine: "",
    },
  });

  const handleSubmit = async (
    data:
      | UserLoginForm
      | UserRegisterForm
      | RestaurantLoginForm
      | RestaurantRegisterForm
  ) => {
    setLoading(true);
    setError("");

    try {
      const endpoint =
        authMode === "login" ? "/api/auth/login" : "/api/auth/register";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Authentication failed");
      }

      // Use the auth context login function
      login(result.token, result.account, result.type);

      // Redirect to home page
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const resetForms = () => {
    userLoginForm.reset();
    userRegisterForm.reset();
    restaurantLoginForm.reset();
    restaurantRegisterForm.reset();
    setError("");
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {authMode === "login" ? "Welcome back" : "Create an account"}
          </CardTitle>
          <CardDescription className="text-center">
            {authMode === "login"
              ? "Sign in to your account to continue"
              : "Sign up as a user or restaurant"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            value={userType}
            onValueChange={(value) => {
              setUserType(value as "user" | "restaurant");
              resetForms();
            }}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="user" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                User
              </TabsTrigger>
              <TabsTrigger
                value="restaurant"
                className="flex items-center gap-2"
              >
                <Store className="w-4 h-4" />
                Restaurant
              </TabsTrigger>
            </TabsList>

            {/* User Forms */}
            <TabsContent value="user" className="mt-6">
              {authMode === "login" ? (
                <Form {...userLoginForm}>
                  <form
                    onSubmit={userLoginForm.handleSubmit(handleSubmit)}
                    className="space-y-4"
                  >
                    <FormField
                      control={userLoginForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                placeholder="Enter your email"
                                className="pl-10"
                                type="email"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={userLoginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                placeholder="Enter your password"
                                className="pl-10"
                                type="password"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {error && (
                      <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                        {error}
                      </div>
                    )}

                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>
                </Form>
              ) : (
                <Form {...userRegisterForm}>
                  <form
                    onSubmit={userRegisterForm.handleSubmit(handleSubmit)}
                    className="space-y-4"
                  >
                    <FormField
                      control={userRegisterForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter your full name"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={userRegisterForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                placeholder="Enter your email"
                                className="pl-10"
                                type="email"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={userRegisterForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                placeholder="Enter your password"
                                className="pl-10"
                                type="password"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={userRegisterForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                placeholder="Enter your phone number"
                                className="pl-10"
                                type="tel"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={userRegisterForm.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address (Optional)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                placeholder="Enter your address"
                                className="pl-10"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {error && (
                      <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                        {error}
                      </div>
                    )}

                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Creating account..." : "Sign Up"}
                    </Button>
                  </form>
                </Form>
              )}
            </TabsContent>

            {/* Restaurant Forms */}
            <TabsContent value="restaurant" className="mt-6">
              {authMode === "login" ? (
                <Form {...restaurantLoginForm}>
                  <form
                    onSubmit={restaurantLoginForm.handleSubmit(handleSubmit)}
                    className="space-y-4"
                  >
                    <FormField
                      control={restaurantLoginForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                placeholder="Enter restaurant email"
                                className="pl-10"
                                type="email"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={restaurantLoginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                placeholder="Enter password"
                                className="pl-10"
                                type="password"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {error && (
                      <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                        {error}
                      </div>
                    )}

                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>
                </Form>
              ) : (
                <Form {...restaurantRegisterForm}>
                  <form
                    onSubmit={restaurantRegisterForm.handleSubmit(handleSubmit)}
                    className="space-y-4"
                  >
                    <FormField
                      control={restaurantRegisterForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Restaurant Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter restaurant name"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={restaurantRegisterForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                placeholder="Enter restaurant email"
                                className="pl-10"
                                type="email"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={restaurantRegisterForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                placeholder="Enter password"
                                className="pl-10"
                                type="password"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={restaurantRegisterForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                placeholder="Enter restaurant phone"
                                className="pl-10"
                                type="tel"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={restaurantRegisterForm.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address (Optional)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                placeholder="Enter restaurant address"
                                className="pl-10"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={restaurantRegisterForm.control}
                      name="cuisine"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cuisine Type (Optional)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <ChefHat className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                placeholder="e.g., Italian, Chinese, Indian"
                                className="pl-10"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={restaurantRegisterForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description (Optional)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                placeholder="Brief description of your restaurant"
                                className="pl-10"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {error && (
                      <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                        {error}
                      </div>
                    )}

                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Creating account..." : "Sign Up"}
                    </Button>
                  </form>
                </Form>
              )}
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              {authMode === "login"
                ? "Don't have an account?"
                : "Already have an account?"}
            </p>
            <Button
              variant="link"
              onClick={() => {
                setAuthMode(authMode === "login" ? "register" : "login");
                resetForms();
              }}
              className="p-0 h-auto font-normal"
            >
              {authMode === "login" ? "Sign up here" : "Sign in instead"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
