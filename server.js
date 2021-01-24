const http = require('http');
const fs = require('fs/promises')

const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {
    res.statusCode = 200;
    console.log(req.url);
    if(/^\/video\//.test(req.url)){
        fs.readFile('./player.html', 'utf8')
        .then((d)=>{
            res.end(d)
        })
        .catch((e)=>{
            res.end(e)
        })
    }
    else if(req.url.match(/^(\.\/)*(\/)*script/)!=null){
        res.setHeader('Content-Type', 'text/javascript')
        fs.readFile('./'+req.url, {encoding:'utf8'})
        .then((file)=>{
            res.end(file)
        })
        .catch(()=>{
            res.end()
        })
    }
    else if(/\.html$/.test(req.url)){
        res.setHeader('Content-Type', 'text/html')
        fs.readFile('./'+req.url, {encoding:'utf8'})
        .then((file)=>{
            res.end(file)
        })
        .catch(()=>{
            res.end()
        })
    }
    else{
        res.setHeader('Content-Type', 'text/html')
        fs.readFile('./'+req.url+"/index.html", {encoding:'utf8'})
        .then((file)=>{
            res.end(file)
        })
        .catch(()=>{
            res.end()
        })
    }
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});