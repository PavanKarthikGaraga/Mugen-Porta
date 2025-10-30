import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { toast } from "sonner";

export default function ProjectSelection({ formData, updateFormData, onValidationChange }) {
    const [selectedDomain, setSelectedDomain] = useState("");
    const [selectedClub, setSelectedClub] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedRuralCategory, setSelectedRuralCategory] = useState("");
    const [customCategory, setCustomCategory] = useState("");
    const [availableClubs, setAvailableClubs] = useState([]);
    const [availableCategories, setAvailableCategories] = useState([]);
    const [availableProjects, setAvailableProjects] = useState([]);
    const [allClubs, setAllClubs] = useState([]);
    const [allProjects, setAllProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    // Determine student year from form data
    const studentYear = React.useMemo(() => {
    if (formData.username) {
        if (formData.username.startsWith('22') || formData.username.startsWith('23') || formData.username.startsWith('24')) {
                return 'Y24'; // Y22, Y23, and Y24 students follow the same rules
        } else if (formData.username.startsWith('25')) {
                return 'Y25';
            }
        }
        return null;
    }, [formData.username]);

    // Domain categories
    const allDomains = [
        { id: "TEC", name: "Technical", description: "Technology and Engineering projects" },
        { id: "LCH", name: "Literary, Cultural & Heritage", description: "Arts, Literature and Cultural preservation" },
        { id: "ESO", name: "Extension & Social Outreach", description: "Community service and social initiatives" },
        { id: "IIE", name: "Innovation, Incubation & Entrepreneurship", description: "Startup and Innovation projects" },
        { id: "HWB", name: "Health & Well-being", description: "Health, fitness and wellness programs" },
        { id: "RURAL", name: "Rural", description: "Rural development and community projects" }
    ];

    // Filter domains based on student year
    let domains = allDomains;

    if (studentYear === 'Y25') {
        // Y25 students cannot access RURAL domain, but can access TEC clubs (without projects)
        domains = allDomains.filter(domain => domain.id !== 'RURAL');
    }

    // Rural categories for Y24 students
    const ruralCategories = [
        { id: 'agriculture', name: 'Agriculture & Farming' },
        { id: 'livestock', name: 'Livestock & Animal Husbandry' },
        { id: 'crafts', name: 'Traditional Crafts & Artisans' },
        { id: 'healthcare', name: 'Rural Healthcare' },
        { id: 'education', name: 'Rural Education' },
        { id: 'infrastructure', name: 'Rural Infrastructure' },
        { id: 'environment', name: 'Environmental Conservation' },
        { id: 'technology', name: 'Rural Technology Solutions' }
    ];

    // Fetch clubs and projects from unified registration API
    useEffect(() => {
        const fetchRegistrationData = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/register-data');
                if (response.ok) {
                    const data = await response.json();
                    setAllClubs(data.clubs || []);
                    setAllProjects(data.projects || []);
                } else {
                    console.error('Failed to fetch registration data:', response.status);
                }
            } catch (error) {
                console.error('Error fetching registration data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRegistrationData();
    }, []);



    const handleDomainChange = (domainId) => {
        setSelectedDomain(domainId);
        setSelectedClub("");
        setSelectedCategory("");
        setSelectedRuralCategory("");

        // Get available clubs for this domain
        let clubsForDomain = [];
        if (domainId === "RURAL") {
            // For rural, show all clubs (they can have rural projects)
            clubsForDomain = allClubs;
        } else {
            clubsForDomain = allClubs.filter(club => club.domain === domainId);
        }
        setAvailableClubs(clubsForDomain);

        updateFormData({
            selectedDomain: domainId,
            selectedClub: "",
            selectedCategory: "",
            selectedProject: null,
            projectName: null,
            projectDescription: null
        });
    };

    const handleClubChange = (clubId) => {
        // Check if the selected club is full
        const selectedClubData = allClubs.find(club => club.id === clubId);
        if (!selectedClubData) return;

        if (selectedClubData.isFull) {
            toast.error(`This club is already full (${selectedClubData.memberCount}/${selectedClubData.memberLimit} members). Please select a different club.`);
            return; // Don't proceed with selection
        }

        setSelectedClub(clubId);
        setSelectedCategory(""); // Reset category selection
        setSelectedRuralCategory("");

        // For TEC domain: Y25 can select club but cannot select categories/projects
        if (selectedDomain === 'TEC' && studentYear === 'Y25') {
            // Y25 can join TEC clubs but cannot select categories or projects
            setSelectedCategory("");
            setAvailableCategories([]);
            setAvailableProjects([]);
            updateFormData({
                selectedClub: clubId,
                selectedCategory: "",
                selectedProject: null,
                projectName: null,
                projectDescription: null
            });
            return;
        }

        // Get available categories for this club
        let categoriesForClub = [];
        try {
            if (selectedClubData.categories) {
                categoriesForClub = typeof selectedClubData.categories === 'string'
                    ? JSON.parse(selectedClubData.categories)
                    : selectedClubData.categories;
            }
        } catch (e) {
            categoriesForClub = [];
        }

        // Add "Other" category for Music club in LCH domain
        if (selectedClubData.name && selectedClubData.name.toLowerCase().includes('music') && selectedDomain === 'LCH') {
            categoriesForClub = [...categoriesForClub, { id: 'other', name: 'Other' }];
        }

        // If no categories, check if there are projects directly
        if (categoriesForClub.length === 0) {
            const clubProjects = allProjects.filter(project =>
                project.clubId === clubId && project.domain === selectedDomain
            );

            if (clubProjects.length > 0) {
                // If projects exist without categories, create a default category
                categoriesForClub = [{ id: 'default', name: 'General Projects' }];
            }
        }

        setAvailableCategories(categoriesForClub);

        updateFormData({
            selectedClub: clubId,
            selectedCategory: "",
            selectedProject: null,
            projectName: null,
            projectDescription: null
        });
    };

    const handleCategoryChange = (categoryId) => {
        setSelectedCategory(categoryId);

        // Reset custom category when changing category selection
        if (categoryId !== 'other') {
            setCustomCategory("");
        }

        const selectedClubData = allClubs.find(club => club.id === selectedClub);
        if (!selectedClubData) return;

        // If "Other" category is selected for Music club, don't look for projects yet
        if (categoryId === 'other' && selectedClubData.name && selectedClubData.name.toLowerCase().includes('music') && selectedDomain === 'LCH') {
            setAvailableProjects([]);
            updateFormData({
                selectedCategory: categoryId,
                selectedProject: null,
                projectName: null,
                projectDescription: null
            });
            return;
        }

        // Get projects for this category
        const categoryProjects = allProjects.filter(project =>
                project.clubId === selectedClub &&
            project.category === categoryId &&
            project.domain === selectedDomain
            );

        setAvailableProjects(categoryProjects);

        // If no projects exist for this category, create auto-generated project
        if (categoryProjects.length === 0) {
            // Get categories for this club to find the index
            let categoriesForClub = [];
            try {
                if (selectedClubData.categories) {
                    categoriesForClub = typeof selectedClubData.categories === 'string'
                        ? JSON.parse(selectedClubData.categories)
                        : selectedClubData.categories;
                }
            } catch (e) {
                categoriesForClub = [];
            }

            // Find the index of the selected category and format as 2-digit number
            const categoryIndex = categoriesForClub.findIndex(cat =>
                (cat.id || cat.name || cat) === categoryId
            );
            const categoryNumber = (categoryIndex + 1).toString().padStart(2, '0');

            // Generate project ID as ClubID + {02}
            const projectId = `${selectedClub}${categoryNumber}`;

            const projectName = `${categoryId} Project`;
            const projectDescription = `Auto-generated project for ${categoryId} category in ${selectedClubData.name}`;

        updateFormData({
                selectedCategory: categoryId,
            selectedProject: projectId,
            projectName: projectName,
            projectDescription: projectDescription
        });
        } else {
            // Projects exist, user will need to select one
        updateFormData({
                selectedCategory: categoryId,
            selectedProject: null,
            projectName: null,
            projectDescription: null
        });
        }
    };

    const handleCustomCategoryChange = (value) => {
        setCustomCategory(value);

        // Update form data with the custom category
        const selectedClubData = allClubs.find(club => club.id === selectedClub);
        if (selectedClubData && value.trim()) {
            // Generate project ID as ClubID + custom category
            const projectId = `${selectedClub}CUSTOM`;

            updateFormData({
                selectedCategory: value.trim(), // Use the custom category name as selectedCategory for backend
                customCategory: value.trim(), // Also store in customCategory for UI consistency
                selectedProject: projectId,
                projectName: `${value.trim()} Project`,
                projectDescription: `Custom project for ${value.trim()} category in ${selectedClubData.name}`
            });
        } else {
            updateFormData({
                selectedCategory: "",
                customCategory: "", // Clear custom category
                selectedProject: null,
                projectName: null,
                projectDescription: null
            });
        }
    };

    const handleProjectChange = (projectId) => {
        const selectedProject = allProjects.find(project => project.id === projectId);
        if (!selectedProject) return;

        // Note: Full TEC projects are now disabled in the UI, so this check is no longer needed
        // The backend will still validate during final registration

        updateFormData({
            selectedProject: projectId,
            projectName: selectedProject.name,
            projectDescription: selectedProject.description
        });
    };

    // Use useMemo to avoid recalculating on every render
    const availableOptions = React.useMemo(() => {
        // Determine what selections are required based on availability
        const getAvailableOptions = () => {
            console.log('getAvailableOptions called with selectedDomain:', selectedDomain);
            // Check if there are clubs available for the selected domain
            let clubsForDomain = [];
            if (selectedDomain === "RURAL") {
                // For rural, show all clubs (they can have rural projects)
                clubsForDomain = allClubs;
                console.log('RURAL: using all clubs:', clubsForDomain.length);
            } else if (selectedDomain) {
                clubsForDomain = allClubs.filter(club => club.domain === selectedDomain);
                console.log('Filtering clubs by domain', selectedDomain, ':', clubsForDomain.length, 'clubs found');
            } else {
                clubsForDomain = availableClubs; // fallback to state
                console.log('No domain selected, using availableClubs:', clubsForDomain.length);
            }

            // If no club is selected yet, check if clubs exist for the domain
            if (!selectedClub) {
                const result = {
                    hasClubs: clubsForDomain.length > 0,
                    hasCategories: false,
                    hasProjects: false
                };

                return result;
            }

            // If club is selected, check for categories and projects
            const clubData = allClubs.find(club => club.id === selectedClub);

            if (!clubData) {
                return { hasClubs: false, hasCategories: false, hasProjects: false };
            }

            // Check for categories
            let categories = [];
            try {
                categories = clubData.categories ? (typeof clubData.categories === 'string'
                    ? JSON.parse(clubData.categories)
                    : clubData.categories) : [];
            } catch (e) {
                categories = [];
            }

            // Check for projects
            const projects = allProjects.filter(project =>
                project.clubId === selectedClub && project.domain === selectedDomain
            );

            // Special case: Y25 students cannot select categories from TEC domain
            const hasCategories = (selectedDomain === 'TEC' && studentYear === 'Y25')
                ? false
                : categories.length > 0;

            // Special case: Y25 students cannot select projects from TEC domain
            const hasProjects = (selectedDomain === 'TEC' && studentYear === 'Y25')
                ? false
                : projects.length > 0;


            return {
                hasClubs: clubsForDomain.length > 0,
                hasCategories: hasCategories,
                hasProjects: hasProjects
            };
        };

        return getAvailableOptions();
    }, [selectedDomain, selectedClub, availableClubs, allClubs, allProjects, studentYear]);
    const { hasClubs, hasCategories, hasProjects } = availableOptions;

    // Check if current selection meets constraints for proceeding
    const canProceed = React.useMemo(() => {
        if (!selectedClub) {
            return false;
        }

        const clubData = allClubs.find(club => club.id === selectedClub);
        if (!clubData) {
            return false;
        }

        // Check for categories
        let categories = [];
        try {
            categories = clubData.categories ? (typeof clubData.categories === 'string'
                ? JSON.parse(clubData.categories)
                : clubData.categories) : [];
        } catch (e) {
            categories = [];
        }

        // UNIFIED LOGIC FOR BOTH Y24 AND Y25
        // Special case: Y25 + TEC can proceed with just club selection

        // Rule 1: Must have club selected
        if (!selectedClub) {
            return false;
        }

        // Special case: Y25 students can proceed with just club selection for TEC domain
        if (selectedDomain === 'TEC' && studentYear === 'Y25') {
            return true;
        }

        // Rule 2: For all other cases, if club has categories, must select a category
        if (categories.length > 0 && !selectedCategory) {
            return false;
        }

        // Special case: If "Other" is selected for Music club, must enter custom category
        const selectedClubData = allClubs.find(club => club.id === selectedClub);
        if (selectedCategory === 'other' && selectedClubData && selectedClubData.name &&
            selectedClubData.name.toLowerCase().includes('music') && selectedDomain === 'LCH') {
            if (!formData.selectedCategory || formData.selectedCategory === 'other') {
                return false;
            }
        }

        // Rule 3: If category is selected, check if it has projects
        if (selectedCategory) {
            const categoryProjects = allProjects.filter(project =>
                project.clubId === selectedClub &&
                project.category === selectedCategory &&
                project.domain === selectedDomain
            );

            // If category has projects AND it's not (Y25 + TEC), must select a project
            if (categoryProjects.length > 0 && !(selectedDomain === 'TEC' && studentYear === 'Y25')) {
                if (!formData.selectedProject) {
                    return false;
                }
            }
        }

        // Rule 4: Y25 cannot have projects selected from TEC domain
        if (selectedDomain === 'TEC' && studentYear === 'Y25' && formData.selectedProject) {
            return false;
        }
        return true;
    }, [selectedClub, selectedCategory, formData.selectedProject, formData.selectedCategory, selectedDomain, studentYear, allClubs, allProjects]);

    // Show warning message if user cannot proceed
    const getConstraintMessage = () => {
        if (!selectedClub) return "Please select a club first.";

        const clubData = allClubs.find(club => club.id === selectedClub);
        if (!clubData) return "";

        let categories = [];
        try {
            categories = clubData.categories ? (typeof clubData.categories === 'string'
                ? JSON.parse(clubData.categories)
                : clubData.categories) : [];
        } catch (e) {
            categories = [];
        }

        // Special case: Y25 students can proceed with just club selection for TEC domain
        if (selectedDomain === 'TEC' && studentYear === 'Y25') {
            return ""; // No constraint message needed
        }

        // Rule 2: For all other cases, if club has categories, must select a category
        if (categories.length > 0 && !selectedCategory) {
            return "⚠️ This club has categories. Please select a category to proceed.";
        }

        // Special case: If "Other" is selected for Music club, must enter custom category
        const selectedClubData = allClubs.find(club => club.id === selectedClub);
        if (selectedCategory === 'other' && selectedClubData && selectedClubData.name &&
            selectedClubData.name.toLowerCase().includes('music') && selectedDomain === 'LCH') {
            if (!formData.selectedCategory || formData.selectedCategory === 'other') {
                return "⚠️ Please specify your custom category name to proceed.";
            }
        }

        // Rule 3: If category is selected, check if it has projects
        if (selectedCategory) {
            const categoryProjects = allProjects.filter(project =>
                project.clubId === selectedClub &&
                project.category === selectedCategory &&
                project.domain === selectedDomain
            );

            // If category has projects AND it's not (Y25 + TEC), must select a project
            if (categoryProjects.length > 0 && !(selectedDomain === 'TEC' && studentYear === 'Y25')) {
                if (!formData.selectedProject) {
                    return "⚠️ This category has projects. Please select a project to proceed.";
                }
            }
        }

        // Rule 4: Y25 cannot have projects selected from TEC domain
        if (selectedDomain === 'TEC' && studentYear === 'Y25' && formData.selectedProject) {
            return "⚠️ Y25 students cannot select projects from TEC domain.";
        }

        // Additional info about TEC project limits
        if (selectedDomain === 'TEC' && selectedCategory && !formData.selectedProject) {
            return "ℹ️ TEC projects have a limit of 2 members. Make sure to select an available project.";
        }

        return "";
    };

    const constraintMessage = getConstraintMessage();

    // Communicate validation status to parent component
    React.useEffect(() => {
        if (onValidationChange) {
            onValidationChange(canProceed);
        }
    }, [canProceed, onValidationChange]);

    return (
        <div className="bg-white p-6 md:p-8 max-w-none">
            <h2 className="text-2xl font-bold mb-6 text-center">
                {studentYear === 'Y25' ? 'Club Selection' : 'Project Selection'}
            </h2>
            
                            {loading ? (
                                <div className="flex justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                </div>
            ) : (
                <div className="space-y-6">

                    {/* Domain and Club Selection - Side by Side */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Domain Selection */}
                        <div>
                            <label className="block text-lg font-semibold text-gray-800 mb-3">
                                Select Domain
                            </label>
                            <select
                                value={selectedDomain}
                                onChange={(e) => handleDomainChange(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                            >
                                <option value="">Choose a domain...</option>
                                {domains.map((domain) => (
                                    <option key={domain.id} value={domain.id}>
                                        {domain.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Club Selection */}
                        {selectedDomain && hasClubs && (
                            <div>
                                <label className="block text-lg font-semibold text-gray-800 mb-3">
                                    Select Club
                                </label>
                                <select
                                    value={selectedClub}
                                    onChange={(e) => handleClubChange(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                                >
                                    <option value="">Choose a club...</option>
                                    {availableClubs.map((club) => {
                                        const isFull = club.isFull;

                                        return (
                                            <option
                                                key={club.id}
                                                value={club.id}
                                                disabled={isFull}
                                                className={isFull ? 'text-gray-400' : ''}
                                            >
                                                {club.name} ({club.memberCount}/{club.memberLimit} members){isFull && ' - FULL'}
                                            </option>
                                        );
                                    })}
                                </select>
                                <p className="mt-2 text-sm text-gray-600">
                                    Clubs have member limits. Full clubs are disabled.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Category Selection - Only show if categories exist */}
                    {selectedClub && hasCategories && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-lg font-semibold text-gray-800 mb-3">
                                    Select Category
                                </label>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => handleCategoryChange(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                                >
                                    <option value="">Choose a category...</option>
                                    {availableCategories.map((category) => (
                                        <option key={category.id || category.name || category} value={category.id || category.name || category}>
                                            {category.name || category}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Custom Category Input - Only show for Music club "Other" category */}
                            {selectedCategory === 'other' && selectedClub && (() => {
                                const selectedClubData = allClubs.find(club => club.id === selectedClub);
                                return selectedClubData && selectedClubData.name && selectedClubData.name.toLowerCase().includes('music') && selectedDomain === 'LCH';
                            })() && (
                                <div>
                                    <label className="block text-lg font-semibold text-gray-800 mb-3">
                                        Specify Your Category
                                    </label>
                                    <input
                                        type="text"
                                        value={customCategory}
                                        onChange={(e) => handleCustomCategoryChange(e.target.value)}
                                        placeholder="Enter your custom category name..."
                                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                                        maxLength={50}
                                    />
                                    <p className="mt-2 text-sm text-gray-600">
                                        Enter a custom category name for your music project.
                                    </p>
                                </div>
                            )}
                        </div>
            )}

                    {/* Project Selection - Only show if projects exist and not TEC+Y25 */}
                    {selectedCategory && availableProjects.length > 0 && !(selectedDomain === 'TEC' && studentYear === 'Y25') && (
                        <div>
                            <label className="block text-lg font-semibold text-gray-800 mb-3">
                                Select Project
                            </label>
                            <select
                                value={formData.selectedProject || ""}
                                onChange={(e) => handleProjectChange(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                            >
                                <option value="">Choose a project...</option>
                                {availableProjects.map((project) => {
                                    const isTecProject = selectedDomain === 'TEC';
                                    const isFull = isTecProject && project.isFull;

                                    return (
                                        <option
                                            key={project.id}
                                            value={project.id}
                                            disabled={isFull}
                                            className={isFull ? 'text-gray-400' : ''}
                                        >
                                            {project.name}{isTecProject && ` (${project.memberCount}/2 members)${isFull ? ' - FULL' : ''}`}
                                        </option>
                                    );
                                })}
                            </select>
                            {selectedDomain === 'TEC' && (
                                <p className="mt-2 text-sm text-gray-600">
                                    TEC projects have a 2-member limit. Full projects are disabled.
                                </p>
                            )}
                        </div>
                    )}

                    {/* Constraint Warning */}
                    {constraintMessage && (
                        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="text-blue-800 font-medium">
                                {constraintMessage}
                            </div>
                        </div>
                    )}
                    
                    {/* Selection Summary */}
                    {(formData.selectedClub || formData.selectedProject) && (
                        <div className={`mt-6 p-4 rounded-lg border ${
                            canProceed
                                ? 'bg-green-50 border-green-200'
                                : 'bg-red-50 border-red-200'
                        }`}>
                            <h3 className={`text-lg font-semibold mb-2 ${
                                canProceed ? 'text-green-800' : 'text-red-800'
                            }`}>
                                Selection Summary
                            </h3>
                            <div className="space-y-2 text-sm">
                                {selectedDomain && (
                                    <div><span className="font-medium">Domain:</span> {domains.find(d => d.id === selectedDomain)?.name}</div>
                                )}
                                {formData.selectedClub && (
                                    <div><span className="font-medium">Club:</span> {allClubs.find(c => c.id === formData.selectedClub)?.name}</div>
                                )}
                                {selectedCategory && (
                                    <div><span className="font-medium">Category:</span> {formData.selectedCategory && formData.selectedCategory !== 'other' ? formData.selectedCategory : selectedCategory}</div>
                                )}
                                {formData.selectedProject && (
                                    <div><span className="font-medium">Project:</span> {formData.projectName}</div>
                                )}
                                <div className={`mt-2 font-medium ${
                                    canProceed ? 'text-green-700' : 'text-red-700'
                                }`}>
                                    {canProceed
                                        ? '✅ You can proceed with this selection'
                                        : '❌ Please complete the required selections above'
                                    }
                                            </div>
                                        </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

ProjectSelection.propTypes = {
    formData: PropTypes.shape({
        username: PropTypes.string,
        selectedDomain: PropTypes.string,
        selectedClub: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        selectedProject: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        projectName: PropTypes.string,
        projectDescription: PropTypes.string,
        selectedCategory: PropTypes.string,
        customCategory: PropTypes.string
    }).isRequired,
    updateFormData: PropTypes.func.isRequired,
    onValidationChange: PropTypes.func
};