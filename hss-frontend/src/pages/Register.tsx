import { useState } from "react";
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

// Define types directly in the component
type ApiResponse<T = any> = {
  success: boolean;
  message?: string;
  data?: T;
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
        biometric_hash: "", // You'd get this from biometric auth
        device_fingerprint: "", // You'd generate this client-side
        location_zone: "", // You'd get this from geolocation
      };

      const response = await axios.post<ApiResponse>(
        "/api/auth/register", 
        registrationData
      );

      if (response.data.success) {
        toast({
          title: "Registration Successful",
          description: "Your account has been created successfully",
        });
        navigate("/login");
      } else {
        throw new Error(response.data.message || "Registration failed");
      }
    } catch (error) {
      let errorMessage = "An unexpected error occurred";
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.msg || error.response?.data?.error || error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast({
        title: "Registration Failed",
        description: errorMessage,
        variant: "destructive",
      });
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
          {/* Form fields remain exactly the same as in your original component */}
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
          
          {/* Include all your other form fields exactly as they were */}
          {/* ... */}

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