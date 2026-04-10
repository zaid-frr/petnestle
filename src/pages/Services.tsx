import React from "react";
import { Syringe, Stethoscope, Ambulance, Scissors, Dumbbell, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";

export default function Services() {
  const navigate = useNavigate();

  const services = [
    {
      id: 'vaccination',
      title: "Vaccination",
      description: "Keep your pets safe from preventable diseases with our comprehensive vaccination programs. Essential for long-term health and immunity.",
      icon: <Syringe className="h-6 w-6" />,
      color: "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400",
      image: "https://images.unsplash.com/photo-1584813470613-5b1c1cad3d69?auto=format&fit=crop&q=80&w=800&h=600"
    },
    {
      id: 'checkup',
      title: "General Checkup",
      description: "Routine health examinations to ensure your pet is growing healthy and strong. Early detection is key to preventing major health issues.",
      icon: <Stethoscope className="h-6 w-6" />,
      color: "bg-teal-100 dark:bg-teal-900/50 text-teal-600 dark:text-teal-400",
      image: "https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?auto=format&fit=crop&q=80&w=800&h=600"
    },
    {
      id: 'emergency',
      title: "Emergency Care",
      description: "24/7 emergency services for critical situations requiring immediate veterinary attention. Our hospitals are equipped for all urgencies.",
      icon: <Ambulance className="h-6 w-6" />,
      color: "bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400",
      image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=800&h=600"
    },
    {
      id: 'training',
      title: "Pet Training",
      description: "Professional training services for obedience, agility, and behavioral correction. Build a stronger bond with your well-behaved pet.",
      icon: <Dumbbell className="h-6 w-6" />,
      color: "bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400",
      image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&q=80&w=800&h=600"
    },
    {
      id: 'grooming',
      title: "Pet Grooming",
      description: "Professional grooming services including bathing, haircuts, and nail trimming. Keep your pet looking and feeling their absolute best.",
      icon: <Scissors className="h-6 w-6" />,
      color: "bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400",
      image: "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&q=80&w=800&h=600"
    }
  ];

  return (
    <div className="py-20 bg-slate-50 dark:bg-slate-900 min-h-screen relative transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-6">Premium Veterinary Services</h1>
          <p className="text-xl text-slate-600 dark:text-slate-400">
            Comprehensive care for your furry family members. Explore our services and connect with top-rated professionals.
          </p>
        </motion.div>

        <div className="space-y-12">
          {services.map((service, index) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              key={service.id}
              className={`flex flex-col ${index % 2 === 1 ? 'md:flex-row-reverse' : 'md:flex-row'} bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-xl transition-shadow duration-300`}
            >
              <div className="md:w-1/2 h-64 md:h-auto relative">
                <img 
                  src={service.image} 
                  alt={service.title} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent md:hidden"></div>
              </div>
              
              <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${service.color} mb-6`}>
                  {service.icon}
                </div>
                <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">{service.title}</h3>
                <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                  {service.description}
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 mt-auto">
                  <button 
                    onClick={() => navigate(`/providers/${service.id}`)}
                    className="flex-1 py-3 px-6 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    Find Providers <ArrowRight className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => navigate(`/services/${service.id}/details`)}
                    className="flex-1 py-3 px-6 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-medium rounded-xl transition-colors"
                  >
                    Know More
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
