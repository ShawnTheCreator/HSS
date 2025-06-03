import { useState, useEffect, useRef } from "react";
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
import ReCAPTCHA from "react-google-recaptcha";

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
  recaptcha_token?: string;
};

const formSchema = z
  .object({
    name: z.string().min(2, { message: "Name must be at least 2 characters" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    phoneNumber: z.string().min(10, { message: "Please enter a valid phone number" }),
    role: z.string().min(1, { message: "Please select your role" }),
    department: z.string().min(1, { message: "Please select your department" }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" })
      .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
      .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
      .regex(/\d/, { message: "Password must contain at least one number" })
      .regex(/[^a-zA-Z0-9]/, { message: "Password must contain at least one special character" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof formSchema>;

// Replace with your actual reCAPTCHA v2 site key
const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [deviceFingerprint, setDeviceFingerprint] = useState<string>("");
  const [locationData, setLocationData] = useState<{ ip: string; location: string }>({
    ip: "",
    location: ""
  });
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  
  // NEW: State to store the email after successful registration
  const [registeredEmail, setRegisteredEmail] = useState<string>("");
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  
  const recaptchaRef = useRef<ReCAPTCHA>(null);
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

  // Handle reCAPTCHA change (v2)
  const handleRecaptchaChange = (token: string | null) => {
    setRecaptchaToken(token);
    if (token) {
      console.log('reCAPTCHA token received:', token);
    }
  };

  // Handle reCAPTCHA expiration
  const handleRecaptchaExpired = () => {
    setRecaptchaToken(null);
    toast({
      title: "reCAPTCHA Expired",
      description: "Please complete the reCAPTCHA again",
      variant: "destructive",
    });
  };

  // Handle reCAPTCHA error
  const handleRecaptchaError = () => {
    setRecaptchaToken(null);
    toast({
      title: "reCAPTCHA Error",
      description: "There was an error loading reCAPTCHA. Please try again.",
      variant: "destructive",
    });
  };

  // NEW: Function to send 2FA code
  const send2FACode = async (email: string) => {
    try {
      const response = await axios.post(
        'https://hss-backend.onrender.com/api/auth/send-2fa',
        { email },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        toast({
          title: "2FA Code Sent",
          description: "Please check your email for the verification code",
        });
        // You can navigate to a 2FA verification page here
        // navigate("/verify-2fa", { state: { email } });
      }
    } catch (error) {
      console.error('Error sending 2FA code:', error);
      toast({
        title: "Error",
        description: "Failed to send 2FA code. Please try again.",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (data: FormValues) => {
    // Check if reCAPTCHA is completed
    if (!recaptchaToken) {
      toast({
        title: "reCAPTCHA Required",
        description: "Please complete the reCAPTCHA verification",
        variant: "destructive",
      });
      return;
    }

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
        recaptcha_token: recaptchaToken,
      };

      // Make sure this matches your backend route
      const response = await axios.post(
        'https://hss-backend.onrender.com/api/auth/register',
        registrationData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 201) {
        // EXTRACT THE EMAIL HERE after successful registration
        setRegisteredEmail(data.email);
        setShowEmailConfirmation(true);
        
        console.log('✅ Registration successful! Email captured:', data.email);
        
        // You can now use the email for various purposes:
        // 1. Store it in localStorage/sessionStorage
        localStorage.setItem('registeredEmail', data.email);
        
        // 2. Pass it to parent component via callback (if this is a child component)
        // if (onEmailCaptured) {
        //   onEmailCaptured(data.email);
        // }
        
        // 3. Store it in global state (Redux, Zustand, etc.)
        // dispatch(setUserEmail(data.email));
        
        // 4. Use it immediately for 2FA or other operations
        // Uncomment the line below if you want to automatically send 2FA
        // await send2FACode(data.email);

        toast({
          title: "Registration Successful",
          description: response.data.msg || response.data.message || "Account created successfully",
        });
        
        // Navigate after a short delay to show confirmation
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    } catch (error) {
      // Reset reCAPTCHA on error
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
      }
      setRecaptchaToken(null);

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

  // Show email confirmation if registration was successful
  if (showEmailConfirmation && registeredEmail) {
    return (
      <AuthCard
        cardTitle="Registration Successful!"
        cardDescription="Your account has been created"
        footer={
          <div className="w-full flex flex-col gap-4 text-center text-sm text-muted-foreground">
            <Link to="/login" className="text-hss-purple-vivid hover:underline">
              Continue to Login
            </Link>
          </div>
        }
      >
        <div className="space-y-4 text-center">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-semibold text-green-800">Account Created Successfully!</h3>
            <p className="text-green-600 mt-2">
              Registration email sent to: <strong>{registeredEmail}</strong>
            </p>
            <p className="text-sm text-green-600 mt-1">
              Please wait for admin approval before logging in.
            </p>
          </div>
          
          <div className="space-y-2">
            <Button 
              onClick={() => send2FACode(registeredEmail)}
              variant="outline"
              className="w-full"
            >
              Send 2FA Code (Optional)
            </Button>
            
            <Button 
              onClick={() => navigate("/login")}
              className="w-full bg-hss-purple-vivid hover:bg-hss-purple-vivid/90"
            >
              Go to Login
            </Button>
          </div>
        </div>
      </AuthCard>
    );
  }

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
                <div className="text-xs text-muted-foreground mt-1">
                  Password must contain: 8+ characters, uppercase, lowercase, number, and special character
                </div>
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

          {/* reCAPTCHA v2 Component */}
          <div className="flex justify-center">
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey={RECAPTCHA_SITE_KEY}
              onChange={handleRecaptchaChange}
              onExpired={handleRecaptchaExpired}
              onError={handleRecaptchaError}
              theme="light" // or "dark"
              size="normal" // or "compact"
            />
          </div>

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
            disabled={isLoading || !recaptchaToken}
          >
            {isLoading ? "Registering..." : "Register"}
          </Button>
        </form>
      </Form>
    </AuthCard>
  );
};

export default Register;