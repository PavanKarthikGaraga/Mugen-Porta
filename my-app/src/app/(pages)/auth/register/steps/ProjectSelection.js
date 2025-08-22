import { useState, useEffect } from "react";
import Image from "next/image";

export default function ProjectSelection({ formData, updateFormData }) {
    const [isY24Student, setIsY24Student] = useState(null);
    const [isY25Student, setIsY25Student] = useState(null);
    const [showYearModal, setShowYearModal] = useState(true);
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
    const [projectMemberCounts, setProjectMemberCounts] = useState({});
    const [clubMemberCounts, setClubMemberCounts] = useState({});
    const [clubMemberLimits, setClubMemberLimits] = useState({});
    const [loading, setLoading] = useState(true);

    // Determine student year from form data
    const studentYear = formData.username ? (formData.username.startsWith('24') ? 'Y24' : formData.username.startsWith('25') ? 'Y25' : null) : null;

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
                
                // Fetch member counts for TEC projects
                await fetchProjectMemberCounts(data.projects);
                
                // Fetch member counts for clubs (for Y25 students)
                await fetchClubMemberCounts(data.clubs);
                
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

    const fetchProjectMemberCounts = async (projects) => {
        try {
            // Only fetch counts for TEC projects
            const tecProjects = projects.filter(project => project.domain === 'TEC');
            const memberCounts = {};
            
            for (const project of tecProjects) {
                try {
                    const response = await fetch(`/api/project-members?projectId=${project.id}`);
                    if (response.ok) {
                        const data = await response.json();
                        memberCounts[project.id] = data.memberCount || 0;
                    } else {
                        memberCounts[project.id] = 0;
                    }
                } catch (error) {
                    console.error(`Error fetching member count for project ${project.id}:`, error);
                    memberCounts[project.id] = 0;
                }
            }
            
            setProjectMemberCounts(memberCounts);
        } catch (error) {
            console.error('Error fetching project member counts:', error);
        }
    };

    const fetchClubMemberCounts = async (clubs) => {
        try {
            const memberCounts = {};
            const memberLimits = {};
            
            for (const club of clubs) {
                try {
                    const response = await fetch(`/api/club-members?clubId=${club.id}`);
                    if (response.ok) {
                        const data = await response.json();
                        memberCounts[club.id] = data.currentMembers || 0;
                        memberLimits[club.id] = data.memberLimit || 50;
                    } else {
                        memberCounts[club.id] = 0;
                        memberLimits[club.id] = 50;
                    }
                } catch (error) {
                    console.error(`Error fetching member count for club ${club.id}:`, error);
                    memberCounts[club.id] = 0;
                    memberLimits[club.id] = 50;
                }
            }
            
            setClubMemberCounts(memberCounts);
            setClubMemberLimits(memberLimits);
        } catch (error) {
            console.error('Error fetching club member counts:', error);
        }
    };

    const handleY24Response = (response) => {
        setIsY24Student(response);
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

    const handleClubSelectionForY25 = (club) => {
        // Check club member limits dynamically from database
        const memberCount = clubMemberCounts[club.id] || 0;
        const memberLimit = clubMemberLimits[club.id] || 50;
        
        if (memberCount >= memberLimit) {
            alert(`This club is full. Maximum ${memberLimit} members allowed per club.`);
            return;
        }
        
        setSelectedClub(club.id);
        updateFormData({ 
            selectedClub: club.id,
            selectedDomain: club.domain,
            selectedProject: null, // Y25 students don't select projects
            projectName: null,
            projectDescription: null
        });
    };

    const handleProjectSelection = (project) => {
        // Check one more time if TEC project is full before allowing selection
        if (project.domain === 'TEC') {
            const memberCount = projectMemberCounts[project.id] || 0;
            if (memberCount >= 2) {
                alert('This TEC project is full. Please select a different project.');
                return;
            }
        }
        
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
            <h2 className="text-2xl font-bold mb-6 text-center">
                {studentYear === 'Y25' ? 'Club Selection' : 'Project Selection'}
            </h2>
            
            {/* Student Year Info */}
            {studentYear && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 font-bold text-sm">ℹ️</span>
                            </div>
                        </div>
                        <div className="ml-3">
                            <h4 className="text-sm font-medium text-blue-800">
                                {studentYear} Student Registration
                            </h4>
                            <p className="text-sm text-blue-700">
                                {studentYear === 'Y25' 
                                    ? "As a Y25 student, you can only register for clubs. Project selection is available for Y24 students only."
                                    : "As a Y24 student, you can select specific projects within clubs."
                                }
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Y25 Student - Club Selection Only */}
            {studentYear === 'Y25' && (
                <>
                    {/* Domain Selection for Y25 */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-4">Select Domain</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {domains.map((domain) => (
                                <button
                                    key={domain.id}
                                    onClick={() => handleDomainSelection(domain.id)}
                                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                        selectedDomain === domain.id
                                            ? "border-blue-500 bg-blue-50"
                                            : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                                    }`}
                                    type="button"
                                >
                                    <h4 className="font-semibold text-gray-800 mb-2">{domain.name}</h4>
                                    <p className="text-sm text-gray-600">{domain.description}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Club Selection for Y25 */}
                    {selectedDomain && (
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold mb-4">Select Club</h3>
                            {loading ? (
                                <div className="flex justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                </div>
                            ) : availableClubs.length === 0 ? (
                                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <p className="text-yellow-800">No clubs found for domain: {selectedDomain}</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {availableClubs.map((club) => {
                                        const memberCount = clubMemberCounts[club.id] || 0;
                                        const memberLimit = clubMemberLimits[club.id] || 50;
                                        const isFull = memberCount >= memberLimit;
                                        const spotsRemaining = Math.max(0, memberLimit - memberCount);

                                        return (
                                            <button
                                                key={club.id}
                                                onClick={() => !isFull && handleClubSelectionForY25(club)}
                                                disabled={isFull}
                                                className={`p-4 rounded-lg border-2 transition-all text-left ${
                                                    isFull
                                                        ? "border-red-300 bg-red-50 cursor-not-allowed opacity-60"
                                                        : selectedClub === club.id
                                                        ? "border-blue-500 bg-blue-50 cursor-pointer"
                                                        : "border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer"
                                                }`}
                                                type="button"
                                            >
                                                {/* Club Member Count Badge */}
                                                <div className="mb-2">
                                                    {isFull ? (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                            ❌ Full ({memberCount}/{memberLimit} members)
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                            ✅ {spotsRemaining} spots available ({memberCount}/{memberLimit} members)
                                                        </span>
                                                    )}
                                                </div>
                                                
                                                <h4 className={`font-semibold mb-2 ${
                                                    isFull ? 'text-gray-500' : 'text-gray-800'
                                                }`}>{club.name}</h4>
                                                <p className={`text-sm ${
                                                    isFull ? 'text-gray-400' : 'text-gray-600'
                                                }`}>{club.description}</p>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Selected Club Summary for Y25 */}
                    {formData.selectedClub && studentYear === 'Y25' && (
                        <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                            <h3 className="text-lg font-semibold mb-2 text-green-800">Selected Club</h3>
                            <div className="space-y-2 text-sm">
                                <div><span className="font-medium">Domain:</span> {domains.find(d => d.id === selectedDomain)?.name}</div>
                                <div><span className="font-medium">Club:</span> {allClubs.find(c => c.id === formData.selectedClub)?.name}</div>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Y24 Student - Existing Project Selection Logic */}
            {studentYear === 'Y24' && (
                <>
                    {/* Y24 Student - Social Internship Credentials */}
                    {!socialInternshipData && (
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
                    
                    {/* TEC Project Info Banner */}
                    {selectedDomain === 'TEC' && (
                        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                        <span className="text-blue-600 font-bold text-sm">⚠️</span>
                                    </div>
                                </div>
                                <div className="ml-3">
                                    <h4 className="text-sm font-medium text-blue-800">TEC Project Registration Limit</h4>
                                    <p className="text-sm text-blue-700">
                                        TEC (Technical) projects are limited to a maximum of <strong>2 members</strong> per project. 
                                        Projects marked as &quot;Full&quot; cannot accept new registrations.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                    
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
                                
                                // Check if this is a TEC project and if it's full
                                const isTecProject = project.domain === 'TEC';
                                const memberCount = projectMemberCounts[project.id] || 0;
                                const isFull = isTecProject && memberCount >= 2;
                                const spotsRemaining = isTecProject ? Math.max(0, 2 - memberCount) : null;
                                
                                return (
                                    <button
                                        key={project.id}
                                        onClick={() => !isFull && handleProjectSelection(project)}
                                        disabled={isFull}
                                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all text-left w-full hover:shadow-md ${
                                            isFull
                                                ? "border-red-300 bg-red-50 cursor-not-allowed opacity-60"
                                                : formData.selectedProject === project.id
                                                ? "border-blue-500 bg-blue-50 shadow-md"
                                                : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                                        }`}
                                        type="button"
                                    >
                                        {/* TEC Project Member Count Badge */}
                                        {isTecProject && (
                                            <div className="mb-2">
                                                {isFull ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                        ❌ Full (2/2 members)
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        ✅ {spotsRemaining} spot{spotsRemaining !== 1 ? 's' : ''} available ({memberCount}/2 members)
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                        
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
                                            <h4 className={`font-semibold mb-2 text-base ${
                                                isFull ? 'text-gray-500' : 'text-gray-800'
                                            }`}>{project.name}</h4>
                                            <p className={`text-sm mb-3 overflow-hidden ${
                                                isFull ? 'text-gray-400' : 'text-gray-600'
                                            }`} style={{
                                                display: '-webkit-box',
                                                WebkitLineClamp: 3,
                                                WebkitBoxOrient: 'vertical',
                                                textOverflow: 'ellipsis'
                                            }}>{project.description}</p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Selected Project Summary */}
            {formData.selectedProject && studentYear === 'Y24' && (
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
                </>
            )}

            <div className="mt-6 bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Your {studentYear === 'Y25' ? 'club' : 'project'} selection will determine your learning path. 
                    Choose carefully as changes may not be allowed after registration.
                </p>
            </div>
        </div>
    );
}
