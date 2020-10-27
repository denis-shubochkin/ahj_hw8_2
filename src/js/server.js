const http = require('http');
const Koa = require('koa');
const koaBody = require('koa-body');
const WS = require('ws');
// const uuid = require('uuid');
const Router = require('koa-router');

const users = [];
users.push('Den');
users.push('Maria');

const router = new Router();


const app = new Koa();

app.use(koaBody({
  urlencoded: true,
  multipart: true,
  json: true,
}));

// eslint-disable-next-line consistent-return
app.use(async (ctx, next) => {
  const origin = ctx.request.get('Origin');
  if (!origin) {
    // eslint-disable-next-line no-return-await
    return await next();
  }

  const headers = { 'Access-Control-Allow-Origin': '*' };

  if (ctx.request.method !== 'OPTIONS') {
    ctx.response.set({ ...headers });
    try {
      return await next();
    } catch (e) {
      e.headers = { ...e.headers, ...headers };
      throw e;
    }
  }

  if (ctx.request.get('Access-Control-Request-Method')) {
    ctx.response.set({
      ...headers,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH',
    });

    if (ctx.request.get('Allow-Control-Request-Headers')) {
      ctx.response.set('Access-Control-Allow-Headers', ctx.request.get('Allow-Control-Request-Headers'));
    }
    ctx.response.status = 204;
  }
});

app.use(async (ctx) => {
  if (ctx.request.method === 'GET') {
    ctx.response.body = users;
  } else if (ctx.request.method === 'POST') {
    users.push(ctx.request.body);
    ctx.response.body = 'пользователь добавлен';
  } else if (ctx.request.method === 'DELETE') {
    let i;
    users.forEach((el, index) => {
      if (el === ctx.request.body) {
        i = index;
      }
    });
    users.splice(i, 1);
    ctx.response.body = 'пользователь удален';
  }
});

// eslint-disable-next-line no-unused-vars
const port = process.env.PORT || 7070;
// eslint-disable-next-line no-unused-vars
const server = http.createServer(app.callback()).listen(port);
const wsServer = new WS.Server({ server });

wsServer.on('connection', (ws) => {
  const errCallback = (err) => {
    if (err) {
      console.log('error');
    }
  };

  ws.on('message', (msg) => {
    console.log(msg);
    Array.from(wsServer.clients)
      .filter((o) => o.readyState === WS.OPEN)
      .forEach((o) => o.send(msg, errCallback));
  });
  ws.on('close', (msg) => {
    console.log(msg);
    Array.from(wsServer.clients)
      .filter((o) => o.readyState === WS.OPEN)
      .forEach((o) => o.send(msg, errCallback));
  });
  // ws.send('welcome', errCallback);
});


app.use(router.routes()).use(router.allowedMethods());
