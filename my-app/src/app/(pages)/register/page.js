"use client"
import { useState } from "react";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Import step components
import Overview from "./steps/Overview";
import Rules from "./steps/Rules";
import Undertaking from "./steps/Undertaking";
import ProjectSelection from "./steps/ProjectSelection";
import PersonalDetails from "./steps/PersonalDetails";
import AddressDetails from "./steps/AddressDetails";
import Confirmation from "./steps/Confirmation";

export default function Register() {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        // Personal Details
        username: "",
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        role: "student",
        
        // Address Details
        country: "IN", // Default to India
        state: "",
        district: "",
        pincode: "",
        residenceType: "",
        hostelName: "",
        busRoute: "",
        
        // Project Selection
        selectedProject: "",
        projectPreference: "",
        
        // Undertaking
        agreedToTerms: false,
        agreedToRules: false,
    });
    const [loading, setLoading] = useState(false);

    const router = useRouter();

    const steps = [
        { id: 1, name: "Overview", component: Overview },
        { id: 2, name: "Rules", component: Rules },
        { id: 3, name: "Undertaking", component: Undertaking },
        { id: 4, name: "Project Selection", component: ProjectSelection },
        { id: 5, name: "Personal Details", component: PersonalDetails },
        { id: 6, name: "Address Details", component: AddressDetails },
        { id: 7, name: "Confirmation", component: Confirmation },
    ];

    const updateFormData = (newData) => {
        setFormData(prev => ({
            ...prev,
            ...newData
        }));
    };

    const validateStep = (step) => {
        switch (step) {
            case 3: // Undertaking
                if (!formData.agreedToTerms) {
                    toast.error("Please agree to all terms and conditions");
                    return false;
                }
                break;
            case 4: // Project Selection
                if (!formData.selectedProject) {
                    toast.error("Please select a project");
                    return false;
                }
                break;
            case 5: // Personal Details
                if (!formData.username || !formData.name || !formData.email || !formData.phoneNumber || !formData.branch || !formData.gender || !formData.cluster || !formData.year) {
                    toast.error("Please fill all required fields");
                    return false;
                }
                // Validate username format
                if (!formData.username || formData.username.length !== 10 || !/^\d{10}$/.test(formData.username) || (!formData.username.startsWith('24') && !formData.username.startsWith('25'))) {
                    toast.error("Username must be exactly 10 digits and start with 24 or 25");
                    return false;
                }
                break;
            case 6: // Address Details
                if (!formData.country || !formData.state || !formData.district || !formData.pincode || !formData.residenceType) {
                    toast.error("Please fill all address fields");
                    return false;
                }
                // Check hostel name if residence type is hostel
                if (formData.residenceType === "Hostel" && !formData.hostelName) {
                    toast.error("Please select a hostel name");
                    return false;
                }
                break;
        }
        return true;
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            if (currentStep < steps.length) {
                setCurrentStep(currentStep + 1);
            }
        }
    };

    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmit = async () => {
        if (!validateStep(currentStep)) return;

        setLoading(true);
        try {
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                toast.success("Registration Successful! Please login.");
                router.push("/auth/login");
            } else {
                const error = await response.json();
                toast.error(error.message || "Registration failed");
            }
        } catch (error) {
            console.error("Registration error:", error);
            toast.error("An error occurred during registration");
        } finally {
            setLoading(false);
        }
    };

    const CurrentStepComponent = steps[currentStep - 1].component;

    return (
        <div className="w-full h-screen flex flex-col">
            {/* Fixed Header */}
            <div className="flex-shrink-0 ">
                <div className="py-1">
                    {/* <h1 className="text-3xl font-bold text-center mb-6">Register for SAC SIL Portal</h1> */}
                    
                    {/* Progress Indicator */}
                    <div className="flex items-center justify-center space-x-2 md:space-x-4 px-4 py-4">
                        {steps.map((step, index) => (
                            <div key={step.id} className="flex items-center">
                                <div className="flex flex-col items-center">
                                    {/* Step Name */}
                                    <p className="text-xs font-medium text-gray-600 mb-1 text-center whitespace-nowrap">
                                        {step.name}
                                    </p>
                                    {/* Step Dot */}
                                    <div
                                        className={`w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center text-xs font-semibold justify-center p-1 ${
                                            currentStep > step.id
                                                ? "bg-green-500"
                                                : currentStep === step.id
                                                ? "bg-black text-white"
                                                : "bg-gray-300"
                                        }`}
                                    >
                                        {step.id}
                                    </div>
                                </div>
                                {index < steps.length - 1 && (
                                    <div
                                        className={`w-6 md:w-12 h-0.5 mx-1 md:mx-2 mt-6 ${
                                            currentStep > step.id ? "bg-green-500" : "bg-gray-300"
                                        }`}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Scrollable Step Content */}
            <div className="flex-1 overflow-y-auto bg-gray-50">
                <div className="w-full max-w-7xl mx-auto px-4 py-4">
                    <CurrentStepComponent 
                        formData={formData} 
                        updateFormData={updateFormData}
                    />
                </div>
            </div>

            {/* Fixed Navigation Footer */}
            <div className="flex-shrink-0">
                <div className="max-w-7xl mx-auto px-4 py-2">
                    <div className="flex justify-end items-center gap-6">
                        <div className="text-sm text-gray-600 font-medium">
                            Step {currentStep} of {steps.length}
                        </div>
                        <button
                            onClick={handlePrevious}
                            disabled={currentStep === 1}
                            className={`px-6 py-3 rounded font-medium transition-colors ${
                                currentStep === 1
                                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    : "bg-gray-600 text-white hover:bg-gray-700"
                            }`}
                        >
                            Previous
                        </button>

                        

                        {currentStep < steps.length ? (
                            <button
                                onClick={handleNext}
                                className="px-6 py-3 bg-black text-white rounded font-medium hover:bg-gray-900 transition-colors"
                            >
                                Next
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="px-6 py-3 bg-green-600 text-white rounded font-medium hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                            >
                                {loading ? "Submitting..." : "Submit Registration"}
                            </button>
                        )}
                    </div>
                    
                    {/* Login Link */}
                    {/* <div className="text-center mt-4">
                        <Link className="text-sm underline text-gray-600 hover:text-gray-800 transition-colors" href="/auth/login">
                            Already have an account? Login here
                        </Link>
                    </div> */}
                </div>
            </div>
        </div>
    );
}
