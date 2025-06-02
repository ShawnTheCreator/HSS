import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";

const formSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email"),
  phone_number: z.string().min(1, "Phone number is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["admin", "staff"], { message: "Role is required" }),
  department: z.string().min(1, "Department is required"),
  biometric_hash: z.string().optional(),
  device_fingerprint: z.string().optional(),
  location_zone: z.string().optional()
});

type FormValues = z.infer<typeof formSchema>;

const Register: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema)
  });

  const navigate = useNavigate();

  const onSubmit = async (data: FormValues) => {
    try {
      const response = await fetch("https://hss-backend.onrender.com/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.msg || "Registration failed");
        return;
      }

      alert("Registration successful!");
      navigate("/login");
    } catch (error) {
      console.error("Error during registration:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-md rounded-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <input
            {...register("full_name")}
            placeholder="Full Name"
            className="w-full p-2 border rounded"
          />
          {errors.full_name && <p className="text-red-500 text-sm">{errors.full_name.message}</p>}
        </div>

        <div>
          <input
            {...register("email")}
            placeholder="Email"
            className="w-full p-2 border rounded"
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
        </div>

        <div>
          <input
            {...register("phone_number")}
            placeholder="Phone Number"
            className="w-full p-2 border rounded"
          />
          {errors.phone_number && <p className="text-red-500 text-sm">{errors.phone_number.message}</p>}
        </div>

        <div>
          <input
            {...register("password")}
            type="password"
            placeholder="Password"
            className="w-full p-2 border rounded"
          />
          {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
        </div>

        <div>
          <select {...register("role")} className="w-full p-2 border rounded">
            <option value="">Select Role</option>
            <option value="admin">Admin</option>
            <option value="staff">Staff</option>
          </select>
          {errors.role && <p className="text-red-500 text-sm">{errors.role.message}</p>}
        </div>

        <div>
          <input
            {...register("department")}
            placeholder="Department"
            className="w-full p-2 border rounded"
          />
          {errors.department && <p className="text-red-500 text-sm">{errors.department.message}</p>}
        </div>

        <div>
          <input
            {...register("biometric_hash")}
            placeholder="Biometric Hash (optional)"
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <input
            {...register("device_fingerprint")}
            placeholder="Device Fingerprint (optional)"
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <input
            {...register("location_zone")}
            placeholder="Location Zone (optional)"
            className="w-full p-2 border rounded"
          />
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Register
        </button>
      </form>
    </div>
  );
};

export default Register;
