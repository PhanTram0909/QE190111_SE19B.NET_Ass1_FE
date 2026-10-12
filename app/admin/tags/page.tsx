"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import { tagApi } from "@/lib/api";
import { Tag, TagCreateDto, TagUpdateDto } from "@/lib/types";
import LoadingSpinner from "@/components/LoadingSpinner";
import TagBadge from "@/components/TagBadge";
import ConfirmModal from "@/components/ConfirmModal";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, Tag as TagIcon, Search, Palette, ArrowLeft } from "lucide-react";

const PRESET_COLORS = [
  "#ef4444", "#f97316", "#f59e0b", "#10b981", "#06b6d4",
  "#3b82f6", "#6366f1", "#8b5cf6", "#ec4899", "#64748b"
];

export default function AdminTagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [formData, setFormData] = useState<TagCreateDto>({
    tagName: "",
    color: "#6366f1",
  });
  const [submitting, setSubmitting] = useState(false);

  // Delete modal state
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchTags = async () => {
    try {
      setLoading(true);
      const data = await tagApi.getAll();
      setTags(data);
    } catch (err: any) {
      toast.error(err.message || "Failed to load tags");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const openCreateModal = () => {
    setEditingTag(null);
    setFormData({
      tagName: "",
      color: "#6366f1",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (tg: Tag) => {
    setEditingTag(tg);
    setFormData({
      tagName: tg.tagName,
      color: tg.color || "#6366f1",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.tagName.trim()) {
      toast.error("Tag Name is required");
      return;
    }

    try {
      setSubmitting(true);
      if (editingTag) {
        await tagApi.update(editingTag.tagID, formData as TagUpdateDto);
        toast.success("Tag updated successfully");
      } else {
        await tagApi.create(formData);
        toast.success("Tag created successfully");
      }
      setIsModalOpen(false);
      fetchTags();
    } catch (err: any) {
      toast.error(err.message || "Failed to save tag");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      await tagApi.delete(deleteId);
      toast.success("Tag deleted successfully");
      setDeleteId(null);
      fetchTags();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete tag");
    } finally {
      setDeleting(false);
    }
  };

  const filtered = tags.filter((tg) =>
    tg.tagName.toLowerCase().includes(search.toLowerCase())
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
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-amber-400 shadow-md">
                <TagIcon className="w-5 h-5" />
              </div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">Manage Tags</h1>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">Configure metadata labels and badge colors for tasks</p>
          </div>
          <button onClick={openCreateModal} className="btn-primary flex items-center gap-2 self-start md:self-auto">
            <Plus className="w-4 h-4" /> Add Tag
          </button>
        </div>

        {/* Search Bar */}
        <div className="card p-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search tags by label name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
            />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <LoadingSpinner text="Loading tags..." />
        ) : filtered.length === 0 ? (
          <div className="card p-12 text-center text-slate-400">No tags found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((tg) => (
              <div
                key={tg.tagID}
                className="card p-5 flex items-center justify-between group hover:border-white/[0.18]"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0 shadow-sm"
                    style={{ backgroundColor: tg.color || "#6366f1" }}
                  />
                  <div>
                    <div className="font-semibold text-white">{tg.tagName}</div>
                    <div className="font-mono text-[10px] text-slate-400">#{tg.tagID} · {tg.color || "#6366f1"}</div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(tg)}
                    className="p-1.5 rounded-lg hover:bg-white/[0.08] text-slate-400 hover:text-blue-400 transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteId(tg.tagID)}
                    className="p-1.5 rounded-lg hover:bg-white/[0.08] text-slate-400 hover:text-rose-400 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal Create / Edit */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
            <div className="card max-w-md w-full p-6 sm:p-8 relative border-white/[0.14] shadow-2xl modal-content">
              <h2 className="text-2xl font-bold text-white mb-4">
                {editingTag ? "Edit Tag" : "Create New Tag"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">Tag Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.tagName}
                    onChange={(e) => setFormData({ ...formData, tagName: e.target.value })}
                    placeholder="e.g. Bug, Feature, Urgent"
                    className="input"
                  />
                </div>

                <div>
                  <label className="label">Badge Color</label>
                  <div className="flex items-center gap-3 mb-3">
                    <input
                      type="color"
                      value={formData.color || "#6366f1"}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-10 h-10 rounded-xl bg-transparent border-0 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.color || "#6366f1"}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="input font-mono uppercase"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {PRESET_COLORS.map((c) => (
                      <button
                        type="button"
                        key={c}
                        onClick={() => setFormData({ ...formData, color: c })}
                        className={`w-7 h-7 rounded-full border-2 transition-transform ${
                          formData.color === c ? "border-white scale-110 shadow-md" : "border-transparent"
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-white/[0.03] border border-white/[0.06] rounded-2xl flex items-center gap-2">
                  <span className="text-xs text-slate-400">Preview:</span>
                  <TagBadge tag={{ tagID: 0, tagName: formData.tagName || "Preview", color: formData.color }} />
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
                    {submitting ? "Saving..." : editingTag ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Confirm Delete */}
        <ConfirmModal
          open={deleteId !== null}
          title="Delete Tag"
          message="Are you sure you want to delete this tag? Deletion will fail if any tasks are currently using it."
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
          loading={deleting}
        />
      </div>
    </AuthGuard>
  );
}
