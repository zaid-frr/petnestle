const vetProviders = [
  { name: 'Dr. Maya Patel', gender: 'female' },
  { name: 'Dr. Aarav Singh', gender: 'male' },
  { name: 'Dr. Emily Chen', gender: 'female' },
  { name: 'Dr. Daniel Brown', gender: 'male' },
  { name: 'Dr. Aisha Khan', gender: 'female' },
  { name: 'Dr. Lucas Martin', gender: 'male' },
  { name: 'Dr. Priya Iyer', gender: 'female' },
  { name: 'Dr. Noah Walker', gender: 'male' },
  { name: 'Dr. Sofia Reed', gender: 'female' },
  { name: 'Dr. Ethan Lopez', gender: 'male' },
  { name: 'Dr. Nina Shah', gender: 'female' },
  { name: 'Dr. Oliver Kim', gender: 'male' },
  { name: 'Dr. Isabel Torres', gender: 'female' },
  { name: 'Dr. Henry Clarke', gender: 'male' },
  { name: 'Dr. Ayla Brooks', gender: 'female' }
];

const trainerProviders = [
  { name: 'Liam Foster', gender: 'male' },
  { name: 'Sofia Meyers', gender: 'female' },
  { name: 'Noah Carter', gender: 'male' },
  { name: 'Emma Brooks', gender: 'female' },
  { name: 'Ava Morgan', gender: 'female' },
  { name: 'Mason Cooper', gender: 'male' },
  { name: 'Mia Bennett', gender: 'female' },
  { name: 'Elijah Hayes', gender: 'male' },
  { name: 'Lily Hudson', gender: 'female' },
  { name: 'Lucas Reed', gender: 'male' },
  { name: 'Chloe Harper', gender: 'female' },
  { name: 'Aiden Wells', gender: 'male' },
  { name: 'Zoe Griffin', gender: 'female' },
  { name: 'Owen Porter', gender: 'male' },
  { name: 'Grace Ellis', gender: 'female' }
];

const hospitalNames = [
  'North Star Pet Care',
  'PawGuard Animal Hospital',
  'Silver Lake Pet Center',
  'Sunrise Veterinary Emergency',
  'Pinecrest Animal Clinic',
  'Harvest Vet Care',
  'Willowbrook Pet Hospital',
  'Riverbend Animal Center',
  'Maple Street Vet',
  'Harborview Pet Emergency',
  'Meadowlands Veterinary',
  'Lakeside Animal ER',
  'Blue Ridge Pet Hospital',
  'Greenfield Veterinary',
  'Cedar Park Animal Care'
];

const petCareNames = [
  'Happy Tails Daycare',
  'Furry Friends Boarding',
  'Paws & Play Retreat',
  'Cozy Critter Care',
  'Whisker Wonderland',
  'Pawfect Stay',
  'Tail Waggers Inn',
  'Snuggle Paws Care',
  'Bark & Bubble Daycare',
  'Purrfect Pet Lounge',
  'Gentle Paws Resort',
  'Cuddly Critter Suites',
  'Playful Paws Hub',
  'Comfort Critters Daycare',
  'Sunny Side Pet Care'
];

const vetLocations = [
  'Central Veterinary Clinic',
  'Greenfield Animal Hospital',
  'Lakeside Vet Center',
  'Hilltop Pet Care',
  'Meadowview Animal Clinic',
  'Garden City Vet',
  'Oakwood Veterinary',
  'Paw Street Health',
  'Riverbend Animal Clinic',
  'Forest Gate Vet',
  'Silver Meadows Clinic',
  'Harbor Pet Care',
  'Maple Grove Vet',
  'Willow Creek Animal Clinic',
  'Beacon Hill Veterinary'
];

const trainerLocations = [
  'River Park Training',
  'Pawsitive Behavior Studio',
  'Happy Trails Training',
  'Top Dog Academy',
  'Bark & Bond Center',
  'Urban Paws Training',
  'Canine Confidence Club',
  'Wagging Tails Studio',
  'Puppy Power School',
  'Tailored Training Hub',
  'Pet Performance Lab',
  'Gentle Guidance Gym',
  'Agility Avenue',
  'Playful Paws School',
  'Positive Paws Workshop'
];

const hospitalLocations = [
  'North Star Boulevard',
  'PawGuard Road',
  'Silver Lake Drive',
  'Sunrise Avenue',
  'Pinecrest Circle',
  'Harvest Way',
  'Willowbrook Lane',
  'Riverbend Street',
  'Maple Street',
  'Harborview Drive',
  'Meadowlands Road',
  'Lakeside Boulevard',
  'Blue Ridge Way',
  'Greenfield Lane',
  'Cedar Park Road'
];

const petCareLocations = [
  'Sunny Meadow Way',
  'Paws Park Drive',
  'Cozy Corner Lane',
  'Friendly Fields Road',
  'Barkside Avenue',
  'Tailwind Street',
  'Cuddle Court',
  'Playful Path',
  'Whisker Way',
  'Petal Lane',
  'Comfort Crescent',
  'Snuggle Street',
  'Purrview Place',
  'Joyful Junction',
  'Happy Haven Boulevard'
];

const hospitalPhotoURLs = [
  'https://images.unsplash.com/photo-1580281657521-2066a3a301d8?auto=format&fit=crop&q=80&w=300&h=300',
  'https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?auto=format&fit=crop&q=80&w=300&h=300',
  'https://images.unsplash.com/photo-1576765607928-5b3bcee8d04c?auto=format&fit=crop&q=80&w=300&h=300',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300&h=300',
  'https://images.unsplash.com/photo-1581093578401-5d95544f7215?auto=format&fit=crop&q=80&w=300&h=300'
];

const petCarePhotoURLs = [
  'https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?auto=format&fit=crop&q=80&w=300&h=300',
  'https://images.unsplash.com/photo-1508672019048-805c876b67e2?auto=format&fit=crop&q=80&w=300&h=300',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=300&h=300',
  'https://images.unsplash.com/photo-1483794344563-d27a8d38d9a6?auto=format&fit=crop&q=80&w=300&h=300',
  'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=300&h=300'
];

const specializations = [
  'General Veterinary Medicine',
  'Veterinary Surgery',
  'Veterinary Dentistry',
  'Veterinary Dermatology',
  'Emergency & Critical Care'
];

export const mockProviders = [
  // Doctors (15)
  ...vetProviders.map((provider, i) => ({
    id: `mock_vet_${i + 1}`,
    isMock: true,
    name: provider.name,
    role: 'doctor',
    email: `vet${i + 1}@example.com`,
    phone: `+123456789${i.toString().padStart(2, '0')}`,
    specialization: specializations[i % specializations.length],
    experience: `${(i % 15) + 2}`,
    consultationFee: `${300 + i * 50}`,
    about: `Experienced veterinarian focused on compassionate, modern care for pets. Specialized in ${specializations[i % specializations.length]}.`,
    photoURL: provider.gender === 'male'
      ? `https://randomuser.me/api/portraits/men/${10 + i}.jpg`
      : `https://randomuser.me/api/portraits/women/${10 + i}.jpg`,
    rating: (4.0 + (i % 10) * 0.1).toFixed(1),
    reviews: 20 + i * 5,
    location: vetLocations[i]
  })),

  // Trainers (15)
  ...trainerProviders.map((provider, i) => ({
    id: `mock_trainer_${i + 1}`,
    isMock: true,
    name: provider.name,
    role: 'trainer',
    email: `trainer${i + 1}@example.com`,
    phone: `+198765432${i.toString().padStart(2, '0')}`,
    experience: `${(i % 10) + 1}`,
    consultationFee: `${200 + i * 30}`,
    trainingTypes: ['Obedience Training', 'Agility Training', 'Behavioral Modification', 'Puppy Training', 'Service Dog Training'][i % 5],
    about: `Certified trainer specializing in positive reinforcement and practical pet behavior solutions.`,
    photoURL: provider.gender === 'male'
      ? `https://randomuser.me/api/portraits/men/${30 + i}.jpg`
      : `https://randomuser.me/api/portraits/women/${30 + i}.jpg`,
    rating: (4.2 + (i % 8) * 0.1).toFixed(1),
    reviews: 15 + i * 3,
    location: trainerLocations[i]
  })),

  // Hospitals (15)
  ...hospitalNames.map((name, i) => ({
    id: `mock_hospital_${i + 1}`,
    isMock: true,
    name,
    role: 'hospital',
    email: `hospital${i + 1}@example.com`,
    phone: `+155566677${i.toString().padStart(2, '0')}`,
    experience: `${(i % 20) + 5}`,
    consultationFee: `${500 + i * 100}`,
    emergencyServices: i % 2 === 0,
    bedCapacity: `${20 + i * 10}`,
    about: `24/7 emergency veterinary care with modern facilities and expert teams.`,
    photoURL: hospitalPhotoURLs[i % hospitalPhotoURLs.length],
    rating: (4.1 + (i % 9) * 0.1).toFixed(1),
    reviews: 50 + i * 10,
    location: hospitalLocations[i]
  })),

  // Pet Care (15)
  ...petCareNames.map((name, i) => ({
    id: `mock_care_${i + 1}`,
    isMock: true,
    name,
    role: 'pet_care',
    email: `care${i + 1}@example.com`,
    phone: `+144433322${i.toString().padStart(2, '0')}`,
    experience: `${(i % 8) + 1}`,
    consultationFee: `${150 + i * 20}`,
    about: `Safe, playful pet care and boarding with experienced staff for happy pets while you are away.`,
    photoURL: petCarePhotoURLs[i % petCarePhotoURLs.length],
    rating: (4.3 + (i % 7) * 0.1).toFixed(1),
    reviews: 30 + i * 4,
    location: petCareLocations[i]
  }))
];
