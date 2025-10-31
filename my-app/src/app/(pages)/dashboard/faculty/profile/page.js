"use client";
import { useState, useEffect } from "react";
import { FiUser, FiMail, FiPhone, FiCalendar, FiMapPin, FiEdit2, FiSave, FiX } from "react-icons/fi";
import { handleApiError, handleApiSuccess } from '@/lib/apiErrorHandler';

export default function FacultyProfilePage() {
    const [profile, setProfile] = useState({
        username: '',
        name: '',
        email: '',
        phoneNumber: '',
        year: '',
        branch: '',
        assignedClubs: [],
        created_at: ''
    });
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [clubs, setClubs] = useState([]);

    useEffect(() => {
        fetchProfile();
        fetchClubs();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/dashboard/faculty/profile');

            if (await handleApiError(response)) {
                return;
            }

            if (response.ok) {
                const data = await response.json();
                setProfile({
                    ...data.user,
                    assignedClubs: Array.isArray(data.user?.assignedClubs) ? data.user?.assignedClubs : (data.user?.assignedClubs ? JSON.parse(data.user?.assignedClubs) : [])
                });
                setFormData({
                    ...data.user,
                    assignedClubs: Array.isArray(data.user?.assignedClubs) ? data.user?.assignedClubs : (data.user?.assignedClubs ? JSON.parse(data.user?.assignedClubs) : [])
                });
            }
        } catch (error) {
            console.error('Failed to fetch profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchClubs = async () => {
        try {
            const response = await fetch('/api/dashboard/faculty/clubs');
            if (response.ok) {
                const data = await response.json();
                setClubs(data);
            }
        } catch (error) {
            console.error('Error fetching clubs:', error);
        }
    };

    const handleUpdate = async () => {
        try {
            const response = await fetch('/api/dashboard/faculty/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (await handleApiError(response)) {
                return;
            }

            if (response.ok) {
                handleApiSuccess('Profile updated successfully');
                setProfile(formData);
                setEditing(false);
            }
        } catch (error) {
            console.error('Error updating profile:', error);
        }
    };

    const handleCancel = () => {
        setFormData(profile);
        setEditing(false);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-800"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
                <p className="mt-2 text-gray-600">Manage your personal information</p>
            </div>

            <div className="bg-white rounded-lg shadow-lg border border-gray-200">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-900">Personal Details</h2>
                    {!editing ? (
                        <button
                            onClick={() => setEditing(true)}
                            className="flex items-center space-x-2 px-4 py-2 bg-red-800 text-white rounded-lg hover:bg-red-900 transition-colors"
                        >
                            <FiEdit2 className="h-4 w-4" />
                            <span>Edit Profile</span>
                        </button>
                    ) : (
                        <div className="flex space-x-2">
                            <button
                                onClick={handleUpdate}
                                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                                <FiSave className="h-4 w-4" />
                                <span>Save</span>
                            </button>
                            <button
                                onClick={handleCancel}
                                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                            >
                                <FiX className="h-4 w-4" />
                                <span>Cancel</span>
                            </button>
                        </div>
                    )}
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Username */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <FiUser className="inline h-4 w-4 mr-2" />
                                Username
                            </label>
                            <div className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md border">
                                {profile.username}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Username cannot be changed</p>
                        </div>

                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <FiUser className="inline h-4 w-4 mr-2" />
                                Full Name
                            </label>
                            {editing ? (
                                <input
                                    type="text"
                                    value={formData.name || ''}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent"
                                />
                            ) : (
                                <div className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md border">
                                    {profile.name}
                                </div>
                            )}
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <FiMail className="inline h-4 w-4 mr-2" />
                                Email
                            </label>
                            {editing ? (
                                <input
                                    type="email"
                                    value={formData.email || ''}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent"
                                />
                            ) : (
                                <div className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md border">
                                    {profile.email}
                                </div>
                            )}
                        </div>

                        {/* Phone Number */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <FiPhone className="inline h-4 w-4 mr-2" />
                                Phone Number
                            </label>
                            {editing ? (
                                <input
                                    type="tel"
                                    value={formData.phoneNumber || ''}
                                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent"
                                    maxLength={15}
                                />
                            ) : (
                                <div className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md border">
                                    {profile.phoneNumber || 'Not provided'}
                                </div>
                            )}
                        </div>

                        {/* Year */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <FiCalendar className="inline h-4 w-4 mr-2" />
                                Year
                            </label>
                            {editing ? (
                                <select
                                    value={formData.year || ''}
                                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent"
                                >
                                    <option value="">Select Year</option>
                                    <option value="1st">1st Year</option>
                                    <option value="2nd">2nd Year</option>
                                    <option value="3rd">3rd Year</option>
                                    <option value="4th">4th Year</option>
                                </select>
                            ) : (
                                <div className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md border">
                                    {profile.year ? `${profile.year} Year` : 'Not specified'}
                                </div>
                            )}
                        </div>

                        {/* Branch */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <FiMapPin className="inline h-4 w-4 mr-2" />
                                Branch
                            </label>
                            {editing ? (
                                <input
                                    type="text"
                                    value={formData.branch || ''}
                                    onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent"
                                    placeholder="e.g., CSE"
                                />
                            ) : (
                                <div className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md border">
                                    {profile.branch || 'Not specified'}
                                </div>
                            )}
                        </div>

                        {/* Assigned Clubs */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <FiMapPin className="inline h-4 w-4 mr-2" />
                                Assigned Clubs
                            </label>
                            <div className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md border min-h-[60px]">
                                {profile.assignedClubs && profile.assignedClubs.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {profile.assignedClubs.map((clubId) => {
                                            const club = clubs.find(c => c.id === clubId);
                                            return (
                                                <span
                                                    key={clubId}
                                                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 border border-blue-300"
                                                >
                                                    {club ? club.name : clubId}
                                                </span>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    'No clubs assigned'
                                )}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Club assignments managed by admin</p>
                        </div>

                        {/* Created At */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <FiCalendar className="inline h-4 w-4 mr-2" />
                                Account Created
                            </label>
                            <div className="text-gray-900 bg-gray-50 px-3 py-2 rounded-md border">
                                {profile.created_at ? new Date(profile.created_at).toLocaleDateString('en-IN', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                }) : 'Not available'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
