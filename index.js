// Import các thư viện cần thiết
const { Client, GatewayIntentBits, ButtonStyle, PermissionsBitField, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const express = require('express');

// Tạo ứng dụng express để giữ bot hoạt động 24/7
const server = express();
server.all('/', (req, res) => {
  res.send('Bot đang hoạt động!');
});

function keepAlive() {
  server.listen(3000, () => {
    console.log('Server đang hoạt động!');
  });
}

// Tạo bot với các quyền cần thiết
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers, // Quyền để xem số lượng thành viên
  ]
});

const TOKEN = 'TOKEN'; // Thay thế bằng token của bạn

client.on('ready', () => {
    console.log(`Bot đã đăng nhập thành công với tên ${client.user.tag}`);
  
    // Cập nhật trạng thái bot thành "Đang chơi .gg/dstore"
    client.user.setActivity('mọi thứ', { type: 'WATCHING' });
  
    console.log('Trạng thái bot đã được cập nhật');
  });

// Xử lý lệnh "!nuke" với xác nhận Yes/No
client.on('messageCreate', async (message) => {
  if (message.content === '!nuke' && message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
    // Tạo một hàng nút bấm (Yes và No)
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('yes')
          .setLabel('Yes')
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId('no')
          .setLabel('No')
          .setStyle(ButtonStyle.Secondary),
      );

    // Gửi tin nhắn xác nhận với các nút Yes và No
    const confirmMessage = await message.reply({ content: 'Bạn có chắc muốn nuke kênh này không?', components: [row] });

    // Tạo bộ lọc để kiểm tra phản hồi chỉ từ người đã gửi lệnh và là Yes hoặc No
    const filter = interaction => {
      return ['yes', 'no'].includes(interaction.customId) && interaction.user.id === message.author.id;
    };

    // Chờ người dùng bấm vào Yes hoặc No
    const collector = confirmMessage.createMessageComponentCollector({ filter, time: 15000 });

    collector.on('collect', async interaction => {
      if (interaction.customId === 'yes') {
        const channel = message.channel;
        const position = channel.position;

        // Kết thúc việc thu thập trước khi xóa kênh
        collector.stop();

        try {
          // Tạo bản sao kênh hiện tại
          const clonedChannel = await channel.clone({
            name: channel.name,
            reason: 'Channel nuked by bot',
          });

          // Đặt lại vị trí cũ cho kênh mới
          await clonedChannel.setPosition(position);

          // Xóa kênh ban đầu
          await channel.delete('Channel was nuked');

          // Gửi tin nhắn thông báo tại kênh mới
          await clonedChannel.send('<a:hi:1247560068040491028> Kênh đã được nuke thành công!');
        } catch (error) {
          console.error('Có lỗi xảy ra khi nuke kênh:', error);
        }
      } else if (interaction.customId === 'no') {
        // Nếu người dùng chọn No, hủy bỏ hành động nuke
        await message.reply('Lệnh nuke đã bị hủy.');
      }
    });

    collector.on('end', collected => {
      if (confirmMessage && confirmMessage.editable) {
        // Sau khi hết thời gian hoặc người dùng đã chọn, xóa các nút để tránh tương tác thêm
        confirmMessage.edit({ components: [] });
      }
    });

  } else if (message.content === '!nuke') {
    // Nếu người dùng không có quyền quản lý kênh
    message.reply('Bạn không có quyền sử dụng lệnh này.');
  }
});

// Giữ bot hoạt động 24/7 bằng cách sử dụng một máy chủ web nhỏ
keepAlive();

// Đăng nhập bot với token
client.login(TOKEN);
