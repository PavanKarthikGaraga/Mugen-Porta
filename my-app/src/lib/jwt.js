import { SignJWT, jwtVerify } from "jose";

const TCK = process.env.TCK;

function getKey() {
    if (!TCK) throw new Error("TCK environment variable is not defined");
    return new TextEncoder().encode(TCK);
}

export const generateToken = async (payload) => {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime('7d')
        .sign(getKey());
};

export const verifyToken = async (token) => {
    try {
        const { payload } = await jwtVerify(token, getKey());
        return payload;
    } catch (error) {
        console.error("Token verification failed:", error);
        return null;
    }
};