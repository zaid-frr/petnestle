import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { User, Stethoscope, Dumbbell, Building2, CheckCircle } from 'lucide-react';

type RoleType = 'petOwners' | 'doctors' | 'trainers' | 'hospitals' | null;

export default function Register() {
  const [selectedRole, setSelectedRole] = useState<RoleType>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;

    // Save to localStorage
    const existingUsers = JSON.parse(localStorage.getItem(selectedRole) || '[]');
    const newUser = { ...formData, id: Date.now().toString() };
    localStorage.setItem(selectedRole, JSON.stringify([...existingUsers, newUser]));

    // Show success and login
    setShowSuccess(true);
    showNotification('Registration successful!', 'success');
    
    const roleMap: Record<string, any> = {
      petOwners: 'owner',
      doctors: 'doctor',
      trainers: 'trainer',
      hospitals: 'hospital'
    };

    setTimeout(() => {
      login({
        ...newUser,
        role: roleMap[selectedRole],
        name: newUser.fullName || newUser.hospitalName || 'User',
        email: newUser.email
      });
      navigate('/dashboard');
    }, 1500);
  };

  const renderFields = () => {
    const commonFields = (
      <>
        <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label><input required type="email" name="email" onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none" /></div>
        <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone Number</label><input required type="tel" name="phoneNumber" onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none" /></div>
        <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label><input required type="password" name="password" onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none" /></div>
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
            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Specialization</label><input required type="text" name="specialization" onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none" /></div>
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
            <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Training Type</label><input required type="text" name="trainingType" placeholder="e.g. Obedience, Agility" onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none" /></div>
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
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderFields()}
              </div>
              <div className="pt-4">
                <button type="submit" className="w-full bg-teal-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-teal-700 transition-colors shadow-sm">
                  Complete Registration
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
