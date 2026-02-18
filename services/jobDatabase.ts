import { Job } from '../types';

export const LOCATIONS = ['Bangalore', 'Mumbai', 'Delhi NCR', 'Hyderabad', 'Pune', 'Chennai', 'Remote', 'Remote (India)', 'Gurugram'];
const TYPES = ['Full-time', 'Contract', 'Freelance'];

const COMPANIES = [
  'TechFlow', 'Google', 'Microsoft', 'Amazon', 'Flipkart', 'Swiggy', 'Zomato', 'Cred', 'Razorpay', 'Zerodha',
  'Postman', 'BrowserStack', 'InMobi', 'Freshworks', 'Zoho', 'Myntra', 'Meesho', 'Groww', 'PhonePe', 'Udaan',
  'Ola', 'Uber', 'Salesforce', 'Adobe', 'Atlassian', 'Intuit', 'Oracle', 'Cisco', 'IBM', 'Accenture'
];

const ROLES = {
  'Frontend': ['Frontend Engineer', 'React Developer', 'UI Engineer', 'Senior Frontend Dev', 'Web Developer', 'Lead Frontend'],
  'Backend': ['Backend Engineer', 'Node.js Developer', 'Java Developer', 'Go Developer', 'Python Engineer', 'System Architect'],
  'Design': ['Product Designer', 'UI/UX Designer', 'Visual Designer', 'Brand Designer', 'UX Researcher', 'Art Director'],
  'Product': ['Product Manager', 'Associate PM', 'Senior PM', 'Group PM', 'Product Owner', 'Head of Product'],
  'Sales': ['Sales Development Rep', 'Account Executive', 'Sales Manager', 'Business Development', 'Customer Success', 'VP of Sales'],
  'Marketing': ['Marketing Manager', 'Content Strategist', 'SEO Specialist', 'Growth Hacker', 'Social Media Lead', 'Brand Manager']
};

const SKILLS = {
  'Frontend': ['React', 'TypeScript', 'Next.js', 'Tailwind', 'Redux', 'Vue', 'Angular', 'CSS', 'HTML', 'Figma'],
  'Backend': ['Node.js', 'Python', 'Go', 'Java', 'SQL', 'MongoDB', 'AWS', 'Docker', 'Kubernetes', 'Redis'],
  'Design': ['Figma', 'Adobe XD', 'Sketch', 'Prototyping', 'User Research', 'Wireframing', 'Motion Design'],
  'Product': ['Strategy', 'Roadmap', 'Jira', 'Agile', 'Data Analysis', 'SQL', 'User Stories', 'A/B Testing'],
  'Sales': ['CRM', 'Salesforce', 'Cold Calling', 'Negotiation', 'B2B', 'Lead Gen', 'Closing', 'SaaS'],
  'Marketing': ['SEO', 'SEM', 'Content', 'Copywriting', 'Analytics', 'Social Media', 'Email Marketing']
};

const DESCRIPTIONS = [
  "Join our fast-paced team to build the next generation of our product. You will own features from end-to-end.",
  "We are looking for a passionate individual to drive growth and innovation. Competitive salary and equity included.",
  "Work on high-scale systems that serve millions of users daily. Great culture and remote-first policy.",
  "Help us redefine the industry standard. We value creativity, ownership, and speed of execution.",
  "Collaborate with cross-functional teams to deliver delightful experiences. Mentorship and learning budget provided."
];

// Deterministic random to ensure consistency if needed, but Math.random is fine for this demo
const random = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const generateJobs = (count: number): Job[] => {
  const jobs: Job[] = [];
  const categories = Object.keys(ROLES) as (keyof typeof ROLES)[];

  for (let i = 0; i < count; i++) {
    const category = random(categories);
    const roleTitle = random(ROLES[category]);
    const company = random(COMPANIES);
    const location = random(LOCATIONS);
    const minSal = randomInt(8, 30);
    const maxSal = minSal + randomInt(5, 15);
    
    // Pick 3-5 random skills from the category
    const categorySkills = SKILLS[category];
    const jobSkills = [...categorySkills].sort(() => 0.5 - Math.random()).slice(0, randomInt(3, 5));

    jobs.push({
      id: `job-${i}-${Date.now()}`,
      title: roleTitle,
      company: company,
      location: location,
      salary: `₹${minSal}L - ₹${maxSal}L LPA`,
      type: random(TYPES),
      postedAt: `${randomInt(1, 14)} days ago`,
      description: random(DESCRIPTIONS) + ` We are using ${jobSkills.join(', ')} to solve big problems.`,
      tags: [category, ...jobSkills],
      logoUrl: `https://picsum.photos/seed/${company.replace(/\s/g, '')}${i}/100/100`,
      matchScore: 0, // Calculated dynamically
      applyUrl: `https://www.google.com/search?q=${encodeURIComponent(`${roleTitle} at ${company} careers`)}`
    });
  }
  return jobs;
};

// Generate 1200 jobs on load
export const MOCK_DATABASE = generateJobs(1200);

export const getJobsByCategory = (category: string) => {
    return MOCK_DATABASE.filter(j => j.tags.includes(category));
};