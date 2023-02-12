const express = require('express');
const mongoose = require('mongoose');

const cors = require('cors');

const url = 'mongodb://localhost/login'

const app = express()

mongoose.connect(url, { useNewUrlParser: true })
const con = mongoose.connection


app.use(express.json())

app.use(cors({
    origin: '*',
}))

const userRouter = require('./routers/aliens')
app.use('/', userRouter)

con.on('open', () => {
    console.log('connected...');
})

app.listen(700, () => {
    console.log('server started')
})