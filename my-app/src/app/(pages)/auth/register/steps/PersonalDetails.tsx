import { branchNames } from "../../../../Data/branches";
import { countryCodes } from "../../../../Data/coutries";

export default function PersonalDetails({ formData, updateFormData }) {

    const validateUsername = (username) => {
        if (!username) return false;
        if (username.length !== 10) return false;
        if (!/^\d{10}$/.test(username)) return false;
        if (!username.startsWith('23') && !username.startsWith('24') && !username.startsWith('25') && !username.startsWith('26')) return false;
        return true;
    };

    const validateUsernameForTyping = (username) => {
        if (!username) return true;
        if (username.length > 10) return false;
        if (!/^\d*$/.test(username)) return false;
        if (username.length >= 2) {
            if (!username.startsWith('23') && !username.startsWith('24') && !username.startsWith('25') && !username.startsWith('26')) return false;
        }
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
            let currentUsername = formData.username || "";
            if (value === "1st" && !currentUsername.startsWith("26")) {
                currentUsername = currentUsername.length >= 2 ? "26" + currentUsername.substring(2) : "26" + currentUsername;
            } else if (value === "2nd" && !currentUsername.startsWith("25")) {
                currentUsername = currentUsername.length >= 2 ? "25" + currentUsername.substring(2) : "25" + currentUsername;
            } else if (value === "3rd" && !currentUsername.startsWith("24")) {
                currentUsername = currentUsername.length >= 2 ? "24" + currentUsername.substring(2) : "24" + currentUsername;
            } else if (value === "4th" && !currentUsername.startsWith("23")) {
                currentUsername = currentUsername.length >= 2 ? "23" + currentUsername.substring(2) : "23" + currentUsername;
            }
            const email = currentUsername ? `${currentUsername}@kluniversity.in` : "";
            updateFormData({ [name]: value, username: currentUsername, email });
        } else {
            updateFormData({ [name]: value });
        }
    };

    return (
        <div className="bg-white p-6 md:p-8 max-w-none">
            <h2 className="text-2xl font-bold mb-6 text-center">Personal Details</h2>

            <div className="grid gap-6 lg:grid-cols-3 md:grid-cols-2">

                {/* Campus - mandatory, before Academic Year */}
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
                    </select>
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

                {/* Username */}
                <div className="lg:col-span-2">
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                        Username *
                    </label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        placeholder="Enter username (must start with 23, 24, 25, or 26)"
                        className={`w-full h-12 px-4 border rounded-lg focus:ring-2 focus:border-blue-500 outline-none ${
                            formData.username && formData.username.length > 0 && !isUsernameComplete(formData.username)
                                ? 'border-red-500 focus:ring-red-500'
                                : 'border-gray-300 focus:ring-blue-500'
                        }`}
                        value={formData.username || ""}
                        onChange={handleInputChange}
                        pattern="^(23|24|25|26)\d{8}$"
                        maxLength={10}
                        minLength={10}
                        title="Username must start with 23, 24, 25, or 26 and be exactly 10 characters long"
                        required
                    />
                    {formData.username && formData.username.length > 0 && !isUsernameComplete(formData.username) ? (
                        <p className="text-xs text-red-500 mt-1">
                            {!formData.username.startsWith('23') && !formData.username.startsWith('24') && !formData.username.startsWith('25') && !formData.username.startsWith('26')
                                ? 'Username must start with 23, 24, 25, or 26'
                                : formData.username.length !== 10
                                ? `Username must be exactly 10 digits (currently ${formData.username.length})`
                                : 'Username must contain only digits'}
                        </p>
                    ) : (
                        <p className="text-xs text-gray-500 mt-1">Must start with 23, 24, 25, or 26 and be exactly 10 digits long</p>
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

                {/* Branch */}
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