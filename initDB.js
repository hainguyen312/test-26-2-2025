const mongoose = require('mongoose');
const crypto = require('crypto');

const uri = 'mongodb+srv://haindchv:Hai03122003@test26-2-2025.ip6cc.mongodb.net/?retryWrites=true&w=majority&appName=Test26-2-2025';

mongoose.connect(uri);

const connection = mongoose.connection;
connection.once('open', () => {
    console.log("MongoDB Cloud connection established successfully");
});

const userSchema = new mongoose.Schema({
    userId: { type: Number, unique: true },
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    loggedin: { type: Number, default: 0 },
    loggedAt: { type: Date, default: null },
});

const User = mongoose.model('User', userSchema);

// Hàm tạo chuỗi ngẫu nhiên
function generateRandomString(length) {
    return Array.from({ length }, () => String.fromCharCode(Math.floor(Math.random() * 26) + 97)).join('');
}

// Hàm tạo mật khẩu ngẫu nhiên
function generateRandomPassword() {
    return Array.from({ length: 6 }, () => Math.floor(Math.random() * 10)).join('');
}

// Hàm băm mật khẩu
function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

async function initializeDatabase() {
    const batchSize = 10000; // Số lượng bản ghi chèn mỗi lần
    const totalUsers = 1000000;
    const batches = totalUsers / batchSize;
    const usernames = new Set(); // Set chứa các username đã được tạo
    const start = Date.now();

    for (let i = 0; i < batches; i++) {
        const users = [];
        let attempts = 0;

        while (users.length < batchSize && attempts < batchSize * 2) {
            const userId = i * batchSize + users.length + 1;
            const username = generateRandomString(6);
            const password = generateRandomPassword();
            const hashedPassword = hashPassword(password);

            if (!usernames.has(username)) {
                users.push({
                    userId,
                    username,
                    password: hashedPassword,
                });
                usernames.add(username); // Thêm username vào Set
            }
            attempts++;
        }

        if (users.length > 0) {
            try {
                await User.insertMany(users);
                console.log(`Inserted ${(i + 1) * batchSize} users`);
            } catch (error) {
                console.error(`Error inserting batch ${i + 1}:`, error.message);
            }
        } else {
            console.error(`Failed to generate unique usernames for batch ${i + 1}`);
        }
    }
    const elapsed = (Date.now() - start) / 1000;
    console.log(`Database initialization completed in ${elapsed} seconds`);
    console.log('Database initialization complete');
    mongoose.connection.close();
}

initializeDatabase().catch(err => {
    console.error('Error during database initialization:', err);
    mongoose.connection.close();
});