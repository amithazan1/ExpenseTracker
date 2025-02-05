import { users } from "../dummyData/data.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

const userResolver = {
  Query: {
    authUser: async (_, __, context) => {
      try {
        const user = await context.getUser();
        return user;
      } catch (err) {
        console.error("Error in authUser: ", err);
        throw new Error("Internal server error");
      }
    },

    user: async (_, { userId }) => {
      try {
        const user = await User.findById(userId);
        return user;
      } catch (err) {
        console.error("Error in user query: ", err);
        throw new Error(err.message || "error in getting user");
      }
    },
  },

  Mutation: {
    // Resolver for user signup
    signUp: async (_, { input }, contex) => {
      try {
        // Destructure the input object to get user details
        const { username, name, password, gender } = input;
        // Check if all required fields are provided
        if (!username || !name || !password || !gender) {
          throw new Error("All fields are required");
        }

        // Check if the username is already taken by another user
        const existingUser = await User.findOne({ username });
        if (existingUser) {
          throw new Error("User already exists");
        }

        // Generate a salt for password hashing
        const salt = await bcrypt.genSalt(10);
        // Hash the password with the salt
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generate a default profile picture URL based on gender and username
        const boyProfilePic = `https://avatar.iran.liara.run/public/boy?username=${username}`;
        const girlProfilePic = `https://avatar.iran.liara.run/public/girl?username=${username}`;

        // Create a new user instance with the provided details
        const newUser = new User({
          username,
          name,
          password: hashedPassword,
          gender,
          // Set the profile picture URL based on gender
          profilePicture: gender === "male" ? boyProfilePic : girlProfilePic,
        });

        // Save the new user to the database
        await newUser.save();

        // Log the new user in by calling the login method (assuming context provides login functionality)
        await contex.login(newUser);
        // Return the new user object
        return newUser;
      } catch (err) {
        console.error("Error during signup:", err);
        throw new Error(err.message || "Internal server error");
      }
    },

    // Resolver for user login
    login: async (_, { input }, context) => {
      try {
        // Destructure the input object to get the username and password from the login request
        const { username, password } = input;
        if (!username || !password) throw new Error("All fields are required");

        // Authenticate the user using the 'graphql-local' strategy (which uses the username and password)
        // The 'context.authenticate' function will validate the credentials against the database
        const { user } = await context.authenticate("graphql-local", {
          username,
          password,
        });

        // After successful authentication, log the user in by calling the 'login' method from the context
        // This typically sets up the session or token for the logged-in user
        await context.login(user);

        // Return the authenticated user object as the result of the login mutation
        return user;
      } catch (err) {
        console.error("Error during login:", err);
        throw new Error(err.message || "Internal server error");
      }
    },

    logout: async (_, __, context) => {
      try {
        await context.logout();
        context.req.session.destroy((err) => {
          if (err) throw err;
        });
        context.res.clearCookie("connect.sid");

        return { message: "Logged out successfully" };
      } catch (err) {
        console.error("Error during logout:", err);
        throw new Error(err.message || "Internal server error");
      }
    },
  },
};

export default userResolver;
