"use client";
import { useState, useEffect } from "react";
import { FiFolder, FiUsers, FiCalendar, FiInfo } from "react-icons/fi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function StudentClubDetailsPage() {
    const [clubData, setClubData] = useState(null);
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
                const username = userData.user?.username;

                // Fetch student details including club information
                const studentResponse = await fetch(`/api/dashboard/student/profile/${username}`, { credentials: 'include' });
                if (studentResponse.ok) {
                    const studentDetails = await studentResponse.json();

                    // Fetch club information
                    if (studentDetails.clubId) {
                        try {
                            const clubResponse = await fetch(`/api/dashboard/student/clubs/${studentDetails.clubId}`, { credentials: 'include' });
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
                <p className="mt-2 text-gray-600">Your club information</p>
            </div>

            {/* Club Information */}
            {clubData ? (
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <FiFolder className="mr-2" />
                            Club Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent>

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
                    </CardContent>
                </Card>
            ) : (
                <Card className="mb-8">
                    <CardContent>
                        <div className="text-center py-8">
                            <FiFolder className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Club Information</h3>
                            <p className="text-gray-600">You haven&apos;t been assigned to a club yet.</p>
                        </div>
                    </CardContent>
                </Card>
            )}


            {/* Summary Card */}
            {/* {clubData && (
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

                    </div>
                </div>
            )} */}
        </div>
    );
}
