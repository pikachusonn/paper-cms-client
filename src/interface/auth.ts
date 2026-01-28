export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginVariables {
    loginRequest: LoginRequest;
}

export interface LoginResponse {
    login: {
        accessToken: string;
        refreshToken: string;
        account: {
            email: string,
            id: string,
            role: string,
        }
    }
}