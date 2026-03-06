import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Add this line
import axios from 'axios';
import { CheckCircle, MapPin, MessageSquare, ArrowRight } from 'lucide-react';
import './index.css';

// Component: Sticky Navbar
const Navbar = () => (
  <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-lg border-b border-slate-200 py-4">
    <div className="container mx-auto flex justify-between items-center px-6 md:px-12">
      <h1 className="text-2xl font-bold text-indigo-600 tracking-tight">Keja Find</h1>
      <div className="space-x-4">
        <Link to="/login" className="text-slate-600 font-medium hover:text-indigo-600">
          Sign In
        </Link>
        <Link
          to="/signup?role=landlord"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-sm md:px-8 md:py-4 md:text-lg rounded-xl md:rounded-2xl font-bold shadow-2xl shadow-indigo-300 transition-all hover:scale-105"
        >
          Join as Landlord
        </Link>
      </div>
    </div>
  </nav>
);

// Component: Feature Card
const FeatureCard = ({ icon: Icon, title, desc }) => (
  <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300">
    <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 mb-6">
      <Icon size={24} />
    </div>
    <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
    <p className="text-slate-500 leading-relaxed">{desc}</p>
  </div>
);

function App() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-28 pb-16 md:pt-48 md:pb-32 bg-gradient-to-b from-indigo-50 via-white to-slate-50">
        <div className="container mx-auto px-6 text-center">
          <div className="inline-block px-4 py-1.5 mb-6 text-sm font-semibold tracking-wide text-indigo-600 uppercase bg-indigo-50 rounded-full">
            Your number one source for Juja rentals
          </div>
          <h1 className="text-4xl md:text-7xl font-extrabold mb-6 md:mb-8 tracking-tight text-slate-900 leading-tight md:leading-none">
            Find Your Perfect Keja in Juja <br className="hidden md:block" />
            <span className="text-indigo-600 underline decoration-indigo-200">Without the Trek.</span>
          </h1>
          <p className="text-base md:text-xl text-slate-600 mb-8 md:mb-10 max-w-2xl mx-auto leading-relaxed px-2">
            The only platform specialized for Kenyatta Road, Highpoint, and Juja. No more fake photos or ghost landlords.
          </p>
          <Link to="/signup" className="inline-block bg-indigo-600 text-white px-6 py-3 text-base md:px-8 md:py-4 md:text-lg rounded-xl md:rounded-2xl font-bold shadow-2xl shadow-indigo-300 transition hover:bg-indigo-700">
            Get Started
          </Link>

          <div className="mt-16 flex flex-wrap justify-center items-center gap-8 opacity-50 grayscale">
            <span className="font-bold text-xl">500+ Users Trusted Us</span>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-16 md:py-24 container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          <FeatureCard
            icon={CheckCircle}
            title="Verified Listings"
            desc="Every single bed-sitter and apartment is manually vetted by our team in Juja."
          />
          <FeatureCard
            icon={MapPin}
            title="Distance to Gate"
            desc="Know exactly how many minutes it takes to walk to the JKUAT main gate or Gate C."
          />
          <FeatureCard
            icon={MessageSquare}
            title="Direct Chat"
            desc="Contact landlords directly via WhatsApp. No middle-men, no extra 'viewing fees'."
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-12 bg-white">
        <div className="container mx-auto px-6 text-center text-slate-500">
          <p className="font-medium">© 2026 Keja Find. Built for the Juja Community.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;