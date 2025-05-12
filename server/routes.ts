import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import multer from "multer";
import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";
import { z } from "zod";
import {
  insertProjectSchema,
  insertTaskSchema,
  insertCommentSchema,
  insertDocumentSchema,
  insertEventSchema,
} from "@shared/schema";

// Set up multer storage for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      const uploadDir = path.join(import.meta.dirname, "../uploads");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      const uniquePrefix = randomUUID();
      cb(null, uniquePrefix + "-" + file.originalname);
    },
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // === Projects API ===
  
  // Get all projects for the authenticated user
  app.get('/api/projects', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const projects = await storage.getProjects(userId);
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  // Get a specific project
  app.get('/api/projects/:id', isAuthenticated, async (req: any, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  // Create a new project
  app.post('/api/projects', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const projectData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(projectData, userId);
      res.status(201).json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid project data", errors: error.errors });
      }
      console.error("Error creating project:", error);
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  // Update a project
  app.patch('/api/projects/:id', isAuthenticated, async (req: any, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const projectData = insertProjectSchema.partial().parse(req.body);
      const updatedProject = await storage.updateProject(projectId, projectData);
      res.json(updatedProject);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid project data", errors: error.errors });
      }
      console.error("Error updating project:", error);
      res.status(500).json({ message: "Failed to update project" });
    }
  });

  // Delete a project
  app.delete('/api/projects/:id', isAuthenticated, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      await storage.deleteProject(projectId);
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting project:", error);
      res.status(500).json({ message: "Failed to delete project" });
    }
  });

  // Get project members
  app.get('/api/projects/:id/members', isAuthenticated, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const members = await storage.getProjectMembers(projectId);
      res.json(members);
    } catch (error) {
      console.error("Error fetching project members:", error);
      res.status(500).json({ message: "Failed to fetch project members" });
    }
  });

  // Add a project member
  app.post('/api/projects/:id/members', isAuthenticated, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const { userId, role } = req.body;
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      const newMember = await storage.addProjectMember({
        projectId,
        userId,
        role: role || "member",
      });
      
      res.status(201).json(newMember);
    } catch (error) {
      console.error("Error adding project member:", error);
      res.status(500).json({ message: "Failed to add project member" });
    }
  });

  // Remove a project member
  app.delete('/api/projects/:projectId/members/:userId', isAuthenticated, async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const userId = req.params.userId;
      
      await storage.removeProjectMember(projectId, userId);
      res.status(204).end();
    } catch (error) {
      console.error("Error removing project member:", error);
      res.status(500).json({ message: "Failed to remove project member" });
    }
  });

  // === Tasks API ===
  
  // Get tasks for a project
  app.get('/api/projects/:id/tasks', isAuthenticated, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      
      // Parse filters from query params
      const filters: { status?: string[], priority?: string[], assigneeId?: string } = {};
      
      if (req.query.status) {
        filters.status = Array.isArray(req.query.status) 
          ? req.query.status as string[]
          : [req.query.status as string];
      }
      
      if (req.query.priority) {
        filters.priority = Array.isArray(req.query.priority)
          ? req.query.priority as string[]
          : [req.query.priority as string];
      }
      
      if (req.query.assigneeId) {
        filters.assigneeId = req.query.assigneeId as string;
      }
      
      const tasks = await storage.getTasks(projectId, filters);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  // Get a specific task
  app.get('/api/tasks/:id', isAuthenticated, async (req, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const task = await storage.getTask(taskId);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json(task);
    } catch (error) {
      console.error("Error fetching task:", error);
      res.status(500).json({ message: "Failed to fetch task" });
    }
  });

  // Create a new task
  app.post('/api/projects/:id/tasks', isAuthenticated, async (req: any, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      const taskData = insertTaskSchema.parse({
        ...req.body,
        projectId,
      });
      
      const task = await storage.createTask(taskData, userId);
      res.status(201).json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid task data", errors: error.errors });
      }
      console.error("Error creating task:", error);
      res.status(500).json({ message: "Failed to create task" });
    }
  });

  // Update a task
  app.patch('/api/tasks/:id', isAuthenticated, async (req, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const taskData = insertTaskSchema.partial().parse(req.body);
      
      const updatedTask = await storage.updateTask(taskId, taskData);
      res.json(updatedTask);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid task data", errors: error.errors });
      }
      console.error("Error updating task:", error);
      res.status(500).json({ message: "Failed to update task" });
    }
  });

  // Delete a task
  app.delete('/api/tasks/:id', isAuthenticated, async (req, res) => {
    try {
      const taskId = parseInt(req.params.id);
      await storage.deleteTask(taskId);
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting task:", error);
      res.status(500).json({ message: "Failed to delete task" });
    }
  });

  // === Comments API ===
  
  // Get comments for a task
  app.get('/api/tasks/:id/comments', isAuthenticated, async (req, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const comments = await storage.getComments(taskId);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  // Add a comment to a task
  app.post('/api/tasks/:id/comments', isAuthenticated, async (req: any, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      const commentData = insertCommentSchema.parse({
        ...req.body,
        taskId,
      });
      
      const comment = await storage.createComment(commentData, userId);
      res.status(201).json(comment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid comment data", errors: error.errors });
      }
      console.error("Error creating comment:", error);
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  // === Documents API ===
  
  // Get documents for a project
  app.get('/api/projects/:id/documents', isAuthenticated, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const category = req.query.category as string | undefined;
      
      const documents = await storage.getDocuments(projectId, category);
      res.json(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  // Get a specific document
  app.get('/api/documents/:id', isAuthenticated, async (req, res) => {
    try {
      const documentId = parseInt(req.params.id);
      const document = await storage.getDocument(documentId);
      
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      res.json(document);
    } catch (error) {
      console.error("Error fetching document:", error);
      res.status(500).json({ message: "Failed to fetch document" });
    }
  });

  // Upload a new document
  app.post(
    '/api/projects/:id/documents',
    isAuthenticated,
    upload.single('file'),
    async (req: any, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({ message: "No file uploaded" });
        }
        
        const projectId = parseInt(req.params.id);
        const userId = req.user.claims.sub;
        
        const { name, description, category } = req.body;
        
        if (!name) {
          return res.status(400).json({ message: "Document name is required" });
        }
        
        // Create relative file URL
        const fileUrl = `/uploads/${req.file.filename}`;
        
        const documentData = {
          name,
          description: description || null,
          category: category || 'other',
          projectId,
          fileUrl,
          fileType: req.file.mimetype,
          fileSize: req.file.size,
        };
        
        const document = await storage.createDocument(documentData, userId);
        res.status(201).json(document);
      } catch (error) {
        console.error("Error uploading document:", error);
        res.status(500).json({ message: "Failed to upload document" });
      }
    }
  );

  // Update a document
  app.patch(
    '/api/documents/:id',
    isAuthenticated,
    upload.single('file'),
    async (req, res) => {
      try {
        const documentId = parseInt(req.params.id);
        
        // Prepare update data
        const updateData: any = {};
        
        if (req.body.name) updateData.name = req.body.name;
        if (req.body.description !== undefined) updateData.description = req.body.description;
        if (req.body.category) updateData.category = req.body.category;
        
        // If file is uploaded, update file-related fields
        if (req.file) {
          updateData.fileUrl = `/uploads/${req.file.filename}`;
          updateData.fileType = req.file.mimetype;
          updateData.fileSize = req.file.size;
        }
        
        const updatedDocument = await storage.updateDocument(documentId, updateData);
        res.json(updatedDocument);
      } catch (error) {
        console.error("Error updating document:", error);
        res.status(500).json({ message: "Failed to update document" });
      }
    }
  );

  // Delete a document
  app.delete('/api/documents/:id', isAuthenticated, async (req, res) => {
    try {
      const documentId = parseInt(req.params.id);
      
      // First get the document to know the file path
      const document = await storage.getDocument(documentId);
      
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      // Delete from database
      await storage.deleteDocument(documentId);
      
      // Try to delete the file from disk
      try {
        const filePath = path.join(
          import.meta.dirname,
          '..',
          document.fileUrl
        );
        
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (fileError) {
        console.error("Error deleting file from disk:", fileError);
        // Continue with the response even if file deletion fails
      }
      
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting document:", error);
      res.status(500).json({ message: "Failed to delete document" });
    }
  });

  // === Attachments API ===
  
  // Get attachments for a task
  app.get('/api/tasks/:id/attachments', isAuthenticated, async (req, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const attachments = await storage.getAttachments(taskId);
      res.json(attachments);
    } catch (error) {
      console.error("Error fetching attachments:", error);
      res.status(500).json({ message: "Failed to fetch attachments" });
    }
  });

  // Upload a new attachment to a task
  app.post(
    '/api/tasks/:id/attachments',
    isAuthenticated,
    upload.single('file'),
    async (req: any, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({ message: "No file uploaded" });
        }
        
        const taskId = parseInt(req.params.id);
        const userId = req.user.claims.sub;
        
        const name = req.body.name || req.file.originalname;
        
        // Create relative file URL
        const fileUrl = `/uploads/${req.file.filename}`;
        
        const attachmentData = {
          name,
          taskId,
          fileUrl,
          fileType: req.file.mimetype,
          fileSize: req.file.size,
        };
        
        const attachment = await storage.createAttachment(attachmentData, userId);
        res.status(201).json(attachment);
      } catch (error) {
        console.error("Error uploading attachment:", error);
        res.status(500).json({ message: "Failed to upload attachment" });
      }
    }
  );

  // Delete an attachment
  app.delete('/api/attachments/:id', isAuthenticated, async (req, res) => {
    try {
      const attachmentId = parseInt(req.params.id);
      await storage.deleteAttachment(attachmentId);
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting attachment:", error);
      res.status(500).json({ message: "Failed to delete attachment" });
    }
  });

  // === Events API ===
  
  // Get events for a project
  app.get('/api/projects/:id/events', isAuthenticated, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      
      let startDate: Date | undefined;
      let endDate: Date | undefined;
      
      if (req.query.start) {
        startDate = new Date(req.query.start as string);
      }
      
      if (req.query.end) {
        endDate = new Date(req.query.end as string);
      }
      
      const events = await storage.getEvents(projectId, startDate, endDate);
      res.json(events);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  // Get events for the current user
  app.get('/api/events', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      let startDate: Date | undefined;
      let endDate: Date | undefined;
      
      if (req.query.start) {
        startDate = new Date(req.query.start as string);
      }
      
      if (req.query.end) {
        endDate = new Date(req.query.end as string);
      }
      
      const events = await storage.getUserEvents(userId, startDate, endDate);
      res.json(events);
    } catch (error) {
      console.error("Error fetching user events:", error);
      res.status(500).json({ message: "Failed to fetch user events" });
    }
  });

  // Create a new event
  app.post('/api/projects/:id/events', isAuthenticated, async (req: any, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      const eventData = insertEventSchema.parse({
        ...req.body,
        projectId,
      });
      
      const attendeeIds = req.body.attendeeIds || [];
      
      const event = await storage.createEvent(eventData, userId, attendeeIds);
      res.status(201).json(event);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid event data", errors: error.errors });
      }
      console.error("Error creating event:", error);
      res.status(500).json({ message: "Failed to create event" });
    }
  });

  // Update an event
  app.patch('/api/events/:id', isAuthenticated, async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const eventData = insertEventSchema.partial().parse(req.body);
      
      const updatedEvent = await storage.updateEvent(eventId, eventData);
      res.json(updatedEvent);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid event data", errors: error.errors });
      }
      console.error("Error updating event:", error);
      res.status(500).json({ message: "Failed to update event" });
    }
  });

  // Delete an event
  app.delete('/api/events/:id', isAuthenticated, async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      await storage.deleteEvent(eventId);
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting event:", error);
      res.status(500).json({ message: "Failed to delete event" });
    }
  });

  // === Dashboard API ===
  
  // Get dashboard stats
  app.get('/api/dashboard/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getDashboardStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // === Users API ===
  
  // Get all users (for assigning tasks and adding to projects)
  app.get('/api/users', isAuthenticated, async (req, res) => {
    try {
      const users = await storage.getUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Serve uploaded files
  app.use('/uploads', express.static(path.join(import.meta.dirname, '../uploads')));

  const httpServer = createServer(app);
  return httpServer;
}
