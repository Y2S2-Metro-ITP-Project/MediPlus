import mongoose from "mongoose"


const sampleOrderSchema = new mongoose.Schema(

    {
     testOrderId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "TestOrder"
      },


      testId: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "LabTest"
        },
      ],


      patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"Patient"
     
      },


      sampleType: {
        type: String,
        enum:["BLOOD","URINE","STOOL","SALIVA","MUCUS"],
        required: true,
        default:"MUCUS"
      },


      DoctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"User"
      
      },

      paymentComplete: {
        type: Boolean,
        default: false,
      },

      orderStages: {
        type: String,
        enums: [
          "awaitingPayment",
          "awaitingCollection",
          "processing",
        ],
        default: "awaitingPayment",
      },

    }


)