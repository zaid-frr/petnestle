export const mockProviders = [
  // Doctors (15)
  ...Array.from({ length: 15 }).map((_, i) => ({
    id: `mock_vet_${i + 1}`,
    name: `Dr. Vet ${i + 1}`,
    role: "doctor",
    email: `vet${i + 1}@example.com`,
    phone: `+123456789${i.toString().padStart(2, '0')}`,
    specialization: ["General Veterinary Medicine", "Veterinary Surgery", "Veterinary Dentistry", "Veterinary Dermatology", "Emergency & Critical Care"][i % 5],
    experience: `${(i % 15) + 2}`,
    consultationFee: `${300 + (i * 50)}`,
    about: `Experienced veterinarian dedicated to providing compassionate care for all pets. Specializing in ${["General Veterinary Medicine", "Veterinary Surgery", "Veterinary Dentistry", "Veterinary Dermatology", "Emergency & Critical Care"][i % 5]}.`,
    photoURL: `https://images.unsplash.com/photo-${1559839734 + i}-2b71ea197ec2?auto=format&fit=crop&q=80&w=300&h=300`,
    rating: (4.0 + (i % 10) * 0.1).toFixed(1),
    reviews: 20 + i * 5,
    location: `City Animal Clinic ${i + 1}`
  })),
  
  // Trainers (15)
  ...Array.from({ length: 15 }).map((_, i) => ({
    id: `mock_trainer_${i + 1}`,
    name: `Trainer ${i + 1}`,
    role: "trainer",
    email: `trainer${i + 1}@example.com`,
    phone: `+198765432${i.toString().padStart(2, '0')}`,
    experience: `${(i % 10) + 1}`,
    consultationFee: `${200 + (i * 30)}`,
    trainingTypes: ["Obedience Training", "Agility Training", "Behavioral Modification", "Puppy Training", "Service Dog Training"][i % 5],
    about: `Certified dog trainer specializing in positive reinforcement techniques.`,
    photoURL: `https://images.unsplash.com/photo-${1537151608804 + i}-ea2f1ea290d0?auto=format&fit=crop&q=80&w=300&h=300`,
    rating: (4.2 + (i % 8) * 0.1).toFixed(1),
    reviews: 15 + i * 3,
    location: `Paws & Play Center ${i + 1}`
  })),

  // Hospitals (15)
  ...Array.from({ length: 15 }).map((_, i) => ({
    id: `mock_hospital_${i + 1}`,
    name: `Pet Hospital ${i + 1}`,
    role: "hospital",
    email: `hospital${i + 1}@example.com`,
    phone: `+155566677${i.toString().padStart(2, '0')}`,
    experience: `${(i % 20) + 5}`,
    consultationFee: `${500 + (i * 100)}`,
    emergencyServices: i % 2 === 0,
    bedCapacity: `${20 + i * 10}`,
    about: `24/7 emergency care and comprehensive veterinary services. State of the art facilities.`,
    photoURL: `https://images.unsplash.com/photo-${1583337130417 + i}-3346a1be7dee?auto=format&fit=crop&q=80&w=300&h=300`,
    rating: (4.1 + (i % 9) * 0.1).toFixed(1),
    reviews: 50 + i * 10,
    location: `Westside Avenue ${i + 1}`
  })),

  // Pet Care (15)
  ...Array.from({ length: 15 }).map((_, i) => ({
    id: `mock_care_${i + 1}`,
    name: `Pet Care Services ${i + 1}`,
    role: "pet_care",
    email: `care${i + 1}@example.com`,
    phone: `+144433322${i.toString().padStart(2, '0')}`,
    experience: `${(i % 8) + 1}`,
    consultationFee: `${150 + (i * 20)}`,
    about: `Safe and fun environment for your pets while you are away. Daycare and boarding.`,
    photoURL: `https://images.unsplash.com/photo-${1601758228041 + i}-f3b2795255f1?auto=format&fit=crop&q=80&w=300&h=300`,
    rating: (4.3 + (i % 7) * 0.1).toFixed(1),
    reviews: 30 + i * 4,
    location: `North Suburbs ${i + 1}`
  }))
];
