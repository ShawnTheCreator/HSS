
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Users, Calendar, ClipboardCheck } from "lucide-react";

const Home = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Navigation */}
      <header className="border-b border-border/40">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-hss-purple-vivid">HSS</span>
            <span className="text-2xl font-bold">Secure</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link to="/register">
              <Button className="bg-hss-purple-vivid hover:bg-hss-purple/90">Register</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-24 container relative animate-fade-in">
        <div className="absolute inset-0 bg-[url('/bg-grid.svg')] bg-center opacity-5 animate-pulse pointer-events-none"></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 animate-slide-in-bottom">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
              Healthcare Staff <span className="text-hss-purple-vivid animate-pulse">Management</span> Platform
            </h1>
            <p className="text-xl text-muted-foreground max-w-[600px]">
              Streamline your healthcare staff operations with our secure, 
              efficient, and user-friendly management system.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/register">
                <Button size="lg" className="bg-hss-purple-vivid hover:bg-hss-purple/90 animate-scale-in">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                className="border-black 
                  text-black 
                  font-extrabold 
                  shadow-md 
                  animate-scale-in 
                  transition-all
                  hover:bg-black/10 
                  hover:shadow-xl 
                  focus-visible:ring-2 
                  focus-visible:ring-hss-blue-ocean
                  relative 
                  overflow-hidden
                  hover:after:scale-x-100
                  after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-hss-purple-vivid after:origin-bottom-right after:transition-transform after:duration-200"
                style={{ textShadow: "0 2px 8px #fff, 0 2px 16px rgba(0,0,0,0.2)" }}
              >
                <span className="relative z-10">Learn More</span>
              </Button>
            </div>
          </div>
          <div className="relative p-6 animate-scale-in">
            <div className="absolute inset-0 bg-hss-purple-dark/10 rounded-2xl blur-3xl pointer-events-none"></div>
            <div className="relative bg-card border border-border/50 rounded-2xl shadow-xl overflow-hidden animate-fade-in">
              <div className="p-6">
                <h3 className="font-bold text-lg mb-3 animate-slide-in-bottom">Dashboard Preview</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-background/80 p-4 rounded-lg border border-border/50 flex items-center gap-3 animate-slide-in-right">
                      <div className="bg-hss-purple-vivid/20 p-2 rounded-full">
                        <Users className="h-5 w-5 text-hss-purple-vivid" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Staff</p>
                        <p className="text-xl font-bold">124</p>
                      </div>
                    </div>
                    <div className="bg-background/80 p-4 rounded-lg border border-border/50 flex items-center gap-3 animate-slide-in-right [animation-delay:150ms]">
                      <div className="bg-hss-blue-ocean/20 p-2 rounded-full">
                        <Calendar className="h-5 w-5 text-hss-blue-ocean" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Shifts</p>
                        <p className="text-xl font-bold">38</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-background/80 p-4 rounded-lg border border-border/50 animate-fade-in [animation-delay:300ms]">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium">Compliance Status</h4>
                      <span className="text-xs bg-hss-purple-vivid/20 text-hss-purple-vivid px-2 py-1 rounded-full">
                        Today
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Complete</span>
                        <span className="text-sm font-medium">86%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-hss-purple-vivid rounded-full animate-pulse" style={{ width: "86%" }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted animate-fade-in [animation-delay:250ms]">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 animate-slide-in-bottom">Key Features</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our platform provides everything you need to manage your healthcare staff effectively
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card p-6 rounded-xl border border-border animate-slide-in-bottom [animation-delay:100ms] hover:scale-105 transition-transform duration-200">
              <div className="bg-hss-purple-vivid/20 w-12 h-12 flex items-center justify-center rounded-lg mb-4 animate-pulse">
                <Users className="text-hss-purple-vivid h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Staff Management</h3>
              <p className="text-muted-foreground">
                Easily manage staff profiles, qualifications, and availability all in one place.
              </p>
            </div>
            
            <div className="bg-card p-6 rounded-xl border border-border animate-slide-in-bottom [animation-delay:200ms] hover:scale-105 transition-transform duration-200">
              <div className="bg-hss-blue-ocean/20 w-12 h-12 flex items-center justify-center rounded-lg mb-4 animate-pulse">
                <Calendar className="text-hss-blue-ocean h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Shift Scheduling</h3>
              <p className="text-muted-foreground">
                Create and manage staff schedules with intelligent conflict detection and notifications.
              </p>
            </div>
            
            <div className="bg-card p-6 rounded-xl border border-border animate-slide-in-bottom [animation-delay:300ms] hover:scale-105 transition-transform duration-200">
              <div className="bg-hss-purple-medium/20 w-12 h-12 flex items-center justify-center rounded-lg mb-4 animate-pulse">
                <ClipboardCheck className="text-hss-purple-medium h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Compliance Tracking</h3>
              <p className="text-muted-foreground">
                Monitor certifications, licenses, and training requirements with automated alerts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 container animate-fade-in [animation-delay:400ms]">
        <div className="bg-hss-purple-dark text-white rounded-2xl p-8 sm:p-12 relative overflow-hidden animate-scale-in">
          <div className="absolute inset-0 bg-[url('/bg-grid.svg')] opacity-10 animate-pulse pointer-events-none"></div>
          <div className="relative z-10 max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4 animate-slide-in-bottom">Ready to streamline your healthcare staff management?</h2>
            <p className="text-hss-purple-light mb-8">
              Join hundreds of healthcare facilities using HSS Secure to improve efficiency and compliance.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/register">
                <Button size="lg" variant="default" className="bg-white text-hss-purple-dark hover:bg-white/90 animate-fade-in">
                  Get Started
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 animate-fade-in [animation-delay:200ms]">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background animate-fade-in [animation-delay:700ms]">
        <div className="container py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <span className="text-xl font-bold text-hss-purple-vivid">HSS</span>
              <span className="text-xl font-bold">Secure</span>
            </div>
            
            <div className="flex flex-wrap justify-center gap-6">
              <Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors duration-150 animate-fade-in">
                About
              </Link>
              <Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors duration-150 animate-fade-in [animation-delay:80ms]">
                Contact
              </Link>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors duration-150 animate-fade-in [animation-delay:160ms]">
                Privacy
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors duration-150 animate-fade-in [animation-delay:240ms]">
                Terms
              </a>
            </div>
          </div>
          <div className="mt-8 text-center text-muted-foreground text-sm animate-fade-in [animation-delay:300ms]">
            &copy; {new Date().getFullYear()} HSS Secure. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;

