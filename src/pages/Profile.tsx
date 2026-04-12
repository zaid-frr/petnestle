import React, { useMemo, useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";
import {
  UserCircle,
  Mail,
  Phone,
  MapPin,
  Save,
  Camera,
  Briefcase,
  Award,
  Clock,
  Menu,
  X,
  KeyRound,
  UserRoundPen,
  UserX,
  Trash2,
  LogOut,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { deleteDoc, doc, updateDoc } from "firebase/firestore";
import {
  EmailAuthProvider,
  deleteUser,
  reauthenticateWithCredential,
  signOut,
  updatePassword,
  updateProfile,
} from "firebase/auth";

export default function Profile() {
  const { user, login } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isBusy, setIsBusy] = useState(false);

  const [showChangeName, setShowChangeName] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState("");

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showConfirmDeactivate, setShowConfirmDeactivate] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
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
    userAbout: '',
    emergencyServices: false,
    bedCapacity: '',
    trainingTypes: '',
    clinicName: '',
    qualification: '',
    licenseNumber: '',
    availableTimings: '',
    petName: '',
    petType: '',
    petAge: '',
    petDob: '',
    petBreed: '',
    petGender: '',
    petWeightKg: '',
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
      phone: (user.phone || user.phoneNumber || '') as string,
      address: user.address || '',
      photoURL: user.photoURL || user.image || '',
      specialization: user.specialization || '',
      experience: user.experience || '',
      consultationFee: user.consultationFee || user.charges || '',
      about: user.about || '',
      userAbout: user.userAbout || '',
      emergencyServices: user.emergencyServices || false,
      bedCapacity: user.bedCapacity || '',
      trainingTypes: user.trainingTypes || '',
      clinicName: user.clinicName || '',
      qualification: user.qualification || '',
      licenseNumber: user.licenseNumber || '',
      availableTimings: user.availableTimings || '',
      petName: user.petName || '',
      petType: user.petType || '',
      petAge: user.petAge || '',
      petDob: user.petDob || '',
      petBreed: user.petBreed || '',
      petGender: user.petGender || '',
      petWeightKg: user.petWeightKg || '',
      vaccinationStatus: user.vaccinationStatus || '',
      emergencyContact: user.emergencyContact || ''
    });
    setNewDisplayName(user.name || "");
  }, [user, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const name = e.target.name;
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;

    if (name === 'petDob' && typeof value === 'string') {
      const petAge = calculateAgeFromDob(value);
      setFormData({ ...formData, petDob: value, petAge });
      return;
    }

    setFormData({ ...formData, [name]: value });
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

  const calculateAgeFromDob = (dob: string) => {
    const date = new Date(dob);
    if (!dob || isNaN(date.getTime())) return '';
    const today = new Date();
    let age = today.getFullYear() - date.getFullYear();
    const monthDiff = today.getMonth() - date.getMonth();
    const dayDiff = today.getDate() - date.getDate();
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age -= 1;
    }
    return age >= 0 ? age.toString() : '';
  };

  const handlePriceBlur = () => {
    if (!user || user.role === 'owner') return;
    const value = parseFloat(formData.consultationFee);
    if (isNaN(value) || value < 300) {
      setFormData((prev) => ({ ...prev, consultationFee: '300' }));
      showNotification('Minimum provider price is ₹300.', 'error');
    }
  };

  const passwordAuthSupported = useMemo(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) return false;
    return currentUser.providerData.some((p) => p.providerId === "password");
  }, []);

  const requiredMissing = useMemo(() => {
    const missing: string[] = [];

    const req = (label: string, val: unknown) => {
      if (val === null || val === undefined) {
        missing.push(label);
        return;
      }
      if (typeof val === "string" && val.trim().length === 0) missing.push(label);
    };

    req("Full Name", formData.name);
    req("Phone Number", formData.phone);
    req("Address / Location", formData.address);
    req("About You", formData.userAbout);

    if (user?.role === "owner") {
      req("Pet Name", formData.petName);
      req("Pet Type", formData.petType);
      req("Pet DOB", formData.petDob);
      req("Pet Breed", formData.petBreed);
      req("Pet Gender", formData.petGender);
      req("Pet Weight (kg)", formData.petWeightKg);
      req("Vaccination Status", formData.vaccinationStatus);
      req("Emergency Contact", formData.emergencyContact);
    }

    if (user?.role === "doctor") {
      req("Clinic Name", formData.clinicName);
      req("Qualification", formData.qualification);
      req("License Number", formData.licenseNumber);
      req("Available Timings", formData.availableTimings);
      req("Specialization", formData.specialization);
      req("Experience (Years)", formData.experience);
      req("Consultation Fee (₹)", formData.consultationFee);
      req("Professional Bio", formData.about);
    }

    if (user?.role === "trainer") {
      req("Training Types", formData.trainingTypes);
      req("Experience (Years)", formData.experience);
      req("Service Fee (₹)", formData.consultationFee);
      req("Professional Bio", formData.about);
    }

    if (user?.role === "hospital") {
      req("Bed Capacity", formData.bedCapacity);
      req("Service Fee (₹)", formData.consultationFee);
      req("Professional Bio", formData.about);
    }

    if (user?.role === "pet_care") {
      req("Experience (Years)", formData.experience);
      req("Daily Rate (₹)", formData.consultationFee);
      req("Professional Bio", formData.about);
    }

    return missing;
  }, [formData, user?.role]);

  const handleSave = async () => {
    if (!user || !user.uid) return;

    try {
      if (requiredMissing.length > 0) {
        showNotification(
          `Please fill required fields: ${requiredMissing.slice(0, 6).join(", ")}${requiredMissing.length > 6 ? "…" : ""}`,
          "error"
        );
        return;
      }

      setIsBusy(true);
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        name: formData.name,
        phone: formData.phone,
        phoneNumber: formData.phone,
        address: formData.address,
        photoURL: formData.photoURL,
        image: formData.photoURL,
        specialization: formData.specialization,
        experience: formData.experience,
        consultationFee: formData.consultationFee,
        charges: formData.consultationFee,
        about: formData.about,
        userAbout: formData.userAbout,
        emergencyServices: formData.emergencyServices,
        bedCapacity: formData.bedCapacity,
        trainingTypes: formData.trainingTypes,
        clinicName: formData.clinicName,
        qualification: formData.qualification,
        licenseNumber: formData.licenseNumber,
        availableTimings: formData.availableTimings,
        petName: formData.petName,
        petType: formData.petType,
        petAge: formData.petAge,
        petDob: formData.petDob,
        petBreed: formData.petBreed,
        petGender: formData.petGender,
        petWeightKg: formData.petWeightKg,
        vaccinationStatus: formData.vaccinationStatus,
        emergencyContact: formData.emergencyContact
      });

      if (auth.currentUser) {
        try {
          await updateProfile(auth.currentUser, { displayName: formData.name, photoURL: formData.photoURL || undefined });
        } catch (e) {
          console.warn("Unable to update Firebase Auth profile:", e);
        }
      }

      await login({ ...user, ...formData, image: formData.photoURL });
      
      setIsEditing(false);
      showNotification('Profile updated successfully!', 'success');
    } catch (error) {
      console.error("Error updating profile:", error);
      showNotification('Failed to update profile.', 'error');
    } finally {
      setIsBusy(false);
    }
  };

  const handleDeactivate = async () => {
    if (!user?.uid) return;
    try {
      setIsBusy(true);
      await updateDoc(doc(db, "users", user.uid), {
        deactivated: true,
        deactivatedAt: new Date().toISOString(),
      });
      await signOut(auth);
      showNotification("Account deactivated. You have been logged out.", "success");
      navigate("/login");
    } catch (e: any) {
      console.error("Deactivate error:", e);
      showNotification(e?.message || "Failed to deactivate account.", "error");
    } finally {
      setIsBusy(false);
      setIsMenuOpen(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user?.uid) return;
    try {
      setIsBusy(true);
      await deleteDoc(doc(db, "users", user.uid));
      if (auth.currentUser) await deleteUser(auth.currentUser);
      showNotification("Account deleted successfully.", "success");
      navigate("/");
    } catch (e: any) {
      console.error("Delete account error:", e);
      showNotification(e?.message || "Failed to delete account.", "error");
    } finally {
      setIsBusy(false);
      setIsMenuOpen(false);
    }
  };

  const handleOpenChangeName = () => {
    setNewDisplayName(formData.name || user?.name || "");
    setShowChangeName(true);
    setIsMenuOpen(false);
  };

  const handleSubmitChangeName = async () => {
    const v = newDisplayName.trim();
    if (!v) {
      showNotification("Username cannot be empty.", "error");
      return;
    }
    setFormData((p) => ({ ...p, name: v }));
    setShowChangeName(false);
    setIsEditing(true);
    showNotification("Username updated. Please save changes to apply.", "success");
  };

  const handleOpenChangePassword = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    setShowChangePassword(true);
    setIsMenuOpen(false);
  };

  const handleSubmitChangePassword = async () => {
    if (!passwordAuthSupported) {
      showNotification("Password change is only available for email/password accounts.", "error");
      return;
    }
    if (!auth.currentUser?.email) {
      showNotification("No authenticated user found.", "error");
      return;
    }
    if (!currentPassword || !newPassword) {
      showNotification("Please fill current and new password.", "error");
      return;
    }
    if (newPassword.length < 6) {
      showNotification("New password must be at least 6 characters.", "error");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      showNotification("New passwords do not match.", "error");
      return;
    }

    try {
      setIsBusy(true);
      const cred = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, cred);
      await updatePassword(auth.currentUser, newPassword);
      setShowChangePassword(false);
      showNotification("Password changed successfully.", "success");
    } catch (e: any) {
      console.error("Change password error:", e);
      showNotification(e?.message || "Failed to change password.", "error");
    } finally {
      setIsBusy(false);
    }
  };

  if (!user) return null;

  return (
    <div className="py-16 bg-slate-50 dark:bg-slate-900 min-h-screen transition-colors duration-200">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12">
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          {/* Header */}
          <div className="bg-teal-600 px-8 py-12 text-center relative">
            <button
              type="button"
              onClick={() => setIsMenuOpen(true)}
              className="absolute left-4 top-4 inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white/15 hover:bg-white/20 text-white transition-colors"
              aria-label="Open profile menu"
            >
              <Menu className="h-5 w-5" />
            </button>
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

            {isEditing && formData.photoURL && (
              <div className="flex justify-center mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setFormData((p) => ({ ...p, photoURL: "" }));
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-medium transition-colors"
                >
                  Remove profile photo
                </button>
              </div>
            )}

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

              {/* About you (required) */}
              <div className="pt-6 border-t border-slate-100 dark:border-slate-700">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">About You</label>
                <textarea
                  name="userAbout"
                  value={formData.userAbout}
                  onChange={handleChange}
                  disabled={!isEditing}
                  rows={4}
                  placeholder="A short intro about you (required)"
                  className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none disabled:opacity-70 disabled:cursor-not-allowed resize-none"
                />
                {isEditing && requiredMissing.includes("About You") && (
                  <p className="mt-2 text-sm text-rose-600 dark:text-rose-400">This field is required.</p>
                )}
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
                      <select
                        name="petType"
                        value={formData.petType}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none disabled:opacity-70 disabled:cursor-not-allowed appearance-none"
                      >
                        <option value="">Select type</option>
                        <option value="Dog">Dog</option>
                        <option value="Cat">Cat</option>
                        <option value="Rabbit">Rabbit</option>
                        <option value="Bird">Bird</option>
                        <option value="Other">Other</option>
                      </select>
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
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Pet DOB</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <input
                        type="date"
                        name="petDob"
                        value={formData.petDob}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Pet Breed</label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <input
                        type="text"
                        name="petBreed"
                        value={formData.petBreed}
                        onChange={handleChange}
                        disabled={!isEditing}
                        placeholder="e.g. Labrador"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Pet Gender</label>
                    <div className="relative">
                      <select
                        name="petGender"
                        value={formData.petGender}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none disabled:opacity-70 disabled:cursor-not-allowed appearance-none"
                      >
                        <option value="">Select gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Unknown">Unknown</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Pet Weight (kg)</label>
                    <div className="relative">
                      <Award className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <input
                        type="number"
                        step="0.1"
                        name="petWeightKg"
                        value={formData.petWeightKg}
                        onChange={handleChange}
                        disabled={!isEditing}
                        placeholder="e.g. 12.5"
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
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Clinic Name</label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <input
                        type="text"
                        name="clinicName"
                        value={formData.clinicName}
                        onChange={handleChange}
                        disabled={!isEditing}
                        placeholder="e.g. Happy Paws Clinic"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Qualification</label>
                    <div className="relative">
                      <Award className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <input
                        type="text"
                        name="qualification"
                        value={formData.qualification}
                        onChange={handleChange}
                        disabled={!isEditing}
                        placeholder="e.g. BVSc, MVSc"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">License Number</label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <input
                        type="text"
                        name="licenseNumber"
                        value={formData.licenseNumber}
                        onChange={handleChange}
                        disabled={!isEditing}
                        placeholder="e.g. VET-XXXX-1234"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Available Timings</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <input
                        type="text"
                        name="availableTimings"
                        value={formData.availableTimings}
                        onChange={handleChange}
                        disabled={!isEditing}
                        placeholder="e.g. 9 AM - 5 PM"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Specialization</label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <select
                        name="specialization"
                        value={formData.specialization}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none disabled:opacity-70 disabled:cursor-not-allowed appearance-none"
                      >
                        <option value="">Select specialization</option>
                        <option value="General Vet">General Vet</option>
                        <option value="Surgery">Surgery</option>
                        <option value="Dentistry">Dentistry</option>
                        <option value="Dermatology">Dermatology</option>
                        <option value="Emergency Care">Emergency Care</option>
                      </select>
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
                        min={300}
                        name="consultationFee"
                        value={formData.consultationFee}
                        onChange={handleChange}
                        onBlur={handlePriceBlur}
                        disabled={!isEditing}
                        placeholder="e.g. 500"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Professional Bio</label>
                    <textarea
                      name="about"
                      value={formData.about}
                      onChange={handleChange}
                      disabled={!isEditing}
                      rows={4}
                      placeholder="Tell pet owners about your services and expertise (required)"
                      className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none disabled:opacity-70 disabled:cursor-not-allowed resize-none"
                    />
                  </div>
                </div>
              )}

              {user.role === 'trainer' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100 dark:border-slate-700">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Training Types</label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <select
                        name="trainingTypes"
                        value={formData.trainingTypes}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none disabled:opacity-70 disabled:cursor-not-allowed appearance-none"
                      >
                        <option value="">Select training type</option>
                        <option value="Obedience">Obedience</option>
                        <option value="Agility">Agility</option>
                        <option value="Behavioral Training">Behavioral Training</option>
                        <option value="Puppy Socialization">Puppy Socialization</option>
                      </select>
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
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Service Fee (₹)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-medium text-slate-400">₹</span>
                      <input
                        type="number"
                        min={300}
                        name="consultationFee"
                        value={formData.consultationFee}
                        onChange={handleChange}
                        onBlur={handlePriceBlur}
                        disabled={!isEditing}
                        placeholder="e.g. 500"
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
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Service Fee (₹)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-medium text-slate-400">₹</span>
                      <input
                        type="number"
                        min={300}
                        name="consultationFee"
                        value={formData.consultationFee}
                        onChange={handleChange}
                        onBlur={handlePriceBlur}
                        disabled={!isEditing}
                        placeholder="e.g. 1000"
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
                        min={300}
                        name="consultationFee"
                        value={formData.consultationFee}
                        onChange={handleChange}
                        onBlur={handlePriceBlur}
                        disabled={!isEditing}
                        placeholder="e.g. 300"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>
              )}

              {(user.role === 'trainer' || user.role === 'hospital' || user.role === 'pet_care') && (
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
                    disabled={isBusy}
                    className="flex-1 py-3 px-4 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-medium rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isBusy}
                    className="flex-1 py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
                  >
                    <Save className="h-5 w-5" />
                    {isBusy ? "Saving..." : "Save Changes"}
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

      {/* Slide menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setIsMenuOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-[320px] bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 shadow-xl p-5 animate-in slide-in-from-left-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Profile</p>
                <p className="font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsMenuOpen(false)}
                className="w-10 h-10 inline-flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={handleOpenChangeName}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100"
              >
                <UserRoundPen className="h-5 w-5" />
                Change Username
              </button>

              <button
                type="button"
                onClick={handleOpenChangePassword}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100"
              >
                <KeyRound className="h-5 w-5" />
                Change Password
                {!passwordAuthSupported && (
                  <span className="ml-auto text-xs text-slate-500 dark:text-slate-400">Google only</span>
                )}
              </button>

              <button
                type="button"
                disabled={isBusy}
                onClick={async () => {
                  setIsMenuOpen(false);
                  await signOut(auth);
                  showNotification("Logged out.", "success");
                  navigate("/login");
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 disabled:opacity-60"
              >
                <LogOut className="h-5 w-5" />
                Logout
              </button>

              <div className="pt-3 mt-3 border-t border-slate-200 dark:border-slate-700 space-y-2">
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => {
                    setShowConfirmDeactivate(true);
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30 text-amber-800 dark:text-amber-200 disabled:opacity-60"
                >
                  <UserX className="h-5 w-5" />
                  Deactivate Account
                </button>

                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => {
                    setDeleteConfirmText("");
                    setShowConfirmDelete(true);
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-rose-50 dark:bg-rose-900/20 hover:bg-rose-100 dark:hover:bg-rose-900/30 text-rose-700 dark:text-rose-200 disabled:opacity-60"
                >
                  <Trash2 className="h-5 w-5" />
                  Delete Account
                </button>
              </div>
            </div>

            <p className="mt-6 text-xs text-slate-500 dark:text-slate-400">
              Tip: Use “Edit Profile” to update required details like pet DOB / professional info.
            </p>
          </div>
        </div>
      )}

      {/* Change username modal */}
      {showChangeName && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowChangeName(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Change Username</h3>
              <button
                type="button"
                onClick={() => setShowChangeName(false)}
                className="w-10 h-10 inline-flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">New username</label>
            <input
              value={newDisplayName}
              onChange={(e) => setNewDisplayName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Enter your name"
            />

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setShowChangeName(false)}
                className="flex-1 py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitChangeName}
                className="flex-1 py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change password modal */}
      {showChangePassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowChangePassword(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Change Password</h3>
              <button
                type="button"
                onClick={() => setShowChangePassword(false)}
                className="w-10 h-10 inline-flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {!passwordAuthSupported ? (
              <div className="text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
                Your account is signed in with Google. Password change is not available here.
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Current password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">New password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Confirm new password</label>
                  <input
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
            )}

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setShowChangePassword(false)}
                disabled={isBusy}
                className="flex-1 py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-medium disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitChangePassword}
                disabled={isBusy || !passwordAuthSupported}
                className="flex-1 py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold disabled:opacity-60"
              >
                {isBusy ? "Updating..." : "Update"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deactivate confirm */}
      {showConfirmDeactivate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowConfirmDeactivate(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Deactivate account?</h3>
              <button
                type="button"
                onClick={() => setShowConfirmDeactivate(false)}
                className="w-10 h-10 inline-flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              This will mark your account as deactivated and log you out. You can re-activate later by contacting support/admin (if enabled).
            </p>

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmDeactivate(false)}
                disabled={isBusy}
                className="flex-1 py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-medium disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  setShowConfirmDeactivate(false);
                  await handleDeactivate();
                }}
                disabled={isBusy}
                className="flex-1 py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold disabled:opacity-60"
              >
                {isBusy ? "Working..." : "Deactivate"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {showConfirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowConfirmDelete(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Delete account permanently?</h3>
              <button
                type="button"
                onClick={() => setShowConfirmDelete(false)}
                className="w-10 h-10 inline-flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              This action cannot be undone. To confirm, type <span className="font-bold">DELETE</span> below.
            </p>

            <div className="mt-4">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Type DELETE</label>
              <input
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-rose-500"
                placeholder="DELETE"
              />
            </div>

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmDelete(false)}
                disabled={isBusy}
                className="flex-1 py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-medium disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (deleteConfirmText.trim().toUpperCase() !== "DELETE") {
                    showNotification('Please type DELETE to confirm.', 'error');
                    return;
                  }
                  setShowConfirmDelete(false);
                  await handleDeleteAccount();
                }}
                disabled={isBusy || deleteConfirmText.trim().toUpperCase() !== "DELETE"}
                className="flex-1 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold disabled:opacity-60"
              >
                {isBusy ? "Working..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
