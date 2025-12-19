"use client";
import { useState, useEffect } from "react";
import { FiUser, FiMail, FiPhone, FiMapPin, FiCalendar, FiBook, FiUsers } from "react-icons/fi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function StudentOverviewPage() {
    const [studentData, setStudentData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStudentData = async () => {
            try {
                // Fetch student profile data
                const response = await fetch('/api/auth/me');
                if (response.ok) {
                    const data = await response.json();

                    // Fetch additional student details from database
                    const studentResponse = await fetch(`/api/dashboard/student/profile/${data.user?.username}`);
                    if (studentResponse.ok) {
                        const studentDetails = await studentResponse.json();
                        setStudentData({
                            ...data.user,
                            ...studentDetails
                        });
                    } else {
                        // Fallback to basic data if student details not found
                        setStudentData(data.user);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch student data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStudentData();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!studentData) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-600">Failed to load student data</p>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
                <p className="mt-2 text-gray-600">Welcome back, {studentData.name}!</p>
            </div>

            {/* Overview Section */}
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <FiUser className="mr-2" />
                        Personal Details
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Basic Information */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg">Basic Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="flex items-center text-sm">
                                    <FiUser className="mr-2 text-gray-500" size={16} />
                                    <span className="text-gray-600">Name:</span>
                                    <span className="ml-2 font-medium">{studentData.name}</span>
                                </div>
                                <div className="flex items-center text-sm">
                                    <FiMail className="mr-2 text-gray-500" size={16} />
                                    <span className="text-gray-600">Email:</span>
                                    <span className="ml-2 font-medium">{studentData.email}</span>
                                </div>
                                <div className="flex items-center text-sm">
                                    <FiUsers className="mr-2 text-gray-500" size={16} />
                                    <span className="text-gray-600">Username:</span>
                                    <span className="ml-2 font-medium">{studentData.username}</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Academic Information */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg">Academic Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="flex items-center text-sm">
                                    <FiBook className="mr-2 text-gray-500" size={16} />
                                    <span className="text-gray-600">Branch:</span>
                                    <span className="ml-2 font-medium">{studentData.branch || 'N/A'}</span>
                                </div>
                                <div className="flex items-center text-sm">
                                    <FiCalendar className="mr-2 text-gray-500" size={16} />
                                    <span className="text-gray-600">Year:</span>
                                    <span className="ml-2 font-medium">{studentData.year || 'N/A'}</span>
                                </div>
                                <div className="flex items-center text-sm">
                                    <FiUsers className="mr-2 text-gray-500" size={16} />
                                    <span className="text-gray-600">Cluster:</span>
                                    <span className="ml-2 font-medium">{studentData.cluster || 'N/A'}</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Contact Information */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg">Contact Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="flex items-center text-sm">
                                    <FiPhone className="mr-2 text-gray-500" size={16} />
                                    <span className="text-gray-600">Phone:</span>
                                    <span className="ml-2 font-medium">{studentData.phoneNumber || 'N/A'}</span>
                                </div>
                                <div className="flex items-center text-sm">
                                    <FiMapPin className="mr-2 text-gray-500" size={16} />
                                    <span className="text-gray-600">Residence:</span>
                                    <span className="ml-2 font-medium">{studentData.residenceType || 'N/A'}</span>
                                </div>
                                {studentData.hostelName && studentData.hostelName !== 'N/A' && (
                                    <div className="flex items-center text-sm">
                                        <FiMapPin className="mr-2 text-gray-500" size={16} />
                                        <span className="text-gray-600">Hostel:</span>
                                        <span className="ml-2 font-medium">{studentData.hostelName}</span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </CardContent>
            </Card>

            {/* Address Information */}
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <FiMapPin className="mr-2" />
                        Address Details
                    </CardTitle>
                </CardHeader>
                <CardContent>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center text-sm">
                            <span className="text-gray-600 w-20">Country:</span>
                            <span className="font-medium">{studentData.country || 'N/A'}</span>
                        </div>
                        <div className="flex items-center text-sm">
                            <span className="text-gray-600 w-20">State:</span>
                            <span className="font-medium">{studentData.state || 'N/A'}</span>
                        </div>
                        <div className="flex items-center text-sm">
                            <span className="text-gray-600 w-20">District:</span>
                            <span className="font-medium">{studentData.district || 'N/A'}</span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center text-sm">
                            <span className="text-gray-600 w-20">Pincode:</span>
                            <span className="font-medium">{studentData.pincode || 'N/A'}</span>
                        </div>
                        {studentData.busRoute && (
                            <div className="flex items-center text-sm">
                                <span className="text-gray-600 w-20">Bus Route:</span>
                                <span className="font-medium">{studentData.busRoute}</span>
                            </div>
                        )}
                        <div className="flex items-center text-sm">
                            <span className="text-gray-600 w-20">Registered:</span>
                            <span className="font-medium">
                                {studentData.created_at ? new Date(studentData.created_at).toLocaleDateString() : 'N/A'}
                            </span>
                        </div>
                    </div>
                </div>
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button
                        onClick={() => window.location.href = '/dashboard/student/club'}
                        variant="outline"
                        className="p-4 h-auto text-left justify-start"
                    >
                        <div>
                            <h3 className="font-medium text-gray-900">View Club Details</h3>
                            <p className="text-sm text-gray-600">Check your club information</p>
                        </div>
                    </Button>
                    <Button
                        onClick={() => window.location.href = '/auth/login'}
                        variant="outline"
                        className="p-4 h-auto text-left justify-start"
                    >
                        <h3 className="font-medium text-gray-900">Change Password</h3>
                        <p className="text-sm text-gray-600">Update your account password</p>
                    </Button>
                    <Button
                        variant="outline"
                        className="p-4 h-auto text-left justify-start"
                    >
                        <div>
                            <h3 className="font-medium text-gray-900">Contact Support</h3>
                            <p className="text-sm text-gray-600">Get help with your account</p>
                        </div>
                    </Button>
                </div>
                </CardContent>
            </Card>
        </div>
    );
}
