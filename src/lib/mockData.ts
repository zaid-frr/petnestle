export function seedMockData() {
  if (!localStorage.getItem('doctors')) {
    localStorage.setItem('doctors', JSON.stringify([
      { id: 'd1', fullName: 'Dr. Rajesh Kumar', email: 'rajesh@example.com', clinicName: 'Happy Paws Clinic', experience: '10', specialization: 'General Vet', charges: '500', rating: '4.8' },
      { id: 'd2', fullName: 'Dr. Priya Sharma', email: 'priya@example.com', clinicName: 'Mumbai Pet Care', experience: '5', specialization: 'Surgery', charges: '800', rating: '4.9' }
    ]));
  }
  if (!localStorage.getItem('trainers')) {
    localStorage.setItem('trainers', JSON.stringify([
      { id: 't1', fullName: 'Amit Patel', email: 'amit@example.com', trainingType: 'Obedience', experience: '8', charges: '400', availableLocation: 'Cubbon Park, Bengaluru', rating: '4.7' },
      { id: 't2', fullName: 'Sneha Desai', email: 'sneha@example.com', trainingType: 'Agility', experience: '12', charges: '600', availableLocation: 'Andheri West, Mumbai', rating: '4.9' }
    ]));
  }
  if (!localStorage.getItem('hospitals')) {
    localStorage.setItem('hospitals', JSON.stringify([
      { id: 'h1', hospitalName: 'Delhi Central Pet Hospital', email: 'central@example.com', address: 'Connaught Place, New Delhi', emergencyServices: 'Yes', charges: '1000', rating: '4.6' },
      { id: 'h2', hospitalName: 'Apollo Animal Care', email: 'care@example.com', address: 'Jubilee Hills, Hyderabad', emergencyServices: 'Yes', charges: '1200', rating: '4.8' }
    ]));
  }
}
