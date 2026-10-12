"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import { departmentApi } from "@/lib/api";
import { Department, DepartmentCreateDto, DepartmentUpdateDto } from "@/lib/types";
import LoadingSpinner from "@/components/LoadingSpinner";
import ConfirmModal from "@/components/ConfirmModal";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, Building2, Search, CheckCircle2, XCircle, ArrowLeft } from "lucide-react";

export default function AdminDepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [formData, setFormData] = useState<DepartmentCreateDto>({
    departmentName: "",
    departmentDescription: "",
    isActive: true,
  });
  const [submitting, setSubmitting] = useState(false);

  // Delete modal state
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const data = await departmentApi.getAll();
      setDepartments(data);
    } catch (err: any) {
      toast.error(err.message || "Failed to load departments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const openCreateModal = () => {
    setEditingDept(null);
    setFormData({
      departmentName: "",
      departmentDescription: "",
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (dept: Department) => {
    setEditingDept(dept);
    setFormData({
      departmentName: dept.departmentName,
      departmentDescription: dept.departmentDescription || "",
      isActive: dept.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.departmentName.trim()) {
      toast.error("Department Name is required");
      return;
    }

    try {
      setSubmitting(true);
      if (editingDept) {
        const updateDto: DepartmentUpdateDto = { ...formData, isActive: formData.isActive ?? true };
        await departmentApi.update(editingDept.departmentID, updateDto);
        toast.success("Department updated successfully");
      } else {
        await departmentApi.create(formData);
        toast.success("Department created successfully");
      }
      setIsModalOpen(false);
      fetchDepartments();
    } catch (err: any) {
      toast.error(err.message || "Failed to save department");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      await departmentApi.delete(deleteId);
      toast.success("Department deleted successfully");
      setDeleteId(null);
      fetchDepartments();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete department");
    } finally {
      setDeleting(false);
    }
  };

  const filtered = departments.filter(
    (d) =>
      d.departmentName.toLowerCase().includes(search.toLowerCase()) ||
      d.departmentDescription?.toLowerCase().includes(search.toLowerCase())
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
              <div className="w-10 h-10 rounded-2xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center text-blue-400 shadow-md">
                <Building2 className="w-5 h-5" />
              </div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">Manage Departments</h1>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">Create, update, or remove organization departments</p>
          </div>
          <button onClick={openCreateModal} className="btn-primary flex items-center gap-2 self-start md:self-auto">
            <Plus className="w-4 h-4" /> Add Department
          </button>
        </div>

        {/* Search Bar */}
        <div className="card p-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search departments by name or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
            />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <LoadingSpinner text="Loading departments..." />
        ) : filtered.length === 0 ? (
          <div className="card p-12 text-center text-slate-400">No departments found.</div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((dept) => (
                  <tr key={dept.departmentID}>
                    <td className="font-mono text-xs text-slate-400">#{dept.departmentID}</td>
                    <td className="font-semibold text-white">{dept.departmentName}</td>
                    <td className="text-slate-400 max-w-md truncate">
                      {dept.departmentDescription || "—"}
                    </td>
                    <td>
                      {dept.isActive ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/25">
                          <XCircle className="w-3.5 h-3.5" /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(dept)}
                          className="p-2 rounded-xl hover:bg-white/[0.08] text-slate-400 hover:text-blue-400 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(dept.departmentID)}
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
            <div className="card max-w-lg w-full p-6 sm:p-8 relative border-white/[0.14] shadow-2xl modal-content">
              <h2 className="text-2xl font-bold text-white mb-4">
                {editingDept ? "Edit Department" : "Create New Department"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">
                    Department Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.departmentName}
                    onChange={(e) => setFormData({ ...formData, departmentName: e.target.value })}
                    placeholder="e.g. Engineering"
                    className="input"
                  />
                </div>

                <div>
                  <label className="label">Description</label>
                  <textarea
                    rows={3}
                    value={formData.departmentDescription || ""}
                    onChange={(e) => setFormData({ ...formData, departmentDescription: e.target.value })}
                    placeholder="Department responsibilities..."
                    className="input py-2.5"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="isActive" className="text-xs text-slate-300 font-semibold select-none cursor-pointer">
                    Active in system
                  </label>
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
                    {submitting ? "Saving..." : editingDept ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Confirm Delete */}
        <ConfirmModal
          open={deleteId !== null}
          title="Delete Department"
          message="Are you sure you want to delete this department? Deletion will be rejected if active projects are linked."
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
          loading={deleting}
        />
      </div>
    </AuthGuard>
  );
}
