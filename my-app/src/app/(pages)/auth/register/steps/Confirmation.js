export default function Confirmation({ formData, updateFormData }) {
    return (
        <div className="bg-white p-6 md:p-8 max-w-none">
            <h2 className="text-2xl font-bold mb-6 text-center">Confirmation</h2>
            
            <div className="mb-6">
                <p className="text-gray-700 text-center leading-relaxed">
                    Please review all the information you have provided. Make sure everything is correct 
                    before submitting your registration.
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-6">
                    {/* Personal Information */}
                    <div className="bg-gray-50 p-6 rounded-lg border">
                        <h3 className="text-lg font-semibold mb-4 text-gray-800">Personal Information</h3>
                        <div className="grid gap-3 text-sm">
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <p className="text-gray-600">Username:</p>
                                    <p className="font-medium">{formData.username || "Not provided"}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Branch:</p>
                                    <p className="font-medium">{formData.branch || "Not provided"}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <p className="text-gray-600">Full Name:</p>
                                    <p className="font-medium">{formData.name || "Not provided"}</p>
                                </div>
                                 <div>
                                    <p className="text-gray-600">Cluster:</p>
                                    <p className="font-medium">{formData.cluster || "Not provided"}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <p className="text-gray-600">Email:</p>
                                    <p className="font-medium">{formData.email || "Not provided"}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Phone:</p>
                                    <p className="font-medium">{formData.countryCode} {formData.phoneNumber || "Not provided"}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <p className="text-gray-600">Gender:</p>
                                    <p className="font-medium">{formData.gender || "Not provided"}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Year:</p>
                                    <p className="font-medium">{formData.year || "Not provided"}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                                <div>
                                    <p className="text-gray-600">ERP Fee Receipt Reference:</p>
                                    <p className="font-medium">{formData.erpFeeReceiptRef || "Not provided"}</p>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Project Selection */}
                    <div className="bg-gray-50 p-6 rounded-lg border">
                        <h3 className="text-lg font-semibold mb-4 text-gray-800">Project Selection</h3>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <p className="text-sm text-gray-600">Domain:</p>
                                <p className="font-medium">{formData.selectedDomain || "Not selected"}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Club:</p>
                                <p className="font-medium">{formData.selectedClub || "Not selected"}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <p className="text-sm text-gray-600">Category:</p>
                                <p className="font-medium">{formData.selectedCategory || "Not selected"}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Project:</p>
                                <p className="font-medium">{formData.projectName || "Not selected"}</p>
                            </div>
                        </div>
                    </div>

                    {/* Address Information */}
                    <div className="bg-gray-50 p-6 rounded-lg border">
                        <h3 className="text-lg font-semibold mb-4 text-gray-800">Address Information</h3>
                        <div className="grid gap-3 text-sm">
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <p className="text-gray-600">Country:</p>
                                    <p className="font-medium">{formData.countryName || formData.country || "Not provided"}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">State:</p>
                                    <p className="font-medium">{formData.state || "Not provided"}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <p className="text-gray-600">District:</p>
                                    <p className="font-medium">{formData.district || "Not provided"}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">PIN Code:</p>
                                    <p className="font-medium">{formData.pincode || "Not provided"}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <p className="text-gray-600">Residence Type:</p>
                                    <p className="font-medium">{formData.residenceType || "Not provided"}</p>
                                </div>
                                {formData.residenceType === "Hostel" && (
                                    <div>
                                        <p className="text-gray-600">Hostel:</p>
                                        <p className="font-medium">{formData.hostelName || "Not provided"}</p>
                                    </div>
                                )}
                                {formData.residenceType === "Day Scholar" && (
                                    <div>
                                        <p className="text-gray-600">Bus Route:</p>
                                        <p className="font-medium">{formData.busRoute || "Not provided"}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Final Confirmation */}
            <div className="mt-8 bg-gray-50 p-6 rounded-lg border">
                <h3 className="text-lg font-semibold mb-3 text-gray-800">Final Confirmation</h3>
                <p className="text-sm text-gray-700 leading-relaxed mb-4">
                    By clicking Submit Registration, you confirm that:
                </p>
                <ul className="text-sm text-gray-700 space-y-1 mb-4">
                    <li>• All information provided is accurate and complete</li>
                    <li>• You agree to participate actively in the program</li>
                    <li>• You understand the program requirements and commitments</li>
                    <li>• You accept the terms and conditions of the program</li>
                </ul>
                <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded text-sm">
                    <strong>Important:</strong> Once submitted, you will receive a confirmation email. 
                    The selection process will begin, and you will be notified about the results within 7-10 business days.
                </div>
            </div>
        </div>
    );
}
