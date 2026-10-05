// server/ai/taxonomy.js
/**
 * Skill Setu AI Knowledge Base & Taxonomy
 *
 * Contains role benchmarks, skill normalizations, category mappings,
 * and a curated local demo opportunities dataset for matching.
 *
 * NOTE: The opportunities dataset is strictly local/mock/demo data
 * for development and demonstration purposes.
 */

// Skill Normalization Mapping (handles common casing, aliases, and abbreviations)
const SKILL_ALIASES = {
  'js': 'JavaScript',
  'javascript': 'JavaScript',
  'ts': 'TypeScript',
  'typescript': 'TypeScript',
  'py': 'Python',
  'python': 'Python',
  'c++': 'C++',
  'cpp': 'C++',
  'c#': 'C#',
  'csharp': 'C#',
  'golang': 'Go',
  'go': 'Go',
  'java': 'Java',
  'c': 'C',
  'html': 'HTML',
  'html5': 'HTML',
  'css': 'CSS',
  'css3': 'CSS',
  'tailwind': 'Tailwind CSS',
  'tailwindcss': 'Tailwind CSS',
  'react': 'React',
  'reactjs': 'React',
  'react.js': 'React',
  'next': 'Next.js',
  'nextjs': 'Next.js',
  'next.js': 'Next.js',
  'vue': 'Vue.js',
  'vuejs': 'Vue.js',
  'angular': 'Angular',
  'node': 'Node.js',
  'nodejs': 'Node.js',
  'node.js': 'Node.js',
  'express': 'Express.js',
  'expressjs': 'Express.js',
  'django': 'Django',
  'fastapi': 'FastAPI',
  'flask': 'Flask',
  'spring': 'Spring Boot',
  'springboot': 'Spring Boot',
  'sql': 'SQL',
  'mysql': 'MySQL',
  'postgres': 'PostgreSQL',
  'postgresql': 'PostgreSQL',
  'mongo': 'MongoDB',
  'mongodb': 'MongoDB',
  'redis': 'Redis',
  'rest': 'REST APIs',
  'restful': 'REST APIs',
  'rest api': 'REST APIs',
  'rest apis': 'REST APIs',
  'graphql': 'GraphQL',
  'git': 'Git',
  'github': 'Git/GitHub',
  'docker': 'Docker',
  'k8s': 'Kubernetes',
  'kubernetes': 'Kubernetes',
  'aws': 'AWS',
  'azure': 'Azure',
  'gcp': 'GCP',
  'linux': 'Linux',
  'ci/cd': 'CI/CD',
  'cicd': 'CI/CD',
  'pandas': 'Pandas',
  'numpy': 'NumPy',
  'scikit-learn': 'Scikit-learn',
  'sklearn': 'Scikit-learn',
  'tensorflow': 'TensorFlow',
  'tf': 'TensorFlow',
  'pytorch': 'PyTorch',
  'machine learning': 'Machine Learning',
  'ml': 'Machine Learning',
  'deep learning': 'Deep Learning',
  'dl': 'Deep Learning',
  'nlp': 'NLP',
  'cv': 'Computer Vision',
  'computer vision': 'Computer Vision',
  'power bi': 'Power BI',
  'powerbi': 'Power BI',
  'tableau': 'Tableau',
  'figma': 'Figma',
  'ui/ux': 'UI/UX Design',
  'ux': 'UI/UX Design',
  'ui': 'UI Design',
  'wireframing': 'Wireframing',
  'prototyping': 'Prototyping',
  'cybersecurity': 'Cybersecurity',
  'security': 'Information Security',
  'owasp': 'OWASP',
  'penetration testing': 'Penetration Testing',
  'ethical hacking': 'Ethical Hacking',
  'networking': 'Computer Networking',
  'communication': 'Communication',
  'problem solving': 'Problem Solving',
  'teamwork': 'Team Collaboration'
};

function normalizeSkillName(name) {
  if (!name || typeof name !== 'string') return '';
  const trimmed = name.trim();
  const lower = trimmed.toLowerCase();
  return SKILL_ALIASES[lower] || trimmed;
}

// Skill Categories
const SKILL_CATEGORIES = {
  LANGUAGES: ['JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C', 'C#', 'Go', 'PHP', 'Ruby', 'Rust', 'Kotlin', 'Swift'],
  FRONTEND: ['HTML', 'CSS', 'Tailwind CSS', 'React', 'Next.js', 'Vue.js', 'Angular', 'Redux'],
  BACKEND: ['Node.js', 'Express.js', 'Django', 'FastAPI', 'Flask', 'Spring Boot', 'REST APIs', 'GraphQL'],
  DATABASES: ['SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis'],
  DATA_AI: ['Python', 'Pandas', 'NumPy', 'Scikit-learn', 'TensorFlow', 'PyTorch', 'Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision', 'Power BI', 'Tableau'],
  CLOUD_DEVOPS: ['AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Linux', 'CI/CD', 'Git'],
  SECURITY: ['Cybersecurity', 'Information Security', 'OWASP', 'Penetration Testing', 'Ethical Hacking', 'Computer Networking'],
  DESIGN: ['Figma', 'UI/UX Design', 'UI Design', 'Wireframing', 'Prototyping', 'User Research'],
  SOFT_SKILLS: ['Communication', 'Problem Solving', 'Team Collaboration', 'Time Management', 'Critical Thinking', 'Adaptability', 'Presentation']
};

// Comprehensive Role Definitions & Benchmarks
const CAREER_ROLES = {
  'Software Developer': {
    name: 'Software Developer',
    domain: 'Software Engineering',
    description: 'Builds, tests, and maintains applications with strong algorithms, data structures, and clean coding practices.',
    coreSkills: ['C++', 'Java', 'Python', 'Data Structures & Algorithms', 'Git', 'SQL', 'Object-Oriented Programming'],
    advancedSkills: ['Design Patterns', 'System Design', 'Unit Testing', 'CI/CD', 'Docker'],
    softSkills: ['Problem Solving', 'Communication', 'Code Review', 'Team Collaboration'],
    entrySalaryRange: '6–14 LPA',
    recommendedProjects: [
      'Inventory or Management System with relational database',
      'CLI tool or backend utility implementing core data structures',
      'Multi-threaded or networked application'
    ]
  },
  'Full Stack Developer': {
    name: 'Full Stack Developer',
    domain: 'Web & Product Development',
    description: 'Architects and builds complete client-server web applications from database schema to responsive interfaces.',
    coreSkills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'HTML', 'CSS', 'REST APIs', 'SQL', 'Git'],
    advancedSkills: ['Next.js', 'MongoDB', 'PostgreSQL', 'Docker', 'Redis', 'CI/CD', 'Tailwind CSS'],
    softSkills: ['Problem Solving', 'Team Collaboration', 'Adaptability', 'Communication'],
    entrySalaryRange: '8–16 LPA',
    recommendedProjects: [
      'Full-stack e-commerce or collaboration web app with authentication and payments',
      'Social or community dashboard with real-time updates and REST APIs',
      'Content management portal with role-based access control'
    ]
  },
  'Frontend Developer': {
    name: 'Frontend Developer',
    domain: 'Web & UI Engineering',
    description: 'Crafts performant, accessible, and responsive user interfaces with modern JavaScript frameworks.',
    coreSkills: ['HTML', 'CSS', 'JavaScript', 'TypeScript', 'React', 'Tailwind CSS', 'Git', 'REST APIs'],
    advancedSkills: ['Next.js', 'Redux', 'Performance Optimization', 'Web Accessibility (a11y)', 'Testing (Jest/Cypress)'],
    softSkills: ['Attention to Detail', 'Design Sensibility', 'Communication', 'Team Collaboration'],
    entrySalaryRange: '6–13 LPA',
    recommendedProjects: [
      'Interactive analytics dashboard consuming live REST APIs',
      'Responsive design system / component library documentation',
      'Progressive Web App (PWA) with offline capabilities'
    ]
  },
  'Backend Developer': {
    name: 'Backend Developer',
    domain: 'Server & Systems Engineering',
    description: 'Designs reliable APIs, handles business logic, database queries, and optimizes throughput and security.',
    coreSkills: ['Node.js', 'Python', 'Java', 'Express.js', 'SQL', 'PostgreSQL', 'REST APIs', 'Git'],
    advancedSkills: ['Redis', 'Docker', 'MongoDB', 'System Design', 'Microservices', 'GraphQL', 'Authentication & JWT'],
    softSkills: ['Analytical Thinking', 'Problem Solving', 'Systematic Debugging', 'Communication'],
    entrySalaryRange: '7–15 LPA',
    recommendedProjects: [
      'High-throughput REST API with caching, rate limiting, and JWT authentication',
      'Distributed task worker queue consuming background jobs with Redis',
      'Database migration & analytics marts service with query optimization'
    ]
  },
  'Data Analyst': {
    name: 'Data Analyst',
    domain: 'Data & Business Intelligence',
    description: 'Extracts, wrangles, and models business data to produce actionable insights and executive dashboards.',
    coreSkills: ['SQL', 'Python', 'Pandas', 'Excel', 'Data Visualization', 'Power BI', 'Tableau', 'Statistics'],
    advancedSkills: ['NumPy', 'Data Modeling', 'A/B Testing', 'ETL Pipelines', 'Data Storytelling'],
    softSkills: ['Data Storytelling', 'Critical Thinking', 'Business Acumen', 'Communication'],
    entrySalaryRange: '5–11 LPA',
    recommendedProjects: [
      'Exploratory data analysis (EDA) of consumer or financial trends with Jupyter and Pandas',
      'Interactive executive BI dashboard in Power BI or Tableau with automated refreshing',
      'Customer churn or cohort analysis with predictive scoring'
    ]
  },
  'Data Scientist': {
    name: 'Data Scientist',
    domain: 'Machine Learning & Statistical Modeling',
    description: 'Formulates hypotheses, builds predictive models, and extracts deep patterns from complex datasets.',
    coreSkills: ['Python', 'SQL', 'Pandas', 'NumPy', 'Statistics', 'Scikit-learn', 'Machine Learning', 'Data Visualization'],
    advancedSkills: ['Deep Learning', 'PyTorch', 'TensorFlow', 'Model Evaluation', 'Feature Engineering', 'MLflow'],
    softSkills: ['Scientific Rigor', 'Problem Formulation', 'Presentation', 'Communication'],
    entrySalaryRange: '9–18 LPA',
    recommendedProjects: [
      'End-to-end predictive modeling pipeline with cross-validation and feature selection',
      'Natural Language Processing (NLP) sentiment analyzer or summarizer',
      'Time-series forecasting model for demand or pricing'
    ]
  },
  'AI/ML Engineer': {
    name: 'AI/ML Engineer',
    domain: 'Artificial Intelligence & Production ML',
    description: 'Deploys and scales machine learning and deep learning models into production systems and APIs.',
    coreSkills: ['Python', 'Machine Learning', 'Deep Learning', 'PyTorch', 'TensorFlow', 'Docker', 'REST APIs', 'Git'],
    advancedSkills: ['Model Serving (FastAPI/Triton)', 'LLM Fine-tuning', 'MLOps', 'Kubernetes', 'Cloud Deployment'],
    softSkills: ['Problem Solving', 'Research Synthesis', 'Engineering Discipline', 'Collaboration'],
    entrySalaryRange: '10–22 LPA',
    recommendedProjects: [
      'Production ML API built with FastAPI, containerized with Docker, and serving predictions',
      'Fine-tuned LLM or RAG (Retrieval-Augmented Generation) pipeline over custom documentation',
      'Computer vision detection or classification pipeline deployed with inference optimization'
    ]
  },
  'Cybersecurity Engineer': {
    name: 'Cybersecurity Engineer',
    domain: 'Security & Infrastructure Protection',
    description: 'Defends systems, audits vulnerabilities, implements encryption, and enforces security policies.',
    coreSkills: ['Computer Networking', 'Linux', 'Information Security', 'Python', 'OWASP', 'Vulnerability Assessment'],
    advancedSkills: ['Penetration Testing', 'SIEM Tools', 'Cryptography', 'Cloud Security', 'Network Traffic Analysis (Wireshark)'],
    softSkills: ['Security Mindset', 'Attention to Detail', 'Ethical Judgment', 'Incident Communication'],
    entrySalaryRange: '7–16 LPA',
    recommendedProjects: [
      'Automated web application vulnerability scanner targeting OWASP Top 10 vulnerabilities',
      'Network packet sniffer and intrusion detection alert script in Python',
      'Hardened cloud IAM policy architecture and secret management proof-of-concept'
    ]
  },
  'Cloud Engineer': {
    name: 'Cloud Engineer',
    domain: 'Cloud Infrastructure & Architecture',
    description: 'Designs, provisions, and automates scalable cloud infrastructure on AWS, Azure, or GCP.',
    coreSkills: ['AWS', 'Linux', 'Docker', 'Computer Networking', 'Git', 'Python', 'Cloud Computing Concepts'],
    advancedSkills: ['Terraform / Infrastructure as Code', 'Kubernetes', 'Azure / GCP', 'CI/CD', 'Serverless Architecture'],
    softSkills: ['Systems Thinking', 'Cost-Aware Architecture', 'Collaboration', 'Problem Solving'],
    entrySalaryRange: '7–16 LPA',
    recommendedProjects: [
      'Multi-tier web application provisioned on AWS using Infrastructure as Code (Terraform)',
      'Automated CI/CD pipeline deploying containerized microservices to cloud compute',
      'Serverless event-driven architecture using Lambda, S3, and DynamoDB'
    ]
  },
  'DevOps Engineer': {
    name: 'DevOps Engineer',
    domain: 'Platform & Delivery Engineering',
    description: 'Bridges software development and operations through automation, CI/CD, and platform observability.',
    coreSkills: ['Linux', 'Docker', 'Git', 'CI/CD', 'Python', 'Computer Networking', 'Shell Scripting'],
    advancedSkills: ['Kubernetes', 'Terraform', 'Prometheus & Grafana', 'AWS', 'Ansible', 'Site Reliability Engineering (SRE)'],
    softSkills: ['Automation Mindset', 'Incident Management', 'Cross-team Communication', 'Problem Solving'],
    entrySalaryRange: '8–17 LPA',
    recommendedProjects: [
      'Complete GitOps continuous integration & delivery pipeline with automated testing and rollback',
      'Observability dashboard tracking system metrics, latency, and error rates using Prometheus and Grafana',
      'Containerized high-availability cluster setup on Kubernetes with automated health checks'
    ]
  },
  'UI/UX Designer': {
    name: 'UI/UX Designer',
    domain: 'User Experience & Product Design',
    description: 'Researches user needs, designs intuitive interfaces, and creates high-fidelity design systems.',
    coreSkills: ['Figma', 'UI/UX Design', 'Wireframing', 'Prototyping', 'User Research', 'Design Systems'],
    advancedSkills: ['Usability Testing', 'Information Architecture', 'Interaction Design', 'HTML/CSS Basics', 'Design Tokens'],
    softSkills: ['Empathy', 'Visual Communication', 'User Advocacy', 'Stakeholder Presentation'],
    entrySalaryRange: '5–12 LPA',
    recommendedProjects: [
      'Comprehensive mobile app case study: problem framing, user interviews, wireframes, and interactive prototype',
      'Scalable design system in Figma with tokens, typography, and reusable component library',
      'Redesign of an existing confusing public portal backed by usability audit and user testing'
    ]
  }
};

// Local Demo / Mock Opportunities Dataset (strictly for offline matching and demonstration)
const LOCAL_DEMO_OPPORTUNITIES = [
  {
    id: 'demo-opp-001',
    company: 'Nexus Cloud Technologies (Demo)',
    role: 'Junior Full Stack Developer',
    category: 'Demo Opportunity',
    requiredSkills: ['JavaScript', 'React', 'Node.js', 'SQL', 'Git'],
    preferredSkills: ['TypeScript', 'Tailwind CSS', 'Docker'],
    experienceRequired: '0–1 years / Fresher',
    location: 'Bengaluru (Demo) / Hybrid',
    type: 'Full-time Entry Level',
    description: 'Looking for a curious junior engineer to build responsive dashboards and RESTful backend microservices.',
    tier: 'Product Startup'
  },
  {
    id: 'demo-opp-002',
    company: 'Prism Data Analytics (Demo)',
    role: 'Associate Data Analyst',
    category: 'Demo Opportunity',
    requiredSkills: ['SQL', 'Python', 'Pandas', 'Data Visualization', 'Power BI'],
    preferredSkills: ['NumPy', 'Tableau', 'Statistics'],
    experienceRequired: '0–1 years / Fresher',
    location: 'Hyderabad (Demo) / Remote',
    type: 'Full-time Entry Level',
    description: 'Join our business intelligence unit to clean data pipelines, write SQL queries, and publish executive reports.',
    tier: 'Analytics Consultancy'
  },
  {
    id: 'demo-opp-003',
    company: 'Apex AI Solutions (Demo)',
    role: 'Junior ML Engineer',
    category: 'Demo Opportunity',
    requiredSkills: ['Python', 'Machine Learning', 'Pandas', 'Scikit-learn', 'Git'],
    preferredSkills: ['Deep Learning', 'PyTorch', 'Docker', 'FastAPI'],
    experienceRequired: '0–2 years / Fresher',
    location: 'Bengaluru (Demo)',
    type: 'Full-time Entry Level',
    description: 'Exciting role for passionate graduates to train, evaluate, and assist in packaging machine learning models for production.',
    tier: 'AI Lab'
  },
  {
    id: 'demo-opp-004',
    company: 'Vanguard Systems (Demo)',
    role: 'Associate Backend Engineer',
    category: 'Demo Opportunity',
    requiredSkills: ['Node.js', 'Express.js', 'SQL', 'REST APIs', 'Git'],
    preferredSkills: ['PostgreSQL', 'Redis', 'Docker', 'TypeScript'],
    experienceRequired: '0–1 years / Fresher',
    location: 'Pune (Demo) / Hybrid',
    type: 'Full-time Entry Level',
    description: 'Work on resilient REST APIs, database schemas, and microservice communication for high-volume transactions.',
    tier: 'Mid-Market Enterprise'
  },
  {
    id: 'demo-opp-005',
    company: 'Krypton Infosec (Demo)',
    role: 'Junior Cybersecurity Analyst',
    category: 'Demo Opportunity',
    requiredSkills: ['Computer Networking', 'Linux', 'Information Security', 'OWASP'],
    preferredSkills: ['Python', 'Penetration Testing', 'Wireshark'],
    experienceRequired: '0–1 years / Fresher',
    location: 'NCR / Noida (Demo)',
    type: 'Full-time Entry Level',
    description: 'Assist in vulnerability scanning, penetration tests, and security patch assessments for our client assets.',
    tier: 'Security Services'
  },
  {
    id: 'demo-opp-006',
    company: 'Aura Cloudworks (Demo)',
    role: 'Cloud / DevOps Associate',
    category: 'Demo Opportunity',
    requiredSkills: ['Linux', 'Docker', 'Git', 'AWS', 'Computer Networking'],
    preferredSkills: ['CI/CD', 'Python', 'Kubernetes', 'Terraform'],
    experienceRequired: '0–1 years / Fresher',
    location: 'Chennai (Demo) / Hybrid',
    type: 'Full-time Entry Level',
    description: 'Maintain CI/CD pipelines, configure AWS resources, and assist in cloud containerization.',
    tier: 'Cloud MSP'
  },
  {
    id: 'demo-opp-007',
    company: 'Canvas Product Studios (Demo)',
    role: 'Junior UI/UX Designer',
    category: 'Demo Opportunity',
    requiredSkills: ['Figma', 'UI/UX Design', 'Wireframing', 'Prototyping', 'User Research'],
    preferredSkills: ['Design Systems', 'HTML', 'CSS'],
    experienceRequired: '0–1 years / Fresher',
    location: 'Mumbai (Demo) / Remote',
    type: 'Full-time Entry Level',
    description: 'Craft beautiful user experiences, build interactive Figma prototypes, and participate in design sprints.',
    tier: 'Product Agency'
  },
  {
    id: 'demo-opp-008',
    company: 'Zeta FinTech Labs (Demo)',
    role: 'Frontend Engineer Intern / Trainee',
    category: 'Demo Opportunity',
    requiredSkills: ['HTML', 'CSS', 'JavaScript', 'React', 'Git'],
    preferredSkills: ['TypeScript', 'Tailwind CSS', 'Next.js'],
    experienceRequired: 'Internship / Fresher',
    location: 'Bengaluru (Demo)',
    type: 'Internship with PPO',
    description: 'Build fast and intuitive customer onboarding flows using modern React and Tailwind CSS.',
    tier: 'FinTech Startup'
  }
];

module.exports = {
  SKILL_ALIASES,
  normalizeSkillName,
  SKILL_CATEGORIES,
  CAREER_ROLES,
  LOCAL_DEMO_OPPORTUNITIES
};
