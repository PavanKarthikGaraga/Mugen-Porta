"use client";
import { useState, useEffect } from "react";
import { FiFolder, FiTag, FiTarget, FiUsers, FiCalendar, FiInfo } from "react-icons/fi";

export default function StudentClubDetailsPage() {
    const [clubData, setClubData] = useState(null);
    const [projectData, setProjectData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchClubDetails = async () => {
            try {
                // Fetch user data first
                const userResponse = await fetch('/api/auth/me');
                if (!userResponse.ok) {
                    throw new Error('Failed to fetch user data');
                }

                const userData = await userResponse.json();
                const username = userData.username;

                // Fetch student details including club and project information
                const studentResponse = await fetch(`/api/dashboard/student/profile/${username}`);
                if (studentResponse.ok) {
                    const studentDetails = await studentResponse.json();

                    // Fetch club information
                    if (studentDetails.clubId) {
                        try {
                            const clubResponse = await fetch(`/api/dashboard/student/clubs/${studentDetails.clubId}`);
                            if (clubResponse.ok) {
                                const clubInfo = await clubResponse.json();
                                setClubData({
                                    ...clubInfo,
                                    studentDetails: studentDetails
                                });
                            }
                        } catch (error) {
                            console.error('Error fetching club data:', error);
                        }
                    }

                    // Fetch project information
                    if (studentDetails.projectId) {
                        try {
                            const projectResponse = await fetch(`/api/dashboard/student/projects/${studentDetails.projectId}`);
                            if (projectResponse.ok) {
                                const projectInfo = await projectResponse.json();
                                setProjectData(projectInfo);
                            }
                        } catch (error) {
                            console.error('Error fetching project data:', error);
                        }
                    }
                }
            } catch (error) {
                console.error('Failed to fetch club details:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchClubDetails();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Club Details</h1>
                <p className="mt-2 text-gray-600">Your club and project information</p>
            </div>

            {/* Club Information */}
            {clubData ? (
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                        <FiFolder className="mr-2" />
                        Club Information
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Club Name</label>
                                <p className="text-lg font-semibold text-gray-900">{clubData.name}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Domain</label>
                                <p className="text-gray-700">{clubData.selectedDomain || 'N/A'}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <p className="text-gray-700">{clubData.studentDetails?.selectedCategory || 'N/A'}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Member Limit</label>
                                <p className="text-gray-700">{clubData.memberLimit || 'N/A'}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Registration Date</label>
                                <p className="text-gray-700">
                                    {clubData.studentDetails?.created_at
                                        ? new Date(clubData.studentDetails.created_at).toLocaleDateString()
                                        : 'N/A'}
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Active Member
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Club Description */}
                    <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Club Description</label>
                        <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">
                            {clubData.description || 'No description available.'}
                        </p>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <div className="text-center py-8">
                        <FiFolder className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Club Information</h3>
                        <p className="text-gray-600">You haven&apos;t been assigned to a club yet.</p>
                    </div>
                </div>
            )}

            {/* Project Information */}
            {projectData ? (
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                        <FiTarget className="mr-2" />
                        Project Information
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                                <p className="text-lg font-semibold text-gray-900">{projectData.name}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Project ID</label>
                                <p className="text-gray-700 font-mono">{projectData.id}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Domain</label>
                                <p className="text-gray-700">{projectData.domain}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <p className="text-gray-700">{projectData.category || 'N/A'}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    projectData.status === 'active'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                }`}>
                                    {projectData.status || 'Unknown'}
                                </span>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Created Date</label>
                                <p className="text-gray-700">
                                    {projectData.created_at
                                        ? new Date(projectData.created_at).toLocaleDateString()
                                        : 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Project Description */}
                    <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Project Description</label>
                        <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">
                            {projectData.description || 'No description available.'}
                        </p>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <div className="text-center py-8">
                        <FiTarget className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Project Information</h3>
                        <p className="text-gray-600">You haven&apos;t been assigned to a project yet.</p>
                    </div>
                </div>
            )}

            {/* Summary Card */}
            {/* {(clubData || projectData) && (
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                        <FiInfo className="mr-2" />
                        Summary
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {clubData && (
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <div className="flex items-center">
                                    <FiFolder className="h-8 w-8 text-blue-600 mr-3" />
                                    <div>
                                        <p className="text-sm font-medium text-blue-600">Club</p>
                                        <p className="text-lg font-semibold text-blue-900">{clubData.name}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {clubData?.studentDetails?.selectedCategory && (
                            <div className="bg-green-50 p-4 rounded-lg">
                                <div className="flex items-center">
                                    <FiTag className="h-8 w-8 text-green-600 mr-3" />
                                    <div>
                                        <p className="text-sm font-medium text-green-600">Category</p>
                                        <p className="text-lg font-semibold text-green-900">{clubData.studentDetails.selectedCategory}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {projectData && (
                            <div className="bg-purple-50 p-4 rounded-lg">
                                <div className="flex items-center">
                                    <FiTarget className="h-8 w-8 text-purple-600 mr-3" />
                                    <div>
                                        <p className="text-sm font-medium text-purple-600">Project</p>
                                        <p className="text-lg font-semibold text-purple-900">{projectData.name}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )} */}
        </div>
    );
}
