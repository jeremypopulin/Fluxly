import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { User, Lock } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import Logo from './Logo';
import { useAuth } from '@/contexts/AuthContext';

interface LoginFormProps {
  onLogin: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const success = await login(email, password);

      if (success) {
        toast({ title: 'Login successful', description: 'Welcome back!' });
        onLogin();
      } else {
        toast({
          title: 'Login failed',
          description: 'Invalid credentials. Please check your email and password.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Login failed',
        description: 'Database error. Please check your connection.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1F3A] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
      <Card className="w-full max-w-sm sm:max-w-md shadow-lg mx-2 bg-[#0B1F3A] border-gray-600">
        <CardHeader className="text-center">
          {/* ⚠️ Fluxly logo remains unchanged */}
          <div className="mx-auto mb-4">
            <Logo size="2xl" className="justify-center" />
          </div>
          <CardDescription className="text-gray-200">
            Sign in to manage your team's schedule
          </CardDescription>
        </CardHeader>

        <CardContent className="px-4 sm:px-6">
          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-200">Email</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-white"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-200">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-white"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full py-3 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          {/* Footer credit with local image in /public */}
          <div className="mt-6 text-center">
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-300">
              <span>Developed by Choccy Bear</span>
              <img
                src="/choccy-bear.png"
                alt="Choccy Bear Logo"
                className="h-6 w-6 rounded-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;
