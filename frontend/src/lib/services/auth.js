import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getApiBaseUrl } from "../utils/env.js";

// Define a service using a base URL and expected endpoints
export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({ 
    baseUrl: `${getApiBaseUrl()}/api/auth/`,
    prepareHeaders: (headers) => {
      if (typeof window !== 'undefined'){
        const token = localStorage.getItem('access_token');
        if (token) headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
    fetchFn: async (input, init) => {
      console.log('RTK Query: Making request to:', input);
      console.log('RTK Query: Request init:', init);
      
      try {
        const response = await fetch(input, init);
        console.log('RTK Query: Response received:', {
          status: response.status,
          ok: response.ok,
          headers: Object.fromEntries(response.headers.entries())
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.log('RTK Query: Error response body:', errorText);
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        
        return response;
      } catch (error) {
        console.error('RTK Query: Fetch failed:', error);
        throw error;
      }
    }
  }),
  endpoints: (builder) => ({
    createUser: builder.mutation({
      query: (user) => {
        const baseUrl = getApiBaseUrl();
        const fullUrl = `${baseUrl}/api/user/signup`;
        console.log("API: Creating user with data:", user);
        console.log("API: Base URL:", baseUrl);
        console.log("API: Full URL:", fullUrl);
        return {
          url: fullUrl,
          method: "POST",
          body: user,
          headers: {
            "Content-type": "application/json",
          },
        };
      },
    }),
    verifyEmail: builder.mutation({
      query: (user) => {
        const baseUrl = getApiBaseUrl();
        const fullUrl = `${baseUrl}/api/user/verify-email`;
        return {
          url: fullUrl,
          method: "POST",
          body: user,
          headers: {
            "Content-type": "application/json",
          },
        };
      },
    }),
    loginUser: builder.mutation({
      query: (user) => {
        return {
          url: "login",
          method: "POST",
          body: user,
          headers: {
            "Content-Type": "application/json",
          },
        };
      },
    }),
    getUser: builder.query({
      query: () => {
        return {
          url: "profile",
          method: "GET",
        };
      },
    }),
    logoutUser: builder.mutation({
      query: () => {
        return {
          url: "logout",
          method: "POST",
          body: {},
        };
      },
    }),
    resetPasswordLink: builder.mutation({
      query: (user) => {
        return {
          url: "reset-password-link",
          method: "POST",
          body: user,
          headers: {
            "Content-Type": "application/json",
          },
        };
      },
    }),
    resetPassword: builder.mutation({
      query: (data) => {
        const { id, token, ...values } = data;
        const actualData = { ...values };
        return {
          url: `/reset-password/${id}/${token}`,
          method: "POST",
          body: actualData,
          headers: {
            "Content-Type": "application/json",
          },
        };
      },
    }),
    changePassword: builder.mutation({
      query: (actualData) => {
        return {
          url: `change-password`,
          method: "POST",
          body: actualData,
        };
      },
    }),
    contactUs: builder.mutation({
      query: (actualData) => {
        return {
          url: `contact`,
          method: "POST",
          body: actualData,
        };
      },
    }),
  }),
});

// export const {
//   useCreateUserMutation,
//   useVerifyEmailMutation,
//   useLoginUserMutation,
//   useGetUserQuery,
//   useLogoutUserMutation,
//   useResetPasswordLinkMutation,
//   useResetPasswordMutation,
//   useChangePasswordMutation,
//   useContactUsMutation,
// } = authApi;

// Define a service for staff using a base URL and expected endpoints
export const staffApi = createApi({
  reducerPath: "staffApi",
  baseQuery: fetchBaseQuery({ 
    baseUrl: `${getApiBaseUrl()}/api/staff/`,
    credentials: 'include'
  }),
  endpoints: (builder) => ({
    verifyStaffEmail: builder.mutation({
      query: (user) => {
        // console.log("otp",user);
        return {
          url: `staff-verify-email`,
          method: "POST",
          body: user,
          headers: {
            "Content-type": "application/json",
          },
        };
      },
    }),
    loginStaff: builder.mutation({
      query: (user) => {
        return {
          url: "staff-login",
          method: "POST",
          body: user,
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", //It is required to set cookie
        };
      },
    }),
    getStaff: builder.query({
      query: () => {
        return {
          url: "staff-profile",
          method: "GET",
          credentials: "include",
        };
      },
    }),
    logoutStaff: builder.mutation({
      query: () => {
        return {
          url: "staff-logout",
          method: "POST",
          body: {},
          credentials: "include",
        };
      },
    }),
    resetStaffPasswordLink: builder.mutation({
      query: (user) => {
        return {
          url: "reset-password-link",
          method: "POST",
          body: user,
          headers: {
            "Content-Type": "application/json",
          },
        };
      },
    }),
    resetStaffPassword: builder.mutation({
      query: (data) => {
        const { id, token, ...values } = data;
        const actualData = { ...values };
        return {
          url: `/reset-password/${id}/${token}`,
          method: "POST",
          body: actualData,
          headers: {
            "Content-Type": "application/json",
          },
        };
      },
    }),
    changeStaffPassword: builder.mutation({
      query: (actualData) => {
        return {
          url: `staff-change-password`,
          method: "POST",
          body: actualData,
          credentials: "include",
        };
      },
    }),
  }),
});

// Export user API hooks
export const {
  useCreateUserMutation,
  useVerifyEmailMutation,
  useLoginUserMutation,
  useGetUserQuery,
  useLogoutUserMutation,
  useResetPasswordLinkMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
  useContactUsMutation,
} = authApi;

// Export staff API hooks
export const {
  useVerifyStaffEmailMutation,
  useLoginStaffMutation,
  useGetStaffQuery,
  useLogoutStaffMutation,
  useResetStaffPasswordLinkMutation,
  useResetStaffPasswordMutation,
  useChangeStaffPasswordMutation,
} = staffApi;

// import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
// import { getApiBaseUrl } from "../utils/env";

// export const authApi = createApi({
//   reducerPath: "authApi",
//   baseQuery: fetchBaseQuery({
//     baseUrl: `${getApiBaseUrl()}/api/auth/`,
//   }),
//   endpoints: (builder) => ({
//     // Create User (Register)
//     createUser: builder.mutation({
//       query: (body) => ({
//         url: "register",
//         method: "POST",
//         body,
//       }),
//     }),
//   }),
// });

// export const { useCreateUserMutation } = authApi;
4