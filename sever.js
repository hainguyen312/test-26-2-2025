const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');

const app = express();
app.use(bodyParser.json());


const uri='mongodb+srv://haindchv:Hai03122003@test26-2-2025.ip6cc.mongodb.net/?retryWrites=true&w=majority&appName=Test26-2-2025'

mongoose.connect(uri);

const connection = mongoose.connection;
connection.once('open', () => {
  console.log("MongoDB Cloud connection established successfully");
})

const userSchema = new mongoose.Schema({
    userId: { type: Number, unique: true },
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    loggedin: { type: Number, default: 0 },
    loggedAt: { type: Date, default: null },
});

const User = mongoose.model('User', userSchema);

// Hàm băm mật khẩu
function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

// const limiter = rateLimit({
//     windowMs: 1000, 
//     max: 5, 
// });

// app.use(limiter);

// API đăng nhập
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = hashPassword(password);

    try {
        const user = await User.findOne({ username, password: hashedPassword });
        if (user) {
            user.loggedin = 1;
            user.loggedAt = new Date();
            await user.save();
            res.json({ result: 'success', userId: user.userId });
        } else {
            res.json({ result: 'failure' });
        }
    } catch (error) {
        res.status(500).json({ result: 'error', message: error.message });
    }
});

app.listen(5001, () => {
    console.log('Server is running on port 5001');
});