"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FiMail, FiRefreshCw, FiClock, FiCheckCircle, FiXCircle, FiAlertTriangle } from "react-icons/fi";
import { handleApiError } from '@/lib/apiErrorHandler';

export default function EmailQueuePage() {
    const [queueData, setQueueData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hasAccess, setHasAccess] = useState(null);
    const [stats, setStats] = useState({
        pending: 0,
        sent: 0,
        failed: 0,
        total: 0
    });
    const router = useRouter();

    const checkAccess = useCallback(async () => {
        try {
            const response = await fetch('/api/auth/me');
            
            if (await handleApiError(response)) {
                return; // Error was handled
            }

            if (response.ok) {
                const data = await response.json();
                const hasDevAccess = data.username === '2300032048';
                setHasAccess(hasDevAccess);
                
                if (!hasDevAccess) {
                    router.push('/dashboard/admin');
                }
            } else {
                setHasAccess(false);
                router.push('/dashboard/admin');
            }
        } catch (error) {
            console.error('Error checking access:', error);
            setHasAccess(false);
            router.push('/dashboard/admin');
        }
    }, [router]);

    const fetchEmailQueue = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/dashboard/admin/email-status');
            
            if (await handleApiError(response)) {
                return; // Error was handled
            }

            if (response.ok) {
                const data = await response.json();
                setQueueData(data.emails || []);
                setStats(data.stats || { pending: 0, sent: 0, failed: 0, total: 0 });
            } else if (response.status === 403) {
                router.push('/dashboard/admin');
            }
        } catch (error) {
            console.error('Failed to fetch email queue:', error);
        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => {
        checkAccess();
    }, [checkAccess]);

    useEffect(() => {
        if (hasAccess === true) {
            fetchEmailQueue();
            // Refresh every 30 seconds
            const interval = setInterval(fetchEmailQueue, 45000);
            return () => clearInterval(interval);
        }
    }, [hasAccess, fetchEmailQueue]);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending':
                return <FiClock className="text-gray-600" />;
            case 'sent':
                return <FiCheckCircle className="text-gray-900" />;
            case 'failed':
                return <FiXCircle className="text-gray-900" />;
            default:
                return <FiMail className="text-gray-500" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-gray-100 text-gray-800';
            case 'sent':
                return 'bg-black text-white';
            case 'failed':
                return 'bg-gray-800 text-white';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const renderQueueData = () => {
        if (loading) {
            return (
                <div className="flex justify-center items-center h-32">
                    <FiRefreshCw className="h-8 w-8 animate-spin text-gray-400" />
                </div>
            );
        }

        if (queueData.length === 0) {
            return (
                <div className="flex justify-center items-center h-32">
                    <p className="text-gray-500">No emails in queue</p>
                </div>
            );
        }

        return (
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Username
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Created
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Sent At
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {queueData.map((email, index) => {
                        const uniqueKey = email.id ? `email-${email.id}` : `email-${email.email}-${index}`;
                        return (
                            <tr key={uniqueKey} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        {getStatusIcon(email.status)}
                                        <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(email.status)}`}>
                                            {email.status}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {email.email}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {email.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {email.username}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(email.created_at).toLocaleString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {email.sent_at ? new Date(email.sent_at).toLocaleString() : '-'}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        );
    };

    // Show loading while checking access
    if (hasAccess === null) {
        return (
            <div className="p-6">
                <div className="flex justify-center items-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Checking access permissions...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Show access denied if user doesn't have dev access
    if (hasAccess === false) {
        return (
            <div className="p-6">
                <div className="flex justify-center items-center h-64">
                    <div className="text-center">
                        <FiAlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
                        <p className="text-gray-600">You don&apos;t have permission to access this page.</p>
                        <p className="text-sm text-gray-500 mt-2">Developer privileges required.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Email Queue Management</h1>
                <button
                    onClick={fetchEmailQueue}
                    disabled={loading}
                    className="flex items-center space-x-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
                >
                    <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                    <div className="flex items-center">
                        <FiMail className="h-8 w-8 text-black" />
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Emails</p>
                            <p className="text-2xl font-bold text-black">{stats.total}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                    <div className="flex items-center">
                        <FiClock className="h-8 w-8 text-black" />
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Pending</p>
                            <p className="text-2xl font-bold text-black">{stats.pending}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                    <div className="flex items-center">
                        <FiCheckCircle className="h-8 w-8 text-black" />
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Sent</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.sent}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow border-l-4 border-gray-500">
                    <div className="flex items-center">
                        <FiXCircle className="h-8 w-8 text-gray-900" />
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Failed</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.failed}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Email Queue Table */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Recent Email Queue</h3>
                </div>
                <div className="overflow-x-auto">
                    {renderQueueData()}
                </div>
            </div>
        </div>
    );
}
