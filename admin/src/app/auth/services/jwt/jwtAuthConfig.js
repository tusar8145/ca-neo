const jwtAuthConfig = {
	tokenStorageKey: 'jwt_access_token',
	signInUrl: import.meta.env.VITE_BASE_URL+'admin/login',
	signUpUrl: 'mock-api/auth/sign-up',
	tokenRefreshUrl: 'mock-api/auth/refresh',
	getUserUrl: import.meta.env.VITE_BASE_URL+'admin/refresh',
	updateUserUrl: 'mock-api/auth/user',
	updateTokenFromHeader: true
};
export default jwtAuthConfig;
