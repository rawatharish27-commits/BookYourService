
import React from 'react';
import Seo from "../../components/seo/Seo";

export const ContactPage: React.FC = () => {
  return (
    <div className="bg-white min-h-screen">
      <Seo title="Contact Us" description="Reach out to the BookYourService support or business team." />
      <div className="p-8 max-w-4xl mx-auto py-20">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-8 tracking-tight">Contact Us</h1>
        <div className="bg-gray-50 p-8 rounded-3xl border border-gray-200">
          <p className="text-lg text-gray-700 mb-6">
            Reach us for support or business queries. We usually respond within 24 hours.
          </p>
          <div className="space-y-4 font-bold text-gray-900">
            <p>Email: support@bookyourservice.com</p>
            <p>Phone: +1 (800) 123-4567</p>
            <p>Address: 123 Market St, San Francisco, CA</p>
          </div>
        </div>
      </div>
    </div>
  );
};
