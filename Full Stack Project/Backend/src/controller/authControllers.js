import User from '../model/User.model.js'
import generateToken from "../utils/generateToken.js";
import asyncHandler from "../utils/asyncHandler.js";
import jwt from 'jsonwebtoken';
import bcrypt from "bcryptjs";

export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({
                message: 'please fill out all the fields.',
            });
        }
        const userExists = await User.findOne({
            email,
        });
        if (userExists) {
            return res.status(400).json({
                message: 'email Already Exists',
            });
        }
        const user = await User.create({
            name,
            email,
            password,
        });
        return res.status(201).json({
            message: 'Account Created',
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id),
        });
    } catch (error) {
        console.log(error);
        if (error.name === 'ValidationError') {
            const firstMessage = Object.values(error.errors)[0]?.message || 'Invalid data submitted';
            return res.status(400).json({
                message: firstMessage,
            });
        }
        if (error.code === 11000) {
            return res.status(400).json({
                message: 'email Already Exists',
            });
        }
        return res.status(500).json({
            message: 'Server error',
            error: error.message,
        });
    }
};

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({
            email,
        }).select('+password');
        if (!user) {
            return res.status(404).json({
                message: 'Invalid Email Entered',
            });
        }
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(400).json({
                message: 'invalid Password',
            });
        }
        return res.status(200).json({
            message: 'user logged in',
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id),
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Server error',
            error: error.message,
        });
    }
};

export const getMe = (req, res) => {
    res.status(200).json(req.user);
};

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("+password");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Update name
  if (req.body.name) {
    user.name = req.body.name;
  }

  // Update email
  if (req.body.email) {
    user.email = req.body.email;
  }

  // Update password
  // IMPORTANT: Do NOT bcrypt.hash() here.
  // User.model.js pre("save") will hash it automatically.
  if (req.body.password && req.body.password.trim() !== "") {
    user.password = req.body.password;
  }

  await user.save();

  res.status(200).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    token: generateToken(user._id),
  });
});