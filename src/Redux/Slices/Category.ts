import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

// Types for the API response and expense category
export interface Expense {
  amount: number;
  type: string;
  date: string;
}

export interface ExpenseCategory {
  _id: string;
  userId: string;
  title: string;
  creditAccountId: string;
  expenses: Expense[];
  // Add other fields if present in your schema
}

export interface PostExpenseResponse {
  message: string;
  expense: ExpenseCategory;
  remainingCredit: number;
}

// Async thunk to post an expense to the API
export const postExpense = createAsyncThunk<
  PostExpenseResponse,
  { title: string; amount: number; userToken: string },
  { rejectValue: string }
>(
  "category/postExpense",
  async ({ title, amount, userToken }, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/expenss", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          usertoken: userToken,
        },
        body: JSON.stringify({ title, amount }),
      });

      const data = await response.json();
      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to record expense");
      }
      return data as PostExpenseResponse;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Network error");
    }
  }
);

// Thunk for fetching current user's expense categories
export const fetchExpenseCategories = createAsyncThunk<
  ExpenseCategory[],
  string,
  { rejectValue: string }
>("category/fetchExpenseCategories", async (usertoken, { rejectWithValue }) => {
  try {
    const response = await fetch("/api/expenss", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        usertoken,
      },
    });
    const data = await response.json();
    if (!response.ok) {
      return rejectWithValue(data.message || "Failed to fetch categories");
    }
    return data.expenss;
  } catch (error: unknown) {
    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue("Network error");
  }
});

interface CategoryState {
  loading: boolean;
  error: string | null;
  expense: ExpenseCategory | null;
  remainingCredit: number | null;
}

const initialState: CategoryState = {
  loading: false,
  error: null,
  expense: null,
  remainingCredit: null,
};

const categorySlice = createSlice({
  name: "category",
  initialState,
  reducers: {
    // Add your synchronous reducers here if needed
  },
  extraReducers: (builder) => {
    builder
      .addCase(postExpense.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(postExpense.fulfilled, (state, action) => {
        state.loading = false;
        state.expense = action.payload.expense;
        state.remainingCredit = action.payload.remainingCredit;
      })
      .addCase(postExpense.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchExpenseCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExpenseCategories.fulfilled, (state, action) => {
        state.loading = false;
        // Optionally, you can store all categories in a new state property
        // For now, just store the first category as before
        state.expense = action.payload[0] || null;
        state.error = null;
      })
      .addCase(fetchExpenseCategories.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) || "Failed to fetch categories";
      });
  },
});

export default categorySlice.reducer;
