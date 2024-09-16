const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const nlp = require('./botmodel');

// Variable to store bot's mute status
let isMuted = false;

// Get the current date
const currentDate = new Date();
const formattedDate = `${currentDate.getFullYear()}-${('0' + (currentDate.getMonth() + 1)).slice(-2)}-${('0' + currentDate.getDate()).slice(-2)}`;

// Warna (Color codes)
const red = '\x1b[31m'; // Red
const darkgreen = '\x1b[38;5;22m';
const green ='\x1b[32m'; // Green
const yellow ='\x1b[33m'; // Yellow
const blue = '\x1b[34m'; // Blue
const magenta ='\x1b[35m'; // Magenta
const cyan = '\x1b[36m'; // Cyan
const white = '\x1b[37m'; // White
const gray = '\x1b[90m'; // Gray
const resetColor = '\x1b[0m';
const BOLD = '\x1b[1m';

// Function to show loading dots
function showLoadingDots() {
    const loadingSymbols = ['/', '—', '\\', '|'];
    let index = 0;

    const intervalId = setInterval(() => {
        process.stdout.write(`\r${darkgreen}Loading ${loadingSymbols[index]}${resetColor}`);
        index = (index + 1) % loadingSymbols.length;
    }, 500);

    return intervalId;
}

// Initialize WhatsApp client
const client = new Client({
    authStrategy: new LocalAuth()
});

// Display QR Code for authentication
client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

// Notify when client is ready
client.on('ready', () => {
    // Stop the loading dots
    clearInterval(loadingInterval);

    // Print a new line and notify that the client is ready
    process.stdout.write('\r'); // Clear the line
    process.stdout.write(' '.repeat(20)); // Overwrite with spaces to ensure clearing
    process.stdout.write('\r'); // Return to the start of the line
    console.log(`${yellow}Info : Client is ready!\n`);
});

// Start showing loading dots
const loadingInterval = showLoadingDots();

// Function to get formatted current time
function getCurrentTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}

// Function to handle messages
async function handleMessage(message) {
    // Get current time
    const time = getCurrentTime();
    const contact = await message.getContact();
    const userName = contact.pushname || 'User';

    // Check commands to mute or unmute the bot
    if (message.body.toLowerCase() === 'diam') {
        isMuted = true;
        await message.reply("Alice akan diam, kak.");
        console.log(`${red}[${time}] Bot Disuruh diam oleh ${userName}`);
    } else if (message.body.toLowerCase() === 'berbicara') {
        isMuted = false;
        await message.reply("Ada yang bisa Alice bantu?");
        console.log(`${gray}[${time}] Bot Disuruh berbicara oleh ${userName}`);
    } else {
        // If bot is not muted, process message with NLP
        if (!isMuted) {
            try {
                // Process message with NLP
                const { answer } = await nlp.process('id', message.body);

                // Print answer to terminal with user's name
                console.log(`${white}[${time}] ${userName} :`, answer);

                // Send reply to WhatsApp including user's name
                await message.reply(`${answer}`);
            } catch (error) {
                console.error('Error processing message:', error);
                await message.reply("Maaf, terjadi kesalahan dalam memproses pesan.");
            }
        }
    }
}

// Handle incoming messages
client.on('message', handleMessage);

// Initialize client
client.initialize();
