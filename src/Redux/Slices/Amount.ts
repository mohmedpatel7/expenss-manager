import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Thunk for updating amount (already implemented)
export const updateAmount = createAsyncThunk(
  "updateAmount",
  async (
    formData: {
      currentCredit: number;
      type: string;
      usertoken: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch("/api/creadit/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          usertoken: formData.usertoken,
        },
        body: JSON.stringify({
          currentCredit: formData.currentCredit,
          type: formData.type,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        return rejectWithValue(data);
      }
      return data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue({ message: error.message || "Network error" });
      } else {
        return rejectWithValue({ message: "Network error" });
      }
    }
  }
);

// Thunk for fetching current user's credit account
export const fetchCreditAccount = createAsyncThunk(
  "amount/fetchCreditAccount",
  async (usertoken: string, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/creadit", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          usertoken,
        },
      });
      const data = await response.json();
      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to fetch account");
      }
      return data.account;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message || "Network error");
      }
      return rejectWithValue("Network error");
    }
  }
);

// State interface
interface AmountState {
  account: null;
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
}

// Initial state
const initialState: AmountState = {
  account: null,
  isLoading: false,
  error: null,
  successMessage: null,
};

const amountSlice = createSlice({
  name: "amount",
  initialState,
  reducers: {
    clearAmountError: (state) => {
      state.error = null;
    },
    clearAmountSuccess: (state) => {
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateAmount.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateAmount.fulfilled, (state, action) => {
        state.isLoading = false;
        state.account = action.payload.account;
        state.successMessage = action.payload.message || "Amount updated";
        state.error = null;
      })
      .addCase(updateAmount.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          (action.payload as { message?: string })?.message ||
          "Failed to update amount";
        state.successMessage = null;
      })
      .addCase(fetchCreditAccount.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCreditAccount.fulfilled, (state, action) => {
        state.isLoading = false;
        state.account = action.payload;
        state.error = null;
      })
      .addCase(fetchCreditAccount.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || "Failed to fetch account";
      });
  },
});

export const { clearAmountError, clearAmountSuccess } = amountSlice.actions;
export default amountSlice.reducer;
