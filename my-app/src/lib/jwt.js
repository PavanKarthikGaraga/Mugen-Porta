import { SignJWT,jwtVerify } from "jose"; 

const TCK=process.env.TCK;

if(!TCK){
    throw new Error("TCK is not defined in environment variables");
}

const tck=new TextEncoder().encode(TCK);

export const generateToken= async(payload) => {
    return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime('30m')
    .sign(tck);
}

export const verifyToken = async(token) => {
    try {
        const { payload } = await jwtVerify(token, tck);
        return payload;
    } catch (error) {
        console.error("Token verification failed:", error);
        throw new Error("Invalid token");
    }
}
