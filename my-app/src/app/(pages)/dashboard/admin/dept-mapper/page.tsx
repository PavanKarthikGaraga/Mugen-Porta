"use client";

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { FiTrash, FiPlusCircle } from 'react-icons/fi';

export default function DeptMapperPage() {
    const [mappings, setMappings] = useState([]);
    const [clubs, setClubs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Form state
    const [groupType, setGroupType] = useState('DEPARTMENT');
    const [groupName, setGroupName] = useState('');
    const [clubId, setClubId] = useState('');

    const loadData = async () => {
        setLoading(true);
        try {
            const mappingsRes = await fetch('/api/dashboard/admin/dept-mapper');
            if (mappingsRes.ok) {
                const mappingData = await mappingsRes.json();
                setMappings(mappingData);
            }
        } catch (error) {
            console.error('Failed to fetch mappings', error);
        }
        
        try {
            const clubsRes = await fetch('/api/dashboard/admin/clubs');
            if (clubsRes.ok) {
                const clubData = await clubsRes.json();
                setClubs(clubData);
            }
        } catch (error) {
            console.error('Failed to fetch clubs', error);
        }
        setLoading(false);
    };

    const fetchMappings = async () => {
        try {
            const res = await fetch('/api/dashboard/admin/dept-mapper');
            if (res.ok) {
                const data = await res.json();
                setMappings(data);
            }
        } catch (error) {
            console.error('Failed to fetch mappings', error);
        }
    };

    useEffect(() => {
        let isMounted = true;
        const initialLoad = async () => {
            setLoading(true);
            try {
                const [mappingsRes, clubsRes] = await Promise.all([
                    fetch('/api/dashboard/admin/dept-mapper'),
                    fetch('/api/dashboard/admin/clubs')
                ]);
                
                if (mappingsRes.ok && isMounted) {
                    const mappingData = await mappingsRes.json();
                    setMappings(mappingData);
                }
                
                if (clubsRes.ok && isMounted) {
                    const clubData = await clubsRes.json();
                    setClubs(clubData);
                }
            } catch (error) {
                console.error('Failed to fetch initial data', error);
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        
        initialLoad();
        return () => { isMounted = false; };
    }, []);

    const handleAddMapping = async (e) => {
        e.preventDefault();
        
        if (!groupType || !groupName || !clubId) {
            toast.error("Please fill in all fields");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch('/api/dashboard/admin/dept-mapper', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    group_type: groupType,
                    group_name: groupName,
                    club_id: clubId
                })
            });
            
            const data = await res.json();
            
            if (res.ok) {
                toast.success('Mapping added successfully');
                setClubId(''); // Reset club selection
                fetchMappings();
            } else {
                toast.error(data.error || 'Failed to add mapping');
            }
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteMapping = async (id) => {
        if (!confirm('Are you sure you want to delete this mapping?')) return;
        
        try {
            const res = await fetch(`/api/dashboard/admin/dept-mapper?id=${id}`, {
                method: 'DELETE'
            });
            
            if (res.ok) {
                toast.success('Mapping deleted');
                fetchMappings();
            } else {
                toast.error('Failed to delete mapping');
            }
        } catch (error) {
            toast.error('An error occurred');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-700"></div>
            </div>
        );
    }

    // Group mappings for display
    const groupedMappings = mappings.reduce((acc, curr) => {
        if (!acc[curr.group_type]) acc[curr.group_type] = {};
        if (!acc[curr.group_type][curr.group_name]) acc[curr.group_type][curr.group_name] = [];
        acc[curr.group_type][curr.group_name].push(curr);
        return acc;
    }, {});

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Department to Club Mapper</h1>
                <button 
                    onClick={loadData}
                    className="flex items-center space-x-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-md transition-colors"
                >
                    <span>Refresh Data</span>
                </button>
            </div>
            
            <p className="text-gray-600">
                Manage which clubs belong to which department. This dynamically updates the registration page categories.
                Any Engineering Club (starting with DEP) not mapped here will automatically be placed in an &quot;Others&quot; category.
            </p>

            {/* Add New Mapping Form */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                    <FiPlusCircle className="mr-2" /> Add New Mapping
                </h2>
                <form onSubmit={handleAddMapping} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Group Type</label>
                        <select
                            value={groupType}
                            onChange={(e) => setGroupType(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
                        >
                            <option value="DEPARTMENT">Engineering Dept. Clubs</option>
                        </select>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Department/Category Name</label>
                        <input
                            type="text"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            placeholder="e.g. CSE-1 Department"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
                            required
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Select Club</label>
                        <select
                            value={clubId}
                            onChange={(e) => setClubId(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
                            required
                        >
                            <option value="">Choose a club...</option>
                            {clubs.filter(c => groupType === 'DEPARTMENT' ? c.id.startsWith('DEP') : c.domain === 'MHS. CLUBS').map(club => (
                                <option key={club.id} value={club.id}>
                                    {club.id} - {club.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    <div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-red-700 hover:bg-red-800 text-white py-2 px-4 rounded-md transition-colors disabled:bg-red-400"
                        >
                            {isSubmitting ? 'Adding...' : 'Add Mapping'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Display Mappings */}
            <div className="grid grid-cols-1 gap-6">
                {/* Engineering Departments */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Engineering Dept. Categories</h2>
                    {groupedMappings['DEPARTMENT'] ? (
                        <div className="space-y-6">
                            {Object.entries(groupedMappings['DEPARTMENT']).map(([deptName, deptClubs]) => (
                                <div key={deptName} className="bg-gray-50 p-4 rounded-md border border-gray-100">
                                    <h3 className="font-semibold text-lg text-red-800 mb-3">{deptName}</h3>
                                    <ul className="space-y-2">
                                        {(deptClubs as any[]).map(mapping => (
                                            <li key={mapping.id} className="flex justify-between items-center bg-white p-2 rounded border border-gray-200">
                                                <div className="text-sm">
                                                    <span className="font-mono text-gray-500 mr-2">{mapping.club_id}</span>
                                                    <span className="font-medium">{mapping.club_name}</span>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteMapping(mapping.id)}
                                                    className="text-red-500 hover:text-red-700 p-1"
                                                    title="Delete mapping"
                                                >
                                                    <FiTrash size={16} />
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 italic">No engineering department mappings found.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
