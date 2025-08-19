import { useState, useEffect } from "react";
import Image from "next/image";

export default function ProjectSelection({ formData, updateFormData }) {
    const [isY24Student, setIsY24Student] = useState(null);
    const [showY24Modal, setShowY24Modal] = useState(true);
    const [socialInternshipId, setSocialInternshipId] = useState("");
    const [socialInternshipData, setSocialInternshipData] = useState(null);
    const [selectedDomain, setSelectedDomain] = useState("");
    const [selectedClub, setSelectedClub] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [availableClubs, setAvailableClubs] = useState([]);
    const [availableCategories, setAvailableCategories] = useState([]);
    const [availableProjects, setAvailableProjects] = useState([]);
    const [allClubs, setAllClubs] = useState([]);
    const [allProjects, setAllProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    // Domain categories
    const domains = [
        { id: "TEC", name: "Technical", description: "Technology and Engineering projects" },
        { id: "LCH", name: "Literary, Cultural & Heritage", description: "Arts, Literature and Cultural preservation" },
        { id: "ESO", name: "Extension & Social Outreach", description: "Community service and social initiatives" },
        { id: "IIE", name: "Innovation, Incubation & Entrepreneurship", description: "Startup and Innovation projects" },
        { id: "HWB", name: "Health & Well-being", description: "Health, fitness and wellness programs" },
        { id: "Rural", name: "Rural Mission", description: "Rural development and community projects" }
    ];

    // Fetch clubs and projects from unified registration API
    useEffect(() => {
        fetchRegistrationData();
    }, []);

    const fetchRegistrationData = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/register-data');
            if (response.ok) {
                const data = await response.json();
                setAllClubs(data.clubs);
                setAllProjects(data.projects);
                console.log('Registration data loaded:', {
                    clubs: data.clubs.length,
                    projects: data.projects.length,
                    domains: data.domains.length
                });
            } else {
                console.error('Failed to fetch registration data:', response.status);
            }
        } catch (error) {
            console.error('Error fetching registration data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleY24Response = (response) => {
        setIsY24Student(response);
        setShowY24Modal(false);
        if (!response) {
            setSelectedDomain("");
        }
    };

    const fetchSocialInternshipData = async () => {
        try {
            // Mock API call - replace with actual API when available
            const mockData = {
                domain: "TEC",
                studentName: "John Doe",
                internshipTitle: "Web Development Internship"
            };
            setSocialInternshipData(mockData);
            setSelectedDomain(mockData.domain);
            
            if (mockData.domain !== "Rural") {
                const domainClubs = allClubs.filter(club => club.domain === mockData.domain);
                setAvailableClubs(domainClubs);
            } else {
                // For rural, show projects directly
                const ruralProjects = allProjects.filter(project => 
                    project.category?.toLowerCase().includes('rural') || 
                    project.name?.toLowerCase().includes('rural') ||
                    project.domain === 'Rural'
                );
                setAvailableProjects(ruralProjects);
            }
        } catch (error) {
            console.error("Error fetching social internship data:", error);
        }
    };

    const handleDomainSelection = (domain) => {
        setSelectedDomain(domain);
        setSelectedClub("");
        setSelectedCategory("");
        setAvailableCategories([]);
        setAvailableProjects([]);
        
        if (domain === "Rural") {
            // For Rural domain, show projects directly
            const ruralProjects = allProjects.filter(project => 
                project.category?.toLowerCase().includes('rural') || 
                project.name?.toLowerCase().includes('rural') ||
                project.domain === 'Rural'
            );
            setAvailableProjects(ruralProjects);
            setAvailableClubs([]);
        } else {
            // Filter clubs by domain
            const domainClubs = allClubs.filter(club => club.domain === domain);
            setAvailableClubs(domainClubs);
        }
        
        updateFormData({ selectedDomain: domain });
    };

    const handleClubSelection = (club) => {
        setSelectedClub(club.id);
        setSelectedCategory("");
        setAvailableProjects([]);
        
        // Get unique categories for this club from projects
        const clubProjects = allProjects.filter(project => 
            project.clubId === club.id || project.clubId === String(club.id)
        );
        
        console.log('Club selected:', club);
        console.log('All projects:', allProjects);
        console.log('Club projects:', clubProjects);
        
        const categories = [...new Set(clubProjects.map(project => project.category).filter(Boolean))];
        console.log('Available categories:', categories);
        
        setAvailableCategories(categories);
        
        updateFormData({ selectedClub: club.id });
    };

    const handleCategorySelection = (category) => {
        setSelectedCategory(category);
        
        if (selectedDomain === "Rural") {
            // For rural projects, filter by category
            const ruralProjects = allProjects.filter(project => 
                (project.category?.toLowerCase().includes('rural') || 
                 project.name?.toLowerCase().includes('rural') ||
                 project.domain === 'Rural') &&
                project.category === category
            );
            setAvailableProjects(ruralProjects);
        } else {
            // Filter projects by club and category
            const categoryProjects = allProjects.filter(project => 
                project.clubId === selectedClub && project.category === category
            );
            setAvailableProjects(categoryProjects);
        }
    };

    const handleProjectSelection = (project) => {
        updateFormData({
            selectedProject: project.id,
            projectName: project.name,
            projectDescription: project.description,
            selectedClub: project.clubId,
            selectedCategory: selectedCategory
        });
    };

    return (
        <div className="bg-white p-6 md:p-8 rounded-lg shadow-md max-w-none">
            <h2 className="text-2xl font-bold mb-6 text-center">Project Selection</h2>
            
            {/* Y24 Student Modal */}
            {showY24Modal && (
                <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-xl max-w-md mx-4">
                        <h3 className="text-xl font-bold mb-4 text-center">Student Verification</h3>
                        <p className="text-gray-700 mb-6 text-center">Are you a Y24 student with completed social internship?</p>
                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={() => handleY24Response(true)}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Yes
                            </button>
                            <button
                                onClick={() => handleY24Response(false)}
                                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                            >
                                No
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Y24 Student - Social Internship Credentials */}
            {isY24Student === true && !socialInternshipData && (
                <div className="mb-6 p-6 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="text-lg font-semibold mb-4 text-blue-800">Social Internship Verification</h3>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="socialInternshipId" className="block text-sm font-medium text-gray-700 mb-2">
                                Social Internship ID *
                            </label>
                            <input
                                type="text"
                                id="socialInternshipId"
                                value={socialInternshipId}
                                onChange={(e) => setSocialInternshipId(e.target.value)}
                                placeholder="Enter your social internship ID"
                                className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                required
                            />
                        </div>
                        <button
                            onClick={fetchSocialInternshipData}
                            disabled={!socialInternshipId}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                            Fetch Internship Details
                        </button>
                    </div>
                </div>
            )}

            {/* Social Internship Data Display */}
            {socialInternshipData && (
                <div className="mb-6 p-6 bg-green-50 rounded-lg border border-green-200">
                    <h3 className="text-lg font-semibold mb-4 text-green-800">Internship Details Found</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="font-medium">Student:</span> {socialInternshipData.studentName}
                        </div>
                        <div>
                            <span className="font-medium">Internship:</span> {socialInternshipData.internshipTitle}
                        </div>
                        <div>
                            <span className="font-medium">Domain:</span> {domains.find(d => d.id === socialInternshipData.domain)?.name}
                        </div>
                    </div>
                </div>
            )}

            {/* Domain Selection */}
            {(isY24Student === false || socialInternshipData) && (
                <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-4">
                        {isY24Student && socialInternshipData ? "Select Domain (Your assigned domain is marked)" : "Select Domain"}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {domains.map((domain) => {
                            const isAssignedDomain = isY24Student && socialInternshipData && domain.id === socialInternshipData.domain;
                            const className = `p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                selectedDomain === domain.id
                                    ? "border-blue-500 bg-blue-50"
                                    : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                            }`;
                            
                            return (
                                <button
                                    key={domain.id}
                                    onClick={() => handleDomainSelection(domain.id)}
                                    className={className}
                                    type="button"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-semibold text-gray-800">{domain.name}</h4>
                                        {isAssignedDomain && (
                                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                                Assigned
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-600">{domain.description}</p>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Club Selection (not for Rural domain) */}
            {selectedDomain && selectedDomain !== "Rural" && (
                <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-4">Select Club</h3>
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : availableClubs.length === 0 ? (
                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-yellow-800">No clubs found for domain: {selectedDomain}</p>
                            <p className="text-sm text-yellow-600 mt-2">Total clubs in database: {allClubs.length}</p>
                            <p className="text-sm text-yellow-600">Available domains: {[...new Set(allClubs.map(c => c.domain))].join(', ')}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {availableClubs.map((club) => {
                                // Parse categories from JSON if it's a string
                                let categories = [];
                                try {
                                    categories = typeof club.categories === 'string' 
                                        ? JSON.parse(club.categories) 
                                        : club.categories || [];
                                } catch (e) {
                                    categories = [];
                                }

                                // Check if club has any projects
                                const clubProjects = allProjects.filter(project => 
                                    project.clubId === club.id || project.clubId === String(club.id)
                                );
                                const hasProjects = clubProjects.length > 0;

                                return (
                                    <button
                                        key={club.id}
                                        onClick={() => hasProjects && handleClubSelection(club)}
                                        disabled={!hasProjects}
                                        className={`p-4 rounded-lg border-2 transition-all text-left ${
                                            !hasProjects
                                                ? "border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed"
                                                : selectedClub === club.id
                                                ? "border-blue-500 bg-blue-50 cursor-pointer"
                                                : "border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer"
                                        }`}
                                        type="button"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="font-semibold text-gray-800">{club.name}</h4>
                                            {!hasProjects && (
                                                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                                    No Projects
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-600 mb-2">{club.description}</p>
                                        {categories.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {categories.slice(0, 3).map((category, index) => (
                                                    <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                                        {category}
                                                    </span>
                                                ))}
                                                {categories.length > 3 && (
                                                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                                        +{categories.length - 3} more
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Category Selection */}
            {selectedClub && availableCategories.length > 0 && (
                <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-4">Select Category</h3>
                    <div className="text-sm text-gray-600 mb-4">
                        Found {availableCategories.length} categories for selected club
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {availableCategories.map((category) => {
                            // Check if category has any projects
                            const categoryProjects = allProjects.filter(project => 
                                project.clubId === selectedClub && project.category === category
                            );
                            const hasProjects = categoryProjects.length > 0;

                            return (
                                <button
                                    key={category}
                                    onClick={() => hasProjects && handleCategorySelection(category)}
                                    disabled={!hasProjects}
                                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                                        !hasProjects
                                            ? "border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed"
                                            : selectedCategory === category
                                            ? "border-blue-500 bg-blue-50 text-blue-800 cursor-pointer"
                                            : "border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer"
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span>{category}</span>
                                        {!hasProjects && (
                                            <span className="text-xs bg-yellow-100 text-yellow-600 px-1 py-0.5 rounded ml-2">
                                                No Projects
                                            </span>
                                        )}
                                        {hasProjects && (
                                            <span className="text-xs bg-blue-100 text-blue-600 px-1 py-0.5 rounded ml-2">
                                                {categoryProjects.length}
                                            </span>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Debug info for categories */}
            {selectedClub && availableCategories.length === 0 && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4 text-yellow-800">Debug: No Categories Found</h3>
                    <div className="text-sm text-yellow-600 space-y-1">
                        <div>Selected Club ID: {selectedClub}</div>
                        <div>Total Projects: {allProjects.length}</div>
                        <div>Projects for this club: {allProjects.filter(p => p.clubId === selectedClub || p.clubId === String(selectedClub)).length}</div>
                        <div>Available Categories: {availableCategories.length}</div>
                    </div>
                </div>
            )}

            {/* Project Selection */}
            {(availableProjects.length > 0 || (selectedDomain === "Rural" && allProjects.length > 0)) && (
                <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-4">Select Project</h3>
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : availableProjects.length === 0 ? (
                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-yellow-800">No projects found</p>
                            <p className="text-sm text-yellow-600 mt-2">
                                Selected Domain: {selectedDomain}, 
                                Selected Club: {selectedClub}, 
                                Selected Category: {selectedCategory}
                            </p>
                            <p className="text-sm text-yellow-600">Total projects in database: {allProjects.length}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {availableProjects.map((project) => {
                                const isHandicraftsOrPainting = project.clubName && (
                                    project.clubName.toLowerCase().includes('handicraft') || 
                                    project.clubName.toLowerCase().includes('painting') ||
                                    project.clubName.toLowerCase().includes('art')
                                );
                                
                                return (
                                    <button
                                        key={project.id}
                                        onClick={() => handleProjectSelection(project)}
                                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all text-left w-full hover:shadow-md ${
                                            formData.selectedProject === project.id
                                                ? "border-blue-500 bg-blue-50 shadow-md"
                                                : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                                        }`}
                                        type="button"
                                    >
                                        {/* Project Image for Handicrafts/Painting clubs */}
                                        {isHandicraftsOrPainting && project.images?.length > 0 && (
                                            <div className="mb-4">
                                                <div className="w-full h-32 sm:h-40 rounded-lg overflow-hidden bg-gray-100">
                                                    <Image
                                                        src={project.images[0].url}
                                                        alt={project.images[0].name}
                                                        width={300}
                                                        height={160}
                                                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                                                        onError={(e) => {
                                                            e.target.style.display = 'none';
                                                        }}
                                                    />
                                                </div>
                                                {project.images.length > 1 && (
                                                    <div className="text-xs text-center text-gray-500 mt-2">
                                                        +{project.images.length - 1} more image{project.images.length > 2 ? 's' : ''}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        
                                        {/* Project Details */}
                                        <div>
                                            <h4 className="font-semibold text-gray-800 mb-2 text-base">{project.name}</h4>
                                            <p className="text-sm text-gray-600 mb-3 overflow-hidden" style={{
                                                display: '-webkit-box',
                                                WebkitLineClamp: 3,
                                                WebkitBoxOrient: 'vertical',
                                                textOverflow: 'ellipsis'
                                            }}>{project.description}</p>
                                            {/* {isHandicraftsOrPainting && project.hasImages && (
                                                <div className="flex items-center justify-center gap-2 text-xs text-blue-600">
                                                    <span>🎨</span>
                                                    <span className="bg-blue-100 px-2 py-1 rounded-full">
                                                        {project.images?.length || 0} image{project.images?.length !== 1 ? 's' : ''}
                                                    </span>
                                                </div>
                                            )} */}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Selected Project Summary */}
            {formData.selectedProject && (
                <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                    <h3 className="text-lg font-semibold mb-2 text-green-800">Selected Project</h3>
                    <div className="space-y-2 text-sm">
                        <div><span className="font-medium">Domain:</span> {domains.find(d => d.id === selectedDomain)?.name}</div>
                        <div><span className="font-medium">Category:</span> {selectedCategory}</div>
                        <div><span className="font-medium">Project:</span> {formData.projectName}</div>
                        <div><span className="font-medium">Description:</span> {formData.projectDescription}</div>
                    </div>
                </div>
            )}

            <div className="mt-6 bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Your project selection will determine your club assignment and learning path. 
                    Choose carefully as changes may not be allowed after registration.
                </p>
            </div>
        </div>
    );
}
