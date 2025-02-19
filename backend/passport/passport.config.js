import passport from "passport";
import bcrypt from "bcryptjs";

import User from "../models/user.model.js";
import { GraphQLLocalStrategy } from "graphql-passport";

export const configurePassport = async () => {
  // This method is called after the user is successfully authenticated.
  // It is used to serialize the user data (e.g., storing just the user’s ID in the session)
  // to keep the session lightweight.
  passport.serializeUser((user, done) => {
    console.log("Serializing user");
    done(null, user.id);
  });

  // When a request comes in with an active session (containing the user’s ID),
  // Passport will call deserializeUser to retrieve the user data from the database.
  passport.deserializeUser(async (id, done) => {
    console.log("Deserializing user");
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  passport.use(
    new GraphQLLocalStrategy(async (username, password, done) => {
      try {
        const user = await User.findOne({ username });
        if (!user) {
          throw new Error("Invalid username or password");
        }
        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
          throw new Error("Invalid username or password");
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );
};
