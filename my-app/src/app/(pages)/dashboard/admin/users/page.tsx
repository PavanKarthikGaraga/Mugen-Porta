"use client"
import { useState, useEffect } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiSave, FiX, FiUser, FiUsers, FiFilter, FiCopy, FiEye, FiEyeOff } from "react-icons/fi";
import { handleApiError, handleApiSuccess } from "@/lib/apiErrorHandler";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { branchNames } from "../../../../Data/branches";

const DOMAIN_OPTIONS = [
    { value: 'TEC', label: 'TEC – Technology' },
    { value: 'LCH', label: 'LCH – Liberal Arts' },
    { value: 'IIE', label: 'IIE – Innovation & Entrepreneurship' },
    { value: 'HWB', label: 'HWB – Health & Wellbeing' },
    { value: 'ESO', label: 'ESO – Environment & Social' },
];
const DOMAIN_LABEL = Object.fromEntries(DOMAIN_OPTIONS.map(d => [d.value, d.label]));

// MySQL sometimes returns a JSON column already parsed, sometimes as a raw
// string depending on driver/version — every consumer of assignedClubs /
// assignedDomains has to handle both shapes, so this is shared rather than
// re-implemented per call site.
const parseArrayField = (value) => {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
        try { const parsed = JSON.parse(value); return Array.isArray(parsed) ? parsed : []; } catch { return []; }
    }
    return [];
};

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
        assignedDomains: [],
        childClubIds: [],
        password: '',
        // Student promotion fields
        studentDetails: null,
        isPromotingStudent: false
    });
    const [newClubAssignment, setNewClubAssignment] = useState('');
    const [newDomainAssignment, setNewDomainAssignment] = useState('');
    const [newChildClubAssignment, setNewChildClubAssignment] = useState('');
    const [defaultPassword, setDefaultPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showCouncilPw, setShowCouncilPw] = useState(false);


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

            // Auto-include a club/domain that's selected in its dropdown but
            // not yet added via + — otherwise clicking submit right after
            // picking one silently drops it.
            const effectiveAssignedClubs =
                formData.role === 'faculty' && newClubAssignment && !formData.assignedClubs.includes(newClubAssignment)
                    ? [...formData.assignedClubs, newClubAssignment]
                    : formData.assignedClubs;
            const effectiveAssignedDomains =
                formData.role === 'council' && newDomainAssignment && !formData.assignedDomains.includes(newDomainAssignment)
                    ? [...formData.assignedDomains, newDomainAssignment]
                    : formData.assignedDomains;
            const effectiveChildClubIds =
                formData.role === 'lead' && newChildClubAssignment && !formData.childClubIds.includes(newChildClubAssignment)
                    ? [...formData.childClubIds, newChildClubAssignment]
                    : formData.childClubIds;

            if (editingUser) {
                // Update existing user
                url = `/api/dashboard/admin/users/${editingUser.username}`;
                method = 'POST';
                body = { ...formData, assignedClubs: effectiveAssignedClubs, assignedDomains: effectiveAssignedDomains, childClubIds: effectiveChildClubIds };
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
                body = { ...formData, assignedClubs: effectiveAssignedClubs, assignedDomains: effectiveAssignedDomains };
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
            assignedDomains: [],
            childClubIds: [],
            password: '',
            studentDetails: null,
            isPromotingStudent: false
        });
        setEditingUser(null);
        setShowModal(false);
        setNewClubAssignment('');
        setNewDomainAssignment('');
        setNewChildClubAssignment('');
        setDefaultPassword('');
        setShowPassword(false);
        setShowCouncilPw(false);
    };

    const startEdit = (user) => {
        setEditingUser(user);
        // assignedDomains is the multi-domain array; assignedDomain is the
        // legacy single-domain column, still populated for council rows
        // created before multi-domain support — fall back to it as a
        // single-item list so an old council user still edits correctly.
        const domains = parseArrayField(user.assignedDomains);
        setFormData({
            role: user.role,
            username: user.username,
            name: user.name,
            email: user.email,
            phoneNumber: user.phoneNumber || '',
            year: user.year || '',
            branch: user.branch || '',
            clubId: user.clubId || '',
            assignedClubs: parseArrayField(user.assignedClubs),
            assignedDomains: domains.length > 0 ? domains : (user.assignedDomain ? [user.assignedDomain] : []),
            childClubIds: parseArrayField(user.childClubIds),
            // Prefills with the password set when this account was created
            // (or last changed here) — see users.plainPassword. Admin can
            // leave it as-is or type a new one to change it.
            password: user.plainPassword || '',
            studentDetails: null,
            isPromotingStudent: false,
        });
        setShowModal(true);
    };

    const addDomainAssignment = () => {
        if (newDomainAssignment && !formData.assignedDomains.includes(newDomainAssignment)) {
            setFormData({
                ...formData,
                assignedDomains: [...formData.assignedDomains, newDomainAssignment]
            });
            setNewDomainAssignment('');
        }
    };

    const removeDomainAssignment = (domainToRemove) => {
        setFormData({
            ...formData,
            assignedDomains: formData.assignedDomains.filter(d => d !== domainToRemove)
        });
    };

    const addChildClubAssignment = () => {
        if (newChildClubAssignment && !formData.childClubIds.includes(newChildClubAssignment)) {
            setFormData({
                ...formData,
                childClubIds: [...formData.childClubIds, newChildClubAssignment]
            });
            setNewChildClubAssignment('');
        }
    };

    const removeChildClubAssignment = (clubIdToRemove) => {
        setFormData({
            ...formData,
            childClubIds: formData.childClubIds.filter(id => id !== clubIdToRemove)
        });
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
            case 'council': return 'bg-purple-100 text-purple-800';
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
                                <SelectItem value="council">Council</SelectItem>
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
                                            {user.role === 'council' && (() => {
                                                const domains = parseArrayField(user.assignedDomains);
                                                const list = domains.length > 0 ? domains : (user.assignedDomain ? [user.assignedDomain] : []);
                                                return (
                                                    <span className="text-purple-600">
                                                        {list.length > 0 ? `Domain${list.length !== 1 ? 's' : ''}: ${list.join(', ')}` : 'No domain assigned'}
                                                    </span>
                                                );
                                            })()}
                                            {user.role === 'faculty' && (() => {
                                                const count = parseArrayField(user.assignedClubs).length;
                                                return (
                                                    <span className="text-green-600">
                                                        {count} club{count !== 1 ? 's' : ''} assigned
                                                    </span>
                                                );
                                            })()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => startEdit(user)}
                                                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border border-gray-200 text-gray-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors whitespace-nowrap"
                                                >
                                                    <FiEdit2 className="h-3.5 w-3.5" /> Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user.username)}
                                                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border border-gray-200 text-gray-700 hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-colors whitespace-nowrap"
                                                >
                                                    <FiTrash2 className="h-3.5 w-3.5" /> Delete
                                                </button>
                                            </div>
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
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
                                        <option value="council">Council</option>
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

                                {(editingUser || formData.role === 'council') && (
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Password{formData.role === 'council' && !editingUser ? ' *' : ''}
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showCouncilPw ? "text" : "password"}
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent"
                                                placeholder={editingUser ? "Change the password, or leave as-is" : "Set a password (min 6 chars)"}
                                                required={formData.role === 'council' && !editingUser}
                                                minLength={6}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowCouncilPw(p => !p)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                tabIndex={-1}
                                            >
                                                {showCouncilPw ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                                            </button>
                                        </div>
                                        {editingUser && (
                                            <p className="text-xs text-gray-500 mt-1">
                                                {formData.password
                                                    ? "This is the password currently set for this account — edit it to change it, or leave it as-is."
                                                    : "No password on record for this account yet — set one here if needed."}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {formData.role === 'council' && (
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Assigned Domains *
                                        </label>
                                        <div className="flex space-x-2 mb-2">
                                            <select
                                                value={newDomainAssignment}
                                                onChange={(e) => setNewDomainAssignment(e.target.value)}
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent"
                                            >
                                                <option value="">Select Domain to Assign</option>
                                                {DOMAIN_OPTIONS.filter(d => !formData.assignedDomains.includes(d.value)).map((d) => (
                                                    <option key={d.value} value={d.value}>{d.label}</option>
                                                ))}
                                            </select>
                                            <button
                                                type="button"
                                                onClick={addDomainAssignment}
                                                className="px-3 py-2 bg-red-800 text-white rounded-md hover:bg-red-900 transition-colors"
                                            >
                                                <FiPlus className="h-4 w-4" />
                                            </button>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {formData.assignedDomains.length === 0 && (
                                                <span className="text-xs text-gray-400">No domains selected yet</span>
                                            )}
                                            {formData.assignedDomains.map((domain) => (
                                                <span
                                                    key={domain}
                                                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800 border border-purple-300"
                                                >
                                                    {DOMAIN_LABEL[domain] || domain}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeDomainAssignment(domain)}
                                                        className="ml-2 text-purple-600 hover:text-purple-800 transition-colors"
                                                    >
                                                        <FiX className="h-3 w-3" />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {formData.role !== 'lead' && formData.role !== 'council' && (
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
                                )}

                                {formData.role === 'lead' && (
                                    <div>
                                        <label htmlFor="clubId" className="block text-sm font-medium text-gray-700 mb-1">
                                            Assigned Club (parent club) *
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
                            </div>

                            {editingUser && formData.role === 'lead' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Additional Clubs
                                    </label>
                                    <p className="text-xs text-gray-500 mb-2">
                                        Map this lead to additional clubs. They&apos;ll manage students and activities across their parent club plus every child club selected here.
                                    </p>
                                    <div className="flex space-x-2 mb-2">
                                        <select
                                            value={newChildClubAssignment}
                                            onChange={(e) => setNewChildClubAssignment(e.target.value)}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent"
                                        >
                                            <option value="">Select Child Club to Add</option>
                                            {clubs
                                                .filter((c) => c.id !== formData.clubId && !formData.childClubIds.includes(c.id))
                                                .map((club) => (
                                                    <option key={club.id} value={club.id}>{club.name}</option>
                                                ))}
                                        </select>
                                        <button
                                            type="button"
                                            onClick={addChildClubAssignment}
                                            className="px-3 py-2 bg-red-800 text-white rounded-md hover:bg-red-900 transition-colors"
                                        >
                                            <FiPlus className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {formData.childClubIds.length === 0 && (
                                            <span className="text-xs text-gray-400">No child clubs mapped yet</span>
                                        )}
                                        {formData.childClubIds.map((id) => {
                                            const club = clubs.find((c) => c.id === id);
                                            return (
                                                <span
                                                    key={id}
                                                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 border border-blue-300"
                                                >
                                                    {club?.name || id}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeChildClubAssignment(id)}
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
