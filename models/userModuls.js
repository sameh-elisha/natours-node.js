const mongoose = require('mongoose');
// const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A user must have a name'],
      trim: true,
      maxlength: [40, 'A user name must have less or equal then 40 characters'],
      minlength: [2, 'A user name must have more or equal then 10 characters']
      // validate: [validator.isAlpha, 'Tour name must only contain characters']
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      required: 'Email address is required',
      match: [
        // eslint-disable-next-line no-useless-escape
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please fill a valid email address'
      ]
    },
    photo: String,
    password: {
      type: String,
      required: 'password is required',
      maxlength: [64, 'Password must have less or equal then 64 characters'],
      minlength: [8, 'Password must have more or equal then 8 characters'],
      select: false
    },
    confirmPassword: {
      type: String,
      validate: {
        validator: function(val) {
          // this only points to current doc on NEW document creation
          return val === this.password;
        },
        message: 'Password is different!'
      }
    },
    passwordChangedAt: {
      type: Date
    },
    role: {
      type: String,
      enum: ['admin', 'user', 'lead-guide', 'guide'],
      default: 'user'
    },
    passwordRestToken: {
      type: String
    },
    passwordResetExpires: {
      type: Date
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;
  next();
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  console.log(this.passwordChangedAt);
  next();
});
userSchema.methods.correctPassword = async function(
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};
userSchema.methods.changedPasswordAfter = async function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return changedTimestamp > JWTTimestamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function() {
  const restToken = crypto.randomBytes(32).toString('hex');
  this.passwordRestToken = crypto
    .createHash('sha256')
    .update(restToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return restToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
