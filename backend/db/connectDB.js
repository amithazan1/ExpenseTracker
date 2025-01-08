import mongoose from "mongoose";

// Function to connect to MongoDB
export const connectDB = async () => {
  try {
    // Connect to the MongoDB database using the connection string from environment variables
    const conn = await mongoose.connect(process.env.MONGO_URI);

    // Log the successful connection with the host name
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    // Log any error that occurs during the connection process
    console.error(`Error: ${err.message}`);

    // Exit the process with a failure code (1) to indicate an error
    process.exit(1);
  }
};
