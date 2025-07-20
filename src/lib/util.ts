import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { jwtDecode } from "jwt-decode";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Utility function to check if a token is expired
export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return (decoded as any).exp ? (decoded as any).exp < currentTime : false;
  } catch (error) {
    console.error("Error decoding token:", error);
    return true; // Consider invalid tokens as expired
  }
};

// Utility function to get token expiration time
export const getTokenExpiration = (token: string): number | null => {
  try {
    const decoded = jwtDecode(token);
    return (decoded as any).exp || null;
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
    const decoded = jwtDecode(token);
    const userData = {
      id: (decoded as any).id,
      name: (decoded as any).sub,
      email: (decoded as any).email,
      exp: (decoded as any).exp,
      role: (decoded as any).role,
    };
    return userData;
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};
