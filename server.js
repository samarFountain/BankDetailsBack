require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5400;

app.use(cors({ origin: "*", methods: "GET,POST,PUT,DELETE", allowedHeaders: "Content-Type" }));
app.use(express.json());

mongoose.connect("mongodb+srv://samar0486:samar0486@allbackends.xm3hwao.mongodb.net/AllUsersDetails", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const BankDetailsSchema = new mongoose.Schema({
  username: { type: String, required: true },
  accountHolder: { type: String, required: true },
  accountNumber: { type: String, required: true, unique: true },
  ifscCode: { type: String, required: true },
  withdrawableAmount: { type: Number, required: true, default: 0 },
  requestedMoney: { type: Number, required: true, default: 0 },
}, { timestamps: true });

const BankDetails = mongoose.model("BankDetails", BankDetailsSchema);

app.post("/api/bank/add", async (req, res) => {
  try {
    const { username, accountHolder, accountNumber, ifscCode, withdrawableAmount } = req.body;

    if (!username || !accountHolder || !accountNumber || !ifscCode) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existingAccount = await BankDetails.findOne({ accountNumber });
    if (existingAccount) {
      return res.status(400).json({ error: "Account number already exists" });
    }

    const newBankDetails = new BankDetails({ username, accountHolder, accountNumber, ifscCode, withdrawableAmount });
    await newBankDetails.save();

    res.status(201).json({ message: "Bank details saved successfully", bankDetails: newBankDetails });
  } catch (error) {
    console.error("Error saving bank details:", error);
    res.status(500).json({ error: "Server error: Unable to save bank details" });
  }
});

app.get("/api/bank/all", async (req, res) => {
  try {
    const bankDetails = await BankDetails.find();
    res.status(200).json(bankDetails);
  } catch (error) {
    res.status(500).json({ error: "Error fetching bank details" });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));