
// // OTP Authentication API
// export const otpAuthApi = createApi({
//   reducerPath: "otpAuthApi",
//   baseQuery: fetchBaseQuery({ 
//     baseUrl: `${getApiBaseUrl()}/api/otp-auth/`,
//     prepareHeaders: (headers) => {
//       if (typeof window !== 'undefined'){
//         const token = localStorage.getItem('access_token');
//         if (token) headers.set('authorization', `Bearer ${token}`);
//       }
//       return headers;
//     }
//   }),
//   endpoints: (builder) => ({
//     // User Login (Normal User)
//     userLogin: builder.mutation({
//       query: (credentials) => ({
//         url: 'user/login',
//         method: 'POST',
//         body: credentials
//       })
//     }),

//     // Agent Login
//     agentLogin: builder.mutation({
//       query: (credentials) => ({
//         url: 'agent/login',
//         method: 'POST',
//         body: credentials
//       })
//     }),

//     // Verify OTP
//     verifyOTP: builder.mutation({
//       query: (otpData) => ({
//         url: 'verify-otp',
//         method: 'POST',
//         body: otpData
//       })
//     }),

//     // Logout
//     logout: builder.mutation({
//       query: () => ({
//         url: 'logout',
//         method: 'POST'
//       })
//     })
//   })
// });

// export const {
//   useUserLoginMutation,
//   useAgentLoginMutation,
//   useVerifyOTPMutation,
//   useLogoutMutation
// } = otpAuthApi;

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getApiBaseUrl } from "../utils/env.js";

export const otpAuthApi = createApi({
  reducerPath: "otpAuthApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${getApiBaseUrl()}/api`,
    prepareHeaders: (headers) => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("access_token");
        if (token) headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),

  endpoints: (builder) => ({
    // ⭐ NEW — Create User (Signup)
    createUser: builder.mutation({
      query: (data) => ({
        url: "/user/signup",
        method: "POST",
        body: data,
      }),
    }),

    // ⭐ Login (Normal User)
    userLogin: builder.mutation({
      query: (credentials) => ({
        url: "/otp-auth/user/login",
        method: "POST",
        body: credentials,
      }),
    }),

    // ⭐ Login (Agent)
    agentLogin: builder.mutation({
      query: (credentials) => ({
        url: "/otp-auth/agent/login",
        method: "POST",
        body: credentials,
      }),
    }),

    // ⭐ Verify OTP
    verifyOTP: builder.mutation({
      query: (otpData) => ({
        url: "/otp-auth/verify-otp",
        method: "POST",
        body: otpData,
      }),
    }),

    // ⭐ Logout
    logout: builder.mutation({
      query: () => ({
        url: "/otp-auth/logout",
        method: "POST",
      }),
    }),
  }),
});

export const {
  useCreateUserMutation,
  useUserLoginMutation,
  useAgentLoginMutation,
  useVerifyOTPMutation,
  useLogoutMutation,
} = otpAuthApi;
