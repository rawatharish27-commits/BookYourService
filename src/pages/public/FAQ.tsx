
import React from 'react';
import Seo from "../../components/seo/Seo";

export const FAQPage: React.FC = () => {
  return (
    <div className="bg-white min-h-screen">
      <Seo title="FAQ" description="Frequently asked questions about BookYourService." />
      <div className="p-8 max-w-4xl mx-auto py-20">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-8 tracking-tight">FAQs</h1>
        <div className="space-y-8">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">How do I book a service?</h3>
            <p className="text-gray-600">Simply browse the categories, select a service, choose your slot, and confirm.</p>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Are providers verified?</h3>
            <p className="text-gray-600">Yes, every provider goes through identity verification and a background check.</p>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">What is the cancellation policy?</h3>
            <p className="text-gray-600">You can cancel up to 24 hours before the job for a full refund.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
