import Cookies from 'js-cookie';

export const getAccessToken = () => {
  return Cookies.get('accessToken');
};

export const getRefreshToken = () => {
    return Cookies.get('refreshToken');
};

export const setAccessToken = (accessToken: string) => {
    Cookies.set('accessToken', accessToken, { expires: 1 });
}

export const setRefreshToken = (refreshToken: string) => {
    Cookies.set('refreshToken', refreshToken, { expires: 30 });
};

export const clearTokens = () => {
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
};