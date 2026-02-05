
import React from 'react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 min-h-screen">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-8">Privacy Policy</h1>
      
      <div className="prose prose-lg text-gray-700">
        <p className="mb-6">Effective Date: January 1, 2024</p>
        
        <h3 className="text-2xl font-bold text-gray-900 mb-4">1. Information We Collect</h3>
        <p className="mb-6">
            We collect information you provide directly to us, such as when you create or modify your account, request on-demand services, contact customer support, or otherwise communicate with us. This information may include: name, email, phone number, postal address, profile picture, payment method, items requested (for delivery services), delivery notes, and other information you choose to provide.
        </p>

        <h3 className="text-2xl font-bold text-gray-900 mb-4">2. How We Use Your Information</h3>
        <p className="mb-6">
            We use the information we collect to provide, maintain, and improve our services, such as to:
            <ul className="list-disc pl-6 mt-2">
                <li>Facilitate payments, send receipts and provide customer support.</li>
                <li>Verify identity and prevent fraud.</li>
                <li>Send updates, security alerts, and administrative messages.</li>
            </ul>
        </p>

        <h3 className="text-2xl font-bold text-gray-900 mb-4">3. Sharing of Information</h3>
        <p className="mb-6">
            We may share the information we collect about you as described in this Statement or as described at the time of collection or sharing, including with Service Providers to enable them to provide the services you request.
        </p>

        <h3 className="text-2xl font-bold text-gray-900 mb-4">4. Security</h3>
        <p className="mb-6">
            BookYourService takes reasonable measures to help protect your information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction.
        </p>
      </div>
    </div>
  );
};
