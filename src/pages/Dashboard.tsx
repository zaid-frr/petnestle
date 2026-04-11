import React, { useEffect, useState } from "react";
import { Users, Calendar, Activity, FileText, UserCircle, Trash2, PlusCircle, Phone, MessageSquare, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../context/NotificationContext";
import { db } from "../firebase";
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc, setDoc, getDocs } from "firebase/firestore";
import { demoProviders } from "../data/mockProviders";

export default function Dashboard() {
  const { user, isAuthReady } = useAuth();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [bookings, setBookings] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('bookings');
  const [myReviews, setMyReviews] = useState<any[]>([]);
  const [selectedAdminUser, setSelectedAdminUser] = useState<any>(null);
  const [showAdminUserModal, setShowAdminUserModal] = useState(false);
  
  // Pets state
  const [pets, setPets] = useState<any[]>([]);
  const [showAddPet, setShowAddPet] = useState(false);
  const [newPet, setNewPet] = useState({ name: '', type: '', age: '', vaccinationStatus: 'Up to date' });

  // Booking Modal State
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [appointmentTime, setAppointmentTime] = useState('');
  const [providerDetails, setProviderDetails] = useState<any>(null);
  const [bookingFilter, setBookingFilter] = useState('All');
  const [detailView, setDetailView] = useState<string | null>(null);

  useEffect(() => {
    if (selectedBooking && user?.role === 'owner') {
      const fetchProviderDetails = async () => {
        try {
          const usersRef = collection(db, "users");
          const q = query(usersRef, where("email", "==", selectedBooking.providerEmail));
          const snapshot = await getDocs(q);
          if (!snapshot.empty) {
            setProviderDetails(snapshot.docs[0].data());
          }
        } catch (error) {
          console.error("Error fetching provider details:", error);
        }
      };
      fetchProviderDetails();
    } else {
      setProviderDetails(null);
    }
  }, [selectedBooking, user]);

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

    // Fetch reviews given by this user (owners)
    let unsubReviews = () => {};
    if (user.role === 'owner') {
      const reviewsQuery = query(collection(db, "reviews"), where("userEmail", "==", user.email));
      unsubReviews = onSnapshot(reviewsQuery, (snapshot) => {
        const fetchedReviews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMyReviews(fetchedReviews);
      });
    }

    return () => {
      unsubBookings();
      unsubPets();
      unsubUsers();
      unsubReviews();
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

  const updateBookingStatus = async (bookingId: string, newStatus: string, time?: string) => {
    try {
      const updateData: any = { status: newStatus };
      if (time) {
        updateData.time = time;
      }
      
      await updateDoc(doc(db, "bookings", bookingId), updateData);
      
      const bookingToUpdate = bookings.find(b => b.id === bookingId);
      
      if (bookingToUpdate && bookingToUpdate.userEmail) {
        const notificationId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
        let message = `Your booking for ${bookingToUpdate.service} with ${bookingToUpdate.provider} has been ${newStatus}.`;
        if (time) {
          message += ` Scheduled time: ${time}.`;
        }
        
        await setDoc(doc(db, "notifications", notificationId), {
          id: notificationId,
          userEmail: bookingToUpdate.userEmail,
          message: message,
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

  // Calculate real earnings from bookings
  const calculateEarnings = () => {
    return bookings
      .filter(b => b.status === 'Completed' || b.paymentStatus === 'Paid')
      .reduce((total, b) => total + parseFloat(b.price || '0'), 0);
  };

  const calculateTotalRevenue = () => {
    // Admin sees all completed/paid bookings
    return bookings
      .filter(b => b.status === 'Completed' || b.paymentStatus === 'Paid')
      .reduce((total, b) => total + parseFloat(b.price || '0'), 0);
  };

  const getStatsForRole = () => {
    if (user.role === 'admin') {
      return [
        { label: "Total Users", value: allUsers.length.toString(), icon: <Users className="h-6 w-6" />, color: "bg-blue-100 text-blue-600" },
        { label: "Total Bookings", value: bookings.length.toString(), icon: <Calendar className="h-6 w-6" />, color: "bg-teal-100 text-teal-600" },
        { label: "Total Revenue", value: `₹${calculateTotalRevenue()}`, icon: <Activity className="h-6 w-6" />, color: "bg-purple-100 text-purple-600" },
        { label: "Active Providers", value: allUsers.filter(u => u.role !== 'owner' && u.role !== 'admin').length.toString(), icon: <FileText className="h-6 w-6" />, color: "bg-orange-100 text-orange-600" },
      ];
    } else if (user.role === 'doctor' || user.role === 'hospital' || user.role === 'trainer') {
      return [
        { label: "My Patients/Clients", value: new Set(bookings.map(b => b.userEmail)).size.toString(), icon: <Users className="h-6 w-6" />, color: "bg-blue-100 text-blue-600" },
        { label: "Total Appts", value: bookings.length.toString(), icon: <Calendar className="h-6 w-6" />, color: "bg-teal-100 text-teal-600" },
        { label: "Completed", value: bookings.filter(b => b.status === 'Completed').length.toString(), icon: <FileText className="h-6 w-6" />, color: "bg-purple-100 text-purple-600" },
        { label: "Earnings", value: `₹${calculateEarnings()}`, icon: <Activity className="h-6 w-6" />, color: "bg-orange-100 text-orange-600" },
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

  const statusCounts = {
    pending: bookings.filter(b => (b.status || 'Pending') === 'Pending').length,
    confirmed: bookings.filter(b => b.status === 'Confirmed').length,
    completed: bookings.filter(b => b.status === 'Completed').length,
    cancelled: bookings.filter(b => b.status === 'Cancelled').length,
  };

  const statusChartData = [
    { name: 'Pending', value: statusCounts.pending },
    { name: 'Confirmed', value: statusCounts.confirmed },
    { name: 'Completed', value: statusCounts.completed },
    { name: 'Cancelled', value: statusCounts.cancelled },
  ];

  const providerNameById = new Map<string, string>(demoProviders.map((p: any) => [p.id, p.name]));

  const filteredBookings = bookings.filter(b => {
    if (bookingFilter === 'All') return true;
    const status = b.status || 'Pending';
    return status === bookingFilter;
  });

  const renderDetailContent = () => {
    if (detailView === 'My Reviews') {
      return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
          {myReviews.length > 0 ? (
            <div className="space-y-4">
              {myReviews.map((review, idx) => (
                <div key={idx} className="border-b border-slate-100 dark:border-slate-700 pb-4 last:border-0 last:pb-0">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-slate-900 dark:text-white">{review.providerName}</h4>
                    <span className="text-amber-500">{'★'.repeat(review.rating)}{'☆'.repeat(5-review.rating)}</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-sm">{review.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 dark:text-slate-400 text-center py-8">No reviews yet.</p>
          )}
        </div>
      );
    }

    if (detailView === 'My Patients/Clients') {
      const uniqueEmails = Array.from(new Set(bookings.map(b => b.userEmail)));
      const patients = uniqueEmails.map(email => bookings.find(b => b.userEmail === email));
      return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-sm border-b border-slate-100 dark:border-slate-700">
                  <th className="px-6 py-4 font-medium">Client Name</th>
                  <th className="px-6 py-4 font-medium">Pet Name</th>
                  <th className="px-6 py-4 font-medium">Contact</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {patients.length > 0 ? patients.map((p, idx) => (
                  <tr key={idx} className="border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{p?.userName}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{p?.petName || 'N/A'}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{p?.userEmail}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">No clients found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    if (detailView === 'Total Users' || detailView === 'Active Providers') {
      const filteredUsers = detailView === 'Active Providers' ? allUsers.filter(u => u.role !== 'owner' && u.role !== 'admin') : allUsers;
      return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-sm border-b border-slate-100 dark:border-slate-700">
                  <th className="px-6 py-4 font-medium">Name</th>
                  <th className="px-6 py-4 font-medium">Email</th>
                  <th className="px-6 py-4 font-medium">Role</th>
                  <th className="px-6 py-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {filteredUsers.length > 0 ? filteredUsers.map((u, idx) => (
                  <tr key={idx} className="border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{u.name || 'N/A'}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{u.email}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300 capitalize">{u.role}</td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => {
                          setSelectedAdminUser(u);
                          setShowAdminUserModal(true);
                        }}
                        className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 font-medium"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">No users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    // Default to Bookings table
    let filtered = bookings;
    if (detailView === 'Pending') filtered = bookings.filter(b => (b.status || 'Pending') === 'Pending');
    if (detailView === 'Completed') filtered = bookings.filter(b => b.status === 'Completed');
    if (detailView === 'Earnings' || detailView === 'Total Revenue') filtered = bookings.filter(b => b.status === 'Completed' || b.paymentStatus === 'Paid');

    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
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
                <th className="px-6 py-4 font-medium">Payment</th>
                <th className="px-6 py-4 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filtered.length > 0 ? filtered.map((booking, idx) => (
                <tr key={idx} className="border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{booking.serviceName}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{booking.userName}</td>
                  {user.role === 'admin' && <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{providerNameById.get(booking.providerId) || booking.providerEmail}</td>}
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{booking.date} {booking.time && <span className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded ml-2">{booking.time}</span>}</td>
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">₹{booking.price}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status || 'Pending')}`}>
                      {booking.status || 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${booking.paymentStatus === 'Paid' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300'}`}>
                      {booking.paymentStatus || 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => {
                        setSelectedBooking(booking);
                        setShowBookingModal(true);
                      }}
                      className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 font-medium"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={user.role === 'admin' ? 8 : 7} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                    No bookings found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="py-12 bg-slate-50 dark:bg-slate-900 min-h-screen transition-colors duration-200">
      <div className="w-full px-4 sm:px-6 lg:px-8 2xl:px-12">
        
        {detailView ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <button 
              onClick={() => setDetailView(null)} 
              className="mb-6 flex items-center gap-2 text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 font-medium transition-colors"
            >
              ← Back to Dashboard
            </button>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">{detailView} Details</h2>
            {renderDetailContent()}
          </div>
        ) : (
          <>
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
            {/* Owner Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div 
                onClick={() => setDetailView('All')}
                className={`bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border ${detailView === 'All' ? 'border-teal-500 ring-1 ring-teal-500' : 'border-slate-100 dark:border-slate-700'} cursor-pointer hover:shadow-md transition-all`}
              >
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Total Appointments</p>
                <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">{bookings.length}</p>
              </div>
              <div 
                onClick={() => setDetailView('Pending')}
                className={`bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border ${detailView === 'Pending' ? 'border-amber-500 ring-1 ring-amber-500' : 'border-slate-100 dark:border-slate-700'} cursor-pointer hover:shadow-md transition-all`}
              >
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Pending</p>
                <p className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 mt-2">{statusCounts.pending}</p>
              </div>
              <div 
                onClick={() => setDetailView('Completed')}
                className={`bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border ${detailView === 'Completed' ? 'border-green-500 ring-1 ring-green-500' : 'border-slate-100 dark:border-slate-700'} cursor-pointer hover:shadow-md transition-all`}
              >
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Completed</p>
                <p className="text-3xl font-extrabold text-green-600 dark:text-green-400 mt-2">{statusCounts.completed}</p>
              </div>
              <div 
                onClick={() => setDetailView('My Reviews')}
                className={`bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border ${detailView === 'My Reviews' ? 'border-purple-500 ring-1 ring-purple-500' : 'border-slate-100 dark:border-slate-700'} cursor-pointer hover:shadow-md transition-all`}
              >
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">My Reviews</p>
                <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">{myReviews.length}</p>
              </div>
            </div>

            {/* Status chart + History */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Appointments Status</h2>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={statusChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                      <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                      <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Bar dataKey="value" fill="#0d9488" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                {bookings.length === 0 && (
                  <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                    No bookings yet — bars will update automatically after your first appointment.
                  </p>
                )}
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Appointment History</h2>
                {bookings.length === 0 ? (
                  <p className="text-slate-500 dark:text-slate-400 text-sm">No appointments yet.</p>
                ) : (
                  <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
                    {[...bookings]
                      .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')))
                      .map((b, idx) => (
                        <div key={idx} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-700">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white">{b.serviceName}</p>
                              <p className="text-sm text-slate-600 dark:text-slate-300">Provider: {b.providerName}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{b.date}{b.time ? ` • ${b.time}` : ''}</p>
                            </div>
                            <span className={`px-3 py-1 text-xs font-bold rounded-full ${getStatusColor(b.status || 'Pending')}`}>
                              {b.status || 'Pending'}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>

            {/* Reviews given by customer */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">My Reviews</h2>
              {myReviews.length === 0 ? (
                <p className="text-slate-500 dark:text-slate-400 text-sm">No reviews posted yet.</p>
              ) : (
                <div className="space-y-4">
                  {myReviews
                    .slice()
                    .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')))
                    .map((r: any) => (
                      <div key={r.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-700">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">
                              {providerNameById.get(r.providerId) || r.providerName || 'Provider'}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{r.date || ''}</p>
                          </div>
                        </div>
                        <p className="text-sm text-slate-700 dark:text-slate-200 mt-2">{r.text}</p>
                      </div>
                    ))}
                </div>
              )}
            </div>

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
                          <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedAdminUser(u);
                                setShowAdminUserModal(true);
                              }}
                              className="text-left hover:underline decoration-teal-400 underline-offset-4"
                            >
                              {u.name || u.fullName || u.hospitalName || u.clinicName || 'User'}
                            </button>
                          </td>
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
                {/* Stats Grid for Admins/Doctors/Hospitals/Trainers */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {stats.map((stat) => {
                    const filterValue = stat.label === 'Total Appts' || stat.label === 'Total Bookings' ? 'All' : stat.label;
                    const isActive = detailView === filterValue;
                    
                    return (
                      <div 
                        key={stat.label} 
                        onClick={() => setDetailView(filterValue)}
                        className={`bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border flex items-center gap-4 cursor-pointer hover:shadow-md transition-all ${isActive ? 'border-teal-500 ring-1 ring-teal-500' : 'border-slate-100 dark:border-slate-700'}`}
                      >
                        <div className={`p-4 rounded-xl ${stat.color} dark:bg-opacity-20`}>
                          {stat.icon}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
                          <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Charts */}
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
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Bookings Status</h2>
                      <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={statusChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                            <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                            <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                            <Bar dataKey="value" fill="#0d9488" radius={[6, 6, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      {bookings.length === 0 && (
                        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                          No bookings yet — bars will update automatically.
                        </p>
                      )}
                    </div>
                  </div>

                {/* Recent Bookings Table */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                  <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      {user.role === 'admin' ? 'All Platform Bookings' : 'Your Appointments'}
                    </h2>
                    {user.role !== 'admin' && (
                      <div className="flex gap-2 bg-slate-100 dark:bg-slate-900/50 p-1 rounded-lg">
                        {['All', 'Pending', 'Confirmed', 'Completed'].map(status => (
                          <button
                            key={status}
                            onClick={() => setBookingFilter(status)}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${bookingFilter === status ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    )}
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
                          <th className="px-6 py-4 font-medium">Payment</th>
                          <th className="px-6 py-4 font-medium">Action</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {filteredBookings.length > 0 ? filteredBookings.map((booking, idx) => (
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
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${booking.paymentStatus === 'Paid' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                                {booking.paymentStatus || 'Pending'}
                              </span>
                            </td>
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
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan={user.role === 'admin' ? 8 : 7} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">No appointments found.</td>
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
          </>
        )}
      </div>

      {/* Admin user details modal */}
      {showAdminUserModal && selectedAdminUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {selectedAdminUser.name || selectedAdminUser.fullName || selectedAdminUser.hospitalName || 'User'}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">{selectedAdminUser.role || 'user'}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAdminUserModal(false)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex flex-col sm:flex-row gap-5 items-start">
                <div className="w-24 h-24 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 flex-shrink-0">
                  {selectedAdminUser.photoURL || selectedAdminUser.image ? (
                    <img
                      src={selectedAdminUser.photoURL || selectedAdminUser.image}
                      alt="Profile"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = `https://picsum.photos/seed/${encodeURIComponent(
                          selectedAdminUser.id || selectedAdminUser.email || 'user'
                        )}/300/300`;
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <UserCircle className="h-10 w-10" />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                  <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-700 rounded-xl p-4">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Email</p>
                    <p className="font-medium text-slate-900 dark:text-white break-all">{selectedAdminUser.email || '—'}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-700 rounded-xl p-4">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Phone</p>
                    <p className="font-medium text-slate-900 dark:text-white">{selectedAdminUser.phone || selectedAdminUser.phoneNumber || '—'}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-700 rounded-xl p-4 sm:col-span-2">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Address / Location</p>
                    <p className="font-medium text-slate-900 dark:text-white">{selectedAdminUser.address || selectedAdminUser.location || '—'}</p>
                  </div>
                </div>
              </div>

              {(selectedAdminUser.about || selectedAdminUser.userAbout) && (
                <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-700 rounded-xl p-4">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">About</p>
                  <p className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap">
                    {selectedAdminUser.about || selectedAdminUser.userAbout}
                  </p>
                </div>
              )}

              {/* Role-specific */}
              {selectedAdminUser.role === 'doctor' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-700 rounded-xl p-4">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Clinic</p>
                    <p className="font-medium text-slate-900 dark:text-white">{selectedAdminUser.clinicName || '—'}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-700 rounded-xl p-4">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Specialization</p>
                    <p className="font-medium text-slate-900 dark:text-white">{selectedAdminUser.specialization || '—'}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-700 rounded-xl p-4">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Experience</p>
                    <p className="font-medium text-slate-900 dark:text-white">{selectedAdminUser.experience ? `${selectedAdminUser.experience} years` : '—'}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-700 rounded-xl p-4">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Fee</p>
                    <p className="font-medium text-slate-900 dark:text-white">{selectedAdminUser.consultationFee ? `₹${selectedAdminUser.consultationFee}` : '—'}</p>
                  </div>
                </div>
              )}

              {selectedAdminUser.role === 'owner' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-700 rounded-xl p-4">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Pet Name</p>
                    <p className="font-medium text-slate-900 dark:text-white">{selectedAdminUser.petName || '—'}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-700 rounded-xl p-4">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Pet Type</p>
                    <p className="font-medium text-slate-900 dark:text-white">{selectedAdminUser.petType || '—'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
                
                {/* Communication Actions for Providers */}
                {user.role !== 'owner' && user.role !== 'admin' && selectedBooking.userPhone && (selectedBooking.status === 'Confirmed' || selectedBooking.status === 'Completed') && (
                  <div className="flex gap-3 mt-4">
                    <a 
                      href={`tel:${selectedBooking.userPhone}`}
                      className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors font-medium"
                    >
                      <Phone className="h-4 w-4" /> Call Client
                    </a>
                    <a 
                      href={`mailto:${selectedBooking.userEmail}`}
                      className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors font-medium"
                    >
                      <MessageSquare className="h-4 w-4" /> Message
                    </a>
                  </div>
                )}
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

              {/* Provider Details for Owner */}
              {user.role === 'owner' && providerDetails && (
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <UserCircle className="h-5 w-5 text-teal-600" /> Provider Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Name</p>
                      <p className="font-medium text-slate-900 dark:text-white">{providerDetails.name || providerDetails.fullName || providerDetails.hospitalName || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Email</p>
                      <p className="font-medium text-slate-900 dark:text-white">{providerDetails.email || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Phone Number</p>
                      <p className="font-medium text-slate-900 dark:text-white">{providerDetails.phone || providerDetails.phoneNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Address</p>
                      <p className="font-medium text-slate-900 dark:text-white">{providerDetails.address || providerDetails.location || 'N/A'}</p>
                    </div>
                  </div>
                  
                  {/* Communication Actions for Owners */}
                  {(providerDetails.phone || providerDetails.phoneNumber) && (selectedBooking.status === 'Confirmed' || selectedBooking.status === 'Completed') && (
                    <div className="flex gap-3 mt-4">
                      <a 
                        href={`tel:${providerDetails.phone || providerDetails.phoneNumber}`}
                        className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors font-medium"
                      >
                        <Phone className="h-4 w-4" /> Call Provider
                      </a>
                      <a 
                        href={`mailto:${providerDetails.email}`}
                        className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors font-medium"
                      >
                        <MessageSquare className="h-4 w-4" /> Message
                      </a>
                    </div>
                  )}
                </div>
              )}

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
                    <p className="text-sm text-slate-500 dark:text-slate-400">Time</p>
                    <p className="font-medium text-slate-900 dark:text-white">{selectedBooking.time || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Price</p>
                    <p className="font-medium text-slate-900 dark:text-white">₹{selectedBooking.price}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Payment Status</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${selectedBooking.paymentStatus === 'Paid' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                      {selectedBooking.paymentStatus || 'Pending'}
                    </span>
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
            {user.role !== 'owner' && user.role !== 'admin' && (!selectedBooking.status || selectedBooking.status === 'Pending') && (
              <div className="p-6 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 sticky bottom-0">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Set Appointment Time</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="time"
                      value={appointmentTime}
                      onChange={(e) => setAppointmentTime(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 outline-none"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Please set a time before confirming the appointment.</p>
                </div>
                
                <div className="flex justify-end gap-3">
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
                      if (!appointmentTime) {
                        showNotification('Please set an appointment time', 'error');
                        return;
                      }
                      updateBookingStatus(selectedBooking.id, 'Confirmed', appointmentTime);
                      setSelectedBooking({ ...selectedBooking, status: 'Confirmed', time: appointmentTime });
                      setShowBookingModal(false);
                      setAppointmentTime('');
                    }}
                    className="px-6 py-2 bg-teal-600 text-white hover:bg-teal-700 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm"
                  >
                    <span>✅</span> Accept & Set Time
                  </button>
                </div>
              </div>
            )}

            {user.role !== 'owner' && user.role !== 'admin' && selectedBooking.status === 'Confirmed' && (
              <div className="p-6 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3 bg-slate-50 dark:bg-slate-800/50 sticky bottom-0">
                <button
                  onClick={() => {
                    updateBookingStatus(selectedBooking.id, 'Completed');
                    setSelectedBooking({ ...selectedBooking, status: 'Completed' });
                    setShowBookingModal(false);
                  }}
                  className="px-6 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm"
                >
                  <span>✓</span> Mark as Completed
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
