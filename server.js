const http = require('http');
const Koa = require('koa');
const koaBody = require('koa-body');
const Router = require('koa-router');
const cors = require('koa2-cors');
const uuidv4 = require('uuid/v4');

const app = new Koa();
const router = new Router({
  prefix: '/tickets'
});

app.use(koaBody({
  urlencoded: true,
  multipart: true,
}));


app.use(cors({
  origin: '*',
}));

app
  .use(router.routes())
  .use(router.allowedMethods());

const ticketsFull = [];

class TicketFull {
  constructor(id, name, description, created) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.status = false;
    this.created = created;
  }
}

class Ticket {
  constructor(id, name, status, created) {
    this.id = id;
    this.name = name;
    this.status = status;
    this.created = created;
  }
}

for (let i = 0; i < 5; i++) {
  let date = new Date();
  date = date.toString();
  date = date.slice(4, 24);
  ticketsFull.push(new TicketFull(uuidv4(), 'testTicket' + i, 'text', date));
}

/**
 * GET /tickets - список тикетов
 * GET /tickets/:id - полное описание тикета (где :id - идентификатор тикета)
 * POST /tickets - создания тикета (id генерируется на сервере)
 * PUT /tickets - обновление тикета (id берётся из тела запроса)
 * PATCH /tickets/:id - изменение статуса тикета (id и статус берутся из тела запроса)
 * DELETE /tickets/:id - удаление тикета
 */

router
  .get('/', (ctx, next) => {
    const tickets = [];
    ticketsFull.forEach((item) => {
      let newItem = new Ticket(item.id, item.name, item.status, item.created);
      tickets.push(newItem);
      })
    ctx.response.body = JSON.stringify(tickets);
  })
  .get('/:id', (ctx, next) => {
    const ticket = ticketsFull.find((elem) => elem.id === ctx.params.id);
    ctx.response.body = JSON.stringify(ticket);
    console.log(ctx.response.body)
  })
  .post('/', (ctx, next) => {
    const name = ctx.request.body.name;
    const description = ctx.request.body.description;
    const id = uuidv4();
    let date = new Date();
    date = date.toString().slice(4, 24);
    const created = date;
    ticketsFull.push(new TicketFull(id, name, description, created));
    ctx.response.status = 204;
  })
  .put('/:id', (ctx, next) => {
    const index = ticketsFull.findIndex((elem) => elem.id === ctx.params.id);
    ticketsFull[index].status = !ticketsFull[index].status;
    ctx.response.status = 204;
  })
  .patch('/:id', (ctx, next) => {
    const ticket = ticketsFull.find((elem) => elem.id === ctx.params.id);
    ticket.name = ctx.request.body.name;
    ticket.description = ctx.request.body.description;
    ctx.response.status = 204;
  })
  .delete('/:id', (ctx, next) => {
    const index = ticketsFull.findIndex((elem) => elem.id === ctx.params.id);
    ticketsFull.splice(index, 1);
    ctx.response.status = 204;
  });

const port = process.env.PORT || 7070;
const server = http.createServer(app.callback()).listen(port);
