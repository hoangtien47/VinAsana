import {
  users,
  projects,
  projectMembers,
  tasks,
  comments,
  documents,
  attachments,
  events,
  eventAttendees,
  type User,
  type UpsertUser,
  type Project,
  type ProjectMember,
  type Task,
  type Comment,
  type Document,
  type Attachment,
  type Event,
  type EventAttendee,
  type InsertProject,
  type InsertProjectMember,
  type InsertTask,
  type InsertComment,
  type InsertDocument,
  type InsertAttachment,
  type InsertEvent,
  type InsertEventAttendee,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, isNull, like, gte, lte, inArray } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getUsers(): Promise<User[]>;
  
  // Project operations
  getProject(id: number): Promise<Project | undefined>;
  getProjects(userId: string): Promise<Project[]>;
  createProject(project: InsertProject, creatorId: string): Promise<Project>;
  updateProject(id: number, project: Partial<InsertProject>): Promise<Project>;
  deleteProject(id: number): Promise<boolean>;
  
  // Project members operations
  getProjectMembers(projectId: number): Promise<(ProjectMember & { user: User })[]>;
  addProjectMember(projectMember: InsertProjectMember): Promise<ProjectMember>;
  removeProjectMember(projectId: number, userId: string): Promise<boolean>;
  
  // Task operations
  getTask(id: number): Promise<Task | undefined>;
  getTasks(projectId: number, filters?: {
    status?: string[];
    priority?: string[];
    assigneeId?: string;
  }): Promise<Task[]>;
  createTask(task: InsertTask, creatorId: string): Promise<Task>;
  updateTask(id: number, task: Partial<InsertTask>): Promise<Task>;
  deleteTask(id: number): Promise<boolean>;
  
  // Comment operations
  getComments(taskId: number): Promise<(Comment & { user: User })[]>;
  createComment(comment: InsertComment, userId: string): Promise<Comment>;
  
  // Document operations
  getDocument(id: number): Promise<Document | undefined>;
  getDocuments(projectId: number, category?: string): Promise<Document[]>;
  createDocument(document: InsertDocument, uploaderId: string): Promise<Document>;
  updateDocument(id: number, document: Partial<InsertDocument>): Promise<Document>;
  deleteDocument(id: number): Promise<boolean>;
  
  // Attachment operations
  getAttachments(taskId: number): Promise<Attachment[]>;
  createAttachment(attachment: InsertAttachment, uploaderId: string): Promise<Attachment>;
  deleteAttachment(id: number): Promise<boolean>;
  
  // Event operations
  getEvent(id: number): Promise<Event | undefined>;
  getEvents(projectId: number, startDate?: Date, endDate?: Date): Promise<Event[]>;
  getUserEvents(userId: string, startDate?: Date, endDate?: Date): Promise<Event[]>;
  createEvent(event: InsertEvent, creatorId: string, attendeeIds?: string[]): Promise<Event>;
  updateEvent(id: number, event: Partial<InsertEvent>): Promise<Event>;
  deleteEvent(id: number): Promise<boolean>;
  
  // Dashboard operations
  getDashboardStats(userId: string): Promise<{
    totalProjects: number;
    totalTasks: number;
    completedTasks: number;
    upcomingDeadlines: Task[];
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  // Project operations
  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }

  async getProjects(userId: string): Promise<Project[]> {
    const memberProjects = await db
      .select({
        id: projects.id,
        name: projects.name,
        description: projects.description,
        startDate: projects.startDate,
        endDate: projects.endDate,
        createdAt: projects.createdAt,
        updatedAt: projects.updatedAt,
      })
      .from(projects)
      .innerJoin(projectMembers, eq(projects.id, projectMembers.projectId))
      .where(eq(projectMembers.userId, userId))
      .orderBy(desc(projects.updatedAt));
    
    return memberProjects;
  }

  async createProject(project: InsertProject, creatorId: string): Promise<Project> {
    const [newProject] = await db.transaction(async (tx) => {
      const [createdProject] = await tx.insert(projects).values(project).returning();
      
      // Add creator as a project member with admin role
      await tx.insert(projectMembers).values({
        projectId: createdProject.id,
        userId: creatorId,
        role: 'admin',
      });
      
      return [createdProject];
    });
    
    return newProject;
  }

  async updateProject(id: number, project: Partial<InsertProject>): Promise<Project> {
    const [updatedProject] = await db
      .update(projects)
      .set({ ...project, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return updatedProject;
  }

  async deleteProject(id: number): Promise<boolean> {
    const result = await db.delete(projects).where(eq(projects.id, id));
    return true;
  }

  // Project members operations
  async getProjectMembers(projectId: number): Promise<(ProjectMember & { user: User })[]> {
    const result = await db
      .select({
        id: projectMembers.id,
        projectId: projectMembers.projectId,
        userId: projectMembers.userId,
        role: projectMembers.role,
        joinedAt: projectMembers.joinedAt,
        user: users,
      })
      .from(projectMembers)
      .innerJoin(users, eq(projectMembers.userId, users.id))
      .where(eq(projectMembers.projectId, projectId));
    
    return result;
  }

  async addProjectMember(projectMember: InsertProjectMember): Promise<ProjectMember> {
    const [newMember] = await db
      .insert(projectMembers)
      .values(projectMember)
      .returning();
    return newMember;
  }

  async removeProjectMember(projectId: number, userId: string): Promise<boolean> {
    await db
      .delete(projectMembers)
      .where(
        and(
          eq(projectMembers.projectId, projectId),
          eq(projectMembers.userId, userId)
        )
      );
    return true;
  }

  // Task operations
  async getTask(id: number): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task;
  }

  async getTasks(
    projectId: number, 
    filters?: {
      status?: string[];
      priority?: string[];
      assigneeId?: string;
    }
  ): Promise<Task[]> {
    let query = db
      .select()
      .from(tasks)
      .where(eq(tasks.projectId, projectId));
    
    if (filters) {
      if (filters.status && filters.status.length > 0) {
        query = query.where(inArray(tasks.status, filters.status as any[]));
      }
      
      if (filters.priority && filters.priority.length > 0) {
        query = query.where(inArray(tasks.priority, filters.priority as any[]));
      }
      
      if (filters.assigneeId) {
        if (filters.assigneeId === 'unassigned') {
          query = query.where(isNull(tasks.assigneeId));
        } else {
          query = query.where(eq(tasks.assigneeId, filters.assigneeId));
        }
      }
    }
    
    return await query.orderBy(asc(tasks.status), asc(tasks.order));
  }

  async createTask(task: InsertTask, creatorId: string): Promise<Task> {
    // For simplicity, just use position 1 for each task during seeding
    const newOrder = 1;
    
    const [newTask] = await db
      .insert(tasks)
      .values({
        ...task,
        order: newOrder,
        creatorId,
      })
      .returning();
    
    return newTask;
  }

  async updateTask(id: number, task: Partial<InsertTask>): Promise<Task> {
    const [updatedTask] = await db
      .update(tasks)
      .set({ ...task, updatedAt: new Date() })
      .where(eq(tasks.id, id))
      .returning();
    
    return updatedTask;
  }

  async deleteTask(id: number): Promise<boolean> {
    await db.delete(tasks).where(eq(tasks.id, id));
    return true;
  }

  // Comment operations
  async getComments(taskId: number): Promise<(Comment & { user: User })[]> {
    const result = await db
      .select({
        id: comments.id,
        text: comments.text,
        taskId: comments.taskId,
        userId: comments.userId,
        createdAt: comments.createdAt,
        updatedAt: comments.updatedAt,
        user: users,
      })
      .from(comments)
      .innerJoin(users, eq(comments.userId, users.id))
      .where(eq(comments.taskId, taskId))
      .orderBy(asc(comments.createdAt));
    
    return result;
  }

  async createComment(comment: InsertComment, userId: string): Promise<Comment> {
    const [newComment] = await db
      .insert(comments)
      .values({
        ...comment,
        userId,
      })
      .returning();
    
    return newComment;
  }

  // Document operations
  async getDocument(id: number): Promise<Document | undefined> {
    const [document] = await db.select().from(documents).where(eq(documents.id, id));
    return document;
  }

  async getDocuments(projectId: number, category?: string): Promise<Document[]> {
    let query = db
      .select()
      .from(documents)
      .where(eq(documents.projectId, projectId));
    
    if (category) {
      query = query.where(eq(documents.category, category as any));
    }
    
    return await query.orderBy(desc(documents.updatedAt));
  }

  async createDocument(document: InsertDocument, uploaderId: string): Promise<Document> {
    const [newDocument] = await db
      .insert(documents)
      .values({
        ...document,
        uploaderId,
      })
      .returning();
    
    return newDocument;
  }

  async updateDocument(id: number, document: Partial<InsertDocument>): Promise<Document> {
    // Increment version if it's a new file
    let versionUpdate = {};
    if (document.fileUrl) {
      const [currentDoc] = await db
        .select({ version: documents.version })
        .from(documents)
        .where(eq(documents.id, id));
      
      versionUpdate = { version: (currentDoc?.version || 1) + 1 };
    }
    
    const [updatedDocument] = await db
      .update(documents)
      .set({
        ...document,
        ...versionUpdate,
        updatedAt: new Date(),
      })
      .where(eq(documents.id, id))
      .returning();
    
    return updatedDocument;
  }

  async deleteDocument(id: number): Promise<boolean> {
    await db.delete(documents).where(eq(documents.id, id));
    return true;
  }

  // Attachment operations
  async getAttachments(taskId: number): Promise<Attachment[]> {
    return await db
      .select()
      .from(attachments)
      .where(eq(attachments.taskId, taskId))
      .orderBy(desc(attachments.createdAt));
  }

  async createAttachment(attachment: InsertAttachment, uploaderId: string): Promise<Attachment> {
    const [newAttachment] = await db
      .insert(attachments)
      .values({
        ...attachment,
        uploaderId,
      })
      .returning();
    
    return newAttachment;
  }

  async deleteAttachment(id: number): Promise<boolean> {
    await db.delete(attachments).where(eq(attachments.id, id));
    return true;
  }

  // Event operations
  async getEvent(id: number): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event;
  }

  async getEvents(projectId: number, startDate?: Date, endDate?: Date): Promise<Event[]> {
    let query = db
      .select()
      .from(events)
      .where(eq(events.projectId, projectId));
    
    if (startDate) {
      query = query.where(gte(events.startTime, startDate));
    }
    
    if (endDate) {
      query = query.where(lte(events.endTime, endDate));
    }
    
    return await query.orderBy(asc(events.startTime));
  }

  async getUserEvents(userId: string, startDate?: Date, endDate?: Date): Promise<Event[]> {
    // Get events where user is an attendee
    let query = db
      .select({
        id: events.id,
        title: events.title,
        description: events.description,
        startTime: events.startTime,
        endTime: events.endTime,
        projectId: events.projectId,
        creatorId: events.creatorId,
        allDay: events.allDay,
        createdAt: events.createdAt,
        updatedAt: events.updatedAt,
      })
      .from(events)
      .innerJoin(eventAttendees, eq(events.id, eventAttendees.eventId))
      .where(eq(eventAttendees.userId, userId));
    
    if (startDate) {
      query = query.where(gte(events.startTime, startDate));
    }
    
    if (endDate) {
      query = query.where(lte(events.endTime, endDate));
    }
    
    return await query.orderBy(asc(events.startTime));
  }

  async createEvent(event: InsertEvent, creatorId: string, attendeeIds: string[] = []): Promise<Event> {
    const [newEvent] = await db.transaction(async (tx) => {
      const [createdEvent] = await tx
        .insert(events)
        .values({
          ...event,
          creatorId,
        })
        .returning();
      
      // Add creator as an attendee
      const attendees = [...new Set([...attendeeIds, creatorId])];
      
      // Add attendees
      if (attendees.length > 0) {
        await tx
          .insert(eventAttendees)
          .values(
            attendees.map(userId => ({
              eventId: createdEvent.id,
              userId,
            }))
          );
      }
      
      return [createdEvent];
    });
    
    return newEvent;
  }

  async updateEvent(id: number, event: Partial<InsertEvent>): Promise<Event> {
    const [updatedEvent] = await db
      .update(events)
      .set({
        ...event,
        updatedAt: new Date(),
      })
      .where(eq(events.id, id))
      .returning();
    
    return updatedEvent;
  }

  async deleteEvent(id: number): Promise<boolean> {
    await db.delete(events).where(eq(events.id, id));
    return true;
  }

  // Dashboard operations
  async getDashboardStats(userId: string): Promise<{
    totalProjects: number;
    totalTasks: number;
    completedTasks: number;
    upcomingDeadlines: Task[];
  }> {
    // Get projects the user is a member of
    const userProjects = await db
      .select({ id: projects.id })
      .from(projects)
      .innerJoin(projectMembers, eq(projects.id, projectMembers.projectId))
      .where(eq(projectMembers.userId, userId));
    
    const projectIds = userProjects.map(p => p.id);
    
    if (projectIds.length === 0) {
      return {
        totalProjects: 0,
        totalTasks: 0,
        completedTasks: 0,
        upcomingDeadlines: [],
      };
    }
    
    // Get total projects count
    const totalProjects = projectIds.length;
    
    // Get total tasks count
    const [tasksCount] = await db
      .select({ count: db.fn.count(tasks.id) })
      .from(tasks)
      .where(inArray(tasks.projectId, projectIds));
    
    const totalTasks = Number(tasksCount?.count || 0);
    
    // Get completed tasks count
    const [completedCount] = await db
      .select({ count: db.fn.count(tasks.id) })
      .from(tasks)
      .where(and(
        inArray(tasks.projectId, projectIds),
        eq(tasks.status, "done")
      ));
    
    const completedTasks = Number(completedCount?.count || 0);
    
    // Get upcoming deadlines (tasks due in the next 7 days)
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    
    const upcomingDeadlines = await db
      .select()
      .from(tasks)
      .where(and(
        inArray(tasks.projectId, projectIds),
        gte(tasks.dueDate, today),
        lte(tasks.dueDate, nextWeek),
        not(eq(tasks.status, 'done'))
      ))
      .orderBy(asc(tasks.dueDate))
      .limit(5);
    
    return {
      totalProjects,
      totalTasks,
      completedTasks,
      upcomingDeadlines,
    };
  }
}

// Helper functions
function not(condition: any) {
  return condition.not ? condition.not() : !condition;
}

export const storage = new DatabaseStorage();
