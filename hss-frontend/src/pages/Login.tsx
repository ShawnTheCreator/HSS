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
import ReCAPTCHA from "react-google-recaptcha";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
});

type FormValues = z.infer<typeof formSchema>;

const ATTEMPTS_KEY = "loginAttempts";
const LOCKOUT_KEY = "loginLockoutTime";

// Replace with your actual reCAPTCHA v2 site key
const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(3);
  const [lockoutTime, setLockoutTime] = useState<Date | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const navigate = useNavigate();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // On component mount, load attempts and lockout time from localStorage
  useEffect(() => {
    const storedAttempts = localStorage.getItem(ATTEMPTS_KEY);
    const storedLockout = localStorage.getItem(LOCKOUT_KEY);

    if (storedAttempts) {
      setLoginAttempts(parseInt(storedAttempts, 10));
    }

    if (storedLockout) {
      const lockoutDate = new Date(storedLockout);
      if (lockoutDate > new Date()) {
        setLockoutTime(lockoutDate);
      } else {
        // Expired lockout time - clear storage
        localStorage.removeItem(LOCKOUT_KEY);
        localStorage.removeItem(ATTEMPTS_KEY);
      }
    }
  }, []);

  // Save attempts and lockoutTime to localStorage when they change
  useEffect(() => {
    localStorage.setItem(ATTEMPTS_KEY, loginAttempts.toString());
  }, [loginAttempts]);

  useEffect(() => {
    if (lockoutTime) {
      localStorage.setItem(LOCKOUT_KEY, lockoutTime.toISOString());
    } else {
      localStorage.removeItem(LOCKOUT_KEY);
      localStorage.removeItem(ATTEMPTS_KEY);
    }
  }, [lockoutTime]);

  // Countdown timer effect for lockout
  useEffect(() => {
    if (!lockoutTime) return;

    timerRef.current = setInterval(() => {
      if (new Date() >= lockoutTime) {
        setLockoutTime(null);
        setLoginAttempts(3);
        setErrorMessage("");
        // Reset reCAPTCHA when lockout expires
        if (recaptchaRef.current) {
          recaptchaRef.current.reset();
        }
        setRecaptchaToken(null);
        if (timerRef.current) clearInterval(timerRef.current);
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [lockoutTime]);

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

  const onSubmit = async (data: FormValues) => {
    if (lockoutTime) {
      setErrorMessage("Too many failed attempts. Please wait before trying again.");
      return;
    }

    // Check if reCAPTCHA is completed
    if (!recaptchaToken) {
      toast({
        title: "reCAPTCHA Required",
        description: "Please complete the reCAPTCHA verification",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch("https://hss-backend.onrender.com/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          recaptcha_token: recaptchaToken,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        // Reset reCAPTCHA on failed login attempt
        if (recaptchaRef.current) {
          recaptchaRef.current.reset();
        }
        setRecaptchaToken(null);

        const attemptsLeft = loginAttempts - 1;

        if (attemptsLeft <= 0) {
          const timeoutDuration = 30 * 1000; // 30 seconds
          setLockoutTime(new Date(Date.now() + timeoutDuration));
          setErrorMessage("Too many failed login attempts. Please wait 30 seconds before retrying.");
        } else {
          setLoginAttempts(attemptsLeft);
          setErrorMessage(`Invalid email or password. You have ${attemptsLeft} attempt${attemptsLeft === 1 ? "" : "s"} left.`);
        }
        throw new Error(result.message || "Login failed");
      }

      // Successful login: reset attempts and error
      setLoginAttempts(3);
      setErrorMessage("");
      setRecaptchaToken(null);

      // Save token if backend sends one
      if (result.token) {
        localStorage.setItem("token", result.token);
      }

      toast({
        title: "Login Successful",
        description: "Welcome back!",
      });

      navigate("/dashboard");
    } catch (error: any) {
      console.error(error);
    }
  };

  const lockoutSecondsLeft = lockoutTime ? Math.ceil((lockoutTime.getTime() - Date.now()) / 1000) : 0;

  return (
    <AuthCard
      cardTitle="Login to HSS Secure"
      cardDescription="Enter your credentials to access your account"
      footer={
        <div className="w-full flex flex-col gap-4 text-center text-sm text-muted-foreground">
          <div>
            Don't have an account?{" "}
            <Link to="/register" className="text-hss-purple-vivid hover:underline">
              Register here
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
                    disabled={!!lockoutTime}
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
                      placeholder="Enter your password"
                      {...field}
                      autoComplete="current-password"
                      className="border-border/50 bg-background/80 backdrop-blur-sm pr-10"
                      disabled={!!lockoutTime}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={!!lockoutTime}
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

          {errorMessage && (
            <div className="text-red-600 text-center text-sm font-medium">{errorMessage}</div>
          )}

          {lockoutTime && (
            <div className="text-red-600 text-center text-sm font-medium">
              Please wait {lockoutSecondsLeft} second{lockoutSecondsLeft === 1 ? "" : "s"} before trying again.
            </div>
          )}

          <div className="text-sm text-right">
            <Link to="/forgot-password" className="text-hss-purple-vivid hover:underline">
              Forgot your password?
            </Link>
          </div>
          <Button
            type="submit"
            className="w-full bg-hss-purple-vivid hover:bg-hss-purple-vivid/90"
            disabled={!!lockoutTime || !recaptchaToken}
          >
            Login
          </Button>
        </form>
      </Form>
    </AuthCard>
  );
};

export default Login;