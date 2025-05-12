import { db } from './db';
import { projects, tasks, projectMembers, documents } from '@shared/schema';
import path from 'path';
import fs from 'fs';

// Function to seed the database with initial data
export async function seedDatabase() {
  console.log('🌱 Seeding database with initial data...');
  
  try {
    // Check if data already exists
    const existingProjects = await db.select().from(projects);
    
    // Skip if data already exists
    if (existingProjects.length > 0) {
      console.log('Data already exists in the database. Skipping seeding.');
      return;
    }

    // Insert website project directly
    const [websiteProject] = await db.insert(projects).values({
      name: 'Thiết kế lại website',
      description: 'Thiết kế lại trang web công ty với giao diện hiện đại và UX được cải thiện',
      startDate: new Date('2025-05-01'),
      endDate: new Date('2025-07-30'),
    }).returning();

    // Insert marketing project directly
    const [marketingProject] = await db.insert(projects).values({
      name: 'Chiến dịch Marketing Q3',
      description: 'Lập kế hoạch và thực hiện chiến dịch marketing cho việc ra mắt sản phẩm Q3',
      startDate: new Date('2025-06-01'),
      endDate: new Date('2025-09-30'),
    }).returning();

    // Add the user as project member
    await db.insert(projectMembers).values([
      {
        projectId: websiteProject.id,
        userId: '42565088',
        role: 'owner',
      },
      {
        projectId: marketingProject.id,
        userId: '42565088',
        role: 'owner',
      }
    ]);

    // Insert website tasks
    await db.insert(tasks).values([
      {
        title: 'Thiết kế mockup',
        description: 'Tạo wireframes và mockups thiết kế cho trang chủ và trang sản phẩm',
        projectId: websiteProject.id,
        status: 'in_progress',
        priority: 'high',
        order: 1,
        dueDate: new Date('2025-05-15'),
        assigneeId: '42565088',
        creatorId: '42565088',
      },
      {
        title: 'Xây dựng frontend',
        description: 'Triển khai các thành phần frontend sử dụng React và Tailwind CSS',
        projectId: websiteProject.id,
        status: 'todo',
        priority: 'medium',
        order: 1,
        dueDate: new Date('2025-06-01'),
        assigneeId: '42565088',
        creatorId: '42565088',
      },
      {
        title: 'Phát triển API backend',
        description: 'Tạo REST API cho danh mục sản phẩm và quản lý người dùng',
        projectId: websiteProject.id,
        status: 'todo',
        priority: 'high',
        order: 2,
        dueDate: new Date('2025-06-15'),
        assigneeId: '42565088',
        creatorId: '42565088',
      },
      {
        title: 'Kiểm thử người dùng',
        description: 'Tiến hành các phiên kiểm thử người dùng để thu thập phản hồi về tính khả dụng',
        projectId: websiteProject.id,
        status: 'backlog',
        priority: 'medium',
        order: 1,
        dueDate: new Date('2025-07-01'),
        creatorId: '42565088',
      },
      {
        title: 'Di chuyển nội dung',
        description: 'Di chuyển nội dung hiện có sang cấu trúc trang web mới',
        projectId: websiteProject.id,
        status: 'backlog',
        priority: 'low',
        order: 2,
        dueDate: new Date('2025-07-15'),
        creatorId: '42565088',
      }
    ]);

    // Insert marketing tasks
    await db.insert(tasks).values([
      {
        title: 'Nghiên cứu thị trường',
        description: 'Phân tích nhân khẩu học mục tiêu và chiến lược của đối thủ cạnh tranh',
        projectId: marketingProject.id,
        status: 'in_progress',
        priority: 'high',
        order: 1,
        dueDate: new Date('2025-06-15'),
        assigneeId: '42565088',
        creatorId: '42565088',
      },
      {
        title: 'Tạo nội dung',
        description: 'Tạo bài đăng blog, nội dung mạng xã hội và chiến dịch email',
        projectId: marketingProject.id,
        status: 'todo',
        priority: 'medium',
        order: 1,
        dueDate: new Date('2025-07-15'),
        assigneeId: '42565088',
        creatorId: '42565088',
      },
      {
        title: 'Lên lịch mạng xã hội',
        description: 'Lên lịch và kế hoạch các bài đăng trên mạng xã hội trên các nền tảng',
        projectId: marketingProject.id,
        status: 'todo',
        priority: 'medium',
        order: 2,
        dueDate: new Date('2025-08-01'),
        creatorId: '42565088',
      }
    ]);
    
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
    
    // Insert documents
    await db.insert(documents).values([
      {
        name: 'Hướng dẫn thiết kế website',
        description: 'Hướng dẫn thương hiệu và tiêu chuẩn thiết kế cho dự án website',
        projectId: websiteProject.id,
        category: 'design',
        fileUrl: createPlaceholderFile('website-guidelines.txt', 'Đây là trình giữ chỗ cho hướng dẫn thiết kế'),
        fileType: 'text/plain',
        fileSize: 256,
        uploaderId: '42565088',
        version: 1,
      },
      {
        name: 'Lịch trình dự án',
        description: 'Lịch trình chi tiết với các mốc quan trọng cho việc thiết kế lại trang web',
        projectId: websiteProject.id,
        category: 'specification',
        fileUrl: createPlaceholderFile('project-timeline.txt', 'Đây là trình giữ chỗ cho lịch trình dự án'),
        fileType: 'text/plain',
        fileSize: 128,
        uploaderId: '42565088',
        version: 1,
      },
      {
        name: 'Chiến lược Marketing',
        description: 'Chiến lược marketing Q3 và chi tiết chiến dịch',
        projectId: marketingProject.id,
        category: 'report',
        fileUrl: createPlaceholderFile('marketing-strategy.txt', 'Đây là trình giữ chỗ cho chiến lược marketing'),
        fileType: 'text/plain',
        fileSize: 328,
        uploaderId: '42565088',
        version: 1,
      }
    ]);

    console.log('✅ Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}