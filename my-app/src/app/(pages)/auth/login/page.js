"use client"
import { useState,useEffect } from "react";
import { LuEyeClosed,LuEye } from "react-icons/lu";
import {toast } from "react-hot-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";


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
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
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
            {redirecting? (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="p-8 shadow-lg flex flex-col items-center">
                        <svg className="animate-spin h-8 w-8 text-black mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="text-gray-700">Redirecting to dashboard...</p>
                    </div>
                </div>
            ):(
            <div className="w-full h-screen flex flex-col  justify-center items-center">
            <h1 className="text-3xl font-bold mb-4">Welcome to SAC Activities Portal</h1>
            <div className="input-container">
                <div className="flex w-full h-full flex-col items-center"> 
                    <div className="input-container-in">
                        <input type="text" 
                        placeholder="Username"
                        className="w-80 h-12 mb-4 px-4 border border-gray rounded"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        maxLength={10}
                        />
                    </div>
                    <div className="input-container-in relative">
                        <input type={showPassword ? "text" : "password"} 
                        placeholder="password"
                        className="w-80 h-12 mb-4 px-4 border border-gray rounded"
                        value={password}
                        required
                        onChange={(e) => setPassword(e.target.value)}
                        />
                        {showPassword ? (
                            <LuEye
                                className="absolute right-4 top-3 cursor-pointer"
                                onClick={() => setShowPassword(!showPassword)}
                                size={20}
                            />
                        ) : (
                            <LuEyeClosed
                                className="absolute right-4 top-3 cursor-pointer"
                                onClick={() => setShowPassword(!showPassword)}
                                size={20}
                            />
                        )}
                    </div>
                </div>
            </div>
            <div className="captcha flex gap-0 border-1 mb-4">
                <div className="bg-gray-200 text-center w-40 h-12 p-3 border-r cursor-pointer select-none"
                 style={{
                    userSelect: "none", 
                    userDrag: "none",
                    fontFamily: "JMH Typewriter, monospace",
                    WebkitUserSelect: "none",
                    MozUserSelect: "none",
                    msUserSelect: "none"
                 }}
                 onCopy={(e) => {e.preventDefault(); }}
                 onSelect={(e) => {e.preventDefault(); }}
                 onMouseDown={(e) => {e.preventDefault(); }}
                 onClick={() => setCaptcha(generateCaptcha())}
                 type="button"
                 >
                    {captcha.split("").map((char, index) => (
                        <span key={`captcha-${char}-${index}`} className="text-base font-light pr-3 select-none" style={{userSelect: "none"}}>
                            {char}
                        </span>
                    ))}
                </div>
                <input 
                    type="text" 
                    placeholder="Enter Captcha"
                    className="w-40 h-12 px-4  border-none rounded outline-none"
                    value={captchaInput}
                    onChange={(e) => setCaptchaInput(e.target.value)}
                    onPaste={(e) => {e.preventDefault();}}
                />
            </div>
            <button className="w-80 h-12 bg-black text-white rounded hover:bg-gray-900 cursor-pointer transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleLogin}
                disabled={loading || redirecting}
            >
                {loading ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Logging in...
                    </>
                ) : (
                    "Login"
                )}
            </button>
            <Link className="w-80 underline" href="/auth/forget-password">Forget Password?</Link>
        </div>)}  
        </>
    );
}