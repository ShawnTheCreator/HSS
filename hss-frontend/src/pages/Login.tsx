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
  email: z.string().min(3, { message: "Employer ID is required" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
});

type FormValues = z.infer<typeof formSchema>;

const ATTEMPTS_KEY = "loginAttempts";
const LOCKOUT_KEY = "loginLockoutTime";
const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

const BASE_URL = import.meta.env.DEV
  ? "http://localhost:5000/api/auth"
  : "https://hss-backend.onrender.com/api/auth";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(3);
  const [lockoutTime, setLockoutTime] = useState<Date | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const navigate = useNavigate();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  useEffect(() => {
    const storedAttempts = localStorage.getItem(ATTEMPTS_KEY);
    if (storedAttempts) setLoginAttempts(parseInt(storedAttempts, 10));

    const storedLockout = localStorage.getItem(LOCKOUT_KEY);
    if (storedLockout) setLockoutTime(new Date(storedLockout));
  }, []);

  useEffect(() => {
    if (lockoutTime) {
      localStorage.setItem(LOCKOUT_KEY, lockoutTime.toISOString());
      timerRef.current = setInterval(() => {
        const now = new Date();
        if (now >= lockoutTime) {
          setLockoutTime(null);
          localStorage.removeItem(LOCKOUT_KEY);
          if (timerRef.current) clearInterval(timerRef.current);
        }
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [lockoutTime]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  });

  const handleRecaptchaChange = (token: string | null) => setRecaptchaToken(token);
  const handleRecaptchaExpired = () => {
    setRecaptchaToken(null);
    toast({ title: "reCAPTCHA Expired", description: "Please complete it again", variant: "destructive" });
  };
  const handleRecaptchaError = () => {
    setRecaptchaToken(null);
    toast({ title: "reCAPTCHA Error", description: "Failed to load. Try again.", variant: "destructive" });
  };

  const onSubmit = async (data: FormValues) => {
    if (lockoutTime) {
      setErrorMessage("Too many failed attempts. Please wait.");
      return;
    }

    // ✅ Simulated demo login (bypass backend)
    if (data.email === "demo_admin" && data.password === "Password123!") {
      toast({ title: "Demo Login Successful", description: "Redirecting to dashboard..." });
      localStorage.setItem("fallback_token", "demo_token");
      navigate("/dashboard");
      return;
    }

    if (!recaptchaToken) {
      toast({ title: "reCAPTCHA Required", description: "Please complete verification", variant: "destructive" });
      return;
    }

    try {
      const payload = {
        email_id: data.email,
        password: data.password,
        recaptcha_token: recaptchaToken,
      };

      const response = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        recaptchaRef.current?.reset();
        setRecaptchaToken(null);
        const attemptsLeft = loginAttempts - 1;
        localStorage.setItem(ATTEMPTS_KEY, attemptsLeft.toString());

        if (attemptsLeft <= 0) {
          const timeout = new Date(Date.now() + 30 * 1000);
          setLockoutTime(timeout);
          setErrorMessage("Too many attempts. Wait 30 seconds.");
        } else {
          setLoginAttempts(attemptsLeft);
          setErrorMessage(`Invalid credentials. ${attemptsLeft} attempt(s) left.`);
        }
        throw new Error(result.error || "Login failed");
      }

      if (result.token) localStorage.setItem("fallback_token", result.token);

      localStorage.removeItem(ATTEMPTS_KEY);
      localStorage.removeItem(LOCKOUT_KEY);
      setLoginAttempts(3);
      setLockoutTime(null);
      setErrorMessage("");
      setRecaptchaToken(null);

      toast({ title: "Login Successful", description: "Redirecting..." });
      navigate("/dashboard");
    } catch (err: any) {
      console.error("Login error:", err.message || err);
    }
  };

  const lockoutSecondsLeft = lockoutTime ? Math.ceil((lockoutTime.getTime() - Date.now()) / 1000) : 0;

  return (
    <AuthCard
      cardTitle="Login to HSS Secure"
      cardDescription="Enter your credentials to access your account"
      footer={
        <div className="w-full flex flex-col gap-4 text-center text-sm text-muted-foreground">
          <div>Don't have an account? <Link to="/register" className="text-hss-purple-vivid hover:underline">Register here</Link></div>
          <Link to="/" className="text-muted-foreground hover:text-foreground">Return to home page</Link>
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
                <FormLabel>Employer ID</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your Employer ID"
                    {...field}
                    autoComplete="username"
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
                      {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className={`flex justify-center ${lockoutTime ? "blur-sm pointer-events-none opacity-50" : ""}`}>
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey={RECAPTCHA_SITE_KEY}
              onChange={handleRecaptchaChange}
              onExpired={handleRecaptchaExpired}
              onError={handleRecaptchaError}
              theme="light"
              size="normal"
            />
          </div>

          {errorMessage && <div className="text-red-600 text-center text-sm font-medium">{errorMessage}</div>}
          {lockoutTime && (
            <div className="text-red-600 text-center text-sm font-medium">
              Please wait {lockoutSecondsLeft} second{lockoutSecondsLeft === 1 ? "" : "s"} before trying again.
            </div>
          )}

          <div className="text-sm text-right">
            <Link to="/forgot-password" className="text-hss-purple-vivid hover:underline">Forgot your password?</Link>
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
