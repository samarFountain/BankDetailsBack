require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = 5400;

app.use(cors());
app.use(express.json());

mongoose.connect("mongodb+srv://samar0486:samar0486@allbackends.xm3hwao.mongodb.net/BankDetails", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const BankDetailsSchema = new mongoose.Schema({
    username: { type: String, required: true },
    accountHolder: { type: String, required: true },
    accountNumber: { type: String, required: true },
    bankName: { type: String, required: true },
    ifscCode: { type: String, required: true },
    branchName: { type: String, required: true },
    withdrawableAmount: { type: Number, required: true, default: 0 },
    requestedMoney: { type: Number, required: true, default: 0 },
}, { timestamps: true });

const BankDetails = mongoose.model('BankDetails', BankDetailsSchema);

app.post('/api/bank/add', async (req, res) => {
    try {
        const newBankDetails = new BankDetails(req.body);
        await newBankDetails.save();
        res.status(201).json({ message: "Bank details saved successfully" });
    } catch (error) {
        res.status(500).json({ error: "Error saving bank details" });
    }
});

app.get('/api/bank/all', async (req, res) => {
    try {
        const bankDetails = await BankDetails.find();
        res.status(200).json(bankDetails);
    } catch (error) {
        res.status(500).json({ error: "Error fetching bank details" });
    }
});

app.put('/api/bank/update/:id', async (req, res) => {
    try {
        const { withdrawableAmount } = req.body;
        const updatedBankDetails = await BankDetails.findByIdAndUpdate(req.params.id, { withdrawableAmount }, { new: true });
        if (!updatedBankDetails) return res.status(404).json({ error: "Bank details not found" });
        res.status(200).json(updatedBankDetails);
    } catch (error) {
        res.status(500).json({ error: "Error updating withdrawable amount" });
    }
});

app.post('/api/bank/withdraw', async (req, res) => {
    try {
        const { username, accountNumber, amount } = req.body;
        const bankDetails = await BankDetails.findOne({ username, accountNumber });

        if (!bankDetails) return res.status(404).json({ error: "Bank details not found" });

        if (bankDetails.withdrawableAmount < amount) {
            return res.status(400).json({ error: "Insufficient funds" });
        }

        bankDetails.requestedMoney = amount;
        await bankDetails.save();

        res.status(200).json({ message: "Withdrawal request submitted", requestedMoney: bankDetails.requestedMoney });
    } catch (error) {
        res.status(500).json({ error: "Error processing withdrawal" });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
