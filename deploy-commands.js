const { REST, Routes } = require('discord.js');
require('dotenv').config();

const commands = [
    {
        name: 'submit',
        description: '提交 Discord Bot 資訊以供審核',
        options: [
            { name: 'bot_id', type: 3, description: '你的 Bot ID', required: true },
            { name: 'description', type: 3, description: '簡短說明你的 Bot', required: true },
            { name: 'invite_link', type: 3, description: 'Bot 的邀請連結', required: true },
            { name: 'developer_id', type: 3, description: '你的 Discord 使用者 ID', required: true },
        ],
    },
    {
        name: 'approve',
        description: '審核通過提交的 Bot',
        options: [
            { name: 'submission_id', type: 3, description: '提交的 ID 或 Bot ID', required: true },
            { name: 'reason', type: 3, description: '審核通過的原因（可選）', required: false },
        ],
    },
    {
        name: 'reject',
        description: '駁回提交的 Bot',
        options: [
            { name: 'submission_id', type: 3, description: '提交的 ID 或 Bot ID', required: true },
            { name: 'reason', type: 3, description: '駁回的原因（必填）', required: true },
        ],
    },
];

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log('開始註冊指令...');
        await rest.put(Routes.applicationGuildCommands(process.env.APPLICATION_ID, process.env.GUILD_ID), {
            body: commands,
        });
        console.log('指令註冊完成！');
    } catch (error) {
        console.error('註冊指令時發生錯誤：', error);
    }
})();