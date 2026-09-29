import {
  Department, DepartmentWithProjects, DepartmentCreateDto, DepartmentUpdateDto,
  Project, ProjectDetail, ProjectCreateDto, ProjectUpdateDto, ProjectStatus,
  Task, TaskDetail, TaskCreateDto, TaskUpdateDto, TaskStatusEnum, TaskPriority,
  Tag, TagCreateDto, TagUpdateDto,
} from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5029/api";

// ─── Generic fetch helper ─────────────────────────────────────────────────────
async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${path}`;
  let res: Response;
  try {
    res = await fetch(url, {
      headers: { "Content-Type": "application/json", ...options?.headers },
      ...options,
    });
  } catch (networkErr: any) {
    throw new Error(`Cannot connect to API at ${url}. Is the backend running? (${networkErr.message})`);
  }
  if (!res.ok) {
    const rawText = await res.text();
    let message = `HTTP ${res.status}`;
    try {
      const json = JSON.parse(rawText);
      message = json.message || json.title || json.detail || message;
    } catch {}
    console.error(`[API Error] ${res.status} ${url}:`, rawText);
    throw new Error(message);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

// ─── Department API ───────────────────────────────────────────────────────────
export const departmentApi = {
  getAll: () => apiFetch<Department[]>("/departments"),
  getById: (id: number) => apiFetch<DepartmentWithProjects>(`/departments/${id}`),
  search: (name: string) => apiFetch<Department[]>(`/departments/search?name=${encodeURIComponent(name)}`),
  create: (dto: DepartmentCreateDto) => apiFetch<Department>("/departments", { method: "POST", body: JSON.stringify(dto) }),
  update: (id: number, dto: DepartmentUpdateDto) => apiFetch<Department>(`/departments/${id}`, { method: "PUT", body: JSON.stringify(dto) }),
  delete: (id: number) => apiFetch<void>(`/departments/${id}`, { method: "DELETE" }),
};

// ─── Project API ──────────────────────────────────────────────────────────────
export const projectApi = {
  getAll: () => apiFetch<Project[]>("/projects"),
  getById: (id: number) => apiFetch<ProjectDetail>(`/projects/${id}`),
  getByDepartment: (departmentId: number) => apiFetch<Project[]>(`/projects/department/${departmentId}`),
  search: (params: { name?: string; status?: ProjectStatus; departmentId?: number }) => {
    const q = new URLSearchParams();
    if (params.name) q.append("name", params.name);
    if (params.status !== undefined) q.append("status", String(params.status));
    if (params.departmentId) q.append("departmentId", String(params.departmentId));
    return apiFetch<Project[]>(`/projects/search?${q.toString()}`);
  },
  create: (dto: ProjectCreateDto) => apiFetch<Project>("/projects", { method: "POST", body: JSON.stringify(dto) }),
  update: (id: number, dto: ProjectUpdateDto) => apiFetch<Project>(`/projects/${id}`, { method: "PUT", body: JSON.stringify(dto) }),
  delete: (id: number) => apiFetch<void>(`/projects/${id}`, { method: "DELETE" }),
};

// ─── Task API ─────────────────────────────────────────────────────────────────
export const taskApi = {
  getAll: () => apiFetch<Task[]>("/tasks"),
  getById: (id: number) => apiFetch<TaskDetail>(`/tasks/${id}`),
  getByProject: (projectId: number) => apiFetch<Task[]>(`/tasks/project/${projectId}`),
  search: (params: { title?: string; status?: TaskStatusEnum; priority?: TaskPriority; projectId?: number; tagId?: number }) => {
    const q = new URLSearchParams();
    if (params.title) q.append("title", params.title);
    if (params.status !== undefined) q.append("status", String(params.status));
    if (params.priority !== undefined) q.append("priority", String(params.priority));
    if (params.projectId) q.append("projectId", String(params.projectId));
    if (params.tagId) q.append("tagId", String(params.tagId));
    return apiFetch<TaskDetail[]>(`/tasks/search?${q.toString()}`);
  },
  create: (dto: TaskCreateDto) => apiFetch<TaskDetail>("/tasks", { method: "POST", body: JSON.stringify(dto) }),
  update: (id: number, dto: TaskUpdateDto) => apiFetch<TaskDetail>(`/tasks/${id}`, { method: "PUT", body: JSON.stringify(dto) }),
  delete: (id: number) => apiFetch<void>(`/tasks/${id}`, { method: "DELETE" }),
};

// ─── Tag API ──────────────────────────────────────────────────────────────────
export const tagApi = {
  getAll: () => apiFetch<Tag[]>("/tags"),
  create: (dto: TagCreateDto) => apiFetch<Tag>("/tags", { method: "POST", body: JSON.stringify(dto) }),
  update: (id: number, dto: TagUpdateDto) => apiFetch<Tag>(`/tags/${id}`, { method: "PUT", body: JSON.stringify(dto) }),
  delete: (id: number) => apiFetch<void>(`/tags/${id}`, { method: "DELETE" }),
};
