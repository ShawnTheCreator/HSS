import React, { useState, useRef } from "react";
import ReCAPTCHA from "react-google-recaptcha";

// For hashing the selfie image file
async function hashFile(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

const RECAPTCHA_SITE_KEY = "YOUR_RECAPTCHA_SITE_KEY";

const Register = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [biometricHash, setBiometricHash] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle selfie file selection + compute hash
  const handleSelfieChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelfieFile(file);
      try {
        const hash = await hashFile(file);
        setBiometricHash(hash);
      } catch {
        setError("Failed to process selfie image.");
        setBiometricHash(null);
      }
    }
  };

  // On reCAPTCHA success
  const onCaptchaChange = (token: string | null) => {
    setCaptchaToken(token);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!captchaToken) {
      setError("Please complete the CAPTCHA");
      return;
    }

    if (!biometricHash) {
      setError("Please upload a valid selfie for face verification");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          captchaToken,
          biometric_hash: biometricHash,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Registration failed");
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
      recaptchaRef.current?.reset();
      setCaptchaToken(null);
    }
  };

  if (success) {
    return <p>Registration successful! Please wait for admin approval.</p>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Name:</label>
        <input name="name" value={form.name} onChange={handleChange} required />
      </div>
      <div>
        <label>Email:</label>
        <input name="email" type="email" value={form.email} onChange={handleChange} required />
      </div>
      <div>
        <label>Password:</label>
        <input name="password" type="password" value={form.password} onChange={handleChange} required />
      </div>
      <div>
        <label>Confirm Password:</label>
        <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} required />
      </div>
      <div>
        <label>Upload Selfie for Face Verification:</label>
        <input type="file" accept="image/*" onChange={handleSelfieChange} required />
      </div>
      <div>
        <ReCAPTCHA
          sitekey={RECAPTCHA_SITE_KEY}
          onChange={onCaptchaChange}
          ref={recaptchaRef}
        />
      </div>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? "Registering..." : "Register"}
      </button>
    </form>
  );
};

export default Register;
