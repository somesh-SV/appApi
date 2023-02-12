const { check, validationResult } = require('express-validator');

exports.validateUserSignUp = [

    check('fullname')
    .trim()
    .not().isEmpty().withMessage('name is required')
    .not().isFloat().withMessage('must be a valid name!')
    .isLength({min: 3,max: 20})
    .withMessage('Name must be within 3 to 20 charactor!'),

    check('email')
    .normalizeEmail()
    .isEmail()
    .withMessage('Invalid Email'),

    check('password')
    .trim()
    .not().isEmpty().withMessage('Password is empty!')
    .isLength({min: 4,max: 20})
    .withMessage('password must be within 4 to 20 charactor!'),

    check('confirmPassword')
    .trim()
    .not().isEmpty().custom((value,{req})=>{
        if(value !== req.body.password){
            throw new Error('Both password must be same !')
        }
        return true;
    })
]
exports.userValidation = (req,res,next)=>{
    const result = validationResult(req).array()
    if(!result.length) return next();

    const error = result[0].msg;
    res.json({success: false,message: error})
}

exports.validateUserSignIn = [
    check('email').trim().isEmail().withMessage('email / password is required'),

    check('password').trim().not().isEmpty().withMessage('email / password is required'),
];

