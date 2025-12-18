import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { toast } from "sonner";

export default function ClubSelection({ formData, updateFormData, onValidationChange }) {
    const [selectedDomain, setSelectedDomain] = useState("");
    const [selectedClub, setSelectedClub] = useState("");
    const [availableClubs, setAvailableClubs] = useState([]);
    const [loading, setLoading] = useState(true);

    // Domain categories
    const allDomains = [
        { id: "TEC", name: "Technical", description: "Technology and Engineering projects" },
        { id: "LCH", name: "Literary, Cultural & Heritage", description: "Arts, Literature and Cultural preservation" },
        { id: "ESO", name: "Extension & Social Outreach", description: "Community service and social initiatives" },
        { id: "IIE", name: "Innovation, Incubation & Entrepreneurship", description: "Startup and Innovation projects" },
        { id: "HWB", name: "Health & Well-being", description: "Health, fitness and wellness programs" }
    ];

    // Fetch clubs from unified registration API
    useEffect(() => {
        const fetchRegistrationData = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/register-data');
                if (response.ok) {
                    const data = await response.json();
                    setAvailableClubs(data.clubs || []);
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

        // Get available clubs for this domain
        let clubsForDomain = availableClubs.filter(club => club.domain === domainId);
        setAvailableClubs(availableClubs); // Keep all clubs but filter for display

        updateFormData({
            selectedDomain: domainId,
            selectedClub: "",
        });
    };

    const handleClubChange = (clubId) => {
        // Check if the selected club is full
        const selectedClubData = availableClubs.find(club => club.id === clubId);
        if (!selectedClubData) return;

        if (selectedClubData.isFull) {
            toast.error(`This club is already full (${selectedClubData.memberCount}/${selectedClubData.memberLimit} members). Please select a different club.`);
            return; // Don't proceed with selection
        }

        setSelectedClub(clubId);
        updateFormData({
            selectedClub: clubId,
        });
    };

    // Check if current selection meets constraints for proceeding
    const canProceed = React.useMemo(() => {
        return selectedClub && selectedDomain;
    }, [selectedClub, selectedDomain]);

    // Communicate validation status to parent component
    React.useEffect(() => {
        if (onValidationChange) {
            onValidationChange(canProceed);
        }
    }, [canProceed, onValidationChange]);

    return (
        <div className="bg-white p-6 md:p-8 max-w-none">
            <h2 className="text-2xl font-bold mb-6 text-center">
                Club Selection
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
                                {allDomains.map((domain) => (
                                    <option key={domain.id} value={domain.id}>
                                        {domain.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Club Selection */}
                        {selectedDomain && (
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
                                    {(() => {
                                        let clubsForDomain = availableClubs.filter(club => club.domain === selectedDomain);
                                        return clubsForDomain.map((club) => {
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
                                        });
                                    })()}
                                </select>
                                <p className="mt-2 text-sm text-gray-600">
                                    Clubs have member limits. Full clubs are disabled.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Selection Summary */}
                    {(formData.selectedClub || selectedDomain) && (
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
                                    <div><span className="font-medium">Domain:</span> {allDomains.find(d => d.id === selectedDomain)?.name}</div>
                                )}
                                {formData.selectedClub && (
                                    <div><span className="font-medium">Club:</span> {availableClubs.find(c => c.id === formData.selectedClub)?.name}</div>
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

ClubSelection.propTypes = {
    formData: PropTypes.shape({
        selectedDomain: PropTypes.string,
        selectedClub: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }).isRequired,
    updateFormData: PropTypes.func.isRequired,
    onValidationChange: PropTypes.func
};
