const express = require("express");
const cookieParser = require("cookie-parser");

const app = express();
const errorMiddleware = require("./middleware/error");
const { isAuthenticatedUser } = require("./middleware/auth");

app.use(express.json());
app.use(cookieParser());

// Route
const product = require("./routes/productRoute");
const user = require("./routes/userRoute");

app.use("/api/v1", product);
app.use("/api/v1", user);

// Middleware
app.use(errorMiddleware);
app.use(isAuthenticatedUser);

module.exports = app;
