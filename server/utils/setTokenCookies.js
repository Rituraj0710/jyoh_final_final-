const setTokenCookies = (res, accessToken, refreshToken, newAccessTokenExp, newRefreshTokenExp, role) =>{
  console.log("role", role);
  const accessTokenMaxAge = (newAccessTokenExp - Math.floor(Date.now() / 1000)) * 1000;
  const refreshTokenmaxAge = (newRefreshTokenExp - Math.floor(Date.now() / 1000)) * 1000;
// const accessTokenMaxAge = (newAccessTokenExp - Math.floor(Date.now() / 1000)) * 1000;
// const refreshTokenmaxAge = (newRefreshTokenExp - Math.floor(Date.now() / 1000)) * 1000;

  const isProd = process.env.NODE_ENV === 'production';

  // Set Cookie for Access Token
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: isProd,
    maxAge: accessTokenMaxAge,
    sameSite: isProd ? 'none' : 'lax',
  })

  // Set Cookie for Refresh Token
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProd,
    maxAge: refreshTokenmaxAge,
    sameSite: isProd ? 'none' : 'lax',
  })

  // Set Cookie for is_auth
  res.cookie('is_auth', true, {
    httpOnly: false,
    secure: isProd,
    maxAge: refreshTokenmaxAge,
    sameSite: isProd ? 'none' : 'lax',
  })

  // Set Cookie for role
  res.cookie('role', role, {
    httpOnly: false,
    secure: isProd,
    maxAge: refreshTokenmaxAge,
    sameSite: isProd ? 'none' : 'lax',
  })
}

export default setTokenCookies;