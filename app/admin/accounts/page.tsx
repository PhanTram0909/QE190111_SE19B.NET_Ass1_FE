"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import { accountApi, authStorage } from "@/lib/api";
import { SystemAccount, AccountUpdateDto } from "@/lib/types";
import LoadingSpinner from "@/components/LoadingSpinner";
import ConfirmModal from "@/components/ConfirmModal";
import { toast } from "sonner";
import {
  Users, Edit2, Trash2, Search, ArrowLeft, Shield,
  User, CheckCircle2, AlertCircle, Lock, Calendar
} from "lucide-react";

export default function AdminAccountsPage() {
  const [accounts, setAccounts] = useState<SystemAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const currentLoggedInUser = authStorage.getUser();

  // Edit modal
  const [editingAccount, setEditingAccount] = useState<SystemAccount | null>(null);
  const [editFormData, setEditFormData] = useState<AccountUpdateDto>({
    fullName: "",
    role: 0,
  });
  const [submitting, setSubmitting] = useState(false);

  // Delete modal
  const [deleteAccount, setDeleteAccount] = useState<SystemAccount | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const data = await accountApi.getAll();
      setAccounts(data);
    } catch (err: any) {
      toast.error(err.message || "Failed to load system accounts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const openEditModal = (acc: SystemAccount) => {
    setEditingAccount(acc);
    setEditFormData({
      fullName: acc.fullName,
      role: acc.role,
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAccount) return;

    if (!editFormData.fullName.trim()) {
      toast.error("Full Name cannot be empty.");
      return;
    }

    try {
      setSubmitting(true);
      await accountApi.update(editingAccount.accountID, editFormData);
      toast.success(`Account #${editingAccount.accountID} updated successfully.`);
      setEditingAccount(null);
      fetchAccounts();
    } catch (err: any) {
      toast.error(err.message || "Failed to update account.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteAccount) return;

    // Prevent self-deletion
    if (currentLoggedInUser?.accountID === deleteAccount.accountID) {
      toast.error("Security policy: You cannot delete your own active account.");
      setDeleteAccount(null);
      return;
    }

    try {
      setDeleting(true);
      await accountApi.delete(deleteAccount.accountID);
      toast.success(`Account ${deleteAccount.fullName} deleted successfully.`);
      setDeleteAccount(null);
      fetchAccounts();
    } catch (err: any) {
      // Catch task-linked rejection (HTTP 400)
      toast.error(err.message || "Cannot delete account because it has created tasks.");
    } finally {
      setDeleting(false);
    }
  };

  const filtered = accounts.filter(
    (a) =>
      a.fullName.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AuthGuard adminOnly={true}>
      <div className="space-y-6 animate-fade-in pb-12">
        {/* Navigation Breadcrumb */}
        <Link href="/admin" className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-xs font-semibold transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Console
        </Link>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/15 border border-purple-500/25 flex items-center justify-center text-purple-400 shadow-md">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold uppercase tracking-wider mb-1 border border-purple-500/30">
                  <Lock className="w-3 h-3" /> Admin Exclusive
                </div>
                <h1 className="text-3xl font-extrabold text-white tracking-tight">System Accounts</h1>
              </div>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              Audit registered operators, promote or demote roles, and manage user lifecycles
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="card p-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search accounts by name or email address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
            />
          </div>
        </div>

        {/* Accounts Table */}
        {loading ? (
          <LoadingSpinner text="Retrieving system accounts..." />
        ) : filtered.length === 0 ? (
          <div className="card p-12 text-center text-slate-400">No accounts match your criteria.</div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Account</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Registered</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((acc) => {
                  const isCurrent = currentLoggedInUser?.accountID === acc.accountID;
                  return (
                    <tr key={acc.accountID} className={isCurrent ? "bg-purple-500/[0.04]" : ""}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm ${
                            acc.role === 1 ? "bg-gradient-to-tr from-purple-600 to-indigo-600" : "bg-gradient-to-tr from-blue-600 to-cyan-600"
                          }`}>
                            {acc.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-white flex items-center gap-2">
                              {acc.fullName}
                              {isCurrent && (
                                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="font-mono text-[10px] text-slate-400">ID: #{acc.accountID}</div>
                          </div>
                        </div>
                      </td>
                      <td className="text-slate-300 font-mono text-xs">{acc.email}</td>
                      <td>
                        {acc.role === 1 ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                            <Shield className="w-3 h-3" /> Administrator
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/30">
                            <User className="w-3 h-3" /> Staff
                          </span>
                        )}
                      </td>
                      <td className="text-xs text-slate-400 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          {acc.createdDate ? new Date(acc.createdDate).toLocaleDateString() : "—"}
                        </div>
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(acc)}
                            className="p-2 rounded-xl hover:bg-white/[0.08] text-slate-400 hover:text-blue-400 transition-colors"
                            title="Edit Role / Name"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteAccount(acc)}
                            disabled={isCurrent}
                            className={`p-2 rounded-xl transition-colors ${
                              isCurrent
                                ? "text-slate-600 cursor-not-allowed"
                                : "hover:bg-white/[0.08] text-slate-400 hover:text-rose-400"
                            }`}
                            title={isCurrent ? "Cannot delete own account" : "Delete Account"}
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

        {/* Edit Account Modal */}
        {editingAccount && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
            <div className="card max-w-md w-full p-6 sm:p-8 relative border-white/[0.14] shadow-2xl modal-content">
              <h2 className="text-2xl font-bold text-white mb-2">
                Edit System Account
              </h2>
              <p className="text-xs text-slate-400 mb-5 font-mono">
                {editingAccount.email} (ID #{editingAccount.accountID})
              </p>

              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="label">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={editFormData.fullName}
                    onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                    className="input"
                  />
                </div>

                <div>
                  <label className="label">System Role</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setEditFormData({ ...editFormData, role: 0 })}
                      className={`p-3 rounded-2xl border text-xs font-semibold text-center transition-all ${
                        editFormData.role === 0
                          ? "bg-blue-600/30 border-blue-500 text-blue-200 shadow-md"
                          : "bg-white/[0.04] border-white/[0.08] text-slate-400 hover:text-white"
                      }`}
                    >
                      <User className="w-4 h-4 mx-auto mb-1 text-blue-400" />
                      Staff Member
                    </button>

                    <button
                      type="button"
                      onClick={() => setEditFormData({ ...editFormData, role: 1 })}
                      className={`p-3 rounded-2xl border text-xs font-semibold text-center transition-all ${
                        editFormData.role === 1
                          ? "bg-purple-600/30 border-purple-500 text-purple-200 shadow-md"
                          : "bg-white/[0.04] border-white/[0.08] text-slate-400 hover:text-white"
                      }`}
                    >
                      <Shield className="w-4 h-4 mx-auto mb-1 text-purple-400" />
                      Administrator
                    </button>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.08]">
                  <button
                    type="button"
                    onClick={() => setEditingAccount(null)}
                    className="btn-secondary"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" disabled={submitting}>
                    {submitting ? "Updating..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirm Modal */}
        <ConfirmModal
          open={deleteAccount !== null}
          title="Delete Account"
          message={`Are you sure you want to delete ${deleteAccount?.fullName}? Note: Deletion will be rejected by the server if this user has created any tasks.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteAccount(null)}
          loading={deleting}
        />
      </div>
    </AuthGuard>
  );
}
