import createApp from "../app";
import fs from 'fs';
import path from 'path';
import https from 'https';

const certPath = path.resolve(__dirname, "../../../certs");

const sslOptions = {
  key: fs.readFileSync(path.join(certPath, "localhost-key.pem")),
  cert: fs.readFileSync(path.join(certPath, "localhost.pem")),
};

const app = createApp();
const port = process.env.PORT;

https.createServer(sslOptions, app).listen(port, () => {
  console.log(`Server running... Port:${port}`);
});
