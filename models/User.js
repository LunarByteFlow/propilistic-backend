import mongoose from 'mongoose';
const { Schema,model } = mongoose;

const UserSchema = new Schema({
  name:{
    type : String,
    required:true,

  },
  password:{
    type : String,
    required:true,
  },
  email:{
    type : String,
    required:true,
    unique: true
  },
  date:{
    type : String,
    default : Date.now

  }
});
const UserModel = model('User',UserSchema);


export default UserModel;