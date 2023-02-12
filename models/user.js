const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    avathar: String,
    tokens: [{type: Object}]
});

userSchema.pre('save',function(next){
  if(this.isModified('password')){
    bcrypt.hash(this.password, 5,(err,hash)=>{
      if(err) return next(err);

      this.password = hash;
      next();
    })
  }
})

userSchema.methods.comparePassword = async function (password) {
  if(!password) throw new Error('Password is mission, can not compare!')

  try {
   const result =  await bcrypt.compare(password,this.password)
   return result;
  } catch (error) {
    console.log('Error while comparing password!', error.message);
  }
}

userSchema.statics.isThisEmailInUse = async function(email){
  if(!email) throw new Error('Invalid Email');
  try {
    const user = await this.findOne({email})
    if(user) return false

    return true
  } catch (error) {
    console.log('error inside isThisEmailInUse method',error.message);
    return false
  }
}


module.exports = mongoose.model('User', userSchema)