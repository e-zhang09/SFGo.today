const express = require('express');
const path = require('path');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const Fuse = require('fuse.js');
const airportsList = require(path.join(__dirname, 'public/res/airports-flat'));

let app = express();

app.use(compression());
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.json());       // to support JSON-encoded bodies
app.use(express.urlencoded({extended: true})); // to support URL-encoded bodies

app.use('/img', express.static(path.join(__dirname, 'img')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/public', express.static(path.join(__dirname, 'public')));

app.get('/home', (req, res) => {
    res.redirect('/');
});

app.get(['/', '/schedules', '/contact', '/rapid', '/frequent', '/careers', '/programs'], (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/bower_components/*/dist/*', (req, res)=>{
    res.sendFile(path.join(__dirname, req.path));
});

app.get('/api/airports/*', (req, res)=>{
    let fuzOptions  = {
        shouldSort: true,
        threshold: 0.4,
        location: 0,
        distance: 546,
        maxPatternLength: 32,
        minMatchCharLength: 1,
        keys: [
            "name", "iata"
        ]
    };
    let fuse = new Fuse(airportsList, fuzOptions ); // "list" is the item array
    let result = fuse.search(req.params[0]?req.params[0]:'sfo').slice(0,50);

    let resJson = {
        "success" : "true",
        "results": result
    };
    res.json(resJson);
});

let server = app.listen(process.env.PORT || 3000, function () {
    console.log('Listening on port ' + server.address().port);
});