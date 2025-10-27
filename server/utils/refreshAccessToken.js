import UserModel from "../models/User.js";
import userRefreshTokenModel from "../models/UserRefreshToken.js";
import generateTokens from "./generateTokens.js";
import verifyRefreshToken from "./verifyRefreshToken.js";

const refreshAccessToken = async (req, res) => {
  try {
    const oldRefreshToken = req.cookies.refreshToken;
    // Verify refresh token is valid or not
    const {tokenDetails, error} = await verifyRefreshToken(oldRefreshToken);
    // console.log("TOKENDETAILS", tokenDetails);
    if(error){
      return res.status(401).send({status: "failed", message:"Invalid refresh token"});
    }
    // Find User based on Refresh Token detail id 
    const user = await UserModel.findById(tokenDetails._id);
    // console.log("userdetailswithtoken", user);
    if(!user){
      return res.status(404).send({status: "failed", message: "User not found"});
    }
    const userRefreshToken = await userRefreshTokenModel.findOne({userId: tokenDetails._id})
    if(oldRefreshToken !== userRefreshToken.token || userRefreshToken.blacklisted){
      return res.status(401).send({status: "falied", message:"Unauthrized access"});
    }

    // Generate new access and refresh tokens
    const {accessToken, refreshToken, accessTokenExp, refreshTokenExp} = await generateTokens(user);
    return {
      newAccessToken: accessToken,
      newRefreshToken: refreshToken,
      newAccessTokenExp: accessTokenExp,
      newRefreshTokenExp: refreshTokenExp 

    }
  } catch (error) {
    console.error(error);
    res.status(500).send({status: 'failed', message: "Internal server error."});
  }
}

export default refreshAccessToken;