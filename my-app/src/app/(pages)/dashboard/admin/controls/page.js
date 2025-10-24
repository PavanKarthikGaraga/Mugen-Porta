"use client"
import { useState, useEffect } from "react";
import { FiToggleLeft, FiToggleRight } from "react-icons/fi";
import { handleApiError, handleApiSuccess } from "@/lib/apiErrorHandler";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

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
            <Card>
                <CardHeader>
                    <CardTitle className="text-center">Registration Control</CardTitle>
                    <p className="text-center text-gray-600 mt-2">Enable or disable student registrations</p>
                </CardHeader>
                <CardContent>

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

                        {/* Toggle Switch */}
                        <div className="flex items-center justify-center space-x-3">
                            <Label htmlFor="registration-toggle" className="text-sm font-medium">
                                {registrationsEnabled ? 'Disable' : 'Enable'} Student Registrations
                            </Label>
                            <Switch
                                id="registration-toggle"
                                checked={registrationsEnabled}
                                onCheckedChange={toggleRegistration}
                                disabled={saving}
                            />
                        </div>

                        {saving && (
                            <div className="flex justify-center mt-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-800"></div>
                                <span className="ml-2 text-sm text-gray-600">Saving...</span>
                            </div>
                        )}

                        {/* Info */}
                        <div className="text-center text-sm text-gray-600">
                            <p>When disabled, users will see a &quot;Registrations Closed&quot; message</p>
                        </div>
                    </div>
                )}
                </CardContent>
            </Card>
        </div>
    );
}
