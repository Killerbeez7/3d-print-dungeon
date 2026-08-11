import { useState, useEffect } from "react";
import { MdCheck, MdEdit, MdClose } from "react-icons/md";

import { grantRole, revokeRole } from "@/features/admin/services/adminService";

import {
  fetchAllUsersForAdmin,
  type AdminUserRow,
} from "@/features/admin/services/userManagementService";

import type { Role } from "@/features/auth/types/permissions";

import { Spinner } from "@/features/shared/reusable/Spinner";

const MANAGEABLE_ROLES = [
  "user",
  "artist",
  "moderator",
  "admin",
] as const satisfies readonly Role[];

const ALL_ROLES = [
  "user",
  "artist",
  "moderator",
  "admin",
  "superadmin",
] as const satisfies readonly Role[];

const ROLE_CLASSES: Record<Role, string> = {
  user: "bg-slate-500/15 text-slate-300",
  artist: "bg-violet-500/15 text-violet-300",
  moderator: "bg-blue-500/15 text-blue-300",
  admin: "bg-red-500/15 text-red-300",
  superadmin: "bg-amber-500/15 text-amber-300",
};

const isRole = (value: string): value is Role => ALL_ROLES.some((role) => role === value);

export interface UserRow extends Omit<AdminUserRow, "roles"> {
  roles?: Role[];
}

interface EditingUser {
  id: string;
  roles: Role[];
}

export const UserManagement = () => {
  const [users, setUsers] = useState<UserRow[]>([]);

  const [loading, setLoading] = useState(true);

  const [editingUser, setEditingUser] = useState<EditingUser | null>(null);

  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const adminUsers = await fetchAllUsersForAdmin();

        const result: UserRow[] = adminUsers.map((user) => ({
          ...user,
          roles: Array.isArray(user.roles) ? user.roles.filter(isRole) : undefined,
        }));

        setUsers(result);
      } catch (error) {
        console.error("Fetch users failed", error);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const startEdit = (user: UserRow) => {
    setEditingUser({
      id: user.id,
      roles: [...(user.roles ?? [])],
    });
  };

  const toggleRole = (role: Role) => {
    setEditingUser((current) => {
      if (!current) {
        return current;
      }

      const hasRole = current.roles.includes(role);

      return {
        ...current,
        roles: hasRole
          ? current.roles.filter((currentRole) => currentRole !== role)
          : [...current.roles, role],
      };
    });
  };

  const handleSave = async () => {
    if (!editingUser) {
      return;
    }

    const originalUser = users.find((user) => user.id === editingUser.id);

    const originalRoles = originalUser?.roles ?? [];

    const newRoles = editingUser.roles;

    const rolesToAdd = newRoles.filter((role) => !originalRoles.includes(role));

    const rolesToRemove = originalRoles.filter((role) => !newRoles.includes(role));

    try {
      setLoading(true);

      for (const role of rolesToAdd) {
        await grantRole(editingUser.id, role);
      }

      for (const role of rolesToRemove) {
        await revokeRole(editingUser.id, role);
      }

      setUsers((current) =>
        current.map((user) =>
          user.id === editingUser.id
            ? {
                ...user,
                roles: editingUser.roles,
              }
            : user
        )
      );

      setEditingUser(null);
    } catch (error) {
      console.error("Failed to save user roles:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to update roles. Check console for details."
      );
    } finally {
      setLoading(false);
    }
  };

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredUsers = users.filter((user) => {
    if (!normalizedQuery) {
      return true;
    }

    return (
      user.username?.toLowerCase().includes(normalizedQuery) ||
      user.displayName?.toLowerCase().includes(normalizedQuery) ||
      user.email?.toLowerCase().includes(normalizedQuery)
    );
  });

  if (loading && users.length === 0) {
    return (
      <div className="flex min-h-40 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <input
        type="text"
        placeholder="Search users..."
        className="w-full rounded-lg bg-bg-secondary px-4 py-2 text-txt-primary"
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.target.value)}
      />

      <div className="overflow-x-auto">
        <div className="min-w-[700px]">
          {/* Header */}
          <div className="grid grid-cols-[1.25fr_1.5fr_1fr_80px] items-center bg-bg-secondary px-4 py-3 text-xs font-medium uppercase text-txt-secondary">
            <span>User</span>
            <span>Email</span>
            <span>Roles</span>
            <span className="text-center">Actions</span>
          </div>

          {/* Users */}
          <div>
            {filteredUsers.map((user) => {
              const isEditing = editingUser?.id === user.id;

              const roles = isEditing ? editingUser.roles : user.roles ?? [];

              return (
                <div
                  key={user.id}
                  className="grid min-h-14 grid-cols-[1.25fr_1.5fr_1fr_80px] items-center border-b border-br-secondary px-4 py-2"
                >
                  {/* User */}
                  <div className="flex min-w-0 items-center gap-3">
                    <img
                      className="h-8 w-8 shrink-0 rounded-full object-cover"
                      src={user.photoURL || "/default-avatar.png"}
                      alt={user.displayName || user.username || "User"}
                    />

                    <span className="truncate text-sm text-txt-primary">
                      {user.displayName || user.username || "Anonymous"}
                    </span>
                  </div>

                  {/* Email */}
                  <span className="truncate pr-4 text-sm text-txt-secondary">
                    {user.email || "—"}
                  </span>

                  {/* Roles */}
                  <div className="flex flex-wrap items-center gap-1">
                    {isEditing ? (
                      <>
                        {MANAGEABLE_ROLES.map((role) => (
                          <button
                            type="button"
                            key={role}
                            onClick={() => toggleRole(role)}
                            className={`rounded-full px-2 py-1 text-xs font-medium ${
                              roles.includes(role)
                                ? ROLE_CLASSES[role]
                                : "bg-bg-secondary text-txt-secondary"
                            }`}
                          >
                            {role}
                          </button>
                        ))}

                        {roles.includes("superadmin") && (
                          <span className="rounded-full bg-bg-secondary px-2 py-1 text-xs font-medium text-txt-secondary">
                            superadmin
                          </span>
                        )}
                      </>
                    ) : (
                      roles.map((role) => (
                        <span
                          key={role}
                          className={`rounded-full px-2 py-1 text-xs font-medium ${ROLE_CLASSES[role]}`}
                        >
                          {role}
                        </span>
                      ))
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-center gap-2">
                    {isEditing ? (
                      loading ? (
                        <Spinner />
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={handleSave}
                            className="text-accent hover:text-accent-hover"
                            aria-label="Save roles"
                          >
                            <MdCheck className="w-6 h-6" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setEditingUser(null)}
                            className="text-red-500 hover:text-red-600"
                            aria-label="Cancel editing"
                          >
                            <MdClose className="w-6 h-6" />
                          </button>
                        </>
                      )
                    ) : (
                      <button
                        type="button"
                        onClick={() => startEdit(user)}
                        className="text-accent hover:text-accent-hover"
                        aria-label={`Edit roles for ${
                          user.displayName || user.username || "user"
                        }`}
                      >
                        <MdEdit className="w-6 h-6" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
