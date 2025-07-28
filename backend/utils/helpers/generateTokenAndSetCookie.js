const jwt = require("jsonwebtoken");

const generateTokenAndSetCookie = (userId, res) => {
  try {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.cookie("jwt", token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      sameSite: "none",
      secure: process.env.NODE_ENV === "production",
    });

    return token;
  } catch (error) {
    console.error("Error generating token:", error);
    throw new Error("Could not generate token");
  }
};

module.exports = generateTokenAndSetCookie;
