import { branchNames } from "../../../../Data/branches.js";
import { countryCodes } from "../../../../Data/coutries.js";

export default function PersonalDetails({ formData, updateFormData }) {

    const validateUsername = (username) => {
        if (!username) return false; // Don't allow empty
        if (username.length !== 10) return false; // Must be exactly 10 characters
        if (!/^\d{10}$/.test(username)) return false; // Must be all digits
        if (!username.startsWith('22') && !username.startsWith('23') && !username.startsWith('24') && !username.startsWith('25')) return false; // Must start with 22, 23, 24, or 25
        return true;
    };

    const validateUsernameForTyping = (username) => {
        if (!username) return true; // Allow empty while typing
        if (username.length > 10) return false; // Don't allow more than 10 characters
        if (!/^\d*$/.test(username)) return false; // Must be all digits
        
        // If user has typed at least 2 characters, check the prefix
        if (username.length >= 2) {
            if (!username.startsWith('22') && !username.startsWith('23') && !username.startsWith('24') && !username.startsWith('25')) return false;
        }
        
        return true;
    };

    const isUsernameComplete = (username) => {
        return validateUsername(username);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        if (name === "username") {
            // Validate username input for typing
            if (value && !validateUsernameForTyping(value)) {
                // Don't update if invalid
                return;
            }
            // Auto-generate email when username changes
            const email = value ? `${value}@kluniversity.in` : "";
            updateFormData({
                [name]: value,
                email: email
            });
        } else if (name === "countryCode") {
            // Store the country name instead of code
            const selectedCountry = countryCodes.find(c => c.dial_code === value);
            updateFormData({
                [name]: value,
                countryName: selectedCountry ? selectedCountry.name : ""
            });
        } else if (name === "year") {
            // Update username prefix based on year selection
            let currentUsername = formData.username || "";
            if (value === "1st" && !currentUsername.startsWith("25")) {
                // Replace first 2 digits with 25 for 1st year
                currentUsername = currentUsername.length >= 2 ?
                    "25" + currentUsername.substring(2) :
                    "25" + currentUsername;
            } else if (value === "2nd" && !currentUsername.startsWith("24")) {
                // Replace first 2 digits with 24 for 2nd year
                currentUsername = currentUsername.length >= 2 ?
                    "24" + currentUsername.substring(2) :
                    "24" + currentUsername;
            } else if (value === "3rd" && !currentUsername.startsWith("23")) {
                // Replace first 2 digits with 23 for 3rd year
                currentUsername = currentUsername.length >= 2 ?
                    "23" + currentUsername.substring(2) :
                    "23" + currentUsername;
            } else if (value === "4th" && !currentUsername.startsWith("22")) {
                // Replace first 2 digits with 22 for 4th year
                currentUsername = currentUsername.length >= 2 ?
                    "22" + currentUsername.substring(2) :
                    "22" + currentUsername;
            }
            
            const email = currentUsername ? `${currentUsername}@kluniversity.in` : "";
            updateFormData({
                [name]: value,
                username: currentUsername,
                email: email
            });
        } else {
            updateFormData({
                [name]: value
            });
        }
    };

    return (
        <div className="bg-white p-6 md:p-8 max-w-none">
            <h2 className="text-2xl font-bold mb-6 text-center">Personal Details</h2>
            
            <div className="grid gap-6 lg:grid-cols-3 md:grid-cols-2">
                <div className="lg:col-span-2">
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                        Username *
                    </label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        placeholder="Enter username (must start with 22, 23, 24, or 25)"
                        className={`w-full h-12 px-4 border rounded-lg focus:ring-2 focus:border-blue-500 outline-none ${
                            formData.username && formData.username.length > 0 && !isUsernameComplete(formData.username) 
                                ? 'border-red-500 focus:ring-red-500' 
                                : 'border-gray-300 focus:ring-blue-500'
                        }`}
                        value={formData.username || ""}
                        onChange={handleInputChange}
                        pattern="^(22|23|24|25)\d{8}$"
                        maxLength={10}
                        minLength={10}
                        title="Username must start with 22, 23, 24, or 25 and be exactly 10 characters long"
                        required
                    />
                    {formData.username && formData.username.length > 0 && !isUsernameComplete(formData.username) ? (
                        <p className="text-xs text-red-500 mt-1">
                            {!formData.username.startsWith('22') && !formData.username.startsWith('23') && !formData.username.startsWith('24') && !formData.username.startsWith('25')
                                ? 'Username must start with 22, 23, 24, or 25' 
                                : formData.username.length !== 10 
                                ? `Username must be exactly 10 digits (currently ${formData.username.length})` 
                                : 'Username must contain only digits'}
                        </p>
                    ) : (
                        <p className="text-xs text-gray-500 mt-1">
                            Must start with 22, 23, 24, or 25 and be exactly 10 digits long
                        </p>
                    )}
                </div>

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

                <div>
                    <label htmlFor="cluster" className="block text-sm font-medium text-gray-700 mb-2">
                        Cluster *
                    </label>
                    <select
                        id="cluster"
                        name="cluster"
                        className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                        value={formData.cluster || ""}
                        onChange={handleInputChange}
                        required
                    >
                        <option value="">Select Cluster</option>
                        <option value="1">Cluster 1</option>
                        <option value="2">Cluster 2</option>
                    </select>
                </div>

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

                <div>
                    <label htmlFor="branch" className="block text-sm font-medium text-gray-700 mb-2">
                        Branch *
                    </label>
                    <select
                        id="branch"
                        name="branch"
                        className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                        value={formData.branch || ""}
                        onChange={handleInputChange}
                        required
                    >
                        <option value="">Select Branch</option>
                        {branchNames.map((branch) => (
                            <option key={branch.id} value={branch.name}>{branch.name}</option>
                        ))}
                    </select>
                </div>

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
                    </select>
                </div>

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