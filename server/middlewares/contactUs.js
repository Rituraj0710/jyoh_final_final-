// import passport from "passport";

// const constactUsMiddleware = async (req, res, next) => {
//   try {
//     // Allow unauthenticated users
//   if (!req.isAuthenticated()) {
//     req.user = null; // Ensure no userId is passed
//   }
//   next();
//   } catch (error) {
//     console.log("Error adding access token to header.", error.message);
//     // Handle the error, such as returning an error response or redirecting to the login page
//     res.status(400).json({error: 'Failed', message: 'Guest User'});
//   }
// }

// export default constactUsMiddleware;


import passport from "passport";

const optionalAuthMiddleware = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user) => {
    if (err) {
      return res.status(401).json({ status: "failed", message: "Authentication error" });
    }
    req.user = user || null; // Attach user if authenticated, otherwise `null`
    next();
  })(req, res, next);
};

export default optionalAuthMiddleware;



// import passport from "passport";

// const contactUsMiddleware = (req, res, next) => {
//   passport.authenticate("jwt", { session: false }, (err, user) => {
//     if (err) {
//       return res.status(500).json({ error: "Unauthorized", message: "Error during authentication" });
//     }

//     if (user) {
//       req.user = user; // Attach the authenticated user
//     } else {
//       req.user = null; // Set req.user to null for guest users
//     }
//     next();
//   })(req, res, next);
// };

// export default contactUsMiddleware;

