import React, { useEffect, useState, useRef } from 'react';
import { useInView } from 'framer-motion';
import { COLORS, getIcon } from '../utils/icons';
import { useLanguage } from '../contexts/LanguageContext';
import { useCountry } from '../contexts/CountryContext';
import { useStats, useSiteSettings } from '../hooks/useContent';

const Counter = ({ from, to, duration, suffix }: { from: number; to: number; duration: number; suffix: string }) => {
  const [count, setCount] = useState(from);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      let startTime: number;
      const step = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
        setCount(Math.floor(progress * (to - from) + from));
        if (progress < 1) {
          window.requestAnimationFrame(step);
        }
      };
      window.requestAnimationFrame(step);
    }
  }, [isInView, from, to, duration]);

  return (
    <span ref={ref} className="text-4xl md:text-5xl font-bold block mb-2 text-[#C8A762]">
      {count}{suffix}
    </span>
  );
};

const Stats: React.FC = () => {
  const { t, language } = useLanguage();
  const { selectedCountry } = useCountry();
  const { stats, loading } = useStats(selectedCountry?.id);
  const { get } = useSiteSettings(selectedCountry?.id);

  if (loading || stats.length === 0) return null;

  return (
    <section className="py-20 bg-white dark:bg-gray-900 transition-colors duration-300">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-2 text-[#0B3D2E] dark:text-white transition-colors">
            {get('stats_title', language)}
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.id} className="text-center group">
              <div className="flex justify-center mb-4 transition transform group-hover:scale-110">
                {getIcon(stat.icon, "w-8 h-8 text-gray-400 dark:text-gray-600 group-hover:text-[#C8A762] transition-colors")}
              </div>
              <Counter from={0} to={stat.value} duration={2} suffix={stat.suffix} />
              <p className="text-gray-600 dark:text-gray-400 font-medium transition-colors">
                {t(stat.label_ar, stat.label_en)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;