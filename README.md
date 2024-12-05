# 一個簡單的Discord Bot List - Discord Bot
沒有安裝網站經驗? 不妨使用這個保證簡單~
# 功能
![image](https://github.com/user-attachments/assets/5aef107d-e830-47af-be93-5348cdb34ea2)
# 安裝
```
npm init -y
npm install discord.js dotenv
```
新增一個`.env`<br>
```
DISCORD_TOKEN=
APPLICATION_ID=
GUILD_ID=
```
到`index.js`進行修改<br>
```
const PUBLIC_CHANNEL_ID = ''; // 用於通知所有人
const PRIVATE_CHANNEL_ID = ''; // 用於通知管理員
const ADMIN_ROLE_ID = ''; // 管理員身分組ID
const APPROVED_ROLE_ID = ''; // 審核通過開發者身分組ID
const BOT_ROLE_ID = ''; // 審核通過Bot身分組ID
```
全部設定完成後請先啟動`deploy-commands.js`(執行前先邀請Bot)
# 啟動
`node index.js`
# 權限
```
SEND_MESSAGES（发送消息）
MANAGE_MESSAGES（管理消息，删除消息）
VIEW_CHANNEL（查看频道）
MANAGE_CHANNELS（管理频道）
MANAGE_ROLES（管理角色）
```
