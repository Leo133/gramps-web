import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateTaskDto {
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  category?: string;
  relatedTo?: any;
  tags?: string[];
  dueDate?: Date;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  category?: string;
  relatedTo?: any;
  tags?: string[];
  dueDate?: Date;
  completedAt?: Date;
}

@Injectable()
export class ResearchPlannerService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new research task
   */
  async createTask(userId: string, data: CreateTaskDto): Promise<any> {
    return this.prisma.researchTask.create({
      data: {
        userId,
        title: data.title,
        description: data.description,
        status: data.status || 'todo',
        priority: data.priority || 'medium',
        category: data.category,
        relatedTo: data.relatedTo ? JSON.stringify(data.relatedTo) : null,
        tags: data.tags ? JSON.stringify(data.tags) : null,
        dueDate: data.dueDate,
      },
    });
  }

  /**
   * Get all tasks for a user
   */
  async getUserTasks(
    userId: string,
    options?: {
      status?: string;
      priority?: string;
      category?: string;
    },
  ): Promise<any[]> {
    const tasks = await this.prisma.researchTask.findMany({
      where: {
        userId,
        ...(options?.status ? { status: options.status } : {}),
        ...(options?.priority ? { priority: options.priority } : {}),
        ...(options?.category ? { category: options.category } : {}),
      },
      orderBy: [
        { status: 'asc' },
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return tasks.map(t => ({
      ...t,
      relatedTo: t.relatedTo ? JSON.parse(t.relatedTo) : null,
      tags: t.tags ? JSON.parse(t.tags) : [],
    }));
  }

  /**
   * Get tasks grouped by status (Kanban board)
   */
  async getKanbanBoard(userId: string): Promise<any> {
    const tasks = await this.getUserTasks(userId);

    const board = {
      todo: tasks.filter(t => t.status === 'todo'),
      in_progress: tasks.filter(t => t.status === 'in_progress'),
      done: tasks.filter(t => t.status === 'done'),
      blocked: tasks.filter(t => t.status === 'blocked'),
    };

    return board;
  }

  /**
   * Update a task
   */
  async updateTask(
    taskId: string,
    userId: string,
    data: UpdateTaskDto,
  ): Promise<any> {
    // Verify task belongs to user
    const task = await this.prisma.researchTask.findFirst({
      where: { id: taskId, userId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // If marking as done, set completedAt
    const updateData: any = { ...data };
    if (data.status === 'done' && !task.completedAt) {
      updateData.completedAt = new Date();
    } else if (data.status !== 'done') {
      updateData.completedAt = null;
    }

    // Convert arrays to JSON strings
    if (data.relatedTo) {
      updateData.relatedTo = JSON.stringify(data.relatedTo);
    }
    if (data.tags) {
      updateData.tags = JSON.stringify(data.tags);
    }

    return this.prisma.researchTask.update({
      where: { id: taskId },
      data: updateData,
    });
  }

  /**
   * Delete a task
   */
  async deleteTask(taskId: string, userId: string): Promise<void> {
    const task = await this.prisma.researchTask.findFirst({
      where: { id: taskId, userId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    await this.prisma.researchTask.delete({
      where: { id: taskId },
    });
  }

  /**
   * Get task statistics
   */
  async getStatistics(userId: string): Promise<any> {
    const tasks = await this.prisma.researchTask.findMany({
      where: { userId },
    });

    const stats = {
      total: tasks.length,
      byStatus: {
        todo: tasks.filter(t => t.status === 'todo').length,
        in_progress: tasks.filter(t => t.status === 'in_progress').length,
        done: tasks.filter(t => t.status === 'done').length,
        blocked: tasks.filter(t => t.status === 'blocked').length,
      },
      byPriority: {
        urgent: tasks.filter(t => t.priority === 'urgent').length,
        high: tasks.filter(t => t.priority === 'high').length,
        medium: tasks.filter(t => t.priority === 'medium').length,
        low: tasks.filter(t => t.priority === 'low').length,
      },
      overdue: tasks.filter(
        t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done',
      ).length,
    };

    return stats;
  }
}
