import { Link } from "react-router-dom";
import { ArrowRight, HeartPulse, Stethoscope, ShieldCheck, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { motion } from "motion/react";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
      <section className="relative bg-teal-600 dark:bg-teal-800 text-white overflow-hidden transition-colors duration-200">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 relative z-10 flex flex-col md:flex-row items-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="md:w-1/2 text-center md:text-left mb-12 md:mb-0"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6">
              Smart Care for Your Pets
            </h1>
            <p className="text-lg md:text-xl text-teal-100 dark:text-teal-200 mb-8 max-w-2xl mx-auto md:mx-0">
              PetNestle is your AI-powered veterinary platform. We provide modern, reliable, and intelligent care solutions for your furry friends.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              {!user ? (
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-full text-teal-700 dark:text-teal-900 bg-white hover:bg-teal-50 transition-colors shadow-sm"
                >
                  Login / Register
                </Link>
              ) : (
                <Link
                  to="/dashboard"
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-full text-teal-700 dark:text-teal-900 bg-white hover:bg-teal-50 transition-colors shadow-sm"
                >
                  Go to Dashboard
                </Link>
              )}
              <Link
                to="/services"
                className="inline-flex items-center justify-center px-6 py-3 border border-white text-base font-medium rounded-full text-white hover:bg-teal-700 dark:hover:bg-teal-900 transition-colors"
              >
                Explore Services <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="md:w-1/2 flex justify-center"
          >
            <img
              src="https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=800&h=600"
              alt="Happy dog with owner"
              className="rounded-2xl shadow-2xl object-cover w-full max-w-md h-auto border-4 border-teal-500/30 dark:border-teal-700/50"
              referrerPolicy="no-referrer"
            />
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-slate-900 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Why Choose PetNestle?</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              We combine compassionate care with cutting-edge technology to ensure your pets live their best lives.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-8 text-center hover:shadow-lg transition-shadow border border-slate-100 dark:border-slate-700"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-teal-100 dark:bg-teal-900/50 text-teal-600 dark:text-teal-400 mb-6">
                <Stethoscope className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Expert Vet Care</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Access to top-tier veterinary professionals for checkups, treatments, and emergency care.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-8 text-center hover:shadow-lg transition-shadow border border-slate-100 dark:border-slate-700"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 mb-6">
                <HeartPulse className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Health Tracking</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Monitor your pet's health metrics, vaccination schedules, and medical history in one place.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-8 text-center hover:shadow-lg transition-shadow border border-slate-100 dark:border-slate-700 relative overflow-hidden"
            >
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-100 dark:bg-purple-900/30 rounded-full blur-2xl"></div>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 mb-6 relative z-10">
                <Sparkles className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 relative z-10">Gemini AI Assistant</h3>
              <p className="text-slate-600 dark:text-slate-400 relative z-10">
                Get instant, intelligent answers to common pet care questions powered by Google's Gemini AI.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
