const { Client, GatewayIntentBits, PermissionsBitField } = require('discord.js');
const keepAlive = require('./server'); // Import server.js để giữ bot online 24/7

// Khởi tạo bot
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

client.once('ready', () => {
    console.log(`Bot đã sẵn sàng với tên: ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
    // Kiểm tra quyền quản trị
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
        return message.reply('Bạn không có quyền sử dụng lệnh này!');
    }

    // Nếu tin nhắn bắt đầu với "!nuke"
    if (message.content.startsWith('!nuke')) {
        // Hỏi lại người dùng có muốn thực hiện lệnh không
        const confirmationMessage = await message.channel.send('Bạn có chắc chắn muốn nuke kênh này? Trả lời `yes` hoặc `no`.');

        // Bộ lọc chỉ chấp nhận phản hồi từ người dùng đã gửi lệnh
        const filter = (response) => {
            return response.author.id === message.author.id && ['yes', 'no'].includes(response.content.toLowerCase());
        };

        // Chờ người dùng trả lời
        const collector = message.channel.createMessageCollector({ filter, time: 15000, max: 1 });

        collector.on('collect', async (response) => {
            if (response.content.toLowerCase() === 'yes') {
                try {
                    // Lưu lại vị trí của kênh ban đầu
                    const channelPosition = message.channel.position;

                    // Nhân bản kênh
                    const clonedChannel = await message.channel.clone({
                        name: message.channel.name,
                        reason: 'Kênh đã bị nuke bởi ' + message.author.tag,
                    });

                    // Di chuyển kênh nhân bản về đúng vị trí cũ
                    await clonedChannel.setPosition(channelPosition);

                    // Xóa kênh cũ
                    await message.channel.delete();
                    
                    // Thông báo thành công
                    await clonedChannel.send('💥 Kênh đã bị nuke và nhân bản thành công!');
                } catch (error) {
                    console.error('Có lỗi xảy ra khi nuke kênh:', error);
                    message.reply('Đã xảy ra lỗi khi thực hiện nuke kênh.');
                }
            } else if (response.content.toLowerCase() === 'no') {
                // Nếu người dùng trả lời 'no'
                message.reply('Lệnh nuke đã bị hủy.');
            }
        });

        collector.on('end', (collected, reason) => {
            if (reason === 'time') {
                message.reply('Lệnh nuke đã hết thời gian chờ và bị hủy.');
            }
        });
    }
});

// Đảm bảo server luôn chạy để bot hoạt động
keepAlive();

// Đăng nhập với token của bot
client.login('YOUR_BOT_TOKEN');
