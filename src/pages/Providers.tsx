import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Star, MapPin, DollarSign, Briefcase, CheckCircle, Search, Filter, MessageSquare, Clock, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";
import { db } from "../firebase";
import { collection, query, where, getDocs, setDoc, doc, onSnapshot } from "firebase/firestore";
import { demoProviders } from "../data/mockProviders";

const serviceDetailsMap: Record<string, any> = {
  vaccination: { name: "Vaccination", description: "Keep your pets safe from preventable diseases.", price: "₹500", duration: "30 mins" },
  checkup: { name: "General Checkup", description: "Routine health examinations.", price: "₹300", duration: "45 mins" },
  emergency: { name: "Emergency Care", description: "24/7 emergency services.", price: "₹1500", duration: "Immediate" },
  training: { name: "Pet Training", description: "Professional training services.", price: "₹1000", duration: "60 mins" },
  grooming: { name: "Pet Grooming", description: "Professional grooming services.", price: "₹800", duration: "90 mins" }
};

export default function Providers() {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [providers, setProviders] = useState<any[]>([]);
  const [filteredProviders, setFilteredProviders] = useState<any[]>([]);
  
  // Booking Confirmation Modal State
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<any>(null);
  const [paymentStep, setPaymentStep] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  
  // Details Modal State
  const [detailsModalProvider, setDetailsModalProvider] = useState<any>(null);
  
  // Search and Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [experienceFilter, setExperienceFilter] = useState('All');

  // Reviews state
  const [reviews, setReviews] = useState<Record<string, any[]>>({});
  const [newReview, setNewReview] = useState('');
  const [activeReviewProvider, setActiveReviewProvider] = useState<string | null>(null);

  const [availableRoles, setAvailableRoles] = useState<string[]>([]);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        // Check and add mock data if it doesn't exist
        try {
          const checkMockQuery = query(collection(db, "users"), where("isMock", "==", true));
          const mockSnapshot = await getDocs(checkMockQuery);
          
          if (mockSnapshot.empty) {
            console.log("Adding mock providers to database...");
            for (const provider of demoProviders) {
              await setDoc(doc(db, "users", provider.id), {
                ...provider,
                isMock: true,
                createdAt: new Date().toISOString()
              });
            }
          }
        } catch (seedError) {
          console.error("Error seeding mock providers (might be permission issue):", seedError);
        }

        // Always have local demo data as a baseline so the UI never looks empty.
        // If Firestore returns a smaller set, we MERGE it on top (instead of replacing),
        // so you still see the full demo list.
        let allUsers: any[] = [...demoProviders];
        try {
          const usersRef = collection(db, "users");
          const q = query(usersRef, where("role", "in", ["doctor", "trainer", "hospital", "pet_care"]));
          const usersSnapshot = await getDocs(q);
          const fetched = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          if (fetched.length > 0) {
            const byId = new Map<string, any>();
            for (const u of demoProviders) byId.set(u.id, u);
            for (const u of fetched) {
              // Merge: Firestore data overrides demo fields for same id
              const prev = byId.get(u.id);
              byId.set(u.id, prev ? { ...prev, ...u } : u);
            }
            allUsers = Array.from(byId.values());
          }
        } catch (fetchError) {
          console.error("Error fetching from Firestore, falling back to local mock data:", fetchError);
          // keep local demo data
        }

        // If still empty (e.g. Firestore worked but was empty and seeding failed), use mock data
        if (allUsers.length === 0) {
          allUsers = [...demoProviders];
        }

        const registeredDoctors = allUsers.filter((u: any) => u.role === 'doctor' || u.role === 'Doctor').map((d: any) => ({
          ...d,
          name: d.name || d.fullName || 'Doctor',
          location: d.clinicName || d.location || 'Unknown',
          role: 'Doctor',
          rating: d.rating || 'New',
          image: d.photoURL || d.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(d.name || d.fullName || 'Doctor')}&background=0D8ABC&color=fff`
        }));

        const registeredTrainers = allUsers.filter((u: any) => u.role === 'trainer' || u.role === 'Trainer').map((t: any) => ({
          ...t,
          name: t.name || t.fullName || 'Trainer',
          location: t.availableLocation || t.location || 'Unknown',
          role: 'Trainer',
          rating: t.rating || 'New',
          image: t.photoURL || t.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(t.name || t.fullName || 'Trainer')}&background=0D8ABC&color=fff`
        }));

        const registeredHospitals = allUsers.filter((u: any) => u.role === 'hospital' || u.role === 'Hospital').map((h: any) => ({
          ...h,
          name: h.name || h.hospitalName || 'Hospital',
          location: h.address || h.location || 'Unknown',
          role: 'Hospital',
          rating: h.rating || 'New',
          image: h.photoURL || h.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(h.name || h.hospitalName || 'Hospital')}&background=0D8ABC&color=fff`
        }));

        const registeredPetCare = allUsers.filter((u: any) => u.role === 'pet_care' || u.role === 'Pet Care').map((p: any) => ({
          ...p,
          name: p.name || p.fullName || 'Pet Care',
          location: p.address || p.location || 'Unknown',
          role: 'Pet Care',
          rating: p.rating || 'New',
          image: p.photoURL || p.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name || p.fullName || 'Pet Care')}&background=0D8ABC&color=fff`
        }));

        let initialProviders: any[] = [];

        if (serviceId === 'vaccination' || serviceId === 'checkup') {
          initialProviders = [...registeredDoctors];
        } else if (serviceId === 'training') {
          initialProviders = [...registeredTrainers];
        } else if (serviceId === 'grooming') {
          initialProviders = [...registeredPetCare, ...registeredTrainers];
        } else if (serviceId === 'emergency') {
          initialProviders = [...registeredHospitals];
        }

        // Final safety fallback: if Firestore data is present but not shaped as expected,
        // ensure demo providers always appear so the page doesn't look empty.
        if (initialProviders.length === 0) {
          const demoDoctors = demoProviders
            .filter((u: any) => u.role === 'doctor')
            .map((d: any) => ({
              ...d,
              name: d.name || d.fullName || 'Doctor',
              role: 'Doctor',
              image: d.photoURL || d.image,
            }));
          const demoTrainers = demoProviders
            .filter((u: any) => u.role === 'trainer')
            .map((t: any) => ({
              ...t,
              name: t.name || t.fullName || 'Trainer',
              role: 'Trainer',
              image: t.photoURL || t.image,
            }));
          const demoHospitals = demoProviders
            .filter((u: any) => u.role === 'hospital')
            .map((h: any) => ({
              ...h,
              name: h.name || h.hospitalName || 'Hospital',
              role: 'Hospital',
              image: h.photoURL || h.image,
            }));
          const demoPetCare = demoProviders
            .filter((u: any) => u.role === 'pet_care')
            .map((p: any) => ({
              ...p,
              name: p.name || p.fullName || 'Pet Care',
              role: 'Pet Care',
              image: p.photoURL || p.image,
            }));

          if (serviceId === 'vaccination' || serviceId === 'checkup') {
            initialProviders = demoDoctors;
          } else if (serviceId === 'training') {
            initialProviders = demoTrainers;
          } else if (serviceId === 'grooming') {
            initialProviders = [...demoPetCare, ...demoTrainers];
          } else if (serviceId === 'emergency') {
            initialProviders = demoHospitals;
          }
        }

        setProviders(initialProviders);
        setFilteredProviders(initialProviders);
        
        const roles = Array.from(new Set(initialProviders.map(p => p.role)));
        setAvailableRoles(roles);
      } catch (error) {
        console.error("Error in provider fetching logic:", error);
      }
    };

    fetchProviders();

    // Listen to reviews
    const unsubscribeReviews = onSnapshot(collection(db, "reviews"), (snapshot) => {
      const allReviews: Record<string, any[]> = {};
      snapshot.docs.forEach(doc => {
        const review = { id: doc.id, ...doc.data() } as any;
        if (!allReviews[review.providerId]) {
          allReviews[review.providerId] = [];
        }
        allReviews[review.providerId].push(review);
      });
      setReviews(allReviews);
    });

    return () => unsubscribeReviews();
  }, [serviceId]);

  useEffect(() => {
    let result = providers;

    if (searchTerm) {
      result = result.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    if (roleFilter !== 'All') {
      result = result.filter(p => p.role === roleFilter);
    }

    if (experienceFilter !== 'All') {
      if (experienceFilter === '1-5') {
        result = result.filter(p => parseInt(p.experience || '0') >= 1 && parseInt(p.experience || '0') <= 5);
      } else if (experienceFilter === '5+') {
        result = result.filter(p => parseInt(p.experience || '0') > 5);
      }
    }

    setFilteredProviders(result);
  }, [searchTerm, roleFilter, experienceFilter, providers]);

  const getProviderImageSrc = (provider: any) => {
    return (
      provider.image ||
      provider.photoURL ||
      `https://picsum.photos/seed/${encodeURIComponent(provider.id || provider.email || provider.name || "provider")}/600/600`
    );
  };

  const handleImgError = (e: React.SyntheticEvent<HTMLImageElement, Event>, provider: any) => {
    const img = e.currentTarget;
    const fallback = `https://picsum.photos/seed/${encodeURIComponent(provider.id || provider.email || provider.name || "provider")}/600/600`;
    if (img.src !== fallback) img.src = fallback;
  };

  const handleBook = (provider: any) => {
    if (!user) {
      navigate('/login');
      return;
    }
    setSelectedProvider(provider);
    setPaymentStep(false);
    setShowConfirmModal(true);
  };

  const serviceDetails = serviceId ? serviceDetailsMap[serviceId] : null;

  const handleProceedToPayment = () => {
    setPaymentStep(true);
  };

  const confirmBooking = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedProvider) return;

    setIsProcessingPayment(true);

    // Simulate payment processing
    setTimeout(async () => {
      const bookingId = Date.now().toString();
      const newBooking = {
        id: bookingId,
        serviceId,
        serviceName: serviceDetails?.name || serviceId,
        providerId: selectedProvider.id,
        providerName: selectedProvider.name,
        providerEmail: selectedProvider.email || `${selectedProvider.id}@example.com`,
        providerRole: selectedProvider.role,
        price: selectedProvider.charges || '500',
        status: 'Pending',
        paymentStatus: 'Paid',
        date: new Date().toLocaleDateString(),
        userEmail: user.email,
        userName: user.name,
        userPhone: user.phoneNumber || '',
        userAddress: user.address || '',
        userRole: user.role || '',
        petName: user.petName || '',
        petType: user.petType || '',
        petAge: user.petAge || '',
        vaccinationStatus: user.vaccinationStatus || ''
      };

      try {
        await setDoc(doc(db, "bookings", bookingId), newBooking);
        setShowConfirmModal(false);
        setPaymentStep(false);
        showNotification('Payment successful! Appointment booked.', 'success');
        navigate('/dashboard');
      } catch (error) {
        console.error("Error booking appointment:", error);
        showNotification('Failed to book appointment.', 'error');
      } finally {
        setIsProcessingPayment(false);
      }
    }, 1500);
  };

  const cancelBooking = () => {
    setShowConfirmModal(false);
    setSelectedProvider(null);
    setPaymentStep(false);
  };

  const handleAddReview = async (providerId: string) => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!newReview.trim()) return;

    const reviewId = Date.now().toString();
    const review = {
      id: reviewId,
      providerId,
      userEmail: user.email,
      userName: user.name,
      text: newReview,
      date: new Date().toLocaleDateString()
    };

    try {
      await setDoc(doc(db, "reviews", reviewId), review);
      setNewReview('');
      setActiveReviewProvider(null);
      showNotification('Review posted successfully!', 'success');
    } catch (error) {
      console.error("Error posting review:", error);
      showNotification('Failed to post review.', 'error');
    }
  };

  return (
    <div className="py-16 bg-slate-50 dark:bg-slate-900 min-h-screen relative transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <button onClick={() => navigate('/services')} className="text-teal-600 dark:text-teal-400 hover:text-teal-700 font-medium mb-4 flex items-center gap-2">
            ← Back to Services
          </button>
          
          {/* Service Details Card */}
          {serviceDetails && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-700 mb-8">
              <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4">
                {serviceDetails.name}
              </h1>
              <p className="text-xl text-slate-600 dark:text-slate-300 mb-6">
                {serviceDetails.description}
              </p>
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 px-4 py-2 rounded-lg font-medium">
                  <DollarSign className="h-5 w-5" />
                  Starting from {serviceDetails.price}
                </div>
                <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-4 py-2 rounded-lg font-medium">
                  <Clock className="h-5 w-5" />
                  Duration: {serviceDetails.duration}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 mb-8 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search providers by name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>
          <div className="flex gap-4">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <select 
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="pl-10 pr-8 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none appearance-none"
              >
                <option value="All">All Roles</option>
                {availableRoles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
            <select 
              value={experienceFilter}
              onChange={(e) => setExperienceFilter(e.target.value)}
              className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
            >
              <option value="All">Any Experience</option>
              <option value="1-5">1-5 Years</option>
              <option value="5+">5+ Years</option>
            </select>
          </div>
        </div>

        {filteredProviders.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 text-center border border-slate-200 dark:border-slate-700">
            <p className="text-slate-500 dark:text-slate-400">No providers found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProviders.map((provider, index) => (
              <div key={index} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow flex flex-col overflow-hidden pt-8">
                <div className="flex flex-col items-center px-6">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white dark:border-slate-800 shadow-md mb-4 relative">
                    <img 
                      src={getProviderImageSrc(provider)} 
                      alt={provider.name} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      onError={(e) => handleImgError(e, provider)}
                    />
                  </div>
                  <div className="absolute top-4 right-4 flex items-center gap-1 text-amber-500 bg-amber-50 dark:bg-amber-500/10 px-2 py-1 rounded shadow-sm">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="text-sm font-bold">{provider.rating || '4.5'}</span>
                  </div>
                </div>
                
                <div className="p-6 pt-2 flex flex-col flex-grow text-center">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">{provider.name}</h3>
                    <span className="inline-block px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium rounded-full mt-2">
                      {provider.role} {provider.trainingType ? `• ${provider.trainingType}` : ''}
                    </span>
                  </div>

                  <div className="space-y-3 mb-6 flex-grow text-left bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl">
                    <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400 text-sm">
                      <MapPin className="h-4 w-4 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{provider.location}</span>
                    </div>
                    {provider.experience && (
                      <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400 text-sm">
                        <Briefcase className="h-4 w-4 text-slate-400 flex-shrink-0" />
                        <span>{provider.experience} Years Experience</span>
                      </div>
                    )}
                    <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400 text-sm">
                      <DollarSign className="h-4 w-4 text-slate-400 flex-shrink-0" />
                      <span className="font-medium text-slate-900 dark:text-white">₹{provider.charges || '500'} / session</span>
                    </div>
                  </div>

                  <div className="flex gap-2 mb-4">
                    <button 
                      onClick={() => handleBook(provider)}
                      className="flex-1 py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition-colors shadow-sm"
                    >
                      Book
                    </button>
                    <button 
                      onClick={() => setDetailsModalProvider(provider)}
                      className="flex-1 py-3 px-4 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-bold rounded-xl transition-colors shadow-sm"
                    >
                      Details
                    </button>
                    <button 
                      onClick={() => setActiveReviewProvider(activeReviewProvider === provider.id ? null : provider.id)}
                      className="p-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-xl transition-colors"
                    >
                      <MessageSquare className="h-5 w-5" />
                    </button>
                  </div>

                {/* Reviews Section */}
                {activeReviewProvider === provider.id && (
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 animate-in fade-in slide-in-from-top-2">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-3">Reviews</h4>
                    
                    <div className="space-y-3 mb-4 max-h-40 overflow-y-auto pr-2">
                      {reviews[provider.id]?.length > 0 ? (
                        reviews[provider.id].map((review: any) => (
                          <div key={review.id} className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg text-sm">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-medium text-slate-900 dark:text-white">{review.userName}</span>
                              <span className="text-xs text-slate-500 dark:text-slate-400">{review.date}</span>
                            </div>
                            <p className="text-slate-600 dark:text-slate-300">{review.text}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-slate-500 dark:text-slate-400 italic">No reviews yet. Be the first!</p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={newReview}
                        onChange={(e) => setNewReview(e.target.value)}
                        placeholder="Write a review..."
                        className="flex-1 text-sm px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white outline-none focus:border-teal-500"
                      />
                      <button 
                        onClick={() => handleAddReview(provider.id)}
                        className="px-4 py-2 bg-slate-900 dark:bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-slate-800 dark:hover:bg-teal-700 transition-colors"
                      >
                        Post
                      </button>
                    </div>
                  </div>
                )}
                </div>
              </div>
            ))}
          </div>
        )}
        {/* Booking Confirmation & Payment Modal */}
        {showConfirmModal && selectedProvider && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
              {!paymentStep ? (
                <>
                  <div className="p-6 border-b border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 dark:text-teal-400">
                        <AlertCircle className="h-5 w-5" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">Confirm Booking</h3>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">Please review your appointment details below.</p>
                  </div>
                  
                  <div className="p-6 bg-slate-50 dark:bg-slate-900/50 space-y-4">
                    <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-700">
                      <span className="text-slate-500 dark:text-slate-400">Service</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{serviceDetails?.name || serviceId}</span>
                    </div>
                    <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-700">
                      <span className="text-slate-500 dark:text-slate-400">Provider</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{selectedProvider.name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 dark:text-slate-400">Total Price</span>
                      <span className="font-bold text-xl text-teal-600 dark:text-teal-400">₹{selectedProvider.charges || '500'}</span>
                    </div>
                  </div>
                  
                  <div className="p-6 flex gap-3">
                    <button 
                      onClick={cancelBooking}
                      className="flex-1 py-3 px-4 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-medium rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleProceedToPayment}
                      className="flex-1 py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
                    >
                      Proceed to Pay
                    </button>
                  </div>
                </>
              ) : (
                <form onSubmit={confirmBooking}>
                  <div className="p-6 border-b border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                        <DollarSign className="h-5 w-5" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">Payment Details</h3>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">Amount to pay: <span className="font-bold text-slate-900 dark:text-white">₹{selectedProvider.charges || '500'}</span></p>
                  </div>
                  
                  <div className="p-6 bg-slate-50 dark:bg-slate-900/50 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Card Number</label>
                      <input required type="text" placeholder="XXXX XXXX XXXX XXXX" className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Expiry Date</label>
                        <input required type="text" placeholder="MM/YY" className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">CVV</label>
                        <input required type="text" placeholder="123" className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Cardholder Name</label>
                      <input required type="text" placeholder="John Doe" className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                  </div>
                  
                  <div className="p-6 flex gap-3">
                    <button 
                      type="button"
                      onClick={() => setPaymentStep(false)}
                      disabled={isProcessingPayment}
                      className="flex-1 py-3 px-4 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-medium rounded-xl transition-colors disabled:opacity-50"
                    >
                      Back
                    </button>
                    <button 
                      type="submit"
                      disabled={isProcessingPayment}
                      className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isProcessingPayment ? 'Processing...' : `Pay ₹${selectedProvider.charges || '500'}`}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
        {/* Details Modal */}
        {detailsModalProvider && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-700">
              <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center sticky top-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md z-10">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Provider Details</h3>
                <button 
                  onClick={() => setDetailsModalProvider(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  ✕
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="flex flex-col sm:flex-row gap-6 items-start">
                  <img 
                    src={getProviderImageSrc(detailsModalProvider)} 
                    alt={detailsModalProvider.name} 
                    className="w-32 h-32 rounded-2xl object-cover shadow-sm"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    onError={(e) => handleImgError(e, detailsModalProvider)}
                  />
                  <div>
                    <h4 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{detailsModalProvider.name}</h4>
                    <span className="inline-block px-3 py-1 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 text-sm font-medium rounded-full mb-3">
                      {detailsModalProvider.role} {detailsModalProvider.specialization ? `• ${detailsModalProvider.specialization}` : ''}
                    </span>
                    <div className="flex items-center gap-1 text-amber-500 mb-2">
                      <Star className="h-5 w-5 fill-current" />
                      <span className="font-bold">{detailsModalProvider.rating || '4.5'}</span>
                      <span className="text-slate-500 dark:text-slate-400 text-sm ml-1">({detailsModalProvider.reviews || 0} reviews)</span>
                    </div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl">
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Experience</p>
                    <p className="font-medium text-slate-900 dark:text-white">{detailsModalProvider.experience || 'N/A'} Years</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl">
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Consultation Fee</p>
                    <p className="font-medium text-slate-900 dark:text-white">₹{detailsModalProvider.charges || detailsModalProvider.consultationFee || '500'}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl">
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Location</p>
                    <p className="font-medium text-slate-900 dark:text-white">{detailsModalProvider.location || detailsModalProvider.clinicName || 'N/A'}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl">
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Contact</p>
                    <p className="font-medium text-slate-900 dark:text-white">{detailsModalProvider.phone || 'N/A'}</p>
                  </div>
                </div>

                <div>
                  <h5 className="font-bold text-slate-900 dark:text-white mb-2">About</h5>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    {detailsModalProvider.about || 'No description provided.'}
                  </p>
                </div>

                {detailsModalProvider.trainingTypes && (
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-white mb-2">Training Types</h5>
                    <p className="text-slate-600 dark:text-slate-400">{detailsModalProvider.trainingTypes}</p>
                  </div>
                )}
                
                {detailsModalProvider.emergencyServices && (
                  <div className="flex items-center gap-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                    <AlertCircle className="h-5 w-5" />
                    <span className="font-medium">24/7 Emergency Services Available</span>
                  </div>
                )}
              </div>
              
              <div className="p-6 border-t border-slate-100 dark:border-slate-700 flex gap-3 sticky bottom-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md">
                <button 
                  onClick={() => setDetailsModalProvider(null)}
                  className="flex-1 py-3 px-4 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-medium rounded-xl transition-colors"
                >
                  Close
                </button>
                <button 
                  onClick={() => {
                    setDetailsModalProvider(null);
                    handleBook(detailsModalProvider);
                  }}
                  className="flex-1 py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition-colors shadow-sm"
                >
                  Book Appointment
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
