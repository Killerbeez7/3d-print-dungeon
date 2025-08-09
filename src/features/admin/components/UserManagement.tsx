import { useState, useEffect } from "react";
import { collection, query, getDocs } from "firebase/firestore";
import { db } from "@/config/firebaseConfig";
import { grantRole, revokeRole } from "@/features/admin/services/adminService";
import { Spinner } from "@/features/shared/reusable/Spinner";
import { MdEdit, MdCheck, MdClose } from "react-icons/md";
import type { RawUserData } from "@/features/user/types/user";

const ALL_ROLES = ["admin", "moderator", "contributor", "premium"] as const;
export type Role = (typeof ALL_ROLES)[number];

// Extend RawUserData for admin table rows
export interface UserRow extends Omit<RawUserData, 'roles'> {
    id: string;
    roles?: Role[];
}

interface EditingUser {
    id: string;
    roles: Role[];
}

export const UserManagement = () => {
    const [users, setUsers] = useState<UserRow[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [editingUser, setEditingUser] = useState<EditingUser | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>("");

    useEffect(() => {
        (async () => {
            try {
                const q = query(collection(db, "users"));
                const docs = await getDocs(q);
                const result: UserRow[] = docs.docs.map((d) => {
                    const data = d.data() as RawUserData;
                    // Map roles to Role[] if present
                    const roles = Array.isArray(data.roles)
                        ? data.roles.filter((r): r is Role =>
                              ALL_ROLES.includes(r as Role)
                          )
                        : undefined;
                    return {
                        id: d.id,
                        ...data,
                        roles,
                    };
                });
                setUsers(result);
            } catch (err) {
                console.error("Fetch users failed", err);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const startEdit = (u: UserRow) =>
        setEditingUser({ id: u.id, roles: [...(u.roles || [])] });

    const toggleRole = (role: Role) =>
        setEditingUser((prev) => {
            if (!prev) return prev;
            const has = prev.roles.includes(role);
            return {
                ...prev,
                roles: has ? prev.roles.filter((r) => r !== role) : [...prev.roles, role],
            };
        });

    const handleSave = async () => {
        if (!editingUser) return;
        const original = users.find((u) => u.id === editingUser.id) || { roles: [] };
        const origRoles = original.roles || [];
        const newRoles = editingUser.roles || [];
        try {
            setLoading(true);
            const toAdd = newRoles.filter((r) => !origRoles.includes(r));
            const toRemove = origRoles.filter((r) => !newRoles.includes(r));
            for (const role of toAdd) {
                try {
                    await grantRole(editingUser.id, role);
                    console.debug(`Successfully granted ${role} to ${editingUser.id}`);
                } catch (err) {
                    console.error(`Failed to grant ${role}:`, err);
                    throw err;
                }
            }
            for (const role of toRemove) {
                try {
                    await revokeRole(editingUser.id, role);
                    console.debug(`Successfully revoked ${role} from ${editingUser.id}`);
                } catch (err) {
                    console.error(`Failed to revoke ${role}:`, err);
                    throw err;
                }
            }
            setUsers((prev) =>
                prev.map((u) =>
                    u.id === editingUser.id ? { ...u, roles: editingUser.roles } : u
                )
            );
            setEditingUser(null);
        } catch (err) {
            console.error("Failed to save user roles:", err);
            alert(
                (err as Error).message ||
                    "Failed to update roles. Check console for details."
            );
        } finally {
            setLoading(false);
        }
    };

    const q = searchQuery.toLowerCase();
    const filtered = users.filter(
        (u) =>
            u.username?.toLowerCase().includes(q) ||
            u.displayName?.toLowerCase().includes(q) ||
            u.email?.toLowerCase().includes(q) ||
            ""
    );

    return (
        <div className="space-y-6">
            <input
                type="text"
                placeholder="Search users…"
                className="w-full px-4 py-2 rounded-lg bg-bg-secondary text-txt-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-br-secondary">
                    <thead className="bg-bg-secondary">
                        <tr>
                            {["User", "Email", "Roles", "Actions"].map((h) => (
                                <th
                                    key={h}
                                    className="px-6 py-3 text-left text-xs font-medium text-txt-secondary uppercase tracking-wider"
                                >
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-br-secondary">
                        {filtered.map((u) => {
                            const isEditing = editingUser?.id === u.id;
                            const roles = isEditing ? editingUser.roles : u.roles || [];
                            return (
                                <tr key={u.id}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <img
                                                className="h-8 w-8 rounded-full"
                                                src={u.photoURL || "/default-avatar.png"}
                                                alt=""
                                            />
                                            <span className="text-sm font-medium">
                                                {u.displayName || "Anonymous"}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-txt-secondary">
                                        {u.email}
                                    </td>
                                    <td className="px-6 py-4">
                                        {isEditing ? (
                                            <div className="flex flex-wrap gap-2">
                                                {ALL_ROLES.map((r) => (
                                                    <button
                                                        key={r}
                                                        onClick={() => toggleRole(r)}
                                                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                            roles.includes(r)
                                                                ? "bg-accent text-white"
                                                                : "bg-bg-secondary text-txt-secondary"
                                                        }`}
                                                    >
                                                        {r}
                                                    </button>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="flex flex-wrap gap-1">
                                                {roles.map((r) => (
                                                    <span
                                                        key={r}
                                                        className="px-2 py-1 rounded-full text-xs font-medium bg-accent/10 text-txt-primary"
                                                    >
                                                        {r}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {isEditing ? (
                                            <span className="flex gap-2 justify-end">
                                                {loading ? (
                                                    <Spinner />
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={handleSave}
                                                            className="text-green-500 hover:text-green-600"
                                                        >
                                                            <MdCheck size={20} />
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                setEditingUser(null)
                                                            }
                                                            className="text-red-500 hover:text-red-600"
                                                        >
                                                            <MdClose size={20} />
                                                        </button>
                                                    </>
                                                )}
                                            </span>
                                        ) : (
                                            <button
                                                onClick={() => startEdit(u)}
                                                className="text-accent hover:text-accent-hover"
                                            >
                                                <MdEdit size={20} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
