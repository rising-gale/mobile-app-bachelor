const apiPath = 'http://192.168.0.107:8080';

export default {
  getMePath: () => [apiPath, 'user', 'me'].join('/'),
  // loginPath: () => [apiPath, 'user', 'login'].join('/'),
  loginPath: () => [apiPath, 'token'].join('/'),
  registerPath: () => [apiPath, 'user', 'signup'].join('/'),
  updateUserPath: () => [apiPath, 'user', 'update'].join('/')
};