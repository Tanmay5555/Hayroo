import jwt from 'jsonwebtoken';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'apexbazaar_jwt_access_secret_2026_x89';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'apexbazaar_jwt_refresh_secret_2026_x89';

export const generateTokens = (user) => {
  const payload = {
    id: user._id || user.id,
    fullName: user.fullName || user.name || 'Shopper',
    phoneNumber: user.phoneNumber || user.phone || '',
    email: user.email || '',
    role: user.role || 'CUSTOMER',
    sellerProfileId: user.sellerProfileId || null,
  };

  const accessToken = jwt.sign(payload, ACCESS_SECRET, { expiresIn: '1d' });
  const refreshToken = jwt.sign({ id: payload.id }, REFRESH_SECRET, { expiresIn: '7d' });

  return { accessToken, refreshToken, user: payload };
};

export const verifyAccessToken = (token) => {
  return jwt.verify(token, ACCESS_SECRET);
};

export const verifyRefreshToken = (token) => {
  return jwt.verify(token, REFRESH_SECRET);
};

export const setAuthCookies = (res, accessToken, refreshToken) => {
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000,
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const clearAuthCookies = (res) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
};
