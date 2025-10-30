"use client"
import { useState, useEffect } from "react";
import { FiToggleLeft, FiToggleRight, FiUser } from "react-icons/fi";
import { handleApiError, handleApiSuccess } from "@/lib/apiErrorHandler";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function ControlsPage() {
    const [registrationsEnabled, setRegistrationsEnabled] = useState(true);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [proxyUsername, setProxyUsername] = useState('');
    const [proxyLoading, setProxyLoading] = useState(false);

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

    const handleProxyLogin = async () => {
        if (!proxyUsername.trim()) {
            toast.error('Please enter a username');
            return;
        }

        setProxyLoading(true);
        try {
            const response = await fetch('/api/auth/proxy-login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ targetUsername: proxyUsername.trim() }),
            });

            if (response.ok) {
                const data = await response.json();
                toast.success(`Successfully logged in as ${data.user.name} (${data.user.username})`);
                // Redirect to appropriate dashboard based on user role
                if (data.user.role === 'student') {
                    window.location.href = '/dashboard/student';
                } else if (data.user.role === 'lead') {
                    window.location.href = '/dashboard/lead';
                } else if (data.user.role === 'faculty') {
                    window.location.href = '/dashboard/faculty';
                }
            } else {
                const error = await response.json();
                toast.error(`Proxy login failed: ${error.error}`);
            }
        } catch (error) {
            console.error('Proxy login error:', error);
            toast.error('Proxy login failed. Please try again.');
        } finally {
            setProxyLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto space-y-6">
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

            {/* Proxy Login Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-center">
                        <FiUser className="mr-2" />
                        Proxy Login
                    </CardTitle>
                    <p className="text-center text-gray-600 mt-2">Access user dashboards as admin</p>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="proxyUsername" className="text-sm font-medium">
                                Username
                            </Label>
                            <Input
                                id="proxyUsername"
                                type="text"
                                placeholder="Enter username to login as"
                                value={proxyUsername}
                                onChange={(e) => setProxyUsername(e.target.value)}
                                className="mt-1"
                            />
                        </div>

                        <Button
                            onClick={handleProxyLogin}
                            disabled={proxyLoading}
                            className="w-full bg-blue-600 hover:bg-blue-700"
                        >
                            {proxyLoading ? 'Logging in...' : 'Proxy Login'}
                        </Button>

                        <div className="text-center text-xs text-gray-600">
                            <p>Access student, lead, or faculty dashboards</p>
                            <p>Use logout to return to admin session</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
