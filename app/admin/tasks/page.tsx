"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import { taskApi, projectApi, tagApi } from "@/lib/api";
import { TaskDetail, Project, Tag, TaskCreateDto, TaskUpdateDto, TaskStatusEnum, TaskPriority } from "@/lib/types";
import LoadingSpinner from "@/components/LoadingSpinner";
import StatusBadge from "@/components/StatusBadge";
import PriorityBadge from "@/components/PriorityBadge";
import TagBadge from "@/components/TagBadge";
import ConfirmModal from "@/components/ConfirmModal";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, CheckSquare, Search, FolderKanban, Calendar, ArrowLeft } from "lucide-react";

export default function AdminTasksPage() {
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
        taskApi.getAll(),
        projectApi.getAll(),
        tagApi.getAll(),
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
        await taskApi.update(editingTask.taskID, payload as TaskUpdateDto);
        toast.success("Task updated successfully");
      } else {
        await taskApi.create(payload as TaskCreateDto);
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
      await taskApi.delete(deleteId);
      toast.success("Task soft-deleted successfully");
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
    const proj = projects.find((p) => p.projectID === t.projectID);
    return (
      t.title.toLowerCase().includes(term) ||
      t.description?.toLowerCase().includes(term) ||
      proj?.projectName.toLowerCase().includes(term)
    );
  });

  return (
    <AuthGuard>
      <div className="space-y-6 animate-fade-in pb-12">
        {/* Navigation Breadcrumb */}
        <Link href="/admin" className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-xs font-semibold transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Console
        </Link>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shadow-md">
                <CheckSquare className="w-5 h-5" />
              </div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">Manage Tasks</h1>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">Assign deliverables, tag categories, and track work</p>
          </div>
          <button onClick={openCreateModal} className="btn-primary flex items-center gap-2 self-start md:self-auto">
            <Plus className="w-4 h-4" /> Add Task
          </button>
        </div>

        {/* Search Bar */}
        <div className="card p-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search tasks by title, description, or project name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
            />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <LoadingSpinner text="Loading tasks..." />
        ) : filtered.length === 0 ? (
          <div className="card p-12 text-center text-slate-400">No tasks found.</div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Task Title</th>
                  <th>Project</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Tags</th>
                  <th>Due Date</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((task) => {
                  const proj = projects.find((p) => p.projectID === task.projectID);
                  return (
                    <tr key={task.taskID}>
                      <td>
                        <div className="font-semibold text-white">{task.title}</div>
                        <div className="text-xs text-slate-400 max-w-xs truncate">{task.description || "—"}</div>
                      </td>
                      <td>
                        <span className="inline-flex items-center gap-1 text-xs text-indigo-300 font-medium">
                          <FolderKanban className="w-3 h-3 text-indigo-400" />
                          {proj?.projectName || `Project #${task.projectID}`}
                        </span>
                      </td>
                      <td>
                        <StatusBadge taskStatus={task.status} />
                      </td>
                      <td>
                        <PriorityBadge priority={task.priority} />
                      </td>
                      <td>
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {task.tags && task.tags.length > 0 ? (
                            task.tags.map((tg) => <TagBadge key={tg.tagID} tag={tg} />)
                          ) : (
                            <span className="text-xs text-slate-500">—</span>
                          )}
                        </div>
                      </td>
                      <td className="text-xs text-slate-400 whitespace-nowrap">
                        {task.dueDate ? (
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3 h-3 text-slate-500" />
                            {new Date(task.dueDate).toLocaleDateString()}
                          </div>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(task)}
                            className="p-2 rounded-xl hover:bg-white/[0.08] text-slate-400 hover:text-blue-400 transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteId(task.taskID)}
                            className="p-2 rounded-xl hover:bg-white/[0.08] text-slate-400 hover:text-rose-400 transition-colors"
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
        )}

        {/* Modal Create / Edit */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
            <div className="card max-w-xl w-full p-6 sm:p-8 relative border-white/[0.14] shadow-2xl modal-content max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-white mb-4">
                {editingTask ? "Edit Task" : "Create New Task"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">Task Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Implement OAuth Flow"
                    className="input"
                  />
                </div>

                <div>
                  <label className="label">Project *</label>
                  <select
                    required
                    value={formData.projectID}
                    onChange={(e) => setFormData({ ...formData, projectID: Number(e.target.value) })}
                    className="select"
                  >
                    <option value={0} disabled>Select a project...</option>
                    {projects.map((p) => (
                      <option key={p.projectID} value={p.projectID}>
                        {p.projectName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">Description</label>
                  <textarea
                    rows={3}
                    value={formData.description || ""}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Task details and acceptance criteria..."
                    className="input py-2.5"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: Number(e.target.value) as TaskStatusEnum })}
                      className="select"
                    >
                      <option value={TaskStatusEnum.ToDo}>To Do</option>
                      <option value={TaskStatusEnum.InProgress}>In Progress</option>
                      <option value={TaskStatusEnum.Done}>Done</option>
                      <option value={TaskStatusEnum.Cancelled}>Cancelled</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Priority</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: Number(e.target.value) as TaskPriority })}
                      className="select"
                    >
                      <option value={TaskPriority.Low}>Low</option>
                      <option value={TaskPriority.Medium}>Medium</option>
                      <option value={TaskPriority.High}>High</option>
                      <option value={TaskPriority.Critical}>Critical</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="label">Due Date</label>
                  <input
                    type="date"
                    value={formData.dueDate || ""}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="input"
                  />
                </div>

                {/* Tag Multi-select */}
                <div>
                  <label className="label">Associated Tags</label>
                  <div className="flex flex-wrap gap-2 p-3 bg-white/[0.03] border border-white/[0.08] rounded-2xl min-h-[50px] items-center">
                    {tags.length === 0 ? (
                      <span className="text-xs text-slate-500">No tags configured yet</span>
                    ) : (
                      tags.map((tg) => {
                        const selected = (formData.tagIDs || []).includes(tg.tagID);
                        return (
                          <button
                            type="button"
                            key={tg.tagID}
                            onClick={() => handleTagToggle(tg.tagID)}
                            className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                              selected
                                ? "bg-blue-600 text-white border-blue-500 shadow-sm"
                                : "bg-white/[0.06] text-slate-400 border-white/[0.08] hover:text-white"
                            }`}
                          >
                            {tg.tagName}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.08]">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="btn-secondary"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" disabled={submitting}>
                    {submitting ? "Saving..." : editingTask ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Confirm Delete */}
        <ConfirmModal
          open={deleteId !== null}
          title="Delete Task"
          message="Are you sure you want to soft-delete this task? The task will be archived."
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
          loading={deleting}
        />
      </div>
    </AuthGuard>
  );
}
