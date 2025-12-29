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
import { authApi, geoApi } from "@/lib/api";
import ReCAPTCHA from "react-google-recaptcha";
import DOMPurify from "dompurify";

const generateDeviceFingerprint = (): string => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.textBaseline = "top";
    ctx.font = "14px Arial";
    ctx.fillText("Device fingerprint", 2, 2);
  }

  const fingerprint = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    screenResolution: `${screen.width}x${screen.height}`,
    screenColorDepth: screen.colorDepth,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    canvas: canvas.toDataURL(),
    plugins: Array.from(navigator.plugins)
      .map((p) => p.name)
      .join(","),
    cookieEnabled: navigator.cookieEnabled,
    onlineStatus: navigator.onLine,
    hardwareConcurrency: navigator.hardwareConcurrency || 0,
  };

  return btoa(JSON.stringify(fingerprint)).slice(0, 64);
};

const getGPSCoordinates = (): Promise<{ lat: number; lon: number }> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
};

const getAddressFromCoordinates = async (
  lat: number,
  lon: number
): Promise<string> => {
  try {
    const { address } = await geoApi.reverseGeocode(lat, lon);
    return `${address.city || address.town || address.village || ""}, ${address.state || ""}, ${address.country || ""}`;
  } catch (error) {
    console.error("Reverse geocoding failed:", error);
    return "Unknown Location";
  }
};


const formSchema = z
  .object({
    hospitalName: z
      .string()
      .min(2, { message: "Hospital name must be at least 2 characters" }),
    province: z.enum(
      [
        "Eastern Cape",
        "Free State",
        "Gauteng",
        "KwaZulu-Natal",
        "Limpopo",
        "Mpumalanga",
        "Northern Cape",
        "North West",
        "Western Cape",
      ],
      { errorMap: () => ({ message: "Please select a province" }) }
    ),
    city: z.string().min(2, { message: "City must be at least 2 characters" }),
    contactPersonName: z.string().min(2, {
      message: "Contact person name must be at least 2 characters",
    }),
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
  const [gpsCoordinates, setGpsCoordinates] = useState<{ lat: number; lon: number } | null>(
    null
  );
  const [locationAddress, setLocationAddress] = useState<string>("");
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const navigate = useNavigate();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      hospitalName: "",
      province: "" as any,
      city: "",
      contactPersonName: "",
      email: "",
      emailId: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    const initializeSecurityData = async () => {
      try {
        const fingerprint = generateDeviceFingerprint();
        setDeviceFingerprint(fingerprint);

        const coords = await getGPSCoordinates();
        setGpsCoordinates(coords);

        const address = await getAddressFromCoordinates(coords.lat, coords.lon);
        setLocationAddress(address);
      } catch (error) {
        console.error("Failed to initialize security data:", error);
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
      console.log('=== FRONTEND REGISTRATION START ===');
      
      const registrationData = {
        hospital_name: DOMPurify.sanitize(data.hospitalName),
        province: data.province,
        city: DOMPurify.sanitize(data.city),
        contact_person_name: DOMPurify.sanitize(data.contactPersonName),
        email: DOMPurify.sanitize(data.email),
        email_id: DOMPurify.sanitize(data.emailId),
        phone_number: DOMPurify.sanitize(data.phoneNumber),
        password: data.password,
        device_fingerprint: deviceFingerprint,
        gps_coordinates: `${gpsCoordinates.lat},${gpsCoordinates.lon}`,
        location_address: locationAddress,
        recaptcha_token: recaptchaToken,
      };

      console.log('Registration data prepared:', {
        ...registrationData,
        password: '[REDACTED]',
        recaptcha_token: '[REDACTED]'
      });

      const response = await authApi.register(registrationData);

      if (response.success) {
        toast({
          title: "Registration Successful",
          description: response.message || "Account created successfully",
        });
        navigate("/login");
      }
    } catch (error) {
      console.error('Registration error:', error);
      recaptchaRef.current?.reset();
      setRecaptchaToken(null);
      toast({
        title: "Registration Failed",
        description: (error as any)?.response?.data?.error || "An error occurred during registration",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard
      cardTitle="Register Your Hospital"
      cardDescription="Create an account to securely manage your hospital data"
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
          {/* Hospital Name */}
          <FormField
            control={form.control}
            name="hospitalName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hospital Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter hospital name"
                    {...field}
                    disabled={!gpsCoordinates}
                    className="border-border/50 bg-background/80 backdrop-blur-sm"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Province */}
          <FormField
            control={form.control}
            name="province"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Province</FormLabel>
                <FormControl>
                  <select
                    {...field}
                    disabled={!gpsCoordinates}
                    className="w-full border border-border/50 rounded px-2 py-1 bg-background/80"
                  >
                    <option value="">Select a province</option>
                    <option value="Eastern Cape">Eastern Cape</option>
                    <option value="Free State">Free State</option>
                    <option value="Gauteng">Gauteng</option>
                    <option value="KwaZulu-Natal">KwaZulu-Natal</option>
                    <option value="Limpopo">Limpopo</option>
                    <option value="Mpumalanga">Mpumalanga</option>
                    <option value="Northern Cape">Northern Cape</option>
                    <option value="North West">North West</option>
                    <option value="Western Cape">Western Cape</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* City */}
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter city or town"
                    {...field}
                    disabled={!gpsCoordinates}
                    className="border-border/50 bg-background/80 backdrop-blur-sm"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Contact Person Name */}
          <FormField
            control={form.control}
            name="contactPersonName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Person Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter contact person name"
                    {...field}
                    disabled={!gpsCoordinates}
                    className="border-border/50 bg-background/80 backdrop-blur-sm"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email */}
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
                    disabled={!gpsCoordinates}
                    className="border-border/50 bg-background/80 backdrop-blur-sm"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Employer ID */}
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
                    disabled={!gpsCoordinates}
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

          {/* Phone Number */}
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
                    disabled={!gpsCoordinates}
                    className="border-border/50 bg-background/80 backdrop-blur-sm"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Password */}
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
                      disabled={!gpsCoordinates}
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
                  Password must contain: 8+ characters, uppercase, lowercase, number,
                  and special character
                </div>
              </FormItem>
            )}
          />

          {/* Confirm Password */}
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
                      disabled={!gpsCoordinates}
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
                      disabled={!gpsCoordinates}
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-hss-purple-vivid focus:ring-hss-purple-vivid"
                    />
                  </FormControl>
                  <FormLabel className="text-sm text-muted-foreground font-normal">
                    I have read and agree to the{" "}
                    <a
                      href="/IncidentResponsePlaybook 1.0.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-hss-purple-vivid hover:underline font-medium"
                    >
                      Terms and conditions
                    </a>{" "}
                    (PDF)
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
              sitekey="6Lc-nlQrAAAAAEVa2AKpoXPkQ7I5iHeVmsE1FHDb"
              onChange={setRecaptchaToken}
            />
          </div>

          {/* GPS Location Info */}
          {gpsCoordinates && (
            <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded">
              <div>Device secured ✓</div>
              <div>
                GPS Coordinates: {gpsCoordinates.lat.toFixed(4)},{" "}
                {gpsCoordinates.lon.toFixed(4)}
              </div>
              {locationAddress && <div>Location: {locationAddress}</div>}
              <div className="text-green-600 mt-1">✓ Real GPS location detected</div>
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-hss-purple-vivid hover:bg-hss-purple-vivid/90"
            disabled={
              isLoading || !recaptchaToken || !form.watch("agreement") || !gpsCoordinates
            }
          >
            {isLoading ? "Registering..." : "Register"}
          </Button>
        </form>
      </Form>
    </AuthCard>
  );
};

export default Register;
