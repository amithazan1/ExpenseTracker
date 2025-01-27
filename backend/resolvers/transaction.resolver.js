import { users } from "../dummyData/data.js";
import Transaction from "../models/transaction.model.js";
const transactionResolver = {
  Query: {
    transactions: async (_, __, context) => {
      try {
        if (context.getUser()) {
          throw new Error("Unauthorized");
        }
        const userId = await context.getUser()._id;
        const transactions = await Transaction.find({ userId: userId });
        return transactions;
      } catch (error) {
        console.error("Error getting transactions:", error);
        throw new Error("Error getting transactions");
      }
    },
    transaction: async (_, { transactionId }, context) => {
      try {
        if (context.getUser()) {
          throw new Error("Unauthorized");
        }
        const userId = await context.getUser()._id;
        const transaction = await Transaction.findById({ transactionId });
        return transaction;
      } catch (error) {
        console.error("Error getting transaction:", error);
        throw new Error("Error getting transaction");
      }
    },
  },
  Mutation: {
    createTranscacion: async (_, { input }, context) => {
      try {
        const newTransaction = new Transaction({
          ...input,
          userId: context.getUser()._id,
        });
        await newTransaction.save();
        return newTransaction;
      } catch (error) {
        console.error("Error creating transaction:", error);
        throw new Error("Error creating transaction");
      }
    },
    updateTransaction: async (_, { input }) => {
      try {
        const updateTransaction = await Transaction.findByIdAndUpdate(
          input.transactionId,
          input,
          { new: true }
        );
        return updateTransaction;
      } catch (error) {
        console.error("Error updating transaction:", error);
        throw new Error("Error updating transaction");
      }
    },
    deleteTransaction: async (_, { transactionId }) => {
      try {
        const deleteTransaction = await Transaction.findByIdAndDelete(
          transactionId
        );
        return deleteTransaction;
      } catch (error) {
        console.error("Error deleting transaction:", error);
        throw new Error("Error deleting transaction");
      }
    },
  },
};

export default transactionResolver;
