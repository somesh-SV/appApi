const table = require('../models/user');
const sharp = require('sharp');
const jwt = require('jsonwebtoken');
const cloudinary = require('../helper/imageUpload');

exports.createUser = async (req, res) => {
    const { fullname, email, password } = req.body

    const isNewUser = await table.isThisEmailInUse(email)
    if (!isNewUser)
        return res.json({
            success: false,
            message: 'This email is already in use, try sign-in',
        });

    const alien = new table({
        fullname,
        email,
        password,
        /*fullname: req.body.fullname,
        email: req.body.email,
        password: req.body.password,*/
    })
    try {
        const user = await alien.save()
        res.json({ success: true, user })
    } catch (err) {
        res.send('Error' + err)
    }
    /*var sender = nodemailer.createTransport({
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
};

exports.userSignIn = async (req, res) => {

    const { email, password } = req.body
    const user = await table.findOne({ email })

    if (!user) return res.json({ success: false, message: 'user not found, with the given email' })

    const isMatch = await user.comparePassword(password)

    if (!isMatch) return res.json({ success: false, message: 'email / password dose not match' })

    const token = jwt.sign({ userId: user._id }, 'VERYsecret123', { expiresIn: '1d', });

    let oldTokens = table.tokens || []

    if (oldTokens.length) {
        const oldTokens = oldTokens.filter(t => {
            const timeDiff = Date.now() - parseInt(t.signedAt) / 1000
            if (timeDiff < 86400) {
                return t
            }
        })
    }

    await table.findByIdAndUpdate(user._id, { tokens: [...oldTokens, { token, signedAt: Date.now().toString() }] })

    const userInfo = {
        fullname: user.fullname,
        email: user.email,
        avathar: user.avathar ? user.avathar : '',
    }

    res.json({ success: true, user: userInfo, token })

};

exports.uploadProfile = async (req, res) => {
    const { user } = req

    if (!user) return res.status(401).json({ success: false, message: 'unauthorized access!' });

    try {
        const result = await cloudinary.uploader.upload(req.file.path, {
            public_id: `${user._id}_profile`,
            width: 500,
            height: 500,
            crop: 'fill'
        });
        //console.log(result.url);
        await table.findByIdAndUpdate(user._id, { avathar: result.url })
        res.status(201).json({ success: true, message: 'Your profile is updated' })
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error, try after some time' })
        console.log('Error while uploading profile image', error.message);
    }
}

exports.signOut = async(req,res) => {
    if(req.headers && req.headers.authorization){
        const token = req.headers.authorization.split('')[1];
        if(!token){
            return res.status(401).json({success: false, message: 'Authorization fail!'});
        }
        const tokens = req.user.tokens;

        const newTokens = tokens.filter(t => t.token != token)

        await table.findByIdAndUpdate(req.user._id, {tokens : newTokens})
        res.json({success: true, message: 'Sign out successfully'})
    }
}