import type { Experience } from '$lib/types.js';

export const experiences: Experience[] = [
	{
		id: 'linkedin-sr-swe',
		company: 'LinkedIn',
		title: 'Senior Software Engineer',
		period: 'March 2024 – Present',
		summary: 'Architected alerting system processing 50,000+ QPS using Kafka/Samza/Venice.',
		location: 'Chicago, IL',
		technologies: ['Kafka', 'Samza', 'Venice', 'Oracle', 'MySQL', 'gRPC', 'Rest.li', 'JVM', 'Airflow'],
		achievements: [
			'Built global alerts system processing 50,000+ QPS',
			'Created MySQL migration framework adopted by 12 teams'
		]
	},
	{
		id: 'linkedin-swe',
		company: 'LinkedIn',
		title: 'Software Engineer',
		period: 'Feb 2022 – March 2024',
		summary: 'Scaled LinkedIn Learning\'s VYMBII recommendation service to 3,000 QPS.',
		location: 'San Francisco, CA',
		technologies: ['Spark', 'TikTok', 'ML Pipelines', 'Learning Recommendation Engine'],
		achievements: [
			'Built Spark pipelines processing 50+TB weekly',
			'Scaled VYMBII recommendation service to 3,000 QPS'
		]
	}
];
