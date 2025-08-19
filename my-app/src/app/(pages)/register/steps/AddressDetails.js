import { useState } from "react";
import { countryCodes } from "../../../Data/coutries.js";
import { stateNames } from "../../../Data/states.js";
import { districtNames } from "../../../Data/districts.js";
import { girlHostels, boyHostels, busRoutes } from "../../../Data/locations.js";

export default function AddressDetails({ formData, updateFormData }) {
    const [selectedCountry, setSelectedCountry] = useState(formData.country || "IN");
    const [selectedState, setSelectedState] = useState(formData.state || "");

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        if (name === "country") {
            setSelectedCountry(value);
            setSelectedState(""); // Reset state when country changes
            updateFormData({
                [name]: value,
                state: "",
                district: ""
            });
        } else if (name === "state") {
            setSelectedState(value);
            updateFormData({
                [name]: value,
                district: "" // Reset district when state changes
            });
        } else {
            updateFormData({
                [name]: value
            });
        }
    };

    const getAvailableHostels = () => {
        if (formData.gender === "Female") {
            return girlHostels;
        } else if (formData.gender === "Male") {
            return boyHostels;
        }
        return [];
    };

    const availableDistricts = selectedState && districtNames[selectedState] ? districtNames[selectedState] : [];

    return (
        <div className="bg-white p-6 md:p-8 rounded-lg shadow-md max-w-none">
            <h2 className="text-2xl font-bold mb-6 text-center">Address Details</h2>
            
            <div className="grid gap-6 lg:grid-cols-2">
                <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                        Country *
                    </label>
                    <select
                        id="country"
                        name="country"
                        className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                        value={selectedCountry}
                        onChange={handleInputChange}
                        required
                    >
                        {countryCodes.map((country, index) => (
                            <option key={`${country.code}-${index}`} value={country.code}>
                                {country.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                        State *
                    </label>
                    {selectedCountry === "IN" ? (
                        <select
                            id="state"
                            name="state"
                            className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                            value={selectedState}
                            onChange={handleInputChange}
                            required
                        >
                            <option value="">Select State</option>
                            {stateNames.map((state) => (
                                <option key={state} value={state}>{state}</option>
                            ))}
                        </select>
                    ) : (
                        <input
                            type="text"
                            id="state"
                            name="state"
                            placeholder="Enter your state/province"
                            className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            value={selectedState}
                            onChange={handleInputChange}
                            required
                        />
                    )}
                </div>

                <div>
                    <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-2">
                        District *
                    </label>
                    {selectedCountry === "IN" && availableDistricts.length > 0 ? (
                        <select
                            id="district"
                            name="district"
                            className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                            value={formData.district || ""}
                            onChange={handleInputChange}
                            required
                        >
                            <option value="">Select District</option>
                            {availableDistricts.map((district) => (
                                <option key={district} value={district}>{district}</option>
                            ))}
                        </select>
                    ) : (
                        <input
                            type="text"
                            id="district"
                            name="district"
                            placeholder="Enter your district"
                            className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            value={formData.district || ""}
                            onChange={handleInputChange}
                            required
                        />
                    )}
                </div>

                <div>
                    <label htmlFor="pincode" className="block text-sm font-medium text-gray-700 mb-2">
                        PIN Code *
                    </label>
                    <input
                        type="text"
                        id="pincode"
                        name="pincode"
                        placeholder="Enter PIN code"
                        className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        value={formData.pincode || ""}
                        onChange={handleInputChange}
                        pattern="[0-9]{6}"
                        maxLength={10}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="residenceType" className="block text-sm font-medium text-gray-700 mb-2">
                        Residence Type *
                    </label>
                    <select
                        id="residenceType"
                        name="residenceType"
                        className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                        value={formData.residenceType || ""}
                        onChange={handleInputChange}
                        required
                    >
                        <option value="">Select Residence Type</option>
                        <option value="Hostel">Hostel</option>
                        <option value="Day Scholar">Day Scholar</option>
                    </select>
                </div>

                {formData.residenceType === "Hostel" && (
                    <div>
                        <label htmlFor="hostelName" className="block text-sm font-medium text-gray-700 mb-2">
                            Hostel Name *
                        </label>
                        <select
                            id="hostelName"
                            name="hostelName"
                            className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                            value={formData.hostelName || ""}
                            onChange={handleInputChange}
                            required
                        >
                            <option value="">Select Hostel</option>
                            {getAvailableHostels().map((hostel) => (
                                <option key={hostel["S.No"]} value={hostel.hostelName}>
                                    {hostel.hostelName.trim()} - {hostel["Location of the Hostel"]}
                                </option>
                            ))}
                        </select>
                        {formData.gender && getAvailableHostels().length === 0 && (
                            <p className="text-sm text-red-500 mt-1">
                                Please complete your personal details first to see available hostels.
                            </p>
                        )}
                    </div>
                )}

                {formData.residenceType === "Day Scholar" && (
                    <div>
                        <label htmlFor="busRoute" className="block text-sm font-medium text-gray-700 mb-2">
                            Bus Route (if applicable)
                        </label>
                        <select
                            id="busRoute"
                            name="busRoute"
                            className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                            value={formData.busRoute || ""}
                            onChange={handleInputChange}
                        >
                            <option value="">Select Bus Route</option>
                            {busRoutes.map((route) => (
                                <option key={route["S.No"]} value={`${route["Route ID"]} - ${route.Route}`}>
                                    {route["Route ID"]} - {route.Route} ({route.Location})
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            <div className="mt-6 bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Fields marked with * are required. This address information 
                    will be used for official communications and verification purposes.
                </p>
            </div>
        </div>
    );
}
