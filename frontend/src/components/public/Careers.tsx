import React from 'react';
import { useAppStore } from '../../store/appStore';
import type { CareerItem } from '../../types';

const defaultCareers: CareerItem[] = [
  {
    id: 1,
    title: 'Senior Frontend Developer',
    type: 'Full-time',
    dept: 'Engineering · Remote',
    tags: ['React', 'Next.js', 'TypeScript', '3+ years'],
    salary: '$60k – $90k/yr'
  },
  {
    id: 2,
    title: 'Backend Developer (NestJS)',
    type: 'Full-time',
    dept: 'Engineering · Remote',
    tags: ['NestJS', 'PostgreSQL', 'Node.js', '2+ years'],
    salary: '$55k – $85k/yr'
  },
  {
    id: 3,
    title: 'Flutter Developer',
    type: 'Full-time',
    dept: 'Mobile · Remote',
    tags: ['Flutter', 'Dart', 'Firebase', '2+ years'],
    salary: '$50k – $80k/yr'
  },
  {
    id: 4,
    title: 'AI/ML Engineer',
    type: 'Full-time',
    dept: 'AI · Remote',
    tags: ['Python', 'LangChain', 'OpenAI', '3+ years'],
    salary: '$70k – $110k/yr'
  },
  {
    id: 5,
    title: 'Discord Bot Developer',
    type: 'Freelance',
    dept: 'Bots · Remote',
    tags: ['Discord.js', 'Python', '1+ years'],
    salary: '$25 – $50/hr'
  },
  {
    id: 6,
    title: 'UI/UX Designer',
    type: 'Full-time',
    dept: 'Design · Remote',
    tags: ['Figma', 'Framer', 'Design systems', '3+ years'],
    salary: '$55k – $80k/yr'
  }
];

export const Careers: React.FC = () => {
  const storeCareers = useAppStore((s) => s.careers);
  const careers = storeCareers && storeCareers.length > 0 ? storeCareers : defaultCareers;

  return (
    <section id="careers">
      <div className="section-inner">
        <div className="section-label">Join the team</div>
        <h2 className="section-title">Open positions at RDK</h2>
        <p className="section-sub">We're always looking for talented people. All RDK roles are remote-first.</p>
        <div className="careers-grid">
          {careers.map((job) => (
            <div key={job.id} className="job-card visible">
              <div className="job-top">
                <div className="job-title">{job.title}</div>
                <span className="job-type">{job.type}</span>
              </div>
              <div className="job-dept">{job.dept}</div>
              <div className="job-tags">
                {job.tags.map((t, idx) => (
                  <span key={idx} className="tag">
                    {t}
                  </span>
                ))}
              </div>
              <div className="job-footer">
                <span className="salary">{job.salary}</span>
                <a href="#contact" className={`btn ${job.type === 'Freelance' ? 'btn-outline' : 'btn-primary'}`}>
                  {job.type === 'Freelance' ? 'Apply' : 'Apply now'}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
