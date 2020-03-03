const express = require('express');
const path = require('path');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const Fuse = require('fuse.js');
const airportsList = require(path.join(__dirname, 'public/res/airports-flat'));
const admin = require('firebase-admin');
const stringSimilarity = require('string-similarity');
const airlines = require(path.join(__dirname, 'public/res/airlines.json'));
const jobs = require(path.join(__dirname, 'public/res/jobs.json'));

const serviceAccount = require(path.join(__dirname, "secrets/wev-design-1920-firebase-adminsdk-1opaa-a70ea3673e.json"));

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://wev-design-1920.firebaseio.com"
});

const db = admin.firestore();
const users = db.collection('users');

const bcrypt = require('bcrypt');
const saltRounds = 10;

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

app.get('/bower_components/*/dist/*', (req, res) => {
    res.sendFile(path.join(__dirname, req.path));
});

app.get('/api/airports/*', (req, res) => {
    let fuzOptions = {
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
    let fuse = new Fuse(airportsList, fuzOptions); // "list" is the item array
    let result = fuse.search(req.params[0] ? req.params[0] : 'sfo').slice(0, 50);
    //
    // result.forEach(obj => {
    //     obj.text = (obj.value.substr(-5) +" " + obj.value.substring(0, obj.value.length - 5)).trim();
    // });

    let resJson = {
        "success": "true",
        "results": result
    };

    res.json(resJson);
});

app.post('/api/signin', (req, res) => {
    users.doc(req.body.email).get().then(doc => {
        if (!doc.exists) {
            res.setHeader('Content-Type', 'application/json');
            res.status(401);
            res.end(JSON.stringify({success: 'false'}));
        } else {
            let obj = doc.data();
            bcrypt.compare(req.body.password, obj.password, function (err, result) {
                if (result) {
                    res.setHeader('Content-Type', 'application/json');
                    res.status(200);
                    res.end(JSON.stringify({success: 'true', name: obj.name}));
                } else {
                    res.setHeader('Content-Type', 'application/json');
                    res.status(401);
                    res.end(JSON.stringify({success: 'false'}));
                }
            });
        }
    }).catch(err => {
        console.info(err);
        res.setHeader('Content-Type', 'application/json');
        res.status(401);
        res.end(JSON.stringify({success: 'false'}));
    });
});

app.post('/api/register', (req, res) => {
    bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
        users.doc(req.body.email).set({
            name: req.body.name, password: hash
        }).then(result => {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({success: 'true', name: req.body.name}));
        }).catch(err => {
            res.setHeader('Content-Type', 'application/json');
            res.status(500);
            res.end(JSON.stringify({success: 'false'}));
        });
    });

});

app.get('/api/flights', (req, res) => {
    let {src, dest, type, dates, num} = req.body.src;
    let startDate = new Date(dates.start);
    let ranNum = Math.floor(Math.random() * 4);
    if(type === 'rapid'){

    }else{

    }
    let similarity = stringSimilarity.compareTwoStrings(src.match(/\(([^)]+)\)/)[1], dest.match(/\(([^)]+)\)/)[1]);
    let start = 'a';
});

app.get('/api/jobs', (req, res) => {
    res.json(jobs);
});

app.get(['/privacy-policy', '/robot.txt', '/terms-of-service', '/sitemap.xml'], (req, res) => {
    if(!req.url.includes('.')){
        req.url += '.html';
    }
    res.sendFile(path.join(__dirname, req.url));
});

let server = app.listen(process.env.PORT || 3000, function () {
    console.log('Listening on port ' + server.address().port);
});