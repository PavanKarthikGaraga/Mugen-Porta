"use client"
import { useState, useEffect } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiSave, FiX } from "react-icons/fi";

export default function ProjectsPage() {
    const [projects, setProjects] = useState([]);
    const [clubs, setClubs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [formData, setFormData] = useState({
        id: '',
        domain: '',
        clubId: '',
        category: '',
        rural: false,
        ruralCategory: '',
        subCategory: '',
        name: '',
        description: ''
    });
    const [selectedClubCategories, setSelectedClubCategories] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    // Rural categories definition
    const ruralCategories = [
  { id: 'health-hygiene', name: 'Health and Hygiene' },
  { id: 'village-infrastructure', name: 'Village Infrastructure' },
  { id: 'water-conservation', name: 'Water Conservation' },
  { id: 'energy-utilization-efficiency', name: 'Energy Utilization & Efficiency' },
  { id: 'community-actions', name: 'Community Actions' },
  { id: 'agriculture', name: 'Agriculture' },
  { id: 'water-sanitation', name: 'Water and Sanitation' },
  { id: 'waste-management', name: 'Waste Management' },
  { id: 'digital-literacy-ict', name: 'Digital Literacy & ICT' },
  { id: 'women-empowerment-gender-equality', name: 'Women Empowerment & Gender Equality' },
  { id: 'renewable-energy-sustainability', name: 'Renewable Energy & Sustainability' },
  { id: 'nutrition-food-security', name: 'Nutrition & Food Security' },
  { id: 'disaster-preparedness-resilience', name: 'Disaster Preparedness & Resilience' },
  { id: 'cultural-heritage-narratives', name: 'Cultural Heritage & Narratives' },
  { id: 'green-innovations-tree-plantation', name: 'Green Innovations & Tree Plantation' },
  { id: 'livelihood-entrepreneurship', name: 'Livelihood & Entrepreneurship' },
  { id: 'rural-urban-education', name: 'Rural/Urban Education' },
  { id: 'sports-wellness-engagement', name: 'Sports & Wellness Engagement' },
  { id: 'skill-identification-development', name: 'Skill Identification & Development' },
  { id: 'mental-health-well-being', name: 'Mental Health & Well-Being' }
];


    // Function to generate category abbreviation
    const generateCategoryAbbreviation = (category) => {
        const words = category.split(' ');
        if (words.length === 1) {
            return words[0].substring(0, 2).toUpperCase();
        } else {
            return words.map(word => word.charAt(0).toUpperCase()).join('');
        }
    };

    // Function to generate next project ID
    const generateProjectId = (clubId, category) => {
        if (!clubId || !category) return '';
        
        const categoryAbbr = generateCategoryAbbreviation(category);
        const baseId = `${clubId}${categoryAbbr}`;
        
        // Find existing projects with same base
        const existingProjects = projects.filter(p => p.id.startsWith(baseId));
        const nextNumber = existingProjects.length + 1;
        
        return `${baseId}${nextNumber}`;
    };

    useEffect(() => {
        fetchProjects();
        fetchClubs();
    }, []);

    const fetchProjects = async () => {
        try {
            const response = await fetch('/api/dashboard/admin/projects');
            if (response.ok) {
                const data = await response.json();
                setProjects(data);
            }
        } catch (error) {
            console.error('Error fetching projects:', error);
        }
        setLoading(false);
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
            let projectData = { ...formData };

            // Add image data for LCH handicrafts/painting clubs
            if (isLCHHandicraftsOrPainting() && selectedImage) {
                // Convert image to base64
                const base64 = await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = (e) => resolve(e.target.result);
                    reader.readAsDataURL(selectedImage);
                });

                projectData.image = base64;
            }

            // Save the project with image data
            const url = editingProject ? `/api/dashboard/admin/projects/${editingProject.id}` : '/api/dashboard/admin/projects';
            const method = editingProject ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(projectData),
            });

            if (response.ok) {
                fetchProjects();
                resetForm();
            } else {
                const errorData = await response.json();
                console.error('Failed to save project:', errorData);
            }
        } catch (error) {
            console.error('Error saving project:', error);
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this project?')) {
            try {
                const response = await fetch(`/api/dashboard/admin/projects/${id}`, {
                    method: 'DELETE',
                });

                if (response.ok) {
                    fetchProjects();
                }
            } catch (error) {
                console.error('Error deleting project:', error);
            }
        }
    };

    const resetForm = () => {
        setFormData({
            id: '',
            domain: '',
            clubId: '',
            category: '',
            rural: false,
            ruralCategory: '',
            subCategory: '',
            name: '',
            description: ''
        });
        setEditingProject(null);
        setShowModal(false);
        setSelectedClubCategories([]);
        setSelectedImage(null);
        setImagePreview(null);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const isLCHHandicraftsOrPainting = () => {
        if (formData.domain === 'LCH' && formData.clubId) {
            const selectedClub = clubs.find(club => club.id === formData.clubId);
            if (selectedClub) {
                const clubName = selectedClub.name.toLowerCase();
                return clubName.includes('handicraft') || clubName.includes('painting');
            }
        }
        return false;
    };

    const startEdit = (project) => {
        setEditingProject(project);
        setFormData({
            id: project.id,
            domain: project.domain,
            clubId: project.clubId,
            category: project.category,
            rural: project.rural || false,
            ruralCategory: project.ruralCategory || '',
            subCategory: project.subCategory || '',
            name: project.name,
            description: project.description
        });
        
        // Find and set the categories for the selected club
        const club = clubs.find(c => c.id == project.clubId);
        if (club) {
            const categories = Array.isArray(club.categories) ? club.categories : JSON.parse(club.categories || '[]');
            setSelectedClubCategories(categories);
        }
        
        setShowModal(true);
    };    const handleClubChange = (clubId) => {
        setFormData({ ...formData, clubId, category: '', id: '' });
        
        const club = clubs.find(c => c.id == clubId);
        if (club) {
            const categories = Array.isArray(club.categories) ? club.categories : JSON.parse(club.categories || '[]');
            setSelectedClubCategories(categories);
        } else {
            setSelectedClubCategories([]);
        }
    };

    const handleCategoryChange = (category) => {
        const newFormData = { ...formData, category };
        
        // Auto-generate project ID if not editing
        if (!editingProject && formData.clubId && category) {
            newFormData.id = generateProjectId(formData.clubId, category);
        }
        
        setFormData(newFormData);
    };

    const handleRuralCategoryChange = (ruralCategory) => {
        setFormData({ ...formData, ruralCategory, subCategory: '' });
    };

    const getFilteredClubs = () => {
        if (!formData.domain) return [];
        return clubs.filter(club => club.domain === formData.domain);
    };

    const handleDomainChange = (domain) => {
        setFormData({ 
            ...formData, 
            domain, 
            clubId: '',  // Clear club selection when domain changes
            category: '' // Clear category selection too
        });
        setSelectedClubCategories([]);
    };

    const getClubName = (clubId) => {
        const club = clubs.find(c => c.id == clubId);
        return club ? club.name : 'Unknown Club';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Projects Management</h1>
                    <p className="text-gray-600 mt-1">Manage projects under clubs</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-800 text-white rounded-lg hover:bg-red-900 transition-colors"
                >
                    <FiPlus className="h-4 w-4" />
                    <span>Add Project</span>
                </button>
            </div>

            {/* Projects List */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200">
                {loading && (
                    <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-800 mx-auto"></div>
                        <p className="mt-2 text-gray-600">Loading projects...</p>
                    </div>
                )}
                
                {!loading && projects.length === 0 && (
                    <div className="p-8 text-center">
                        <p className="text-gray-500">No projects found. Create your first project!</p>
                    </div>
                )}
                
                {!loading && projects.length > 0 && (
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
                                        Domain
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Club
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Category
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Rural
                                    </th>
                                    {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Description
                                    </th> */}
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {projects.map((project) => (
                                    <tr key={project.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {project.id}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {project.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                {project.domain}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {getClubName(project.clubId)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-300">
                                                {project.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {project.rural ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-300">
                                                    Rural
                                                </span>
                                            ) : (
                                                <span className="text-gray-400 text-xs">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                            <button
                                                onClick={() => startEdit(project)}
                                                className="text-red-800 hover:text-red-900 p-1 rounded"
                                            >
                                                <FiEdit2 className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(project.id)}
                                                className="text-red-600 hover:text-red-900 p-1 rounded"
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
                                {editingProject ? 'Edit Project' : 'Add New Project'}
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
                                <label htmlFor="projectId" className="block text-sm font-medium text-gray-700 mb-1">
                                    Project ID
                                </label>
                                <input
                                    id="projectId"
                                    type="text"
                                    value={formData.id}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed text-gray-600"
                                    required
                                    disabled={true}
                                    maxLength={10}
                                    placeholder="Auto-generated when category is selected"
                                    readOnly
                                />
                            </div>
                            <div>
                                <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 mb-1">
                                    Project Name
                                </label>
                                <input
                                    id="projectName"
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="projectDomain" className="block text-sm font-medium text-gray-700 mb-1">
                                    Domain
                                </label>
                                <select
                                    id="projectDomain"
                                    value={formData.domain}
                                    onChange={(e) => handleDomainChange(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent"
                                    required
                                >
                                    <option value="">Select Domain</option>
                                    <option value="TEC">TEC</option>
                                    <option value="LCH">LCH</option>
                                    <option value="ESO">ESO</option>
                                    <option value="IIE">IIE</option>
                                    <option value="HWB">HWB</option>
                                </select>
                            </div>
                            
                            {/* Rural Project Checkbox */}
                            <div className="flex items-center space-x-2">
                                <input
                                    id="ruralProject"
                                    type="checkbox"
                                    checked={formData.rural}
                                    onChange={(e) => setFormData({ ...formData, rural: e.target.checked, ruralCategory: '', subCategory: '' })}
                                    className="h-4 w-4 text-red-800 focus:ring-red-800 border-gray-300 rounded"
                                />
                                <label htmlFor="ruralProject" className="text-sm font-medium text-gray-700">
                                    This is a Rural Project
                                </label>
                            </div>
                            
                            {/* Rural Category Selection (only when rural checkbox is checked) */}
                            {formData.rural && (
                                <div>
                                    <label htmlFor="ruralCategory" className="block text-sm font-medium text-gray-700 mb-1">
                                        Rural Category
                                    </label>
                                    <select
                                        id="ruralCategory"
                                        value={formData.ruralCategory}
                                        onChange={(e) => handleRuralCategoryChange(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent"
                                        required
                                    >
                                        <option value="">Select Rural Category</option>
                                        {ruralCategories.map((category) => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            
                            <div>
                                <label htmlFor="projectClub" className="block text-sm font-medium text-gray-700 mb-1">
                                    Club
                                </label>
                                <select
                                    id="projectClub"
                                    value={formData.clubId}
                                    onChange={(e) => handleClubChange(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent"
                                    required
                                    disabled={!formData.domain}
                                >
                                    <option value="">{!formData.domain ? "Select Domain First" : "Select Club"}</option>
                                    {getFilteredClubs().map((club) => (
                                        <option key={club.id} value={club.id}>
                                            {club.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {selectedClubCategories.length > 0 && (
                                <div>
                                    <label htmlFor="projectCategory" className="block text-sm font-medium text-gray-700 mb-1">
                                        Category
                                    </label>
                                    <select
                                        id="projectCategory"
                                        value={formData.category}
                                        onChange={(e) => handleCategoryChange(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent"
                                        required
                                    >
                                        <option value="">Select Category</option>
                                        {selectedClubCategories.map((category) => (
                                            <option key={category} value={category}>
                                                {category}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            <div>
                                <label htmlFor="projectDescription" className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    id="projectDescription"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent"
                                    required
                                />
                            </div>
                            
                            {/* Image Upload for LCH Handicrafts/Painting Clubs */}
                            {isLCHHandicraftsOrPainting() && (
                                <div>
                                    <label htmlFor="projectImage" className="block text-sm font-medium text-gray-700 mb-1">
                                        Project Image
                                    </label>
                                    <input
                                        id="projectImage"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-transparent"
                                    />
                                    {imagePreview && (
                                        <div className="mt-2">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={imagePreview}
                                                alt="Project preview"
                                                className="w-32 h-32 object-cover rounded-md border"
                                            />
                                        </div>
                                    )}
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
                                    <span>{editingProject ? 'Update' : 'Save'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
