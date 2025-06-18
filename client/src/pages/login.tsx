import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Car } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface LoginData {
  username: string;
  password: string;
}

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<LoginData>({
    username: "",
    password: "",
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Login failed");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Welcome back!",
        description: "You have been successfully logged in.",
      });
      // Invalidate user query to fetch updated user data
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md bg-dark-card border-gray-800">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-primary to-blue-500 rounded-xl flex items-center justify-center">
              <Car className="w-6 h-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center text-white">Welcome to FoCar</CardTitle>
          <CardDescription className="text-center text-gray-400">
            Sign in to access your automotive management platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="username" className="text-gray-300">Username</Label>
              <Input
                id="username"
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
                className="mt-1 bg-dark-elevated border-gray-700 text-white"
                placeholder="Enter your username"
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-gray-300">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                className="mt-1 bg-dark-elevated border-gray-700 text-white"
                placeholder="Enter your password"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-purple-primary hover:bg-purple-dark text-white" 
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "Signing in..." : "Sign in"}
            </Button>
          </form>
          
          {/* Demo credentials info */}
          <div className="mt-6 p-4 bg-dark-elevated rounded-lg border border-gray-700">
            <p className="text-xs text-gray-400 mb-2">Demo Credentials:</p>
            <div className="space-y-1 text-xs">
              <p className="text-gray-300">Super Admin: <span className="text-purple-primary">superadmin / password</span></p>
              <p className="text-gray-300">Admin: <span className="text-purple-primary">admin / password</span></p>
              <p className="text-gray-300">User: <span className="text-purple-primary">user / password</span></p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}