import React from "react";
import { Search, Building2, Ambulance, GraduationCap, Scissors, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";

export default function Services() {
  const navigate = useNavigate();

  const services = [
    {
      id: 'vaccination',
      title: "Find Vet",
      description: "Connect with verified veterinarians in your area. Get instant access to qualified pet care professionals.",
      features: ["Verified Vets", "Instant Booking", "24/7 Support"],
      icon: <Search className="h-5 w-5" />,
      color: "bg-teal-400 text-white",
      image: "https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?auto=format&fit=crop&q=80&w=800&h=600"
    },
    {
      id: 'checkup',
      title: "Clinic & Hospital",
      description: "Discover top-rated pet clinics and hospitals with advanced medical facilities and expert care teams.",
      features: ["Advanced Facilities", "Expert Teams", "Emergency Care"],
      icon: <Building2 className="h-5 w-5" />,
      color: "bg-teal-400 text-white",
      image: "https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&q=80&w=800&h=600"
    },
    {
      id: 'emergency',
      title: "Emergency Care",
      description: "24/7 emergency services for critical situations requiring immediate veterinary attention. Our hospitals are equipped for all urgencies.",
      features: ["24/7 Availability", "Critical Care", "Immediate Response"],
      icon: <Ambulance className="h-5 w-5" />,
      color: "bg-teal-400 text-white",
      image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=800&h=600"
    },
    {
      id: 'training',
      title: "Pet Trainer",
      description: "Connect with certified pet trainers for behavioral training, obedience classes, and specialized care.",
      features: ["Certified Trainers", "Behavioral Training", "Obedience Classes"],
      icon: <GraduationCap className="h-5 w-5" />,
      color: "bg-teal-400 text-white",
      image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&q=80&w=800&h=600"
    },
    {
      id: 'grooming',
      title: "Pet Grooming",
      description: "Professional grooming services including bathing, haircuts, and nail trimming. Keep your pet looking and feeling their absolute best.",
      features: ["Professional Groomers", "Spa Treatments", "Hygiene Care"],
      icon: <Scissors className="h-5 w-5" />,
      color: "bg-teal-400 text-white",
      image: "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&q=80&w=800&h=600"
    }
  ];

  return (
    <div className="py-20 bg-slate-50 dark:bg-slate-900 min-h-screen relative transition-colors duration-200">
      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-6">Premium Veterinary Services</h1>
          <p className="text-xl text-slate-600 dark:text-slate-400">
            Comprehensive care for your furry family members. Explore our services and connect with top-rated professionals.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              key={service.id}
              className="bg-white dark:bg-slate-800 rounded-[2rem] overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-xl transition-all duration-300 flex flex-col"
            >
              <div className="h-48 relative">
                <img 
                  src={service.image} 
                  alt={service.title} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className={`absolute top-4 left-4 w-10 h-10 rounded-full ${service.color} flex items-center justify-center shadow-lg`}>
                  {service.icon}
                </div>
              </div>
              
              <div className="p-8 flex flex-col flex-grow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-teal-400">
                    {service.icon}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">{service.title}</h3>
                </div>
                
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-8 flex-grow leading-relaxed">
                  {service.description}
                </p>
                
                <ul className="space-y-3 mb-8">
                  {service.features.map((feature, i) => (
                    <li key={i} className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                      <div className="w-1.5 h-1.5 rounded-full bg-teal-400 mr-3 flex-shrink-0"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <button 
                  onClick={() => navigate(`/services/${service.id}/details`)}
                  className="w-full py-3.5 px-6 bg-teal-400 hover:bg-teal-500 text-white font-bold rounded-full transition-colors flex items-center justify-center gap-2 uppercase text-xs tracking-wider"
                >
                  EXPLORE SERVICE <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
