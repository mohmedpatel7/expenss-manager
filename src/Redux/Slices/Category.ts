import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

// Types for the API response and expense category
export interface Expense {
  amount: number;
  type: string;
  date: string;
  description?: string;
  currentAmount: number;
}

export interface ExpenseCategory {
  _id: string;
  userId: string;
  title: string;
  creditAccountId: string;
  expenses: Expense[];
  createdAt: string; // or Date
  updatedAt: string; // or Date
  // Add other fields if present in your schema
}

export interface PostExpenseResponse {
  message: string;
  expense: ExpenseCategory;
  remainingCredit: number;
}

export interface PutExpenseResponse {
  message: string;
  category: ExpenseCategory;
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

// Thunk for fetching a single expense category by id
export const fetchExpenseCategoryById = createAsyncThunk<
  ExpenseCategory,
  { id: string; userToken: string },
  { rejectValue: string }
>(
  "category/fetchExpenseCategoryById",
  async ({ id, userToken }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/expenss/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          usertoken: userToken,
        },
      });
      const data = await response.json();
      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to fetch category");
      }
      return data.data as ExpenseCategory;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Network error");
    }
  }
);

export const debitExpenseFromCategory = createAsyncThunk<
  PutExpenseResponse,
  { categoryId: string; amount: number; userToken: string },
  { rejectValue: string }
>(
  "category/debitExpenseFromCategory",
  async ({ categoryId, amount, userToken }, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/expenss", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          usertoken: userToken,
        },
        body: JSON.stringify({ categoryId, amount }),
      });

      const data = await response.json();
      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to debit expense");
      }
      return data as PutExpenseResponse;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Network error");
    }
  }
);

// Thunk for deleting a category by id
export const deleteExpenseCategory = createAsyncThunk<
  string, // return deleted category id
  { id: string; userToken: string },
  { rejectValue: string }
>(
  "category/deleteExpenseCategory",
  async ({ id, userToken }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/expenss/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          usertoken: userToken,
        },
      });
      const data = await response.json();
      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to delete category");
      }
      return id;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Network error");
    }
  }
);

interface CategoryState {
  loading: boolean;
  error: string | null;
  expense: ExpenseCategory | null;
  remainingCredit: number | null;
  categories: ExpenseCategory[];
}

const initialState: CategoryState = {
  loading: false,
  error: null,
  expense: null,
  remainingCredit: null,
  categories: [],
};

const categorySlice = createSlice({
  name: "category",
  initialState,
  reducers: {
    // Clear any error in the state
    clearError: (state) => {
      state.error = null;
    },
    clearExpense: (state) => {
      state.expense = null;
    },
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
        state.categories = action.payload;
        state.expense = action.payload[0] || null;
        state.error = null;
      })
      .addCase(fetchExpenseCategories.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) || "Failed to fetch categories";
      })
      // Handle fetching a single category by ID
      .addCase(fetchExpenseCategoryById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExpenseCategoryById.fulfilled, (state, action) => {
        state.loading = false;
        state.expense = action.payload;
        state.error = null;
      })
      .addCase(fetchExpenseCategoryById.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to fetch category";
      })
      // Add handlers for the PUT API
      .addCase(debitExpenseFromCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(debitExpenseFromCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.expense = action.payload.category;
        state.remainingCredit = action.payload.remainingCredit;
      })
      .addCase(debitExpenseFromCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteExpenseCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteExpenseCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = state.categories.filter(
          (cat) => cat._id !== action.payload
        );
        state.error = null;
      })
      .addCase(deleteExpenseCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to delete category";
      });
  },
});
export const { clearError, clearExpense } = categorySlice.actions;
export default categorySlice.reducer;
