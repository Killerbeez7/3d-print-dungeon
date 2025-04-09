import { useState, useEffect } from "react";
import { collection, query, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../../../config/firebase";
import { MdEdit, MdCheck, MdClose } from "react-icons/md";

export const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingUser, setEditingUser] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    // Fetch users from Firestore
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const usersRef = collection(db, "users");
                const q = query(usersRef);
                const querySnapshot = await getDocs(q);
                
                const usersData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                
                setUsers(usersData);
            } catch (error) {
                console.error("Error fetching users:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const handleEditUser = (user) => {
        setEditingUser({
            ...user,
            roles: user.roles || [],
            isAdmin: user.isAdmin || false
        });
    };

    const handleSaveUser = async () => {
        try {
            const userRef = doc(db, "users", editingUser.id);
            await updateDoc(userRef, {
                roles: editingUser.roles,
                isAdmin: editingUser.isAdmin
            });

            setUsers(users.map(user => 
                user.id === editingUser.id 
                    ? { ...user, roles: editingUser.roles, isAdmin: editingUser.isAdmin }
                    : user
            ));

            setEditingUser(null);
        } catch (error) {
            console.error("Error updating user:", error);
        }
    };

    const handleRoleToggle = (role) => {
        if (!editingUser) return;

        const roles = editingUser.roles || [];
        const updatedRoles = roles.includes(role)
            ? roles.filter(r => r !== role)
            : [...roles, role];

        setEditingUser({ ...editingUser, roles: updatedRoles });
    };

    const filteredUsers = users.filter(user => 
        user.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return <div className="text-center py-4">Loading users...</div>;
    }

    const availableRoles = ["moderator", "contributor", "premium"];

    return (
        <div className="space-y-6">
            {/* Search Bar */}
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Search users..."
                    className="w-full px-4 py-2 rounded-lg bg-bg-secondary text-txt-primary"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-br-secondary">
                    <thead className="bg-bg-secondary">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-txt-secondary uppercase tracking-wider">User</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-txt-secondary uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-txt-secondary uppercase tracking-wider">Roles</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-txt-secondary uppercase tracking-wider">Admin</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-txt-secondary uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-br-secondary">
                        {filteredUsers.map((user) => (
                            <tr key={user.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <img
                                            className="h-8 w-8 rounded-full"
                                            src={user.photoURL || "/default-avatar.png"}
                                            alt=""
                                        />
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-txt-primary">
                                                {user.displayName || "No name"}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-txt-secondary">{user.email}</div>
                                </td>
                                <td className="px-6 py-4">
                                    {editingUser?.id === user.id ? (
                                        <div className="flex flex-wrap gap-2">
                                            {availableRoles.map((role) => (
                                                <button
                                                    key={role}
                                                    onClick={() => handleRoleToggle(role)}
                                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                        editingUser.roles?.includes(role)
                                                            ? "bg-accent text-white"
                                                            : "bg-bg-secondary text-txt-secondary"
                                                    }`}
                                                >
                                                    {role}
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-wrap gap-1">
                                            {user.roles?.map((role) => (
                                                <span
                                                    key={role}
                                                    className="px-2 py-1 rounded-full text-xs font-medium bg-accent/10 text-txt-primary"
                                                >
                                                    {role}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {editingUser?.id === user.id ? (
                                        <button
                                            onClick={() => setEditingUser({ ...editingUser, isAdmin: !editingUser.isAdmin })}
                                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                editingUser.isAdmin
                                                    ? "bg-accent text-white"
                                                    : "bg-bg-secondary text-txt-secondary"
                                            }`}
                                        >
                                            {editingUser.isAdmin ? "Yes" : "No"}
                                        </button>
                                    ) : (
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            user.isAdmin
                                                ? "bg-accent/10 text-txt-primary"
                                                : "bg-bg-secondary text-txt-secondary"
                                        }`}>
                                            {user.isAdmin ? "Yes" : "No"}
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    {editingUser?.id === user.id ? (
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={handleSaveUser}
                                                className="text-green-500 hover:text-green-600"
                                            >
                                                <MdCheck size={20} />
                                            </button>
                                            <button
                                                onClick={() => setEditingUser(null)}
                                                className="text-red-500 hover:text-red-600"
                                            >
                                                <MdClose size={20} />
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => handleEditUser(user)}
                                            className="text-accent hover:text-accent-hover"
                                        >
                                            <MdEdit size={20} />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}; 