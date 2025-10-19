"use client";

import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { ImageWithFallback } from "../../components/figma/ImageWithFallback";
import { Lock, User, Eye, EyeOff } from "lucide-react";
import { login, isAuthenticated } from "../../utils/auth";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated()) {
      router.push('/admin');
    }
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate form
    if (!formData.username || !formData.password) {
      toast.error("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    // Simulate loading time
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Attempt login
    const success = login(formData.username, formData.password);
    console.log('success: ', success)
    if (success) {
      toast.success("Login successful! Redirecting to admin panel...");
      setTimeout(() => {
        router.push('/admin');
      }, 500);
    } else {
      toast.error("Invalid credentials. Please try again.");
      setFormData(prev => ({ ...prev, password: "" }));
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Background Pattern */ }
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={ {
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        } } />
      </div>

      <div className="relative z-10 max-w-md">
        {/* Header with Logo */ }
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-3 mb-6 hover:opacity-80 transition-opacity">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1677767274825-a6b2829dcffd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHhvbGl2ZSUyMHRyZWUlMjBsb2dvJTIwbWluaW1hbGlzdHxlbnwxfHx8fDE3NTcyMTE0OTl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="TuniOlive Logo"
              className="h-12 w-12 rounded-full object-cover"
            />
            <span className="text-2xl font-bold text-foreground">TuniOlive</span>
          </Link>
          <h1 className="text-3xl mb-2">Admin Login</h1>
          <p className="text-muted-foreground">
            Sign in to access the admin panel
          </p>
        </div>

        {/* Login Form */ }
        <Card className="shadow-lg">
          <CardHeader className="text-center pb-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <Lock className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle>Secure Access</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={ handleSubmit } className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    value={ formData.username }
                    onChange={ handleInputChange }
                    placeholder="Enter your username"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type={ showPassword ? "text" : "password" }
                    value={ formData.password }
                    onChange={ handleInputChange }
                    placeholder="Enter your password"
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={ () => setShowPassword(!showPassword) }
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    { showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    ) }
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={ isLoading }
              >
                { isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </div>
                ) : (
                  "Sign In"
                ) }
              </Button>
            </form>

            {/* Demo Credentials */ }
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <h4 className="text-sm font-medium mb-2">Demo Credentials:</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <p><strong>Username:</strong> admin</p>
                <p><strong>Password:</strong> olive123</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back to Home */ }
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-green-600 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}