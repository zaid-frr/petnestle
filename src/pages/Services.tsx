import React from "react";
import { Syringe, Stethoscope, Ambulance, Scissors, Dumbbell } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Services() {
  const navigate = useNavigate();

  const services = [
    {
      id: 'vaccination',
      title: "Vaccination",
      description: "Keep your pets safe from preventable diseases with our comprehensive vaccination programs.",
      icon: <Syringe className="h-8 w-8" />,
      color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
      borderColor: "border-blue-200 dark:border-blue-800/50",
      image: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=400&h=300&fit=crop"
    },
    {
      id: 'checkup',
      title: "General Checkup",
      description: "Routine health examinations to ensure your pet is growing healthy and strong.",
      icon: <Stethoscope className="h-8 w-8" />,
      color: "bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400",
      borderColor: "border-teal-200 dark:border-teal-800/50",
      image: "https://images.unsplash.com/photo-1599443015574-be5fe8a05783?w=400&h=300&fit=crop"
    },
    {
      id: 'emergency',
      title: "Emergency Care",
      description: "24/7 emergency services for critical situations requiring immediate veterinary attention.",
      icon: <Ambulance className="h-8 w-8" />,
      color: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
      borderColor: "border-red-200 dark:border-red-800/50",
      image: "https://images.unsplash.com/photo-1584813470613-5b1c1cad3d69?w=400&h=300&fit=crop"
    },
    {
      id: 'training',
      title: "Pet Training",
      description: "Professional training services for obedience, agility, and behavioral correction.",
      icon: <Dumbbell className="h-8 w-8" />,
      color: "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400",
      borderColor: "border-orange-200 dark:border-orange-800/50",
      image: "https://images.unsplash.com/photo-1601758124510-52d02ddb7cbd?w=400&h=300&fit=crop"
    },
    {
      id: 'grooming',
      title: "Pet Grooming",
      description: "Professional grooming services including bathing, haircuts, and nail trimming.",
      icon: <Scissors className="h-8 w-8" />,
      color: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
      borderColor: "border-purple-200 dark:border-purple-800/50",
      image: "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=400&h=300&fit=crop"
    }
  ];

  return (
    <div className="py-16 bg-slate-50 dark:bg-slate-900 min-h-screen relative transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4">Veterinary Services</h1>
          <p className="text-xl text-slate-600 dark:text-slate-400">
            Comprehensive care for your furry family members. Click on a service to view available providers.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div
              key={service.id}
              onClick={() => navigate(`/providers/${service.id}`)}
              className={`bg-white dark:bg-slate-800 rounded-2xl border ${service.borderColor} shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer flex flex-col h-full overflow-hidden`}
            >
              <div className="h-48 w-full relative">
                <img 
                  src={service.image} 
                  alt={service.title} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className={`absolute -bottom-6 left-6 inline-flex items-center justify-center w-12 h-12 rounded-xl ${service.color} border-4 border-white dark:border-slate-800`}>
                  {service.icon}
                </div>
              </div>
              <div className="p-6 pt-10 flex flex-col flex-grow">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{service.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm flex-grow mb-6">
                  {service.description}
                </p>
                <button className="w-full py-2 px-4 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-medium rounded-lg transition-colors">
                  Find Providers
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
