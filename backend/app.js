'use strict';

const Koa = require('koa');
const cors = require('@koa/cors');
const Router = require('@koa/router');
const body = require('koa-body');
const serve = require('koa-static');
const User = require('./src/service/user');
const Content = require('./src/service/Content');
const packageJson = require('./package.json');
const { sendWxpusherMessage } = require('./src/util/wxpusher'); // 引入 WxPusher 模块

// Create express instance
const app = new Koa();
const router = new Router();

const handler = async (ctx, next) => {
    try {
        await next();
    } catch (err) {
        console.log(err);
        ctx.status = 200;
        ctx.body = {
            code: err.status || err.statusCode || 500, msg: err.message,
        };
    }
};

app.use(serve('static'));
app.use(cors());
app.use(handler);
app.use(router.routes()).use(router.allowedMethods());

router.get('/api/status', (ctx) => {
    ctx.body = {
        code: 200, data: {
            version: packageJson.version,
        }, msg: 'Ninja is already.',
    };
});

// 用户注册，发送 WxPusher 通知
router.post('/api/register', body(), async (ctx) => {
    const user = new User(ctx.request.body);
    ctx.body = await user.register();

    // 发送 WxPusher 通知
    if (ctx.body.code === 200) { // 注册成功
        const uid = ctx.request.body.uid; // 获取用户的 WxPusher UID
        const content = `用户 ${user.username} 注册成功！`;
        sendWxpusherMessage(content, uid); // 发送通知
    }
});

// 其他路由
router.get('/api/info', async (ctx) => {
    ctx.body = await User.getPoolInfo();
});

router.post('/api/login', body(), async (ctx) => {
    ctx.body = await new User(ctx.request.body).login()
});

router.get('/api/userinfo', async (ctx) => {
    ctx.body = await new User({eid: ctx.query.eid, encryptUsername: ctx.query.encryptUsername}).getUserInfoByEid();
});

router.post('/api/delete', body(), async (ctx) => {
    ctx.body = await new User({eid: ctx.request.body.eid}).delUserByEid();
});

router.post('/api/update', body(), async (ctx) => {
    const body = ctx.request.body;
    const eid = body.eid;
    const username = body.username;
    const ck = body.ck;
    ctx.body = await new User({eid, ck, username}).update();
});

router.post('/api/disable', body(), async (ctx) => {
    const body = ctx.request.body;
    const eid = body.eid;
    ctx.body = await new User({eid}).disableEnv();
});

router.post('/api/enable', body(), async (ctx) => {
    const body = ctx.request.body;
    const eid = body.eid;
    ctx.body = await new User({eid}).enableEnv();
});

router.post('/api/verifyToken', body(), async (ctx) => {
    const body = ctx.request.body;
    const token = body.token;
    ctx.body = await new User({token}).verifyToken();
});

router.get('/api/getContent', async (ctx) => {
    ctx.body = await Content.getAllContent()
});

router.post('/api/setContent', body(), async (ctx) => {
    const body = ctx.request.body;
    ctx.body = Content.updateContent(body)
});

router.get('/api/getAllConfig', async (ctx) => {
    const query = ctx.query;
    const token = query.token;
    ctx.body = await new User({token}).getAllConfig();
});

router.post('/api/saveConfig', body(), async (ctx) => {
    const body = ctx.request.body;
    ctx.body = await new User({token: body.token}).saveConfig(body);
});

const port = process.env.NINJA_PORT || 5701;
console.log('Start Ninja success! listening port: ' + port);
app.listen(port);
