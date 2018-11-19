const express = require("express");
const path = require("path");
var bodyParser = require('body-parser')
const app = express();
const port = process.env.PORT || 8081;
const fs = require('fs');
let file = undefined;

// Serve any static files built by React
app.use(express.static(path.join(__dirname, "front-end/build")));

app.get("/", function(req, res) {
  res.sendFile(path.join(__dirname, "front-end/build", "index.html"));
});
app.use(bodyParser.urlencoded({
  extended: false
}))
app.use(bodyParser.json())



app.post("/", function(req, res){
  d = req.body.data;
  l = d.length;
  let array = new Uint8Array(l);
  for (var i = 0; i < l; i++){
      array[i] = d.charCodeAt(i);
  }
  file.write(array)
  res.send("success");
});
app.get("/end",function(req,res){
  file.end();
  res.send("success");
})

app.get("/create", function(req,res){
  let name = req.query.name;
  createFile(name);
  file.on('open', function(){
    res.send(true);
  })

})
function createFile(name){
  if(fs.existsSync('./uploads/'+name)){
    fs.unlinkSync('./uploads/'+name);
  }
  file = fs.createWriteStream('./uploads/'+name);
  
}
app.listen(port, () => console.log(`Listening on port ${port}`));