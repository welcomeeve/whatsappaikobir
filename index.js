const { Client, LocalAuth } = require('whatsapp-web.js');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const qrcode = require('qrcode-terminal');

const GEMINI_API_KEY = "AQ.Ab8RN6IIPI_IQMjUba0EUf5tgIKhQM6AjHikSoqhUj9riH4wFw"; 
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const SYSTEM_PROMPT = "আপনি একটি ট্যালেন্ট এজেন্সির হোয়াটসঅ্যাপ এআই অ্যাসিস্ট্যান্ট। অ্যাক্টর অনবোর্ডিং এবং তথ্য সংগ্রহের কাজ করবেন।";

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
        ]
    }
});

// ব্রাউজার রেডি হওয়া বা কিউআর জেনারেট হওয়ার ইভেন্ট
client.on('qr', (qr) => {
    console.log('\n====================================================');
    console.log('✅ QR কোড জেনারেট হয়েছে! নিচে স্ক্যান করুন:');
    console.log('====================================================\n');
    qrcode.generate(qr, { small: true });
});

client.on('authenticated', () => {
    console.log('\n[INFO] হোয়াটসঅ্যাপ অথেন্টিকেশন সফল হয়েছে!\n');
});

client.on('ready', () => {
    console.log('\n[SUCCESS] হোয়াটসঅ্যাপ জেমিনি এআই বট সফলভাবে চালু হয়েছে!\n');
});

client.on('auth_failure', (msg) => {
    console.error('[ERROR] অথেন্টিকেশন ফেইল করেছে:', msg);
});

client.on('message', async (msg) => {
    if (!msg.from.includes('@g.us')) {
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const prompt = `${SYSTEM_PROMPT}\n\nইউজার বলেছে: ${msg.body}`;
            const result = await model.generateContent(prompt);
            await msg.reply(result.response.text());
        } catch (error) {
            console.error('Gemini API Error:', error);
            await msg.reply("ধন্যবাদ মেসেজ করার জন্য! আমাদের কাস্টিং টিম থেকে আপনার সাথে শীঘ্রই যোগাযোগ করা হবে।");
        }
    }
});

console.log('[INFO] ক্লায়েন্ট ইনিশিয়ালাইজ করা হচ্ছে, একটু অপেক্ষা করুন...');
client.initialize();
