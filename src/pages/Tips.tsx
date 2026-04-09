import { CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";

export default function Tips() {
  const tips = [
    {
      category: "Nutrition",
      items: [
        "Provide fresh water daily and clean the bowl regularly.",
        "Feed high-quality pet food appropriate for their age and breed.",
        "Avoid feeding table scraps, especially toxic foods like chocolate or onions.",
        "Monitor portion sizes to prevent obesity."
      ]
    },
    {
      category: "Exercise & Play",
      items: [
        "Ensure daily physical activity to keep them fit and happy.",
        "Provide mental stimulation with puzzle toys and training.",
        "Dedicate time for interactive play every day.",
        "Adjust exercise intensity based on weather conditions."
      ]
    },
    {
      category: "Health & Hygiene",
      items: [
        "Schedule annual veterinary checkups and vaccinations.",
        "Brush their teeth regularly with pet-safe toothpaste.",
        "Keep up with flea, tick, and heartworm prevention.",
        "Groom their coat to prevent matting and check for skin issues."
      ]
    },
    {
      category: "Safety",
      items: [
        "Ensure your pet has a collar with an ID tag and is microchipped.",
        "Pet-proof your home by hiding toxic plants and chemicals.",
        "Keep them on a leash during walks in public areas.",
        "Provide a safe, comfortable space for them to rest."
      ]
    }
  ];

  return (
    <div className="py-16 bg-white dark:bg-slate-900 min-h-screen transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4">Pet Care Tips</h1>
          <p className="text-xl text-slate-600 dark:text-slate-400">
            Essential guidelines to keep your pets healthy, happy, and safe.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {tips.map((section, idx) => (
            <motion.div 
              key={section.category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-8 border border-slate-100 dark:border-slate-700 hover:shadow-lg transition-shadow"
            >
              <h2 className="text-2xl font-bold text-teal-700 dark:text-teal-400 mb-6 pb-4 border-b border-teal-100 dark:border-teal-900/50">
                {section.category}
              </h2>
              <ul className="space-y-4">
                {section.items.map((tip, index) => (
                  <motion.li 
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: (idx * 0.1) + (index * 0.1) }}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle2 className="h-6 w-6 text-teal-500 dark:text-teal-400 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700 dark:text-slate-300 leading-relaxed">{tip}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
