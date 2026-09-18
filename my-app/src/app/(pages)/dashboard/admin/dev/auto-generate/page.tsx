'use client';

import React, { useState, useEffect } from 'react';

type Activity = {
    code: string;
    title: string;
    domain: string;
    credits: number;
    badgeId: number | null;
    totalPresent: number;
    missingPoints: number;
    missingCerts: number;
    missingBadges: number;
};

export default function AutoGeneratePage() {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCodes, setSelectedCodes] = useState<Set<string>>(new Set());
    
    // Processing Queue State
    const [isProcessing, setIsProcessing] = useState(false);
    const [currentProcessIndex, setCurrentProcessIndex] = useState(0);
    const [processingLogs, setProcessingLogs] = useState<string[]>([]);

    useEffect(() => {
        fetchActivities();
    }, []);

    const fetchActivities = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/dashboard/admin/dev/auto-generate/activities');
            const json = await res.json();
            if (json.success) {
                setActivities(json.activities || []);
            } else {
                alert(json.error || 'Failed to fetch activities');
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred while fetching activities');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedCodes(new Set(activities.map(a => a.code)));
        } else {
            setSelectedCodes(new Set());
        }
    };

    const handleSelectActivity = (code: string, checked: boolean) => {
        const newSet = new Set(selectedCodes);
        if (checked) {
            newSet.add(code);
        } else {
            newSet.delete(code);
        }
        setSelectedCodes(newSet);
    };

    const generateBadge = async (code: string) => {
        try {
            const res = await fetch('/api/dashboard/admin/dev/auto-generate/badges', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ activity_code: code })
            });
            const json = await res.json();
            if (json.success) {
                alert('Badge generated successfully!');
                fetchActivities(); // Refresh to get the new badgeId
            } else {
                alert(json.message || json.error || 'Failed to generate badge');
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred generating the badge');
        }
    };

    const startProcessing = async () => {
        if (selectedCodes.size === 0) return;
        if (!confirm(`Are you sure you want to process ${selectedCodes.size} activities? This might take a while. Please do not close the tab.`)) return;

        setIsProcessing(true);
        setCurrentProcessIndex(0);
        setProcessingLogs([]);

        const codesArray = Array.from(selectedCodes);

        for (let i = 0; i < codesArray.length; i++) {
            const code = codesArray[i];
            setCurrentProcessIndex(i + 1);
            
            try {
                const res = await fetch('/api/dashboard/admin/dev/auto-generate/execute', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ activity_code: code })
                });
                const json = await res.json();

                if (json.success) {
                    setProcessingLogs(prev => [...prev, `[SUCCESS] ${code}: Awarded ${json.pointsAwarded} points, ${json.certsAwarded} certs, ${json.badgesAwarded} badges.`]);
                } else {
                    setProcessingLogs(prev => [...prev, `[ERROR] ${code}: ${json.message || json.error}`]);
                }
            } catch (error) {
                setProcessingLogs(prev => [...prev, `[ERROR] ${code}: Network or server error`]);
            }
        }

        setIsProcessing(false);
        setSelectedCodes(new Set());
        fetchActivities(); // Refresh data after completion
    };

    // Calculate Preview Stats
    const selectedActivities = activities.filter(a => selectedCodes.has(a.code));
    const totalPoints = selectedActivities.reduce((sum, a) => sum + (a.missingPoints * a.credits), 0);
    const totalCerts = selectedActivities.reduce((sum, a) => sum + a.missingCerts, 0);
    const totalBadges = selectedActivities.reduce((sum, a) => sum + (a.badgeId ? a.missingBadges : 0), 0);
    const missingBadgeDefsCount = selectedActivities.filter(a => !a.badgeId && a.missingBadges > 0).length;

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Auto-Generate Allotments</h1>
                <p className="text-gray-600 mt-2">Safely issue missing points, certificates, and badges for completed activities across all domains.</p>
            </div>

            {loading ? (
                <div className="text-center py-10 text-gray-500">Loading activities...</div>
            ) : activities.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-lg shadow border border-gray-200">
                    <p className="text-gray-500">No completed activities found with missing allotments.</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0 z-10 shadow-sm">
                                <tr>
                                    <th className="px-4 py-3">
                                        <input 
                                            type="checkbox" 
                                            className="w-4 h-4 rounded border-gray-300"
                                            checked={selectedCodes.size === activities.length && activities.length > 0}
                                            onChange={handleSelectAll}
                                            disabled={isProcessing}
                                        />
                                    </th>
                                    <th className="px-4 py-3">Activity</th>
                                    <th className="px-4 py-3">Domain</th>
                                    <th className="px-4 py-3 text-center">Missing Points</th>
                                    <th className="px-4 py-3 text-center">Missing Certs</th>
                                    <th className="px-4 py-3 text-center">Missing Badges</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {activities.map((activity) => (
                                    <tr key={activity.code} className="border-b hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                            <input 
                                                type="checkbox"
                                                className="w-4 h-4 rounded border-gray-300"
                                                checked={selectedCodes.has(activity.code)}
                                                onChange={(e) => handleSelectActivity(activity.code, e.target.checked)}
                                                disabled={isProcessing}
                                            />
                                        </td>
                                        <td className="px-4 py-3 font-medium text-gray-900">
                                            <div className="flex flex-col">
                                                <span>{activity.title}</span>
                                                <span className="text-xs text-gray-500">{activity.code} ({activity.totalPresent} Present)</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">{activity.domain}</span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {activity.missingPoints > 0 ? (
                                                <span className="text-amber-600 font-bold">{activity.missingPoints} ({activity.missingPoints * activity.credits} pts)</span>
                                            ) : <span className="text-gray-300">-</span>}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {activity.missingCerts > 0 ? (
                                                <span className="text-blue-600 font-bold">{activity.missingCerts}</span>
                                            ) : <span className="text-gray-300">-</span>}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {activity.missingBadges > 0 ? (
                                                activity.badgeId ? (
                                                    <span className="text-purple-600 font-bold">{activity.missingBadges}</span>
                                                ) : (
                                                    <span className="text-red-500 font-bold text-xs" title="Badge missing in catalogue">Unmapped ({activity.missingBadges})</span>
                                                )
                                            ) : <span className="text-gray-300">-</span>}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {!activity.badgeId && activity.missingBadges > 0 && (
                                                <button 
                                                    onClick={() => generateBadge(activity.code)}
                                                    disabled={isProcessing}
                                                    className="px-3 py-1 bg-purple-100 text-purple-700 hover:bg-purple-200 rounded text-xs font-medium transition-colors"
                                                >
                                                    Generate Badge
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Sticky Preview Footer */}
            {selectedCodes.size > 0 && (
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] p-4 z-50">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div className="flex flex-col">
                                <span className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Selected</span>
                                <span className="text-xl font-bold text-gray-900">{selectedCodes.size} <span className="text-sm font-normal text-gray-600">Activities</span></span>
                            </div>
                            <div className="h-10 w-px bg-gray-200"></div>
                            <div className="flex items-center gap-4">
                                <div className="bg-amber-50 border border-amber-200 rounded px-3 py-2">
                                    <span className="block text-xs text-amber-700 font-semibold uppercase">Points</span>
                                    <span className="text-lg font-bold text-amber-900">{totalPoints}</span>
                                </div>
                                <div className="bg-blue-50 border border-blue-200 rounded px-3 py-2">
                                    <span className="block text-xs text-blue-700 font-semibold uppercase">Certificates</span>
                                    <span className="text-lg font-bold text-blue-900">{totalCerts}</span>
                                </div>
                                <div className="bg-purple-50 border border-purple-200 rounded px-3 py-2">
                                    <span className="block text-xs text-purple-700 font-semibold uppercase">Badges</span>
                                    <span className="text-lg font-bold text-purple-900">{totalBadges}</span>
                                </div>
                                {missingBadgeDefsCount > 0 && (
                                    <div className="bg-red-50 border border-red-200 rounded px-3 py-2 flex items-center gap-2">
                                        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                        <div>
                                            <span className="block text-xs text-red-700 font-semibold uppercase">Warnings</span>
                                            <span className="text-sm font-medium text-red-900">{missingBadgeDefsCount} activities missing badge mapping</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div>
                            {isProcessing ? (
                                <div className="flex items-center gap-3 bg-gray-100 rounded-lg px-4 py-2">
                                    <div className="w-5 h-5 border-2 border-gray-400 border-t-gray-800 rounded-full animate-spin"></div>
                                    <span className="text-sm font-medium text-gray-700">Processing {currentProcessIndex} of {selectedCodes.size}...</span>
                                </div>
                            ) : (
                                <button
                                    onClick={startProcessing}
                                    className="bg-black text-white hover:bg-gray-800 px-6 py-3 rounded-lg font-medium shadow-sm transition-colors flex items-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                    Execute Allotment
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Processing Logs Modal / Overlay */}
            {(isProcessing || processingLogs.length > 0) && (
                <div className="fixed top-24 right-6 w-96 bg-gray-900 text-gray-100 rounded-lg shadow-xl overflow-hidden z-50 flex flex-col border border-gray-700 max-h-[500px]">
                    <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between bg-gray-800">
                        <h3 className="font-semibold text-sm">Execution Logs</h3>
                        {!isProcessing && (
                            <button onClick={() => setProcessingLogs([])} className="text-gray-400 hover:text-white">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        )}
                    </div>
                    <div className="p-4 overflow-y-auto flex-1 font-mono text-xs flex flex-col gap-2">
                        {processingLogs.length === 0 ? (
                            <span className="text-gray-500 italic">Starting queue...</span>
                        ) : (
                            processingLogs.map((log, i) => (
                                <div key={i} className={log.includes('[ERROR]') ? 'text-red-400' : 'text-green-400'}>
                                    {log}
                                </div>
                            ))
                        )}
                        {isProcessing && (
                            <div className="text-blue-400 animate-pulse">Running next batch...</div>
                        )}
                    </div>
                </div>
            )}
            
            {/* Pad the bottom so the sticky footer doesn't hide content */}
            <div className="h-24"></div>
        </div>
    );
}
