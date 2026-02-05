import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getBookingById, submitReview } from "../../services/api";
import { ArrowLeft, Loader2, Star, ThumbsUp, ShieldCheck } from "lucide-react";
import { BookingStatus } from "../../types";

export const ReviewPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [serviceTitle, setServiceTitle] = useState("");

  useEffect(() => {
    if (!bookingId) return;
    getBookingById(bookingId).then((data) => {
        // PHASE 6 GUARD: Payout must be processed or satisfaction confirmed
        const eligible = [BookingStatus.CLOSED, BookingStatus.SETTLED, BookingStatus.COMPLETED].includes(data.status);
        if (!eligible) {
            alert("Please confirm job completion before writing a review.");
            navigate(`/bookings/${bookingId}`);
            return;
        }
        setServiceTitle(data.service.title);
        setFetching(false);
    }).catch(() => {
        navigate('/client/bookings');
    });
  }, [bookingId, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingId) return;

    setLoading(true);
    try {
      await submitReview({
        bookingId: bookingId,
        rating,
        comment
      });
      navigate(`/bookings/${bookingId}`); 
    } catch (error: any) {
      alert("Failed to submit review: " + (error.response?.data?.message || error.message));
      setLoading(false);
    }
  };

  if (fetching) return (
      <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="animate-spin text-indigo-600 w-8 h-8"/>
      </div>
  );

  return (
    <div className="max-w-lg mx-auto mt-12 mb-20 px-4">
      <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-gray-900 mb-8 text-sm group font-bold">
        <ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" /> Back
      </button>

      <div className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 p-10">
        <div className="text-center mb-8">
            <div className="w-20 h-20 bg-yellow-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Star className="w-10 h-10 text-yellow-500 fill-current" />
            </div>
            <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Share Experience</h1>
            <p className="text-gray-500 font-medium">How was the <span className="font-black text-indigo-600">{serviceTitle}</span> service?</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Star Rating Selection */}
            <div className="flex justify-center gap-4">
                {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`text-5xl transition-all hover:scale-125 focus:outline-none ${
                    star <= rating ? "text-yellow-400 drop-shadow-md" : "text-gray-100"
                    }`}
                >
                    ★
                </button>
                ))}
            </div>
            
            <div className="text-center">
                <span className="bg-gray-50 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-400 border border-gray-100">
                    {rating === 5 ? "Top Notch 😍" : rating === 4 ? "Very Good 🙂" : rating === 3 ? "Standard 😐" : rating === 2 ? "Below Average 😞" : "Terrible 😡"}
                </span>
            </div>

            {/* Comment Area */}
            <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Professional Feedback</label>
                <textarea
                className="w-full px-6 py-5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none font-bold text-gray-900 shadow-inner"
                rows={4}
                placeholder="Details help our community trust experts..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                />
            </div>

            <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100 flex gap-3 items-start">
                <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0" />
                <p className="text-[10px] font-bold text-indigo-800 leading-relaxed uppercase tracking-tighter">
                    Your rating directly impacts this professional's visibility and trust score in the marketplace.
                </p>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-gray-900 hover:bg-indigo-600 text-white font-black py-5 rounded-2xl transition-all shadow-xl active:scale-95 flex justify-center items-center gap-2"
            >
                {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Publish Feedback"}
            </button>
        </form>
      </div>
    </div>
  );
};