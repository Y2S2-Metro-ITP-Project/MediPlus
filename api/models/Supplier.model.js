import mongoose from "mongoose";

const  supplierSchema = new mongoose.Schema({
    supplierName: {
        type: String,
        required: true

    },
    supplierEmail: {
        type: String,
        required: true

    },
    supplierPhone: {
        type: String,
        required: true

    }
},{timestamps:true})

const Supplier = mongoose.model('Supplier', supplierSchema)
export default Supplier;