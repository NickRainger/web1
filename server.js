if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}
//const port = (3000)
const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const puppeteer = require('puppeteer')
const cheerio  = require('cheerio')
const fs = require('fs')

const initializePassport = require('./passport-config')
const { randomInt } = require('crypto')

initializePassport(
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
)

var users = require('./users.json', null, 2)
const supercool = []

app.set('view-engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
app.use(express.static("views"));
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

app.get('/', checkAuthenticated, (req, res) => {
    res.render('index.ejs', { name: req.user.name })
})
app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs')
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))

app.get('/register', checkNotAuthenticated, (req, res,) => {
    res.render('register.ejs', { err: false })
})

app.post('/register', checkNotAuthenticated, async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        supercool.push({
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        })

    } catch (err) {
    }
    console.log(req.body.email)
    var results = [];
    for (var i=0 ; i < users.length ; i++) {
        if (users[i]["email"] == req.body.email) {
            results.push(users[i]);
            console.log('allready in use');
            var inUse = true
            break;
        } else {
            var inUse = false
        }
    }
    if (inUse) {
        res.render('register.ejs', { err: 'user with that email allready exists' })
        //return done(null, false, { message: 'The password is incorrect'})
    } else {
        console.log('not in use')

        const usersCombined = JSON.stringify(users, null, 2) + JSON.stringify(supercool, null, 2)
        const usersWriteFile = usersCombined.replace("][", ",")

        fs.writeFile('users.json', usersWriteFile, finished)
        function finished(err) {
        }

        res.redirect('/login')
    }
})

app.delete('/logout', (req, res) => {
    req.logOut()
    res.redirect('/login')
})

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }

    res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/')
    }
    next()
}
//app.listen(port, () => console.info(`Listening on port ${port}...`))