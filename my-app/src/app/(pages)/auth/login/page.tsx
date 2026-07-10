"use client"
import { useState,useEffect } from "react";
import { LuEyeClosed,LuEye } from "react-icons/lu";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";


export default function Login() {

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [captcha, setCaptcha] = useState("");
    const [captchaInput, setCaptchaInput] = useState("");
    const [loading,setLoading] = useState(false);
    const [redirecting, setRedirecting] = useState(false);

    const router=useRouter();

    function generateCaptcha(length = 6) {
        const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
        let captcha = "";
        for (let i = 0; i < length; i++) {
            captcha += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return captcha;
    }
    
    useEffect(() => {
        setCaptcha(generateCaptcha());
    }, []);

        const handleLogin  = async () => {
            if(captcha!=captchaInput){
                setCaptchaInput("");
                toast.error("Invalid Captcha");
                return;
            }
            if(!username || username.length>10) {

                toast.error("Enter Valid Username");
                return;
            }
            if(!password ) {
                toast.error("Enter Valid Password");
                return;
            }
            
            setLoading(true);
            try {
                const response=await fetch("/api/auth/login",{
                    method:"POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, password })
                })
                
                if(response.ok)
                {
                    const userData = await response.json();
                    console.log("Login response data:", userData); // Debug log
                    toast.success("Login Successful");
                    setRedirecting(true);

                    // Redirect based on user role
                    if (userData.user && userData.user.role){
                        const role = userData.user.role.toLowerCase();
                        console.log("User role:", role); // Debug log

                        // Use setTimeout to ensure redirect happens after state updates
                        setTimeout(() => {
                            if (role === 'admin'){
                                console.log("Redirecting to admin dashboard");
                                router.push("/dashboard/admin");
                            } else if (role === 'lead'){
                                console.log("Redirecting to lead dashboard");
                                router.push("/dashboard/lead");
                            } else if (role === 'faculty'){
                                console.log("Redirecting to faculty dashboard");
                                router.push("/dashboard/faculty");
                            } else if (role === 'student'){
                                console.log("Redirecting to student dashboard");
                                router.push("/dashboard/student");
                            } else {
                                console.log("Unknown role, defaulting to student:", role);
                                router.push("/dashboard/student");
                            }
                        }, 100);
                    } else {
                        console.log("No role found in userData, defaulting to student");
                        setTimeout(() => {
                            router.push("/dashboard/student");
                        }, 100);
                    }
                }else if(response.status===404) { 
                    toast.error("User Not Found");
                }else if(response.status===401) {
                    toast.error("Invalid Credentials");
                }
            } catch (error) {
                console.error("Login error:", error);
                toast.error("Login failed. Please try again.");
            } finally {
                setLoading(false);
            }
    }

    return(
        <>
            {redirecting ? 
                (<div className="w-full h-screen flex flex-col justify-center items-center">
                       <Spinner className="size-20 [animation-duration:2s]" />
                        {/* <p className="text-gray-700">Redirecting to dashboard...</p> */}
                    </div>):
                (<div className="w-full h-screen flex flex-col justify-center items-center p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl">Welcome to SAC Activities Portal</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                type="text"
                                placeholder="Enter your username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                maxLength={10}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="pr-10"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                                >
                                    {showPassword ? <LuEye size={16} /> : <LuEyeClosed size={16} />}
                                </Button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="captcha">Captcha</Label>
                            <div className="flex border rounded-md overflow-hidden">
                                <button
                                    type="button"
                                    onClick={() => setCaptcha(generateCaptcha())}
                                    className="bg-gray-100 px-4 font-mono text-lg select-none hover:bg-gray-200 transition-colors"
                                    style={{
                                        userSelect: "none",
                                        WebkitUserSelect: "none",
                                        MozUserSelect: "none",
                                        msUserSelect: "none"
                                    }}
                                >
                                    {captcha.split("").map((char, index) => (
                                        <span key={`captcha-${char}-${index}`} className="mr-1">
                                            {char}
                                        </span>
                                    ))}
                                </button>
                                <Input
                                    id="captcha"
                                    type="text"
                                    placeholder="Enter captcha"
                                    value={captchaInput}
                                    onChange={(e) => setCaptchaInput(e.target.value)}
                                    onPaste={(e) => e.preventDefault()}
                                    className="border-0 h-10 py-2 rounded-none focus-visible:ring-0"
                                />
                            </div>
                        </div>

                        <Button
                            onClick={handleLogin}
                            disabled={loading || redirecting}
                            className="w-full bg-black hover:bg-gray-900"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Logging in...
                                </>
                            ) : (
                                "Login"
                            )}
                        </Button>

                        <div className="text-center space-y-2">
                            <Link
                                href="/auth/forget-password"
                                className="text-sm text-blue-600 hover:text-blue-800 underline"
                            >
                                Forgot Password?
                            </Link>
                            <div className="text-sm text-gray-600">
                                Don't have an account?{" "}
                                <Link
                                    href="/auth/register"
                                    className="text-blue-600 hover:text-blue-800 underline font-medium"
                                >
                                    Register here
                                </Link>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>)}
        </>
    );
}