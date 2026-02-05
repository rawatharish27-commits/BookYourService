
import React, { useEffect } from 'react';

interface AdWrapperProps {
  slot: string;
  format?: 'auto' | 'fluid' | 'rectangle';
  className?: string;
}

/**
 * PRODUCTION NOTE: 
 * Ads are strictly prohibited in Auth and Dashboard paths.
 * Use only in Public discovery pages.
 */
export const AdWrapper: React.FC<AdWrapperProps> = ({ slot, format = 'auto', className = "" }) => {
  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.warn("AdSense failed to load", e);
    }
  }, []);

  return (
    <div className={`ad-container my-8 mx-auto flex flex-col items-center ${className}`}>
      <span className="text-[10px] text-gray-300 font-bold uppercase tracking-widest mb-2">Advertisement</span>
      <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-100 w-full min-h-[100px]">
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client={process.env.ADSENSE_ID || "pub-xxxxxxxxxxxxxxxx"}
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
};
