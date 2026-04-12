import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { motion } from "motion/react";

const serviceDetailsMap: Record<string, any> = {
  vaccination: { 
    name: "Vaccination", 
    description: "Keep your pets safe from preventable diseases with our comprehensive vaccination programs. Essential for long-term health and immunity.", 
    price: "₹500", 
    duration: "30 mins",
    image: "https://images.unsplash.com/photo-1584813470613-5b1c1cad3d69?auto=format&fit=crop&q=80&w=1200&h=600",
    benefits: [
      "Prevents deadly diseases like Rabies and Parvovirus",
      "Boosts overall immune system",
      "Required for travel and boarding",
      "Cost-effective compared to treating diseases"
    ]
  },
  checkup: { 
    name: "General Checkup", 
    description: "Routine health examinations to ensure your pet is growing healthy and strong. Early detection is key to preventing major health issues.", 
    price: "₹300", 
    duration: "45 mins",
    image: "https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?auto=format&fit=crop&q=80&w=1200&h=600",
    benefits: [
      "Early detection of hidden illnesses",
      "Weight and nutritional assessment",
      "Dental health check",
      "Parasite prevention and control"
    ]
  },
  emergency: { 
    name: "Emergency Care", 
    description: "24/7 emergency services for critical situations requiring immediate veterinary attention. Our hospitals are equipped for all urgencies.", 
    price: "₹1500", 
    duration: "Immediate",
    image: "https://images.unsplash.com/photo-1512636613085-7d01a0f67203?auto=format&fit=crop&q=80&w=1200&h=600",
    benefits: [
      "Available 24/7, 365 days a year",
      "State-of-the-art life-saving equipment",
      "Experienced emergency veterinarians",
      "Immediate triage and stabilization"
    ]
  },
  training: { 
    name: "Pet Training", 
    description: "Professional training services for obedience, agility, and behavioral correction. Build a stronger bond with your well-behaved pet.", 
    price: "₹1000", 
    duration: "60 mins",
    image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&q=80&w=1200&h=600",
    benefits: [
      "Improves communication between pet and owner",
      "Resolves behavioral issues (barking, biting)",
      "Mental stimulation and confidence building",
      "Socialization with other pets and people"
    ]
  },
  grooming: { 
    name: "Pet Grooming", 
    description: "Professional grooming services including bathing, haircuts, and nail trimming. Keep your pet looking and feeling their absolute best.", 
    price: "₹800", 
    duration: "90 mins",
    image: "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&q=80&w=1200&h=600",
    benefits: [
      "Maintains healthy coat and skin",
      "Prevents matting and infections",
      "Early detection of skin issues or lumps",
      "Reduces shedding and allergens in the home"
    ]
  },
  petcare: {
    name: "Pet Care & Daycare",
    description: "Safe, reliable pet daycare and boarding services with playtime, rest, and attentive care while you are away.",
    price: "₹800",
    duration: "Full day",
    image: "https://images.unsplash.com/photo-1598136491881-8042b84bf49b?auto=format&fit=crop&q=80&w=1200&h=600",
    benefits: [
      "Supervised play and rest",
      "Daily feeding and care",
      "Safe boarding environment",
      "Experienced daycare staff"
    ]
  }
};

export default function ServiceDetails() {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const service = serviceId ? serviceDetailsMap[serviceId] : null;

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Service not found</h2>
          <button onClick={() => navigate('/services')} className="text-teal-600 hover:underline">
            Back to Services
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200 pb-20">
      {/* Hero Section */}
      <div className="relative h-[40vh] md:h-[50vh] w-full">
        <img 
          src={service.image} 
          alt={service.name} 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
          onError={(event) => {
            const target = event.currentTarget;
            target.onerror = null;
            target.src = 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1200&h=600';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full p-8 md:p-16">
          <div className="max-w-7xl mx-auto">
            <button 
              onClick={() => navigate('/services')}
              className="flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" /> Back to Services
            </button>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-extrabold text-white mb-4"
            >
              {service.name}
            </motion.h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 md:p-12 border border-slate-100 dark:border-slate-700">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="md:col-span-2 space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">About this Service</h2>
                <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                  {service.description}
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Key Benefits</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {service.benefits.map((benefit: string, index: number) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-teal-500 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700 dark:text-slate-300">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-8 border border-slate-100 dark:border-slate-700 h-fit">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Service Overview</h3>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 dark:text-slate-400">Starting Price</span>
                  <span className="font-bold text-slate-900 dark:text-white text-lg">{service.price}</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 dark:text-slate-400">Duration</span>
                  <span className="font-bold text-slate-900 dark:text-white">{service.duration}</span>
                </div>
              </div>

              <button 
                onClick={() => navigate(`/providers/${serviceId}`)}
                className="w-full py-4 px-6 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition-colors shadow-sm text-lg"
              >
                Find Providers
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
