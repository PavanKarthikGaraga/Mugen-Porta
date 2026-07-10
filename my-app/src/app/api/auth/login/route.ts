import pool from "@/lib/db";
import {generateToken} from "@/lib/jwt";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

export async function POST(req){
    let db;
    try{
        const {username,password} = await req.json();
        db=await pool.getConnection();

        const [existingUser]=await db.query('select * from users where username=?',[username]);

        if(!existingUser || existingUser.length === 0){
            return new Response(JSON.stringify({error:"User not found"}), {status:404, headers: {"Content-Type": "application/json"}});
        }

        const  user=existingUser[0];

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if(!isPasswordValid){
            return new Response(JSON.stringify({error:"Invalid password"}), {status:401, headers: {"Content-Type": "application/json"}});
        }

        const tck=await generateToken({username:user.username,name:user.name,role:user.role});
        
        const cookiesStore = await cookies(); 

        cookiesStore.set("tck", tck, { 
            httpOnly : true,
            samesite:'lax',
            maxage:45*60
        });

        return new Response(JSON.stringify({
            ok: true,
            message: "User successfully Logged In",
            user: {
                username: user.username,
                name: user.name,
                role: user.role
            },
        }), {status:200, headers: {"Content-Type": "application/json"}});
    } catch (error) {
        console.error("Login error:", error);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500, headers: {"Content-Type": "application/json"} });
    } finally{
        if(db)
            await db.release();
    }
}