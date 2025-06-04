import React from "react";


const GetStarted: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="w-full bg-white shadow-md fixed top-0 left-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-gray-900">
                HSS <span className="text-purple-600">Secure</span>
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="/"
                className="text-gray-700 hover:text-gray-900 transition-colors"
              >
                Home
              </a>
              <a
                href="/get-started"
                className="text-gray-900 font-medium"
              >
                Get Started
              </a>
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

      {/* Content Container */}
      <div className="pt-16">
        {/* Hero Section */}
        <section
          id="get-started-hero"
          className="relative pt-24 pb-16 bg-gradient-to-b from-white via-white to-gray-50"
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight">
              Get Started with HSS <span className="text-purple-600">Secure</span>
            </h1>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Join hundreds of healthcare organizations who trust HSS Secure
              to streamline staff scheduling, compliance tracking, and shift
              management—all in one intuitive platform.
            </p>
            <div className="mt-8 flex justify-center space-x-4">
              <a
                href="#pricing"
                className="px-6 py-3 bg-purple-600 text-white font-medium rounded-md hover:bg-purple-700 transition-colors"
              >
                See Pricing
              </a>
              <a
                href="#features"
                className="px-6 py-3 border-2 border-gray-800 text-gray-800 font-medium rounded-md hover:bg-gray-100 transition-colors"
              >
                Learn More
              </a>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 text-center">
              Key Features
            </h2>
            <p className="mt-4 text-center text-gray-600 max-w-2xl mx-auto">
              Everything you need to manage your healthcare staff efficiently,
              securely, and compliantly.
            </p>
            <div className="mt-10 grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {/* Feature Card 1 */}
              <div className="bg-gray-50 p-6 rounded-lg shadow-md">
                <div className="p-3 bg-purple-100 rounded-full inline-block">
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
                      d="M12 8c1.657 0 3-1.343 3-3S13.657 2 12 2 9 3.343 9 5s1.343 3 3 3zM8.25 14.25a5.25 5.25 0 0110.5 0V17H8.25v-2.75z"
                    />
                  </svg>
                </div>
                <h3 className="mt-4 text-xl font-semibold text-gray-800">
                  Staff Profiles
                </h3>
                <p className="mt-2 text-gray-600">
                  Maintain comprehensive profiles for every staff member,
                  including certifications, contact info, and shift history.
                </p>
              </div>

              {/* Feature Card 2 */}
              <div className="bg-gray-50 p-6 rounded-lg shadow-md">
                <div className="p-3 bg-purple-100 rounded-full inline-block">
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
                      d="M3 7h18M3 12h18M3 17h18"
                    />
                  </svg>
                </div>
                <h3 className="mt-4 text-xl font-semibold text-gray-800">
                  Shift Scheduling
                </h3>
                <p className="mt-2 text-gray-600">
                  Create, assign, and adjust shifts in real time. Ensure optimal
                  coverage while respecting staff availability.
                </p>
              </div>

              {/* Feature Card 3 */}
              <div className="bg-gray-50 p-6 rounded-lg shadow-md">
                <div className="p-3 bg-purple-100 rounded-full inline-block">
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
                      d="M9 12l2 2 4-4M7 4h10M7 20h10M7 8h10"
                    />
                  </svg>
                </div>
                <h3 className="mt-4 text-xl font-semibold text-gray-800">
                  Compliance Tracking
                </h3>
                <p className="mt-2 text-gray-600">
                  Monitor licenses, training renewals, and certifications to
                  ensure every team member is up to date.
                </p>
              </div>

              {/* Feature Card 4 */}
              <div className="bg-gray-50 p-6 rounded-lg shadow-md">
                <div className="p-3 bg-purple-100 rounded-full inline-block">
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
                      d="M12 11c0-1.657-1.343-3-3-3S6 9.343 6 11s1.343 3 3 3 3-1.343 3-3zM12 11v6M6 17h12"
                    />
                  </svg>
                </div>
                <h3 className="mt-4 text-xl font-semibold text-gray-800">
                  Analytics & Reports
                </h3>
                <p className="mt-2 text-gray-600">
                  Track staffing levels, overtime hours, and compliance
                  metrics with built-in reporting dashboards.
                </p>
              </div>

              {/* Feature Card 5 */}
              <div className="bg-gray-50 p-6 rounded-lg shadow-md">
                <div className="p-3 bg-purple-100 rounded-full inline-block">
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
                      d="M17 9V7a5 5 0 00-10 0v2H5v12h14V9h-2z"
                    />
                  </svg>
                </div>
                <h3 className="mt-4 text-xl font-semibold text-gray-800">
                  Secure Access Control
                </h3>
                <p className="mt-2 text-gray-600">
                  Role-based permissions ensure that only authorized personnel
                  can view or modify sensitive data.
                </p>
              </div>

              {/* Feature Card 6 */}
              <div className="bg-gray-50 p-6 rounded-lg shadow-md">
                <div className="p-3 bg-purple-100 rounded-full inline-block">
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
                      d="M3 3h18v18H3V3z"
                    />
                  </svg>
                </div>
                <h3 className="mt-4 text-xl font-semibold text-gray-800">
                  24/7 Support
                </h3>
                <p className="mt-2 text-gray-600">
                  Our dedicated support team is available around the clock to
                  help you resolve issues and answer questions.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-16 bg-gray-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900">Pricing Plans</h2>
            <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
              Choose a plan that fits your organization’s needs. No hidden fees,
              cancel anytime.
            </p>
            <div className="mt-10 grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {/* Basic Plan */}
              <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col">
                <h3 className="text-xl font-semibold text-gray-800">Basic</h3>
                <p className="mt-2 text-gray-600">For small clinics and practices</p>
                <p className="mt-4 text-4xl font-extrabold text-gray-900">
                  $49<span className="text-xl font-medium text-gray-600">/mo</span>
                </p>
                <ul className="mt-6 space-y-3 text-left text-gray-600 flex-1">
                  <li className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-green-500 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 00-1.414 0L9 11.586 6.707 9.293a1 1 0 10-1.414 1.414L9 14.414l7.121-7.121a1 1 0 000-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Up to 25 users
                  </li>
                  <li className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-green-500 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 00-1.414 0L9 11.586 6.707 9.293a1 1 0 10-1.414 1.414L9 14.414l7.121-7.121a1 1 0 000-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Basic scheduling & compliance
                  </li>
                  <li className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-red-500 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M14.348 5.652a.5.5 0 10-.707-.707L10 8.586 6.36 4.948a.5.5 0 00-.707.707L9.293 10l-3.64 3.638a.5.5 0 00.707.707L10 11.414l3.638 3.64a.5.5 0 00.707-.707L10.707 10l3.641-3.638z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Analytics & Reporting
                  </li>
                </ul>
                <a
                  href="/register?plan=basic"
                  className="mt-6 px-4 py-2 bg-purple-600 text-white font-medium rounded-md hover:bg-purple-700 transition-colors"
                >
                  Start Basic
                </a>
              </div>

              {/* Pro Plan */}
              <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col border-2 border-purple-600">
                <h3 className="text-xl font-semibold text-gray-800">Pro</h3>
                <p className="mt-2 text-gray-600">For midsize hospitals</p>
                <p className="mt-4 text-4xl font-extrabold text-gray-900">
                  $99<span className="text-xl font-medium text-gray-600">/mo</span>
                </p>
                <ul className="mt-6 space-y-3 text-left text-gray-600 flex-1">
                  <li className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-green-500 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 00-1.414 0L9 11.586 6.707 9.293a1 1 0 10-1.414 1.414L9 14.414l7.121-7.121a1 1 0 000-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Up to 100 users
                  </li>
                  <li className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-green-500 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 00-1.414 0L9 11.586 6.707 9.293a1 1 0 10-1.414 1.414L9 14.414l7.121-7.121a1 1 0 000-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Advanced scheduling & compliance
                  </li>
                  <li className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-green-500 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 00-1.414 0L9 11.586 6.707 9.293a1 1 0 10-1.414 1.414L9 14.414l7.121-7.121a1 1 0 000-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Analytics & Reporting
                  </li>
                  <li className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-green-500 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 00-1.414 0L9 11.586 6.707 9.293a1 1 0 10-1.414 1.414L9 14.414l7.121-7.121a1 1 0 000-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Dedicated account manager
                  </li>
                </ul>
                <a
                  href="/register?plan=pro"
                  className="mt-6 px-4 py-2 bg-purple-600 text-white font-medium rounded-md hover:bg-purple-700 transition-colors"
                >
                  Start Pro
                </a>
              </div>

              {/* Enterprise Plan */}
              <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col">
                <h3 className="text-xl font-semibold text-gray-800">Enterprise</h3>
                <p className="mt-2 text-gray-600">For large healthcare networks</p>
                <p className="mt-4 text-4xl font-extrabold text-gray-900">
                  Contact Us
                </p>
                <ul className="mt-6 space-y-3 text-left text-gray-600 flex-1">
                  <li className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-green-500 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 00-1.414 0L9 11.586 6.707 9.293a1 1 0 10-1.414 1.414L9 14.414l7.121-7.121a1 1 0 000-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Unlimited users
                  </li>
                  <li className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-green-500 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 00-1.414 0L9 11.586 6.707 9.293a1 1 0 10-1.414 1.414L9 14.414l7.121-7.121a1 1 0 000-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Custom integrations & APIs
                  </li>
                  <li className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-green-500 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 00-1.414 0L9 11.586 6.707 9.293a1 1 0 10-1.414 1.414L9 14.414l7.121-7.121a1 1 0 000-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Enterprise-grade security & compliance
                  </li>
                  <li className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-green-500 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 00-1.414 0L9 11.586 6.707 9.293a1 1 0 10-1.414 1.414L9 14.414l7.121-7.121a1 1 0 000-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                    24/7 VIP support
                  </li>
                </ul>
                <a
                  href="/contact-sales"
                  className="mt-6 px-4 py-2 bg-purple-600 text-white font-medium rounded-md hover:bg-purple-700 transition-colors"
                >
                  Contact Sales
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 text-center">
              Frequently Asked Questions
            </h2>
            <div className="mt-8 space-y-6">
              {/* Question 1 */}
              <div>
                <button
                  type="button"
                  className="w-full text-left flex justify-between items-center bg-gray-100 p-4 rounded-lg shadow-sm focus:outline-none"
                  onClick={(e) => {
                    const panel = (e.currentTarget.nextElementSibling as HTMLDivElement);
                    panel.classList.toggle("hidden");
                  }}
                >
                  <span className="text-lg font-medium text-gray-800">
                    What is included in the Basic plan?
                  </span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-600 transform transition-transform duration-200"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="mt-2 px-4 py-3 bg-gray-50 rounded-lg hidden">
                  <p className="text-gray-600">
                    The Basic plan includes up to 25 users, basic scheduling,
                    compliance tracking, and email support. Analytics & reporting
                    are not included in this tier.
                  </p>
                </div>
              </div>

              {/* Question 2 */}
              <div>
                <button
                  type="button"
                  className="w-full text-left flex justify-between items-center bg-gray-100 p-4 rounded-lg shadow-sm focus:outline-none"
                  onClick={(e) => {
                    const panel = (e.currentTarget.nextElementSibling as HTMLDivElement);
                    panel.classList.toggle("hidden");
                  }}
                >
                  <span className="text-lg font-medium text-gray-800">
                    Can I upgrade my plan later?
                  </span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-600 transform transition-transform duration-200"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="mt-2 px-4 py-3 bg-gray-50 rounded-lg hidden">
                  <p className="text-gray-600">
                    Yes! You can upgrade or downgrade your plan at any time from
                    your account settings. Changes will take effect immediately,
                    and billing will be prorated accordingly.
                  </p>
                </div>
              </div>

              {/* Question 3 */}
              <div>
                <button
                  type="button"
                  className="w-full text-left flex justify-between items-center bg-gray-100 p-4 rounded-lg shadow-sm focus:outline-none"
                  onClick={(e) => {
                    const panel = (e.currentTarget.nextElementSibling as HTMLDivElement);
                    panel.classList.toggle("hidden");
                  }}
                >
                  <span className="text-lg font-medium text-gray-800">
                    Do you offer a free trial?
                  </span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-600 transform transition-transform duration-200"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="mt-2 px-4 py-3 bg-gray-50 rounded-lg hidden">
                  <p className="text-gray-600">
                    Absolutely. We offer a 14-day free trial on the Pro plan.
                    No credit card required. If you love it (and we think you
                    will), simply choose a paid plan before your trial ends.
                  </p>
                </div>
              </div>

              {/* Question 4 */}
              <div>
                <button
                  type="button"
                  className="w-full text-left flex justify-between items-center bg-gray-100 p-4 rounded-lg shadow-sm focus:outline-none"
                  onClick={(e) => {
                    const panel = (e.currentTarget.nextElementSibling as HTMLDivElement);
                    panel.classList.toggle("hidden");
                  }}
                >
                  <span className="text-lg font-medium text-gray-800">
                    Is my data secure?
                  </span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-600 transform transition-transform duration-200"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="mt-2 px-4 py-3 bg-gray-50 rounded-lg hidden">
                  <p className="text-gray-600">
                    Yes. HSS Secure is built with enterprise‐grade security in mind.
                    We use AES‐256 encryption at rest, TLS 1.2+ in transit, and
                    role‐based access controls. Our infrastructure is SOC 2 Type II
                    compliant.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section id="cta" className="py-16 bg-purple-600">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
            <h2 className="text-3xl font-bold">Ready to Transform Your Staffing?</h2>
            <p className="mt-4 text-lg">
              Sign up today and get 14 days of Pro plan free. No credit card required.
            </p>
            <a
              href="/register"
              className="mt-6 inline-block px-8 py-3 bg-white text-purple-600 font-semibold rounded-md hover:bg-gray-100 transition-colors"
            >
              Start Your Free Trial
            </a>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-16 bg-white py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500">
            &copy; {new Date().getFullYear()} HSS Secure. All rights reserved.
          </div>
        </footer>
      </div>
    </div>
  );
};

export default GetStarted;