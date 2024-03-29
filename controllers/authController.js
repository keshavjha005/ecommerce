import userModel from "../models/userModel.js";
import { comparePassword, hashpassword } from "../helper/authHelper.js";
import JWT from "jsonwebtoken";

export const registerController = async (req, res) => {
  try {
    const { name, email, password, phone, address,answer } = req.body;
    if (!name) {
      return res.send({ mesage: "Name is Required !" });
    }
    if (!email) {
      return res.send({ mesage: "Email is Required !" });
    }
    if (!password) {
      return res.send({ mesage: "password is Required !" });
    }
    if (!phone) {
      return res.send({ mesage: "phone number is Required !" });
    }
    if (!address) {
      return res.send({ mesage: "address is Required !" });
    }
    if (!answer) {
      return res.send({ mesage: "answer is Required !" });
    }

    // check user
    const existingUser = await userModel.findOne({ email });
    // existing user
    if (existingUser) {
      return res.status(200).send({
        success: false,
        message: "Already register please login",
      });
    }
    // regisrer user
    const hashedPassword = await hashpassword(password);
    //save
    const user = await new userModel({
      name,
      email,
      phone,
      address,
      password: hashedPassword,
      answer,
    }).save();
    res.status(201).send({
      success: true,
      message: "User Register Successfully",
      user,
    });
  } catch (error) {
    console.log("error is : ", error);
    res.status(500).send({
      success: false,
      message: "Error in Registeration.",
      error,
    });
  }
};

// POST LOGIN
export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    //validation
    if (!email || !password) {
      return res.status(404).send({
        success: false,
        message: "Invalid email or password",
      });
    }
    // check user
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "email is not registered.",
      });
    }
    const match = await comparePassword(password, user.password);
    if (!match) {
      return res
        .status(200)
        .send({ success: false, message: "Invalid Password" });
    }
    //token
    const token = await JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.status(200).send({
      success: true,
      message: "Login successfully",
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
      },
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error login",
      error,
    });
  }
};

// forgotpasswordController
export const forgotPasswordController = async (req, res) => {
  try {
    const { email, answer, newPassword } = req.body;
    if (!email) {
      res.status(400).send({ message: "Email is required" });
    }
    if (!answer) {
      res.status(400).send({ message: "Answer is required" });
    }
    if (!newPassword) {
      res.status(400).send({ message: "New Password is required" });
    }

    // check

    const user = await userModel.findOne({ email, answer });
    //validation
    if (!user) {
      return res
        .status(404)
        .send({ success: false, message: "Wrong Email Or  Answer" });
    }
    const hashed = await hashpassword(newPassword);
    await userModel.findByIdAndUpdate(user._id, { password: hashed });
    res.status(200).send({
      success: true,
      message: "password Reset Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Something went wrong in backend.",
    });
  }
};

// test controller
export const testController = (req, res) => {
  res.send("Protected route");
};
