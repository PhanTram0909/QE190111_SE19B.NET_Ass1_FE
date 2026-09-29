"use client";

import { useEffect, useState } from "react";
import { projectApi, departmentApi } from "@/lib/api";
import { Project, Department, ProjectCreateDto, ProjectUpdateDto, ProjectStatus } from "@/lib/types";
import LoadingSpinner from "@/components/LoadingSpinner";
import StatusBadge from "@/components/StatusBadge";
import ConfirmModal from "@/components/ConfirmModal";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, FolderKanban, Search, Calendar, Building2 } from "lucide-react";

export default function ManageProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState<ProjectCreateDto>({
    projectName: "",
    description: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    status: ProjectStatus.NotStarted,
    departmentID: 0,
    isActive: true,
  });
  const [submitting, setSubmitting] = useState(false);

  // Delete modal state
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [projData, deptData] = await Promise.all([
        projectApi.getAllProjects(),
        departmentApi.getAllDepartments(),
      ]);
      setProjects(projData);
      setDepartments(deptData);
    } catch (err: any) {
      toast.error(err.message || "Failed to load management data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setEditingProject(null);
    setFormData({
      projectName: "",
      description: "",
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
      status: ProjectStatus.NotStarted,
      departmentID: departments[0]?.departmentID || 0,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (proj: Project) => {
    setEditingProject(proj);
    setFormData({
      projectName: proj.projectName,
      description: proj.description || "",
      startDate: proj.startDate ? new Date(proj.startDate).toISOString().split("T")[0] : "",
      endDate: proj.endDate ? new Date(proj.endDate).toISOString().split("T")[0] : "",
      status: proj.status,
      departmentID: proj.departmentID,
      isActive: proj.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.projectName.trim()) {
      toast.error("Project Name is required");
      return;
    }
    if (!formData.departmentID || formData.departmentID === 0) {
      toast.error("Please select a Department");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        endDate: formData.endDate ? formData.endDate : null,
      };

      if (editingProject) {
        await projectApi.updateProject(editingProject.projectID, payload as ProjectUpdateDto);
        toast.success("Project updated successfully");
      } else {
        await projectApi.createProject(payload as ProjectCreateDto);
        toast.success("Project created successfully");
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to save project");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      await projectApi.deleteProject(deleteId);
      toast.success("Project deleted successfully");
      setDeleteId(null);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete project");
    } finally {
      setDeleting(false);
    }
  };

  const filtered = projects.filter(
    (p) =>
      p.projectName.toLowerCase().includes(search.toLowerCase()) ||
      p.departmentName?.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <FolderKanban className="w-5 h-5" />
            </div>
            <h1 className="text-3xl font-bold text-slate-100">Manage Projects</h1>
          </div>
          <p className="text-slate-400 text-sm mt-1">Create, update, or remove projects across departments</p>
        </div>
        <button onClick={openCreateModal} className="btn-primary flex items-center gap-2 self-start md:self-auto">
          <Plus className="w-4 h-4" /> Add Project
        </button>
      </div>

      {/* Search Bar */}
      <div className="card p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by project name or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner text="Loading projects..." />
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center text-slate-400">No projects found.</div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/50 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="py-3 px-4 font-semibold">ID</th>
                  <th className="py-3 px-4 font-semibold">Project Name</th>
                  <th className="py-3 px-4 font-semibold">Department</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Start Date</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map((proj) => (
                  <tr key={proj.projectID} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 text-slate-400 font-mono text-xs">#{proj.projectID}</td>
                    <td className="py-3 px-4 font-medium text-slate-200">{proj.projectName}</td>
                    <td className="py-3 px-4 text-slate-300">
                      <span className="inline-flex items-center gap-1.5 text-xs text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                        <Building2 className="w-3 h-3" />
                        {proj.departmentName || `Dept #${proj.departmentID}`}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge projectStatus={proj.status} />
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-xs">
                      {proj.startDate ? new Date(proj.startDate).toLocaleDateString() : "—"}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(proj)}
                          className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-indigo-400 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(proj.projectID)}
                          className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="card max-w-lg w-full p-6 relative border-slate-700 shadow-2xl">
            <h2 className="text-xl font-bold text-slate-100 mb-4">
              {editingProject ? "Edit Project" : "Create New Project"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Project Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.projectName}
                  onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                  placeholder="e.g. Migration System"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Department <span className="text-rose-400">*</span>
                </label>
                <select
                  value={formData.departmentID}
                  onChange={(e) => setFormData({ ...formData, departmentID: Number(e.target.value) })}
                  className="input-field"
                  required
                >
                  <option value={0} disabled>Select Department...</option>
                  {departments.map((d) => (
                    <option key={d.departmentID} value={d.departmentID}>
                      {d.departmentName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">End Date</label>
                  <input
                    type="date"
                    value={formData.endDate || ""}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: Number(e.target.value) as ProjectStatus })}
                  className="input-field"
                >
                  <option value={ProjectStatus.NotStarted}>Not Started</option>
                  <option value={ProjectStatus.InProgress}>In Progress</option>
                  <option value={ProjectStatus.Completed}>Completed</option>
                  <option value={ProjectStatus.OnHold}>On Hold</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Project details..."
                  className="input-field py-2"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="isActive" className="text-sm text-slate-300 select-none">
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
                  {submitting ? "Saving..." : editingProject ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <ConfirmModal
        open={deleteId !== null}
        title="Delete Project"
        message="Are you sure you want to delete this project? If it has linked tasks, deletion might be restricted."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={deleting}
      />
    </div>
  );
}
