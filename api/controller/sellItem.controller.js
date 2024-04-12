import sellItem from "../models/sellItem.model.js";
import { errorHandler } from "../utils/error.js";

export const getSellItemData = async (req, res) => {
    if (!req.user.isAdmin && !req.user.isPharmacist) {
      return next(
        errorHandler(
          403,
          "You are not allowed to access this route. Only Admin and Pharmacist can access this route"
        )
      );
    }
    try {
        const startIndex = parseInt(req.query.startIndex) || 0;
        const limit = parseInt(req.query.limit) || 9;
        const sortDirection = req.query.sortDirection === "asc" ? 1 : -1;
        const items = await Inventory.find()
          .sort({ createdAt: sortDirection })
          .skip(startIndex)
          .limit(limit);
          const now = new Date();
        } catch (error) {
            next(error);
          }
        };  

  // Get sell item data
  export const addSellItemData= async (req, res) => {
    if (!req.user.isAdmin && !req.user.isPharmacist) {
      return next(
        errorHandler(
          403,
          "You are not allowed to access this route. Only Admin and Pharmacist can access this route"
        )
      );
    }
        const {
            itemName,
            itemPrice,
            itemQuantity,
            totalAmount
        } = req.body;
        try{
            const sellItem = new sellItem({
            itemName,
            itemPrice,
            itemQuantity,
            totalAmount 
            });
            await sellItem.save();
            res.status(201).json({ sellItem });
          } catch (error) {
            res.status(409).json({ message: error.message });
          }
        };

        export const deleteSellItemData = async (req, res) => {
            if (!req.user.isAdmin && !req.user.isPharmacist) {
              return next(
                errorHandler(
                  403,
                  "You are not allowed to access this route. Only Admin and Pharmacist can access this route"
                )
              );
            }
            try {
              await sellItem.findByIdAndDelete(req.params.itemId);
              res.status(200).json({ message: "Sell data deleted successfully" });
            } catch (error) {
              console.log(error);
            }
          };
          
          export const updateSellItemData = async (req, res) => {
            if (!req.user.isAdmin && !req.user.isPharmacist) {
              return next(
                errorHandler(
                  403,
                  "You are not allowed to access this route. Only Admin and Pharmacist can access this route"
                )
              );
            }
          }



    