import { validationResult } from "express-validator";
import { body } from "express-validator";
import User from "../models/users.js";
export const validationErrors = (req, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    try {
      const err = new Error("validation failed");
      err.statusCode = 422;
      err.data = errors.array();
      err.message = errors.array()[0].msg;
      throw err;
    } catch (error) {
      next(error);
    }
  }
};
export const emailValidation = (type) => {
  let validations;
  validations = [
    body("email")
      .isEmail()
      .withMessage("please enter a valid email")
      .normalizeEmail(),
    body("password")
      .isLength({ min: 6 })
      .withMessage("password must be at least 6 characters"),
  ];
  if (type === "signUp") {
    validations.push(body("firstName").trim().not().isEmpty());
    validations.push(body("lastName").trim().not().isEmpty());
    validations.push(body("confirmPassword").trim().not().isEmpty());
  }
  return validations;
};

export const productValidations = () => {
  return [
    body("title").trim().not().isEmpty(),
    body("message").trim().not().isEmpty(),
    body("tags").trim().not().isEmpty(),
  ];
};
export const serverSideErrorHandling = (err, next) => {
  if (!err.statusCode) {
    err.statusCode = 500;
  }
  next(err);
};

export const expectedErrorHandling = (message, statusCode) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  throw err;
};
