const app = require("./app");
const dotenv = require("dotenv");
const connectDB = require("./config/database");

dotenv.config({ path: "backend/config/config.env" });
connectDB();

const server = app.listen(process.env.PORT, () => {
  console.log(`This port is running on the port ${process.env.PORT}`);
});

process.on("unhandledRejection", (err) => {
  console.log(`Error:- ${err.message}`);
  console.log("Shutting down the server due to unhandled rejection error");
  server.close(() => {
    process.exit(1);
  });
});
process.on("uncaughtException", (err) => {
  console.log(`Error:- ${err.message}`);
  console.log("Shutting down the server due to uncaught exception error");
  server.close(() => {
    process.exit(1);
  });
});
