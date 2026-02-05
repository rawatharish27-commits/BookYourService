
import React from 'react';
import Seo from "../../components/seo/Seo";

export const TermsPage: React.FC = () => {
  return (
    <div className="bg-white min-h-screen">
      <Seo title="Terms & Conditions" description="Terms of service for using BookYourService platform." />
      <div className="p-8 max-w-4xl mx-auto py-20">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-8 tracking-tight">Terms & Conditions</h1>
        <div className="prose prose-indigo text-gray-600 space-y-6 leading-relaxed">
          <p className="font-bold text-gray-900">Last Updated: October 2024</p>
          <p>
            These terms govern the use of BookYourService platform. By accessing our services, 
            you agree to be bound by these rules and policies.
          </p>
          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">1. Service Usage</h2>
          <p>BookYourService acts as a marketplace connecting independent professionals with clients. We do not provide the services directly.</p>
          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">2. Payments</h2>
          <p>All payments are handled through our secure gateway and held in escrow until service completion is confirmed.</p>
        </div>
      </div>
    </div>
  );
};
