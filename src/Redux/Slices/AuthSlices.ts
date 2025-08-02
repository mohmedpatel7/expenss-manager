import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Thunk to send OTP to user's email for signup
export const SendOtp = createAsyncThunk(
  "SendOtp",
  async (fileData: { email: string }, { rejectWithValue }) => {
    try {
      // Send a PUT request to trigger OTP email
      const response = await fetch("/api/auth/signup/", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: fileData.email }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: "Error in response!",
        }));
        return rejectWithValue(errorData);
      }

      const data = await response.json();
      return data; // Return API response (e.g., { message })
    } catch (error) {
      return rejectWithValue({
        message: (error as Error).message || "Unknown error",
      });
    }
  }
);

// Thunk to handle user signup (register new user)
export const SignupUser = createAsyncThunk(
  "SignupUser",
  async (
    formData: {
      name: string;
      email: string;
      otp: string;
      dob: string;
      password: string;
    },
    { rejectWithValue }
  ) => {
    try {
      // Send a POST request to register the user
      const response = await fetch("/api/auth/signup/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: "Error in response!",
        }));
        console.log(errorData);
        return rejectWithValue(errorData);
      }

      const data = await response.json();
      // Store JWT token in localStorage on successful signup
      if (data.usertoken) {
        if (typeof window !== "undefined") {
          localStorage.setItem("usertoken", data.usertoken);
        }
      }
      return data; // { usertoken }
    } catch (error) {
      return rejectWithValue({
        message: (error as Error).message || "Unknown error",
      });
    }
  }
);

// Thunk to handle user signin (login)
export const SigninUser = createAsyncThunk(
  "SigninUser",
  async (
    credentials: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      // Send a POST request to login the user
      const response = await fetch("/api/auth/signin/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: "Error in response!",
        }));
        return rejectWithValue(errorData);
      }

      const data = await response.json();
      // Store JWT token in localStorage on successful signin
      if (data.usertoken) {
        if (typeof window !== "undefined") {
          localStorage.setItem("usertoken", data.usertoken);
        }
      }
      return data; // { usertoken }
    } catch (error) {
      return rejectWithValue({
        message: (error as Error).message || "Unknown error",
      });
    }
  }
);

// Thunk to fetch current user's profile
export const fetchUserProfile = createAsyncThunk(
  "auth/fetchUserProfile",
  async (usertoken: string, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/auth/user", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          usertoken,
        },
      });
      const data = await response.json();
      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to fetch user profile");
      }
      return data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message || "Network error");
      }
      return rejectWithValue("Network error");
    }
  }
);

// Interface for the authentication slice state
interface DataInterface {
  sendOtpState: { message: string } | null; // State for OTP response
  isLoading: boolean; // Loading state for async actions
  error: string | null; // Error message if any
  signupState?: { usertoken: string } | null; // State for signup response
  signinState?: { usertoken: string } | null; // State for signin response
  userProfile?: {
    _id: string;
    name: string;
    email: string;
    pic?: string;
    dob?: string;
    creadit?: { currentCredit: number } | null;
  } | null;
}

// Initial state for the authentication slice
const initialState: DataInterface = {
  sendOtpState: null,
  isLoading: false,
  error: null,
  signupState: null,
  signinState: null,
  userProfile: null,
};

const authSlice = createSlice({
  name: "authSlice",
  initialState,

  reducers: {
    // Clear any error in the state
    clearError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    //Send otp cases
    builder
      .addCase(SendOtp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(SendOtp.fulfilled, (state, action) => {
        state.isLoading = false;
        state.sendOtpState = action.payload;
        state.error = null;
      })
      .addCase(SendOtp.rejected, (state, action) => {
        state.isLoading = false;
        state.sendOtpState = null;
        state.error =
          (action.payload as { message?: string })?.message ||
          "Something went wrong";
      });

    //Signup cases
    builder
      .addCase(SignupUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(SignupUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.signupState = action.payload;
        state.error = null;
      })
      .addCase(SignupUser.rejected, (state, action) => {
        state.isLoading = false;
        state.signupState = null;
        state.error =
          (action.payload as { message?: string })?.message ||
          "Something went wrong";
      });

    //Signin cases
    builder
      .addCase(SigninUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(SigninUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.signinState = action.payload;
        state.error = null;
      })
      .addCase(SigninUser.rejected, (state, action) => {
        state.isLoading = false;
        state.signinState = null;
        state.error =
          (action.payload as { message?: string })?.message ||
          "Something went wrong";
      })
      // Fetch user profile cases
      .addCase(fetchUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userProfile = action.payload;
        state.error = null;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.userProfile = null;
        state.error =
          (action.payload as string) || "Failed to fetch user profile";
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
