import jwt from "jsonwebtoken";
import dotenv from "dotenv";

const verifyToken =(token:string):{id:string} | null =>{
    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "defaultSec") as { id: string };
        return decoded;
    }
    catch (error) {
        console.error("Token verification error:", error);
        return null;
    }

}
export default verifyToken