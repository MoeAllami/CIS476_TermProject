"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Navigation from "./components/Navigation";
import HomeSearch from "./components/HomeSearch";

export default function Home() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white">
      {/* Hero Section with Background Image */}
      <div className="relative h-screen">
        <div className="absolute inset-0 z-0">
          <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900" />
        </div>

        <div className="relative z-10 flex h-full">
          {/* Navigation Component */}
          <Navigation />

          {/* Hero Content */}
          <div className="flex-1 flex flex-col justify-center items-center px-6 text-white">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-4xl"
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Rent the Perfect Car, Anytime, Anywhere
              </h1>
              <p className="text-xl md:text-2xl mb-12 max-w-2xl mx-auto">
                DriveShare connects car owners with renters for a seamless
                car-sharing experience.
              </p>

              {/* Search Component */}
              <HomeSearch />

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
                <Link
                  href="/dashboard/cars"
                  className="bg-gray-800 text-white hover:bg-gray-700 transition py-3 px-8 rounded-full font-semibold text-lg"
                >
                  Browse your Cars
                </Link>

                <Link
                  href="/bookings"
                  className="bg-gray-800 text-white hover:bg-gray-700 transition py-3 px-8 rounded-full font-semibold text-lg"
                >
                  Browse Bookings
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="py-20 px-6 bg-gray-800" id="features">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            How DriveShare Works
          </h2>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                icon: "",
                title: "Find Your Perfect Car",
                description:
                  "Search from a wide variety of vehicles based on your preferences and location.",
              },
              {
                icon: "",
                title: "Book With Confidence",
                description:
                  "Secure your rental with our easy booking system and flexible cancellation policy.",
              },
              {
                icon: "",
                title: "Enjoy The Drive",
                description:
                  "Pick up your car and hit the road with our peer-to-peer car sharing platform.",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center p-6 rounded-lg border border-gray-700 bg-gray-900 shadow hover:shadow-lg hover:border-gray-600 transition-all"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-6 bg-gray-900" id="testimonials">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            What Our Users Say
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                quote:
                  "DriveShare made my vacation perfect. Found a convertible for our coastal drive!",
                name: "Sarah J.",
                location: "Miami, FL",
              },
              {
                quote:
                  "As a car owner, I've made over $2,000 renting my car when I'm not using it.",
                name: "Michael T.",
                location: "Austin, TX",
              },
              {
                quote:
                  "The booking process was seamless, and the car was exactly as described.",
                name: "Emma R.",
                location: "Seattle, WA",
              },
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gray-800 p-6 rounded-lg shadow border border-gray-700 hover:shadow-lg hover:border-gray-600 transition-all"
              >
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center mr-4">
                    <span className="font-bold text-white">
                      {testimonial.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-gray-400">
                      {testimonial.location}
                    </div>
                  </div>
                </div>
                <p className="text-gray-300 italic">"{testimonial.quote}"</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 px-6 bg-blue-600">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied users who have discovered the perfect
            car for their needs.
          </p>
          <Link
            href="/auth/signup"
            className="inline-block bg-white text-blue-600 hover:bg-gray-100 transition py-3 px-8 rounded-full font-semibold text-lg"
          >
            Create Your Account
          </Link>
        </div>
      </section>

      {/* Improved Footer */}
      <footer className="bg-gray-900 text-white py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-4">DriveShare</h3>
              <p className="text-gray-400">
                The easiest way to rent a car from trusted local hosts.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/dashboard/cars"
                    className="text-gray-400 hover:text-white transition"
                  >
                    Browse Cars
                  </Link>
                </li>
                <li>
                  <Link
                    href="#features"
                    className="text-gray-400 hover:text-white transition"
                  >
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link
                    href="#testimonials"
                    className="text-gray-400 hover:text-white transition"
                  >
                    Testimonials
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/help"
                    className="text-gray-400 hover:text-white transition"
                  >
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-gray-400 hover:text-white transition"
                  >
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/faq"
                    className="text-gray-400 hover:text-white transition"
                  >
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/terms"
                    className="text-gray-400 hover:text-white transition"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="text-gray-400 hover:text-white transition"
                  >
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>© {new Date().getFullYear()} DriveShare. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
