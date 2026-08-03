import { useState } from "react";
import { branchNames } from "../../../../Data/branches";
import { countryCodes } from "../../../../Data/coutries";

// Auto-fetch only — a convenience default, not an enforced restriction: the
// ID field's first 2 digits are pre-filled from the selected year, but stay
// freely editable afterward and aren't validated against this mapping.
const YEAR_PREFIX = { "1st": "26", "2nd": "25", "3rd": "24", "4th": "23", "5th": "22" };

export default function PersonalDetails({ formData, updateFormData }) {
    const [isOtherBranch, setIsOtherBranch] = useState(false);

    const isCDOEBranch = formData.branch === "KL CDOE Management (OL) BBA" || formData.branch === "KL CDOE Humanities (OL) BCA";

    // Registration IDs are entered manually — only length and digit-only are
    // validated. The year-prefix is auto-fetched as a starting point (see
    // YEAR_PREFIX) but never enforced, since CDOE and other formats don't
    // follow it.
    const validateUsername = (username) => {
        if (!username) return false;
        return /^\d{10,11}$/.test(username);
    };

    const validateUsernameForTyping = (username) => {
        if (!username) return true;
        if (username.length > 11) return false;
        if (!/^\d*$/.test(username)) return false;
        return true;
    };

    const isUsernameComplete = (username) => validateUsername(username);

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name === "username") {
            if (value && !validateUsernameForTyping(value)) return;
            const email = value ? `${value}@kluniversity.in` : "";
            updateFormData({ [name]: value, email });
        } else if (name === "countryCode") {
            const selectedCountry = countryCodes.find(c => c.dial_code === value);
            updateFormData({ [name]: value, countryName: selectedCountry ? selectedCountry.name : "" });
        } else if (name === "year") {
            // Auto-fetch the ID prefix for the selected year — CDOE branches
            // use their own numbering, so they're exempt entirely.
            let currentUsername = formData.username || "";
            if (!isCDOEBranch) {
                const prefix = YEAR_PREFIX[value];
                if (prefix) currentUsername = prefix + currentUsername.slice(2);
            }
            const email = currentUsername ? `${currentUsername}@kluniversity.in` : "";
            updateFormData({ [name]: value, username: currentUsername, email });
        } else if (name === "branch") {
            const newIsCDOE = value === "KL CDOE Management (OL) BBA" || value === "KL CDOE Humanities (OL) BCA";
            let currentUsername = formData.username || "";
            if (!newIsCDOE && formData.year) {
                const prefix = YEAR_PREFIX[formData.year];
                if (prefix && !currentUsername.startsWith(prefix)) {
                    currentUsername = prefix + currentUsername.slice(2);
                }
            }
            const email = currentUsername ? `${currentUsername}@kluniversity.in` : "";
            updateFormData({ [name]: value, username: currentUsername, email });
        } else {
            updateFormData({ [name]: value });
        }
    };

    const handleBranchSelect = (e) => {
        const value = e.target.value;
        if (value === "Other") {
            setIsOtherBranch(true);
            handleInputChange({ target: { name: "branch", value: "" } });
        } else {
            setIsOtherBranch(false);
            handleInputChange({ target: { name: "branch", value } });
        }
    };

    return (
        <div className="bg-white p-6 md:p-8 max-w-none">
            <h2 className="text-2xl font-bold mb-6 text-center">Personal Details</h2>

            <div className="grid gap-6 lg:grid-cols-3 md:grid-cols-2">

                {/* Campus - mandatory */}
                <div>
                    <label htmlFor="campus" className="block text-sm font-medium text-gray-700 mb-2">
                        Campus *
                    </label>
                    <select
                        id="campus"
                        name="campus"
                        className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                        value={formData.campus || ""}
                        onChange={handleInputChange}
                        required
                    >
                        <option value="">Select Campus</option>
                        <option value="KLU - Vaddeswaram">KLU - Vaddeswaram</option>
                        <option value="KLH - Bachupally">KLH - Bachupally</option>
                        <option value="KLH - Aziz Nagar">KLH - Aziz Nagar</option>
                        <option value="KLH - GBS">KLH - GBS</option>
                    </select>
                </div>

                {/* Branch */}
                <div>
                    <label htmlFor="branch" className="block text-sm font-medium text-gray-700 mb-2">
                        Branch *
                    </label>
                    <select
                        id="branch"
                        name="branch"
                        className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                        value={isOtherBranch ? "Other" : (formData.branch || "")}
                        onChange={handleBranchSelect}
                        required={!isOtherBranch}
                    >
                        <option value="">Select Branch</option>
                        {branchNames.map((branch) => (
                            <option key={branch.id} value={branch.name}>{branch.name}</option>
                        ))}
                        <option value="Other">Other</option>
                    </select>
                    {isOtherBranch && (
                        <input
                            type="text"
                            placeholder="Enter your branch name"
                            className="w-full h-12 px-4 mt-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            value={formData.branch || ""}
                            onChange={(e) => handleInputChange({ target: { name: "branch", value: e.target.value } })}
                            required
                        />
                    )}
                </div>

                {/* Gender */}
                <div>
                    <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
                        Gender *
                    </label>
                    <select
                        id="gender"
                        name="gender"
                        className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                        value={formData.gender || ""}
                        onChange={handleInputChange}
                        required
                    >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                    </select>
                </div>

                {/* Academic Year */}
                <div>
                    <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-2">
                        Academic Year *
                    </label>
                    <select
                        id="year"
                        name="year"
                        className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                        value={formData.year || ""}
                        onChange={handleInputChange}
                        required
                    >
                        <option value="">Select Year</option>
                        <option value="1st">1st Year</option>
                        <option value="2nd">2nd Year</option>
                        <option value="3rd">3rd Year</option>
                        <option value="4th">4th Year</option>
                        <option value="5th">5th Year</option>
                    </select>
                </div>

                {/* Username */}
                <div className="lg:col-span-2">
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                        Username *
                    </label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        placeholder="Enter your 10 or 11-digit registration ID"
                        className={`w-full h-12 px-4 border rounded-lg focus:ring-2 focus:border-blue-500 outline-none ${
                            formData.username && formData.username.length > 0 && !isUsernameComplete(formData.username)
                                ? 'border-red-500 focus:ring-red-500'
                                : 'border-gray-300 focus:ring-blue-500'
                        }`}
                        value={formData.username || ""}
                        onChange={handleInputChange}
                        pattern="^\d{10,11}$"
                        maxLength={11}
                        minLength={10}
                        title="Username must be 10 or 11 digits long"
                        required
                    />
                    {formData.username && formData.username.length > 0 && !isUsernameComplete(formData.username) ? (
                        <p className="text-xs text-red-500 mt-1">
                            Username must be 10 or 11 digits (currently {formData.username.length})
                        </p>
                    ) : (
                        <p className="text-xs text-gray-500 mt-1">Must be 10 or 11 digits long</p>
                    )}
                </div>

                {/* Full Name */}
                <div className="lg:col-span-2">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        placeholder="Enter your full name"
                        className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        value={formData.name || ""}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                {/* Career Choice */}
                <div className="lg:col-span-2">
                    <label htmlFor="careerChoice" className="block text-sm font-medium text-gray-700 mb-2">
                        Career Choice *
                    </label>
                    <select
                        id="careerChoice"
                        name="careerChoice"
                        className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                        value={formData.careerChoice || ""}
                        onChange={handleInputChange}
                        required
                    >
                        <option value="">Select Career Choice</option>
                        <option value="Placement">Placement</option>
                        <option value="Higher Education">Higher Education</option>
                        <option value="Entrepreneurship">Entrepreneurship</option>
                        <option value="Research & Development (R&D)">Research & Development (R&D)</option>
                        <option value="Civil Services">Civil Services</option>
                        <option value="Social Service / NGOs">Social Service / NGOs</option>
                        <option value="Overseas Career">Overseas Career</option>
                    </select>
                </div>

                {/* Email (auto-generated) */}
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        placeholder="Auto-generated based on username"
                        className="w-full h-12 px-4 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                        value={formData.email || ""}
                        readOnly
                        required
                    />
                    <p className="text-xs text-gray-500 mt-1">Email is auto-generated based on username</p>
                </div>

                {/* Phone Number */}
                <div className="lg:col-span-2">
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                    </label>
                    <div className="flex gap-2">
                        <select
                            name="countryCode"
                            className="w-32 h-12 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                            value={formData.countryCode || "+91"}
                            onChange={handleInputChange}
                            required
                        >
                            {countryCodes.map((country, index) => (
                                <option key={`${country.code}-${index}`} value={country.dial_code}>
                                    {country.dial_code} {country.name}
                                </option>
                            ))}
                        </select>
                        <input
                            type="tel"
                            id="phoneNumber"
                            name="phoneNumber"
                            placeholder="Enter 10-digit phone number"
                            className="flex-1 h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            value={formData.phoneNumber || ""}
                            onChange={handleInputChange}
                            pattern="[0-9]{10}"
                            maxLength={15}
                            required
                        />
                    </div>
                </div>

            </div>

            <div className="mt-6 bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Fields marked with * are required. Make sure all information is accurate
                    as it will be used for program communications and certificates.
                </p>
            </div>
        </div>
    );
}