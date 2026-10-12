"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import { projectApi, departmentApi } from "@/lib/api";
import { Project, Department, ProjectCreateDto, ProjectUpdateDto, ProjectStatus } from "@/lib/types";
import LoadingSpinner from "@/components/LoadingSpinner";
import StatusBadge from "@/components/StatusBadge";
import ConfirmModal from "@/components/ConfirmModal";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, FolderKanban, Search, Calendar, Building2, ArrowLeft } from "lucide-react";

export default function AdminProjectsPage() {
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
        projectApi.getAll(),
        departmentApi.getAll(),
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
      startDate: proj.startDate ? proj.startDate.split("T")[0] : "",
      endDate: proj.endDate ? proj.endDate.split("T")[0] : "",
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
    if (!formData.departmentID) {
      toast.error("Please select a Department");
      return;
    }

    try {
      setSubmitting(true);
      if (editingProject) {
        const updateDto: ProjectUpdateDto = {
          ...formData,
          endDate: formData.endDate ? formData.endDate : null,
          isActive: formData.isActive ?? true,
        };
        await projectApi.update(editingProject.projectID, updateDto);
        toast.success("Project updated successfully");
      } else {
        const createDto: ProjectCreateDto = {
          ...formData,
          endDate: formData.endDate ? formData.endDate : null,
        };
        await projectApi.create(createDto);
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
      await projectApi.delete(deleteId);
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
      p.description?.toLowerCase().includes(search.toLowerCase()) ||
      p.departmentName?.toLowerCase().includes(search.toLowerCase())
  );

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
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center text-indigo-400 shadow-md">
                <FolderKanban className="w-5 h-5" />
              </div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">Manage Projects</h1>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">Track timelines, assignments, and life-cycle statuses</p>
          </div>
          <button onClick={openCreateModal} className="btn-primary flex items-center gap-2 self-start md:self-auto">
            <Plus className="w-4 h-4" /> Add Project
          </button>
        </div>

        {/* Search Bar */}
        <div className="card p-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search projects by name, description, or department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
            />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <LoadingSpinner text="Loading projects..." />
        ) : filtered.length === 0 ? (
          <div className="card p-12 text-center text-slate-400">No projects found.</div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Dates</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((proj) => (
                  <tr key={proj.projectID}>
                    <td>
                      <div className="font-semibold text-white">{proj.projectName}</div>
                      <div className="text-xs text-slate-400 max-w-sm truncate">{proj.description || "—"}</div>
                    </td>
                    <td>
                      <span className="inline-flex items-center gap-1 text-xs text-blue-300 font-medium">
                        <Building2 className="w-3 h-3 text-blue-400" />
                        {proj.departmentName || `Dept #${proj.departmentID}`}
                      </span>
                    </td>
                    <td>
                      <StatusBadge projectStatus={proj.status} />
                    </td>
                    <td className="text-xs text-slate-400 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        <span>{proj.startDate ? new Date(proj.startDate).toLocaleDateString() : "—"}</span>
                        <span>→</span>
                        <span>{proj.endDate ? new Date(proj.endDate).toLocaleDateString() : "Open"}</span>
                      </div>
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(proj)}
                          className="p-2 rounded-xl hover:bg-white/[0.08] text-slate-400 hover:text-blue-400 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(proj.projectID)}
                          className="p-2 rounded-xl hover:bg-white/[0.08] text-slate-400 hover:text-rose-400 transition-colors"
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
        )}

        {/* Modal Create / Edit */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
            <div className="card max-w-lg w-full p-6 sm:p-8 relative border-white/[0.14] shadow-2xl modal-content max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-white mb-4">
                {editingProject ? "Edit Project" : "Create New Project"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">Project Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.projectName}
                    onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                    placeholder="e.g. NextGen Web Platform"
                    className="input"
                  />
                </div>

                <div>
                  <label className="label">Department *</label>
                  <select
                    required
                    value={formData.departmentID}
                    onChange={(e) => setFormData({ ...formData, departmentID: Number(e.target.value) })}
                    className="select"
                  >
                    <option value={0} disabled>Select a department...</option>
                    {departments.map((d) => (
                      <option key={d.departmentID} value={d.departmentID}>
                        {d.departmentName}
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
                    placeholder="Project scope and goals..."
                    className="input py-2.5"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Start Date</label>
                    <input
                      type="date"
                      value={formData.startDate || ""}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Target End Date</label>
                    <input
                      type="date"
                      value={formData.endDate || ""}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="input"
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: Number(e.target.value) as ProjectStatus })}
                    className="select"
                  >
                    <option value={ProjectStatus.NotStarted}>Not Started</option>
                    <option value={ProjectStatus.InProgress}>In Progress</option>
                    <option value={ProjectStatus.Completed}>Completed</option>
                    <option value={ProjectStatus.OnHold}>On Hold</option>
                  </select>
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
                    {submitting ? "Saving..." : editingProject ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Confirm Delete */}
        <ConfirmModal
          open={deleteId !== null}
          title="Delete Project"
          message="Are you sure you want to delete this project? Deletion will be rejected if active tasks are linked."
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
          loading={deleting}
        />
      </div>
    </AuthGuard>
  );
}
