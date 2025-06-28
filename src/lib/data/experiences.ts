import type { Experience } from '$lib/types.js';

export const experiences: Experience[] = [
	{
		id: 'linkedin-swe',
		company: 'LinkedIn',
		title: 'Software Engineer',
		period: '2022 – Present',
		summary: 'Building scalable e-commerce infrastructure powering millions of daily transactions.',
		location: 'San Francisco, CA',
		technologies: ['Go', 'Rust', 'Kubernetes', 'PostgreSQL', 'Redis'],
		achievements: [
			'Reduced API latency by 40% through query optimization',
			'Led migration of legacy services to microservices architecture'
		]
	},
	{
		id: 'previous-company',
		company: 'Tech Startup',
		title: 'Backend Developer',
		period: '2020 – 2022',
		summary: 'Developed distributed systems handling high-throughput data processing workloads.',
		location: 'Remote',
		technologies: ['Java', 'Spring Boot', 'Apache Kafka', 'MongoDB'],
		achievements: [
			'Architected event-driven processing pipeline handling 1M+ events/day',
			'Improved system reliability from 99.5% to 99.9% uptime'
		]
	},
	{
		id: 'internship',
		company: 'Fortune 500 Corp',
		title: 'Software Engineering Intern',
		period: '2019 – 2020',
		summary: 'Built internal tools and automation scripts to improve developer productivity.',
		location: 'Chicago, IL',
		technologies: ['Python', 'Docker', 'Jenkins', 'AWS'],
		achievements: [
			'Created CI/CD pipeline reducing deployment time by 60%',
			'Automated manual processes saving 20 hours/week of developer time'
		]
	}
];
