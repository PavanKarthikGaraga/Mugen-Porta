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
            // setLoading(true);
            const response=await fetch("/api/auth/login",{
                method:"POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            })
            if(response.ok) 
            {
                const data = await response.json();
                toast.success("Login Successful");
                router.push("/dashboard/admin");
            }else if(response.status===404) { 
                toast.error("User Not Found");
            }else if(response.status===401) {
                toast.error("Invalid Credentials");
            }
    }

    return(
        <div className="w-full h-screen flex flex-col  justify-center items-center">
            <h1 className="text-3xl font-bold mb-4">Welcome to SAC SIL Portal</h1>
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
                <button className="bg-gray-200 text-center w-40 h-12 p-3 border-r cursor-pointer"
                 style={{userSelect: "none", userDrag: "none"}}
                 onCopy={(e) => {e.preventDefault(); }}
                 onSelect={(e) => {e.preventDefault(); }}
                 onClick={() => setCaptcha(generateCaptcha())}
                 type="button"
                 >
                    {captcha.split("").map((char, index) => (
                        <span key={index} className="text-base font-light pr-3">
                            {char}
                        </span>
                    ))}
                </button>
                <input 
                    type="text" 
                    placeholder="Enter Captcha"
                    className="w-40 h-12 px-4  border-none rounded outline-none"
                    value={captchaInput}
                    onChange={(e) => setCaptchaInput(e.target.value)}
                    onPaste={(e) => {e.preventDefault();}}
                />
            </div>
            <button className="w-80 h-12 bg-black text-white rounded hover:bg-gray-900 cursor-pointer transition-colors"
                onClick={handleLogin}
                disabled={loading}
            >
                Login
            </button>
            <Link className="w-80 underline" href="/forget-password">Forget Password?</Link>
        </div>  
    );
}