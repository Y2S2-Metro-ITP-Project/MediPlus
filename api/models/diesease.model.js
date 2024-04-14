import mongoose from "mongoose";

const dieseaseSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    description: {
        type: String,
    },
    symptoms: {
        type: String,
    },
    treatment: {
        type: String,
    },
    ICD10:{
        type: String,
        unique: true,
    },
});

const Dieseases = mongoose.model("Dieseases", dieseaseSchema);
export default Dieseases;