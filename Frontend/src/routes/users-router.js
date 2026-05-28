const apiPath = process.env.EXPO_PUBLIC_API_URL;

export default {
  getMePath: () => [apiPath, 'user', 'me'].join('/'),
  // loginPath: () => [apiPath, 'user', 'login'].join('/'),
  loginPath: () => [apiPath, 'token'].join('/'),
  registerPath: () => [apiPath, 'user', 'signup'].join('/'),
  updateUserPath: () => [apiPath, 'user', 'update'].join('/')
};