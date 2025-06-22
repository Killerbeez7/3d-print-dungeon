import { useState, useEffect } from "react";
import { collection, query, getDocs } from "firebase/firestore";
import { db } from "@/config/firebase";
import { grantRole, revokeRole } from "@/services/adminService";
import { Spinner } from "@/components/shared/spinner";

import { MdEdit, MdCheck, MdClose } from "react-icons/md";

const ALL_ROLES = ["admin", "moderator", "contributor", "premium"];

export const UserManagement = () => {
    /* ─────────────── internal state ─────────────── */
    const [users, setUsers] = useState([]); // table rows
    const [loading, setLoading] = useState(true);
    const [editingUser, setEditingUser] = useState(null); // {id, roles:[]}
    const [searchQuery, setSearchQuery] = useState("");

    /* ─────────────── initial load ─────────────── */
    useEffect(() => {
        (async () => {
            try {
                const q = query(collection(db, "users")); // TODO: add pagination
                const docs = await getDocs(q);
                const result = docs.docs.map((d) => ({ id: d.id, ...d.data() }));
                setUsers(result);
            } catch (err) {
                console.error("Fetch users failed", err);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    /* ─────────────── edit helpers ─────────────── */
    const startEdit = (u) => setEditingUser({ id: u.id, roles: [...(u.roles || [])] });

    const toggleRole = (role) =>
        setEditingUser((prev) => {
            if (!prev) return prev;
            const has = prev.roles.includes(role);
            return {
                ...prev,
                roles: has ? prev.roles.filter((r) => r !== role) : [...prev.roles, role],
            };
        });

    /* ─────────────── save / persist ─────────────── */
    const handleSave = async () => {
        if (!editingUser) return;

        const original = users.find((u) => u.id === editingUser.id) || { roles: [] };
        const origRoles = original.roles || [];
        const newRoles = editingUser.roles || [];

        try {
            setLoading(true);
            const toAdd = newRoles.filter((r) => !origRoles.includes(r));
            const toRemove = origRoles.filter((r) => !newRoles.includes(r));

            // Call cloud function for each change
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

            // Update local list
            setUsers((prev) =>
                prev.map((u) =>
                    u.id === editingUser.id ? { ...u, roles: editingUser.roles } : u
                )
            );

            // Clear edit state
            setEditingUser(null);
        } catch (err) {
            console.error("Failed to save user roles:", err);
            alert(err.message || "Failed to update roles. Check console for details.");
        } finally {
            setLoading(false);
        }
    };

    /* ─────────────── search filter ─────────────── */
    const q = searchQuery.toLowerCase();
    const filtered = users.filter(
        (u) =>
            u.displayName?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
    );

    /* ─────────────── render ─────────────── */
    return (
        <div className="space-y-6">
            {/* search */}
            <input
                type="text"
                placeholder="Search users…"
                className="w-full px-4 py-2 rounded-lg bg-bg-secondary text-txt-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />

            {/* table */}
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
                                    {/* user + avatar */}
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

                                    {/* e-mail */}
                                    <td className="px-6 py-4 text-sm text-txt-secondary">
                                        {u.email}
                                    </td>

                                    {/* roles */}
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

                                    {/* actions */}
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
