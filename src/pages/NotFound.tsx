import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Home, ArrowLeft, Search, Compass } from "lucide-react";

const NotFound: React.FC = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleGoHome = () => {
    navigate("/");
  };

  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 overflow-hidden relative">
      {/* Animated background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Large floating shapes */}
        <div className="absolute top-16 left-8 w-40 h-40 bg-gradient-to-br from-[#ee3f40] via-[#ed3f41] to-[#d53739] rounded-full opacity-10 animate-float-slow blur-sm"></div>
        <div className="absolute bottom-24 right-12 w-32 h-32 bg-gradient-to-tl from-[#ed3f41] via-[#ee3f40] to-[#f54547] rounded-full opacity-8 animate-float-reverse blur-sm"></div>
        <div className="absolute top-1/2 left-1/6 w-24 h-24 bg-gradient-to-tr from-[#656464] via-[#333] to-[#2b2c2c] rounded-full opacity-6 animate-float-diagonal blur-sm"></div>
        <div className="absolute top-32 right-1/4 w-16 h-16 bg-gradient-to-bl from-[#ee3f40] via-[#a10000] to-[#8b0000] rounded-full opacity-5 animate-float-gentle blur-sm"></div>
        <div className="absolute bottom-1/3 left-12 w-12 h-12 bg-gradient-to-tr from-[#ed3f41] to-[#656464] rounded-full opacity-4 animate-float-subtle blur-sm"></div>
        <div className="absolute top-1/4 right-8 w-20 h-20 bg-gradient-to-r from-[#ed3f41] to-transparent rounded-full opacity-6 animate-morph-shape blur-sm"></div>

        {/* Additional scattered elements */}
        <div className="absolute top-3/4 left-1/3 w-6 h-6 bg-[#ed3f41] rounded-full opacity-20 animate-bounce-slow"></div>
        <div className="absolute bottom-1/5 right-1/3 w-8 h-8 bg-gradient-to-r from-[#ee3f40] to-[#ed3f41] rounded-full opacity-12 animate-spin-slow"></div>
      </div>

      {/* Main Content */}
      <div
        className={`relative z-10 min-h-screen flex items-center justify-center px-4 transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
      >
        <div className="text-center max-w-2xl mx-auto">
          {/* 404 Number with animation */}
          <div className="relative mb-8">
            <h1 className="text-9xl md:text-[12rem] font-bold text-transparent bg-gradient-to-r from-[#ed3f41] via-[#ee3f40] to-[#f54547] bg-clip-text animate-pulse-gradient select-none">
              404
            </h1>
            {/* Glowing effect */}
            <div className="absolute inset-0 text-9xl md:text-[12rem] font-bold text-[#ed3f41] opacity-20 blur-sm animate-glow">
              404
            </div>
          </div>

          {/* Error message */}
          <div className="mb-8 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-[#333] mb-4 animate-fade-in-up">
              Oops! Page Not Found
            </h2>
            <p className="text-lg text-[#656464] leading-relaxed animate-fade-in-up-delay">
              The page you're looking for seems to have wandered off into the
              digital wilderness. Don't worry, even the best explorers sometimes
              take a wrong turn!
            </p>
          </div>

          {/* Animated icon */}
          <div className="mb-10 flex justify-center">
            <div className="relative">
              <Compass className="w-16 h-16 text-[#ed3f41] animate-spin-compass" />
              <div className="absolute inset-0 w-16 h-16 border-2 border-[#ed3f41] border-opacity-30 rounded-full animate-ping"></div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={handleGoHome}
              className="group bg-gradient-to-r from-[#ee3f40] to-[#ed3f41] hover:from-[#d53739] hover:to-[#d53739] text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#ee3f40] focus:ring-opacity-50 animate-bounce-in"
            >
              <div className="flex items-center space-x-2">
                <Home className="w-5 h-5" />
                <span>Go Home</span>
              </div>
            </button>

            <button
              onClick={handleGoBack}
              className="group bg-white hover:bg-gray-50 text-[#ed3f41] font-semibold py-3 px-8 rounded-lg border-2 border-[#ed3f41] transition-all duration-300 transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#ee3f40] focus:ring-opacity-50 animate-bounce-in-delay"
            >
              <div className="flex items-center space-x-2">
                <ArrowLeft className="w-5 h-5 group-hover:animate-bounce-left" />
                <span>Go Back</span>
              </div>
            </button>
          </div>

          {/* Helpful suggestions */}
          <div className="mt-12 p-6 bg-white bg-opacity-70 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-lg animate-fade-in-up-delayed">
            <h3 className="text-xl font-semibold text-[#333] mb-4 flex items-center justify-center">
              <Search className="w-5 h-5 mr-2 text-[#ed3f41]" />
              What you can do:
            </h3>
            <ul className="text-[#656464] space-y-2 text-left max-w-md mx-auto">
              <li className="flex items-start">
                <span className="text-[#ed3f41] mr-2">•</span>
                Check if the URL is spelled correctly
              </li>
              <li className="flex items-start">
                <span className="text-[#ed3f41] mr-2">•</span>
                Return to the homepage and navigate from there
              </li>
              <li className="flex items-start">
                <span className="text-[#ed3f41] mr-2">•</span>
                Use the back button to return to the previous page
              </li>
              <li className="flex items-start">
                <span className="text-[#ed3f41] mr-2">•</span>
                Contact support if you think this is an error
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Custom animations */}
      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
          25% { transform: translateY(-20px) translateX(10px) rotate(5deg); }
          50% { transform: translateY(-10px) translateX(-5px) rotate(-3deg); }
          75% { transform: translateY(-15px) translateX(8px) rotate(2deg); }
        }
        
        @keyframes float-reverse {
          0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
          25% { transform: translateY(15px) translateX(-8px) rotate(-4deg); }
          50% { transform: translateY(8px) translateX(12px) rotate(6deg); }
          75% { transform: translateY(20px) translateX(-6px) rotate(-2deg); }
        }
        
        @keyframes float-diagonal {
          0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
          50% { transform: translateY(-25px) translateX(25px) rotate(10deg); }
        }
        
        @keyframes float-gentle {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-12px) scale(1.05); }
        }
        
        @keyframes float-subtle {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          33% { transform: translateY(-8px) translateX(5px); }
          66% { transform: translateY(5px) translateX(-3px); }
        }
        
        @keyframes morph-shape {
          0%, 100% { 
            transform: scale(1) rotate(0deg);
            border-radius: 50%; 
          }
          25% { 
            transform: scale(1.1) rotate(90deg);
            border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%; 
          }
          50% { 
            transform: scale(0.9) rotate(180deg);
            border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%; 
          }
          75% { 
            transform: scale(1.05) rotate(270deg);
            border-radius: 30% 70% 30% 70% / 70% 30% 70% 30%; 
          }
        }

        @keyframes pulse-gradient {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        @keyframes glow {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(1.02); }
        }

        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes spin-compass {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes bounce-in {
          0% { opacity: 0; transform: scale(0.3) translateY(100px); }
          50% { opacity: 1; transform: scale(1.05) translateY(-10px); }
          70% { transform: scale(0.95) translateY(5px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }

        @keyframes bounce-left {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(-5px); }
        }

        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        @keyframes pulse-slow {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.2); }
        }

        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
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

        .animate-pulse-gradient {
          animation: pulse-gradient 3s ease-in-out infinite;
        }

        .animate-glow {
          animation: glow 4s ease-in-out infinite;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
        }

        .animate-fade-in-up-delay {
          animation: fade-in-up 0.8s ease-out 0.2s both;
        }

        .animate-fade-in-up-delayed {
          animation: fade-in-up 0.8s ease-out 0.4s both;
        }

        .animate-spin-compass {
          animation: spin-compass 20s linear infinite;
        }

        .animate-bounce-in {
          animation: bounce-in 1s ease-out;
        }

        .animate-bounce-in-delay {
          animation: bounce-in 1s ease-out 0.2s both;
        }

        .animate-bounce-left {
          animation: bounce-left 0.6s ease-in-out;
        }

        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }

        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default NotFound;
