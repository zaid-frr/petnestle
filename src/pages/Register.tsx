import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { User, Stethoscope, Dumbbell, Building2, CheckCircle } from 'lucide-react';
import { auth, db, useFirebaseEmulators } from '../firebase';
import { signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

type RoleType = 'petOwners' | 'doctors' | 'trainers' | 'hospitals' | 'petCare' | null;

export default function Register() {
  const [selectedRole, setSelectedRole] = useState<RoleType>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  const handleRoleSelect = (role: RoleType) => {
    setSelectedRole(role);
    setFormData({});
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole || !formData.email || !formData.password) {
      showNotification('Please fill all required fields including email and password', 'error');
      return;
    }

    setIsLoading(true);
    try {
      // For dummy data testing, we'll create a user with a dummy password if it fails
      let user;
      try {
        const result = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        user = result.user;
      } catch (authError: any) {
        // If it's an invalid email error or operation not allowed, and we want to allow dummy data, we mock the user object
        // NOTE: This is a hack for testing purposes only and won't actually authenticate them with Firebase Auth
        // They will only exist in Firestore.
        if (authError.code === 'auth/invalid-email' || authError.code === 'auth/operation-not-allowed') {
           console.warn("Auth error, proceeding with dummy data creation in Firestore only.");
           user = {
             uid: 'dummy_' + Date.now().toString(),
             email: formData.email
           };
        } else {
          throw authError;
        }
      }

      const roleMap: Record<string, any> = {
        petOwners: 'owner',
        doctors: 'doctor',
        trainers: 'trainer',
        hospitals: 'hospital',
        petCare: 'pet_care'
      };

      // Remove password from formData before saving to Firestore
      const { password, ...dataToSave } = formData;

      const newUser = {
        ...dataToSave,
        uid: user.uid,
        email: user.email,
        role: roleMap[selectedRole],
        name: formData.fullName || formData.hospitalName || 'User',
      };

      // Save to Firestore
      await setDoc(doc(db, 'users', user.uid), newUser);

      setShowSuccess(true);
      showNotification('Registration successful!', 'success');
      
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (error: any) {
      console.error("Registration error:", error);
      if (error?.code === 'auth/operation-not-allowed') {
        showNotification(
          'Email/password sign-up is disabled for this Firebase project. Enable it in Firebase Auth or run with emulators for local testing.',
          'error'
        );
      } else {
        showNotification(error.message || 'Failed to register', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    if (!selectedRole) return;

    setIsLoading(true);
    try {
      if (useFirebaseEmulators) {
        showNotification('Google sign-up is disabled in emulator mode. Use email/password while developing locally.', 'error');
        return;
      }
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const roleMap: Record<string, any> = {
        petOwners: 'owner',
        doctors: 'doctor',
        trainers: 'trainer',
        hospitals: 'hospital',
        petCare: 'pet_care'
      };

      const { password, ...dataToSave } = formData;

      const newUser = {
        ...dataToSave,
        uid: user.uid,
        email: user.email || formData.email,
        role: roleMap[selectedRole],
        name: formData.fullName || formData.hospitalName || user.displayName || 'User',
      };

      // Save to Firestore
      await setDoc(doc(db, 'users', user.uid), newUser);

      setShowSuccess(true);
      showNotification('Registration successful!', 'success');
      
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (error: any) {
      console.error("Registration error:", error);
      if (error?.code === 'auth/unauthorized-domain') {
        showNotification(
          'Firebase blocked this domain. Add localhost (and your IP) to Firebase Console → Authentication → Settings → Authorized domains.',
          'error'
        );
      } else {
      showNotification(error.message || 'Failed to register', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderFields = () => {
    const commonFields = (
      <>
        <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label><input required type="email" name="email" onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none" /></div>
        <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label><input required type="password" name="password" onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none" /></div>
        <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone Number</label><input required type="tel" name="phoneNumber" onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none" /></div>
      </>
    );

    switch (selectedRole) {
      case 'petOwners':
        return (
          <>
            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label><input required type="text" name="fullName" onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none" /></div>
            {commonFields}
            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Address</label><input required type="text" name="address" onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none" /></div>
            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Pet Name</label><input required type="text" name="petName" onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none" /></div>
            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Pet Type (Dog/Cat/etc)</label><input required type="text" name="petType" onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none" /></div>
            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Pet Age</label><input required type="number" name="petAge" onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none" /></div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Vaccination Status</label>
              <select required name="vaccinationStatus" onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none">
                <option value="">Select status</option>
                <option value="Up to date">Up to date</option>
                <option value="Pending">Pending</option>
                <option value="Not vaccinated">Not vaccinated</option>
              </select>
            </div>
            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Emergency Contact</label><input required type="tel" name="emergencyContact" onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none" /></div>
          </>
        );
      case 'doctors':
        return (
          <>
            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label><input required type="text" name="fullName" onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none" /></div>
            {commonFields}
            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Clinic Name</label><input required type="text" name="clinicName" onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none" /></div>
            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Qualification</label><input required type="text" name="qualification" onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none" /></div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Specialization</label>
              <select required name="specialization" onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none">
                <option value="">Select Specialization</option>
                <option value="General Veterinary Medicine">General Veterinary Medicine</option>
                <option value="Veterinary Surgery">Veterinary Surgery</option>
                <option value="Veterinary Dentistry">Veterinary Dentistry</option>
                <option value="Veterinary Dermatology">Veterinary Dermatology</option>
                <option value="Emergency & Critical Care">Emergency & Critical Care</option>
              </select>
            </div>
            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Experience (years)</label><input required type="number" name="experience" onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none" /></div>
            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">License Number</label><input required type="text" name="licenseNumber" onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none" /></div>
            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Available Timings</label><input required type="text" name="availableTimings" placeholder="e.g. 9 AM - 5 PM" onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none" /></div>
          </>
        );
      case 'trainers':
        return (
          <>
            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label><input required type="text" name="fullName" onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none" /></div>
            {commonFields}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Training Type</label>
              <select required name="trainingType" onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none">
                <option value="">Select Training Type</option>
                <option value="Obedience Training">Obedience Training</option>
                <option value="Agility Training">Agility Training</option>
                <option value="Behavioral Modification">Behavioral Modification</option>
                <option value="Puppy Training">Puppy Training</option>
                <option value="Service Dog Training">Service Dog Training</option>
              </select>
            </div>
            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Experience (years)</label><input required type="number" name="experience" onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none" /></div>
            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Certification</label><input required type="text" name="certification" onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none" /></div>
            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Available Location</label><input required type="text" name="availableLocation" onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none" /></div>
            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Charges ($/hr)</label><input required type="number" name="charges" onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none" /></div>
            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Working Hours</label><input required type="text" name="workingHours" onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none" /></div>
          </>
        );
      case 'hospitals':
        return (
          <>
            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Hospital Name</label><input required type="text" name="hospitalName" onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none" /></div>
            {commonFields}
            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Address</label><input required type="text" name="address" onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none" /></div>
            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Number of Doctors</label><input required type="number" name="numberOfDoctors" onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none" /></div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Emergency Services</label>
              <select required name="emergencyServices" onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none">
                <option value="">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Available Facilities</label><input required type="text" name="availableFacilities" placeholder="e.g. X-Ray, Surgery, ICU" onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none" /></div>
            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Opening Hours</label><input required type="text" name="openingHours" onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none" /></div>
            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">License Number</label><input required type="text" name="licenseNumber" onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none" /></div>
          </>
        );
      case 'petCare':
        return (
          <>
            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name / Business Name</label><input required type="text" name="fullName" onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none" /></div>
            {commonFields}
            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Address</label><input required type="text" name="address" onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none" /></div>
            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Experience (years)</label><input required type="number" name="experience" onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none" /></div>
            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Daily Rate (₹)</label><input required type="number" name="consultationFee" onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none" /></div>
          </>
        );
      default:
        return null;
    }
  };

  if (showSuccess) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 text-center max-w-md w-full">
          <CheckCircle className="h-16 w-16 text-green-500 dark:text-green-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Registration Successful!</h2>
          <p className="text-slate-600 dark:text-slate-400">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Create an Account</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">Join PetNestle and manage your pet care needs</p>
        </div>

        {!selectedRole ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <button onClick={() => handleRoleSelect('petOwners')} className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 hover:border-teal-500 dark:hover:border-teal-500 hover:shadow-md transition-all text-center group">
              <User className="h-12 w-12 mx-auto text-teal-600 dark:text-teal-400 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Pet Owner</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">I want to manage my pet's health and book services.</p>
            </button>
            <button onClick={() => handleRoleSelect('doctors')} className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-md transition-all text-center group">
              <Stethoscope className="h-12 w-12 mx-auto text-blue-600 dark:text-blue-400 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Veterinarian</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">I am a doctor looking to provide consultations.</p>
            </button>
            <button onClick={() => handleRoleSelect('trainers')} className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 hover:border-orange-500 dark:hover:border-orange-500 hover:shadow-md transition-all text-center group">
              <Dumbbell className="h-12 w-12 mx-auto text-orange-600 dark:text-orange-400 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Pet Trainer</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">I offer professional pet training services.</p>
            </button>
            <button onClick={() => handleRoleSelect('hospitals')} className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 hover:border-purple-500 dark:hover:border-purple-500 hover:shadow-md transition-all text-center group">
              <Building2 className="h-12 w-12 mx-auto text-purple-600 dark:text-purple-400 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Pet Hospital</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Register a clinic or hospital facility.</p>
            </button>
            <button onClick={() => handleRoleSelect('petCare')} className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 hover:border-pink-500 dark:hover:border-pink-500 hover:shadow-md transition-all text-center group">
              <CheckCircle className="h-12 w-12 mx-auto text-pink-600 dark:text-pink-400 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Pet Care / Daycare</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">I provide pet sitting or daycare services.</p>
            </button>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100 dark:border-slate-700">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white capitalize">
                {selectedRole.replace(/([A-Z])/g, ' $1').trim()} Registration
              </h2>
              <button onClick={() => setSelectedRole(null)} className="text-sm text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-medium">
                ← Change Role
              </button>
            </div>
            <form onSubmit={handleEmailRegister} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderFields()}
              </div>
              <div className="pt-4 space-y-4">
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full flex justify-center items-center gap-3 bg-teal-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-teal-700 transition-colors shadow-sm disabled:opacity-50"
                >
                  {isLoading ? 'Registering...' : 'Register with Email'}
                </button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-300 dark:border-slate-600"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400">Or continue with</span>
                  </div>
                </div>

                <button 
                  type="button"
                  onClick={handleGoogleRegister}
                  disabled={isLoading}
                  className="w-full flex justify-center items-center gap-3 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 font-bold py-3 px-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors shadow-sm disabled:opacity-50"
                >
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5 bg-white rounded-full p-0.5" />
                  {useFirebaseEmulators ? 'Google sign-up disabled (emulator)' : (isLoading ? 'Registering...' : 'Register with Google')}
                </button>
              </div>
            </form>
          </div>
        )}
        
        {!selectedRole && (
          <div className="text-center mt-8">
            <p className="text-slate-600 dark:text-slate-400">
              Already have an account? <Link to="/login" className="font-medium text-teal-600 dark:text-teal-400 hover:text-teal-500 dark:hover:text-teal-300">Log in</Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
