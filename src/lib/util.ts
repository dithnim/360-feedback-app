import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { jwtDecode } from "jwt-decode";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Utility function to check if a token is expired
export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwtDecode<{ exp?: number }>(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp ? decoded.exp < currentTime : true;
  } catch (error) {
    console.error("Error decoding token:", error);
    return true; // Consider invalid tokens as expired
  }
};

// Utility function to get token expiration time
export const getTokenExpiration = (token: string): number | null => {
  try {
    const decoded = jwtDecode<{ exp?: number }>(token);
    return decoded.exp || null;
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

// Utility function to clear authentication data
export const clearAuthData = () => {
  localStorage.removeItem("token");
  sessionStorage.removeItem("token"); // Clean up any old sessionStorage tokens
};

// Utility function to get user data from token
export const getUserFromToken = (token: string) => {
  try {
    interface DecodedToken {
      id?: string;
      sub?: string;
      email?: string;
      exp?: number;
      role?: string;
    }

    const decoded = jwtDecode<DecodedToken>(token);
    const userData = {
      id: decoded.id || "",
      name: decoded.sub || "",
      email: decoded.email || "",
      exp: decoded.exp,
      role: decoded.role || "",
    };
    return userData;
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};
