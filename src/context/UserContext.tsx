import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import {
  isTokenExpired,
  getUserFromToken,
  clearAuthData,
  getStoredUserData,
} from "../lib/util";

// Define the shape of user data (customize as needed)
export interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
  exp?: number;
  [key: string]: any;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  clearUser: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Custom setUser function that updates both user and authentication state
  const setUser = (userData: User | null) => {
    setUserState(userData);
    const newAuthState = !!userData;
    setIsAuthenticated(newAuthState);
  };

  // Initialize user from localStorage on app start
  useEffect(() => {
    const initializeAuth = () => {
      const token = localStorage.getItem("token");
      const storedUserData = getStoredUserData();

      if (token) {
        // Check if token is expired
        if (isTokenExpired(token)) {
          clearAuthData();
          setUser(null);
        } else {
          // Token is valid, get user data
          let userData = getUserFromToken(token);

          // If we have stored user data, merge it with JWT data
          if (storedUserData && userData) {
            userData = {
              ...userData,
              ...storedUserData,
              // JWT data takes precedence for security-critical fields
              id: userData.id,
              email: userData.email,
            };
          }

          if (userData) {
            setUser(userData);
            console.log("User authenticated from stored token:", {
              userId: userData.id,
              userName: userData.name,
              userEmail: userData.email,
            });
          } else {
            clearAuthData();
            setUser(null);
          }
        }
      } else {
        // No token, clean up any stored user data
        clearAuthData();
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const clearUser = () => {
    clearAuthData();
    setUser(null);
    console.log("User logged out and data cleared");
  };

  return (
    <UserContext.Provider
      value={{ user, setUser, clearUser, isAuthenticated, isLoading }}
    >
      {children}
    </UserContext.Provider>
  );
};

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
