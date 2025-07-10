import mongoose from "mongoose";

const creditAccountSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    currentCredit: { type: Number, required: true, default: 0 },
    history: [
      {
        type: { type: String, enum: ["credit", "debit"], required: true },
        amount: { type: Number, required: true },
        date: { type: Date, default: Date.now },
        note: { type: String },
        categoryId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "ExpenseCategory",
          default: null,
        },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.CreditAccount ||
  mongoose.model("CreditAccount", creditAccountSchema);
