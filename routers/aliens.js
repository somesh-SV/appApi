const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();
const table = require('../models/user');
const { createUser, userSignIn, uploadProfile, signOut } = require('../controllers/user');
const { validateUserSignUp, userValidation, validateUserSignIn } = require('../middlewares/validation/user');
const { isAuth } = require('../middlewares/auth');

const multer = require('multer');


const storage = multer.diskStorage({});

const fileFilter = (req,file,cb)=>{
    if(file.mimetype.startsWith('image')){
        cb(null,true);
    }else{
        cb('invalid image file',false);
    }
}

const uploads = multer({storage, fileFilter})

router.post('/create-user',validateUserSignUp,userValidation, createUser)

router.post('/sign-in',validateUserSignIn,userValidation, userSignIn)

router.post('/upload-profile',isAuth,uploads.single('profile'),uploadProfile)

router.get('/sign-out', isAuth, signOut)

router.get('/profile',isAuth,(req,res)=>{
    if(!req.user)
    return res.json({success: false,message: 'unauthorized access!'});
    res.json({
        success: true,
        profile: {
            fullname: req.user.fullname,
            email: req.user.email,
            avathar: req.user.avathar,
        }
    })
})

/*router.post('/create-post',isAuth, (req,res)=>{
    res.send('Welcome you')
})*/

router.get('/', async(req, res) => {
    try {
        const aliens = await table.find()
        res.json(aliens)
    } catch (err) {
        res.send('error' + err)
    }
})

router.get('/:id', async(req, res) => {
    try {
        const aliens = await table.findById(req.params.id)
        res.json(aliens)
    } catch (err) {
        res.send("Error" + err)
    }
})

router.delete('/', async(req, res) => {
    try {
        const aliens = await table.remove()
        res.json(aliens)
    } catch (err) {
        res.send('error' + err)
    }
})

router.delete('/:id', async(req, res) => {
    try {
        const aliens = await table.findByIdAndRemove(req.params.id)
        res.json(aliens)
    } catch (err) {
        res.send("Error" + err)
    }
})

router.put('/:id', async(req, res) => {
    try {
        const alien = await table.findById(req.params.id)
        alien.$set(req.body)
        const a1 = await alien.save()
        res.json(a1)
    } catch (err) {
        res.send("Error" + err)
    }
   /* var sender = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'demosndr@gmail.com', //svsomeshkumar@gmail.com
            pass: 'qwaefqtvztgujmoy' //plpwfbiipuutxmgk
        }
    });
    var to = req.body.Email;
    var tot = req.body.total;
    var avg = req.body.average;
    var composemail = {
        from: 'demosndr@gmail.com',
        to: to,
        subject: 'your result',
        text: ('Total : ' + tot + '\n') + ('Average : ' + avg)
    };

    sender.sendMail(composemail, (err, info) => {
        if (err) {
            console.log(err);
        } else {
            console.log("Mail sent successfully" + info.response);
        }
    })*/
})


module.exports = router;