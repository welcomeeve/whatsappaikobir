const { Client, LocalAuth } = require('whatsapp-web.js');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const qrcode = require('qrcode-terminal');

// জেমিনি এআই কনফিগারেশন
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

// সরাসরি QR কোড জেনারেট করার লজিক (সবচেয়ে স্থিতিশীল পদ্ধতি)
client.on('qr', (qr) => {
    console.log('\n====================================================');
    console.log('Railway Logs-এ আসা নিচের QR কোডটি স্ক্যান করুন:');
    console.log('====================================================\n');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('\n[SUCCESS] হোয়াটসঅ্যাপ জেমিনি এআই বট সফলভাবে চালু হয়েছে!\n');
});

client.on('message', async (msg) => {
    // শুধু সরাসরি চ্যাট রিসিভ করবে (গ্রুপ চ্যাট বাদ দেবে)
    if (!msg.from.includes('@g.us')) {
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const prompt = `${SYSTEM_PROMPT}\n\nইউজার বলেছে: ${msg.body}`;

            const result = await model.generateContent(prompt);
            const replyText = result.response.text();

            await msg.reply(replyText);
            console.log(`[AI REPLIED to ${msg.from}]: ${replyText}`);

        } catch (error) {
            console.error('Gemini API Error:', error);
            await msg.reply("ধন্যবাদ মেসেজ করার জন্য! আমাদের কাস্টিং টিম থেকে আপনার সাথে শীঘ্রই যোগাযোগ করা হবে। দয়া করে আপনার নাম, বয়স এবং একটি ছবি এখানে পাঠিয়ে রাখুন।");
        }
    }
});

client.initialize();
