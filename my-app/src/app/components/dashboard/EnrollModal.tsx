import { FiInfo } from "react-icons/fi";

const BRAND = "rgb(151,0,3)";

export default function EnrollModal({ isOpen, onClose, onConfirm, activityName, loading }: any) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: "rgba(151,0,3,0.1)", color: BRAND }}>
             <FiInfo size={24} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Confirm Enrollment</h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-6">
            You are about to enroll in <strong className="text-gray-900">{activityName}</strong>. 
            By proceeding, you acknowledge the terms, conditions, and commitments required for this activity.
          </p>
          
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="px-5 py-2.5 text-sm font-semibold text-white rounded-xl transition-colors shadow-sm disabled:opacity-60"
              style={{ backgroundColor: BRAND }}
            >
              {loading ? "Enrolling..." : "Yes, Enroll Me"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
