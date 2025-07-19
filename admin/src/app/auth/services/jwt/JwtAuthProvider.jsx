import { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import jwtDecode from 'jwt-decode';
import config from './jwtAuthConfig';
import { changeFuseTheme } from '@fuse/core/FuseSettings/fuseSettingsSlice';
import { useAppDispatch } from 'app/store/hooks';

const defaultAuthContext = {
	isAuthenticated: false,
	isLoading: false,
	user: null,
	updateUser: null,
	signIn: null,
	signUp: null,
	signOut: null,
	refreshToken: null,
	setIsLoading: () => {},
	authStatus: 'configuring'
};
export const JwtAuthContext = createContext(defaultAuthContext);

function JwtAuthProvider(props) {

	const dispatch = useAppDispatch();

	async function setTheme(user){

	}



	const [user, setUser] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [authStatus, setAuthStatus] = useState('configuring');
	const { children } = props;

 
	/**
	 * Handle sign-in success
	 */
	const handleSignInSuccess = useCallback((userData, accessToken) => {
		setSession(accessToken);
		setIsAuthenticated(true);
		setUser(userData);
		setTheme(userData)

		/*let _theme={
				
			"id": "Emarald Gold",
			"section": {
				"main": {
					"palette": {
						"mode": "light",
						"primary": {
							"main": "#00695C",
							"light": "#439889",
							"dark": "#003D33",
							"contrastText": "rgb(255,255,255)"
						},
						"secondary": {
							"main": "#FFD740",
							"light": "#FFFF74",
							"dark": "#C8A600",
							"contrastText": "rgb(17, 24, 39)"
						},
						"background": {
							"default": "#dcf2f2",
							"paper": "#f2fdfa"
						},
						"text": {
							"primary": "rgb(17, 24, 39)",
							"secondary": "rgb(107, 114, 128)",
							"disabled": "rgb(149, 156, 169)"
						},
						"divider": "#b3c4c3"
					}
				},
				"navbar": {
					"palette": {
						"mode": "dark",
						"primary": {
							"main": "#00695C",
							"light": "#439889",
							"dark": "#003D33",
							"contrastText": "rgb(255,255,255)"
						},
						"secondary": {
							"main": "#FFD740",
							"light": "#FFFF74",
							"dark": "#C8A600",
							"contrastText": "rgb(17, 24, 39)"
						},
						"background": {
							"default": "#004D40",
							"paper": "#00544a"
						},
						"text": {
							"primary": "rgb(255,255,255)",
							"secondary": "rgb(148, 163, 184)",
							"disabled": "rgb(156, 163, 175)"
						},
						"divider": "#2d6360"
					}
				},
				"toolbar": {
					"palette": {
						"mode": "light",
						"primary": {
							"main": "#00695C",
							"light": "#439889",
							"dark": "#003D33",
							"contrastText": "rgb(255,255,255)"
						},
						"secondary": {
							"main": "#FFD740",
							"light": "#FFFF74",
							"dark": "#C8A600",
							"contrastText": "rgb(17, 24, 39)"
						},
						"background": {
							"default": "#dcf2f2",
							"paper": "#f2fdfa"
						},
						"text": {
							"primary": "rgb(17, 24, 39)",
							"secondary": "rgb(107, 114, 128)",
							"disabled": "rgb(149, 156, 169)"
						},
						"divider": "#b3c4c3"
					}
				},
				"footer": {
					"palette": {
						"mode": "dark",
						"primary": {
							"main": "#00695C",
							"light": "#439889",
							"dark": "#003D33",
							"contrastText": "rgb(255,255,255)"
						},
						"secondary": {
							"main": "#FFD740",
							"light": "#FFFF74",
							"dark": "#C8A600",
							"contrastText": "rgb(17, 24, 39)"
						},
						"background": {
							"default": "#004D40",
							"paper": "#00544a"
						},
						"text": {
							"primary": "rgb(255,255,255)",
							"secondary": "rgb(148, 163, 184)",
							"disabled": "rgb(156, 163, 175)"
						},
						"divider": "#2d6360"
					}
				}
			}
		
		}
		if(userData?.role!='admin'){ 
		  dispatch(changeFuseTheme(_theme?.section)).then(() => { 
			
		});
		}*/




	}, []);
	/**
	 * Handle sign-up success
	 */
	const handleSignUpSuccess = useCallback((userData, accessToken) => {
		setSession(accessToken);
		setIsAuthenticated(true);
		setUser(userData);
	}, []);
	/**
	 * Handle sign-in failure
	 */
	const handleSignInFailure = useCallback((error) => {
		resetSession();
		setIsAuthenticated(false);
		setUser(null);
		handleError(error);
	}, []);
	/**
	 * Handle sign-up failure
	 */
	const handleSignUpFailure = useCallback((error) => {
		resetSession();
		setIsAuthenticated(false);
		setUser(null);
		handleError(error);
	}, []);
	/**
	 * Handle error
	 */
	const handleError = useCallback((error) => {
		resetSession();
		setIsAuthenticated(false);
		setUser(null);
	}, []);
	// Set session
	const setSession = useCallback((accessToken) => {
		if (accessToken) {
			localStorage.setItem(config.tokenStorageKey, accessToken);
			axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
		}
	}, []);
	// Reset session
	const resetSession = useCallback(() => {
		localStorage.removeItem(config.tokenStorageKey);
		delete axios.defaults.headers.common.Authorization;
	}, []);
	// Get access token from local storage
	const getAccessToken = useCallback(() => {
		return localStorage.getItem(config.tokenStorageKey);
	}, []);
	// Check if the access token is valid
	const isTokenValid = useCallback((accessToken) => {
		if (accessToken) {
			try {
				const decoded = jwtDecode(accessToken);
				const currentTime = Date.now() / 1000;
				return decoded.exp > currentTime;
			} catch (error) {
				return false;
			}
		}

		return false;
	}, []);
	// Check if the access token exist and is valid on mount
	useEffect(() => {
		const attemptAutoLogin = async () => {
			
			const accessToken = getAccessToken();
			if (isTokenValid(accessToken)) {
				try {
					setIsLoading(true);
					const response = await axios.get(config.getUserUrl, {
						headers: { Authorization: `Bearer ${accessToken}` }
					});
					const userData = response?.data;
					
					handleSignInSuccess(userData, accessToken);
					return true;
				} catch (error) {
					const axiosError = error;
					handleSignInFailure(axiosError);
					return false;
				}
			} else {
				resetSession();
				return false;
			}
		};

		if (!isAuthenticated) {
			attemptAutoLogin().then((signedIn) => {
				setIsLoading(false);
				setAuthStatus(signedIn ? 'authenticated' : 'unauthenticated');
			});
		}
	}, [
		isTokenValid,
		setSession,
		handleSignInSuccess,
		handleSignInFailure,
		handleError,
		getAccessToken,
		isAuthenticated
	]);
	const handleRequest = async (url, data, handleSuccess, handleFailure) => {
		try {
			const response = await axios.post(url, data);
			const userData = response?.data?.user;
			const accessToken = response?.data?.access_token;
			handleSuccess(userData, accessToken);
			return userData;
		} catch (error) {
			//alert('error')
			const axiosError = error;
			handleFailure(axiosError);
			return axiosError;
		}
	};
	// Refactor signIn function
	const signIn = (credentials) => {
		return handleRequest(config.signInUrl, credentials, handleSignInSuccess, handleSignInFailure);
	};
	// Refactor signUp function
	const signUp = useCallback((data) => {
		return handleRequest(config.signUpUrl, data, handleSignUpSuccess, handleSignUpFailure);
	}, []);
	/**
	 * Sign out
	 */
	const signOut = useCallback(() => {
		resetSession();
		setIsAuthenticated(false);
		setUser(null);
	}, []);
	/**
	 * Update user
	 */
	const updateUser = useCallback(async (userData) => {
		try {
			const response = await axios.put(config.updateUserUrl, userData);
			const updatedUserData = response?.data;
			setUser(updatedUserData);
			return null;
		} catch (error) {
			const axiosError = error;
			handleError(axiosError);
			return axiosError;
		}
	}, []);
	/**
	 * Refresh access token
	 */
	const refreshToken = async () => {
		setIsLoading(true);
		try {
			const response = await axios.post(config.tokenRefreshUrl);
			const accessToken = response?.headers?.['New-Access-Token'];

			if (accessToken) {
				setSession(accessToken);
				return accessToken;
			}

			return null;
		} catch (error) {
			const axiosError = error;
			handleError(axiosError);
			return axiosError;
		}
	};
	/**
	 * if a successful response contains a new Authorization header,
	 * updates the access token from it.
	 *
	 */
	useEffect(() => {
		if (config.updateTokenFromHeader && isAuthenticated) {
			axios.interceptors.response.use(
				(response) => {
					const newAccessToken = response?.headers?.['New-Access-Token'];

					if (newAccessToken) {
						setSession(newAccessToken);
					}

					return response;
				},
				(error) => {
					const axiosError = error;

					if (axiosError?.response?.status === 401) {
						signOut();
						// eslint-disable-next-line no-console
						console.warn('Unauthorized request. User was signed out.');
					}

					return Promise.reject(axiosError);
				}
			);
		}
	}, [isAuthenticated]);
	useEffect(() => {
		if (user) {
			setAuthStatus('authenticated');
		} else {
			setAuthStatus('unauthenticated');
		}
	}, [user]);
	const authContextValue = useMemo(
		() => ({
			user,
			isAuthenticated,
			authStatus,
			isLoading,
			signIn,
			signUp,
			signOut,
			updateUser,
			refreshToken,
			setIsLoading
		}),
		[user, isAuthenticated, isLoading, signIn, signUp, signOut, updateUser, refreshToken, setIsLoading]
	);
	return <JwtAuthContext.Provider value={authContextValue}>{children}</JwtAuthContext.Provider>;
}

export default JwtAuthProvider;
