import PropertyRegistrationForm from '@/components/PropertyRegistrationForm';
import { Metadata } from 'next';

export const metadata = {
  title: 'Property Registration Form - संपत्ति पंजीकरण फॉर्म',
  description: 'Fill out the Property Registration form for Uttar Pradesh property transactions.',
};

const PropertyRegistrationPage = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <PropertyRegistrationForm />
    </div>
  );
};

export default PropertyRegistrationPage;
