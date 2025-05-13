import { User } from "../src/models/user.model.js";
import jwt from "jsonwebtoken";

export const protectauthRoute = async (req, res, next) => {
    const token = req.header("Authorization").replace("Bearer ", "");

    if (!token) {
        return res.status(401).json({ message: "Unauthorized, access denied" });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user associated with the token
    const user = await User.findById(decoded.userID).select("-password");

    if (!user) {
        return res.status(401).json({ message: "Token is not valid" });
    }

    req.user = user;
    next();
}