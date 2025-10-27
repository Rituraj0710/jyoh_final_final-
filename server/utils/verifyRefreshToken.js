import jwt from "jsonwebtoken";
import userRefreshTokenModel from "../models/UserRefreshToken.js";
const verifyRefreshToken = async (refreshToken) => {
  try {
    const privateKey = process.env.JWT_REFRESH_TOKEN_SECRECT_KEY;
    // Find the refresh token document
    const userRefreshToken = await userRefreshTokenModel.findOne({token: refreshToken});
    // If refresh token not found, reject with an error
    if(!userRefreshToken) {
      throw {error: true, message: "Invalid refresh token"};
    }
    // Verify the refresh token
    const tokenDetails = jwt.verify(refreshToken, privateKey);

    // If verification successful, resolve with token details
    return {
      tokenDetails,
      error: false,
      message: "Valid refresh token",
    }
  } catch (error) {
    return { error: true, message: error?.message || "Invalid refresh token" };
  }
}

export default verifyRefreshToken;