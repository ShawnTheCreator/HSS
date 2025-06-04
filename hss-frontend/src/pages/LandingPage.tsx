import React from "react";


const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 1. Navbar */}
      <nav className="w-full bg-white shadow-md fixed top-0 left-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo / Brand */}
            <div className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-gray-900">
                HSS <span className="text-purple-600">Secure</span>
              </span>
            </div>

            {/* Links */}
            <div className="flex items-center space-x-4">
              <a
                href="/login"
                className="text-gray-700 hover:text-gray-900 transition-colors"
              >
                Login
              </a>
              <a
                href="/register"
                className="px-4 py-2 bg-purple-600 text-white font-medium rounded-md hover:bg-purple-700 transition-colors"
              >
                Register
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <div className="pt-16">
        <section
          id="hero"
          className="relative pt-24 pb-16 bg-gradient-to-b from-white via-white to-gray-50"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col-reverse lg:flex-row items-center">
            {/* Hero Text */}
            <div className="w-full lg:w-1/2 mt-8 lg:mt-0">
              <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight">
                Healthcare Staff{" "}
                <span className="text-purple-600">Management</span>{" "}
                Platform
              </h1>
              <p className="mt-4 text-lg text-gray-600 max-w-md">
                Streamline your healthcare staff operations with our secure,
                efficient, and user-friendly management system.
              </p>
              <div className="mt-8 flex space-x-4">
                <a
                  href="#get-started"
                  className="px-6 py-3 bg-purple-600 text-white font-medium rounded-md hover:bg-purple-700 transition-colors"
                >
                  Get Started
                </a>
                <a
                  href="#learn-more"
                  className="px-6 py-3 border-2 border-gray-800 text-gray-800 font-medium rounded-md hover:bg-gray-100 transition-colors"
                >
                  Learn More
                </a>
              </div>
            </div>

            {/* Hero Illustration Placeholder */}
            <div className="w-full lg:w-1/2 flex justify-center lg:justify-end">
              <div className="w-80 h-80 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          </div>
        </section>
      </div>

      {/* 3. Dashboard Preview (overlapping) */}
      <section className="relative z-10 -mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white max-w-md lg:max-w-lg mx-auto rounded-xl shadow-lg p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                Dashboard Preview
              </h2>
              <span className="text-xs text-gray-500">Today</span>
            </div>

            {/* Stats Row */}
            <div className="flex space-x-4">
              <div className="flex-1 bg-white p-4 rounded-lg shadow-sm flex items-center space-x-3">
                <div className="p-3 bg-purple-100 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-purple-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5.121 17.804A7.5 7.5 0 0112 15v-1a7.5 7.5 0 017.5 7.5v.5h-15v-.5a7.5 7.5 0 01.621-2.696zM15 3a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Staff</p>
                  <p className="text-xl font-semibold text-gray-900">124</p>
                </div>
              </div>

              <div className="flex-1 bg-white p-4 rounded-lg shadow-sm flex items-center space-x-3">
                <div className="p-3 bg-purple-100 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-purple-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Shifts</p>
                  <p className="text-xl font-semibold text-gray-900">38</p>
                </div>
              </div>
            </div>

            {/* Compliance Status */}
            <div className="mt-6">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Compliance Status
              </p>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-purple-600 h-3 rounded-full"
                  style={{ width: "86%" }}
                />
              </div>
              <p className="mt-1 text-sm text-gray-500 text-right font-medium">
                86%
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Footer */}
      <footer className="mt-16 bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500">
          &copy; {new Date().getFullYear()} HSS Secure. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;