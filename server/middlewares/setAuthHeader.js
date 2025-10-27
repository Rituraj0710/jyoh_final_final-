import isTokenExpired from "../utils/isTokenExpired.js";

// This middleware will set Authrization Header
const setAuthHeader = async (req,res, next) => {
 try {
  const authHeader = req.headers['authorization'];
  if (authHeader) {
    return next();
  }
  const accessToken = req.cookies.accessToken;
  if (accessToken && !isTokenExpired(accessToken)){
    req.headers['authorization'] = `Bearer ${accessToken}`
  }
  next();
 } catch (error) {
  console.log("Error adding access token to header.", error.message);
 }
}

export default setAuthHeader;