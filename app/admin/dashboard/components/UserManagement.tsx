// app/admin/dashboard/components/UserManagement.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Edit,
  Trash2,
  Search,
  Loader2,
  AlertCircle,
  Check,
  X,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Shield,
  Mail,
  Calendar,
  UserCircle,
} from "lucide-react";

type UserRole = "USER" | "AGENT" | "ADMIN";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  emailVerified: string | null;
  image: string | null;
  createdAt: string;
  updatedAt: string;
}

const roleColors = {
  USER: {
    bg: "bg-blue-100",
    text: "text-blue-700",
    border: "border-blue-300",
  },
  AGENT: {
    bg: "bg-purple-100",
    text: "text-purple-700",
    border: "border-purple-300",
  },
  ADMIN: {
    bg: "bg-red-100",
    text: "text-red-700",
    border: "border-red-300",
  },
};

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<User>>({});

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error("Failed to load users");
      const json = await res.json();
      setUsers(json.users || []);
    } catch (err) {
      console.error(err);
      alert("Error loading users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUserId(user.id);
    setEditForm({ ...user });
    setExpandedRow(user.id);
  };

  const handleSave = async () => {
    if (!editingUserId) return;

    try {
      const res = await fetch(`/api/users/${editingUserId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editForm.name,
          role: editForm.role,
        }),
      });

      if (res.ok) {
        await fetchUsers();
        setEditingUserId(null);
        setEditForm({});
        setExpandedRow(null);
      } else {
        alert("Update failed");
      }
    } catch {
      alert("Update failed");
    }
  };

  const handleCancel = () => {
    setEditingUserId(null);
    setEditForm({});
    setExpandedRow(null);
  };

  const handleDelete = async (userId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this user? This action cannot be undone.",
      )
    )
      return;

    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== userId));
      } else {
        alert("Delete failed");
      }
    } catch {
      alert("Delete failed");
    }
  };

  const handleViewToggle = (userId: string) => {
    setExpandedRow(expandedRow === userId ? null : userId);
  };

  const filteredUsers = users.filter((user) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      user.email?.toLowerCase().includes(query) ||
      user.name?.toLowerCase().includes(query) ||
      user.role?.toLowerCase().includes(query)
    );
  });

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20 mb-6 -mt-4 sm:-mt-6 lg:-mt-8 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
        <div className="py-4 sm:py-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            {/* Title */}
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-2 sm:p-2.5 rounded-xl shadow-lg">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                  User Management
                </h1>
                <p className="text-xs sm:text-sm text-gray-500">
                  {searchQuery
                    ? `${filteredUsers.length} of ${users.length}`
                    : users.length}{" "}
                  user{users.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            {/* Search + Refresh */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full lg:w-auto">
              <div className="relative flex-1 lg:flex-none lg:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg
                           focus:outline-none focus:ring-2 focus:ring-indigo-500 
                           focus:border-transparent text-sm bg-gray-50 focus:bg-white"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <button
                onClick={fetchUsers}
                disabled={loading}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 
                         border border-gray-200 text-gray-600 rounded-lg text-sm font-medium
                         hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
          <p className="text-gray-600 mt-3 text-sm">Loading users...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="bg-indigo-50 w-14 h-14 rounded-full mx-auto flex items-center justify-center mb-4">
            <AlertCircle className="w-7 h-7 text-indigo-600" />
          </div>
          <h3 className="text-base font-semibold text-gray-800 mb-1">
            {searchQuery ? "No matching users" : "No users found"}
          </h3>
          <p className="text-gray-500 text-sm">
            {searchQuery
              ? "Try adjusting your search query"
              : "No users in the system yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredUsers.map((user) => {
            const isExpanded = expandedRow === user.id;
            const isEditing = editingUserId === user.id;
            const roleColor = roleColors[user.role];

            return (
              <div
                key={user.id}
                className={`bg-white rounded-xl shadow-sm border overflow-hidden transition-all
                  ${
                    isExpanded
                      ? "border-indigo-300 border-2 shadow-md"
                      : "border-gray-100 hover:border-gray-200 hover:shadow"
                  }`}
              >
                {/* Collapsed View */}
                {!isExpanded && (
                  <div className="p-4 sm:p-5">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-4">
                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-2">
                          {/* Avatar + Name */}
                          <div className="flex items-center gap-3 sm:col-span-2 lg:col-span-1">
                            {user.image ? (
                              <img
                                src={user.image}
                                alt={user.name || "User"}
                                className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                                {user.name?.[0]?.toUpperCase() ||
                                  user.email[0].toUpperCase()}
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">
                                {user.name || "No name"}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                {user.email}
                              </p>
                            </div>
                          </div>

                          {/* Role */}
                          <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                              Role
                            </p>
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
                              ${roleColor.bg} ${roleColor.text}`}
                            >
                              <Shield className="w-3 h-3" />
                              {user.role}
                            </span>
                          </div>

                          {/* Email Verified */}
                          <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                              Verified
                            </p>
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
                              ${
                                user.emailVerified
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              {user.emailVerified ? (
                                <Check className="w-3 h-3" />
                              ) : (
                                <X className="w-3 h-3" />
                              )}
                              {user.emailVerified ? "Yes" : "No"}
                            </span>
                          </div>

                          {/* Created Date */}
                          <div className="hidden lg:block">
                            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                              Joined
                            </p>
                            <p className="text-sm font-medium text-gray-800">
                              {formatDate(user.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between lg:justify-end gap-2 pt-2 lg:pt-0 border-t lg:border-0 border-gray-100">
                        <button
                          onClick={() => handleViewToggle(user.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                                   text-sm font-medium bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                        >
                          <ChevronDown className="w-4 h-4" />
                          <span>View</span>
                        </button>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleEdit(user)}
                            className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Expanded View */}
                {isExpanded && (
                  <div>
                    {/* Header Bar */}
                    <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 px-5 py-3 flex items-center justify-between">
                      <button
                        onClick={() => handleViewToggle(user.id)}
                        className="inline-flex items-center gap-1.5 text-white/90 hover:text-white text-sm font-medium"
                      >
                        <ChevronUp className="w-4 h-4" />
                        <span>Collapse</span>
                      </button>

                      <div className="flex items-center gap-2">
                        {isEditing ? (
                          <>
                            <button
                              onClick={handleSave}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 
                                       bg-white text-green-600 rounded-lg text-sm font-medium hover:bg-green-50"
                            >
                              <Check className="w-4 h-4" />
                              <span>Save</span>
                            </button>
                            <button
                              onClick={handleCancel}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 
                                       bg-white/20 text-white rounded-lg text-sm font-medium hover:bg-white/30"
                            >
                              <X className="w-4 h-4" />
                              <span>Cancel</span>
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEdit(user)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 
                                       bg-white text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50"
                            >
                              <Edit className="w-4 h-4" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => handleDelete(user.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 
                                       bg-white/20 text-white rounded-lg text-sm font-medium hover:bg-white/30"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>Delete</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="p-5 lg:p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {/* User ID */}
                        <div>
                          <div className="flex items-center gap-1.5 mb-2">
                            <p className="text-xs font-semibold text-gray-500 uppercase">
                              User ID
                            </p>
                            <span className="text-xs px-1.5 py-0.5 bg-gray-200 text-gray-600 rounded font-bold">
                              READ-ONLY
                            </span>
                          </div>
                          <p className="text-sm text-gray-800 font-mono bg-gray-100 px-3 py-2 rounded-lg break-all">
                            {user.id}
                          </p>
                        </div>

                        {/* Email */}
                        <div>
                          <div className="flex items-center gap-1.5 mb-2">
                            <Mail className="w-3.5 h-3.5 text-gray-500" />
                            <p className="text-xs font-semibold text-gray-500 uppercase">
                              Email
                            </p>
                            <span className="text-xs px-1.5 py-0.5 bg-gray-200 text-gray-600 rounded font-bold">
                              READ-ONLY
                            </span>
                          </div>
                          <p className="text-sm text-gray-800 break-all">
                            {user.email}
                          </p>
                        </div>

                        {/* Name */}
                        <div>
                          <div className="flex items-center gap-1.5 mb-2">
                            <UserCircle className="w-3.5 h-3.5 text-gray-500" />
                            <p className="text-xs font-semibold text-gray-500 uppercase">
                              Name
                            </p>
                          </div>
                          {isEditing ? (
                            <input
                              type="text"
                              value={editForm.name || ""}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  name: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg
                                       focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                              placeholder="Enter name"
                            />
                          ) : (
                            <p className="text-sm text-gray-800">
                              {user.name || "—"}
                            </p>
                          )}
                        </div>

                        {/* Role */}
                        <div>
                          <div className="flex items-center gap-1.5 mb-2">
                            <Shield className="w-3.5 h-3.5 text-gray-500" />
                            <p className="text-xs font-semibold text-gray-500 uppercase">
                              Role
                            </p>
                          </div>
                          {isEditing ? (
                            <select
                              value={editForm.role || "USER"}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  role: e.target.value as UserRole,
                                })
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg
                                       focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                            >
                              <option value="USER">USER</option>
                              <option value="AGENT">AGENT</option>
                              <option value="ADMIN">ADMIN</option>
                            </select>
                          ) : (
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
                              ${roleColor.bg} ${roleColor.text}`}
                            >
                              <Shield className="w-4 h-4" />
                              {user.role}
                            </span>
                          )}
                        </div>

                        {/* Email Verified */}
                        <div>
                          <div className="flex items-center gap-1.5 mb-2">
                            <Check className="w-3.5 h-3.5 text-gray-500" />
                            <p className="text-xs font-semibold text-gray-500 uppercase">
                              Email Verified
                            </p>
                          </div>
                          <p className="text-sm text-gray-800">
                            {user.emailVerified
                              ? formatDate(user.emailVerified)
                              : "Not verified"}
                          </p>
                        </div>

                        {/* Created At */}
                        <div>
                          <div className="flex items-center gap-1.5 mb-2">
                            <Calendar className="w-3.5 h-3.5 text-gray-500" />
                            <p className="text-xs font-semibold text-gray-500 uppercase">
                              Created
                            </p>
                          </div>
                          <p className="text-sm text-gray-800">
                            {formatDate(user.createdAt)}
                          </p>
                        </div>

                        {/* Updated At */}
                        <div>
                          <div className="flex items-center gap-1.5 mb-2">
                            <Calendar className="w-3.5 h-3.5 text-gray-500" />
                            <p className="text-xs font-semibold text-gray-500 uppercase">
                              Updated
                            </p>
                          </div>
                          <p className="text-sm text-gray-800">
                            {formatDate(user.updatedAt)}
                          </p>
                        </div>

                        {/* Profile Image */}
                        <div className="md:col-span-2">
                          <div className="flex items-center gap-1.5 mb-2">
                            <UserCircle className="w-3.5 h-3.5 text-gray-500" />
                            <p className="text-xs font-semibold text-gray-500 uppercase">
                              Profile Image
                            </p>
                          </div>
                          {user.image && (
                            <button
                              onClick={() => window.open(user.image!, "_blank")}
                              className="text-sm text-indigo-600 underline"
                            >
                              <div className="flex items-center gap-3">
                                <img
                                  src={user.image}
                                  alt={user.name || "User"}
                                  className="w-16 h-16 rounded-lg object-cover border-2 border-gray-200"
                                />
                              </div>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
