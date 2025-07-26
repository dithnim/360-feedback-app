import React, { useState } from "react";
import { login, registerClient } from "../../lib/apiService";
import type { LoginData, ClientRegistrationData } from "../../lib/apiService";
import { useUser } from "../../context/UserContext";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

interface AuthServiceProps {
  onSuccess?: () => void;
}

export const AuthService: React.FC<AuthServiceProps> = ({ onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setUser } = useUser();

  // Login form state
  const [loginData, setLoginData] = useState<LoginData>({
    username: "",
    password: "",
  });

  // Registration form state
  const [registrationData, setRegistrationData] =
    useState<ClientRegistrationData>({
      email: "",
      username: "",
      passwordHash: "",
      role: "user",
      clientId: "",
      attributes: [],
      isActive: true,
    });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log("🔐 Attempting login...");
      const response = await login(loginData);

      if (response.status === "success") {
        localStorage.setItem("token", response.data);
        console.log("✅ Login successful, token stored");

        // You might want to decode the JWT token to get user info
        // For now, we'll set a basic user object
        setUser({
          id: loginData.username,
          name: loginData.username,
          email: "", // Would come from JWT token
        });

        onSuccess?.();
      } else {
        setError("Login failed");
      }
    } catch (err: any) {
      console.error("❌ Login error:", err);
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log("📝 Attempting registration...");
      const response = await registerClient(registrationData);
      console.log("✅ Registration successful:", response);

      // Auto-login after successful registration
      await handleAutoLogin();
    } catch (err: any) {
      console.error("❌ Registration error:", err);
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleAutoLogin = async () => {
    try {
      const loginResponse = await login({
        username: registrationData.username,
        password: registrationData.passwordHash,
      });

      if (loginResponse.status === "success") {
        localStorage.setItem("token", loginResponse.data);
        setUser({
          id: registrationData.username,
          name: registrationData.username,
          email: registrationData.email,
        });
        onSuccess?.();
      }
    } catch (err) {
      console.error("Auto-login failed:", err);
    }
  };

  const addAttribute = () => {
    setRegistrationData((prev) => ({
      ...prev,
      attributes: [...(prev.attributes || []), { key: "", value: "" }],
    }));
  };

  const updateAttribute = (
    index: number,
    field: "key" | "value",
    value: string
  ) => {
    setRegistrationData((prev) => ({
      ...prev,
      attributes:
        prev.attributes?.map((attr, i) =>
          i === index ? { ...attr, [field]: value } : attr
        ) || [],
    }));
  };

  const removeAttribute = (index: number) => {
    setRegistrationData((prev) => ({
      ...prev,
      attributes: prev.attributes?.filter((_, i) => i !== index) || [],
    }));
  };

  return (
    <Card className="max-w-md mx-auto p-6">
      <div className="mb-6">
        <div className="flex space-x-2">
          <Button
            type="button"
            variant={isLogin ? "default" : "black"}
            onClick={() => setIsLogin(true)}
          >
            Login
          </Button>
          <Button
            type="button"
            variant={!isLogin ? "default" : "black"}
            onClick={() => setIsLogin(false)}
          >
            Register
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {isLogin ? (
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Username</label>
            <input
              type="text"
              required
              className="w-full border rounded px-3 py-2"
              value={loginData.username}
              onChange={(e) =>
                setLoginData((prev) => ({ ...prev, username: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              required
              className="w-full border rounded px-3 py-2"
              value={loginData.password}
              onChange={(e) =>
                setLoginData((prev) => ({ ...prev, password: e.target.value }))
              }
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email *</label>
            <input
              type="email"
              required
              className="w-full border rounded px-3 py-2"
              value={registrationData.email}
              onChange={(e) =>
                setRegistrationData((prev) => ({
                  ...prev,
                  email: e.target.value,
                }))
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Username *</label>
            <input
              type="text"
              required
              className="w-full border rounded px-3 py-2"
              value={registrationData.username}
              onChange={(e) =>
                setRegistrationData((prev) => ({
                  ...prev,
                  username: e.target.value,
                }))
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password *</label>
            <input
              type="password"
              required
              className="w-full border rounded px-3 py-2"
              value={registrationData.passwordHash}
              onChange={(e) =>
                setRegistrationData((prev) => ({
                  ...prev,
                  passwordHash: e.target.value,
                }))
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Role *</label>
            <select
              required
              className="w-full border rounded px-3 py-2"
              value={registrationData.role}
              onChange={(e) =>
                setRegistrationData((prev) => ({
                  ...prev,
                  role: e.target.value,
                }))
              }
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Client ID</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              value={registrationData.clientId}
              onChange={(e) =>
                setRegistrationData((prev) => ({
                  ...prev,
                  clientId: e.target.value,
                }))
              }
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium">Attributes</label>
              <Button type="button" onClick={addAttribute} size="sm">
                Add Attribute
              </Button>
            </div>
            {registrationData.attributes?.map((attr, index) => (
              <div key={index} className="flex space-x-2 mb-2">
                <input
                  type="text"
                  placeholder="Key"
                  className="flex-1 border rounded px-3 py-2"
                  value={attr.key}
                  onChange={(e) =>
                    updateAttribute(index, "key", e.target.value)
                  }
                />
                <input
                  type="text"
                  placeholder="Value"
                  className="flex-1 border rounded px-3 py-2"
                  value={attr.value}
                  onChange={(e) =>
                    updateAttribute(index, "value", e.target.value)
                  }
                />
                <Button
                  type="button"
                  variant="delete"
                  size="sm"
                  onClick={() => removeAttribute(index)}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={registrationData.isActive}
              onChange={(e) =>
                setRegistrationData((prev) => ({
                  ...prev,
                  isActive: e.target.checked,
                }))
              }
              className="mr-2"
            />
            <label htmlFor="isActive" className="text-sm font-medium">
              Active Account
            </label>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Registering..." : "Register"}
          </Button>
        </form>
      )}
    </Card>
  );
};
