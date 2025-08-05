"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  address?: string;
}

interface Restaurant {
  id: string;
  email: string;
  name: string;
  description?: string;
  phone?: string;
  address?: string;
  cuisine?: string;
  rating?: number;
}

interface AuthContextType {
  user: User | null;
  restaurant: Restaurant | null;
  userType: "user" | "restaurant" | null;
  token: string | null;
  login: (
    token: string,
    userData: User | Restaurant,
    type: "user" | "restaurant"
  ) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [userType, setUserType] = useState<"user" | "restaurant" | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for stored authentication data on mount
    console.log("AuthContext: Initializing...");
    const storedToken = localStorage.getItem("token");
    const storedUserType = localStorage.getItem("userType") as
      | "user"
      | "restaurant"
      | null;
    const storedUser = localStorage.getItem("user");

    console.log("AuthContext: Stored token:", storedToken ? "exists" : "none");
    console.log("AuthContext: Stored userType:", storedUserType);
    console.log("AuthContext: Stored user:", storedUser ? "exists" : "none");

    if (storedToken && storedUserType && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        console.log("AuthContext: Parsed user data:", userData);
        setToken(storedToken);
        setUserType(storedUserType);

        if (storedUserType === "user") {
          setUser(userData);
          console.log("AuthContext: Set user data:", userData);
        } else {
          setRestaurant(userData);
          console.log("AuthContext: Set restaurant data:", userData);
        }
      } catch (error) {
        console.error("Error parsing stored user data:", error);
        logout();
      }
    } else {
      console.log("AuthContext: No stored auth data found");
      console.log("AuthContext: storedToken:", storedToken ? "exists" : "none");
      console.log("AuthContext: storedUserType:", storedUserType);
      console.log("AuthContext: storedUser:", storedUser ? "exists" : "none");
    }

    setLoading(false);
    console.log("AuthContext: Loading complete");
  }, []);

  const login = (
    newToken: string,
    userData: User | Restaurant,
    type: "user" | "restaurant"
  ) => {
    setToken(newToken);
    setUserType(type);

    if (type === "user") {
      setUser(userData as User);
      setRestaurant(null);
    } else {
      setRestaurant(userData as Restaurant);
      setUser(null);
    }

    // Store in localStorage
    localStorage.setItem("token", newToken);
    localStorage.setItem("userType", type);
    localStorage.setItem("user", JSON.stringify(userData));

    // Also set as cookie for server-side access
    document.cookie = `token=${newToken}; path=/; max-age=${
      7 * 24 * 60 * 60
    }; SameSite=lax`;

    console.log("AuthContext: Login successful, token stored");
  };

  const logout = async () => {
    setUser(null);
    setRestaurant(null);
    setUserType(null);
    setToken(null);

    localStorage.removeItem("token");
    localStorage.removeItem("userType");
    localStorage.removeItem("user");

    // Clear cookie via API
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Error calling logout API:", error);
    }

    // Also clear client-side cookie
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";

    console.log("AuthContext: Logout successful");
    router.push("/auth");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        restaurant,
        userType,
        token,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
