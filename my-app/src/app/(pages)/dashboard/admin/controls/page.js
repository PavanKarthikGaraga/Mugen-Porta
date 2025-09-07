"use client"
import { useState, useEffect } from "react";
import { FiToggleLeft, FiToggleRight } from "react-icons/fi";
import { handleApiError, handleApiSuccess } from "@/lib/apiErrorHandler";

export default function ControlsPage() {
    const [registrationsEnabled, setRegistrationsEnabled] = useState(true);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchControls();
    }, []);

    const fetchControls = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/dashboard/admin/controls');

            if (await handleApiError(response)) {
                return;
            }

            if (response.ok) {
                const data = await response.json();
                setRegistrationsEnabled(data.registrationsEnabled);
            }
        } catch (error) {
            console.error('Error fetching controls:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleRegistration = async () => {
        try {
            setSaving(true);
            const newValue = !registrationsEnabled;

            const response = await fetch('/api/dashboard/admin/controls', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    registrationsEnabled: newValue
                }),
            });

            if (await handleApiError(response)) {
                return;
            }

            if (response.ok) {
                handleApiSuccess('Registration control updated successfully');
                setRegistrationsEnabled(newValue);
            }
        } catch (error) {
            console.error('Error updating control:', error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-md mx-auto">
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Registration Control</h1>
                    <p className="text-gray-600 mt-2">Enable or disable student registrations</p>
                </div>

                {loading ? (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-800 mx-auto"></div>
                        <p className="mt-2 text-gray-600">Loading...</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Status */}
                        <div className="text-center">
                            <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                                registrationsEnabled
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                            }`}>
                                <div className={`w-2 h-2 rounded-full mr-2 ${
                                    registrationsEnabled ? 'bg-green-500' : 'bg-red-500'
                                }`}></div>
                                Registrations {registrationsEnabled ? 'Enabled' : 'Disabled'}
                            </div>
                        </div>

                        {/* Toggle Button */}
                        <div className="flex justify-center">
                            <button
                                onClick={toggleRegistration}
                                disabled={saving}
                                className={`flex items-center space-x-3 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                                    registrationsEnabled
                                        ? 'bg-red-500 hover:bg-red-600 text-white'
                                        : 'bg-green-500 hover:bg-green-600 text-white'
                                } disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl`}
                            >
                                {saving ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        <span>Saving...</span>
                                    </>
                                ) : (
                                    <>
                                        {registrationsEnabled ? (
                                            <FiToggleRight className="h-5 w-5" />
                                        ) : (
                                            <FiToggleLeft className="h-5 w-5" />
                                        )}
                                        <span>
                                            {registrationsEnabled ? 'Disable Registrations' : 'Enable Registrations'}
                                        </span>
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Info */}
                        <div className="text-center text-sm text-gray-600">
                            <p>When disabled, users will see a &quot;Registrations Closed&quot; message</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
