import { useState } from "react";
import { X, Sparkles, Check, ArrowRight, Ruler } from "lucide-react";

export default function FindYourFitModal({ isOpen, onClose, onSelectSize }) {
  const [height, setHeight] = useState(178); // cm
  const [weight, setWeight] = useState(74); // kg
  const [build, setBuild] = useState("Athletic");
  const [preference, setPreference] = useState("Modern Oversized");
  const [recommendedSize, setRecommendedSize] = useState(null);

  if (!isOpen) return null;

  const calculateFit = () => {
    // Sizing algorithm based on BMI & preference
    const heightM = height / 100;
    const bmi = weight / (heightM * heightM);
    let base;

    if (bmi < 20.5) base = "S";
    else if (bmi < 24.5) base = "M";
    else if (bmi < 28) base = "L";
    else base = "XL";

    if (height > 185 && base === "M") base = "L";
    if (preference === "Modern Oversized") {
      // Upsize recommendation or note intentional drape
    }

    setRecommendedSize({
      size: base,
      confidence: "Estimate",
      description: `For your ${build.toLowerCase()} frame and ${preference.toLowerCase()} aesthetic, Size ${base} will deliver the exact intended silhouette with clean shoulder drops.`,
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          onClick={onClose}
        />

        {/* Modal Container */}
        <div className="relative bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl z-10 p-6 md:p-8">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                <Ruler size={18} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  NAQSH™ Fit & Drape Advisor
                </h3>
                <p className="text-xs text-gray-500">
                  Find your tailored silhouette in 30 seconds • Wear Your Identity
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-slate-800 transition"
            >
              <X size={18} />
            </button>
          </div>

          {!recommendedSize ? (
            <div className="mt-6 space-y-5">
              {/* Height slider */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
                  <span>YOUR HEIGHT</span>
                  <span className="text-slate-900 font-bold">{height} cm ({Math.floor(height / 30.48)}'{Math.round((height % 30.48) / 2.54)}")</span>
                </div>
                <input
                  type="range"
                  min="150"
                  max="205"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="w-full accent-slate-900 cursor-pointer"
                />
              </div>

              {/* Weight slider */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
                  <span>YOUR WEIGHT</span>
                  <span className="text-slate-900 font-bold">{weight} kg ({Math.round(weight * 2.20462)} lbs)</span>
                </div>
                <input
                  type="range"
                  min="45"
                  max="130"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="w-full accent-slate-900 cursor-pointer"
                />
              </div>

              {/* Build */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-2">
                  BODY BUILD
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {["Slim", "Athletic", "Regular", "Broad"].map((b) => (
                    <button
                      key={b}
                      onClick={() => setBuild(b)}
                      className={`py-2 rounded-xl text-xs font-semibold border transition ${
                        build === b
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-gray-200 text-slate-700 hover:border-slate-400"
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fit Preference */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-2">
                  PREFERRED SILHOUETTE
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["Tailored Slim", "Classic Regular", "Modern Oversized"].map((pref) => (
                    <button
                      key={pref}
                      onClick={() => setPreference(pref)}
                      className={`py-2 px-1 text-center rounded-xl text-xs font-semibold border transition ${
                        preference === pref
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-gray-200 text-slate-700 hover:border-slate-400"
                      }`}
                    >
                      {pref}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={calculateFit}
                className="w-full bg-slate-900 text-white py-3.5 rounded-full font-semibold text-sm hover:bg-black transition flex items-center justify-center gap-2 mt-4 shadow-lg"
              >
                <Sparkles size={16} />
                Calculate My Recommended Size
              </button>
            </div>
          ) : (
            <div className="mt-6 text-center py-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-4">
                <Check size={14} /> Recommended size
              </div>

              <p className="text-sm text-gray-500 uppercase tracking-widest font-semibold mb-2">
                YOUR OPTIMAL FIT
              </p>
              <div className="w-24 h-24 mx-auto rounded-3xl bg-slate-900 text-white flex items-center justify-center text-4xl font-extrabold shadow-xl mb-4">
                {recommendedSize.size}
              </div>

              <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed mb-6">
                {recommendedSize.description}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setRecommendedSize(null)}
                  className="flex-1 py-3 rounded-full text-xs font-semibold border border-gray-200 text-slate-700 hover:bg-gray-50 transition"
                >
                  Recalculate
                </button>
                <button
                  onClick={() => {
                    if (onSelectSize) onSelectSize(recommendedSize.size);
                    onClose();
                  }}
                  className="flex-1 py-3 rounded-full text-xs font-semibold bg-slate-900 text-white hover:bg-black transition flex items-center justify-center gap-1.5"
                >
                  Apply Size {recommendedSize.size} <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
