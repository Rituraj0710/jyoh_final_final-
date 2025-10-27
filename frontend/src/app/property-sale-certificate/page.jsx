import PropertySaleCertificateForm from '@/components/PropertySaleCertificateForm';
import { Metadata } from 'next';

export const metadata = {
  title: 'Property Sale Certificate Generator',
  description: 'Generate property sale certificates with ease.',
};

const PropertySaleCertificatePage = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center py-10 px-4">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">संपत्ति बिक्री प्रमाण पत्र जनरेटर</h1>
      <PropertySaleCertificateForm />
    </div>
  );
};

export default PropertySaleCertificatePage;