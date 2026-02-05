import React from 'react';
import Seo from "../../components/seo/Seo";
import { FileText, Download, Printer } from 'lucide-react';

export default function Invoice() {
  return (
    <>
      <Seo title="Invoice" description="Download your invoice" />
      <div className="max-w-4xl mx-auto py-20 px-4 text-center">
        <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-8 text-gray-400">
            <FileText className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Invoice Processing</h1>
        <p className="text-gray-500 max-w-md mx-auto leading-relaxed font-medium mb-10">
            Digital tax invoices are generated automatically after a service professional marks the job as completed. 
            You can download them in PDF format for your records.
        </p>
        
        <div className="flex justify-center gap-4">
            <button disabled className="flex items-center gap-2 bg-gray-100 text-gray-400 px-6 py-3 rounded-xl text-sm font-black cursor-not-allowed">
                <Download className="w-4 h-4" /> Download PDF
            </button>
            <button disabled className="flex items-center gap-2 bg-gray-100 text-gray-400 px-6 py-3 rounded-xl text-sm font-black cursor-not-allowed">
                <Printer className="w-4 h-4" /> Print
            </button>
        </div>
      </div>
    </>
  );
}