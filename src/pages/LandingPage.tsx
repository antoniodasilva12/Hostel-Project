import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiUsers, FiHome, FiBook, FiShield, FiSmartphone, FiArrowRight, FiCheck, FiAward, FiClock } from 'react-icons/fi';

const LandingPage: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [stats, setStats] = useState({ students: 0, rooms: 0, satisfaction: 0 });

  useEffect(() => {
    // Trigger animations after component mounts
    setIsVisible(true);
    
    // Animate statistics
    const timer = setTimeout(() => {
      setStats({
        students: 500,
        rooms: 200,
        satisfaction: 98
      });
    }, 500);

    // Handle scroll events for navbar
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1f3c] via-[#2d1f54] to-[#1f2f5c]">
      {/* Full-screen hero section with background image and gradient overlay */}
      <div className="relative h-screen">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-fixed"
          style={{
            backgroundImage: "url('/student-life.jpg')",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a1f3c]/95 via-[#2d1f54]/90 to-[#1f2f5c]/95 backdrop-blur-sm">
            {/* Navigation */}
            <nav className={`fixed top-0 left-0 right-0 transition-all duration-300 z-50 ${scrolled ? 'bg-[#1a1f3c]/95 shadow-lg backdrop-blur-sm py-3' : 'bg-transparent py-4 sm:py-6'}`}>
              <div className="container mx-auto flex justify-between items-center px-4">
                <div className="flex items-center">
                  <div className={`${scrolled ? 'bg-indigo-500/20' : 'bg-white/10'} p-2 sm:p-3 rounded-lg backdrop-blur-sm transform hover:scale-105 transition-transform duration-300`}>
                    <FiSmartphone className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-200" />
                  </div>
                  <div className="ml-3">
                    <div className="text-white text-lg sm:text-2xl font-bold tracking-tight">Student Portal</div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Link
                    to="/signup"
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 sm:px-6 sm:py-2 text-sm sm:text-base rounded-lg transition-all duration-300 backdrop-blur-sm hover:shadow-lg hover:shadow-indigo-500/20 flex items-center group"
                  >
                    Get Started
                    <FiArrowRight className="ml-2 transform group-hover:translate-x-1 transition-transform duration-300" />
                  </Link>
                </div>
              </div>
            </nav>

            {/* Centered content */}
            <div className="h-full flex items-center justify-center px-4">
              <div className={`text-center max-w-4xl mx-auto transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                <div className="bg-indigo-500/20 inline-block p-2 sm:p-3 rounded-full backdrop-blur-sm mb-4 sm:mb-6 transform hover:scale-110 transition-transform duration-300">
                  <FiHome className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-300" />
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4 leading-tight tracking-tight">
                  Welcome to Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400">Smart Hostel</span>
                </h1>
                <p className="text-sm sm:text-base md:text-lg text-indigo-200 mb-6 sm:mb-8 max-w-2xl mx-auto font-light tracking-wide leading-relaxed px-4">
                  Experience the future of student accommodation with our intelligent hostel management system. Modern living meets smart technology for a seamless campus experience.
                </p>
                <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
                  <Link
                    to="/signup"
                    className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 sm:px-8 sm:py-4 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/20 flex items-center justify-center group text-sm sm:text-base font-medium"
                  >
                    Get Started
                    <FiArrowRight className="ml-2 transform group-hover:translate-x-1 transition-transform duration-300" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-[#1a1f3c]/50 py-16 relative overflow-hidden backdrop-blur-sm">
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-5"></div>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center transform hover:scale-105 transition-transform duration-300">
              <div className="text-4xl sm:text-5xl font-bold text-white mb-2">
                {stats.students}+
              </div>
              <p className="text-indigo-300 text-lg">Happy Residents</p>
            </div>
            <div className="text-center transform hover:scale-105 transition-transform duration-300">
              <div className="text-4xl sm:text-5xl font-bold text-white mb-2">
                {stats.rooms}+
              </div>
              <p className="text-indigo-300 text-lg">Cozy Rooms</p>
            </div>
            <div className="text-center transform hover:scale-105 transition-transform duration-300">
              <div className="text-4xl sm:text-5xl font-bold text-white mb-2">
                {stats.satisfaction}%
              </div>
              <p className="text-indigo-300 text-lg">Student Happiness</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gradient-to-br from-[#1a1f3c] via-[#2d1f54] to-[#1f2f5c] py-24 sm:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-5"></div>
        <div className="container mx-auto px-4 sm:px-6 md:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6 tracking-tight">
              Your Complete Campus Living Experience
            </h2>
            <p className="text-lg text-indigo-200/90">
              Everything you need for a comfortable and enriching student life, right at your fingertips
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white/5 p-8 rounded-xl backdrop-blur-sm hover:bg-white/10 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/5 group transform hover:-translate-y-1">
              <div className="bg-indigo-500/20 p-4 rounded-lg w-fit mb-6 group-hover:bg-indigo-500/30 transition-all duration-300">
                <FiHome className="text-3xl text-indigo-300" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Smart Room Booking</h3>
              <p className="text-base text-indigo-200/90 leading-relaxed mb-6">
                Find and book your perfect room with real-time availability and instant confirmation.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center text-indigo-200">
                  <FiCheck className="mr-2 text-indigo-400" />
                  Real-time availability
                </li>
                <li className="flex items-center text-indigo-200">
                  <FiCheck className="mr-2 text-indigo-400" />
                  Instant confirmation
                </li>
              </ul>
            </div>
            <div className="bg-white/5 p-8 rounded-xl backdrop-blur-sm hover:bg-white/10 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/5 group transform hover:-translate-y-1">
              <div className="bg-indigo-500/20 p-4 rounded-lg w-fit mb-6 group-hover:bg-indigo-500/30 transition-all duration-300">
                <FiUsers className="text-3xl text-indigo-300" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Student Services</h3>
              <p className="text-base text-indigo-200/90 leading-relaxed mb-6">
                Comprehensive support services to make your stay comfortable and worry-free.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center text-indigo-200">
                  <FiCheck className="mr-2 text-indigo-400" />
                  24/7 maintenance support
                </li>
                <li className="flex items-center text-indigo-200">
                  <FiCheck className="mr-2 text-indigo-400" />
                  Laundry services
                </li>
              </ul>
            </div>
            <div className="bg-white/5 p-8 rounded-xl backdrop-blur-sm hover:bg-white/10 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/5 group transform hover:-translate-y-1">
              <div className="bg-indigo-500/20 p-4 rounded-lg w-fit mb-6 group-hover:bg-indigo-500/30 transition-all duration-300">
                <FiBook className="text-3xl text-indigo-300" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Resource Access</h3>
              <p className="text-base text-indigo-200/90 leading-relaxed mb-6">
                Easy access to all campus resources and facilities you need.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center text-indigo-200">
                  <FiCheck className="mr-2 text-indigo-400" />
                  Study areas
                </li>
                <li className="flex items-center text-indigo-200">
                  <FiCheck className="mr-2 text-indigo-400" />
                  Common spaces
                </li>
              </ul>
            </div>
            <div className="bg-white/5 p-8 rounded-xl backdrop-blur-sm hover:bg-white/10 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/5 group transform hover:-translate-y-1">
              <div className="bg-indigo-500/20 p-4 rounded-lg w-fit mb-6 group-hover:bg-indigo-500/30 transition-all duration-300">
                <FiShield className="text-3xl text-indigo-300" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">Safe & Secure</h3>
              <p className="text-base text-indigo-200/90 leading-relaxed mb-6">
                Your safety and comfort are our top priorities.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center text-indigo-200">
                  <FiCheck className="mr-2 text-indigo-400" />
                  24/7 security
                </li>
                <li className="flex items-center text-indigo-200">
                  <FiCheck className="mr-2 text-indigo-400" />
                  Secure access
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className="bg-[#1a1f3c]/50 py-24 relative overflow-hidden backdrop-blur-sm">
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-5"></div>
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6 tracking-tight">
              Why Choose Our Community?
            </h2>
            <p className="text-lg text-indigo-200/90">
              Join a vibrant student community that feels like family
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/5 p-6 rounded-xl backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
              <div className="bg-indigo-500/20 p-4 rounded-lg w-fit mb-6">
                <FiClock className="text-3xl text-indigo-300" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Always Available</h3>
              <p className="text-indigo-200/90">
                Access services and support whenever you need them, day or night
              </p>
            </div>
            <div className="bg-white/5 p-6 rounded-xl backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
              <div className="bg-indigo-500/20 p-4 rounded-lg w-fit mb-6">
                <FiAward className="text-3xl text-indigo-300" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Quality Living</h3>
              <p className="text-indigo-200/90">
                Experience comfortable, modern accommodation designed for student life
              </p>
            </div>
            <div className="bg-white/5 p-6 rounded-xl backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
              <div className="bg-indigo-500/20 p-4 rounded-lg w-fit mb-6">
                <FiUsers className="text-3xl text-indigo-300" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Community Spirit</h3>
              <p className="text-indigo-200/90">
                Be part of a welcoming community that supports your academic journey
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#1a1f3c] py-12 sm:py-16 border-t border-white/5">
        <div className="container mx-auto px-4 sm:px-6 md:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-indigo-500/20 p-3 rounded-lg">
                <FiSmartphone className="h-8 w-8 text-indigo-300" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Student Portal</h3>
            <p className="mb-4 text-indigo-200/80 text-base max-w-md mx-auto">
              Creating a home away from home for every student
            </p>
            <div className="flex justify-center space-x-6 mb-8">
              <Link to="/signup" className="text-indigo-300 hover:text-white transition-colors">Join Our Community</Link>
            </div>
            <div className="border-t border-white/5 pt-8">
              <p className="text-indigo-200/60 text-sm">
                &copy; {new Date().getFullYear()} Student Portal. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 