import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/users.js";
import {
  validationErrors,
  expectedErrorHandling,
  serverSideErrorHandling,
} from "../middleware/errorHandling.js";

export const signin = async (req, res, next) => {
  validationErrors(req, next);
  const { email, password } = req.body;
  try {
    const userDoc = await User.findOne({ email });
    if (!userDoc) {
      expectedErrorHandling("Email does not exist!", 404);
    }
    if (userDoc) {
      const isEqual = await bcrypt.compare(password, userDoc.password);

      if (isEqual) {
        const token = jwt.sign(
          {
            email: userDoc.email,
            _id: userDoc._id.toString(),
          },
          `${process.env.TOKEN_SECRET}`,
          { expiresIn: "1h" }
        );
        return res.json({ result: userDoc, token });
      } else {
        expectedErrorHandling("wrong password!", 409);
      }
    }
  } catch (error) {
    serverSideErrorHandling(error, next);
  }
};
export const signup = async (req, res, next) => {
  validationErrors(req, next);
  const { firstName, lastName, email, password, confirmPassword } = req.body;
  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      expectedErrorHandling("this email is already exist!", 400);
    }

    if (password !== confirmPassword) {
      expectedErrorHandling("Password mismatch!", 400);
    }
    const hashPassword = await bcrypt.hash(password, 12);

    const newUser = new User({
      name: `${firstName} ${lastName}`,
      password: hashPassword,
      email: email,
    });

    const result = await newUser.save();
    const token = jwt.sign(
      {
        email: result.email,
        _id: result._id.toString(),
      },
      `${process.env.TOKEN_SECRET}`,
      { expiresIn: "1h" }
    );
    return res.status(200).json({ result, token });
  } catch (error) {
    serverSideErrorHandling(error, next);
  }
};
