const express = require("express");
const router = express.Router();
const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const cloudinary = require("cloudinary").v2;
const fileUpload = require("express-fileupload");
const User = require("../models/User");
const convertToBase64 = require("../utils/base64");

router.post("/user/signup", fileUpload(), async (req, res) => {
  try {
    console.log("Avatar", req.files);
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json("Une information est manquante");
    }
    const user = await User.findOne({ email }).populate("account");

    if (user !== null) {
      return res.status(409).json("Cette adresse mail a déjà été utilisé");
    }

    const salt = uid2(16);
    const hash = SHA256(salt + password).toString(encBase64);
    const token = uid2(64);

    const newUser = new User({
      email,
      account: {
        username,
        avatar,
      },
      token,
      hash,
      salt,
    });

    if (req.files) {
      const pictureUpload = await cloudinary.uploader.upload(
        convertToBase64(req.files.avatar),
        {
          folder: `/PopDressing/user/${newUser._id}`,
        }
      );
      // console.log("Picture upload", pictureUpload);
      newUser.account.avatar = pictureUpload;
      // console.log(newUser);
    }

    await newUser.save();

    res.json({
      _id: newUser._id,
      token,
      account: newUser.account,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/user/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user === null) {
      return res.status(401).json({
        message: "Non Authorisé",
      });
    }
    const hash = SHA256(user.salt + password).toString(encBase64);

    console.log("User Hash : ", user.hash);
    console.log("Hash :", hash);
    console.log("Username User :", user.username);

    if (hash !== user.hash) {
      return res.status(401).json({ message: "Non Authorisé" });
    }
    res.status(200).json({
      _id: user._id,
      token: user.token,
      account: {
        username: user.account.username,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
