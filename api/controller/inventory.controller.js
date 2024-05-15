import Inventory from "../models/inventory.model.js";
import generatePdfFromHtml from "../utils/PatientPDF.js";
import { sendEmail } from "../utils/email.js";
import { errorHandler } from "../utils/error.js";
import Supplier from "../models/Supplier.model.js";
export const getInventoryData = async (req, res) => {
  if (
    !req.user.isAdmin &&
    !req.user.isPharmacist &&
    !req.user.isReceptionist &&
    !req.user.isHeadNurse &&
    !req.user.isDoctor &&
    !req.user.isNurse
  ) {
    return next(
      errorHandler(
        403,
        "You are not allowed to access this route. Only Admin and Pharmacist can access this route"
      )
    );
  }
  try {
    const startIndex = parseInt(req.query.startIndex) || 0;
    const sortDirection = req.query.sortDirection === "asc" ? 1 : -1;
    const items = await Inventory.find()
      .sort({ createdAt: sortDirection })
      .skip(startIndex).populate("supplierId");

    const totalItems = await Inventory.countDocuments();
    const now = new Date();
    const oneMonthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );
    const lastMonthItems = await Inventory.countDocuments({
      createdAt: { $gte: oneMonthAgo },
    });
    const InstockItems = await Inventory.find({
      $expr: { $gt: ["$itemQuantity", "$itemMinValue"] },
    }).countDocuments();
    const lowStockItems = await Inventory.find({
      $expr: { $lte: ["$itemQuantity", "$itemMinValue"] },
    }).countDocuments();
    const expiredItems = await Inventory.find({
      $expr: { $lt: [{ $toDate: "$itemExpireDate" }, now] },
    }).countDocuments();
    const outOfStockItems = await Inventory.find({
      $expr: { $eq: ["$itemQuantity", 0] },
    }).countDocuments();
    const today = new Date();
    const oneMonthFromToday = new Date(today);
    oneMonthFromToday.setMonth(oneMonthFromToday.getMonth() + 1);

    const closeToExpireItems = await Inventory.find({
      $expr: {
        $and: [
          { $gte: [{ $toDate: "$itemExpireDate" }, today] }, // Expiry date is today or in the future
          { $lt: [{ $toDate: "$itemExpireDate" }, oneMonthFromToday] }, // Expiry date is within one month from today
        ],
      },
    });
    const lengthOfCloseToExpireItems = closeToExpireItems.length;

    res.status(200).json({
      items,
      totalItems,
      lastMonthItems,
      InstockItems,
      lowStockItems,
      expiredItems,
      outOfStockItems,
      closeToExpireItems,
      lengthOfCloseToExpireItems
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export const addInventoryData = async (req, res, next) => {
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
    itemCategory,
    itemDescription,
    itemPrice,
    itemQuantity,
    itemMinValue,
    itemImage,
    itemExpireDate,
    supplierId,
    supplierEmail,
    supplierPhone,
    supplierName,
  } = req.body;
  try {
    const existingItem = await Inventory.find({ itemName, supplierEmail });
    if (existingItem.length>0) {
      return next(errorHandler(400, "Item already exists"));
    }
    const inventory = new Inventory({
      itemName,
      itemCategory,
      itemDescription,
      itemPrice,
      itemQuantity,
      itemMinValue,
      itemImage,
      itemExpireDate,
      supplierName,
      supplierEmail,
      supplierPhone,
      supplierId,
    });
    const supplier=await Supplier.findById(supplierId);
    if(!supplier){
      return next(errorHandler(404, "Supplier not found"));
    }
    supplier.item.push(inventory._id);
    await supplier.save();
    await inventory.save();
    res.status(201).json({ inventory });
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

export const deleteInventoryData = async (req, res, next) => {
  if (!req.user.isAdmin && !req.user.isPharmacist) {
    return next(
      errorHandler(
        403,
        "You are not allowed to access this route. Only Admin and Pharmacist can access this route"
      )
    );
  }
  try {
    await Inventory.findByIdAndDelete(req.params.itemId);
    res.status(200).json({ message: "Inventory data deleted successfully" });
  } catch (error) {
    console.log(error);
  }
};

export const medicineInstock = async (req, res, next) => {
  if (
    !req.user.isAdmin &&
    !req.user.isPharmacist &&
    !req.user.isReceptionist &&
    !req.user.isHeadNurse &&
    !req.user.isDoctor &&
    !req.user.isNurse
  ) {
    return next(
      errorHandler(
        403,
        "You are not allowed to access this route. Only Admin and Pharmacist can access this route"
      )
    );
  }
  try {
    const currentDate = new Date();
    const items = await Inventory.find(
      {
        $expr: { $gt: ["$itemQuantity", "$itemMinValue"] },
        $expr: { $gte: [{ $toDate: "$itemExpireDate" }, currentDate] },
      },
      "itemName"
    );
    res.status(200).json({ items });
  } catch (error) {
    next(error);
  }
};

export const updateInventoryData = async (req, res) => {
  if (!req.user.isAdmin && !req.user.isPharmacist) {
    return next(
      errorHandler(
        403,
        "You are not allowed to access this route. Only Admin and Pharmacist can access this route"
      )
    );
  }
  try {
    const {
      itemName,
      itemCategory,
      itemDescription,
      itemPrice,
      itemQuantity,
      itemMinValue,
      itemImage,
      itemExpireDate,
      supplierId,
      supplierName,
      supplierEmail,
      supplierPhone,
    } = req.body;
    const itemExist = await Inventory.findOne({ itemName, supplierName });
    if (itemExist) {
      return next(errorHandler(400, "Item already exists"));
    }
    const inventory = await Inventory.findById(req.params.inventoryId);
    const supplierId1=inventory.supplierId;
    if (inventory) {
      const supplier = await Supplier.findById(supplierId1);
      supplier.item.pull(req.params.inventoryId);
      await supplier.save();
      const updatedInventoryItem = await Inventory.findByIdAndUpdate(
        req.params.inventoryId,
        {
          $set: {
            itemName,
            itemCategory,
            itemDescription,
            itemPrice,
            itemQuantity,
            itemMinValue,
            itemImage,
            itemExpireDate,
            supplierId,
            supplierName,
            supplierEmail,
            supplierPhone,
          },
        },
        { new: true }
      );
      if (!supplier) {
        return next(errorHandler(404, "Supplier not found"));
      }
      const supplier1=await Supplier.findById(supplierId);
      supplier1.item.push(updatedInventoryItem._id);
      await supplier1.save();
      res.status(200).json(updatedInventoryItem);
    } else {
      res.status(404).json({ message: "Inventory not found" });
    }
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

export const orderInventoryItem = async (req, res, next) => {
  if (!req.user.isAdmin && !req.user.isPharmacist) {
    return next(
      errorHandler(
        403,
        "You are not allowed to access this route. Only Admin and Pharmacist can access this route"
      )
    );
  }
  try {
    const item = await Inventory.findById(req.params.itemId);
    console.log(req.params.itemId);
    console.log(req.body);
    const itemName = item.itemName;
    const quantity = req.body.itemQuantity;
    const supplier = item.supplierName;
    const email = item.supplierEmail;
    res.status(200).json({ message: "Order sent successfully" });
    try {
      await sendEmail({
        to: email,
        subject: "Item Order From Ismails Pvt Hospital!",
        html: ` 
        <p>${supplier},</p>
        <p>We are requesting a stock of the following item:</p>
        <blockquote style="background-color: #f2f2f2; border-left: 5px solid #3498db; padding: 10px 20px; margin: 0; font-family: Arial, sans-serif; font-size: 16px;">
        <p style="margin: 0;">${itemName}</p>
      </blockquote>
      <p>The quantity we want is:</p>
      <blockquote style="background-color: #f2f2f2; border-left: 5px solid #3498db; padding: 10px 20px; margin: 0; font-family: Arial, sans-serif; font-size: 16px;">
      <p style="margin: 0;">${quantity} units</p>
    </blockquote>
        <p>Best regards,<br>Ismails Pvt Hospital</p>
        <p>For any inquiries, please contact us at <strong> 0758 123 456</strong></p>
        <P>This is an auto-generated email. Please do not reply to this email.</p>
      `,
      });
    } catch (error) {
      console.log(error);
    }
  } catch (error) {
    next(error);
  }
};

export const genrateInventoryReport = async (req, res, next) => {
  if (!req.user.isAdmin && !req.user.isPharmacist) {
    return next(
      errorHandler(
        403,
        "You are not allowed to access this route. Only Admin and Pharmacist can access this route"
      )
    );
  }
  try {
    // Retrieve all inventory items from the database
    const now = new Date();
    const oneMonthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );
    const inventoryItems = await Inventory.find();
    const totalItems = inventoryItems.length;
    const InstockItems = await Inventory.find({
      $expr: { $gt: ["$itemQuantity", "$itemMinValue"] },
    }).countDocuments();
    const lowStockItems = await Inventory.find({
      $expr: { $lte: ["$itemQuantity", "$itemMinValue"] },
    }).countDocuments();
    const expiredItems = await Inventory.find({
      $expr: { $lt: [{ $toDate: "$itemExpireDate" }, now] },
    }).countDocuments();
    const outOfStockItems = await Inventory.find({
      $expr: { $eq: ["$itemQuantity", 0] },
    }).countDocuments();
    const closeToExpireItems = await Inventory.find({
      $expr: { $lt: [{ $toDate: "$itemExpireDate" }, oneMonthAgo] },
    }).countDocuments();

    // Initialize the HTML content for the PDF
    let htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <title>Inventory Report</title>
          <style>
              body {
                font-family: Arial, sans-serif;
                margin: 20px;
              }
              .section {
                margin-bottom: 20px;
                border: 1px solid #ccc;
                padding: 15px;
                border-radius: 10px;
              }
              .section h2 {
                color: #555;
                margin-bottom: 10px;
              }
              .section p {
                color: #666;
                margin-bottom: 5px;
              }
              .section p strong {
                color: #333;
              }
              .stock-status-low {
                color: red;
              }
              .stock-status-normal {
                color: green;
              }
              .expiry-status-soon {
                color: orange;
              }
              .expiry-status-ok {
                color: black;
              }
              .summary {
                text-align: center;
                margin: 20px auto;
                padding: 10px;
                border: 2px solid #ccc;
                border-radius: 10px;
                background-color: #f2f2f2;
              }
              
          </style>
      </head>
      <body>
      <div class="summary">
      <h2><strong>Inventory Report Summary</strong></h2>
      <h2><strong>Total Items:</strong> ${totalItems}</h2>
      <h2><strong>In Stock Items:</strong> ${InstockItems}</h2>
      <h2><strong>Low Stock Items:</strong> ${lowStockItems}</h2>
      <h2><strong>Out of Stock Items:</strong> ${outOfStockItems}</h2>
      <h2><strong>Expired Items:</strong> ${expiredItems}</h2>
      <h2><strong>Close to Expiry Items:</strong> ${closeToExpireItems}</h2>
    </div>
    `;

    // Iterate through each inventory item
    inventoryItems.forEach((item) => {
      const {
        itemName,
        itemCategory,
        itemDescription,
        itemPrice,
        itemQuantity,
        itemMinValue,
        itemExpireDate,
        supplierName,
        supplierEmail,
      } = item;

      // Calculate stock status
      const stockStatusClass =
        itemQuantity <= itemMinValue
          ? "stock-status-low"
          : "stock-status-normal";
      const stockStatusText = itemQuantity <= itemMinValue ? "Low" : "Normal";

      // Calculate expiry status
      const expiryDate = new Date(itemExpireDate);
      const currentDate = new Date();
      const timeDifference = expiryDate.getTime() - currentDate.getTime();
      const daysUntilExpiry = Math.ceil(timeDifference / (1000 * 3600 * 24));
      const expiryStatusClass =
        daysUntilExpiry <= 30 ? "expiry-status-soon" : "expiry-status-ok";
      const expiryStatusText = daysUntilExpiry <= 30 ? "Soon" : "OK";

      // Append HTML content for each inventory item
      htmlContent += `
        <div class="section">
          <h2>Item: ${itemName}</h2>
          <p><strong>Category:</strong> ${itemCategory}</p>
          <p><strong>Description:</strong> ${itemDescription}</p>
          <p><strong>Price:</strong> ${itemPrice}</p>
          <p><strong>Quantity:</strong> ${itemQuantity} <span class="${stockStatusClass}">(${stockStatusText})</span></p>
          <p><strong>Expire Date:</strong> ${itemExpireDate} <span class="${expiryStatusClass}">(${expiryStatusText})</span></p>
          <p><strong>Supplier Name:</strong> ${supplierName}</p>
          <p><strong>Supplier Email:</strong> ${supplierEmail}</p>
        </div>
      `;
    });

    // Close the HTML content
    htmlContent += `</body></html>`;

    // Generate the PDF from HTML content
    const pdfBuffer = await generatePdfFromHtml(htmlContent);

    // Set response headers and send the PDF as a download
    res.set({
      "Content-Type": "application/pdf",
      "Content-Length": pdfBuffer.length,
      "Content-Disposition": 'attachment; filename="inventory-report.pdf"',
    });
    res.send(pdfBuffer);
  } catch (error) {
    // Handle errors
    res.status(500).json({ message: error.message });
  }
};

export const genrateExpairyInventoryReport = async (req, res, next) => {
  if (!req.user.isAdmin && !req.user.isPharmacist) {
    return next(
      errorHandler(
        403,
        "You are not allowed to access this route. Only Admin and Pharmacist can access this route"
      )
    );
  }
  try {
    // Retrieve all inventory items from the database
    const now = new Date();
    const oneMonthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );
    const inventoryItems = await Inventory.find();
    const totalItems = inventoryItems.length;
    const InstockItems = await Inventory.find({
      $expr: { $gt: ["$itemQuantity", "$itemMinValue"] },
    }).countDocuments();
    const lowStockItems = await Inventory.find({
      $expr: { $lte: ["$itemQuantity", "$itemMinValue"] },
    }).countDocuments();
    const expiredItems = await Inventory.find({
      $expr: { $lt: [{ $toDate: "$itemExpireDate" }, now] },
    });
    // Calculate total cost of expired items
    let totalCostExpiredItems = 0;
    expiredItems.forEach((item) => {
      totalCostExpiredItems += item.itemPrice * item.itemQuantity;
    });
    const totalExpreryItems = expiredItems.length;
    const outOfStockItems = await Inventory.find({
      $expr: { $eq: ["$itemQuantity", 0] },
    }).countDocuments();
    const closeToExpireItems = await Inventory.find({
      $expr: { $lt: [{ $toDate: "$itemExpireDate" }, oneMonthAgo] },
    }).countDocuments();

    // Initialize the HTML content for the PDF
    let htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <title>Inventory Report</title>
          <style>
              body {
                font-family: Arial, sans-serif;
                margin: 20px;
              }
              .section {
                margin-bottom: 20px;
                border: 1px solid #ccc;
                padding: 15px;
                border-radius: 10px;
              }
              .section h2 {
                color: #555;
                margin-bottom: 10px;
              }
              .section p {
                color: #666;
                margin-bottom: 5px;
              }
              .section p strong {
                color: #333;
              }
              .stock-status-low {
                color: red;
              }
              .stock-status-normal {
                color: green;
              }
              .expiry-status-soon {
                color: orange;
              }
              .expiry-status-ok {
                color: black;
              }
              .summary {
                text-align: center;
                margin: 20px auto;
                padding: 10px;
                border: 2px solid #ccc;
                border-radius: 10px;
                background-color: #f2f2f2;
              }
              
          </style>
      </head>
      <body>
      <div class="summary">
      <h2><strong>Expired Items Report Summary</strong></h2>
      <h2><strong>Total Items:</strong> ${totalExpreryItems}</h2>
      <h2><strong>Cost(LKR):</strong> ${totalCostExpiredItems}</h2>
    </div>
    `;

    // Iterate through each inventory item
    expiredItems.forEach((item) => {
      const {
        itemName,
        itemCategory,
        itemDescription,
        itemPrice,
        itemQuantity,
        itemMinValue,
        itemExpireDate,
        supplierName,
        supplierEmail,
      } = item;

      // Calculate stock status
      const stockStatusClass =
        itemQuantity <= itemMinValue
          ? "stock-status-low"
          : "stock-status-normal";
      const stockStatusText = itemQuantity <= itemMinValue ? "Low" : "Normal";

      // Calculate expiry status
      const expiryDate = new Date(itemExpireDate);
      const currentDate = new Date();
      const timeDifference = expiryDate.getTime() - currentDate.getTime();
      const daysUntilExpiry = Math.ceil(timeDifference / (1000 * 3600 * 24));
      const expiryStatusClass =
        daysUntilExpiry <= 30 ? "expiry-status-soon" : "expiry-status-ok";
      const expiryStatusText = daysUntilExpiry <= 30 ? "Soon" : "OK";

      // Append HTML content for each inventory item
      htmlContent += `
        <div class="section">
          <h2>Item: ${itemName}</h2>
          <p><strong>Category:</strong> ${itemCategory}</p>
          <p><strong>Description:</strong> ${itemDescription}</p>
          <p><strong>Price:</strong> ${itemPrice}</p>
          <p><strong>Quantity:</strong> ${itemQuantity} <span class="${stockStatusClass}">(${stockStatusText})</span></p>
          <p style="color: red; font-weight: bold;"><strong>Expire Date:</strong> ${itemExpireDate}</p>
          <p><strong>Supplier Name:</strong> ${supplierName}</p>
          <p><strong>Supplier Email:</strong> ${supplierEmail}</p>
        </div>
      `;
    });

    // Close the HTML content
    htmlContent += `</body></html>`;

    // Generate the PDF from HTML content
    const pdfBuffer = await generatePdfFromHtml(htmlContent);

    // Set response headers and send the PDF as a download
    res.set({
      "Content-Type": "application/pdf",
      "Content-Length": pdfBuffer.length,
      "Content-Disposition": 'attachment; filename="inventory-report.pdf"',
    });
    res.send(pdfBuffer);
  } catch (error) {
    // Handle errors
    res.status(500).json({ message: error.message });
  }
};

export const genrateInstockInventoryReport = async (req, res, next) => {
  if (!req.user.isAdmin && !req.user.isPharmacist) {
    return next(
      errorHandler(
        403,
        "You are not allowed to access this route. Only Admin and Pharmacist can access this route"
      )
    );
  }
  try {
    // Retrieve all inventory items from the database
    const now = new Date();
    const oneMonthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );
    const inventoryItems = await Inventory.find();
    const totalItems = inventoryItems.length;
    const InstockItems = await Inventory.find({
      $expr: { $gt: ["$itemQuantity", "$itemMinValue"] },
    });
    const totalInstockItems = InstockItems.length;
    const lowStockItems = await Inventory.find({
      $expr: { $lte: ["$itemQuantity", "$itemMinValue"] },
    }).countDocuments();
    const expiredItems = await Inventory.find({
      $expr: { $lt: [{ $toDate: "$itemExpireDate" }, now] },
    });
    // Calculate total cost of expired items
    let totalCostExpiredItems = 0;
    expiredItems.forEach((item) => {
      totalCostExpiredItems += item.itemPrice * item.itemQuantity;
    });
    const totalExpreryItems = expiredItems.length;
    const outOfStockItems = await Inventory.find({
      $expr: { $eq: ["$itemQuantity", 0] },
    }).countDocuments();
    const closeToExpireItems = await Inventory.find({
      $expr: { $lt: [{ $toDate: "$itemExpireDate" }, oneMonthAgo] },
    }).countDocuments();

    // Initialize the HTML content for the PDF
    let htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <title>Inventory Report</title>
          <style>
              body {
                font-family: Arial, sans-serif;
                margin: 20px;
              }
              .section {
                margin-bottom: 20px;
                border: 1px solid #ccc;
                padding: 15px;
                border-radius: 10px;
              }
              .section h2 {
                color: #555;
                margin-bottom: 10px;
              }
              .section p {
                color: #666;
                margin-bottom: 5px;
              }
              .section p strong {
                color: #333;
              }
              .stock-status-low {
                color: red;
              }
              .stock-status-normal {
                color: green;
              }
              .expiry-status-soon {
                color: orange;
              }
              .expiry-status-ok {
                color: black;
              }
              .summary {
                text-align: center;
                margin: 20px auto;
                padding: 10px;
                border: 2px solid #ccc;
                border-radius: 10px;
                background-color: #f2f2f2;
              }
              
          </style>
      </head>
      <body>
      <div class="summary">
      <h2><strong>InStock Items Report Summary</strong></h2>
      <h2><strong>Total Items:</strong> ${totalInstockItems}</h2>
    </div>
    `;

    // Iterate through each inventory item
    InstockItems.forEach((item) => {
      const {
        itemName,
        itemCategory,
        itemDescription,
        itemPrice,
        itemQuantity,
        itemMinValue,
        itemExpireDate,
        supplierName,
        supplierEmail,
      } = item;

      // Calculate stock status
      const stockStatusClass =
        itemQuantity <= itemMinValue
          ? "stock-status-low"
          : "stock-status-normal";
      const stockStatusText = itemQuantity <= itemMinValue ? "Low" : "Normal";

      // Calculate expiry status
      const expiryDate = new Date(itemExpireDate);
      const currentDate = new Date();
      const timeDifference = expiryDate.getTime() - currentDate.getTime();
      const daysUntilExpiry = Math.ceil(timeDifference / (1000 * 3600 * 24));
      const expiryStatusClass =
        daysUntilExpiry <= 30 ? "expiry-status-soon" : "expiry-status-ok";
      const expiryStatusText = daysUntilExpiry <= 30 ? "Soon" : "OK";

      // Append HTML content for each inventory item
      htmlContent += `
        <div class="section">
          <h2>Item: ${itemName}</h2>
          <p><strong>Category:</strong> ${itemCategory}</p>
          <p><strong>Description:</strong> ${itemDescription}</p>
          <p><strong>Price:</strong> ${itemPrice}</p>
          <p><strong>Quantity:</strong> ${itemQuantity} <span class="${stockStatusClass}">(${stockStatusText})</span></p>
          <p><strong>Expire Date:</strong> ${itemExpireDate} <span class="${expiryStatusClass}">(${expiryStatusText})</span></p>
          <p><strong>Supplier Name:</strong> ${supplierName}</p>
          <p><strong>Supplier Email:</strong> ${supplierEmail}</p>
        </div>
      `;
    });

    // Close the HTML content
    htmlContent += `</body></html>`;

    // Generate the PDF from HTML content
    const pdfBuffer = await generatePdfFromHtml(htmlContent);

    // Set response headers and send the PDF as a download
    res.set({
      "Content-Type": "application/pdf",
      "Content-Length": pdfBuffer.length,
      "Content-Disposition": 'attachment; filename="inventory-report.pdf"',
    });
    res.send(pdfBuffer);
  } catch (error) {
    // Handle errors
    res.status(500).json({ message: error.message });
  }
};

export const genrateLowStockInventoryReport = async (req, res, next) => {
  if (!req.user.isAdmin && !req.user.isPharmacist) {
    return next(
      errorHandler(
        403,
        "You are not allowed to access this route. Only Admin and Pharmacist can access this route"
      )
    );
  }
  try {
    // Retrieve all inventory items from the database
    const now = new Date();
    const oneMonthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );
    const inventoryItems = await Inventory.find();
    const totalItems = inventoryItems.length;
    const InstockItems = await Inventory.find({
      $expr: { $gt: ["$itemQuantity", "$itemMinValue"] },
    });
    const totalInstockItems = InstockItems.length;
    const lowStockItems = await Inventory.find({
      $expr: { $lte: ["$itemQuantity", "$itemMinValue"] },
    });
    const totalLowStockItems = lowStockItems.length;
    const expiredItems = await Inventory.find({
      $expr: { $lt: [{ $toDate: "$itemExpireDate" }, now] },
    });
    // Calculate total cost of expired items
    let totalCostExpiredItems = 0;
    expiredItems.forEach((item) => {
      totalCostExpiredItems += item.itemPrice * item.itemQuantity;
    });
    const totalExpreryItems = expiredItems.length;
    const outOfStockItems = await Inventory.find({
      $expr: { $eq: ["$itemQuantity", 0] },
    }).countDocuments();
    const closeToExpireItems = await Inventory.find({
      $expr: { $lt: [{ $toDate: "$itemExpireDate" }, oneMonthAgo] },
    }).countDocuments();

    // Initialize the HTML content for the PDF
    let htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <title>Inventory Report</title>
          <style>
              body {
                font-family: Arial, sans-serif;
                margin: 20px;
              }
              .section {
                margin-bottom: 20px;
                border: 1px solid #ccc;
                padding: 15px;
                border-radius: 10px;
              }
              .section h2 {
                color: #555;
                margin-bottom: 10px;
              }
              .section p {
                color: #666;
                margin-bottom: 5px;
              }
              .section p strong {
                color: #333;
              }
              .stock-status-low {
                color: red;
              }
              .stock-status-normal {
                color: green;
              }
              .expiry-status-soon {
                color: orange;
              }
              .expiry-status-ok {
                color: black;
              }
              .summary {
                text-align: center;
                margin: 20px auto;
                padding: 10px;
                border: 2px solid #ccc;
                border-radius: 10px;
                background-color: #f2f2f2;
              }
              
          </style>
      </head>
      <body>
      <div class="summary">
      <h2><strong>Low Stocks Items Report Summary</strong></h2>
      <h2><strong>Total Items:</strong> ${totalLowStockItems}</h2>
    </div>
    `;

    // Iterate through each inventory item
    lowStockItems.forEach((item) => {
      const {
        itemName,
        itemCategory,
        itemDescription,
        itemPrice,
        itemQuantity,
        itemMinValue,
        itemExpireDate,
        supplierName,
        supplierEmail,
      } = item;

      // Calculate stock status
      const stockStatusClass =
        itemQuantity <= itemMinValue
          ? "stock-status-low"
          : "stock-status-normal";
      const stockStatusText = itemQuantity <= itemMinValue ? "Low" : "Normal";

      // Calculate expiry status
      const expiryDate = new Date(itemExpireDate);
      const currentDate = new Date();
      const timeDifference = expiryDate.getTime() - currentDate.getTime();
      const daysUntilExpiry = Math.ceil(timeDifference / (1000 * 3600 * 24));
      const expiryStatusClass =
        daysUntilExpiry <= 30 ? "expiry-status-soon" : "expiry-status-ok";
      const expiryStatusText = daysUntilExpiry <= 30 ? "Soon" : "OK";

      // Append HTML content for each inventory item
      htmlContent += `
        <div class="section">
          <h2>Item: ${itemName}</h2>
          <p><strong>Category:</strong> ${itemCategory}</p>
          <p><strong>Description:</strong> ${itemDescription}</p>
          <p><strong>Price:</strong> ${itemPrice}</p>
          <p><strong>Quantity:</strong> ${itemQuantity} <span class="${stockStatusClass}">(${stockStatusText})</span></p>
          <p><strong>Expire Date:</strong> ${itemExpireDate} <span class="${expiryStatusClass}">(${expiryStatusText})</span></p>
          <p><strong>Supplier Name:</strong> ${supplierName}</p>
          <p><strong>Supplier Email:</strong> ${supplierEmail}</p>
        </div>
      `;
    });

    // Close the HTML content
    htmlContent += `</body></html>`;

    // Generate the PDF from HTML content
    const pdfBuffer = await generatePdfFromHtml(htmlContent);

    // Set response headers and send the PDF as a download
    res.set({
      "Content-Type": "application/pdf",
      "Content-Length": pdfBuffer.length,
      "Content-Disposition": 'attachment; filename="inventory-report.pdf"',
    });
    res.send(pdfBuffer);
  } catch (error) {
    // Handle errors
    res.status(500).json({ message: error.message });
  }
};

export const genrateOutOfStockInventoryReport = async (req, res, next) => {
  if (!req.user.isAdmin && !req.user.isPharmacist) {
    return next(
      errorHandler(
        403,
        "You are not allowed to access this route. Only Admin and Pharmacist can access this route"
      )
    );
  }
  try {
    // Retrieve all inventory items from the database
    const now = new Date();
    const oneMonthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );
    const inventoryItems = await Inventory.find();
    const totalItems = inventoryItems.length;
    const InstockItems = await Inventory.find({
      $expr: { $gt: ["$itemQuantity", "$itemMinValue"] },
    });
    const totalInstockItems = InstockItems.length;
    const lowStockItems = await Inventory.find({
      $expr: { $lte: ["$itemQuantity", "$itemMinValue"] },
    });
    const totalLowStockItems = lowStockItems.length;
    const expiredItems = await Inventory.find({
      $expr: { $lt: [{ $toDate: "$itemExpireDate" }, now] },
    });
    // Calculate total cost of expired items
    let totalCostExpiredItems = 0;
    expiredItems.forEach((item) => {
      totalCostExpiredItems += item.itemPrice * item.itemQuantity;
    });
    const totalExpreryItems = expiredItems.length;
    const outOfStockItems = await Inventory.find({
      $expr: { $eq: ["$itemQuantity", 0] },
    });
    const totalOutOfStockItems = outOfStockItems.length;
    const closeToExpireItems = await Inventory.find({
      $expr: { $lt: [{ $toDate: "$itemExpireDate" }, oneMonthAgo] },
    }).countDocuments();

    // Initialize the HTML content for the PDF
    let htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <title>Inventory Report</title>
          <style>
              body {
                font-family: Arial, sans-serif;
                margin: 20px;
              }
              .section {
                margin-bottom: 20px;
                border: 1px solid #ccc;
                padding: 15px;
                border-radius: 10px;
              }
              .section h2 {
                color: #555;
                margin-bottom: 10px;
              }
              .section p {
                color: #666;
                margin-bottom: 5px;
              }
              .section p strong {
                color: #333;
              }
              .stock-status-low {
                color: red;
              }
              .stock-status-normal {
                color: green;
              }
              .expiry-status-soon {
                color: orange;
              }
              .expiry-status-ok {
                color: black;
              }
              .summary {
                text-align: center;
                margin: 20px auto;
                padding: 10px;
                border: 2px solid #ccc;
                border-radius: 10px;
                background-color: #f2f2f2;
              }
              
          </style>
      </head>
      <body>
      <div class="summary">
      <h2><strong>Out Of Stock Items Report Summary</strong></h2>
      <h2><strong>Total Items:</strong> ${totalOutOfStockItems}</h2>
    </div>
    `;

    // Iterate through each inventory item
    outOfStockItems.forEach((item) => {
      const {
        itemName,
        itemCategory,
        itemDescription,
        itemPrice,
        itemQuantity,
        itemMinValue,
        itemExpireDate,
        supplierName,
        supplierEmail,
      } = item;

      // Calculate stock status
      const stockStatusClass =
        itemQuantity <= itemMinValue
          ? "stock-status-low"
          : "stock-status-normal";
      const stockStatusText = itemQuantity <= itemMinValue ? "Low" : "Normal";

      // Calculate expiry status
      const expiryDate = new Date(itemExpireDate);
      const currentDate = new Date();
      const timeDifference = expiryDate.getTime() - currentDate.getTime();
      const daysUntilExpiry = Math.ceil(timeDifference / (1000 * 3600 * 24));
      const expiryStatusClass =
        daysUntilExpiry <= 30 ? "expiry-status-soon" : "expiry-status-ok";
      const expiryStatusText = daysUntilExpiry <= 30 ? "Soon" : "OK";

      // Append HTML content for each inventory item
      htmlContent += `
        <div class="section">
          <h2>Item: ${itemName}</h2>
          <p><strong>Category:</strong> ${itemCategory}</p>
          <p><strong>Description:</strong> ${itemDescription}</p>
          <p><strong>Price:</strong> ${itemPrice}</p>
          <p><strong>Quantity:</strong> ${itemQuantity} <span class="${stockStatusClass}">(${stockStatusText})</span></p>
          <p><strong>Expire Date:</strong> ${itemExpireDate} <span class="${expiryStatusClass}">(${expiryStatusText})</span></p>
          <p><strong>Supplier Name:</strong> ${supplierName}</p>
          <p><strong>Supplier Email:</strong> ${supplierEmail}</p>
        </div>
      `;
    });

    // Close the HTML content
    htmlContent += `</body></html>`;

    // Generate the PDF from HTML content
    const pdfBuffer = await generatePdfFromHtml(htmlContent);

    // Set response headers and send the PDF as a download
    res.set({
      "Content-Type": "application/pdf",
      "Content-Length": pdfBuffer.length,
      "Content-Disposition": 'attachment; filename="inventory-report.pdf"',
    });
    res.send(pdfBuffer);
  } catch (error) {
    // Handle errors
    res.status(500).json({ message: error.message });
  }
};

export const genrateCloseToExpairyOfStockInventoryReport = async (
  req,
  res,
  next
) => {
  if (!req.user.isAdmin && !req.user.isPharmacist) {
    return next(
      errorHandler(
        403,
        "You are not allowed to access this route. Only Admin and Pharmacist can access this route"
      )
    );
  }
  try {
    // Retrieve all inventory items from the database
    const now = new Date();
    const oneMonthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );
    const inventoryItems = await Inventory.find();
    const totalItems = inventoryItems.length;
    const InstockItems = await Inventory.find({
      $expr: { $gt: ["$itemQuantity", "$itemMinValue"] },
    });
    const totalInstockItems = InstockItems.length;
    const lowStockItems = await Inventory.find({
      $expr: { $lte: ["$itemQuantity", "$itemMinValue"] },
    });
    const totalLowStockItems = lowStockItems.length;
    const expiredItems = await Inventory.find({
      $expr: { $lt: [{ $toDate: "$itemExpireDate" }, now] },
    });
    // Calculate total cost of expired items
    let totalCostExpiredItems = 0;
    expiredItems.forEach((item) => {
      totalCostExpiredItems += item.itemPrice * item.itemQuantity;
    });
    const totalExpreryItems = expiredItems.length;
    const outOfStockItems = await Inventory.find({
      $expr: { $eq: ["$itemQuantity", 0] },
    });
    const totalOutOfStockItems = outOfStockItems.length;
    const today = new Date();
    const oneMonthFromToday = new Date(today);
    oneMonthFromToday.setMonth(oneMonthFromToday.getMonth() + 1);

    const closeToExpireItems = await Inventory.find({
      $expr: {
        $and: [
          { $gte: [{ $toDate: "$itemExpireDate" }, today] }, // Expiry date is today or in the future
          { $lt: [{ $toDate: "$itemExpireDate" }, oneMonthFromToday] }, // Expiry date is within one month from today
        ],
      },
    });
    const lengthOfCloseToExpireItems = closeToExpireItems.length;

    // Initialize the HTML content for the PDF
    let htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <title>Inventory Report</title>
          <style>
              body {
                font-family: Arial, sans-serif;
                margin: 20px;
              }
              .section {
                margin-bottom: 20px;
                border: 1px solid #ccc;
                padding: 15px;
                border-radius: 10px;
              }
              .section h2 {
                color: #555;
                margin-bottom: 10px;
              }
              .section p {
                color: #666;
                margin-bottom: 5px;
              }
              .section p strong {
                color: #333;
              }
              .stock-status-low {
                color: red;
              }
              .stock-status-normal {
                color: green;
              }
              .expiry-status-soon {
                color: orange;
              }
              .expiry-status-ok {
                color: black;
              }
              .summary {
                text-align: center;
                margin: 20px auto;
                padding: 10px;
                border: 2px solid #ccc;
                border-radius: 10px;
                background-color: #f2f2f2;
              }
              
          </style>
      </head>
      <body>
      <div class="summary">
      <h2><strong>Close to expired Items Report Summary</strong></h2>
      <h2><strong>Total Items:</strong> ${lengthOfCloseToExpireItems}</h2>
    </div>
    `;

    // Iterate through each inventory item
    closeToExpireItems.forEach((item) => {
      const {
        itemName,
        itemCategory,
        itemDescription,
        itemPrice,
        itemQuantity,
        itemMinValue,
        itemExpireDate,
        supplierName,
        supplierEmail,
      } = item;

      // Calculate stock status
      const stockStatusClass =
        itemQuantity <= itemMinValue
          ? "stock-status-low"
          : "stock-status-normal";
      const stockStatusText = itemQuantity <= itemMinValue ? "Low" : "Normal";

      // Calculate expiry status
      const expiryDate = new Date(itemExpireDate);
      const currentDate = new Date();
      const timeDifference = expiryDate.getTime() - currentDate.getTime();
      const daysUntilExpiry = Math.ceil(timeDifference / (1000 * 3600 * 24));
      const expiryStatusClass =
        daysUntilExpiry <= 30 ? "expiry-status-soon" : "expiry-status-ok";
      const expiryStatusText = daysUntilExpiry <= 30 ? "Soon" : "OK";

      // Append HTML content for each inventory item
      htmlContent += `
        <div class="section">
          <h2>Item: ${itemName}</h2>
          <p><strong>Category:</strong> ${itemCategory}</p>
          <p><strong>Description:</strong> ${itemDescription}</p>
          <p><strong>Price:</strong> ${itemPrice}</p>
          <p><strong>Quantity:</strong> ${itemQuantity} <span class="${stockStatusClass}">(${stockStatusText})</span></p>
          <p><strong>Expire Date:</strong> ${itemExpireDate} <span class="${expiryStatusClass}">(${expiryStatusText})</span></p>
          <p><strong>Supplier Name:</strong> ${supplierName}</p>
          <p><strong>Supplier Email:</strong> ${supplierEmail}</p>
        </div>
      `;
    });

    // Close the HTML content
    htmlContent += `</body></html>`;

    // Generate the PDF from HTML content
    const pdfBuffer = await generatePdfFromHtml(htmlContent);

    // Set response headers and send the PDF as a download
    res.set({
      "Content-Type": "application/pdf",
      "Content-Length": pdfBuffer.length,
      "Content-Disposition": 'attachment; filename="inventory-report.pdf"',
    });
    res.send(pdfBuffer);
  } catch (error) {
    // Handle errors
    res.status(500).json({ message: error.message });
  }
};
export const getItemNames = async (req, res, next) => {
  try {
    const itemNames = await Inventory.distinct("itemName");
    res.status(200).json({ itemNames });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getFilteredInventoryData= async (req, res, next) => {
  if(!req.user.isAdmin && !req.user.isPharmacist){
    return next(errorHandler(403, "You are not allowed to access this route. Only Admin and Pharmacist can access this route"));
  }
  try {
    const status= req.body.status;
    if(status === "instock"){
      const InstockItems = await Inventory.find({
        $expr: { $gt: ["$itemQuantity", "$itemMinValue"] },
      })
      res.status(200).json({items: InstockItems})
    }
    if(status === "lowstock"){
      const lowStockItems = await Inventory.find({
        $expr: { $lte: ["$itemQuantity", "$itemMinValue"] },
      })
      res.status(200).json({items: lowStockItems})
    }
    if(status === "Outofstock"){
      const outOfStockItems = await Inventory.find({
        $expr: { $eq: ["$itemQuantity", 0] },
      })
      res.status(200).json({items: outOfStockItems})
    }
    if(status === "expired"){
      const now = new Date();
      const expiredItems = await Inventory.find({
        $expr: { $lt: [{ $toDate: "$itemExpireDate" }, now] },
      })
      res.status(200).json({items: expiredItems})
    }
    if(status === "closetoexpire"){
      const today = new Date();
      const oneMonthFromToday = new Date(today);
      oneMonthFromToday.setMonth(oneMonthFromToday.getMonth() + 1);
  
      const closeToExpireItems = await Inventory.find({
        $expr: {
          $and: [
            { $gte: [{ $toDate: "$itemExpireDate" }, today] }, // Expiry date is today or in the future
            { $lt: [{ $toDate: "$itemExpireDate" }, oneMonthFromToday] }, // Expiry date is within one month from today
          ],
        },
      });
      res.status(200).json({items: closeToExpireItems})
    }
  } catch (error) {
    res.status(500).json({ message: error.message }); 
  }
  
}
