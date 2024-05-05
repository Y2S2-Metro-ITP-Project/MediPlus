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
    ward: { type: String, 
       enum: ['General', 'Emergency'] 
      },
      assignedStaff: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'EmployeeDetails' },

        assignedDoctor: { 
          type: mongoose.Schema.Types.ObjectId, ref: 'User'
         },

  },
  { timestamps: true }
);

const Bed = mongoose.model('Bed', bedSchema);
export default Bed;
