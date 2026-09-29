"use client";

import { useEffect, useState } from "react";
import { taskApi, projectApi, tagApi } from "@/lib/api";
import { TaskDetail, Project, Tag, TaskCreateDto, TaskUpdateDto, TaskStatusEnum, TaskPriority } from "@/lib/types";
import LoadingSpinner from "@/components/LoadingSpinner";
import StatusBadge from "@/components/StatusBadge";
import PriorityBadge from "@/components/PriorityBadge";
import TagBadge from "@/components/TagBadge";
import ConfirmModal from "@/components/ConfirmModal";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, CheckSquare, Search, FolderKanban, Calendar } from "lucide-react";

export default function ManageTasksPage() {
  const [tasks, setTasks] = useState<TaskDetail[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskDetail | null>(null);
  const [formData, setFormData] = useState<TaskCreateDto>({
    title: "",
    description: "",
    status: TaskStatusEnum.ToDo,
    priority: TaskPriority.Medium,
    dueDate: "",
    projectID: 0,
    isActive: true,
    tagIDs: [],
  });
  const [submitting, setSubmitting] = useState(false);

  // Delete modal state
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [taskData, projData, tagData] = await Promise.all([
        taskApi.getAllTasks(),
        projectApi.getAllProjects(),
        tagApi.getAllTags(),
      ]);
      setTasks(taskData);
      setProjects(projData);
      setTags(tagData);
    } catch (err: any) {
      toast.error(err.message || "Failed to load task management data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setEditingTask(null);
    setFormData({
      title: "",
      description: "",
      status: TaskStatusEnum.ToDo,
      priority: TaskPriority.Medium,
      dueDate: "",
      projectID: projects[0]?.projectID || 0,
      isActive: true,
      tagIDs: [],
    });
    setIsModalOpen(true);
  };

  const openEditModal = (task: TaskDetail) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || "",
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "",
      projectID: task.projectID,
      isActive: task.isActive,
      tagIDs: task.tags ? task.tags.map((t) => t.tagID) : [],
    });
    setIsModalOpen(true);
  };

  const handleTagToggle = (tagId: number) => {
    const current = formData.tagIDs || [];
    if (current.includes(tagId)) {
      setFormData({ ...formData, tagIDs: current.filter((id) => id !== tagId) });
    } else {
      setFormData({ ...formData, tagIDs: [...current, tagId] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("Task Title is required");
      return;
    }
    if (!formData.projectID || formData.projectID === 0) {
      toast.error("Please select a Project");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        dueDate: formData.dueDate ? formData.dueDate : null,
      };

      if (editingTask) {
        await taskApi.updateTask(editingTask.taskID, payload as TaskUpdateDto);
        toast.success("Task updated successfully");
      } else {
        await taskApi.createTask(payload as TaskCreateDto);
        toast.success("Task created successfully");
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to save task");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      await taskApi.deleteTask(deleteId);
      toast.success("Task deleted successfully");
      setDeleteId(null);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete task");
    } finally {
      setDeleting(false);
    }
  };

  const filtered = tasks.filter((t) => {
    const term = search.toLowerCase();
    const projName = projects.find((p) => p.projectID === t.projectID)?.projectName || "";
    return (
      t.title.toLowerCase().includes(term) ||
      projName.toLowerCase().includes(term) ||
      t.description?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <CheckSquare className="w-5 h-5" />
            </div>
            <h1 className="text-3xl font-bold text-slate-100">Manage Tasks</h1>
          </div>
          <p className="text-slate-400 text-sm mt-1">Full control over tasks, priorities, tags, and status updates</p>
        </div>
        <button onClick={openCreateModal} className="btn-primary flex items-center gap-2 self-start md:self-auto">
          <Plus className="w-4 h-4" /> Add Task
        </button>
      </div>

      {/* Search Bar */}
      <div className="card p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search tasks by title, project, description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner text="Loading tasks..." />
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center text-slate-400">No tasks found.</div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/50 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="py-3 px-4 font-semibold">ID</th>
                  <th className="py-3 px-4 font-semibold">Title</th>
                  <th className="py-3 px-4 font-semibold">Project</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Priority</th>
                  <th className="py-3 px-4 font-semibold">Tags</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map((task) => {
                  const proj = projects.find((p) => p.projectID === task.projectID);
                  return (
                    <tr key={task.taskID} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4 text-slate-400 font-mono text-xs">#{task.taskID}</td>
                      <td className="py-3 px-4 font-medium text-slate-200 max-w-xs truncate">{task.title}</td>
                      <td className="py-3 px-4 text-slate-300">
                        <span className="inline-flex items-center gap-1.5 text-xs text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                          <FolderKanban className="w-3 h-3" />
                          {proj ? proj.projectName : `Project #${task.projectID}`}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge taskStatus={task.status} />
                      </td>
                      <td className="py-3 px-4">
                        <PriorityBadge priority={task.priority} />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {task.tags && task.tags.length > 0 ? (
                            task.tags.map((tg) => <TagBadge key={tg.tagID} tag={tg} size="sm" />)
                          ) : (
                            <span className="text-slate-600 text-xs">—</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(task)}
                            className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-indigo-400 transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteId(task.taskID)}
                            className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Create / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in max-h-screen overflow-y-auto">
          <div className="card max-w-lg w-full p-6 relative border-slate-700 shadow-2xl my-8">
            <h2 className="text-xl font-bold text-slate-100 mb-4">
              {editingTask ? "Edit Task" : "Create New Task"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Task Title <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Implement Auth Endpoint"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Project <span className="text-rose-400">*</span>
                </label>
                <select
                  value={formData.projectID}
                  onChange={(e) => setFormData({ ...formData, projectID: Number(e.target.value) })}
                  className="input-field"
                  required
                >
                  <option value={0} disabled>Select Project...</option>
                  {projects.map((p) => (
                    <option key={p.projectID} value={p.projectID}>
                      {p.projectName} ({p.departmentName || `Dept #${p.departmentID}`})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: Number(e.target.value) as TaskStatusEnum })}
                    className="input-field"
                  >
                    <option value={TaskStatusEnum.ToDo}>To Do</option>
                    <option value={TaskStatusEnum.InProgress}>In Progress</option>
                    <option value={TaskStatusEnum.Done}>Done</option>
                    <option value={TaskStatusEnum.Cancelled}>Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: Number(e.target.value) as TaskPriority })}
                    className="input-field"
                  >
                    <option value={TaskPriority.Low}>Low</option>
                    <option value={TaskPriority.Medium}>Medium</option>
                    <option value={TaskPriority.High}>High</option>
                    <option value={TaskPriority.Critical}>Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Due Date</label>
                <input
                  type="date"
                  value={formData.dueDate || ""}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Task details and instructions..."
                  className="input-field py-2"
                />
              </div>

              {/* Tag Multi-Select */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">Assign Tags</label>
                {tags.length === 0 ? (
                  <p className="text-slate-500 text-xs">No tags created yet.</p>
                ) : (
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 rounded-lg bg-slate-900 border border-slate-800">
                    {tags.map((tag) => {
                      const selected = (formData.tagIDs || []).includes(tag.tagID);
                      return (
                        <button
                          key={tag.tagID}
                          type="button"
                          onClick={() => handleTagToggle(tag.tagID)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                            selected
                              ? "bg-indigo-600/30 text-indigo-300 border-indigo-500/50 shadow-sm"
                              : "bg-slate-800/60 text-slate-400 border-slate-700 hover:border-slate-600"
                          }`}
                        >
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: tag.color || "#6366f1" }}
                          />
                          {tag.tagName}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActiveTask"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="isActiveTask" className="text-sm text-slate-300 select-none">
                  Active Status
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? "Saving..." : editingTask ? "Update Task" : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <ConfirmModal
        open={deleteId !== null}
        title="Delete Task"
        message="Are you sure you want to delete (soft-delete) this task?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={deleting}
      />
    </div>
  );
}
