import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiPost } from "../lib/apiService";
import { useUser } from "../context/UserContext";
import { getUserFromToken, storeUserData } from "../lib/util";
import Loader from "../components/ui/loader";
import dashLogo from "../../imgs/dash-logo.png";


interface AuthResponse {
  data: string;
  token?: string;
  access_token?: string;
}

const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { setUser, isAuthenticated, isLoading } = useUser();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f5f5f5] to-[#e8e8e8]">
        <div className="text-center">
          <Loader text="Loading..." />
          <p className="mt-4 text-[#656464]">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't show login form if already authenticated
  if (isAuthenticated) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await apiPost<AuthResponse>("/auth", {
        username,
        password,
      });

      // Handle different possible response formats
      let token = "";
      if (typeof response === "string") {
        token = response;
      } else if (response.token) {
        token = response.token;
      } else if (response.access_token) {
        token = response.access_token;
      } else if (response.data) {
        token = response.data;
      }

      if (!token) {
        throw new Error("No token received from server");
      }

      // Decode JWT and extract user data
      const userData = getUserFromToken(token);
      if (!userData) {
        throw new Error("Invalid token format or unable to decode user data");
      }

      // Store token and user data in localStorage using utility function
      const storedUserData = storeUserData(userData, token);
      if (!storedUserData) {
        throw new Error("Failed to store user data");
      }

      // Update user context
      setUser(userData);

      console.log("Login successful:", {
        userId: userData.id,
        userName: userData.name,
        userEmail: userData.email,
      });

      // Let the useEffect handle navigation when isAuthenticated becomes true
    } catch (error) {
      console.error("Login error:", error);
      setError(
        error instanceof Error && error.message.includes("token")
          ? "Invalid response from server. Please try again."
          : "Login failed. Please check your credentials."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f5f5f5] to-[#e8e8e8] relative overflow-hidden">
      {/* Animated background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full">
        {/* Large floating gradient orb - top left */}
        <div className="absolute top-16 left-8 w-40 h-40 bg-gradient-to-br from-[#ee3f40] via-[#ed3f41] to-[#d53739] rounded-full opacity-15 animate-float-slow blur-sm"></div>

        {/* Medium floating gradient orb - bottom right */}
        <div className="absolute bottom-24 right-12 w-32 h-32 bg-gradient-to-tl from-[#3848ab] via-[#4c5bc7] to-[#5d6dd8] rounded-full opacity-12 animate-float-reverse blur-sm"></div>

        {/* Small floating gradient orb - middle left */}
        <div className="absolute top-1/2 left-1/6 w-24 h-24 bg-gradient-to-tr from-[#008a24] via-[#00a100] to-[#10b810] rounded-full opacity-10 animate-float-diagonal blur-sm"></div>

        {/* Extra small accent orb - top right */}
        <div className="absolute top-32 right-1/4 w-16 h-16 bg-gradient-to-bl from-[#ee3f40] via-[#a10000] to-[#8b0000] rounded-full opacity-8 animate-float-gentle blur-sm"></div>

        {/* Tiny accent orb - bottom left */}
        <div className="absolute bottom-1/3 left-12 w-12 h-12 bg-gradient-to-tr from-[#3848ab] to-[#656464] rounded-full opacity-6 animate-float-subtle blur-sm"></div>

        {/* Morphing shapes */}
        <div className="absolute top-1/4 right-8 w-20 h-20 bg-gradient-to-r from-[#ed3f41] to-transparent rounded-full opacity-8 animate-morph-shape blur-sm"></div>
      </div>

      {/* Add custom animations */}
      <style>{`
        @keyframes float-slow {
          0%, 100% { 
            transform: translateY(0px) translateX(0px) rotate(0deg); 
          }
          25% { 
            transform: translateY(-20px) translateX(10px) rotate(90deg); 
          }
          50% { 
            transform: translateY(-10px) translateX(20px) rotate(180deg); 
          }
          75% { 
            transform: translateY(-30px) translateX(5px) rotate(270deg); 
          }
        }
        
        @keyframes float-reverse {
          0%, 100% { 
            transform: translateY(0px) translateX(0px) rotate(360deg); 
          }
          33% { 
            transform: translateY(15px) translateX(-15px) rotate(240deg); 
          }
          66% { 
            transform: translateY(-5px) translateX(-25px) rotate(120deg); 
          }
        }
        
        @keyframes float-diagonal {
          0%, 100% { 
            transform: translateY(0px) translateX(0px) scale(1); 
          }
          50% { 
            transform: translateY(-15px) translateX(15px) scale(1.1); 
          }
        }
        
        @keyframes float-gentle {
          0%, 100% { 
            transform: translateY(0px) rotate(0deg) scale(1); 
          }
          50% { 
            transform: translateY(-8px) rotate(180deg) scale(0.9); 
          }
        }
        
        @keyframes float-subtle {
          0%, 100% { 
            transform: translateY(0px) translateX(0px); 
            opacity: 0.06; 
          }
          50% { 
            transform: translateY(-5px) translateX(5px); 
            opacity: 0.12; 
          }
        }
        
        @keyframes morph-shape {
          0%, 100% { 
            transform: rotate(0deg) scale(1); 
            border-radius: 50%; 
          }
          25% { 
            transform: rotate(90deg) scale(1.2); 
            border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%; 
          }
          50% { 
            transform: rotate(180deg) scale(0.8); 
            border-radius: 70% 30% 30% 70% / 70% 70% 30% 30%; 
          }
          75% { 
            transform: rotate(270deg) scale(1.1); 
            border-radius: 30% 70% 30% 70% / 70% 30% 70% 30%; 
          }
        }
        
        .animate-float-slow {
          animation: float-slow 8s ease-in-out infinite;
        }
        
        .animate-float-reverse {
          animation: float-reverse 10s ease-in-out infinite;
        }
        
        .animate-float-diagonal {
          animation: float-diagonal 6s ease-in-out infinite;
        }
        
        .animate-float-gentle {
          animation: float-gentle 7s ease-in-out infinite;
        }
        
        .animate-float-subtle {
          animation: float-subtle 9s ease-in-out infinite;
        }
        
        .animate-morph-shape {
          animation: morph-shape 12s ease-in-out infinite;
        }
      `}</style>

      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Logo and branding */}
        <div className="text-center mb-8">
          <img
            src={dashLogo}
            alt="TalentBoozt Logo"
            className="w-64 h-auto mx-auto mb-6 drop-shadow-lg"
          />
          <h1 className="text-3xl font-bold text-[#333] mb-2">Welcome Back</h1>
          <p className="text-[#656464] text-lg">
            Sign in to your 360° Feedback Dashboard
          </p>
        </div>

        {/* Login form */}
        <div className="bg-white p-8 rounded-2xl shadow-2xl border border-gray-200 backdrop-blur-sm">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-[#a10000] text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="username"
                className="block text-[#333] text-sm font-semibold mb-2"
              >
                Username
              </label>
              <input
                type="text"
                id="username"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#ee3f40] focus:ring-2 focus:ring-[#ee3f40] focus:ring-opacity-20 transition-all duration-200 text-[#333] placeholder-gray-400"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-[#333] text-sm font-semibold mb-2"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#ee3f40] focus:ring-2 focus:ring-[#ee3f40] focus:ring-opacity-20 transition-all duration-200 text-[#333] placeholder-gray-400"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-[#ee3f40] to-[#ed3f41] hover:from-[#d53739] hover:to-[#d53739] text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ee3f40] focus:ring-opacity-50 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing In...</span>
                </div>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Additional features */}
          <div className="mt-6 text-center">
            <p className="text-[#656464] text-sm">
              Forgot your password?{" "}
              <button className="text-[#ee3f40] hover:text-[#d53739] font-medium transition-colors duration-200">
                Reset it here
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-[#656464] text-sm">
            © 2025 TalentBoozt. Empowering growth through feedback.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
