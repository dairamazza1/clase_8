const express = require('express')
const multer = require('multer')
const fs = require('fs');

const { Router } = express;

let storage = multer.diskStorage({
    destination : function (req, file, cb){
        cb(null, 'uploads');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now())
    }
})

let upload = multer({storage: storage})
const app = express();

app.use(express.static('public'));
app.use('/custom/url', express.static(__dirname + '/public'));  //ruta q se agrega al html 

app.use(express.json()); //tiene q estar para qe se llene el req body
app.use(express.urlencoded({extended:true}))
const contenedor = require("./contenedor.js")
//const newContenedor = new Contenedor('productos.txt')

const router = Router();

app.use('/api', router);

router.get('/productos', (req,resp) => {
    const newContenedor = new contenedor('productos.txt');
    try{
            const prod = newContenedor.getAll().then( (obj) =>{     
            resp.send(obj);  
        }) 
    }catch(err){
        resp.status(500).send('No se pudieron obtener los productos')
    }   
}) 

router.get('/productos/:id', (req,resp) => {
    const newContenedor = new contenedor('productos.txt');
    try{       
        const id = parseInt(req.params.id);
        const prod = newContenedor.getByID(id).then((ret) => resp.send(ret))
    }catch(err){
        resp.status(500).send('No se encontró el producto')
    }   
}) 

router.post('/productos', (req,resp) => {
    const newContenedor = new contenedor('productos.txt');
    try{       
        const obj = {
            title: req.body.title,
            price: req.body.price,
            thumbnail: req.body.thumbnail 
        }        
        resp.send(newContenedor.save(obj));
    }catch(err){
        resp.status(500).send('No se puede cargar el producto')
    }   
}) 

router.put('/productos/:id', (req,resp) => {
    const newContenedor = new contenedor('productos.txt');
    const id = parseInt(req.params.id);
    try{
        const prodAux = newContenedor.updateByID(id,req.body)
         resp.send('Se actualizó correctamente');
    }catch(err){
        resp.status(500).send('No se puede actualizar el producto')
    }   
}) 
router.delete('/productos/:id', (req,resp) => {
    const newContenedor = new contenedor('productos.txt');
    try{       
        const id = parseInt(req.params.id);
        const prod = newContenedor.deleteByID(id)
    }catch(err){
        resp.status(500).send('No se encontró el producto')
    }   
}) 

app.get('/uploadfile', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
})
 

app.post('/uploadfile', upload.single('thumbnail'), (req, res, next) => {
    const file = req.file;
    if(!file) {
        const error = new Error('Se debe cargar un archivo');
        error.httpStatusCode = 400;
        return next(error);
    } 
    const obj = {
        title: req.body.name,
        price: req.body.price,
        thumbnail: file? req.file.filename : req.body.thumbnail 
    }

    const newContenedor = new contenedor('productos.txt');
    newContenedor.save(obj)

    res.send('Formulario completado con exito');
})

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const server = app.listen(8080, () => {
    console.log('La aplicacion esta escuchando');
})
