import { db } from './db';
import { projects, tasks, projectMembers, users, taskStatusEnum, taskPriorityEnum, documentCategoryEnum, documents } from '@shared/schema';
import { storage } from './storage';
import path from 'path';
import fs from 'fs';

// Function to seed the database with initial data
export async function seedDatabase() {
  console.log('🌱 Seeding database with initial data...');
  
  try {
    // Check if data already exists
    const existingProjects = await db.select().from(projects);
    if (existingProjects.length > 0) {
      console.log('Data already exists in the database. Skipping seeding.');
      return;
    }

    // Create demo project
    const demoProject = await storage.createProject({
      name: 'Website Redesign',
      description: 'Redesign the company website with modern UI and improved UX',
      startDate: new Date('2025-05-01'),
      endDate: new Date('2025-07-30'),
    }, '42565088'); // Using the logged-in user ID from logs

    // Create sample tasks
    const taskData = [
      {
        title: 'Design mockups',
        description: 'Create wireframes and design mockups for homepage and product pages',
        projectId: demoProject.id,
        status: "in_progress" as const,
        priority: "high" as const,
        dueDate: new Date('2025-05-15'),
        assigneeId: '42565088',
      },
      {
        title: 'Frontend implementation',
        description: 'Implement the frontend components using React and Tailwind CSS',
        projectId: demoProject.id,
        status: "todo" as const,
        priority: "medium" as const,
        dueDate: new Date('2025-06-01'),
        assigneeId: '42565088',
      },
      {
        title: 'Backend API development',
        description: 'Create REST APIs for product catalog and user management',
        projectId: demoProject.id,
        status: "todo" as const,
        priority: "high" as const,
        dueDate: new Date('2025-06-15'),
        assigneeId: '42565088',
      },
      {
        title: 'User testing',
        description: 'Conduct user testing sessions to gather feedback on usability',
        projectId: demoProject.id,
        status: "backlog" as const,
        priority: "medium" as const,
        dueDate: new Date('2025-07-01'),
      },
      {
        title: 'Content migration',
        description: 'Migrate existing content to the new website structure',
        projectId: demoProject.id,
        status: "backlog" as const,
        priority: "low" as const,
        dueDate: new Date('2025-07-15'),
      },
    ];

    for (const task of taskData) {
      await storage.createTask(task, '42565088');
    }

    // Create another project
    const marketingProject = await storage.createProject({
      name: 'Q3 Marketing Campaign',
      description: 'Plan and execute marketing campaign for Q3 product launch',
      startDate: new Date('2025-06-01'),
      endDate: new Date('2025-09-30'),
    }, '42565088');
    
    const marketingTasks = [
      {
        title: 'Market research',
        description: 'Analyze target demographics and competitor strategies',
        projectId: marketingProject.id,
        status: "in_progress" as const,
        priority: "high" as const,
        dueDate: new Date('2025-06-15'),
        assigneeId: '42565088',
      },
      {
        title: 'Content creation',
        description: 'Create blog posts, social media content, and email campaigns',
        projectId: marketingProject.id,
        status: "todo" as const,
        priority: "medium" as const,
        dueDate: new Date('2025-07-15'),
        assigneeId: '42565088',
      },
      {
        title: 'Social media scheduling',
        description: 'Schedule and plan social media posts across platforms',
        projectId: marketingProject.id,
        status: "todo" as const,
        priority: "medium" as const,
        dueDate: new Date('2025-08-01'),
      },
    ];
    
    for (const task of marketingTasks) {
      await storage.createTask(task, '42565088');
    }
    
    // Create sample documents
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    // Create placeholder files
    const createPlaceholderFile = (filename: string, content: string) => {
      const filePath = path.join(uploadDir, filename);
      fs.writeFileSync(filePath, content);
      return `/uploads/${filename}`;
    };
    
    const docData = [
      {
        name: 'Website Design Guidelines',
        description: 'Brand guidelines and design standards for the website project',
        projectId: demoProject.id,
        category: "design" as const,
        fileUrl: createPlaceholderFile('website-guidelines.txt', 'This is a placeholder for design guidelines'),
        fileType: 'text/plain',
        fileSize: 256,
      },
      {
        name: 'Project Timeline',
        description: 'Detailed timeline with milestones for the website redesign',
        projectId: demoProject.id,
        category: "specification" as const,
        fileUrl: createPlaceholderFile('project-timeline.txt', 'This is a placeholder for project timeline'),
        fileType: 'text/plain',
        fileSize: 128,
      },
      {
        name: 'Marketing Strategy',
        description: 'Q3 marketing strategy and campaign details',
        projectId: marketingProject.id,
        category: "report" as const,
        fileUrl: createPlaceholderFile('marketing-strategy.txt', 'This is a placeholder for marketing strategy'),
        fileType: 'text/plain',
        fileSize: 328,
      },
    ];
    
    for (const doc of docData) {
      await storage.createDocument(doc, '42565088');
    }
    
    // Add team members (just the current user for now)
    const demoTeamMember = {
      projectId: demoProject.id,
      userId: '42565088',
      role: 'owner',
    };
    
    const marketingTeamMember = {
      projectId: marketingProject.id,
      userId: '42565088',
      role: 'owner',
    };
    
    await storage.addProjectMember(demoTeamMember);
    await storage.addProjectMember(marketingTeamMember);

    console.log('✅ Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}