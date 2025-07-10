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
        title: { type: String, required: true },
        amount: { type: Number, required: true },
        note: { type: String },
        date: { type: Date, default: Date.now },
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.ExpenseCategory ||
  mongoose.model("ExpenseCategory", expenseCategorySchema);
