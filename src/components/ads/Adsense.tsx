import React, { useEffect, useState } from "react";

interface AdsenseProps {
  slot: string;
  format?: "auto" | "rectangle" | "horizontal";
  className?: string;
}

/**
 * PRODUCTION POLICY GUARD:
 * Ads are strictly for public discovery pages only.
 * NEVER use this component in Auth, Dashboard, or Payment routes.
 * CONSENT GUARD: Only loads if user accepted cookies.
 */
export default function Adsense({ slot, format = "auto", className = "" }: AdsenseProps) {
  const [consentGiven, setConsentGiven] = useState<boolean>(false);

  useEffect(() => {
    const consent = localStorage.getItem('bys_consent');
    if (consent === 'accepted') {
      setConsentGiven(true);
      
      const loadAd = () => {
        try {
          // @ts-ignore
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
          console.warn("AdSense failed to push. Possible AdBlocker active.", e);
        }
      };

      if ("requestIdleCallback" in window) {
        // @ts-ignore
        window.requestIdleCallback(loadAd, { timeout: 2000 });
      } else {
        setTimeout(loadAd, 1000);
      }
    }
  }, [slot]);

  if (!consentGiven) {
    return (
      <div className={`my-8 mx-auto flex flex-col items-center opacity-50 ${className}`}>
        <div className="bg-gray-100 rounded-2xl border border-gray-200 w-full min-h-[100px] flex items-center justify-center p-4">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">
            Ad space reserved for supporters
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`ads-container my-8 mx-auto flex flex-col items-center ${className}`}>
      <span className="text-[10px] text-gray-300 font-bold uppercase tracking-widest mb-2 select-none">Advertisement</span>
      <div className="bg-gray-50/50 rounded-2xl overflow-hidden border border-gray-100 w-full min-h-[100px] flex items-center justify-center">
        <ins
          className="adsbygoogle"
          style={{ display: "block", width: "100%" }}
          data-ad-client="ca-pub-XXXXXXXXXXXX"
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
}