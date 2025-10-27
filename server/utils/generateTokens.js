import jwt from "jsonwebtoken";
import userRefreshTokenModel from "../models/UserRefreshToken.js";
const generateTokens = async (user) => {
  try {
    const payload = {_id: user._id, userId: user._id, roles: user.roles};
    // Generate access token with expiration time 
    const accessTokenExp = Math.floor(Date.now() / 1000) + (15 * 60); // Set expiration to 15 minutes from now
    const accessToken = jwt.sign({...payload, exp: accessTokenExp},
      process.env.JWT_ACCESS_TOKEN_SECRECT_KEY || process.env.JWT_SECRET || 'your-super-secret-jwt-key-for-document-management-system-2024',
    );

    // Generate refresh token with expiration time
    const refreshTokenExp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 5; // Set expiration to 5 days from now 
    const refreshToken = jwt.sign({...payload, exp: refreshTokenExp}, 
      process.env.JWT_REFRESH_TOKEN_SECRECT_KEY || process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-for-document-management-system-2024',
    );

    // const userRefreshToken = await userRefreshTokenModel.findOne({userId: user._id}); 
    // if(userRefreshToken) await userRefreshToken.remove(); 

    const userRefreshToken = await userRefreshTokenModel.findOneAndDelete({userId: user._id});

    // Save New Refresh Token
    await new userRefreshTokenModel({userId: user._id, token: refreshToken}).save();
    // const newRefreshToken = new userRefreshTokenModel({userId: user._id, token: refreshToken});
    // await newRefreshToken.save();

    return Promise.resolve({accessToken, refreshToken, accessTokenExp, refreshTokenExp});
  } catch (error) {
    return Promise.reject(error);
  }
}

export default generateTokens;