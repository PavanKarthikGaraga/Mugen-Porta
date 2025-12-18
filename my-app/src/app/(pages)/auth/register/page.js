"use client"
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from 'next/link'
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";


// Import step components
import Overview from "./steps/Overview";
import Rules from "./steps/Rules";
import Undertaking from "./steps/Undertaking";
import PersonalDetails from "./steps/PersonalDetails";
import ClubSelection from "./steps/ClubSelection";
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

        // Club Selection
        selectedClub: "",
        selectedDomain: "",

        // Undertaking
        agreedToTerms: false,
        agreedToRules: false,

        // ERP Fee Receipt
        erpFeeReceiptRef: "",
    });
    const [loading, setLoading] = useState(false);
    const [registrationsEnabled, setRegistrationsEnabled] = useState(null);
    const [checkingStatus, setCheckingStatus] = useState(true);
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);
    const [generatedPassword, setGeneratedPassword] = useState("");

    // Check if registrations are enabled
    useEffect(() => {
        const checkRegistrationsStatus = async () => {
            try {
                const response = await fetch('/api/dashboard/admin/controls');
                if (response.ok) {
                    const data = await response.json();
                    setRegistrationsEnabled(data.registrationsEnabled);
                } else {
                    // Default to enabled if we can't check
                    setRegistrationsEnabled(true);
                }
            } catch (error) {
                console.error('Error checking registration status:', error);
                // Default to enabled if there's an error
                setRegistrationsEnabled(true);
            } finally {
                setCheckingStatus(false);
            }
        };

        checkRegistrationsStatus();
    }, []);

    const router = useRouter();

    const steps = [
        { id: 1, name: "Overview", component: Overview },
        { id: 2, name: "Rules", component: Rules },
        { id: 3, name: "Undertaking", component: Undertaking },
        { id: 4, name: "Personal Details", component: PersonalDetails },
        { id: 5, name: "Club Selection", component: ClubSelection },
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
            case 4: // Personal Details
                // Check all required fields, but cluster is only required for non-1st year students
                const clusterRequired = formData.year !== "1st";
                if (!formData.username || !formData.name || !formData.email || !formData.phoneNumber || !formData.branch || !formData.gender || !formData.year || (clusterRequired && !formData.cluster) || !formData.erpFeeReceiptRef) {
                    toast.error("Please fill all required fields");
                    return false;
                }
                // Validate username format
                if (!formData.username || formData.username.length !== 10 || !/^\d{10}$/.test(formData.username) || (!formData.username.startsWith('22') && !formData.username.startsWith('23') && !formData.username.startsWith('24') && !formData.username.startsWith('25'))) {
                    toast.error("Username must be exactly 10 digits and start with 22, 23, 24, or 25");
                    return false;
                }
                // Validate ERP Fee Receipt Reference Number
                if (!formData.erpFeeReceiptRef || formData.erpFeeReceiptRef.trim().length === 0) {
                    toast.error("ERP Fee Receipt Reference Number is required");
                    return false;
                }
                if (formData.erpFeeReceiptRef.length > 50) {
                    toast.error("ERP Fee Receipt Reference Number must be 50 characters or less");
                    return false;
                }
                break;
            case 5: // Club Selection
                if (!formData.selectedClub || !formData.selectedDomain) {
                    toast.error("Please select a domain and club");
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
            // Prepare form data for submission
            let submissionData = { ...formData };

            // Debug: log the final submission data
            console.log('Final form submission data:', {
                selectedDomain: submissionData.selectedDomain,
                selectedClub: submissionData.selectedClub,
            });

            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(submissionData)
            });

            if (response.ok) {
                console.log("Registration Successful!",JSON.stringify(submissionData));
                // Generate password pattern for display
                const last4Digits = formData.phoneNumber.slice(-4);
                const passwordPattern = `${formData.username}${last4Digits}`;
                setGeneratedPassword(passwordPattern);
                setShowSuccessDialog(true);
                toast.success("Registration Successful!");
            } else {
                const error = await response.json();
                console.log("Registration Failed!",JSON.stringify(error));
                // Handle structured error responses
                if (error.errorType === "PROJECT_FULL") {
                    toast.error(`${error.message}\n${error.suggestion}`, {
                        duration: 5000, // Show longer for important messages
                    });
                } else if (error.errorType === "CLUB_FULL") {
                    toast.error(`Club Full: ${error.message}\n${error.suggestion}`, {
                        duration: 5000,
                    });
                } else {
                    toast.error(error.message || "Registration failed");
                }
            }
        } catch (error) {
            console.error("Registration error:", error);
            toast.error("An error occurred during registration");
        } finally {
            setLoading(false);
        }
    };

    const CurrentStepComponent = steps[currentStep - 1].component;

    // Show loading while checking registration status
    if (checkingStatus) {
        return (
            <div className="w-full h-screen flex flex-col justify-center items-center bg-gray-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-800"></div>
                <p className="mt-4 text-gray-600">Checking registration status...</p>
            </div>
        );
    }

    // Show message if registrations are disabled
    if (registrationsEnabled === false) {
        return (
            <div className="w-full h-screen flex flex-col">
                {/* Red Navbar */}
                <div className="bg-red-800 text-white py-2 px-4 flex-shrink-0">
                    <div className="max-w-7xl mx-auto">
                        <h1 className="text-2xl font-extrabold text-center">Student Activity Center</h1>
                    </div>
                </div>

                {/* Registration Closed Message */}
                <div className="flex-1 flex flex-col justify-center items-center bg-gray-50 px-4">
                    <div className="max-w-md w-full text-center">
                        <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200">
                            <div className="mb-6">
                                <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0h-2m-6 4h16a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h2 className="text-xl font-semibold text-gray-900 mb-2">Registrations Closed</h2>
                                <p className="text-gray-600">
                                    Currently registrations are closed. Please wait for further notice from the SAC Activities team.
                                </p>
                            </div>

                            <div className="space-y-3">
                                <button
                                    onClick={() => window.location.reload()}
                                    className="w-full px-4 py-2 bg-red-800 text-white rounded-md hover:bg-red-900 transition-colors"
                                >
                                    Check Again
                                </button>
                                <button
                                    onClick={() => router.push('/auth/login')}
                                    className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                                >
                                    Go to Login
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Red Footer */}
                <div className="bg-red-800 text-white py-2 px-4 flex-shrink-0">
                    <div className="max-w-7xl mx-auto text-center text-sm">
                        <div className="flex flex-col sm:flex-row justify-between items-center">
                            <span>© 2025 KL University SAC Activities. All Rights Reserved.</span>
                            <span className="mt-1 sm:mt-0">
                                Designed and Developed by Pavan Karthik Garaga | ZeroOne CodeClub
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-screen flex flex-col">
            {/* Red Navbar */}
            <div className="bg-red-800 flex items-center display-center text-white py-2 px-4 flex-shrink-0">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-2xl font-extrabold text-center">Student Activity Center</h1>
                </div>
                <Link href='/auth/login'> <Button variant="link" className="text-white"> Login </Button> </Link>
            </div>


            {/* Scrollable Step Content */}
            <div className="flex-1 overflow-y-auto">
                <div className="w-full max-w-7xl mx-auto px-0 py-1">
                    <CurrentStepComponent
                        formData={formData}
                        updateFormData={updateFormData}
                        onValidationChange={undefined}
                    />
                </div>
            </div>

            {/* Fixed Navigation Footer */}
            <div className="flex-shrink-0">
                <div className="max-w-7xl mx-auto px-4 py-0">
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
                    <div className="text-center mt-4">
                        <p className="text-sm py-1 bg-red-800 text-white">© {new Date().getFullYear()} KLEF - Student Activity Center | Designed & Developed by ZeroOne CodeClub</p>
                    </div>
            </div>

            {/* Success Dialog */}
            <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-center text-green-600 text-xl">
                            🎉 Registration Successful!
                        </DialogTitle>
                        <DialogDescription className="text-center text-gray-600">
                            Welcome to KL University SAC Activities
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="text-center">
                            <p className="text-sm text-gray-700 mb-2">
                                Your registration has been completed successfully. You can now access your dashboard.
                            </p>
                        </div>

                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <h4 className="text-sm font-semibold text-blue-800 mb-2">Your Login Credentials:</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Username:</span>
                                    <span className="font-mono font-medium text-blue-700">{formData.username}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Password Pattern:</span>
                                    <span className="font-mono font-medium text-blue-700">{generatedPassword}</span>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                Password = Username + Last 4 digits of phone number
                            </p>
                        </div>

                        <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                            <p className="text-xs text-yellow-800">
                                📧 Check your email for confirmation and additional details about your club activities.
                            </p>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <Button
                                onClick={() => router.push("/auth/login")}
                                className="flex-1 bg-black hover:bg-gray-900"
                            >
                                Login to Dashboard
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
