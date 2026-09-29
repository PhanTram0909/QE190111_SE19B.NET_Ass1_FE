"use client";

import { useEffect, useState } from "react";
import { tagApi } from "@/lib/api";
import { Tag, TagCreateDto, TagUpdateDto } from "@/lib/types";
import LoadingSpinner from "@/components/LoadingSpinner";
import TagBadge from "@/components/TagBadge";
import ConfirmModal from "@/components/ConfirmModal";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, Tag as TagIcon, Search, Palette } from "lucide-react";

const PRESET_COLORS = [
  "#ef4444", "#f97316", "#f59e0b", "#10b981", "#06b6d4",
  "#3b82f6", "#6366f1", "#8b5cf6", "#ec4899", "#64748b"
];

export default function ManageTagsPage() {
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
      const data = await tagApi.getAllTags();
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
        await tagApi.updateTag(editingTag.tagID, formData as TagUpdateDto);
        toast.success("Tag updated successfully");
      } else {
        await tagApi.createTag(formData);
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
      await tagApi.deleteTag(deleteId);
      toast.success("Tag deleted successfully");
      setDeleteId(null);
      fetchTags();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete tag");
    } finally {
      setDeleting(false);
    }
  };

  const filtered = tags.filter((t) => t.tagName.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
              <TagIcon className="w-5 h-5" />
            </div>
            <h1 className="text-3xl font-bold text-slate-100">Manage Tags</h1>
          </div>
          <p className="text-slate-400 text-sm mt-1">Create and manage custom labels for task categorization</p>
        </div>
        <button onClick={openCreateModal} className="btn-primary flex items-center gap-2 self-start md:self-auto">
          <Plus className="w-4 h-4" /> Add Tag
        </button>
      </div>

      {/* Search */}
      <div className="card p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner text="Loading tags..." />
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center text-slate-400">No tags found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((tg) => (
            <div
              key={tg.tagID}
              className="card p-4 flex items-center justify-between hover:border-slate-700 transition-all"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
                  style={{ backgroundColor: tg.color || "#6366f1" }}
                />
                <div>
                  <h3 className="font-semibold text-slate-200 text-sm">{tg.tagName}</h3>
                  <span className="font-mono text-xs text-slate-500">{tg.color || "#6366f1"}</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEditModal(tg)}
                  className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-indigo-400 transition-colors"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteId(tg.tagID)}
                  className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="card max-w-md w-full p-6 relative border-slate-700 shadow-2xl">
            <h2 className="text-xl font-bold text-slate-100 mb-4">
              {editingTag ? "Edit Tag" : "Create New Tag"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Tag Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.tagName}
                  onChange={(e) => setFormData({ ...formData, tagName: e.target.value })}
                  placeholder="e.g. Bug, Feature, Urgent"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">Tag Color</label>
                <div className="flex items-center gap-3 mb-3">
                  <input
                    type="color"
                    value={formData.color || "#6366f1"}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-10 h-10 rounded-lg bg-transparent border border-slate-700 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.color || ""}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    placeholder="#6366f1"
                    className="input-field font-mono"
                  />
                </div>

                {/* Preset swatch picker */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {PRESET_COLORS.map((hex) => (
                    <button
                      key={hex}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: hex })}
                      className={`w-6 h-6 rounded-full border transition-transform ${
                        formData.color === hex ? "scale-125 border-white ring-2 ring-indigo-500" : "border-transparent hover:scale-110"
                      }`}
                      style={{ backgroundColor: hex }}
                    />
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="pt-2">
                <span className="block text-xs font-medium text-slate-400 mb-1">Preview:</span>
                <TagBadge tag={{ tagID: 0, tagName: formData.tagName || "Preview Tag", color: formData.color }} />
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
                  {submitting ? "Saving..." : editingTag ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        open={deleteId !== null}
        title="Delete Tag"
        message="Are you sure you want to delete this tag? If it is currently assigned to tasks, deletion may fail."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        loading={deleting}
      />
    </div>
  );
}
