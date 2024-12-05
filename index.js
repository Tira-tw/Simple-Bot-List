const { Client, GatewayIntentBits, Partials } = require('discord.js');
const fs = require('fs'); // 引入 fs 模組來讀寫檔案
require('dotenv').config();

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
    partials: [Partials.Message, Partials.Channel],
});

const PUBLIC_CHANNEL_ID = ''; // 用於通知所有人
const PRIVATE_CHANNEL_ID = ''; // 用於通知管理員
const ADMIN_ROLE_ID = ''; // 管理員身分組ID
const APPROVED_ROLE_ID = ''; // 審核通過開發者身分組ID
const BOT_ROLE_ID = ''; // 審核通過Bot身分組ID

// 儲存提交的 Bot 資訊的檔案路徑
const submissionsFilePath = './submissions.json';

// 讀取現有的提交資料
let submissions = {};

// 嘗試從文件讀取現有的提交資料
if (fs.existsSync(submissionsFilePath)) {
    const data = fs.readFileSync(submissionsFilePath);
    submissions = JSON.parse(data);
}

client.once('ready', () => {
    console.log(`${client.user.tag} 已成功啟動！`);
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    const { commandName, options, guild } = interaction;

    // 提交 Bot 申請
    if (commandName === 'submit') {
        const botId = options.getString('bot_id');
        const description = options.getString('description');
        const inviteLink = options.getString('invite_link');
        const developerId = options.getString('developer_id');

        const submissionId = `${botId}-${Date.now()}`; // 生成唯一的提交 ID
        submissions[submissionId] = { botId, description, inviteLink, developerId };

        // 儲存資料到文件
        fs.writeFileSync(submissionsFilePath, JSON.stringify(submissions, null, 2));
        console.log('提交的 Bot 申請已保存，提交 ID:', submissionId); // 日誌輸出

        const developer = await guild.members.fetch(developerId).catch(() => null);
        if (!developer) {
            return interaction.reply({
                content: '無法找到開發者，請確認提供的 ID 是否正確。',
                ephemeral: true,
            });
        }

        // 傳送到公開頻道
        const publicChannel = guild.channels.cache.get(PUBLIC_CHANNEL_ID);
        if (publicChannel) {
            await publicChannel.send(
                `📢 **新的 Bot 申請：**\n- 開發者: <@${developerId}>\n- Bot: <@${botId}>\n- 描述: ${description}`
            );
        }

        // 傳送到私人頻道，並顯示提交資訊
        const privateChannel = guild.channels.cache.get(PRIVATE_CHANNEL_ID);
        if (privateChannel) {
            await privateChannel.send(
                `🔒 **新的 Bot 申請（管理員專用）：**\n- 提交 ID: ${submissionId}\n- 開發者: <@${developerId}>\n- Bot: <@${botId}>\n- 描述: ${description}\n- [邀請連結](${inviteLink})`
            );
        }

        // 私訊通知
        await developer.send(`您的 Bot 申請已提交，請等待審核（最多 2 天）。`).catch(() => {
            console.warn(`無法私訊申請人 <@${developerId}>。`);
        });

        return interaction.reply({ content: 'Bot 申請已提交！', ephemeral: true });
    }

    // 審核通過指令
    if (commandName === 'approve') {
        const submissionId = options.getString('submission_id');
        console.log('收到審核指令，提交 ID:', submissionId); // 日誌輸出

        const reason = options.getString('reason') || '未提供原因';
        const submission = submissions[submissionId];

        if (!submission) {
            console.log(`找不到該申請，提供的 submissionId: ${submissionId}`); // 日誌輸出
            return interaction.reply({ content: '找不到該申請，請確認 ID 是否正確。', ephemeral: true });
        }

        const { botId, developerId } = submission;
        const developer = await guild.members.fetch(developerId).catch(() => null);
        if (!developer) {
            return interaction.reply({ content: '無法找到開發者，請確認提供的 ID 是否正確。', ephemeral: true });
        }

        const bot = await guild.members.fetch(botId).catch(() => null);
        if (!bot) {
            return interaction.reply({ content: '無法找到該 Bot，請確認 Bot ID 是否正確。', ephemeral: true });
        }

        // 添加角色
        await developer.roles.add(APPROVED_ROLE_ID).catch(console.error);
        await bot.roles.add(BOT_ROLE_ID).catch(console.error);

        // 通知管理員和申請人
        await interaction.reply({
            content: `✅ 審核通過：<@${developerId}> 的 Bot <@${botId}>。\n原因：${reason}`,
        });
        await developer.send(`恭喜！您的 Bot 已通過審核。\n原因：${reason}`).catch(console.error);
    }

    // 駁回指令
    if (commandName === 'reject') {
        const submissionId = options.getString('submission_id');
        console.log('收到駁回指令，提交 ID:', submissionId); // 日誌輸出

        const reason = options.getString('reason') || '未提供原因';
        const submission = submissions[submissionId];

        if (!submission) {
            console.log(`找不到該申請，提供的 submissionId: ${submissionId}`); // 日誌輸出
            return interaction.reply({ content: '找不到該申請，請確認 ID 是否正確。', ephemeral: true });
        }

        const { botId, developerId } = submission;
        const developer = await guild.members.fetch(developerId).catch(() => null);
        if (!developer) {
            return interaction.reply({ content: '無法找到開發者，請確認提供的 ID 是否正確。', ephemeral: true });
        }

        // 通知管理員和申請人
        await interaction.reply({
            content: `❌ 駁回：<@${developerId}> 的 Bot <@${botId}>。\n原因：${reason}`,
        });
        await developer.send(`您的 Bot 申請未通過審核。\n原因：${reason}`).catch(console.error);
    }
});

client.login(process.env.DISCORD_TOKEN);
