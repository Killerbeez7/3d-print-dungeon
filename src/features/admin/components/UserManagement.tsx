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
    return <Spinner />;
  }

  return (
    <div>
      <input
        type="text"
        placeholder="Search users…"
        className="w-full px-4 py-2 rounded-lg bg-bg-secondary text-txt-primary"
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.target.value)}
      />

      <div>
        <div>
          {["User", "Email", "Roles", "Actions"].map((heading) => (
            <span key={heading}>{heading}</span>
          ))}
        </div>

        {filteredUsers.map((user) => {
          const isEditing = editingUser?.id === user.id;

          const roles = isEditing ? editingUser.roles : user.roles ?? [];

          return (
            <div key={user.id}>
              <div>
                <img
                  className="h-8 w-8 rounded-full"
                  src={user.photoURL || "/default-avatar.png"}
                  alt=""
                />

                <span>{user.displayName || "Anonymous"}</span>
              </div>

              <span>{user.email}</span>

              <div>
                {isEditing ? (
                  <>
                    {MANAGEABLE_ROLES.map((role) => (
                      <button
                        type="button"
                        key={role}
                        onClick={() => toggleRole(role)}
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          roles.includes(role)
                            ? "bg-accent text-white"
                            : "bg-bg-secondary text-txt-secondary"
                        }`}
                      >
                        {role}
                      </button>
                    ))}

                    {roles.includes("superadmin") && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium">
                        superadmin
                      </span>
                    )}
                  </>
                ) : (
                  roles.map((role) => <span key={role}>{role}</span>)
                )}
              </div>

              <div>
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
                        <MdCheck />
                      </button>

                      <button
                        type="button"
                        onClick={() => setEditingUser(null)}
                        className="text-red-500 hover:text-red-600"
                        aria-label="Cancel editing"
                      >
                        <MdClose />
                      </button>
                    </>
                  )
                ) : (
                  <button
                    type="button"
                    onClick={() => startEdit(user)}
                    className="text-accent hover:text-accent-hover"
                    aria-label="Edit roles"
                  >
                    <MdEdit />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
