import React, { useEffect, useState } from "react";
import { Users, Calendar, Activity, FileText, UserCircle, Trash2, PlusCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../context/NotificationContext";
import { db } from "../firebase";
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc, setDoc } from "firebase/firestore";

export default function Dashboard() {
  const { user, isAuthReady } = useAuth();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [bookings, setBookings] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('bookings');
  
  // Pets state
  const [pets, setPets] = useState<any[]>([]);
  const [showAddPet, setShowAddPet] = useState(false);
  const [newPet, setNewPet] = useState({ name: '', type: '', age: '', vaccinationStatus: 'Up to date' });

  // Booking Modal State
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  useEffect(() => {
    if (!isAuthReady) return;
    if (!user) {
      navigate('/login');
      return;
    }
    
    // Fetch Bookings
    let bookingsQuery;
    if (user.role === 'owner') {
      bookingsQuery = query(collection(db, "bookings"), where("userEmail", "==", user.email));
    } else if (user.role === 'admin') {
      bookingsQuery = collection(db, "bookings");
    } else {
      bookingsQuery = query(collection(db, "bookings"), where("providerEmail", "==", user.email));
    }
    
    const unsubBookings = onSnapshot(bookingsQuery, (snapshot) => {
      const fetchedBookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBookings(fetchedBookings);
    });

    // Fetch Pets
    let unsubPets = () => {};
    if (user.role === 'owner') {
      const petsQuery = query(collection(db, "pets"), where("ownerEmail", "==", user.email));
      unsubPets = onSnapshot(petsQuery, (snapshot) => {
        const fetchedPets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPets(fetchedPets);
      });
    }

    // Fetch Users for Admin
    let unsubUsers = () => {};
    if (user.role === 'admin') {
      unsubUsers = onSnapshot(collection(db, "users"), (snapshot) => {
        const fetchedUsers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAllUsers(fetchedUsers);
      });
    }

    return () => {
      unsubBookings();
      unsubPets();
      unsubUsers();
    };
  }, [user, isAuthReady, navigate]);

  if (!isAuthReady || !user) return null;

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteDoc(doc(db, "users", userId));
      showNotification('User deleted successfully.', 'success');
    } catch (error) {
      console.error("Error deleting user:", error);
      showNotification('Failed to delete user.', 'error');
    }
  };

  const handleAddPet = async (e: React.FormEvent) => {
    e.preventDefault();
    const petId = Date.now().toString();
    const petToAdd = {
      ...newPet,
      id: petId,
      ownerEmail: user.email
    };
    
    try {
      await setDoc(doc(db, "pets", petId), petToAdd);
      setNewPet({ name: '', type: '', age: '', vaccinationStatus: 'Up to date' });
      setShowAddPet(false);
      showNotification('Pet added successfully!', 'success');
    } catch (error) {
      console.error("Error adding pet:", error);
      showNotification('Failed to add pet.', 'error');
    }
  };

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, "bookings", bookingId), { status: newStatus });
      
      const bookingToUpdate = bookings.find(b => b.id === bookingId);
      
      if (bookingToUpdate && bookingToUpdate.userEmail) {
        const notificationId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
        await setDoc(doc(db, "notifications", notificationId), {
          id: notificationId,
          userEmail: bookingToUpdate.userEmail,
          message: `Your booking for ${bookingToUpdate.service} with ${bookingToUpdate.provider} has been ${newStatus}.`,
          read: false,
          timestamp: new Date().toISOString()
        });
      }

      showNotification(`Booking status updated to ${newStatus}`, 'info');
    } catch (error) {
      console.error("Error updating booking:", error);
      showNotification('Failed to update booking status.', 'error');
    }
  };

  const handleDeleteBooking = async (bookingId: string) => {
    try {
      await deleteDoc(doc(db, "bookings", bookingId));
      showNotification('Booking deleted successfully.', 'success');
    } catch (error) {
      console.error("Error deleting booking:", error);
      showNotification('Failed to delete booking.', 'error');
    }
  };

  // Mock Data for charts based on role
  const getStatsForRole = () => {
    if (user.role === 'admin') {
      return [
        { label: "Total Users", value: "1,248", icon: <Users className="h-6 w-6" />, color: "bg-blue-100 text-blue-600" },
        { label: "Appointments Today", value: "42", icon: <Calendar className="h-6 w-6" />, color: "bg-teal-100 text-teal-600" },
        { label: "Total Revenue", value: "₹45,200", icon: <Activity className="h-6 w-6" />, color: "bg-purple-100 text-purple-600" },
        { label: "Active Providers", value: "89", icon: <FileText className="h-6 w-6" />, color: "bg-orange-100 text-orange-600" },
      ];
    } else if (user.role === 'doctor' || user.role === 'hospital') {
      return [
        { label: "My Patients", value: "156", icon: <Users className="h-6 w-6" />, color: "bg-blue-100 text-blue-600" },
        { label: "Today's Appts", value: "8", icon: <Calendar className="h-6 w-6" />, color: "bg-teal-100 text-teal-600" },
        { label: "Completed", value: "1,024", icon: <FileText className="h-6 w-6" />, color: "bg-purple-100 text-purple-600" },
        { label: "Earnings", value: "₹12,400", icon: <Activity className="h-6 w-6" />, color: "bg-orange-100 text-orange-600" },
      ];
    }
    return [];
  };

  const stats = getStatsForRole();

  const appointmentData = [
    { name: 'Mon', appointments: 30 },
    { name: 'Tue', appointments: 45 },
    { name: 'Wed', appointments: 38 },
    { name: 'Thu', appointments: 52 },
    { name: 'Fri', appointments: 60 },
    { name: 'Sat', appointments: 85 },
    { name: 'Sun', appointments: 40 },
  ];

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Confirmed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'Completed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      default: return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'; // Pending
    }
  };

  return (
    <div className="py-12 bg-slate-50 dark:bg-slate-900 min-h-screen transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* User Profile Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 mb-8 flex items-center gap-6">
          <div className="w-20 h-20 bg-teal-100 dark:bg-teal-900/50 rounded-full flex items-center justify-center text-teal-600 dark:text-teal-400 flex-shrink-0">
            <UserCircle className="h-12 w-12" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{user.name}</h1>
            <p className="text-slate-600 dark:text-slate-400 capitalize font-medium text-lg">{user.role} Account</p>
            <p className="text-slate-500 dark:text-slate-500 text-sm mt-1">{user.email}</p>
          </div>
        </div>

        {user.role === 'admin' && (
          <div className="flex gap-4 mb-6">
            <button 
              onClick={() => setActiveTab('bookings')}
              className={`px-6 py-2 rounded-full font-medium transition-colors ${activeTab === 'bookings' ? 'bg-teal-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
            >
              All Bookings
            </button>
            <button 
              onClick={() => setActiveTab('users')}
              className={`px-6 py-2 rounded-full font-medium transition-colors ${activeTab === 'users' ? 'bg-teal-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
            >
              Manage Users & Providers
            </button>
          </div>
        )}

        {/* Dynamic Content based on Role */}
        {user.role === 'owner' ? (
          <div className="space-y-8">
            {/* My Pets Section */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">My Pets</h2>
                <button 
                  onClick={() => setShowAddPet(!showAddPet)}
                  className="flex items-center gap-2 px-4 py-2 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 rounded-lg hover:bg-teal-100 dark:hover:bg-teal-900/50 transition-colors font-medium"
                >
                  <PlusCircle className="h-4 w-4" /> Add Pet
                </button>
              </div>

              {showAddPet && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 mb-6 animate-in fade-in slide-in-from-top-2">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Add New Pet</h3>
                  <form onSubmit={handleAddPet} className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Pet Name</label>
                      <input required type="text" value={newPet.name} onChange={e => setNewPet({...newPet, name: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white outline-none focus:border-teal-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Pet Type (e.g., Dog, Cat)</label>
                      <input required type="text" value={newPet.type} onChange={e => setNewPet({...newPet, type: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white outline-none focus:border-teal-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Age (Years)</label>
                      <input required type="number" value={newPet.age} onChange={e => setNewPet({...newPet, age: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white outline-none focus:border-teal-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Vaccination Status</label>
                      <select value={newPet.vaccinationStatus} onChange={e => setNewPet({...newPet, vaccinationStatus: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white outline-none focus:border-teal-500">
                        <option value="Up to date">Up to date</option>
                        <option value="Needs update">Needs update</option>
                        <option value="Not vaccinated">Not vaccinated</option>
                      </select>
                    </div>
                    <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                      <button type="button" onClick={() => setShowAddPet(false)} className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">Cancel</button>
                      <button type="submit" className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">Save Pet</button>
                    </div>
                  </form>
                </div>
              )}

              {pets.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-100 dark:border-slate-700 text-center">
                  <p className="text-slate-500 dark:text-slate-400 mb-4">You haven't added any pets yet.</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pets.map((pet, index) => (
                    <div key={index} className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center text-orange-600 dark:text-orange-400 font-bold text-xl">
                          {pet.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-slate-900 dark:text-white">{pet.name}</h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400">{pet.type} • {pet.age} years old</p>
                        </div>
                      </div>
                      <div className="text-sm">
                        <span className="text-slate-500 dark:text-slate-400">Vaccination: </span>
                        <span className={`font-medium ${pet.vaccinationStatus === 'Up to date' ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
                          {pet.vaccinationStatus}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* My Bookings Section */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Your Booked Services</h2>
              {bookings.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-100 dark:border-slate-700 text-center">
                  <p className="text-slate-500 dark:text-slate-400 mb-4">You have no booked services yet.</p>
                  <button onClick={() => navigate('/services')} className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
                    Book a Service
                  </button>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {bookings.map((booking, index) => (
                    <div key={index} className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white">{booking.serviceName}</h3>
                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${getStatusColor(booking.status || 'Pending')}`}>
                          {booking.status || 'Pending'}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                        <p><span className="font-medium text-slate-900 dark:text-slate-100">Provider:</span> {booking.providerName}</p>
                        <p><span className="font-medium text-slate-900 dark:text-slate-100">Date Booked:</span> {booking.date}</p>
                        <p><span className="font-medium text-slate-900 dark:text-slate-100">Price:</span> ₹{booking.price}</p>
                      </div>
                      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                        <button
                          onClick={() => {
                            setSelectedBooking(booking);
                            setShowBookingModal(true);
                          }}
                          className="w-full py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg font-medium transition-colors text-sm"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            {user.role === 'admin' && activeTab === 'users' ? (
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Platform Users & Providers</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-sm border-b border-slate-100 dark:border-slate-700">
                        <th className="px-6 py-4 font-medium">Name / Clinic</th>
                        <th className="px-6 py-4 font-medium">Email</th>
                        <th className="px-6 py-4 font-medium">Role</th>
                        <th className="px-6 py-4 font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {allUsers.map((u, idx) => (
                        <tr key={idx} className="border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                          <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{u.fullName || u.hospitalName}</td>
                          <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{u.email}</td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400">
                              {u.role}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <button 
                              onClick={() => handleDeleteUser(u.id)}
                              className="text-red-500 hover:text-red-700 dark:hover:text-red-400 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <>
                {/* Stats Grid for Admins/Doctors/Hospitals */}
                {user.role !== 'trainer' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {stats.map((stat) => (
                      <div key={stat.label} className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-4">
                        <div className={`p-4 rounded-xl ${stat.color} dark:bg-opacity-20`}>
                          {stat.icon}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
                          <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Charts */}
                {user.role !== 'trainer' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Weekly Appointments</h2>
                      <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={appointmentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                            <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                            <Bar dataKey="appointments" fill="#0d9488" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                )}

                {/* Recent Bookings Table */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                  <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      {user.role === 'admin' ? 'All Platform Bookings' : 'Your Appointments'}
                    </h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-sm border-b border-slate-100 dark:border-slate-700">
                          <th className="px-6 py-4 font-medium">Service</th>
                          <th className="px-6 py-4 font-medium">Client Name</th>
                          {user.role === 'admin' && <th className="px-6 py-4 font-medium">Provider</th>}
                          <th className="px-6 py-4 font-medium">Date</th>
                          <th className="px-6 py-4 font-medium">Price</th>
                          <th className="px-6 py-4 font-medium">Status</th>
                          {user.role !== 'owner' && <th className="px-6 py-4 font-medium">Action</th>}
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {bookings.length > 0 ? bookings.map((booking, idx) => (
                          <tr key={idx} className="border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                            <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{booking.serviceName}</td>
                            <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{booking.userName}</td>
                            {user.role === 'admin' && <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{booking.providerName}</td>}
                            <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{booking.date}</td>
                            <td className="px-6 py-4 text-slate-600 dark:text-slate-300">₹{booking.price}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status || 'Pending')}`}>
                                {booking.status || 'Pending'}
                              </span>
                            </td>
                            {user.role !== 'owner' && (
                              <td className="px-6 py-4 flex items-center gap-2">
                                <button
                                  onClick={() => {
                                    setSelectedBooking(booking);
                                    setShowBookingModal(true);
                                  }}
                                  className="text-xs px-3 py-1 bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 rounded hover:bg-teal-200 dark:hover:bg-teal-900/50 transition-colors font-medium"
                                >
                                  View Details
                                </button>
                                {user.role === 'admin' && (
                                  <button 
                                    onClick={() => handleDeleteBooking(booking.id)}
                                    className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                    title="Delete Booking"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                )}
                              </td>
                            )}
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan={user.role === 'admin' ? 7 : 6} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">No appointments found.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Booking Details Modal */}
      {showBookingModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl border border-slate-200 dark:border-slate-700">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-800 z-10">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Booking Details</h2>
              <button 
                onClick={() => setShowBookingModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 space-y-8">
              {/* User Details */}
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <UserCircle className="h-5 w-5 text-teal-600" /> Client Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Full Name</p>
                    <p className="font-medium text-slate-900 dark:text-white">{selectedBooking.userName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Email</p>
                    <p className="font-medium text-slate-900 dark:text-white">{selectedBooking.userEmail || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Phone Number</p>
                    <p className="font-medium text-slate-900 dark:text-white">{selectedBooking.userPhone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Address</p>
                    <p className="font-medium text-slate-900 dark:text-white">{selectedBooking.userAddress || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Pet Details */}
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="text-teal-600 text-xl">🐾</span> Pet Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Pet Name</p>
                    <p className="font-medium text-slate-900 dark:text-white">{selectedBooking.petName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Pet Type</p>
                    <p className="font-medium text-slate-900 dark:text-white">{selectedBooking.petType || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Pet Age</p>
                    <p className="font-medium text-slate-900 dark:text-white">{selectedBooking.petAge ? `${selectedBooking.petAge} years` : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Vaccination Status</p>
                    <p className="font-medium text-slate-900 dark:text-white">{selectedBooking.vaccinationStatus || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Booking Details */}
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-teal-600" /> Appointment Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Service</p>
                    <p className="font-medium text-slate-900 dark:text-white">{selectedBooking.serviceName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Provider</p>
                    <p className="font-medium text-slate-900 dark:text-white">{selectedBooking.providerName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Date</p>
                    <p className="font-medium text-slate-900 dark:text-white">{selectedBooking.date}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Price</p>
                    <p className="font-medium text-slate-900 dark:text-white">₹{selectedBooking.price}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Current Status</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${getStatusColor(selectedBooking.status || 'Pending')}`}>
                      {selectedBooking.status || 'Pending'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {user.role !== 'owner' && (!selectedBooking.status || selectedBooking.status === 'Pending') && (
              <div className="p-6 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3 bg-slate-50 dark:bg-slate-800/50 sticky bottom-0">
                <button
                  onClick={() => {
                    updateBookingStatus(selectedBooking.id, 'Cancelled');
                    setSelectedBooking({ ...selectedBooking, status: 'Cancelled' });
                    setShowBookingModal(false);
                  }}
                  className="px-6 py-2 bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <span>❌</span> Reject Booking
                </button>
                
                <button
                  onClick={() => {
                    updateBookingStatus(selectedBooking.id, 'Confirmed');
                    setSelectedBooking({ ...selectedBooking, status: 'Confirmed' });
                    setShowBookingModal(false);
                  }}
                  className="px-6 py-2 bg-teal-600 text-white hover:bg-teal-700 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm"
                >
                  <span>✅</span> Accept Booking
                </button>
              </div>
            )}

            {user.role === 'owner' && (!selectedBooking.status || selectedBooking.status === 'Pending') && (
              <div className="p-6 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3 bg-slate-50 dark:bg-slate-800/50 sticky bottom-0">
                <button
                  onClick={() => {
                    updateBookingStatus(selectedBooking.id, 'Cancelled');
                    setSelectedBooking({ ...selectedBooking, status: 'Cancelled' });
                    setShowBookingModal(false);
                  }}
                  className="px-6 py-2 bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <span>❌</span> Cancel Booking
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
