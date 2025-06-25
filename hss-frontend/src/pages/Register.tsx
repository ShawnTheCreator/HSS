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
import AuthCard from "@/components/auth/AuthCard";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import axios from "axios";
import ReCAPTCHA from "react-google-recaptcha";
import DOMPurify from "dompurify"; // Import DOMPurify for sanitization

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

// GPS-based location detection
const getGPSCoordinates = (): Promise<{ lat: number; lon: number }> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  });
};

// Reverse geocoding to get address from coordinates
const getAddressFromCoordinates = async (lat: number, lon: number): Promise<string> => {
  try {
    const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
    const { address } = response.data;
    return `${address.city || address.town || address.village || ''}, ${address.state || ''}, ${address.country || ''}`;
  } catch (error) {
    console.error('Reverse geocoding failed:', error);
    return 'Unknown Location';
  }
};

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  emailId: z.string().min(3, { message: "Email ID must be at least 3 characters" }),
  phoneNumber: z.string().min(10, { message: "Please enter a valid phone number" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
    .regex(/\d/, { message: "Password must contain at least one number" })
    .regex(/[^a-zA-Z0-9]/, { message: "Password must contain at least one special character" }),
  confirmPassword: z.string(),
  agreement: z.literal(true, {
    errorMap: () => ({ message: "You must agree to the terms and conditions" }),
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof formSchema>;

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [deviceFingerprint, setDeviceFingerprint] = useState<string>("");
  const [gpsCoordinates, setGpsCoordinates] = useState<{ lat: number; lon: number } | null>(null);
  const [locationAddress, setLocationAddress] = useState<string>("");
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const navigate = useNavigate();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      emailId: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Initialize device fingerprint and GPS location
  useEffect(() => {
    const initializeSecurityData = async () => {
      try {
        // Generate device fingerprint
        const fingerprint = generateDeviceFingerprint();
        setDeviceFingerprint(fingerprint);

        // Get GPS coordinates
        const coords = await getGPSCoordinates();
        setGpsCoordinates(coords);

        // Get address from coordinates
        const address = await getAddressFromCoordinates(coords.lat, coords.lon);
        setLocationAddress(address);

      } catch (error) {
        console.error('Failed to initialize security data:', error);
        toast({
          title: "Location Access Required",
          description: "Please enable GPS to continue with registration",
          variant: "destructive",
        });
      }
    };

    initializeSecurityData();
  }, []);

  const onSubmit = async (data: FormValues) => {
    if (!recaptchaToken) {
      toast({
        title: "reCAPTCHA Required",
        description: "Please complete the reCAPTCHA verification",
        variant: "destructive",
      });
      return;
    }

    if (!gpsCoordinates) {
      toast({
        title: "Location Access Required",
        description: "Please enable GPS to continue with registration",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const registrationData = {
        full_name: DOMPurify.sanitize(data.name), // Sanitize input
        email: DOMPurify.sanitize(data.email), // Sanitize input
        email_id: DOMPurify.sanitize(data.emailId), // Sanitize input
        phone_number: DOMPurify.sanitize(data.phoneNumber), // Sanitize input
        password: data.password, // Passwords are not sanitized for security reasons
        device_fingerprint: deviceFingerprint,
        gps_coordinates: `${gpsCoordinates.lat},${gpsCoordinates.lon}`,
        location_address: locationAddress,
        recaptcha_token: recaptchaToken,
      };

      const response = await axios.post(
        'https://hss-backend.onrender.com/api/auth/register',
        registrationData,
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (response.status === 201) {
        toast({
          title: "Registration Successful",
          description: response.data.msg || "Account created successfully",
        });
        navigate("/login");
      }
    } catch (error) {
      recaptchaRef.current?.reset();
      setRecaptchaToken(null);
      
      if (axios.isAxiosError(error)) {
        toast({
          title: "Registration Failed",
          description: error.response?.data?.error || "An error occurred",
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
                    disabled={!gpsCoordinates} // Disable if GPS is not available
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
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter your email address" 
                    {...field} 
                    autoComplete="email"
                    className="border-border/50 bg-background/80 backdrop-blur-sm"
                    disabled={!gpsCoordinates} // Disable if GPS is not available
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="emailId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Employer ID</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter your employer ID" 
                    {...field} 
                    autoComplete="username"
                    className="border-border/50 bg-background/80 backdrop-blur-sm"
                    disabled={!gpsCoordinates} // Disable if GPS is not available
                  />
                </FormControl>
                <FormMessage />
                <div className="text-xs text-muted-foreground mt-1">
                  This will be your unique identifier for login
                </div>
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
                    disabled={!gpsCoordinates} // Disable if GPS is not available
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
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
                      disabled={!gpsCoordinates} // Disable if GPS is not available
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
                      disabled={!gpsCoordinates} // Disable if GPS is not available
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

          {/* Agreement Checkbox */}
          <FormField
            control={form.control}
            name="agreement"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-start space-x-2">
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                      onBlur={field.onBlur}
                      ref={field.ref}
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-hss-purple-vivid focus:ring-hss-purple-vivid"
                      disabled={!gpsCoordinates} // Disable if GPS is not available
                    />
                  </FormControl>
                  <FormLabel className="text-sm text-muted-foreground font-normal">
                    I have read and agree to the{' '}
                    <a 
                      href="/IncidentResponsePlaybook 1.0.pdf" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-hss-purple-vivid hover:underline font-medium"
                    >
                      Terms and conditions
                    </a>
                    {' '}(PDF)
                  </FormLabel>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* reCAPTCHA */}
          <div className="flex justify-center">
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
              onChange={setRecaptchaToken}
            />
          </div>

          {/* GPS Location Info */}
          {gpsCoordinates && (
            <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded">
              <div>Device secured ✓</div>
              <div>GPS Coordinates: {gpsCoordinates.lat.toFixed(4)}, {gpsCoordinates.lon.toFixed(4)}</div>
              {locationAddress && <div>Location: {locationAddress}</div>}
              <div className="text-green-600 mt-1">✓ Real GPS location detected</div>
            </div>
          )}
          
          <Button 
            type="submit" 
            className="w-full bg-hss-purple-vivid hover:bg-hss-purple-vivid/90"
            disabled={isLoading || !recaptchaToken || !form.watch('agreement') || !gpsCoordinates}
          >
            {isLoading ? "Registering..." : "Register"}
          </Button>
        </form>
      </Form>
    </AuthCard>
  );
};

export default Register;
