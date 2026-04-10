const vetFirstNames = ['Aarav', 'Ananya', 'Ishaan', 'Meera', 'Vihaan', 'Kavya', 'Arjun', 'Diya', 'Reyansh', 'Saanvi'];
const vetLastNames = ['Sharma', 'Iyer', 'Reddy', 'Patel', 'Kapoor', 'Nair', 'Gupta', 'Khan', 'Mehta', 'Das'];
const trainerFirstNames = ['Amit', 'Sneha', 'Rohit', 'Neha', 'Karan', 'Pooja', 'Rahul', 'Ira', 'Vikram', 'Tanya'];
const trainerLastNames = ['Singh', 'Joshi', 'Desai', 'Chopra', 'Banerjee', 'Bhat', 'Saxena', 'Malhotra', 'Sethi', 'Rana'];
const cityAreas = [
  'Indiranagar, Bengaluru',
  'Andheri West, Mumbai',
  'Banjara Hills, Hyderabad',
  'Koramangala, Bengaluru',
  'Powai, Mumbai',
  'Jubilee Hills, Hyderabad',
  'Connaught Place, New Delhi',
  'Anna Nagar, Chennai',
  'Salt Lake, Kolkata',
  'Koregaon Park, Pune',
];

const vetSpecializations = [
  'General Veterinary Medicine',
  'Veterinary Surgery',
  'Veterinary Dentistry',
  'Veterinary Dermatology',
  'Emergency & Critical Care',
];

const trainingTypes = [
  'Obedience Training',
  'Agility Training',
  'Behavioral Modification',
  'Puppy Training',
  'Service Dog Training',
];

const randomUserPortrait = (index: number) => {
  // Stable real-person portraits for mock data (avoids random scenery images).
  // 0-99 supported.
  const n = (index % 100);
  const gender = index % 2 === 0 ? 'women' : 'men';
  return `https://randomuser.me/api/portraits/${gender}/${n}.jpg`;
};

const unsplashRandom = (keywords: string, sig: string | number) =>
  `https://source.unsplash.com/600x600/?${encodeURIComponent(keywords)}&sig=${encodeURIComponent(String(sig))}`;

const dogBreeds = ['Labrador Retriever', 'Golden Retriever', 'German Shepherd', 'Beagle', 'Pug', 'Shih Tzu', 'Indie dog'];
const clinicBackgrounds = ['modern veterinary clinic', 'pet hospital lobby', 'consultation room', 'clinic reception'];
const portraitStyles = ['soft studio lighting', 'natural window light', 'cinematic lighting', 'bright clean lighting'];
const hospitalNames = [
  'GreenCross Animal Hospital',
  'CityPaws Emergency Vet Center',
  'Apollo Pet Hospital',
  'BlueVet 24x7 Hospital',
  'Care & Cure Animal Hospital',
  'Happy Paws Pet Hospital',
  'Central Veterinary Hospital',
  'Metro Animal Care Hospital',
];
const daycareNames = [
  'Happy Tails Daycare',
  'Paws & Play Daycare',
  'FurEver Friends Daycare',
  'Wag & Woof Boarding',
  'Purr & Paws Care',
  'TailTown Pet Daycare',
  'SnuggleStay Boarding',
  'PlayPaws Pet Care',
];

export const demoProviders = [
  // Doctors (15)
  ...Array.from({ length: 15 }).map((_, i) => {
    const fullName = `Dr. ${vetFirstNames[i % vetFirstNames.length]} ${vetLastNames[i % vetLastNames.length]}`;
    const specialization = vetSpecializations[i % vetSpecializations.length];
    const experienceYears = (i % 14) + 2;
    const fee = 300 + i * 50;
    return {
      id: `demo_vet_${i + 1}`,
      name: fullName,
      role: 'doctor',
      email: `vet${i + 1}@petnestle.demo`,
      phone: `+91 90000 0${(100 + i).toString().slice(-3)}`,
      specialization,
      experience: `${experienceYears}`,
      charges: `${fee}`,
      consultationFee: `${fee}`,
      about: `Compassionate veterinarian focused on preventive care and clear guidance for pet parents. Specializes in ${specialization}.`,
      photoURL: randomUserPortrait(i + 10),
      rating: (4.4 + (i % 6) * 0.1).toFixed(1),
      reviews: 22 + i * 4,
      location: `PawCare Clinic • ${cityAreas[i % cityAreas.length]}`,
    };
  }),

  // Trainers (15)
  ...Array.from({ length: 15 }).map((_, i) => {
    const fullName = `${trainerFirstNames[i % trainerFirstNames.length]} ${trainerLastNames[i % trainerLastNames.length]}`;
    const trainingType = trainingTypes[i % trainingTypes.length];
    const experienceYears = (i % 10) + 1;
    const fee = 200 + i * 30;
    const breed = dogBreeds[i % dogBreeds.length];
    return {
      id: `demo_trainer_${i + 1}`,
      name: fullName,
      role: 'trainer',
      email: `trainer${i + 1}@petnestle.demo`,
      phone: `+91 98888 0${(100 + i).toString().slice(-3)}`,
      experience: `${experienceYears}`,
      charges: `${fee}`,
      consultationFee: `${fee}`,
      trainingType,
      trainingTypes: trainingType,
      about: `Certified trainer using positive reinforcement to build calm, confident behavior. Customized plans for each pet.`,
      photoURL: randomUserPortrait(i + 40),
      rating: (4.5 + (i % 5) * 0.1).toFixed(1),
      reviews: 16 + i * 3,
      location: `Training Hub • ${cityAreas[(i + 3) % cityAreas.length]}`,
    };
  }),

  // Hospitals (15)
  ...Array.from({ length: 15 }).map((_, i) => {
    const hospitalName = `${hospitalNames[i % hospitalNames.length]} ${i + 1}`;
    const fee = 600 + i * 80;
    const style = ['glass facade', 'brick facade', 'modern white building', 'urban clinic exterior'][i % 4];
    return {
      id: `demo_hospital_${i + 1}`,
      name: hospitalName,
      role: 'hospital',
      email: `hospital${i + 1}@petnestle.demo`,
      phone: `+91 97777 0${(100 + i).toString().slice(-3)}`,
      experience: `${(i % 20) + 5}`,
      charges: `${fee}`,
      consultationFee: `${fee}`,
      emergencyServices: i % 2 === 0,
      bedCapacity: `${30 + i * 5}`,
      about: `Comprehensive veterinary hospital with modern diagnostics, surgery, and emergency care. Compassion-first team.`,
      photoURL: unsplashRandom('hospital,building,clinic', `hospital-${i + 1}`),
      rating: (4.3 + (i % 6) * 0.1).toFixed(1),
      reviews: 60 + i * 9,
      location: `${cityAreas[(i + 6) % cityAreas.length]}`,
    };
  }),

  // Pet Care (15)
  ...Array.from({ length: 15 }).map((_, i) => {
    const businessName = `${daycareNames[i % daycareNames.length]} ${i + 1}`;
    const fee = 180 + i * 25;
    const room = ['indoor play area', 'outdoor play yard', 'boarding room', 'grooming station'][i % 4];
    return {
      id: `demo_petcare_${i + 1}`,
      name: businessName,
      role: 'pet_care',
      email: `petcare${i + 1}@petnestle.demo`,
      phone: `+91 96666 0${(100 + i).toString().slice(-3)}`,
      experience: `${(i % 8) + 1}`,
      charges: `${fee}`,
      consultationFee: `${fee}`,
      about: `Safe, clean, and fun daycare with supervised play, rest breaks, and daily updates for pet parents.`,
      photoURL: unsplashRandom('dogs,daycare,pet', `petcare-${i + 1}`),
      rating: (4.4 + (i % 5) * 0.1).toFixed(1),
      reviews: 28 + i * 4,
      location: `${cityAreas[(i + 1) % cityAreas.length]}`,
    };
  }),
];
