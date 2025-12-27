import mongoose from "mongoose";

const expenseCategorySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    creditAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CreditAccount",
      required: true,
    },
    expenses: [
      {
        amount: { type: Number, required: true },
        type: { type: String, default: "debit", required: true },
        description: { type: String, required: true },
        date: { type: Date, required: true },
        currentAmount: { type: Number, required: true },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.ExpenseCategory ||
  mongoose.model("ExpenseCategory", expenseCategorySchema);
