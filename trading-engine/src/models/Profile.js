import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema({
  name: {
    type:String,
    required: true,
    unique:true
  },
  description: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ["insider_mirror", "bulk_mirror", "sma_crossover", "breakout"],
  },
  params: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  instrumentScope: {
    type: mongoose.Schema.Types.Mixed, 
    required:true
  },
  active:{
    type: Boolean,
    default: true
  }
},{timestamps:true})

const Profile = mongoose.model('Profile', profileSchema);
export default Profile;