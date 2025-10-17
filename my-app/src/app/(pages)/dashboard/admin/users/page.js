"use client"
import { useState, useEffect } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiSave, FiX, FiUser, FiUsers, FiFilter, FiCopy } from "react-icons/fi";
import { handleApiError, handleApiSuccess } from "@/lib/apiErrorHandler";

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [clubs, setClubs] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [filters, setFilters] = useState({
        role: 'all',
        search: ''
    });
    const [formData, setFormData] = useState({
        role: '',
        username: '',
        name: '',
        email: '',
        phoneNumber: '',
        year: '',
        branch: '',
        clubId: '',
        assignedClubs: []
    });
    const [newClubAssignment, setNewClubAssignment] = useState('');
    const [defaultPassword, setDefaultPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        fetchUsers();
        fetchClubs();
    }, []);

    // Filter users based on filters
    useEffect(() => {
        let filtered = users;

        if (filters.role !== 'all') {
            filtered = filtered.filter(user => user.role === filters.role);
        }

        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            filtered = filtered.filter(user =>
                user.name.toLowerCase().includes(searchTerm) ||
                user.username.toLowerCase().includes(searchTerm) ||
                user.email.toLowerCase().includes(searchTerm)
            );
        }

        setFilteredUsers(filtered);
    }, [users, filters]);

    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/dashboard/admin/users');

            if (await handleApiError(response)) {
                return;
            }

            if (response.ok) {
                const data = await response.json();
                setUsers(data.data.users);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchClubs = async () => {
        try {
            const response = await fetch('/api/dashboard/admin/clubs');
            if (response.ok) {
                const data = await response.json();
                setClubs(data);
            }
        } catch (error) {
            console.error('Error fetching clubs:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = editingUser ? `/api/dashboard/admin/users/${editingUser.username}` : '/api/dashboard/admin/users';
            const method = editingUser ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (await handleApiError(response)) {
                return;
            }

            if (response.ok) {
                const data = await response.json();
                handleApiSuccess(editingUser ? 'User updated successfully' : 'User created successfully');

                if (!editingUser && data.defaultPassword) {
                    setDefaultPassword(data.defaultPassword);
                    setShowPassword(true);
                }

                fetchUsers();
                resetForm();
            }
        } catch (error) {
            console.error('Error saving user:', error);
        }
    };

    const handleDelete = async (username) => {
        if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            try {
                const response = await fetch(`/api/dashboard/admin/users?username=${username}`, {
                    method: 'DELETE',
                });

                if (await handleApiError(response)) {
                    return;
                }

                if (response.ok) {
                    handleApiSuccess('User deleted successfully');
                    fetchUsers();
                }
            } catch (error) {
                console.error('Error deleting user:', error);
            }
        }
    };

    const resetForm = () => {
        setFormData({
            role: '',
            username: '',
            name: '',
            email: '',
            phoneNumber: '',
            year: '',
            branch: '',
            clubId: '',
            assignedClubs: []
        });
        setEditingUser(null);
        setShowModal(false);
        setNewClubAssignment('');
        setDefaultPassword('');
        setShowPassword(false);
    };

    const startEdit = (user) => {
        setEditingUser(user);
        setFormData({
            role: user.role,
            username: user.username,
            name: user.name,
            email: user.email,
            phoneNumber: user.phoneNumber || '',
            year: user.year || '',
            branch: user.branch || '',
            clubId: user.clubId || '',
            assignedClubs: (() => {
                // If it's already an array, use it directly
                if (Array.isArray(user.assignedClubs)) {
                    return user.assignedClubs;
                }
                // If it's a string, try to parse it
                if (typeof user.assignedClubs === 'string') {
                    try {
                        return JSON.parse(user.assignedClubs);
                    } catch (e) {
                        return [];
                    }
                }
                return [];
            })()
        });
        setShowModal(true);
    };

    const addClubAssignment = () => {
        if (newClubAssignment && !formData.assignedClubs.includes(newClubAssignment)) {
            setFormData({
                ...formData,
                assignedClubs: [...formData.assignedClubs, newClubAssignment]
            });
            setNewClubAssignment('');
        }
    };

    const removeClubAssignment = (clubIdToRemove) => {
        setFormData({
            ...formData,
            assignedClubs: formData.assignedClubs.filter(id => id !== clubIdToRemove)
        });
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        handleApiSuccess('Copied to clipboard');
    };

    const getRoleColor = (role) => {
        switch (role) {
            case 'admin': return 'bg-red-100 text-red-800';
            case 'lead': return 'bg-blue-100 text-blue-800';
            case 'faculty': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
                    <p className="text-gray-600 mt-1">Manage administrators, leads, and faculty</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-800 text-white rounded-lg hover:bg-red-900 transition-colors"
                >
                    <FiPlus className="h-4 w-4" />
                    <span>Add User</span>
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FiFilter className="mr-2" />
                    Filters
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                        <select
                            value={filters.role}
                            onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent"
                        >
                            <option value="all">All Roles</option>
                            <option value="admin">Admin</option>
                            <option value="lead">Lead</option>
                            <option value="faculty">Faculty</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                        <input
                            type="text"
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            placeholder="Search by name, username, or email"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent"
                        />
                    </div>

                    <div className="flex items-end">
                        <button
                            onClick={() => setFilters({ role: 'all', search: '' })}
                            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>
            </div>

            {/* Users List */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200">
                {loading && (
                    <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-800 mx-auto"></div>
                        <p className="mt-2 text-gray-600">Loading users...</p>
                    </div>
                )}

                {!loading && filteredUsers.length === 0 && users.length === 0 && (
                    <div className="p-8 text-center">
                        <p className="text-gray-500">No users found. Create your first user!</p>
                    </div>
                )}

                {!loading && filteredUsers.length === 0 && users.length > 0 && (
                    <div className="p-8 text-center">
                        <p className="text-gray-500">No users match your filters. Try adjusting your search criteria.</p>
                    </div>
                )}

                {!loading && filteredUsers.length > 0 && (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Username
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Role
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Details
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredUsers.map((user) => (
                                    <tr key={user.username} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {user.username}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {user.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {user.email}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                                                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {user.role === 'lead' && user.clubName && (
                                                <span className="text-blue-600">Club: {user.clubName}</span>
                                            )}
                                            {user.role === 'faculty' && (
                                                <span className="text-green-600">
                                                    {(() => {
                                                        // Check if it's already an array (parsed by MySQL)
                                                        if (Array.isArray(user.assignedClubs)) {
                                                            return user.assignedClubs.length;
                                                        }
                                                        // If it's a string, try to parse it
                                                        if (typeof user.assignedClubs === 'string') {
                                                            try {
                                                                const parsed = JSON.parse(user.assignedClubs);
                                                                return Array.isArray(parsed) ? parsed.length : 1;
                                                            } catch (e) {
                                                                // Fallback to comma-separated string
                                                                const clubs = user.assignedClubs.split(',').filter(c => c.trim());
                                                                return clubs.length;
                                                            }
                                                        }
                                                        return 0;
                                                    })()} club{(() => {
                                                        if (Array.isArray(user.assignedClubs)) {
                                                            return user.assignedClubs.length !== 1 ? 's' : '';
                                                        }
                                                        if (typeof user.assignedClubs === 'string') {
                                                            try {
                                                                const parsed = JSON.parse(user.assignedClubs);
                                                                const length = Array.isArray(parsed) ? parsed.length : 1;
                                                                return length !== 1 ? 's' : '';
                                                            } catch {
                                                                const clubs = user.assignedClubs.split(',').filter(c => c.trim());
                                                                return clubs.length !== 1 ? 's' : '';
                                                            }
                                                        }
                                                        return 's';
                                                    })()} assigned
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                            <button
                                                onClick={() => startEdit(user)}
                                                className="text-blue-600 cursor-pointer hover:text-blue-900 p-1 rounded"
                                            >
                                                <FiEdit2 className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user.username)}
                                                className="text-red-600 cursor-pointer hover:text-red-900 p-1 rounded"
                                            >
                                                <FiTrash2 className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 border border-gray-300">
                        <div className="flex justify-between items-center p-6 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">
                                {editingUser ? 'Edit User' : 'Add New User'}
                            </h3>
                            <button
                                onClick={resetForm}
                                className="text-gray-400 hover:text-gray-600 p-1 rounded"
                            >
                                <FiX className="h-6 w-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                                        Role *
                                    </label>
                                    <select
                                        id="role"
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent ${editingUser ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                        required
                                        disabled={editingUser}
                                    >
                                        <option value="">Select Role</option>
                                        <option value="admin">Admin</option>
                                        <option value="lead">Lead</option>
                                        <option value="faculty">Faculty</option>
                                    </select>
                                </div>

                                <div>
                                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                                        Username *
                                    </label>
                                    <input
                                        id="username"
                                        type="text"
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent ${editingUser ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                        required
                                        disabled={editingUser}
                                        maxLength={10}
                                        placeholder="e.g., 2300032048"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                        Full Name *
                                    </label>
                                    <input
                                        id="name"
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent"
                                        required
                                    />
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                        Email *
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent"
                                        required
                                    />
                                </div>

                                {(formData.role === 'lead' || formData.role === 'faculty') && (
                                    <>
                                        <div>
                                            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                                                Phone Number *
                                            </label>
                                            <input
                                                id="phoneNumber"
                                                type="tel"
                                                value={formData.phoneNumber}
                                                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent"
                                                required
                                                maxLength={15}
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
                                                Year *
                                            </label>
                                            <select
                                                id="year"
                                                value={formData.year}
                                                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent"
                                                required
                                            >
                                                <option value="">Select Year</option>
                                                <option value="1st">1st Year</option>
                                                <option value="2nd">2nd Year</option>
                                                <option value="3rd">3rd Year</option>
                                                <option value="4th">4th Year</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label htmlFor="branch" className="block text-sm font-medium text-gray-700 mb-1">
                                                Branch *
                                            </label>
                                            <input
                                                id="branch"
                                                type="text"
                                                value={formData.branch}
                                                onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent"
                                                required
                                                placeholder="e.g., CSE"
                                            />
                                        </div>

                                        {formData.role === 'lead' && (
                                            <div>
                                                <label htmlFor="clubId" className="block text-sm font-medium text-gray-700 mb-1">
                                                    Assigned Club *
                                                </label>
                                                <select
                                                    id="clubId"
                                                    value={formData.clubId}
                                                    onChange={(e) => setFormData({ ...formData, clubId: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent"
                                                    required
                                                >
                                                    <option value="">Select Club</option>
                                                    {clubs.map((club) => (
                                                        <option key={club.id} value={club.id}>
                                                            {club.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>

                            {formData.role === 'faculty' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Assigned Clubs *
                                    </label>
                                    <div className="flex space-x-2 mb-2">
                                        <select
                                            value={newClubAssignment}
                                            onChange={(e) => setNewClubAssignment(e.target.value)}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent"
                                        >
                                            <option value="">Select Club to Assign</option>
                                            {clubs.map((club) => (
                                                <option key={club.id} value={club.id}>
                                                    {club.name}
                                                </option>
                                            ))}
                                        </select>
                                        <button
                                            type="button"
                                            onClick={addClubAssignment}
                                            className="px-3 py-2 bg-red-800 text-white rounded-md hover:bg-red-900 transition-colors"
                                        >
                                            <FiPlus className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {formData.assignedClubs.map((clubId) => {
                                            const club = clubs.find(c => c.id === clubId);
                                            return (
                                                <span
                                                    key={clubId}
                                                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 border border-blue-300"
                                                >
                                                    {club ? club.name : clubId}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeClubAssignment(clubId)}
                                                        className="ml-2 text-blue-600 hover:text-blue-800 transition-colors"
                                                    >
                                                        <FiX className="h-3 w-3" />
                                                    </button>
                                                </span>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex items-center space-x-2 px-4 py-2 bg-red-800 text-white rounded-md hover:bg-red-900 transition-colors"
                                >
                                    <FiSave className="h-4 w-4" />
                                    <span>{editingUser ? 'Update' : 'Save'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Password Modal */}
            {showPassword && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 border border-gray-300">
                        <div className="flex justify-between items-center p-6 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">
                                Default Password Generated
                            </h3>
                            <button
                                onClick={() => setShowPassword(false)}
                                className="text-gray-400 hover:text-gray-600 p-1 rounded"
                            >
                                <FiX className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="p-6">
                            <p className="text-gray-600 mb-4">
                                A default password has been generated for the new user. Please copy and share it securely:
                            </p>
                            <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md border">
                                <code className="flex-1 text-lg font-mono text-gray-900">
                                    {defaultPassword}
                                </code>
                                <button
                                    onClick={() => copyToClipboard(defaultPassword)}
                                    className="text-gray-500 hover:text-gray-700 p-1 rounded"
                                    title="Copy to clipboard"
                                >
                                    <FiCopy className="h-5 w-5" />
                                </button>
                            </div>
                            <p className="text-sm text-gray-500 mt-3">
                                Password format: username + last 4 digits of phone number
                            </p>
                            <div className="flex justify-end mt-4">
                                <button
                                    onClick={() => setShowPassword(false)}
                                    className="px-4 py-2 bg-red-800 text-white rounded-md hover:bg-red-900 transition-colors"
                                >
                                    Got it
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
