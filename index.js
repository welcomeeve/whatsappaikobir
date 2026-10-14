const { Client, LocalAuth } = require('whatsapp-web.js');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const GEMINI_API_KEY = "AQ.Ab8RN6IIPI_IQMjUba0EUf5tgIKhQM6AjHikSoqhUj9riH4wFw"; 
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const SYSTEM_PROMPT = "আপনি একটি ট্যালেন্ট এজেন্সির হোয়াটসঅ্যাপ এআই অ্যাসিস্ট্যান্ট। অ্যাক্টর অনবোর্ডিং এবং তথ্য সংগ্রহের কাজ করবেন।";

// ⚠️ এখানে ৬ জন মানুষের ৬টি আসল হোয়াটসঅ্যাপ নম্বর বসিয়ে দিন (যেমন: 88016XXXXXXXX)
const phoneNumbers = [
    "8801715847177", // ১ম নম্বর
    "8801577103785", // ২য় নম্বর
    "88016XXXXXXXX", // ৩য় নম্বর
    "88016XXXXXXXX", // ৪থ নম্বর
    "88016XXXXXXXX", // ৫ম নম্বর
    "88016XXXXXXXX"  // ৬ষ্ঠ নম্বর
];

phoneNumbers.forEach((phoneNumber, index) => {
    if (!phoneNumber || phoneNumber.includes("XXXXXXXX")) return;

    const client = new Client({
        authStrategy: new LocalAuth({ clientId: `client_${index + 1}` }),
        puppeteer: {
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--single-process', '--disable-gpu']
        }
    });

    client.on('qr', async () => {
        try {
            await new Promise(resolve => setTimeout(resolve, 3000 * (index + 1)));
            const pairingCode = await client.requestPairingCode(phoneNumber);
            console.log(`\n====================================================`);
            console.log(`🔑 নম্বর ${index + 1} (${phoneNumber})-এর পেয়ারিং কোড: ${pairingCode}`);
            console.log(`====================================================\n`);
        } catch (error) {
            console.error(`Error for ${phoneNumber}:`, error.message);
        }
    });

    client.on('ready', () => {
        console.log(`\n[SUCCESS] নম্বর ${index + 1} (${phoneNumber}) সফলভাবে কানেক্ট হয়েছে!\n`);
    });

    client.on('message', async (msg) => {
        if (!msg.from.includes('@g.us')) {
            try {
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
                const prompt = `${SYSTEM_PROMPT}\n\nইউজার বলেছে: ${msg.body}`;
                const result = await model.generateContent(prompt);
                await msg.reply(result.response.text());
            } catch (error) {
                await msg.reply("ধন্যবাদ মেসেজ করার জন্য! আমাদের কাস্টিং টিম থেকে আপনার সাথে শীঘ্রই যোগাযোগ করা হবে।");
            }
        }
    });

    client.initialize();
});
