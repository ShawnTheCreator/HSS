import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Scheduling from "./pages/Scheduling";
import Compliance from "./pages/Compliance";
import Staff from "./pages/Staff";
import NotFound from "./pages/NotFound";
import LandingPage from "./pages/LandingPage";
import GetStarted from "./pages/GetStarted";
import ContactForm from "./pages/Contact"

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/getstarted" element={<GetStarted />} />
          <Route path="/home" element={<Home />} />
          <Route path="/contactform" element={<ContactForm />}/>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/scheduling" element={<Scheduling />} />
          <Route path="/compliance" element={<Compliance />} />
          <Route path="/staff" element={<Staff />} />
          {/* Additional routes to be implemented */}
          {/* <Route path="/notifications" element={<Notifications />} /> */}
          {/* <Route path="/settings" element={<Settings />} /> */}
          {/* <Route path="/reports" element={<Reports />} /> */}
          {/* <Route path="/about" element={<About />} /> */}
          {/* <Route path="/contact" element={<Contact />} /> */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
