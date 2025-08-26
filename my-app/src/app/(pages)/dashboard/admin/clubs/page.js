"use client"
import { useState, useEffect } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiSave, FiX, FiTag } from "react-icons/fi";
import { handleApiError, handleApiSuccess } from "@/lib/apiErrorHandler";

export default function ClubsPage() {
    const [clubs, setClubs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingClub, setEditingClub] = useState(null);
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        description: '',
        domain: '',
        categories: [],
    memberLimit: ''
    });
    const [newCategory, setNewCategory] = useState('');

    useEffect(() => {
        fetchClubs();
    }, []);

    const fetchClubs = async () => {
        try {
            const response = await fetch('/api/dashboard/admin/clubs');
            
            if (await handleApiError(response)) {
                return; // Error was handled
            }
            
            if (response.ok) {
                const data = await response.json();
                setClubs(data);
            }
        } catch (error) {
            console.error('Error fetching clubs:', error);
        }
        setLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = editingClub ? `/api/dashboard/admin/clubs/${editingClub.id}` : '/api/dashboard/admin/clubs';
            const method = editingClub ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (await handleApiError(response)) {
                return; // Error was handled
            }

            if (response.ok) {
                handleApiSuccess(editingClub ? 'Club updated successfully' : 'Club created successfully');
                fetchClubs();
                resetForm();
            }
        } catch (error) {
            console.error('Error saving club:', error);
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this club?')) {
            try {
                const response = await fetch(`/api/dashboard/admin/clubs/${id}`, {
                    method: 'DELETE',
                });

                if (await handleApiError(response)) {
                    return; // Error was handled
                }

                if (response.ok) {
                    handleApiSuccess('Club deleted successfully');
                    fetchClubs();
                }
            } catch (error) {
                console.error('Error deleting club:', error);
            }
        }
    };

    const resetForm = () => {
        setFormData({
            id: '',
            name: '',
            description: '',
            domain: '',
            categories: [],
            memberLimit: ''
        });
        setEditingClub(null);
        setShowModal(false);
        setNewCategory('');
    };

    const startEdit = (club) => {
        setEditingClub(club);
        setFormData({
            id: club.id,
            name: club.name,
            description: club.description,
            domain: club.domain || '',
            categories: Array.isArray(club.categories) ? club.categories : JSON.parse(club.categories || '[]'),
            memberLimit: club.memberLimit || ''
        });
        setShowModal(true);
    };

    const addCategory = () => {
        if (newCategory.trim() && !formData.categories.includes(newCategory.trim())) {
            setFormData({
                ...formData,
                categories: [...formData.categories, newCategory.trim()]
            });
            setNewCategory('');
        }
    };

    const removeCategory = (categoryToRemove) => {
        setFormData({
            ...formData,
            categories: formData.categories.filter(cat => cat !== categoryToRemove)
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Clubs Management</h1>
                    <p className="text-gray-600 mt-1">Manage clubs and their categories</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-800 text-white rounded-lg hover:bg-red-900 transition-colors"
                >
                    <FiPlus className="h-4 w-4" />
                    <span>Add Club</span>
                </button>
            </div>

            {/* Clubs List */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200">
                {loading && (
                    <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-800 mx-auto"></div>
                        <p className="mt-2 text-gray-600">Loading clubs...</p>
                    </div>
                )}
                
                {!loading && clubs.length === 0 && (
                    <div className="p-8 text-center">
                        <p className="text-gray-500">No clubs found. Create your first club!</p>
                    </div>
                )}
                
                {!loading && clubs.length > 0 && (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Description
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Categories
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Limit
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {clubs.map((club) => (
                                    <tr key={club.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {club.id}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {club.name}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                                            {club.description}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            <div className="flex flex-wrap gap-1">
                                                {(Array.isArray(club.categories) ? club.categories : JSON.parse(club.categories || '[]')).map((category, index) => (
                                                    <span
                                                        key={`${club.id}-${category}-${index}`}
                                                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-black-300"
                                                    >
                                                        {category}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {club.memberLimit || '50'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                            <button
                                                onClick={() => startEdit(club)}
                                                className="text-black-800 cursor-pointer hover:text-red-900 p-1 rounded"
                                            >
                                                <FiEdit2 className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(club.id)}
                                                className="text-red-600 cursor-pointer hover:text-black-800 p-1 rounded"
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
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 border border-gray-300">
                        <div className="flex justify-between items-center p-6 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">
                                {editingClub ? 'Edit Club' : 'Add New Club'}
                            </h3>
                            <button
                                onClick={resetForm}
                                className="text-gray-400 hover:text-gray-600 p-1 rounded"
                            >
                                <FiX className="h-6 w-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label htmlFor="clubId" className="block text-sm font-medium text-gray-700 mb-1">
                                    Club ID
                                </label>
                                <input
                                    id="clubId"
                                    type="text"
                                    value={formData.id}
                                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent ${editingClub ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                    required
                                    disabled={editingClub}
                                    maxLength={4}
                                    placeholder="4 characters max"
                                />
                            </div>
                            <div>
                                <label htmlFor="clubName" className="block text-sm font-medium text-gray-700 mb-1">
                                    Club Name
                                </label>
                                <input
                                    id="clubName"
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent ${editingClub ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                    required
                                    disabled={editingClub}
                                />
                            </div>
                            <div>
                                <label htmlFor="clubDescription" className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    id="clubDescription"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="clubDomain" className="block text-sm font-medium text-gray-700 mb-1">
                                    Domain
                                </label>
                                <select
                                    id="clubDomain"
                                    value={formData.domain}
                                    onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent"
                                    required
                                >
                                    <option value="">Select Domain</option>
                                    <option value="TEC">TEC</option>
                                    <option value="LCH">LCH</option>
                                    <option value="ESO">ESO</option>
                                    <option value="IIE">IIE</option>
                                    <option value="HWB">HWB</option>
                                    {/* <option value="Rural">Rural</option> */}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="clubMemberLimit" className="block text-sm font-medium text-gray-700 mb-1">
                                    Member Limit
                                </label>
                                <input
                                    id="clubMemberLimit"
                                    type="number"
                                    min="1"
                                    value={formData.memberLimit}
                                    onChange={(e) => setFormData({ ...formData, memberLimit: e.target.value })}
                                    placeholder="Default: 50"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label htmlFor="categories" className="block text-sm font-medium text-gray-700 mb-1">
                                    Categories
                                </label>
                                <div className="flex space-x-2 mb-2">
                                    <input
                                        id="categories"
                                        type="text"
                                        value={newCategory}
                                        onChange={(e) => setNewCategory(e.target.value)}
                                        placeholder="Add category"
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent"
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                addCategory();
                                            }
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={addCategory}
                                        className="px-3 py-2 bg-red-800 text-white rounded-md hover:bg-red-900 transition-colors"
                                    >
                                        <FiTag className="h-4 w-4" />
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {formData.categories.map((category, index) => (
                                        <span
                                            key={`category-${category}-${index}`}
                                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800 border border-gray-300"
                                        >
                                            {category}
                                            <button
                                                type="button"
                                                onClick={() => removeCategory(category)}
                                                className="ml-2 text-gray-500 hover:text-red-600 transition-colors"
                                            >
                                                <FiX className="h-3 w-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>
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
                                    <span>{editingClub ? 'Update' : 'Save'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
