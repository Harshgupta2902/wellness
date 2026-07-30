"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Users, UserPlus, Building2, Shield, User, X } from "lucide-react";
import { createUser, getUsers } from "@/actions/users";
import { getOrganizations } from "@/actions/organizations";
import type { Organization } from "@/lib/supabase/types";
import type { UserRole } from "@/lib/supabase/types";
import AuthGuard from "@/components/AuthGuard";
import Header from "@/components/Header";

interface UserInfo {
  id: string;
  email: string;
  role: UserRole;
  organizationId: string | null;
}

export default function UsersPage() {
  return (
    <AuthGuard allowedRoles={["super_admin"]}>
      {(session) => <UsersContent email={session.email} />}
    </AuthGuard>
  );
}

function UsersContent({ email }: { email: string }) {
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Form
  const [showForm, setShowForm] = useState(false);
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("Wellness@12345");
  const [formRole, setFormRole] = useState<UserRole>("employee");
  const [formOrgId, setFormOrgId] = useState("");
  const [formName, setFormName] = useState("");
  const [formDepartment, setFormDepartment] = useState("");
  const [formDesignation, setFormDesignation] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    async function load() {
      const [usersResult, orgsResult] = await Promise.all([getUsers(), getOrganizations()]);
      if (usersResult.success && usersResult.data) setUsers(usersResult.data);
      if (orgsResult.success && orgsResult.data) setOrganizations(orgsResult.data);
      setLoading(false);
    }
    load();
  }, []);

  const notify = (text: string, type: "success" | "error" = "success") => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEmail || !formPassword) return;
    if (formRole !== "super_admin" && !formOrgId) {
      notify("Select an organization", "error");
      return;
    }

    setCreating(true);
    const result = await createUser({
      email: formEmail,
      password: formPassword,
      role: formRole,
      organizationId: formOrgId || undefined,
      name: formName || undefined,
      department: formDepartment || undefined,
      designation: formDesignation || undefined,
    });

    if (result.success) {
      notify(`${formRole === "org_admin" ? "Org Admin" : "Employee"} created: ${formEmail}`);
      setFormEmail("");
      setFormName("");
      setFormDepartment("");
      setFormDesignation("");
      setShowForm(false);
      // Refresh users
      const usersResult = await getUsers();
      if (usersResult.success && usersResult.data) setUsers(usersResult.data);
    } else {
      notify(result.message, "error");
    }
    setCreating(false);
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case "super_admin": return <Shield className="w-3.5 h-3.5 text-[#022932]" />;
      case "org_admin": return <Building2 className="w-3.5 h-3.5 text-[#2a787c]" />;
      default: return <User className="w-3.5 h-3.5 text-[#5b7a80]" />;
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case "super_admin": return "bg-[#022932] text-white";
      case "org_admin": return "bg-[#2a787c]/10 text-[#2a787c]";
      default: return "bg-[#f0f7f8] text-[#5b7a80]";
    }
  };

  const getOrgName = (orgId: string | null) => {
    if (!orgId) return "—";
    return organizations.find((o) => o.id === orgId)?.name || "Unknown";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f9fafb] flex items-center justify-center">
        <Image src="/logo.png" alt="Loading" width={32} height={32} className="animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      <Header email={email} role="super_admin" />

      {/* Toast */}
      {toast && (
        <div className={`fixed top-16 right-6 z-50 px-4 py-2.5 rounded-xl text-sm font-medium shadow-lg ${
          toast.type === "success" ? "bg-[#022932] text-white" : "bg-red-600 text-white"
        }`}>
          {toast.text}
        </div>
      )}

      <main className="max-w-6xl mx-auto px-6 py-6 page-enter">
        <Link href="/admin" className="inline-flex items-center gap-1.5 text-sm text-[#5b7a80] hover:text-[#022932] transition-colors mb-5">
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Dashboard
        </Link>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-[#022932] flex items-center gap-2">
              <Users className="w-5 h-5 text-[#2a787c]" />
              Users
            </h1>
            <p className="text-sm text-[#5b7a80] mt-0.5">{users.length} total users</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary !py-2 !px-4 text-sm flex items-center gap-2"
          >
            {showForm ? <X className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
            {showForm ? "Cancel" : "Create User"}
          </button>
        </div>

        {/* Create User Form */}
        {showForm && (
          <div className="bg-white rounded-xl p-6 border border-[#d4e0e3] card-shadow mb-6">
            <h3 className="text-sm font-bold text-[#022932] mb-4">Create New User</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#022932] mb-1">Email *</label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="input-field text-sm"
                    placeholder="user@company.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#022932] mb-1">Password *</label>
                  <input
                    type="text"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    className="input-field text-sm"
                    placeholder="Initial password"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#022932] mb-1">Role *</label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as UserRole)}
                    className="input-field text-sm"
                  >
                    <option value="employee">Employee</option>
                    <option value="org_admin">Organization Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#022932] mb-1">
                    Organization {formRole !== "super_admin" ? "*" : ""}
                  </label>
                  <select
                    value={formOrgId}
                    onChange={(e) => setFormOrgId(e.target.value)}
                    className="input-field text-sm"
                    required={formRole !== "super_admin"}
                  >
                    <option value="">Select organization</option>
                    {organizations.map((org) => (
                      <option key={org.id} value={org.id}>{org.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {formRole === "employee" && (
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#022932] mb-1">Name</label>
                    <input
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="input-field text-sm"
                      placeholder="Full name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#022932] mb-1">Department</label>
                    <input
                      type="text"
                      value={formDepartment}
                      onChange={(e) => setFormDepartment(e.target.value)}
                      className="input-field text-sm"
                      placeholder="Engineering"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#022932] mb-1">Designation</label>
                    <input
                      type="text"
                      value={formDesignation}
                      onChange={(e) => setFormDesignation(e.target.value)}
                      className="input-field text-sm"
                      placeholder="Developer"
                    />
                  </div>
                </div>
              )}

              <button type="submit" disabled={creating} className="btn-primary !py-2.5 text-sm w-full">
                {creating ? "Creating..." : "Create User"}
              </button>

              <p className="text-[10px] text-[#8ba5aa] text-center">
                User will login with their email and the password you set above.
              </p>
            </form>
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white rounded-xl border border-[#d4e0e3] card-shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#d4e0e3] bg-[#f5fafa]">
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#5b7a80] uppercase tracking-wide">Email</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#5b7a80] uppercase tracking-wide">Role</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#5b7a80] uppercase tracking-wide">Organization</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f7f8]">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-[#fafcfc]">
                  <td className="px-4 py-3 font-medium text-[#022932]">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold ${getRoleBadge(user.role)}`}>
                      {getRoleIcon(user.role)}
                      {user.role.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#5b7a80]">{getOrgName(user.organizationId)}</td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-[#8ba5aa]">No users found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
