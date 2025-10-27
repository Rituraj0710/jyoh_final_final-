// This middleware will set Authorization Header and will refresh access token on expire
// If we use this middleware we won't have to explicitly make request to refresh-token api url

import isTokenExpired from "../utils/isTokenExpired.js";
import refreshAccessToken from "../utils/refreshAccessToken.js";
import setTokenCookies from "../utils/setTokenCookies.js";

const accessTokenAutoRefresh = async (req,res,next) => {
  try {
    const accessToken = req.cookies.accessToken;
      if (accessToken && !isTokenExpired(accessToken)){
        req.headers['authorization'] = `Bearer ${accessToken}`
      }

      if (!accessToken || isTokenExpired(accessToken)){
        // Attempt to get a new access token using the refresh token
        const refreshToken = req.cookies.refreshToken;
        if(!refreshToken){
          // If refresh token is also missing, throw an error
          throw new Error("Refresh token is missing");
        }

        // Access token is expired, make a refresh token request
        const {newAccessToken,newRefreshToken,newAccessTokenExp,newRefreshTokenExp} = await refreshAccessToken(req,res);
        // Set cookies
        setTokenCookies(res, newAccessToken,newRefreshToken,newAccessTokenExp,newRefreshTokenExp);

        // Add the access token to the authorization header
        req.headers['authorization'] = `Bearer ${newAccessToken}`
      }
      next();
  } catch (error) {
    console.log("Skipping auto-refresh:", error.message);
    // Do not block the request; let downstream handlers/auth decide
    return next();
  }
};
export default accessTokenAutoRefresh;


// import isTokenExpired from "../utils/isTokenExpired.js";
// import refreshAccessToken from "../utils/refreshAccessToken.js";
// import setTokenCookies from "../utils/setTokenCookies.js";

// const accessTokenAutoRefresh = async (req, res, next) => {
//   try {
//     const accessToken = req.cookies.accessToken;

//     if (accessToken || !isTokenExpired(accessToken)) {
//       req.headers["authorization"] = `Bearer ${accessToken}`;
//     } else if (accessToken && isTokenExpired(accessToken)) {
//       // Attempt to refresh the token if it's expired
//       const refreshToken = req.cookies.refreshToken;

//       if (!refreshToken) {
//         console.log("Refresh token is missing");
//       } else {
//         const {
//           newAccessToken,
//           newRefreshToken,
//           newAccessTokenExp,
//           newRefreshTokenExp,
//         } = await refreshAccessToken(req, res);

//         setTokenCookies(
//           res,
//           newAccessToken,
//           newRefreshToken,
//           newAccessTokenExp,
//           newRefreshTokenExp
//         );

//         req.headers["authorization"] = `Bearer ${newAccessToken}`;
//       }
//     }
//     // Continue to the next middleware, even if no token is set
//     next();
//   } catch (error) {
//     console.log("Error in accessTokenAutoRefresh middleware:", error.message);
//     next(); // Do not block guest users, just proceed to the next middleware
//   }
// };

// export default accessTokenAutoRefresh;
