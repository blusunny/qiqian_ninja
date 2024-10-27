const axios = require('axios');

async function sendWxpusherMessage(content, uid) {
    const appToken = process.env.WXPUSHER_APP_TOKEN; // 从环境变量获取 App Token
    const url = "https://wxpusher.zjiecode.com/api/send/message";

    const data = {
        appToken,
        content,
        uids: [uid],
        contentType: 1
    };

    try {
        const response = await axios.post(url, data);
        return response.data;
    } catch (error) {
        console.error('WxPusher 发送失败:', error);
    }
}

module.exports = { sendWxpusherMessage };
