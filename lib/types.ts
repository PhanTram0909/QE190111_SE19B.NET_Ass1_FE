// ─── Enums (matching backend) ─────────────────────────────────────────────────
export enum ProjectStatus {
  NotStarted = 0,
  InProgress = 1,
  Completed = 2,
  OnHold = 3,
}

export enum TaskStatusEnum {
  ToDo = 0,
  InProgress = 1,
  Done = 2,
  Cancelled = 3,
}

export enum TaskPriority {
  Low = 0,
  Medium = 1,
  High = 2,
  Critical = 3,
}

// ─── Entity interfaces ────────────────────────────────────────────────────────
export interface Department {
  departmentID: number;
  departmentName: string;
  departmentDescription?: string;
  isActive: boolean;
}

export interface DepartmentWithProjects extends Department {
  projects: Project[];
}

export interface Project {
  projectID: number;
  projectName: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status: ProjectStatus;
  statusLabel: string;
  departmentID: number;
  departmentName?: string;
  isActive: boolean;
  createdDate: string;
}

export interface ProjectDetail extends Project {
  tasks: Task[];
}

export interface Task {
  taskID: number;
  title: string;
  description?: string;
  status: TaskStatusEnum;
  statusLabel: string;
  priority: TaskPriority;
  priorityLabel: string;
  dueDate?: string;
  projectID: number;
  isActive: boolean;
  createdDate: string;
  modifiedDate?: string;
}

export interface TaskDetail extends Task {
  tags: Tag[];
}

export interface Tag {
  tagID: number;
  tagName: string;
  color?: string;
}

// ─── Create / Update DTOs ─────────────────────────────────────────────────────
export interface DepartmentCreateDto {
  departmentName: string;
  departmentDescription?: string;
  isActive?: boolean;
}

export interface DepartmentUpdateDto extends DepartmentCreateDto {
  isActive: boolean;
}

export interface ProjectCreateDto {
  projectName: string;
  description?: string;
  startDate?: string;
  endDate?: string | null;
  status: ProjectStatus;
  departmentID: number;
  isActive?: boolean;
}

export interface ProjectUpdateDto extends ProjectCreateDto {
  isActive: boolean;
}

export interface TaskCreateDto {
  title: string;
  description?: string;
  status: TaskStatusEnum;
  priority: TaskPriority;
  dueDate?: string | null;
  projectID: number;
  isActive?: boolean;
  tagIDs?: number[];
}

export interface TaskUpdateDto extends TaskCreateDto {}

export interface TagCreateDto {
  tagName: string;
  color?: string;
}

export interface TagUpdateDto extends TagCreateDto {}

// ─── API error shape ──────────────────────────────────────────────────────────
export interface ApiError {
  message: string;
}
