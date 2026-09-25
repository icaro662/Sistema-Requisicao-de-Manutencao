export default () => ({ mail: { host: process.env.MAIL_HOST, port: Number(process.env.MAIL_PORT ?? 587), from: process.env.MAIL_FROM } });
