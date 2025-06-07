
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await signIn(email, password);
    
    if (error) {
      toast({
        title: "Error signing in",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "You have been signed in successfully!",
      });
      navigate('/');
    }
    
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await signUp(email, password, fullName);
    
    if (error) {
      toast({
        title: "Error signing up",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Please check your email to confirm your account!",
      });
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-900 border-gray-700 shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-white">Welcome</CardTitle>
          <CardDescription className="text-gray-300">
            Sign in to your account or create a new one
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-800 border-gray-700">
              <TabsTrigger 
                value="signin" 
                className="text-gray-300 data-[state=active]:text-white data-[state=active]:bg-gray-700 hover:text-white transition-colors"
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger 
                value="signup" 
                className="text-gray-300 data-[state=active]:text-white data-[state=active]:bg-gray-700 hover:text-white transition-colors"
              >
                Sign Up
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-6 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-200 font-medium">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-gray-500 focus:ring-gray-500 transition-colors"
                    placeholder="Enter your email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-200 font-medium">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-gray-500 focus:ring-gray-500 transition-colors"
                    placeholder="Enter your password"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gray-700 text-white hover:bg-blue-600 transition-all duration-300 font-medium py-3 transform hover:scale-[1.02] active:scale-[0.98]"
                  disabled={loading}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-6 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-gray-200 font-medium">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-gray-500 focus:ring-gray-500 transition-colors"
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-gray-200 font-medium">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-gray-500 focus:ring-gray-500 transition-colors"
                    placeholder="Enter your email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-gray-200 font-medium">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-gray-500 focus:ring-gray-500 transition-colors"
                    placeholder="Create a password"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gray-700 text-white hover:bg-blue-600 transition-all duration-300 font-medium py-3 transform hover:scale-[1.02] active:scale-[0.98]"
                  disabled={loading}
                >
                  {loading ? 'Signing up...' : 'Sign Up'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
