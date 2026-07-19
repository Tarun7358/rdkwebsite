import React, { useEffect, useState, useRef } from 'react';

const statsData = [
  { target: 500, label: 'Projects completed', suffix: '+' },
  { target: 200, label: 'Happy clients', suffix: '+' },
  { target: 42, label: 'Active projects', suffix: '' },
  { target: 8, label: 'Years of experience', suffix: '' },
  { target: 35, label: 'Countries served', suffix: '+' }
];

export const Stats: React.FC = () => {
  const [counts, setCounts] = useState(statsData.map(() => 0));
  const sectionRef = useRef<HTMLDivElement>(null);
  const animatedRef = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !animatedRef.current) {
          animatedRef.current = true;
          
          statsData.forEach((stat, index) => {
            let current = 0;
            const step = Math.ceil(stat.target / 60);
            const interval = setInterval(() => {
              current = Math.min(current + step, stat.target);
              setCounts((prev) => {
                const next = [...prev];
                next[index] = current;
                return next;
              });
              if (current >= stat.target) {
                clearInterval(interval);
              }
            }, 30);
          });
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <section className="stats-section" ref={sectionRef}>
      <div className="section-inner">
        <div className="stats-grid">
          {statsData.map((stat, idx) => (
            <div key={idx} className="stat-item visible">
              <div className="stat-num">
                {counts[idx]}
                {stat.suffix}
              </div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
