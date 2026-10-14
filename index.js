const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { GoogleGenAI } = require('@google/genai');

// আপনার জেমিনি এপিআই কি বসান
const GEMINI_API_KEY = "AQ.Ab8RN6IIPI_IQMjUba0EUf5tgIKhQM6AjHikSoqhUj9riH4wFw"; 
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// মেটা প্রম্পট: জেমিনিকে এজেন্সির প্রতিনিধি হিসেবে কাজ করার নির্দেশ
const SYSTEM_PROMPT = `
আপনি একটি অ্যাক্টিং এবং মডেলিং এজেন্সির প্রফেশনাল কাস্টিং টিম প্রতিনিধি।
আপনার কাজ হলো নতুন বা আগ্রহী অভিনেতাদের সাথে খুব নম্র ও সুন্দরভাবে কথা বলা।

আপনার প্রধান নিয়মসমূহ:
১. এজেন্সির নিয়ম বুঝিয়ে বলুন: আমরা নতুনদের শর্ট ফিল্ম, নাটক ও বিজ্ঞাপনে কাজের সুযোগ দেই। সিলেকশন সম্পূর্ণ ফ্রী।
২. আপনার মূল লক্ষ্য: কথা বলার ফাঁকে তাদের কাছ থেকে চ্যাটেই ১-২টি সাম্প্রতিক ছবি এবং বায়োডাটা (নাম, বয়স, উচ্চতা, জেলা) চাওয়া।
৩. উত্তর সবসময় সংক্ষিপ্ত, বন্ধুত্বপূর্ণ এবং সহজ বাংলায় ৩-৪ লাইনের মধ্যে দিন।
`;

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

client.on('qr', (qr) => {
    console.log('\n====================================================');
    console.log('Render/Server Logs-এ আসা নিচের QR কোডটি স্ক্যান করুন:');
    console.log('====================================================\n');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('\n[SUCCESS] হোয়াটসঅ্যাপ জেমিনি এআই বট সফলভাবে চালু হয়েছে!\n');
});

client.on('message', async (msg) => {
    // গ্রুপ মেসেজ বাদ দিয়ে শুধু সরাসরি চ্যাট রিসিভ করবে
    if (!msg.from.includes('@g.us')) {
        try {
            // জেমিনি মডেল থেকে রেসপন্স নেওয়া
            const response = await ai.models.generateContent({
                model: 'gemini-3.8-flash',
                contents: [
                    { role: 'user', parts: [{ text: `${SYSTEM_PROMPT}\n\nইউজার বলেছে: ${msg.body}` }] }
                ]
            });

            const replyText = response.text;
            await msg.reply(replyText);
            console.log(`[AI REPLIED to ${msg.from}]: ${replyText}`);

        } catch (error) {
            console.error('Gemini API Error:', error);
            await msg.reply("ধন্যবাদ মেসেজ করার জন্য! আমাদের কাস্টিং টিম থেকে আপনার সাথে শীঘ্রই যোগাযোগ করা হবে। দয়া করে আপনার নাম, বয়স এবং একটি ছবি এখানে পাঠিয়ে রাখুন।");
        }
    }
});

client.initialize();
