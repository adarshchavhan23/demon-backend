const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const frontendURI = process.env.FRONTEND_URI || '';

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
    origin: frontendURI,
    credentials: true
}))


// login
app.post('/api/login', async (req, res, next) => {

    const name = await jwt.sign({ name: req.body.name }, 'thesecret', {
        expiresIn: 30 * 24 * 60 * 60 * 1000
    })

    res.cookie('uname', name, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: false
    }).send({
        success: true,
        name: req.body.name,
        message: 'login successfully'
    })
})

// logout
app.post('/api/logout', (req, res, next) => {

    res.cookie('uname', null, {
        maxAge: 0,
        httpOnly: true,
        sameSite: false
    }).send({
        success: true,
        message: 'logout successfully'
    })
})


// profile
app.get('/api/me', async (req, res, next) => {
    try {
        const uname = await jwt.decode(req.cookies.uname, 'thesecret').name;
        return res.send({
            success: true,
            name: uname
        });
    } catch (err) {
        return res.status(401).send({
            success: false,
            message: 'user not logged'
        })
    }
});



//static files
app.use(express.static(path.join(__dirname, "./client/dist")));

app.get("*", function (req, res) {
    res.sendFile(path.join(__dirname, "./client/dist/index.html"));
});



app.listen(8080, () => {
    console.log('app is running ');
})