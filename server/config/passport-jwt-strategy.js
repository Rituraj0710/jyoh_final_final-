import UserModel from "../models/User.js";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import passport from "passport";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });


// Use fallback if environment variable is not set
const jwtSecret = process.env.JWT_ACCESS_TOKEN_SECRECT_KEY || process.env.JWT_SECRET || 'your-super-secret-jwt-key-for-document-management-system-2024';


var otps = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: jwtSecret
}

passport.use("userOrAgent",new JwtStrategy(otps, async function(jwt_payload, done){
  try {
    const user = await UserModel.findOne({_id:jwt_payload.userId}).select('-password')
    if(user){
      return done(null, user);
    }else {
      return done(null, false);
    }
  } catch (error) {
    return done(error, false);
  }
}));

passport.use("userOrStaff",new JwtStrategy(otps, async function(jwt_payload, done){
  try {
    const user = await UserModel.findOne({_id:jwt_payload.userId}).select('-password')
    if(user){
      return done(null, user);
    }else {
      return done(null, false);
    }
  } catch (error) {
    return done(error, false);
  }
}));