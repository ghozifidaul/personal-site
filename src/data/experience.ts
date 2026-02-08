import type { Experience } from '../types/experience';

export const experiences: Experience[] = [
	{
		title: 'Senior Software Engineer',
		company: 'Tech Company Inc.',
		period: '2022 - Present',
		description:
			'Leading a team of 5 engineers building scalable microservices architecture. Improved system performance by 40% and implemented CI/CD pipelines for automated deployments.',
		tags: ['TypeScript', 'Node.js', 'AWS', 'Kubernetes'],
	},
	{
		title: 'Software Engineer',
		company: 'Digital Solutions Ltd.',
		period: '2020 - 2022',
		description:
			'Developed full-stack web applications serving 100k+ users. Built real-time features using WebSockets and implemented responsive designs with React and Tailwind CSS.',
		tags: ['React', 'Python', 'PostgreSQL', 'Docker'],
	},
	{
		title: 'Junior Developer',
		company: 'StartUp Corp',
		period: '2018 - 2020',
		description:
			'Contributed to various client projects, learning modern web development practices. Built RESTful APIs and integrated third-party services. Participated in code reviews and agile development processes.',
		tags: ['JavaScript', 'Vue.js', 'MongoDB', 'Express'],
	},
];
