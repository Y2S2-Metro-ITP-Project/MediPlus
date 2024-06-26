import mongoose from 'mongoose';

const bedSchema = new mongoose.Schema(
  {
    number: {
      type: Number,
      required: true,
      unique: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    status:{
        type: String,
        default: "Available"
        },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
    },
    ward: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ward',
    },
  },
  { timestamps: true }
);

const Bed = mongoose.model('Bed', bedSchema);
export default Bed;
