import jwt from 'jsonwebtoken';

const DEV_ACCESS_FALLBACK = 'hayroo_dev_jwt_access_secret_local_only';
const DEV_REFRESH_FALLBACK = 'hayroo_dev_jwt_refresh_secret_local_only';

const getAccessSecret = () => {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (process.env.NODE_ENV === 'production') {
    if (!secret || secret.includes('replace_in_prod') || secret.length < 16) {
      throw new Error('JWT_ACCESS_SECRET must be set to a strong secret in production');
    }
    return secret;
  }
  return secret || DEV_ACCESS_FALLBACK;
};

const getRefreshSecret = () => {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (process.env.NODE_ENV === 'production') {
    if (!secret || secret.includes('replace_in_prod') || secret.length < 16) {
      throw new Error('JWT_REFRESH_SECRET must be set to a strong secret in production');
    }
    return secret;
  }
  return secret || DEV_REFRESH_FALLBACK;
};

export const generateTokens = (user) => {
  const payload = {
    id: user._id || user.id,
    fullName: user.fullName || user.name || 'Shopper',
    phoneNumber: user.phoneNumber || user.phone || '',
    email: user.email || '',
    role: user.role || 'CUSTOMER',
    sellerProfileId: user.sellerProfileId || null,
  };

  const accessExpiry = process.env.JWT_ACCESS_EXPIRY ? Number(process.env.JWT_ACCESS_EXPIRY) || process.env.JWT_ACCESS_EXPIRY : '1d';
  const refreshExpiry = process.env.JWT_REFRESH_EXPIRY ? Number(process.env.JWT_REFRESH_EXPIRY) || process.env.JWT_REFRESH_EXPIRY : '7d';

  const accessToken = jwt.sign(payload, getAccessSecret(), { expiresIn: accessExpiry });
  const refreshToken = jwt.sign({ id: payload.id }, getRefreshSecret(), { expiresIn: refreshExpiry });

  return { accessToken, refreshToken, user: payload };
};

export const verifyAccessToken = (token) => {
  return jwt.verify(token, getAccessSecret());
};

export const verifyRefreshToken = (token) => {
  return jwt.verify(token, getRefreshSecret());
};

const getAuthCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
  };
};

export const setAuthCookies = (res, accessToken, refreshToken) => {
  const baseOptions = getAuthCookieOptions();
  res.cookie('accessToken', accessToken, {
    ...baseOptions,
    maxAge: 24 * 60 * 60 * 1000,
  });

  res.cookie('refreshToken', refreshToken, {
    ...baseOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const clearAuthCookies = (res) => {
  const baseOptions = getAuthCookieOptions();
  res.clearCookie('accessToken', baseOptions);
  res.clearCookie('refreshToken', baseOptions);
};
