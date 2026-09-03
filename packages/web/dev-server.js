import http from 'http';
import fs from 'fs';
import path from 'path';

const PORT = process.env.PORT || 5173;
const PUBLIC = path.resolve(process.cwd(), 'public');

function mime(filename){
  if(filename.endsWith('.html')) return 'text/html';
  if(filename.endsWith('.js')) return 'application/javascript';
  if(filename.endsWith('.css')) return 'text/css';
  if(filename.endsWith('.json')) return 'application/json';
  if(filename.endsWith('.png')) return 'image/png';
  return 'text/plain';
}

const server = http.createServer((req,res)=>{
  let url = req.url.split('?')[0];
  if(url === '/') url = '/index.html';
  const fpath = path.join(PUBLIC, url);
  fs.stat(fpath, (err, stat)=>{
    if(err){ res.statusCode = 404; res.end('Not found'); return; }
    res.setHeader('Content-Type', mime(fpath));
    const stream = fs.createReadStream(fpath);
    stream.pipe(res);
  });
});

server.listen(PORT, ()=>{
  console.log(`SHARP BOYZ web dev server serving ${PUBLIC} at http://localhost:${PORT}`);
});
