import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getApiBaseUrl } from "../utils/env.js";

// OTP Authentication API
export const otpAuthApi = createApi({
  reducerPath: "otpAuthApi",
  baseQuery: fetchBaseQuery({ 
    baseUrl: `${getApiBaseUrl()}/api/otp-auth/`,
    prepareHeaders: (headers) => {
      if (typeof window !== 'undefined'){
        const token = localStorage.getItem('access_token');
        if (token) headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    }
  }),
  endpoints: (builder) => ({
    // User Login (Normal User)
    userLogin: builder.mutation({
      query: (credentials) => ({
        url: 'user/login',
        method: 'POST',
        body: credentials
      })
    }),

    // Agent Login
    agentLogin: builder.mutation({
      query: (credentials) => ({
        url: 'agent/login',
        method: 'POST',
        body: credentials
      })
    }),

    // Verify OTP
    verifyOTP: builder.mutation({
      query: (otpData) => ({
        url: 'verify-otp',
        method: 'POST',
        body: otpData
      })
    }),

    // Logout
    logout: builder.mutation({
      query: () => ({
        url: 'logout',
        method: 'POST'
      })
    })
  })
});

export const {
  useUserLoginMutation,
  useAgentLoginMutation,
  useVerifyOTPMutation,
  useLogoutMutation
} = otpAuthApi;
