const http = require('http');
const Koa = require('koa');
const cors = require('koajs-cors');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const koaBody = require('koa-body');

const port = process.env.PORT || 7070;

const app = new Koa();

app.use(cors({
    origin: true
}));

app.use(koaBody({
    urlencoded: true,
}));

app.use(async (ctx, next) => {
    const requestMethod = ctx.request.method;
    const { method } = ctx.request.query;

    let rawData = fs.readFileSync('data/data.json');
    let data = rawData.toString() ? JSON.parse(rawData.toString()) : [];

    switch (requestMethod) {
        case 'GET':
            switch (method) {
                case 'allTickets':
                    ctx.response.body = data;
                    break;

                case 'ticketById':
                    const { id } = ctx.request.query;
                    const item = data.find((item) => item.id === id);
                    ctx.response.body = item;

                    break;
            }
            break;
        case 'POST':
            switch (method) {
                case 'createTicket':
                    const {name, description} = ctx.request.body;
                    const item = {
                        name,
                        description,
                        status: false,
                        created: Date.now(),
                        id: uuidv4(),
                    }
                    data.push(item);
                    fs.writeFile('data/data.json', JSON.stringify(data, null, 4), err => {
                        if (err) {
                            console.log(err);
                            return;
                        }
                    });

                    ctx.response.body = item;

                    break;

                case 'editTicket':
                    const {id} = ctx.request.body;
                    const index = data.findIndex((item) => item.id === id);
                    data[index] = ctx.request.body;
                    fs.writeFile('data/data.json', JSON.stringify(data, null, 4), err => {
                        if (err) {
                            console.log(err);
                            return;
                        }
                    });

                    ctx.response.body = ctx.request.body;

                    break;

            }
            break;

        case 'DELETE':
            if (method === 'deleteItem') {
                const { id } = ctx.request.query;
                const index = data.findIndex((item) => item.id === id);
                data.splice(index, 1);

                fs.writeFile('data/data.json', JSON.stringify(data, null, 4), err => {
                    if (err) {
                        console.log(err);
                        return;
                    }
                });

                ctx.response.body = true;
            }
            break;
    }
});

const server = http.createServer(app.callback()).listen(port);

