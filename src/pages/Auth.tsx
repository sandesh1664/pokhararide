import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Car, Mail, Lock, User, Truck } from 'lucide-react';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');
const nameSchema = z.string().min(2, 'Name must be at least 2 characters');
const vehicleSchema = z.object({
  make: z.string().min(1, 'Vehicle make is required'),
  model: z.string().min(1, 'Vehicle model is required'),
  year: z.number().min(1990, 'Year must be 1990 or later').max(new Date().getFullYear() + 1, 'Invalid year'),
  color: z.string().min(1, 'Vehicle color is required'),
  licensePlate: z.string().min(1, 'License plate is required'),
  licenseNumber: z.string().min(1, 'Driver license number is required'),
});

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, signIn, signUp, loading } = useAuth();
  const { toast } = useToast();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const [signupType, setSignupType] = useState<'rider' | 'driver'>('rider');
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginErrors, setLoginErrors] = useState<{ email?: string; password?: string }>({});
  
  // Signup form state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupErrors, setSignupErrors] = useState<{ name?: string; email?: string; password?: string; vehicle?: Record<string, string> }>({});

  // Vehicle info for driver signup
  const [vehicleInfo, setVehicleInfo] = useState({
    make: '',
    model: '',
    year: '',
    color: '',
    licensePlate: '',
    licenseNumber: '',
  });

  useEffect(() => {
    const type = searchParams.get('type');
    if (type === 'driver') {
      setActiveTab('signup');
      setSignupType('driver');
    }
  }, [searchParams]);

  useEffect(() => {
    if (user && !loading) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginErrors({});
    
    // Validate
    const errors: { email?: string; password?: string } = {};
    const emailResult = emailSchema.safeParse(loginEmail);
    const passwordResult = passwordSchema.safeParse(loginPassword);
    
    if (!emailResult.success) {
      errors.email = emailResult.error.errors[0].message;
    }
    if (!passwordResult.success) {
      errors.password = passwordResult.error.errors[0].message;
    }
    
    if (Object.keys(errors).length > 0) {
      setLoginErrors(errors);
      return;
    }
    
    setIsSubmitting(true);
    const { error } = await signIn(loginEmail, loginPassword);
    setIsSubmitting(false);
    
    if (!error) {
      navigate('/');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupErrors({});
    
    // Validate basic fields
    const errors: { name?: string; email?: string; password?: string; vehicle?: Record<string, string> } = {};
    const nameResult = nameSchema.safeParse(signupName);
    const emailResult = emailSchema.safeParse(signupEmail);
    const passwordResult = passwordSchema.safeParse(signupPassword);
    
    if (!nameResult.success) {
      errors.name = nameResult.error.errors[0].message;
    }
    if (!emailResult.success) {
      errors.email = emailResult.error.errors[0].message;
    }
    if (!passwordResult.success) {
      errors.password = passwordResult.error.errors[0].message;
    }

    // Validate vehicle info for drivers
    if (signupType === 'driver') {
      const vehicleResult = vehicleSchema.safeParse({
        ...vehicleInfo,
        year: parseInt(vehicleInfo.year) || 0,
      });
      
      if (!vehicleResult.success) {
        errors.vehicle = {};
        vehicleResult.error.errors.forEach((err) => {
          const field = err.path[0] as string;
          if (errors.vehicle) {
            errors.vehicle[field] = err.message;
          }
        });
      }
    }
    
    if (Object.keys(errors).length > 0) {
      setSignupErrors(errors);
      return;
    }
    
    setIsSubmitting(true);
    const { error } = await signUp(signupEmail, signupPassword, signupName);
    
    if (error) {
      setIsSubmitting(false);
      return;
    }

    // For driver signup, wait for auth then add driver role and vehicle info
    if (signupType === 'driver') {
      // Wait for session to be established
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Add driver role
        await supabase.from('user_roles').insert({
          user_id: session.user.id,
          role: 'driver' as const,
        });

        // Add vehicle info
        const { error: driverError } = await supabase.from('drivers').insert({
          user_id: session.user.id,
          vehicle_make: vehicleInfo.make,
          vehicle_model: vehicleInfo.model,
          vehicle_year: parseInt(vehicleInfo.year),
          vehicle_color: vehicleInfo.color,
          license_plate: vehicleInfo.licensePlate,
          license_number: vehicleInfo.licenseNumber,
        });

        if (driverError) {
          toast({
            title: 'Driver registration failed',
            description: driverError.message,
            variant: 'destructive',
          });
          setIsSubmitting(false);
          return;
        }

        toast({
          title: 'Driver account created!',
          description: 'You can now start accepting rides.',
        });
        navigate('/driver');
      }
    } else {
      navigate('/');
    }
    
    setIsSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-hero">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-hero px-4">
      <Card className="w-full max-w-md bg-card/95 backdrop-blur-md border-border/50">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-14 h-14 rounded-xl bg-primary flex items-center justify-center">
            <Car className="w-7 h-7 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Welcome to RideFlow</CardTitle>
            <CardDescription className="mt-2">
              Sign in to book rides or create an account to get started
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Log in</TabsTrigger>
              <TabsTrigger value="signup">Sign up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="you@example.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  {loginErrors.email && (
                    <p className="text-sm text-destructive">{loginErrors.email}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  {loginErrors.password && (
                    <p className="text-sm text-destructive">{loginErrors.password}</p>
                  )}
                </div>
                
                <Button type="submit" variant="hero" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Signing in...' : 'Log in'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                {/* Account Type Selection */}
                <div className="space-y-3">
                  <Label>I want to</Label>
                  <RadioGroup
                    value={signupType}
                    onValueChange={(value) => setSignupType(value as 'rider' | 'driver')}
                    className="grid grid-cols-2 gap-3"
                  >
                    <div className="relative">
                      <RadioGroupItem value="rider" id="rider" className="peer sr-only" />
                      <Label
                        htmlFor="rider"
                        className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-border cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover:bg-muted/50 transition-colors"
                      >
                        <User className="w-6 h-6 text-primary" />
                        <span className="font-medium">Ride</span>
                      </Label>
                    </div>
                    <div className="relative">
                      <RadioGroupItem value="driver" id="driver" className="peer sr-only" />
                      <Label
                        htmlFor="driver"
                        className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-border cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover:bg-muted/50 transition-colors"
                      >
                        <Truck className="w-6 h-6 text-primary" />
                        <span className="font-medium">Drive</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="John Doe"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  {signupErrors.name && (
                    <p className="text-sm text-destructive">{signupErrors.name}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="you@example.com"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  {signupErrors.email && (
                    <p className="text-sm text-destructive">{signupErrors.email}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  {signupErrors.password && (
                    <p className="text-sm text-destructive">{signupErrors.password}</p>
                  )}
                </div>

                {/* Vehicle Info for Drivers */}
                {signupType === 'driver' && (
                  <div className="space-y-4 pt-4 border-t border-border">
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                      <Car className="w-4 h-4" />
                      Vehicle Information
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="vehicle-make">Make</Label>
                        <Input
                          id="vehicle-make"
                          placeholder="Toyota"
                          value={vehicleInfo.make}
                          onChange={(e) => setVehicleInfo(prev => ({ ...prev, make: e.target.value }))}
                        />
                        {signupErrors.vehicle?.make && (
                          <p className="text-xs text-destructive">{signupErrors.vehicle.make}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="vehicle-model">Model</Label>
                        <Input
                          id="vehicle-model"
                          placeholder="Camry"
                          value={vehicleInfo.model}
                          onChange={(e) => setVehicleInfo(prev => ({ ...prev, model: e.target.value }))}
                        />
                        {signupErrors.vehicle?.model && (
                          <p className="text-xs text-destructive">{signupErrors.vehicle.model}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="vehicle-year">Year</Label>
                        <Input
                          id="vehicle-year"
                          type="number"
                          placeholder="2022"
                          value={vehicleInfo.year}
                          onChange={(e) => setVehicleInfo(prev => ({ ...prev, year: e.target.value }))}
                        />
                        {signupErrors.vehicle?.year && (
                          <p className="text-xs text-destructive">{signupErrors.vehicle.year}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="vehicle-color">Color</Label>
                        <Input
                          id="vehicle-color"
                          placeholder="Silver"
                          value={vehicleInfo.color}
                          onChange={(e) => setVehicleInfo(prev => ({ ...prev, color: e.target.value }))}
                        />
                        {signupErrors.vehicle?.color && (
                          <p className="text-xs text-destructive">{signupErrors.vehicle.color}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="license-plate">License Plate</Label>
                      <Input
                        id="license-plate"
                        placeholder="ABC-1234"
                        value={vehicleInfo.licensePlate}
                        onChange={(e) => setVehicleInfo(prev => ({ ...prev, licensePlate: e.target.value }))}
                      />
                      {signupErrors.vehicle?.licensePlate && (
                        <p className="text-xs text-destructive">{signupErrors.vehicle.licensePlate}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="license-number">Driver License Number</Label>
                      <Input
                        id="license-number"
                        placeholder="DL12345678"
                        value={vehicleInfo.licenseNumber}
                        onChange={(e) => setVehicleInfo(prev => ({ ...prev, licenseNumber: e.target.value }))}
                      />
                      {signupErrors.vehicle?.licenseNumber && (
                        <p className="text-xs text-destructive">{signupErrors.vehicle.licenseNumber}</p>
                      )}
                    </div>
                  </div>
                )}
                
                <Button type="submit" variant="hero" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating account...' : signupType === 'driver' ? 'Create Driver Account' : 'Create account'}
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
