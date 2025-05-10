import { jwtDecode } from 'jwt-decode';  // Note: named import instead of default import

export const getTokenData = (token) => {
    try {
        return jwtDecode(token);
    } catch (error) {
        console.error("Error decoding token:", error);
        return null;
    }
};

export const getUserId = (token) => {
    const decoded = getTokenData(token);
    return (
        decoded?.["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] ||
        decoded?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/nameidentifier"] ||
        decoded?.sub || // some JWTs use "sub" for ID
        decoded?.userId
    );
};

export const getUserRole = (token) => {
    const decoded = getTokenData(token);
    return (
        decoded?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
        decoded?.["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role"] ||
        decoded?.role
    );
};

export const getUserEmail = (token) => {
    const decoded = getTokenData(token);
    return (
        decoded?.["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] ||
        decoded?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/emailaddress"] ||
        decoded?.email
    );
};

export const getUserFullName = (token) => {
    const decoded = getTokenData(token);
    return (
        decoded?.["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] ||
        decoded?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/name"] ||
        decoded?.name
    );
};