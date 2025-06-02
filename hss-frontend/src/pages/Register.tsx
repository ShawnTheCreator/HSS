import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AuthCard from "@/components/auth/AuthCard";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import axios from "axios";

// Device fingerprinting function
const generateDeviceFingerprint = (): string => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Device fingerprint', 2, 2);
  }
  
  const fingerprint = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    screenResolution: `${screen.width}x${screen.height}`,
    screenColorDepth: screen.colorDepth,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    canvas: canvas.toDataURL(),
    plugins: Array.from(navigator.plugins).map(p => p.name).join(','),
    cookieEnabled: navigator.cookieEnabled,
    onlineStatus: navigator.onLine,
    hardwareConcurrency: navigator.hardwareConcurrency || 0,
  };
  
  return btoa(JSON.stringify(fingerprint)).slice(0, 64);
};

// IP and location detection
const getLocationData = async (): Promise<{ ip: string; location: string }> => {
  try {
    const response = await axios.get('https://ipapi.co/json/');
    const data = response.data;
    
    return {
      ip: data.ip || 'unknown',
      location: `${data.city || 'Unknown'}, ${data.region || 'Unknown'}, ${data.country_name || 'Unknown'}`
    };
  } catch (error) {
    console.error('Failed to get location data:', error);
    return {
      ip: 'unknown',
      location: 'Unknown Location'
    };
  }
};

// Define types directly in the component
type ApiResponse = {
  success: boolean;
  message?: string;
  error?: string;
};

type RegisterRequest = {
  full_name: string;
  email: string;
  phone_number: string;
  password: string;
  role: string;
  department: string;
  biometric_hash?: string;
  device_fingerprint?: string;
  location_zone?: string;
};

const formSchema = z
  .object({
    name: z.string().min(2, { message: "Name must be at least 2 characters" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    phoneNumber: z.string().min(10, { message: "Please enter a valid phone number" }),
    role: z.string().min(1, { message: "Please select your role" }),
    department: z.string().min(1, { message: "Please select your department" }),
    password: z.string().min(8, { message: "Password must be at least 8 characters" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof formSchema>;

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [deviceFingerprint, setDeviceFingerprint] = useState<string>("");
  const [locationData, setLocationData] = useState<{ ip: string; location: string }>({
    ip: "",
    location: ""
  });
  const navigate = useNavigate();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phoneNumber: "",
      role: "",
      department: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Initialize device fingerprint and location on component mount
  useEffect(() => {
    const initializeSecurityData = async () => {
      try {
        // Generate device fingerprint
        const fingerprint = generateDeviceFingerprint();
        setDeviceFingerprint(fingerprint);

        // Get location data
        const location = await getLocationData();
        setLocationData(location);
      } catch (error) {
        console.error('Failed to initialize security data:', error);
      }
    };

    initializeSecurityData();
  }, []);

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
      const registrationData: RegisterRequest = {
        full_name: data.name,
        email: data.email,
        phone_number: data.phoneNumber,
        password: data.password,
        role: data.role,
        department: data.department,
        biometric_hash: "", // Optional - can be populated later
        device_fingerprint: deviceFingerprint,
        location_zone: locationData.location,
      };

      // Make sure this matches your backend route
      const response = await axios.post(
        'http://localhost:5000/api/auth/register',
        registrationData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 201) {
        toast({
          title: "Registration Successful",
          description: response.data.msg || response.data.message || "Account created successfully",
        });
        navigate("/login");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast({
          title: "Registration Failed",
          description: error.response?.data?.error || error.response?.data?.msg || "An error occurred",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Registration Failed",
          description: "An unexpected error occurred",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard
      cardTitle="Create an Account"
      cardDescription="Register to access HSS Secure"
      footer={
        <div className="w-full flex flex-col gap-4 text-center text-sm text-muted-foreground">
          <div>
            Already have an account?{" "}
            <Link to="/login" className="text-hss-purple-vivid hover:underline">
              Login here
            </Link>
          </div>
          <Link to="/" className="text-muted-foreground hover:text-foreground">
            Return to home page
          </Link>
        </div>
      }
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter your full name" 
                    {...field} 
                    autoComplete="name"
                    className="border-border/50 bg-background/80 backdrop-blur-sm"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter your email" 
                    {...field} 
                    autoComplete="email"
                    className="border-border/50 bg-background/80 backdrop-blur-sm"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter your phone number" 
                    {...field} 
                    autoComplete="tel"
                    className="border-border/50 bg-background/80 backdrop-blur-sm"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="border-border/50 bg-background/80 backdrop-blur-sm">
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="nurse">Nurse</SelectItem>
                      <SelectItem value="doctor">Doctor</SelectItem>
                      <SelectItem value="technician">Technician</SelectItem>
                      <SelectItem value="admin">Administrator</SelectItem>
                      <SelectItem value="cleaner">Cleaner</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="border-border/50 bg-background/80 backdrop-blur-sm">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="emergency">Emergency</SelectItem>
                      <SelectItem value="cardiology">Cardiology</SelectItem>
                      <SelectItem value="pediatrics">Pediatrics</SelectItem>
                      <SelectItem value="surgery">Surgery</SelectItem>
                      <SelectItem value="radiology">Radiology</SelectItem>
                      <SelectItem value="pharmacy">Pharmacy</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      {...field}
                      autoComplete="new-password"
                      className="border-border/50 bg-background/80 backdrop-blur-sm pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      {...field}
                      autoComplete="new-password"
                      className="border-border/50 bg-background/80 backdrop-blur-sm pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Security info display (optional - for debugging) */}
          {(deviceFingerprint || locationData.location) && (
            <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded">
              <div>Device secured ✓</div>
              {locationData.location && locationData.location !== "Unknown Location" && (
                <div>Location: {locationData.location}</div>
              )}
            </div>
          )}
          
          <Button 
            type="submit" 
            className="w-full bg-hss-purple-vivid hover:bg-hss-purple-vivid/90"
            disabled={isLoading}
          >
            {isLoading ? "Registering..." : "Register"}
          </Button>
        </form>
      </Form>
    </AuthCard>
  );
};

export default Register;