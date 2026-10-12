import {
  Department, DepartmentWithProjects, DepartmentCreateDto, DepartmentUpdateDto,
  Project, ProjectDetail, ProjectCreateDto, ProjectUpdateDto, ProjectStatus,
  Task, TaskDetail, TaskCreateDto, TaskUpdateDto, TaskStatusEnum, TaskPriority,
  Tag, TagCreateDto, TagUpdateDto,
  SystemAccount, RegisterDto, LoginDto, AuthResponse, AccountUpdateDto
} from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://qe190111-se19b-net-ass1-be.onrender.com/api";

const TOKEN_KEY = "tasktrack_jwt_token";
const USER_KEY = "tasktrack_current_user";

// ─── Token & Auth Helpers ─────────────────────────────────────────────────────
export const authStorage = {
  getToken: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
  },
  setToken: (token: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(TOKEN_KEY, token);
    }
  },
  getUser: (): SystemAccount | null => {
    if (typeof window === "undefined") return null;
    const str = localStorage.getItem(USER_KEY);
    if (!str) return null;
    try {
      return JSON.parse(str) as SystemAccount;
    } catch {
      return null;
    }
  },
  setUser: (user: SystemAccount) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  },
  clear: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  },
};

// ─── Generic fetch helper with JWT bearer & 401 interception ──────────────────
async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const token = authStorage.getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(url, {
      ...options,
      headers,
    });
  } catch (networkErr: any) {
    throw new Error(`Cannot connect to API at ${url}. (${networkErr.message})`);
  }

  // Intercept 401 Unauthorized — clear token and redirect to login
  if (res.status === 401) {
    authStorage.clear();
    if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
      window.location.href = "/login?sessionExpired=true";
    }
    throw new Error("Unauthorized: Please log in to continue.");
  }

  // Intercept 403 Forbidden — role restriction
  if (res.status === 403) {
    throw new Error("Forbidden: You do not have permission to perform this action (Admin role required).");
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

// ─── Auth API ─────────────────────────────────────────────────────────────────
export const authApi = {
  register: (dto: RegisterDto) =>
    apiFetch<{ message: string; account: SystemAccount }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(dto),
    }),

  login: async (dto: LoginDto): Promise<AuthResponse> => {
    const res = await apiFetch<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(dto),
    });
    if (res?.token) {
      authStorage.setToken(res.token);
      authStorage.setUser(res.account);
    }
    return res;
  },

  logout: () => {
    authStorage.clear();
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  },

  getCurrentUser: () => authStorage.getUser(),
  getToken: () => authStorage.getToken(),
  isAuthenticated: () => !!authStorage.getToken(),
  isAdmin: () => {
    const user = authStorage.getUser();
    return user?.role === 1;
  },
};

// ─── Account Management API (Admin only) ──────────────────────────────────────
export const accountApi = {
  getAll: () => apiFetch<SystemAccount[]>("/accounts"),
  getById: (id: number) => apiFetch<SystemAccount>(`/accounts/${id}`),
  update: (id: number, dto: AccountUpdateDto) =>
    apiFetch<SystemAccount>(`/accounts/${id}`, {
      method: "PUT",
      body: JSON.stringify(dto),
    }),
  delete: (id: number) =>
    apiFetch<{ message: string }>(`/accounts/${id}`, {
      method: "DELETE",
    }),
};

// ─── Department API ───────────────────────────────────────────────────────────
export const departmentApi = {
  getAll: () => apiFetch<Department[]>("/departments"),
  getAllDepartments: () => apiFetch<Department[]>("/departments"),
  getById: (id: number) => apiFetch<DepartmentWithProjects>(`/departments/${id}`),
  getDepartmentById: (id: number) => apiFetch<DepartmentWithProjects>(`/departments/${id}`),
  search: (name: string) => apiFetch<Department[]>(`/departments/search?name=${encodeURIComponent(name)}`),
  create: (dto: DepartmentCreateDto) => apiFetch<Department>("/departments", { method: "POST", body: JSON.stringify(dto) }),
  createDepartment: (dto: DepartmentCreateDto) => apiFetch<Department>("/departments", { method: "POST", body: JSON.stringify(dto) }),
  update: (id: number, dto: DepartmentUpdateDto) => apiFetch<Department>(`/departments/${id}`, { method: "PUT", body: JSON.stringify(dto) }),
  updateDepartment: (id: number, dto: DepartmentUpdateDto) => apiFetch<Department>(`/departments/${id}`, { method: "PUT", body: JSON.stringify(dto) }),
  delete: (id: number) => apiFetch<void>(`/departments/${id}`, { method: "DELETE" }),
  deleteDepartment: (id: number) => apiFetch<void>(`/departments/${id}`, { method: "DELETE" }),
};

// ─── Project API ──────────────────────────────────────────────────────────────
export const projectApi = {
  getAll: () => apiFetch<Project[]>("/projects"),
  getAllProjects: () => apiFetch<Project[]>("/projects"),
  getById: (id: number) => apiFetch<ProjectDetail>(`/projects/${id}`),
  getProjectById: (id: number) => apiFetch<ProjectDetail>(`/projects/${id}`),
  getByDepartment: (departmentId: number) => apiFetch<Project[]>(`/projects/department/${departmentId}`),
  search: (params: { name?: string; status?: ProjectStatus; departmentId?: number }) => {
    const q = new URLSearchParams();
    if (params.name) q.append("name", params.name);
    if (params.status !== undefined) q.append("status", String(params.status));
    if (params.departmentId) q.append("departmentId", String(params.departmentId));
    return apiFetch<Project[]>(`/projects/search?${q.toString()}`);
  },
  create: (dto: ProjectCreateDto) => apiFetch<Project>("/projects", { method: "POST", body: JSON.stringify(dto) }),
  createProject: (dto: ProjectCreateDto) => apiFetch<Project>("/projects", { method: "POST", body: JSON.stringify(dto) }),
  update: (id: number, dto: ProjectUpdateDto) => apiFetch<Project>(`/projects/${id}`, { method: "PUT", body: JSON.stringify(dto) }),
  updateProject: (id: number, dto: ProjectUpdateDto) => apiFetch<Project>(`/projects/${id}`, { method: "PUT", body: JSON.stringify(dto) }),
  delete: (id: number) => apiFetch<void>(`/projects/${id}`, { method: "DELETE" }),
  deleteProject: (id: number) => apiFetch<void>(`/projects/${id}`, { method: "DELETE" }),
};

// ─── Task API ─────────────────────────────────────────────────────────────────
export const taskApi = {
  getAll: () => apiFetch<TaskDetail[]>("/tasks"),
  getAllTasks: () => apiFetch<TaskDetail[]>("/tasks"),
  getById: (id: number) => apiFetch<TaskDetail>(`/tasks/${id}`),
  getTaskById: (id: number) => apiFetch<TaskDetail>(`/tasks/${id}`),
  getByProject: (projectId: number) => apiFetch<Task[]>("/tasks/project/" + projectId),
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
  createTask: (dto: TaskCreateDto) => apiFetch<TaskDetail>("/tasks", { method: "POST", body: JSON.stringify(dto) }),
  update: (id: number, dto: TaskUpdateDto) => apiFetch<TaskDetail>(`/tasks/${id}`, { method: "PUT", body: JSON.stringify(dto) }),
  updateTask: (id: number, dto: TaskUpdateDto) => apiFetch<TaskDetail>(`/tasks/${id}`, { method: "PUT", body: JSON.stringify(dto) }),
  delete: (id: number) => apiFetch<void>(`/tasks/${id}`, { method: "DELETE" }),
  deleteTask: (id: number) => apiFetch<void>(`/tasks/${id}`, { method: "DELETE" }),
};

// ─── Tag API ──────────────────────────────────────────────────────────────────
export const tagApi = {
  getAll: () => apiFetch<Tag[]>("/tags"),
  getAllTags: () => apiFetch<Tag[]>("/tags"),
  create: (dto: TagCreateDto) => apiFetch<Tag>("/tags", { method: "POST", body: JSON.stringify(dto) }),
  createTag: (dto: TagCreateDto) => apiFetch<Tag>("/tags", { method: "POST", body: JSON.stringify(dto) }),
  update: (id: number, dto: TagUpdateDto) => apiFetch<Tag>(`/tags/${id}`, { method: "PUT", body: JSON.stringify(dto) }),
  updateTag: (id: number, dto: TagUpdateDto) => apiFetch<Tag>(`/tags/${id}`, { method: "PUT", body: JSON.stringify(dto) }),
  delete: (id: number) => apiFetch<void>(`/tags/${id}`, { method: "DELETE" }),
  deleteTag: (id: number) => apiFetch<void>(`/tags/${id}`, { method: "DELETE" }),
};
