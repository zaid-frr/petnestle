import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";
import { UserCircle, Mail, Phone, MapPin, Save, Camera, Briefcase, Award, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";

export default function Profile() {
  const { user, login } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    photoURL: '',
    // Role specific fields
    specialization: '',
    experience: '',
    consultationFee: '',
    about: '',
    emergencyServices: false,
    bedCapacity: '',
    trainingTypes: '',
    petName: '',
    petType: '',
    petAge: '',
    vaccinationStatus: '',
    emergencyContact: ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      address: user.address || '',
      photoURL: user.photoURL || user.image || '',
      specialization: user.specialization || '',
      experience: user.experience || '',
      consultationFee: user.consultationFee || '',
      about: user.about || '',
      emergencyServices: user.emergencyServices || false,
      bedCapacity: user.bedCapacity || '',
      trainingTypes: user.trainingTypes || '',
      petName: user.petName || '',
      petType: user.petType || '',
      petAge: user.petAge || '',
      vaccinationStatus: user.vaccinationStatus || '',
      emergencyContact: user.emergencyContact || ''
    });
  }, [user, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData({ ...formData, photoURL: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!user || !user.uid) return;

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        photoURL: formData.photoURL,
        image: formData.photoURL,
        specialization: formData.specialization,
        experience: formData.experience,
        consultationFee: formData.consultationFee,
        about: formData.about,
        emergencyServices: formData.emergencyServices,
        bedCapacity: formData.bedCapacity,
        trainingTypes: formData.trainingTypes,
        petName: formData.petName,
        petType: formData.petType,
        petAge: formData.petAge,
        vaccinationStatus: formData.vaccinationStatus,
        emergencyContact: formData.emergencyContact
      });

      // Update context
      login({ ...user, ...formData, image: formData.photoURL });
      
      setIsEditing(false);
      showNotification('Profile updated successfully!', 'success');
    } catch (error) {
      console.error("Error updating profile:", error);
      showNotification('Failed to update profile.', 'error');
    }
  };

  if (!user) return null;

  return (
    <div className="py-16 bg-slate-50 dark:bg-slate-900 min-h-screen transition-colors duration-200">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          {/* Header */}
          <div className="bg-teal-600 px-8 py-12 text-center relative">
            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-800 p-2 rounded-full">
              <div 
                className={`relative w-24 h-24 rounded-full flex items-center justify-center text-teal-600 dark:text-teal-400 bg-teal-100 dark:bg-teal-900/50 overflow-hidden ${isEditing ? 'cursor-pointer' : ''}`}
                onClick={() => isEditing && fileInputRef.current?.click()}
              >
                {formData.photoURL ? (
                  <img src={formData.photoURL} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <UserCircle className="h-16 w-16" />
                )}
                {isEditing && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Camera className="h-8 w-8 text-white" />
                  </div>
                )}
              </div>
            </div>
          </div>

          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            className="hidden" 
          />

          <div className="pt-16 pb-8 px-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{user.name}</h1>
              <p className="text-slate-500 dark:text-slate-400 capitalize font-medium">{user.role} Account</p>
            </div>

            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Full Name</label>
                  <div className="relative">
                    <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      disabled
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 outline-none cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="Add phone number"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Address / Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="Add address"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {/* Role Specific Fields */}
              {user.role === 'owner' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100 dark:border-slate-700">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Pet Name</label>
                    <div className="relative">
                      <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <input
                        type="text"
                        name="petName"
                        value={formData.petName}
                        onChange={handleChange}
                        disabled={!isEditing}
                        placeholder="e.g. Max"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Pet Type</label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <input
                        type="text"
                        name="petType"
                        value={formData.petType}
                        onChange={handleChange}
                        disabled={!isEditing}
                        placeholder="e.g. Dog, Cat"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Pet Age</label>
                    <div className="relative">
                      <Award className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <input
                        type="number"
                        name="petAge"
                        value={formData.petAge}
                        onChange={handleChange}
                        disabled={!isEditing}
                        placeholder="e.g. 3"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Vaccination Status</label>
                    <div className="relative">
                      <select
                        name="vaccinationStatus"
                        value={formData.vaccinationStatus}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none disabled:opacity-70 disabled:cursor-not-allowed appearance-none"
                      >
                        <option value="">Select status</option>
                        <option value="Up to date">Up to date</option>
                        <option value="Pending">Pending</option>
                        <option value="Not vaccinated">Not vaccinated</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Emergency Contact</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <input
                        type="tel"
                        name="emergencyContact"
                        value={formData.emergencyContact}
                        onChange={handleChange}
                        disabled={!isEditing}
                        placeholder="e.g. +1234567890"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>
              )}

              {user.role === 'doctor' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100 dark:border-slate-700">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Specialization</label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <input
                        type="text"
                        name="specialization"
                        value={formData.specialization}
                        onChange={handleChange}
                        disabled={!isEditing}
                        placeholder="e.g. General Vet, Surgeon"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Experience (Years)</label>
                    <div className="relative">
                      <Award className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <input
                        type="number"
                        name="experience"
                        value={formData.experience}
                        onChange={handleChange}
                        disabled={!isEditing}
                        placeholder="e.g. 5"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Consultation Fee (₹)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-medium text-slate-400">₹</span>
                      <input
                        type="number"
                        name="consultationFee"
                        value={formData.consultationFee}
                        onChange={handleChange}
                        disabled={!isEditing}
                        placeholder="e.g. 500"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>
              )}

              {user.role === 'trainer' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100 dark:border-slate-700">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Training Types</label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <input
                        type="text"
                        name="trainingTypes"
                        value={formData.trainingTypes}
                        onChange={handleChange}
                        disabled={!isEditing}
                        placeholder="e.g. Obedience, Agility"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Experience (Years)</label>
                    <div className="relative">
                      <Award className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <input
                        type="number"
                        name="experience"
                        value={formData.experience}
                        onChange={handleChange}
                        disabled={!isEditing}
                        placeholder="e.g. 5"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>
              )}

              {user.role === 'hospital' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100 dark:border-slate-700">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Bed Capacity</label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <input
                        type="number"
                        name="bedCapacity"
                        value={formData.bedCapacity}
                        onChange={handleChange}
                        disabled={!isEditing}
                        placeholder="e.g. 50"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
                  <div className="flex items-center mt-8">
                    <input
                      type="checkbox"
                      id="emergencyServices"
                      name="emergencyServices"
                      checked={formData.emergencyServices}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="h-5 w-5 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                    />
                    <label htmlFor="emergencyServices" className="ml-3 block text-sm font-medium text-slate-700 dark:text-slate-300">
                      24/7 Emergency Services Available
                    </label>
                  </div>
                </div>
              )}

              {user.role === 'pet_care' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100 dark:border-slate-700">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Experience (Years)</label>
                    <div className="relative">
                      <Award className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <input
                        type="number"
                        name="experience"
                        value={formData.experience}
                        onChange={handleChange}
                        disabled={!isEditing}
                        placeholder="e.g. 5"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Daily Rate (₹)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-medium text-slate-400">₹</span>
                      <input
                        type="number"
                        name="consultationFee"
                        value={formData.consultationFee}
                        onChange={handleChange}
                        disabled={!isEditing}
                        placeholder="e.g. 300"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>
              )}

              {(user.role === 'doctor' || user.role === 'trainer' || user.role === 'hospital' || user.role === 'pet_care') && (
                <div className="pt-6 border-t border-slate-100 dark:border-slate-700">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">About / Bio</label>
                  <textarea
                    name="about"
                    value={formData.about}
                    onChange={handleChange}
                    disabled={!isEditing}
                    rows={4}
                    placeholder="Tell pet owners about your services and expertise..."
                    className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none disabled:opacity-70 disabled:cursor-not-allowed resize-none"
                  />
                </div>
              )}
            </div>

            <div className="mt-8 flex gap-4">
              {isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex-1 py-3 px-4 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-medium rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex-1 py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
                  >
                    <Save className="h-5 w-5" />
                    Save Changes
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition-colors shadow-sm"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
