import { UserProfile } from '../types';

const STORAGE_KEY = 'gigfinder_auth_user';
const USERS_KEY = 'gigfinder_users';

export interface AuthUser extends UserProfile {
  email: string;
  password?: string; // In a real app, this would be hashed. Here it's just for simulation.
}

export const authService = {
  login: async (email: string, password: string): Promise<AuthUser> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const usersStr = localStorage.getItem(USERS_KEY);
    let users: AuthUser[] = usersStr ? JSON.parse(usersStr) : [];

    // Add demo user if not exists
    if (!users.find(u => u.email === 'demo@example.com')) {
       const demoUser: AuthUser = {
          email: 'demo@example.com',
          password: 'password',
          name: 'Arjun Mehta',
          currentRole: 'Senior Frontend Engineer',
          bio: 'Passionate UI/UX specialist building scalable web apps. Looking for challenging roles in Bangalore or Remote.',
          education: 'B.Tech in Computer Science, IIT Bombay (2018)',
          experienceSummary: '5 years of experience in React ecosystem. Led a team of 4 at a fintech startup.',
          skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'GraphQL'],
          yearsExperience: 5,
          preferences: {
            remote: false,
            minSalary: 1500000,
            locations: ['Bangalore', 'Mumbai']
          },
          avatarUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
          dislikedJobs: []
       };
       users.push(demoUser);
       localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }

    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
      const { password, ...userWithoutPassword } = user;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userWithoutPassword));
      return userWithoutPassword as AuthUser;
    }

    throw new Error('Invalid email or password');
  },

  signup: async (email: string, password: string, name: string): Promise<AuthUser> => {
    await new Promise(resolve => setTimeout(resolve, 800));

    const usersStr = localStorage.getItem(USERS_KEY);
    const users: AuthUser[] = usersStr ? JSON.parse(usersStr) : [];

    if (users.find(u => u.email === email)) {
      throw new Error('User already exists');
    }

    const newUser: AuthUser = {
      email,
      password,
      name,
      currentRole: 'Job Seeker',
      bio: 'I am looking for new opportunities.',
      skills: [],
      yearsExperience: 0,
      preferences: {
        remote: false,
        minSalary: 0,
        locations: []
      },
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
      dislikedJobs: []
    };

    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    const { password: _, ...userWithoutPassword } = newUser;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userWithoutPassword));
    
    return userWithoutPassword as AuthUser;
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEY);
  },

  getCurrentUser: (): AuthUser | null => {
    const userStr = localStorage.getItem(STORAGE_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }
};
