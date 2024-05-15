import Supplier from "../models/Supplier.model.js";
import { errorHandler } from "../utils/error.js";


export const getSupplierData = async (req, res, next) => {
    if (!req.user.isAdmin && !req.user.isPharmacist) {
        return next(
            errorHandler(
                403,
                "You are not authorized to access this route"
            )
        );
    }
    
    try {
        const startIndex = parseInt(req.query.startIndex) || 0;
        const sortDirection = req.query.sortDirection === "asc" ? 1 : -1;
        const supplierData = await Supplier.find()
            .sort({ createdAt: sortDirection })
            .skip(startIndex);
        
        const totalSupplier = await Supplier.countDocuments();
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const lastWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        const todaySupplier = await Supplier.countDocuments({
            createdAt: {
                $gte: today,
            },
        });
        
        res.status(200).json({ supplierData, totalSupplier, todaySupplier });
    } catch (error) {
        next(errorHandler(500, "Internal server error"));
    }
};

export const addSupplierData = async (req, res, next) => {
  const { supplierName, supplierEmail, supplierPhone,itemName } = req.body;
  console.log(req.body);
  try {
    const existingItem = await Supplier.findOne({ supplierName });
    if (existingItem) {
      return next(errorHandler(409, 'Supplier already exists'));
    }

    const supplier = new Supplier({
        
      supplierName,
      supplierEmail,
      supplierPhone,
      itemName,
    });
    await supplier.save();

    res.status(201).json({ supplier });
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

export const deleteSupplierData = async (req, res, next) => {
    const { supplierId } = req.params;

    try {
        const deletedSupplier = await Supplier.findByIdAndDelete(supplierId);
        if (!deletedSupplier) {
            return next(errorHandler(404, "Supplier not found"));
        }
        res.status(200).json({ message: "Supplier deleted successfully" });
    } catch (error) {
        next(errorHandler(500, "Internal server error"));
    }
};

export const updateSupplierData = async (req, res, next) => {
    const { supplierId } = req.params;
    const { supplierName, supplierEmail, supplierPhone, itemName } = req.body;

    try {
        const updatedSupplier = await Supplier.findByIdAndUpdate(
            supplierId,
            { supplierName, supplierEmail, supplierPhone, itemName },
            { new: true }
        );
        if (!updatedSupplier) {
            return next(errorHandler(404, "Supplier not found"));
        }
        res.status(200).json({ supplier: updatedSupplier });
    } catch (error) {
        next(errorHandler(500, "Internal server error"));
    }
};

export const generateSupplierReport = async (req, res, next) => {
    // Implementation to generate a supplier report
};

export const getFilteredSupplierData = async (req, res, next) => {
    // Implementation to get filtered supplier data
    if (!req.user.isAdmin && !req.user.isPharmacist) {
        return next(
            errorHandler(
                403,
                "You are not authorized to access this route"
            )
        );
    } try {
        const { search, sortDirection, startIndex } = req.body;
        const supplierData = await Supplier.find({
            supplierName: {
                $regex: search,
                $options: "i",
            },
        })
            .sort({ createdAt: sortDirection })
            .skip(startIndex);
        const totalSupplier = await Supplier.countDocuments({
            supplierName: {
                $regex: search,
                $options: "i",
            },
        });
        res.status(200).json({ supplierData, totalSupplier });
    }

    
    catch (error) {
        next(errorHandler(500, "Internal server error"));
    }
}

