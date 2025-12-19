"use client"
import { useState, useEffect } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiSave, FiX, FiUser, FiUsers, FiFilter, FiCopy } from "react-icons/fi";
import { handleApiError, handleApiSuccess } from "@/lib/apiErrorHandler";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { branchNames } from "../../../../Data/branches";

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
        assignedClubs: [],
        // Student promotion fields
        studentDetails: null,
        isPromotingStudent: false
    });
    const [newClubAssignment, setNewClubAssignment] = useState('');
    const [defaultPassword, setDefaultPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);


    useEffect(() => {
        fetchUsers();
        fetchClubs();
    }, []);

    // Reset promotion state when role changes
    useEffect(() => {
        if (!editingUser && formData.role !== 'lead' && formData.isPromotingStudent) {
            setFormData(prev => ({
                ...prev,
                studentDetails: null,
                isPromotingStudent: false,
                name: '',
                email: '',
                phoneNumber: '',
                year: '',
                branch: ''
            }));
        }
    }, [formData.role, editingUser, formData.isPromotingStudent]);

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
            let url, method, body;

            if (editingUser) {
                // Update existing user
                url = `/api/dashboard/admin/users/${editingUser.username}`;
                method = 'POST';
                body = formData;
            } else if (formData.isPromotingStudent) {
                // Promote existing student to lead
                url = '/api/dashboard/admin/users/promote-student';
                method = 'POST';
                body = {
                    username: formData.username,
                    clubId: formData.clubId
                };
            } else {
                // Create new user
                url = '/api/dashboard/admin/users';
                method = 'POST';
                body = formData;
            }

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            if (await handleApiError(response)) {
                return;
            }

            if (response.ok) {
                const data = await response.json();
                const successMessage = editingUser
                    ? 'User updated successfully'
                    : formData.isPromotingStudent
                    ? 'Student promoted to lead successfully'
                    : 'User created successfully';

                handleApiSuccess(successMessage);

                if (!editingUser && !formData.isPromotingStudent && data.defaultPassword) {
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
            assignedClubs: [],
            studentDetails: null,
            isPromotingStudent: false
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

    const fetchStudentDetailsForForm = async (username) => {
        if (!username.trim()) {
            setFormData(prev => ({
                ...prev,
                studentDetails: null,
                isPromotingStudent: false,
                name: '',
                email: '',
                phoneNumber: '',
                year: '',
                branch: ''
            }));
            return;
        }

        try {
            const response = await fetch(`/api/dashboard/admin/students?username=${username}`);

            if (await handleApiError(response)) {
                setFormData(prev => ({
                    ...prev,
                    studentDetails: null,
                    isPromotingStudent: false,
                    name: '',
                    email: '',
                    phoneNumber: '',
                    year: '',
                    branch: ''
                }));
                return;
            }

            if (response.ok) {
                const data = await response.json();
                if (data.data.student) {
                    const student = data.data.student;
                    setFormData(prev => ({
                        ...prev,
                        studentDetails: student,
                        isPromotingStudent: true,
                        name: student.name || '',
                        email: student.email || '',
                        phoneNumber: student.phoneNumber || '',
                        year: student.year || '',
                        branch: student.branch || '',
                        clubId: student.clubId || ''
                    }));
                } else {
                    setFormData(prev => ({
                        ...prev,
                        studentDetails: null,
                        isPromotingStudent: false,
                        name: '',
                        email: '',
                        phoneNumber: '',
                        year: '',
                        branch: ''
                    }));
                    handleApiError({ status: 404, message: 'Student not found' });
                }
            }
        } catch (error) {
            console.error('Error fetching student details:', error);
            setFormData(prev => ({
                ...prev,
                studentDetails: null,
                isPromotingStudent: false,
                name: '',
                email: '',
                phoneNumber: '',
                year: '',
                branch: ''
            }));
        }
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
                <Button
                    onClick={() => setShowModal(true)}
                    className="bg-red-800 hover:bg-red-900"
                >
                    <FiPlus className="h-4 w-4 mr-2" />
                    <span>Add User</span>
                </Button>
            </div>

            {/* Filters */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <FiFilter className="mr-2" />
                        Filters
                    </CardTitle>
                </CardHeader>
                <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <Label className="block text-sm font-medium mb-2">Role</Label>
                        <Select
                            value={filters.role}
                            onValueChange={(value) => setFilters({ ...filters, role: value })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="All Roles" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Roles</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="lead">Lead</SelectItem>
                                <SelectItem value="faculty">Faculty</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label className="block text-sm font-medium mb-2">Search</Label>
                        <Input
                            type="text"
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            placeholder="Search by name, username, or email"
                        />
                    </div>

                    <div className="flex items-end">
                        <Button
                            onClick={() => setFilters({ role: 'all', search: '' })}
                            variant="outline"
                        >
                            Clear Filters
                        </Button>
                    </div>
                </div>
                </CardContent>
            </Card>


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
                                {editingUser
                                    ? 'Edit User'
                                    : formData.isPromotingStudent
                                    ? 'Promote Student to Lead'
                                    : 'Add New User'
                                }
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
                                        onChange={(e) => {
                                            const newUsername = e.target.value;
                                            setFormData({ ...formData, username: newUsername });
                                            // Fetch student details only when role is lead and not editing
                                            if (!editingUser && formData.role === 'lead') {
                                                fetchStudentDetailsForForm(newUsername);
                                            } else if (!editingUser && formData.role !== 'lead' && formData.isPromotingStudent) {
                                                // Reset promotion state if role changed
                                                setFormData(prev => ({
                                                    ...prev,
                                                    username: newUsername,
                                                    studentDetails: null,
                                                    isPromotingStudent: false,
                                                    name: '',
                                                    email: '',
                                                    phoneNumber: '',
                                                    year: '',
                                                    branch: ''
                                                }));
                                            }
                                        }}
                                        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent ${editingUser ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                        required
                                        disabled={editingUser}
                                        maxLength={10}
                                        placeholder={formData.role === 'lead' && !editingUser ? 'Enter student username to promote' : 'e.g., 2300032048'}
                                    />
                                    {formData.role === 'lead' && !editingUser && formData.username && !formData.isPromotingStudent && (
                                        <p className="text-sm text-red-600 mt-1">Student not found with this username</p>
                                    )}
                                </div>

                                {/* Student Details Display for Promotion */}
                                {formData.isPromotingStudent && formData.studentDetails && (
                                    <div className="col-span-2 bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <h4 className="font-medium text-blue-900 mb-3">Student Details</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                            <div className="flex justify-between">
                                                <span className="font-medium text-gray-700">Name:</span>
                                                <span>{formData.studentDetails.name}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="font-medium text-gray-700">Email:</span>
                                                <span>{formData.studentDetails.email}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="font-medium text-gray-700">Branch:</span>
                                                <span>{formData.studentDetails.branch}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="font-medium text-gray-700">Year:</span>
                                                <span>{formData.studentDetails.year}</span>
                                            </div>
                                            <div className="flex justify-between md:col-span-2">
                                                <span className="font-medium text-gray-700">Current Club:</span>
                                                <span className={formData.studentDetails.clubName ? "text-blue-600" : "text-gray-500"}>
                                                    {formData.studentDetails.clubName || "Not assigned"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {formData.role !== 'lead' && (
                                    <>
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
                                    </>
                                )}

                                {formData.role === 'faculty' && (
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
                                    <span>
                                        {editingUser
                                            ? 'Update'
                                            : formData.isPromotingStudent
                                            ? 'Promote to Lead'
                                            : 'Create User'
                                        }
                                    </span>
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
