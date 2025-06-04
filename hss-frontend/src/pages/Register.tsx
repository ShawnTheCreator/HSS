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

// Define types
type ApiResponse = {
  success: boolean;
  message?: string;
  error?: string;
};

type RegisterRequest = {
  full_name: string;
  email: string;
  email_id: string;
  phone_number: string;
  password: string;
  biometric_hash?: string;
  device_fingerprint?: string;
  location_zone?: string;
  recaptcha_token?: string;
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
    errorMap: () => ({ message: "You must agree to the Incident Response Playbook" }),
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
  const [locationData, setLocationData] = useState<{ ip: string; location: string }>({
    ip: "",
    location: ""
  });
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [registeredEmail, setRegisteredEmail] = useState<string>("");
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  
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
      agreement: false,
    },
  });

  // Initialize device fingerprint and location
  useEffect(() => {
    const initializeSecurityData = async () => {
      try {
        const fingerprint = generateDeviceFingerprint();
        setDeviceFingerprint(fingerprint);
        const location = await getLocationData();
        setLocationData(location);
      } catch (error) {
        console.error('Failed to initialize security data:', error);
      }
    };
    initializeSecurityData();
  }, []);

  // reCAPTCHA handlers
  const handleRecaptchaChange = (token: string | null) => {
    setRecaptchaToken(token);
  };

  const handleRecaptchaExpired = () => {
    setRecaptchaToken(null);
    toast({
      title: "reCAPTCHA Expired",
      description: "Please complete the reCAPTCHA again",
      variant: "destructive",
    });
  };

  const handleRecaptchaError = () => {
    setRecaptchaToken(null);
    toast({
      title: "reCAPTCHA Error",
      description: "There was an error loading reCAPTCHA. Please try again.",
      variant: "destructive",
    });
  };

  // Send 2FA code
  const send2FACode = async (email: string) => {
    try {
      const response = await axios.post(
        'https://hss-backend.onrender.com/api/auth/send-2fa',
        { email },
        { headers: { 'Content-Type': 'application/json' } }
      );
      if (response.data.success) {
        toast({
          title: "2FA Code Sent",
          description: "Please check your email for the verification code",
        });
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

  // Form submission
  const onSubmit = async (data: FormValues) => {
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
        email_id: data.emailId,
        phone_number: data.phoneNumber,
        password: data.password,
        device_fingerprint: deviceFingerprint,
        location_zone: locationData.location,
        recaptcha_token: recaptchaToken,
      };

      const response = await axios.post(
        'https://hss-backend.onrender.com/api/auth/register',
        registrationData,
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (response.status === 201) {
        setRegisteredEmail(data.email);
        setShowEmailConfirmation(true);
        localStorage.setItem('registeredEmail', data.email);
        toast({
          title: "Registration Successful",
          description: response.data.msg || "Account created successfully",
        });
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

  if (showEmailConfirmation && registeredEmail) {
    return (
      <AuthCard
        cardTitle="Registration Successful!"
        cardDescription="Your account has been created"
        footer={
          <div className="w-full flex flex-col gap-4 text-center text-sm text-muted-foreground">
            <div>
              Want to try logging in?{" "}
              <Link to="/login" className="text-hss-purple-vivid hover:underline">
                Go to Login
              </Link>
            </div>
            <Link to="/" className="text-muted-foreground hover:text-foreground">
              Return to home page
            </Link>
          </div>
        }
      >
        <div className="space-y-6 text-center">
          <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h3 className="font-semibold text-green-800 text-lg mb-2">Account Created Successfully!</h3>
            <p className="text-green-600">
              Registration email sent to: <strong className="block mt-1">{registeredEmail}</strong>
            </p>
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-sm text-yellow-700 font-medium">
                ⏳ Please wait for admin approval before logging in
              </p>
              <p className="text-xs text-yellow-600 mt-1">
                You will be notified via email once your account is approved
              </p>
            </div>
          </div>
          
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              What would you like to do next?
            </p>
            
            <div className="grid gap-3">
              <Button 
                onClick={() => send2FACode(registeredEmail)}
                variant="outline"
                className="w-full"
              >
                📧 Send 2FA Code (Optional)
              </Button>
              
              <Button 
                onClick={() => navigate("/login")}
                className="w-full bg-hss-purple-vivid hover:bg-hss-purple-vivid/90"
              >
                Continue to Login
              </Button>
              
              <Button 
                onClick={() => {
                  setShowEmailConfirmation(false);
                  setRegisteredEmail("");
                  form.reset();
                }}
                variant="ghost"
                className="w-full"
              >
                Register Another Account
              </Button>
            </div>
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
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter your email address" 
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
                      Incident Response Playbook 1.0
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
              onChange={handleRecaptchaChange}
              onExpired={handleRecaptchaExpired}
              onError={handleRecaptchaError}
              theme="light"
              size="normal"
            />
          </div>

          {/* Security info */}
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
            disabled={isLoading || !recaptchaToken || !form.watch('agreement')}
          >
            {isLoading ? "Registering..." : "Register"}
          </Button>
        </form>
      </Form>
    </AuthCard>
  );
};

export default Register;