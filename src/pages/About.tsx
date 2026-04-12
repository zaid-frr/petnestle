import React, { useState, useEffect, useRef } from "react";
import { Users, Target, Lightbulb, Camera } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";
import { db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

const defaultTeam = [
  {
    name: "Momin Zaid",
    role: "Lead Developer",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200&h=200",
  },
  {
    name: "Jahagirdar Fawad",
    role: "UI/UX Designer",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200&h=200",
  },
  {
    name: "Jahagirdar Shamshoddin",
    role: "Backend & AI Integration",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200&h=200",
  }
];

export default function About() {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [team, setTeam] = useState(defaultTeam);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const teamDoc = await getDoc(doc(db, "settings", "team"));
        if (teamDoc.exists()) {
          const parsedTeam = teamDoc.data().members || [];
          const mergedTeam = defaultTeam.map(defaultMember => {
            const storedMember = parsedTeam.find((m: any) => m.name === defaultMember.name);
            return storedMember ? { ...defaultMember, image: storedMember.image } : defaultMember;
          });
          setTeam(mergedTeam);
        }
      } catch (e) {
        console.error("Failed to fetch team", e);
      }
    };
    fetchTeam();
  }, []);

  const handleImageClick = (index: number) => {
    if (user?.role === 'admin' || user?.email === 'mominzaidadmin@gmail.com') {
      setEditingIndex(index);
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingIndex !== null) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        const updatedTeam = [...team];
        updatedTeam[editingIndex].image = base64String;
        
        setTeam(updatedTeam);
        try {
          await setDoc(doc(db, "settings", "team"), { members: updatedTeam });
          showNotification('Profile picture updated successfully!', 'success');
        } catch (error) {
          console.error("Error updating team:", error);
          showNotification('Failed to update profile picture.', 'error');
        }
      };
      reader.readAsDataURL(file);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setEditingIndex(null);
  };

  const canEdit = user?.role === 'admin' || user?.email === 'mominzaidadmin@gmail.com';

  return (
    <div className="py-16 bg-white dark:bg-slate-900 min-h-screen transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-6">About PetNestle</h1>
          <p className="text-xl text-slate-600 dark:text-slate-400">
            PetNestle is an innovative, AI-powered veterinary and pet care platform designed to bring modern technology to animal healthcare.
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-12 mb-20">
          <div className="bg-teal-50 dark:bg-teal-900/20 rounded-3xl p-8 border border-teal-100 dark:border-teal-800/50">
            <div className="w-12 h-12 bg-teal-600 text-white rounded-xl flex items-center justify-center mb-6">
              <Target className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Our Mission</h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              To simplify pet care management for owners while providing advanced tools for veterinary professionals. We aim to bridge the gap between technology and compassionate animal care, ensuring every pet receives timely and accurate attention.
            </p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-3xl p-8 border border-blue-100 dark:border-blue-800/50">
            <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center mb-6">
              <Lightbulb className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">The Concept</h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Inspired by advanced systems like blockchain-based health records, PetNestle offers a streamlined, student-level implementation of a smart dashboard, simulated AI chatbot, and comprehensive service management system.
            </p>
          </div>
        </div>

        {/* Team Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Meet the Team</h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            The dedicated minds behind the PetNestle project.
          </p>
          {canEdit && (
            <p className="text-sm text-teal-600 dark:text-teal-400 mt-2 bg-teal-50 dark:bg-teal-900/30 inline-block px-3 py-1 rounded-full">
              Admin Mode: Click on any picture to upload a new one.
            </p>
          )}
        </div>

        {/* Hidden file input for image upload */}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="image/*" 
          className="hidden" 
        />

        <div className="flex flex-wrap justify-center gap-8 max-w-5xl mx-auto">
          {team.map((member, index) => (
            <div 
              key={member.name} 
              className="bg-white dark:bg-slate-800 rounded-3xl p-8 text-center shadow-lg border border-slate-100 dark:border-slate-700 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 max-w-sm w-full sm:w-80 relative overflow-hidden z-10"
            >
              {/* Subtle background accent */}
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-teal-500/20 to-blue-500/20 dark:from-teal-500/10 dark:to-blue-500/10 -z-10"></div>
              
              <div 
                className={`relative w-40 h-40 mx-auto mb-6 rounded-full border-8 border-white dark:border-slate-800 shadow-xl overflow-hidden transition-transform duration-300 hover:scale-105 ${canEdit ? 'cursor-pointer' : ''}`}
                onClick={() => handleImageClick(index)}
              >
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                {canEdit && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Camera className="h-8 w-8 text-white" />
                  </div>
                )}
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">{member.name}</h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
