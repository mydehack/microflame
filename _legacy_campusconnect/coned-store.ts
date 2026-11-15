export interface StudentProfile {
  id: string;
  username: string;
  fullName: string;
  college: string;
  university?: string;
  degree?: string;
  department: string;
  educationLevel?: "School" | "Intermediate" | "Undergraduate" | "Postgraduate" | "Other";
  stream?: string;
  careerInterests?: string[];
  dateOfBirth?: string;
  isEmailVerified?: boolean;
  academicYear: number;
  bio: string;
  avatarUrl: string;
  coverUrl?: string;
  accountType: "student" | "ai";
  isPlatformBadge: boolean;
  visibility: "public" | "private";
  skills: { name: string; level: "Beginner" | "Intermediate" | "Advanced"; wantsToLearn?: boolean }[];
  interests: string[];
  goals: string[];
  stats: {
    postsCount: number;
    followersCount: number;
    followingCount: number;
    compatibilityScore?: number;
  };
  contactPreference: "connections" | "followers" | "nobody";
  isFollowing?: boolean;
  followStatus?: "none" | "following" | "requested";
}

export interface Story {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorCollege: string;
  mediaUrl?: string;
  caption: string;
  category: string;
  createdAt: string;
  isViewed: boolean;
  durationSeconds?: number;
}

export interface PostComment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorCollege: string;
  content: string;
  createdAt: string;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorAvatar: string;
  authorCollege: string;
  authorDepartment: string;
  authorYear: number;
  isPlatformBadge?: boolean;
  content: string;
  postType: "update" | "project" | "achievement" | "resource" | "poll";
  visibility: "public" | "campus" | "followers";
  tags: string[];
  imageUrl?: string;
  poll?: {
    question: string;
    options: { text: string; votes: number }[];
    totalVotes: number;
    userVotedIndex?: number;
  };
  likesCount: number;
  isLiked: boolean;
  isSaved: boolean;
  comments: PostComment[];
  createdAt: string;
}

export interface Community {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  bannerUrl: string;
  logoUrl: string;
  membersCount: number;
  postsCount: number;
  isJoined: boolean;
  role?: "owner" | "moderator" | "member";
  rules: string[];
  announcements?: { title: string; date: string; content: string }[];
}

export interface ProjectShowcase {
  id: string;
  title: string;
  description: string;
  coverUrl: string;
  techStack: string[];
  authorId: string;
  authorName: string;
  authorAvatar: string;
  githubUrl?: string;
  demoUrl?: string;
  status: "In Progress" | "Completed" | "Seeking Collaborators";
  likesCount: number;
  isLiked?: boolean;
  createdAt: string;
}

export interface Opportunity {
  id: string;
  title: string;
  organization: string;
  logoUrl: string;
  type: "Internship" | "Hackathon" | "Competition" | "Workshop" | "Scholarship";
  location: string;
  deadline: string;
  rewardOrStipend: string;
  description: string;
  applyUrl: string;
  tags: string[];
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  category: "Technical" | "Academic" | "Career" | "Personal";
  targetDate: string;
  progressPercent: number;
  weeklyHoursLogged: number;
  status: "active" | "completed" | "paused";
  milestones: {
    id: string;
    title: string;
    isCompleted: boolean;
  }[];
  createdAt: string;
}

export interface MessageItem {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  createdAt: string;
  isRead: boolean;
  attachmentUrl?: string;
}

export interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar: string;
  participantCollege: string;
  isOnline: boolean;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isPlatformAccount?: boolean;
}

export interface NotificationItem {
  id: string;
  type: "follow" | "like" | "comment" | "invite" | "ai_tip" | "goal";
  actorName: string;
  actorAvatar: string;
  body: string;
  link: string;
  createdAt: string;
  isRead: boolean;
}

// Seed Current User
export const INITIAL_CURRENT_USER: StudentProfile = {
  id: "usr_me_001",
  username: "alex_rivera",
  fullName: "Alex Rivera",
  college: "Stanford University",
  university: "Stanford University",
  degree: "B.S.",
  department: "Computer Science & AI",
  academicYear: 3,
  bio: "Exploring foundation models, full-stack Next.js systems, and distributed consensus. Daily 2-hour deep work coding block. Building open-source tools for students.",
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
  coverUrl: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1200&q=80",
  accountType: "student",
  isPlatformBadge: false,
  visibility: "public",
  skills: [
    { name: "Next.js & React", level: "Advanced" },
    { name: "Python & PyTorch", level: "Advanced" },
    { name: "TypeScript", level: "Advanced" },
    { name: "PostgreSQL", level: "Intermediate" },
    { name: "Rust", level: "Beginner", wantsToLearn: true },
    { name: "Docker & Kubernetes", level: "Intermediate" },
  ],
  interests: ["Artificial Intelligence", "Web Development", "Robotics", "Startups", "Cybersecurity", "UI/UX"],
  goals: ["Solve 150 LeetCode problems", "Deploy full-stack microservices project", "Find hackathon teammates"],
  stats: {
    postsCount: 14,
    followersCount: 342,
    followingCount: 189,
    compatibilityScore: 100,
  },
  contactPreference: "connections",
};

// Official CON-ED AI Account
export const CONED_AI_PROFILE: StudentProfile = {
  id: "usr_coned_ai",
  username: "coned_ai",
  fullName: "CON-ED AI",
  college: "CON-ED Ecosystem",
  department: "Intelligent Student Mentorship",
  academicYear: 4,
  bio: "Official CON-ED Companion. I help you connect with like-minded students, recommend research roadmaps, discover campus hackathons, and guide your daily progress.",
  avatarUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=256&q=80",
  coverUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
  accountType: "ai",
  isPlatformBadge: true,
  visibility: "public",
  skills: [
    { name: "Career Roadmaps", level: "Advanced" },
    { name: "System Architecture", level: "Advanced" },
    { name: "DSA & Problem Solving", level: "Advanced" },
    { name: "Interview Prep", level: "Advanced" },
  ],
  interests: ["Artificial Intelligence", "Career Guidance", "Academic Mentorship", "Student Growth"],
  goals: ["Empower 100,000+ students to achieve their ambitions"],
  stats: {
    postsCount: 88,
    followersCount: 12450,
    followingCount: 4200,
  },
  contactPreference: "connections",
  isFollowing: true,
  followStatus: "following",
};

// Seed Candidate Students
export const INITIAL_STUDENTS: StudentProfile[] = [
  CONED_AI_PROFILE,
  {
    id: "usr_priya_002",
    username: "priya_sharma",
    fullName: "Priya Sharma",
    college: "MIT",
    department: "Computer Science & AI",
    academicYear: 3,
    bio: "Passionate about NLP, Graph Neural Networks, and ethical AI. Working on research papers for NeurIPS. Looking for research collaborators!",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80",
    coverUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80",
    accountType: "student",
    isPlatformBadge: false,
    visibility: "public",
    skills: [
      { name: "Python", level: "Advanced" },
      { name: "PyTorch", level: "Advanced" },
      { name: "Hugging Face", level: "Advanced" },
      { name: "Mathematics", level: "Intermediate" },
    ],
    interests: ["Artificial Intelligence", "Machine Learning", "Data Science", "Research"],
    goals: ["Publish a student paper at NeurIPS", "Master Transformer Architectures"],
    stats: {
      postsCount: 22,
      followersCount: 580,
      followingCount: 210,
      compatibilityScore: 96,
    },
    contactPreference: "connections",
    isFollowing: true,
    followStatus: "following",
  },
  {
    id: "usr_marcus_003",
    username: "marcus_chen",
    fullName: "Marcus Chen",
    college: "UC Berkeley",
    department: "Robotics & Hardware Labs",
    academicYear: 4,
    bio: "Building autonomous micro-drones using ROS2 and Embedded C++. Captain of Berkeley Robotics Team. Preparing for robotics competitions.",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80",
    coverUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
    accountType: "student",
    isPlatformBadge: false,
    visibility: "public",
    skills: [
      { name: "C++", level: "Advanced" },
      { name: "ROS2", level: "Advanced" },
      { name: "Computer Vision", level: "Intermediate" },
      { name: "PCB Design", level: "Intermediate" },
    ],
    interests: ["Robotics", "Hardware", "Computer Vision", "Gaming"],
    goals: ["Win the National Autonomous Drone Challenge", "Publish open-source ROS2 quadrotor package"],
    stats: {
      postsCount: 31,
      followersCount: 840,
      followingCount: 315,
      compatibilityScore: 88,
    },
    contactPreference: "connections",
    isFollowing: false,
    followStatus: "none",
  },
  {
    id: "usr_aisha_004",
    username: "aisha_patel",
    fullName: "Aisha Patel",
    college: "Stanford University",
    department: "UI/UX & Human-Computer Interaction",
    academicYear: 2,
    bio: "Obsessed with futuristic dark interfaces, micro-interactions, and accessibility in design systems. Figma wizard & creative technologist.",
    avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&q=80",
    coverUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
    accountType: "student",
    isPlatformBadge: false,
    visibility: "public",
    skills: [
      { name: "Figma & Design Systems", level: "Advanced" },
      { name: "UI/UX", level: "Advanced" },
      { name: "Framer Motion", level: "Intermediate" },
      { name: "Tailwind CSS", level: "Advanced" },
    ],
    interests: ["UI/UX", "Design", "Web Development", "Entrepreneurship"],
    goals: ["Build the world's most accessible student UI", "Design 5 major SaaS applications"],
    stats: {
      postsCount: 19,
      followersCount: 720,
      followingCount: 195,
      compatibilityScore: 92,
    },
    contactPreference: "connections",
    isFollowing: true,
    followStatus: "following",
  },
  {
    id: "usr_liam_005",
    username: "liam_oconnor",
    fullName: "Liam O'Connor",
    college: "Oxford University",
    department: "Mathematics & Computing",
    academicYear: 3,
    bio: "Focusing on algorithmic game theory, cryptography, and zero-knowledge proofs. Coffee, math theorems, and late night terminal sessions.",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80",
    coverUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80",
    accountType: "student",
    isPlatformBadge: false,
    visibility: "public",
    skills: [
      { name: "Discrete Math", level: "Advanced" },
      { name: "Rust", level: "Advanced" },
      { name: "Cryptography", level: "Intermediate" },
      { name: "Algorithms", level: "Advanced" },
    ],
    interests: ["Cybersecurity", "Programming", "Science", "Finance"],
    goals: ["Present at Oxford Math Symposium", "Complete Rust zero-knowledge library"],
    stats: {
      postsCount: 15,
      followersCount: 430,
      followingCount: 160,
      compatibilityScore: 84,
    },
    contactPreference: "connections",
    isFollowing: false,
    followStatus: "none",
  },
  {
    id: "usr_elena_006",
    username: "elena_rostova",
    fullName: "Elena Rostova",
    college: "Georgia Tech",
    department: "Cybersecurity & Cloud Systems",
    academicYear: 4,
    bio: "Defensive cloud architecture, penetration testing, and AWS security hardening. CTF competitor and mentor for junior cyber cadets.",
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80",
    coverUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80",
    accountType: "student",
    isPlatformBadge: false,
    visibility: "public",
    skills: [
      { name: "Network Security", level: "Advanced" },
      { name: "AWS Cloud", level: "Advanced" },
      { name: "Linux Hardening", level: "Advanced" },
      { name: "Python", level: "Intermediate" },
    ],
    interests: ["Cybersecurity", "Cloud Computing", "Linux", "Robotics"],
    goals: ["Earn AWS Security Specialty certification", "Top 10 at Collegiate Cyber Defense"],
    stats: {
      postsCount: 26,
      followersCount: 650,
      followingCount: 280,
      compatibilityScore: 86,
    },
    contactPreference: "connections",
    isFollowing: false,
    followStatus: "none",
  },
];

// Seed Stories
export const INITIAL_STORIES: Story[] = [
  {
    id: "story_1",
    authorId: "usr_marcus_003",
    authorName: "Marcus Chen",
    authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80",
    authorCollege: "UC Berkeley",
    mediaUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
    caption: "Hackathon Finals Demo! Autonomous drone obstacle avoidance running at 60 FPS on Jetson Nano 🚀",
    category: "Robotics",
    createdAt: "2 hours ago",
    isViewed: false,
    durationSeconds: 6,
  },
  {
    id: "story_2",
    authorId: "usr_priya_002",
    authorName: "Priya Sharma",
    authorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80",
    authorCollege: "MIT",
    mediaUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80",
    caption: "Our paper got accepted to NeurIPS Student Workshop! Couldn't have done it without our CON-ED study group ✨",
    category: "AI Research",
    createdAt: "4 hours ago",
    isViewed: false,
    durationSeconds: 6,
  },
  {
    id: "story_3",
    authorId: "usr_aisha_004",
    authorName: "Aisha Patel",
    authorAvatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&q=80",
    authorCollege: "Stanford University",
    mediaUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
    caption: "Exploring emerald lighting & glassmorphic depth for the new CON-ED interface 🎨",
    category: "UI/UX",
    createdAt: "6 hours ago",
    isViewed: false,
    durationSeconds: 5,
  },
  {
    id: "story_4",
    authorId: "usr_coned_ai",
    authorName: "CON-ED AI",
    authorAvatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=256&q=80",
    authorCollege: "CON-ED Platform",
    mediaUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80",
    caption: "Tip of the Day: Consistent 45-minute focused sprints beat marathon all-nighters. Check your Goals tab! ⚡",
    category: "Productivity",
    createdAt: "8 hours ago",
    isViewed: true,
    durationSeconds: 5,
  },
  {
    id: "story_5",
    authorId: "usr_liam_005",
    authorName: "Liam O'Connor",
    authorAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80",
    authorCollege: "Oxford University",
    mediaUrl: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80",
    caption: "Solved 3 Hard dynamic programming problems in tonight's library sprint. Brain completely fried 🔥",
    category: "Algorithms",
    createdAt: "12 hours ago",
    isViewed: true,
    durationSeconds: 5,
  },
];

// Seed Feed Posts
export const INITIAL_POSTS: Post[] = [
  {
    id: "post_1",
    authorId: "usr_coned_ai",
    authorName: "CON-ED AI",
    authorUsername: "coned_ai",
    authorAvatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=256&q=80",
    authorCollege: "CON-ED Official",
    authorDepartment: "Intelligent Ecosystem",
    authorYear: 4,
    isPlatformBadge: true,
    content: "🎓 Welcome to CON-ED — Connect • Learn • Grow!\n\nWhether you're looking for research partners, learning full-stack development, preparing for tech interviews, or building your dream startup, CON-ED connects you with students who share your ambition.\n\nQuick tip: Head to the AI Mentor tab to get a personalized roadmap tailored to your graduation year and goals!",
    postType: "achievement",
    visibility: "public",
    tags: ["Welcome", "AIStudentNetwork", "LearningPath"],
    imageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80",
    likesCount: 148,
    isLiked: false,
    isSaved: false,
    comments: [
      {
        id: "c_1",
        postId: "post_1",
        authorId: "usr_priya_002",
        authorName: "Priya Sharma",
        authorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80",
        authorCollege: "MIT",
        content: "So thrilled to have a dedicated platform built specifically for student growth and collaboration! 🚀",
        createdAt: "1 hour ago",
      },
    ],
    createdAt: "2 hours ago",
  },
  {
    id: "post_2",
    authorId: "usr_priya_002",
    authorName: "Priya Sharma",
    authorUsername: "priya_sharma",
    authorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80",
    authorCollege: "MIT",
    authorDepartment: "Computer Science",
    authorYear: 3,
    content: "Just open-sourced our Graph Attention Network for biochemical molecule property prediction! 🧬\n\nBuilt with PyTorch Geometric and Next.js for visualization. Looking for anyone interested in bench-testing it against larger datasets.",
    postType: "project",
    visibility: "public",
    tags: ["PyTorch", "GraphAI", "OpenSource", "MachineLearning"],
    imageUrl: "https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=1200&q=80",
    likesCount: 94,
    isLiked: true,
    isSaved: true,
    comments: [
      {
        id: "c_2",
        postId: "post_2",
        authorId: "usr_marcus_003",
        authorName: "Marcus Chen",
        authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80",
        authorCollege: "UC Berkeley",
        content: "This looks incredible Priya! Can we adapt this for spatial trajectory graphs in autonomous navigation?",
        createdAt: "45 mins ago",
      },
    ],
    createdAt: "3 hours ago",
  },
  {
    id: "post_3",
    authorId: "usr_marcus_003",
    authorName: "Marcus Chen",
    authorUsername: "marcus_chen",
    authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80",
    authorCollege: "UC Berkeley",
    authorDepartment: "Robotics",
    authorYear: 4,
    content: "Quick poll for anyone preparing for upcoming summer internships:\n\nWhich language are you primarily using for Data Structures & Algorithms interviews this season?",
    postType: "poll",
    visibility: "public",
    tags: ["InterviewPrep", "DSA", "Placements", "Poll"],
    poll: {
      question: "Which language do you use for DSA interviews?",
      options: [
        { text: "Python", votes: 312 },
        { text: "C++", votes: 245 },
        { text: "Java", votes: 168 },
        { text: "Go / TypeScript", votes: 84 },
      ],
      totalVotes: 809,
      userVotedIndex: 0,
    },
    likesCount: 63,
    isLiked: false,
    isSaved: false,
    comments: [],
    createdAt: "5 hours ago",
  },
  {
    id: "post_4",
    authorId: "usr_aisha_004",
    authorName: "Aisha Patel",
    authorUsername: "aisha_patel",
    authorAvatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&q=80",
    authorCollege: "Stanford University",
    authorDepartment: "HCI & Design",
    authorYear: 2,
    content: "Dark mode with emerald accents is fundamentally superior for late night coding sessions. Higher contrast, zero glare, and it feels like stepping inside a futuristic cockpit 🛸\n\nWhat's your preferred IDE theme: Minimal Emerald or Cyberpunk Neon?",
    postType: "update",
    visibility: "public",
    tags: ["UIUX", "DarkTheme", "Design", "DevTools"],
    imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80",
    likesCount: 112,
    isLiked: true,
    isSaved: false,
    comments: [],
    createdAt: "8 hours ago",
  },
];

// Seed Communities
export const INITIAL_COMMUNITIES: Community[] = [
  {
    id: "comm_ai_world",
    name: "AI World & Deep Learning",
    slug: "ai-world",
    description: "Hub for undergraduate & graduate students exploring Transformer architectures, diffusion models, and AI research papers.",
    category: "Artificial Intelligence",
    bannerUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
    logoUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&q=80",
    membersCount: 1420,
    postsCount: 384,
    isJoined: true,
    role: "member",
    rules: [
      "Share papers with concise summaries",
      "Constructive feedback on student projects",
      "No low-effort AI spam",
    ],
  },
  {
    id: "comm_nextgen_web",
    name: "NextGen Web & Full-Stack",
    slug: "nextgen-web",
    description: "Modern web architecture: Next.js App Router, React 19, Tailwind CSS, TypeScript, and high-performance serverless backends.",
    category: "Web Development",
    bannerUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80",
    logoUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=120&q=80",
    membersCount: 980,
    postsCount: 290,
    isJoined: true,
    role: "moderator",
    rules: [
      "Include GitHub/live links when sharing projects",
      "Help peers debug issues politely",
    ],
  },
  {
    id: "comm_leetcode_75",
    name: "Competitive Programming & DSA",
    slug: "competitive-programming",
    description: "Daily LeetCode sprints, NeetCode 150 discussions, and technical mock interview prep for placements & internships.",
    category: "Career & Coding",
    bannerUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80",
    logoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
    membersCount: 850,
    postsCount: 420,
    isJoined: false,
    rules: [
      "Explain time & space complexity with code submissions",
      "No plain spoilers without explanations",
    ],
  },
  {
    id: "comm_robotics_lab",
    name: "Robotics & Hardware Labs",
    slug: "robotics-labs",
    description: "Autonomous robotics, ROS2, embedded microcontrollers, drone engineering, and IoT innovations built by students.",
    category: "Robotics & Hardware",
    bannerUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80",
    logoUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=120&q=80",
    membersCount: 620,
    postsCount: 175,
    isJoined: false,
    rules: ["Post schematics and CAD files where possible", "Safety first in high-voltage and rotor builds"],
  },
];

// Seed Projects Showcase
export const INITIAL_PROJECTS: ProjectShowcase[] = [
  {
    id: "proj_1",
    title: "Autonomous Drone Swarm Navigation",
    description: "Decentralized obstacle avoidance and formation flight using ROS2, OpenCV, and ultra-wideband localization.",
    coverUrl: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=800&q=80",
    techStack: ["C++", "ROS2", "Python", "OpenCV", "Gazebo"],
    authorId: "usr_marcus_003",
    authorName: "Marcus Chen",
    authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80",
    githubUrl: "https://github.com/marcuschen/swarm-ros2",
    demoUrl: "https://drone-swarm.berkeley.edu",
    status: "Seeking Collaborators",
    likesCount: 78,
    isLiked: true,
    createdAt: "2 days ago",
  },
  {
    id: "proj_2",
    title: "Neural Code Search Engine",
    description: "Vector embedding search across 10,000+ open-source GitHub repositories using Rust, Qdrant, and CodeBERT.",
    coverUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80",
    techStack: ["Rust", "Python", "Qdrant", "Transformers", "Next.js"],
    authorId: "usr_me_001",
    authorName: "Alex Rivera",
    authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
    githubUrl: "https://github.com/alexrivera/neural-code-search",
    demoUrl: "https://codesearch-ai.dev",
    status: "In Progress",
    likesCount: 104,
    isLiked: false,
    createdAt: "5 days ago",
  },
  {
    id: "proj_3",
    title: "BioMolecule Graph Attention Network",
    description: "GNN model predicting molecular permeability across biological barriers with 94.2% accuracy on benchmark tests.",
    coverUrl: "https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=800&q=80",
    techStack: ["Python", "PyTorch Geometric", "RDKit", "FastAPI"],
    authorId: "usr_priya_002",
    authorName: "Priya Sharma",
    authorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80",
    githubUrl: "https://github.com/priyasharma/biomol-gat",
    demoUrl: "https://biomol-gat.mit.edu",
    status: "Completed",
    likesCount: 142,
    isLiked: true,
    createdAt: "1 week ago",
  },
];

// Seed Opportunities
export const INITIAL_OPPORTUNITIES: Opportunity[] = [
  {
    id: "opp_1",
    title: "Google Summer of Code 2027",
    organization: "Open Source Collective & Google",
    logoUrl: "https://images.unsplash.com/photo-1572021335469-31706a17aaef?auto=format&fit=crop&w=120&q=80",
    type: "Internship",
    location: "Global Remote",
    deadline: "Nov 30, 2026",
    rewardOrStipend: "$3,000 - $6,000 USD",
    description: "Spend 12 weeks contributing to real-world open source projects with direct senior engineer mentorship.",
    applyUrl: "https://summerofcode.withgoogle.com",
    tags: ["OpenSource", "Mentorship", "Global", "Stipend"],
  },
  {
    id: "opp_2",
    title: "OpenAI Student Fellowship",
    organization: "OpenAI Research",
    logoUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&q=80",
    type: "Scholarship",
    location: "San Francisco, CA / Hybrid",
    deadline: "Dec 15, 2026",
    rewardOrStipend: "$10,000 Grant + Compute Credits",
    description: "Support for undergraduate and graduate students conducting groundbreaking safety, alignment, and NLP research.",
    applyUrl: "https://openai.com/careers",
    tags: ["AI", "Research", "Compute", "Fellowship"],
  },
  {
    id: "opp_3",
    title: "Major League Hacking Global Hackathon",
    organization: "MLH & GitHub",
    logoUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=120&q=80",
    type: "Hackathon",
    location: "Online & In-Person Hubs",
    deadline: "Nov 20, 2026",
    rewardOrStipend: "$45,000 Prize Pool",
    description: "Build cutting-edge applications in 48 hours. Categories: AI Agents, Sustainable Tech, and Student Developer Tools.",
    applyUrl: "https://mlh.io",
    tags: ["Hackathon", "Prizes", "TeamBuilding", "FastPaced"],
  },
];

// Seed Goals
export const INITIAL_GOALS: Goal[] = [
  {
    id: "goal_1",
    title: "Solve 150 LeetCode Problems for Placement Prep",
    description: "Master Arrays, Trees, Dynamic Programming, and Graph Traversals before winter placement season.",
    category: "Career",
    targetDate: "2026-12-15",
    progressPercent: 68,
    weeklyHoursLogged: 12.5,
    status: "active",
    milestones: [
      { id: "m1", title: "Complete LeetCode 75 Roadmap", isCompleted: true },
      { id: "m2", title: "Master Graph BFS & DFS Patterns", isCompleted: true },
      { id: "m3", title: "Dynamic Programming Memoization vs Tabulation", isCompleted: false },
      { id: "m4", title: "Conduct 5 Mock Technical Interviews", isCompleted: false },
    ],
    createdAt: "2026-09-10",
  },
  {
    id: "goal_2",
    title: "Deploy Full-Stack AI Research Companion",
    description: "Build a production-ready application using Next.js 16, Supabase PostgreSQL, and Gemini API integration.",
    category: "Technical",
    targetDate: "2026-11-25",
    progressPercent: 82,
    weeklyHoursLogged: 9.0,
    status: "active",
    milestones: [
      { id: "m5", title: "Design high-fidelity emerald dark UI tokens", isCompleted: true },
      { id: "m6", title: "Implement Supabase RLS and database migrations", isCompleted: true },
      { id: "m7", title: "Deploy AI mentor streaming completions", isCompleted: true },
      { id: "m8", title: "Run end-to-end user testing & security audit", isCompleted: false },
    ],
    createdAt: "2026-09-15",
  },
];

// Seed Conversations & Messages
export const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: "conv_coned_ai",
    participantId: "usr_coned_ai",
    participantName: "CON-ED AI",
    participantAvatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=256&q=80",
    participantCollege: "Official Companion",
    isOnline: true,
    lastMessage: "Here is your 3-step recommendation for the upcoming hackathon!",
    lastMessageTime: "10 mins ago",
    unreadCount: 1,
    isPlatformAccount: true,
  },
  {
    id: "conv_priya",
    participantId: "usr_priya_002",
    participantName: "Priya Sharma",
    participantAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80",
    participantCollege: "MIT",
    isOnline: true,
    lastMessage: "I saw your latest project commit, the vector search speed is unreal!",
    lastMessageTime: "1 hour ago",
    unreadCount: 0,
  },
  {
    id: "conv_marcus",
    participantId: "usr_marcus_003",
    participantName: "Marcus Chen",
    participantAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80",
    participantCollege: "UC Berkeley",
    isOnline: false,
    lastMessage: "Are you free for a quick 20-min sync on the drone localization pipeline tomorrow?",
    lastMessageTime: "Yesterday",
    unreadCount: 0,
  },
];

export const INITIAL_MESSAGES: MessageItem[] = [
  {
    id: "msg_1",
    conversationId: "conv_coned_ai",
    senderId: "usr_coned_ai",
    senderName: "CON-ED AI",
    senderAvatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=256&q=80",
    content: "👋 Hello Alex! Welcome to CON-ED. I've automatically followed your profile so we can track your learning journey together.",
    createdAt: "Today at 9:00 AM",
    isRead: true,
  },
  {
    id: "msg_2",
    conversationId: "conv_coned_ai",
    senderId: "usr_coned_ai",
    senderName: "CON-ED AI",
    senderAvatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=256&q=80",
    content: "Based on your interest in AI & Distributed Systems, I recommend joining the 'AI World & Deep Learning' community. Priya Sharma from MIT is also researching similar GNN architectures!",
    createdAt: "Today at 9:02 AM",
    isRead: true,
  },
  {
    id: "msg_3",
    conversationId: "conv_coned_ai",
    senderId: "usr_me_001",
    senderName: "Alex Rivera",
    senderAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
    content: "Thank you! Can you suggest a good breakdown for dynamic programming problems this week?",
    createdAt: "Today at 10:14 AM",
    isRead: true,
  },
  {
    id: "msg_4",
    conversationId: "conv_coned_ai",
    senderId: "usr_coned_ai",
    senderName: "CON-ED AI",
    senderAvatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=256&q=80",
    content: "Absolutely! Here is your 3-step recommendation for the upcoming hackathon:\n1. 1D Knapsack & Coin Change patterns\n2. Longest Common Subsequence (2D Grid)\n3. Tree DP (House Robber III)\nCheck the AI Mentor tab for code walkthroughs!",
    createdAt: "Today at 10:15 AM",
    isRead: false,
  },
  {
    id: "msg_comm_ai_1",
    conversationId: "comm_ai_world",
    senderId: "usr_priya_002",
    senderName: "Priya Sharma",
    senderAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80",
    content: "Welcome to the AI World & Deep Learning community group! We're reviewing recent arXiv papers on graph neural network optimization this Friday.",
    createdAt: "Today at 8:30 AM",
    isRead: true,
  },
  {
    id: "msg_comm_ai_2",
    conversationId: "comm_ai_world",
    senderId: "usr_marcus_003",
    senderName: "Marcus Chen",
    senderAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80",
    content: "Has anyone deployed 4-bit quantized vision models onto Raspberry Pi 5 or Jetson Orin Nano? Looking for benchmark numbers.",
    createdAt: "Today at 9:15 AM",
    isRead: true,
  },
  {
    id: "msg_comm_ai_3",
    conversationId: "comm_ai_world",
    senderId: "usr_coned_ai",
    senderName: "CON-ED AI",
    senderAvatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=256&q=80",
    content: "💡 Tip: For edge inference, check out TensorRT-LLM and llama.cpp's GGML runtime with NEON vector instructions for ~3x throughput gains on ARM.",
    createdAt: "Today at 9:20 AM",
    isRead: true,
  },
  {
    id: "msg_comm_web_1",
    conversationId: "comm_nextgen_web",
    senderId: "usr_priya_002",
    senderName: "Priya Sharma",
    senderAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80",
    content: "Our team just open-sourced our real-time collaborative code editor in Next.js 16 and Supabase. Check it out on the Project Showcase tab!",
    createdAt: "Yesterday at 4:10 PM",
    isRead: true,
  },
  {
    id: "msg_comm_lc_1",
    conversationId: "comm_leetcode_75",
    senderId: "usr_marcus_003",
    senderName: "Marcus Chen",
    senderAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80",
    content: "Today's problem: Course Schedule II (Topological Sort with Kahn's Algorithm / in-degree array). Post your Python/C++ complexity analysis here!",
    createdAt: "Today at 7:00 AM",
    isRead: true,
  },
];

// Seed Notifications
export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif_1",
    type: "follow",
    actorName: "CON-ED AI",
    actorAvatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=256&q=80",
    body: "CON-ED AI officially followed you. Welcome to the student network!",
    link: "/profile/coned_ai",
    createdAt: "2 hours ago",
    isRead: false,
  },
  {
    id: "notif_2",
    type: "like",
    actorName: "Priya Sharma",
    actorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80",
    body: "liked your update on 'Neural Code Search Engine'.",
    link: "/home",
    createdAt: "3 hours ago",
    isRead: false,
  },
  {
    id: "notif_3",
    type: "invite",
    actorName: "Marcus Chen",
    actorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80",
    body: "invited you to join the 'Robotics & Hardware Labs' community.",
    link: "/communities",
    createdAt: "5 hours ago",
    isRead: true,
  },
  {
    id: "notif_4",
    type: "goal",
    actorName: "CON-ED AI",
    actorAvatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=256&q=80",
    body: "Milestone complete! You've logged 12+ hours of focused study this week 🔥",
    link: "/goals",
    createdAt: "1 day ago",
    isRead: true,
  },
];

// Browser LocalStorage Keys
const KEYS = {
  CURRENT_USER: "coned_current_user",
  STUDENTS: "coned_students",
  POSTS: "coned_posts",
  STORIES: "coned_stories",
  COMMUNITIES: "coned_communities",
  PROJECTS: "coned_projects",
  OPPORTUNITIES: "coned_opportunities",
  GOALS: "coned_goals",
  CONVERSATIONS: "coned_conversations",
  MESSAGES: "coned_messages",
  NOTIFICATIONS: "coned_notifications",
  ADMIN_REPORTS: "coned_admin_reports",
};

function getStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch {
    return fallback;
  }
}

function setStorage<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error("Storage error:", err);
  }
}

// Persistent Store Class
export class ConEdStore {
  static getCurrentUser(): StudentProfile {
    return getStorage<StudentProfile>(KEYS.CURRENT_USER, INITIAL_CURRENT_USER);
  }

  static setCurrentUser(user: Partial<StudentProfile>): StudentProfile {
    const current = this.getCurrentUser();
    const updated = { ...current, ...user };
    setStorage(KEYS.CURRENT_USER, updated);
    return updated;
  }

  static getStudents(): StudentProfile[] {
    return getStorage<StudentProfile[]>(KEYS.STUDENTS, INITIAL_STUDENTS);
  }

  static toggleFollow(studentId: string): { isFollowing: boolean; newFollowersCount: number } {
    const students = this.getStudents();
    let result = { isFollowing: false, newFollowersCount: 0 };
    const updated = students.map((s) => {
      if (s.id === studentId) {
        const nextFollowing = !s.isFollowing;
        const count = Math.max(0, (s.stats.followersCount || 0) + (nextFollowing ? 1 : -1));
        result = { isFollowing: nextFollowing, newFollowersCount: count };
        return {
          ...s,
          isFollowing: nextFollowing,
          followStatus: (nextFollowing ? "following" : "none") as "none" | "following",
          stats: { ...s.stats, followersCount: count },
        };
      }
      return s;
    });
    setStorage(KEYS.STUDENTS, updated);

    // Also update current user's following count
    const me = this.getCurrentUser();
    const myFollowingCount = Math.max(0, me.stats.followingCount + (result.isFollowing ? 1 : -1));
    this.setCurrentUser({
      stats: { ...me.stats, followingCount: myFollowingCount },
    });

    return result;
  }

  static getStories(): Story[] {
    return getStorage<Story[]>(KEYS.STORIES, INITIAL_STORIES);
  }

  static addStory(story: Omit<Story, "id" | "createdAt" | "isViewed">): Story {
    const stories = this.getStories();
    const newStory: Story = {
      ...story,
      id: `story_${Date.now()}`,
      createdAt: "Just now",
      isViewed: false,
      durationSeconds: 6,
    };
    stories.unshift(newStory);
    setStorage(KEYS.STORIES, stories);
    return newStory;
  }

  static markStoryViewed(storyId: string): void {
    const stories = this.getStories();
    const updated = stories.map((s) => (s.id === storyId ? { ...s, isViewed: true } : s));
    setStorage(KEYS.STORIES, updated);
  }

  static getPosts(): Post[] {
    return getStorage<Post[]>(KEYS.POSTS, INITIAL_POSTS);
  }

  static addPost(post: {
    content: string;
    postType: "update" | "project" | "achievement" | "resource" | "poll";
    visibility: "public" | "campus" | "followers";
    tags: string[];
    imageUrl?: string;
    poll?: { question: string; options: { text: string; votes: number }[] };
  }): Post {
    const posts = this.getPosts();
    const me = this.getCurrentUser();
    const newPost: Post = {
      id: `post_${Date.now()}`,
      authorId: me.id,
      authorName: me.fullName,
      authorUsername: me.username,
      authorAvatar: me.avatarUrl,
      authorCollege: me.college,
      authorDepartment: me.department,
      authorYear: me.academicYear,
      isPlatformBadge: me.isPlatformBadge,
      content: post.content,
      postType: post.postType,
      visibility: post.visibility,
      tags: post.tags,
      imageUrl: post.imageUrl,
      poll: post.poll
        ? {
            question: post.poll.question,
            options: post.poll.options,
            totalVotes: 0,
          }
        : undefined,
      likesCount: 0,
      isLiked: false,
      isSaved: false,
      comments: [],
      createdAt: "Just now",
    };
    posts.unshift(newPost);
    setStorage(KEYS.POSTS, posts);

    // Update me postsCount
    this.setCurrentUser({
      stats: { ...me.stats, postsCount: me.stats.postsCount + 1 },
    });

    return newPost;
  }

  static toggleLikePost(postId: string): { isLiked: boolean; likesCount: number } {
    const posts = this.getPosts();
    let result = { isLiked: false, likesCount: 0 };
    const updated = posts.map((p) => {
      if (p.id === postId) {
        const nextLiked = !p.isLiked;
        const count = Math.max(0, p.likesCount + (nextLiked ? 1 : -1));
        result = { isLiked: nextLiked, likesCount: count };
        return { ...p, isLiked: nextLiked, likesCount: count };
      }
      return p;
    });
    setStorage(KEYS.POSTS, updated);
    return result;
  }

  static toggleSavePost(postId: string): boolean {
    const posts = this.getPosts();
    let isSaved = false;
    const updated = posts.map((p) => {
      if (p.id === postId) {
        isSaved = !p.isSaved;
        return { ...p, isSaved };
      }
      return p;
    });
    setStorage(KEYS.POSTS, updated);
    return isSaved;
  }

  static votePoll(postId: string, optionIndex: number): Post | null {
    const posts = this.getPosts();
    let updatedPost: Post | null = null;
    const updated = posts.map((p) => {
      if (p.id === postId && p.poll) {
        if (p.poll.userVotedIndex !== undefined) return p; // already voted
        const newOptions = p.poll.options.map((opt, idx) =>
          idx === optionIndex ? { ...opt, votes: opt.votes + 1 } : opt
        );
        updatedPost = {
          ...p,
          poll: {
            ...p.poll,
            options: newOptions,
            totalVotes: p.poll.totalVotes + 1,
            userVotedIndex: optionIndex,
          },
        };
        return updatedPost;
      }
      return p;
    });
    setStorage(KEYS.POSTS, updated);
    return updatedPost;
  }

  static addComment(postId: string, content: string): PostComment {
    const posts = this.getPosts();
    const me = this.getCurrentUser();
    const newComment: PostComment = {
      id: `c_${Date.now()}`,
      postId,
      authorId: me.id,
      authorName: me.fullName,
      authorAvatar: me.avatarUrl,
      authorCollege: me.college,
      content,
      createdAt: "Just now",
    };
    const updated = posts.map((p) => {
      if (p.id === postId) {
        return { ...p, comments: [...p.comments, newComment] };
      }
      return p;
    });
    setStorage(KEYS.POSTS, updated);
    return newComment;
  }

  static deleteComment(postId: string, commentId: string): void {
    const posts = this.getPosts();
    const updated = posts.map((p) => {
      if (p.id === postId) {
        return { ...p, comments: p.comments.filter((c) => c.id !== commentId) };
      }
      return p;
    });
    setStorage(KEYS.POSTS, updated);
  }

  static deletePost(postId: string): void {
    const posts = this.getPosts().filter((p) => p.id !== postId);
    setStorage(KEYS.POSTS, posts);
  }

  static getCommunities(): Community[] {
    return getStorage<Community[]>(KEYS.COMMUNITIES, INITIAL_COMMUNITIES);
  }

  static toggleJoinCommunity(communityId: string): boolean {
    const communities = this.getCommunities();
    let joined = false;
    const updated = communities.map((c) => {
      if (c.id === communityId) {
        joined = !c.isJoined;
        return {
          ...c,
          isJoined: joined,
          membersCount: Math.max(0, c.membersCount + (joined ? 1 : -1)),
        };
      }
      return c;
    });
    setStorage(KEYS.COMMUNITIES, updated);
    return joined;
  }

  static createCommunity(community: Omit<Community, "id" | "membersCount" | "postsCount" | "isJoined">): Community {
    const communities = this.getCommunities();
    const newCommunity: Community = {
      ...community,
      id: `comm_${Date.now()}`,
      membersCount: 1,
      postsCount: 0,
      isJoined: true,
      role: "owner",
    };
    communities.unshift(newCommunity);
    setStorage(KEYS.COMMUNITIES, communities);
    return newCommunity;
  }

  static getProjects(): ProjectShowcase[] {
    return getStorage<ProjectShowcase[]>(KEYS.PROJECTS, INITIAL_PROJECTS);
  }

  static addProject(project: Omit<ProjectShowcase, "id" | "createdAt" | "likesCount" | "authorId" | "authorName" | "authorAvatar">): ProjectShowcase {
    const projects = this.getProjects();
    const me = this.getCurrentUser();
    const newProject: ProjectShowcase = {
      ...project,
      id: `proj_${Date.now()}`,
      authorId: me.id,
      authorName: me.fullName,
      authorAvatar: me.avatarUrl,
      likesCount: 0,
      isLiked: false,
      createdAt: "Just now",
    };
    projects.unshift(newProject);
    setStorage(KEYS.PROJECTS, projects);
    return newProject;
  }

  static getOpportunities(): Opportunity[] {
    return getStorage<Opportunity[]>(KEYS.OPPORTUNITIES, INITIAL_OPPORTUNITIES);
  }

  static getGoals(): Goal[] {
    return getStorage<Goal[]>(KEYS.GOALS, INITIAL_GOALS);
  }

  static addGoal(goal: Omit<Goal, "id" | "createdAt" | "progressPercent" | "weeklyHoursLogged" | "status" | "milestones"> & { milestones: string[] }): Goal {
    const goals = this.getGoals();
    const newGoal: Goal = {
      id: `goal_${Date.now()}`,
      title: goal.title,
      description: goal.description,
      category: goal.category,
      targetDate: goal.targetDate,
      progressPercent: 0,
      weeklyHoursLogged: 0,
      status: "active",
      milestones: goal.milestones.map((m, idx) => ({ id: `m_${idx}`, title: m, isCompleted: false })),
      createdAt: new Date().toISOString().split("T")[0],
    };
    goals.unshift(newGoal);
    setStorage(KEYS.GOALS, goals);
    return newGoal;
  }

  static toggleMilestone(goalId: string, milestoneId: string): Goal | null {
    const goals = this.getGoals();
    let updatedGoal: Goal | null = null;
    const updated = goals.map((g) => {
      if (g.id === goalId) {
        const newMilestones = g.milestones.map((m) =>
          m.id === milestoneId ? { ...m, isCompleted: !m.isCompleted } : m
        );
        const completedCount = newMilestones.filter((m) => m.isCompleted).length;
        const progress = Math.round((completedCount / (newMilestones.length || 1)) * 100);
        updatedGoal = {
          ...g,
          milestones: newMilestones,
          progressPercent: progress,
          status: progress === 100 ? "completed" : "active",
        };
        return updatedGoal;
      }
      return g;
    });
    setStorage(KEYS.GOALS, updated);
    return updatedGoal;
  }

  static deleteGoal(goalId: string): void {
    const goals = this.getGoals().filter((g) => g.id !== goalId);
    setStorage(KEYS.GOALS, goals);
  }

  static getConversations(): Conversation[] {
    return getStorage<Conversation[]>(KEYS.CONVERSATIONS, INITIAL_CONVERSATIONS);
  }

  static getMessages(conversationId: string): MessageItem[] {
    const all = getStorage<MessageItem[]>(KEYS.MESSAGES, INITIAL_MESSAGES);
    return all.filter((m) => m.conversationId === conversationId);
  }

  static sendMessage(conversationId: string, content: string): MessageItem {
    const all = getStorage<MessageItem[]>(KEYS.MESSAGES, INITIAL_MESSAGES);
    const me = this.getCurrentUser();
    const newMsg: MessageItem = {
      id: `msg_${Date.now()}`,
      conversationId,
      senderId: me.id,
      senderName: me.fullName,
      senderAvatar: me.avatarUrl,
      content,
      createdAt: "Just now",
      isRead: true,
    };
    all.push(newMsg);
    setStorage(KEYS.MESSAGES, all);

    // Update conversation lastMessage
    const convs = this.getConversations();
    const updatedConvs = convs.map((c) =>
      c.id === conversationId
        ? { ...c, lastMessage: content, lastMessageTime: "Just now" }
        : c
    );
    setStorage(KEYS.CONVERSATIONS, updatedConvs);

    return newMsg;
  }

  static getNotifications(): NotificationItem[] {
    return getStorage<NotificationItem[]>(KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  }

  static markNotificationRead(notifId: string): void {
    const notifs = this.getNotifications();
    const updated = notifs.map((n) => (n.id === notifId ? { ...n, isRead: true } : n));
    setStorage(KEYS.NOTIFICATIONS, updated);
  }

  static markAllNotificationsRead(): void {
    const notifs = this.getNotifications();
    const updated = notifs.map((n) => ({ ...n, isRead: true }));
    setStorage(KEYS.NOTIFICATIONS, updated);
  }
}
