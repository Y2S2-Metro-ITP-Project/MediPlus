import Patient from "../models/patient.model.js";
import Payment from "../models/payment.model.js";
import PaymentOrder from "../models/paymentOrder.model.js";
import generatePdfFromHtml from "../utils/PatientPDF.js";

export const getPaymentOrders = async (req, res) => {
  try {
    const paymentOrders = await PaymentOrder.aggregate([
        {
          $lookup: {
            from: "patients", // Assuming the name of the patient collection is "patients"
            localField: "PatientID",
            foreignField: "_id",
            as: "patient"
          }
        },
        {
          $match: {
            "patient.patientType": "Outpatient"
          }
        }
      ])
    const completedPaymentOrder = paymentOrders.filter(
      (paymentOrder) => paymentOrder.status === "Completed"
    ).length;
    const rejectedPaymentOrder = paymentOrders.filter(
      (paymentOrder) => paymentOrder.status === "Rejected"
    ).length;
    const pendingPaymentOrder = paymentOrders.filter(
      (paymentOrder) => paymentOrder.status === "Pending"
    ).length;
    const totalPaymentOrders = paymentOrders.length;
    const totalPaymentOrdersLastMonth = paymentOrders.filter(
      (paymentOrder) =>
        new Date(paymentOrder.date).getMonth() === new Date().getMonth() - 1
    ).length;
    const totalPaymentOrderRejectionLastMonth = paymentOrders.filter(
      (paymentOrder) =>
        new Date(paymentOrder.date).getMonth() === new Date().getMonth() - 1 &&
        paymentOrder.status === "Rejected"
    ).length;
    const totalPaymentOrdersCompletedLastMonth = paymentOrders.filter(
      (paymentOrder) =>
        new Date(paymentOrder.date).getMonth() === new Date().getMonth() - 1 &&
        paymentOrder.status === "Completed"
    ).length;
    res.status(200).json({
      paymentOrders,
      completedPaymentOrder,
      rejectedPaymentOrder,
      pendingPaymentOrder,
      totalPaymentOrders,
      totalPaymentOrdersLastMonth,
      totalPaymentOrderRejectionLastMonth,
      totalPaymentOrdersCompletedLastMonth,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getSpecificPaymentOrder = async (req, res) => {
  try {
    const paymentOrderID = req.params.id;
    const paymentOrder = await PaymentOrder.findById(paymentOrderID)
      .populate("PatientID")
      .populate("Payment");
    res.status(200).json(paymentOrder);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// Function to generate a unique invoice number
function generateInvoiceNumber() {
  // Logic to generate a unique invoice number
  // For example, you can concatenate a prefix with a timestamp
  const prefix = "INV";
  const timestamp = Date.now().toString();
  return prefix + timestamp;
}

// Function to get the current date
function getCurrentDate() {
  // Create a new Date object to get the current date and time
  const currentDate = new Date();
  // Format the date as desired (e.g., DD/MM/YYYY)
  const formattedDate = `${currentDate.getDate()}/${
    currentDate.getMonth() + 1
  }/${currentDate.getFullYear()}`;
  return formattedDate;
}
const formatDate = (dateOfBirth) => {
  const date = new Date(dateOfBirth);
  const options = { year: "numeric", month: "long", day: "numeric" };
  return date.toLocaleDateString("en-US", options);
};
export const generateInvoice = async (req, res) => {
  const paymentOrderID = req.params.id;
  try {
    const order = await PaymentOrder.findById(paymentOrderID)
      .populate("PatientID")
      .populate("Payment");
    let totalPayment = 0;
    order.Payment.forEach((payment) => {
      totalPayment += payment.totalPayment;
    });

    console.log("Total Payment:", totalPayment);
    const html = `
        <html>
            <head>
                <meta charset="utf-8">
                <title>Invoice</title>
                <link rel="stylesheet" href="style.css">
                <style>
                /* reset */

*
                    {
                        border: 0;
                        box-sizing: content-box;
                        color: inherit;
                        font-family: inherit;
                        font-size: inherit;
                        font-style: inherit;
                        font-weight: inherit;
                        line-height: inherit;
                        list-style: none;
                        margin: 0;
                        padding: 0;
                        text-decoration: none;
                        vertical-align: top;
                    }

                    /* content editable */

                    *[contenteditable] { border-radius: 0.25em; min-width: 1em; outline: 0; }

                    *[contenteditable] { cursor: pointer; }

                    *[contenteditable]:hover, *[contenteditable]:focus, td:hover *[contenteditable], td:focus *[contenteditable], img.hover { background: #DEF; box-shadow: 0 0 1em 0.5em #DEF; }

                    span[contenteditable] { display: inline-block; }

                    /* heading */

                    h1 { font: bold 100% sans-serif; letter-spacing: 0.5em; text-align: center; text-transform: uppercase; }

                    /* table */

                    table { font-size: 75%; table-layout: fixed; width: 100%; }
                    table { border-collapse: separate; border-spacing: 2px; }
                    th, td { border-width: 1px; padding: 0.5em; position: relative; text-align: left; }
                    th, td { border-radius: 0.25em; border-style: solid; }
                    th { background: #EEE; border-color: #BBB; }
                    td { border-color: #DDD; }

                    /* page */

                    html { font: 16px/1 'Open Sans', sans-serif; overflow: auto; padding: 0.5in; }
                    html { background: #999; cursor: default; }

                    body { box-sizing: border-box; height: 11in; margin: 0 auto; overflow: hidden; padding: 0.5in; width: 8.5in; }
                    body { background: #FFF; border-radius: 1px; box-shadow: 0 0 1in -0.25in rgba(0, 0, 0, 0.5); }

                    /* header */

                    header { margin: 0 0 3em; }
                    header:after { clear: both; content: ""; display: table; }

                    header h1 { background: #000; border-radius: 0.25em; color: #FFF; margin: 0 0 1em; padding: 0.5em 0; }
                    header address { float: left; font-size: 75%; font-style: normal; line-height: 1.25; margin: 0 1em 1em 0; }
                    header address p { margin: 0 0 0.25em; }
                    header span, header img { display: block; float: right; }
                    header span { margin: 0 0 1em 1em; max-height: 25%; max-width: 60%; position: relative; }
                    header img { max-height: 100%; max-width: 100%; }
                    header input { cursor: pointer; -ms-filter:"progid:DXImageTransform.Microsoft.Alpha(Opacity=0)"; height: 100%; left: 0; opacity: 0; position: absolute; top: 0; width: 100%; }

                    /* article */

                    article, article address, table.meta, table.inventory { margin: 0 0 3em; }
                    article:after { clear: both; content: ""; display: table; }
                    article h1 { clip: rect(0 0 0 0); position: absolute; }

                    article address { float: left; font-size: 125%; font-weight: bold; }

                    /* table meta & balance */

                    table.meta, table.balance { float: right; width: 36%; }
                    table.meta:after, table.balance:after { clear: both; content: ""; display: table; }

                    /* table meta */

                    table.meta th { width: 40%; }
                    table.meta td { width: 60%; }

                    /* table items */

                    table.inventory { clear: both; width: 100%; }
                    table.inventory th { font-weight: bold; text-align: center; }

                    table.inventory td:nth-child(1) { width: 26%; }
                    table.inventory td:nth-child(2) { width: 38%; }
                    table.inventory td:nth-child(3) { text-align: right; width: 12%; }
                    table.inventory td:nth-child(4) { text-align: right; width: 12%; }
                    table.inventory td:nth-child(5) { text-align: right; width: 12%; }

                    /* table balance */

                    table.balance th, table.balance td { width: 50%; }
                    table.balance td { text-align: right; }

                    /* aside */

                    aside h1 { border: none; border-width: 0 0 1px; margin: 0 0 1em; }
                    aside h1 { border-color: #999; border-bottom-style: solid; }

                    /* javascript */

                    .add, .cut
                    {
                        border-width: 1px;
                        display: block;
                        font-size: .8rem;
                        padding: 0.25em 0.5em;	
                        float: left;
                        text-align: center;
                        width: 0.6em;
                    }

                    .add, .cut
                    {
                        background: #9AF;
                        box-shadow: 0 1px 2px rgba(0,0,0,0.2);
                        background-image: -moz-linear-gradient(#00ADEE 5%, #0078A5 100%);
                        background-image: -webkit-linear-gradient(#00ADEE 5%, #0078A5 100%);
                        border-radius: 0.5em;
                        border-color: #0076A3;
                        color: #FFF;
                        cursor: pointer;
                        font-weight: bold;
                        text-shadow: 0 -1px 2px rgba(0,0,0,0.333);
                    }

                    .add { margin: -2.5em 0 0; }

                    .add:hover { background: #00ADEE; }

                    .cut { opacity: 0; position: absolute; top: 0; left: -1.5em; }
                    .cut { -webkit-transition: opacity 100ms ease-in; }

                    tr:hover .cut { opacity: 1; }

                    @media print {
                        * { -webkit-print-color-adjust: exact; }
                        html { background: none; padding: 0; }
                        body { box-shadow: none; margin: 0; }
                        span:empty { display: none; }
                        .add, .cut { display: none; }
                    }

                    @page { margin: 0; }
                    </style>
                <link rel="license" href="https://www.opensource.org/licenses/mit-license/">
                <script src="script.js"></script>
            </head>
            <body>
                <header>
                    <h1>Invoice</h1>
                    <address contenteditable>
                        <p>${order.PatientName}</p>
                        <p>${order.PatientID.address}</p>
                        <p>${order.PatientID.contactPhone}</p>
                        <p>${order.PatientID.contactEmail}</p>
                    </address>
                    <span><img alt="" src="http://www.jonathantneal.com/examples/invoice/logo.png"><input type="file" accept="image/*"></span>
                </header>
                <article>
                    <h1>Recipient</h1>
                    <address contenteditable>
                        <p>Ismails PVT Hospital</p>
                    </address>
                    <table class="meta">
                    <tr>
                    <th><span contenteditable>Invoice #</span></th>
                    <td><span contenteditable>${generateInvoiceNumber()}</span></td>
                </tr>
                <tr>
                    <th><span contenteditable>Date</span></th>
                    <td><span contenteditable>${getCurrentDate()}</span></td>
                </tr>
                <tr>
                    <th><span contenteditable>Amount Due</span></th>
                    <td><span id="prefix" contenteditable>LKR </span><span> ${totalPayment.toFixed(
                      2
                    )}</span></td>
                </tr>
                <tr>
                <th><span contenteditable>Payment Status</span></th>
                <td>
                  <span id="prefix" contenteditable style="color: ${
                    order.status === "Completed"
                      ? "green"
                      : order.status === "Pending"
                      ? "orange"
                      : "red"
                  }">${order.status}</span>
                </td>
              </tr>
              <tr>
              <th><span contenteditable>Payment Type</span></th>
              <td>
                  <span id="prefix" contenteditable></span>
                  <span style=${{
                    color:
                      order.paymentType === "card"
                        ? "blue"
                        : order.paymentType === "cash"
                        ? "green"
                        : order.paymentType === "insurance"
                        ? "orange"
                        : "black",
                  }}>
                      ${order.paymentType}
                  </span>
              </td>
          </tr>
                
                    </table>
                    <table class="inventory">
                        <thead>
                            <tr>
                            <th><span contenteditable>Date</span></th>
                                <th><span contenteditable>Order Type</span></th>
                                <th><span contenteditable>Price</span></th>
                            </tr>
                        </thead>
                        <tbody>
                        ${order.Payment.map((payment) => {
                          return `
                                <tr>
                                <td><span contenteditable>${formatDate(
                                  payment.dateAndTime
                                )}</span></td>
                                    <td><span contenteditable>${
                                      payment.OrderType
                                    }</span></td>
                                    <td><span data-prefix>LKR </span><span contenteditable>${
                                      payment.totalPayment
                                    }</span></td>
                                </tr>
                            `;
                        })}
                        </tbody>
                    </table>
                    <a class="add">+</a>
                    <table class="balance">
                        <tr>
                            <th><span contenteditable>Total</span></th>
                            <td><span data-prefix>LKR </span><span>${totalPayment}</span></td>
                        </tr>
                        <tr>
                        <th><span contenteditable>Amount Paid</span></th>
                        <td>
                          ${
                            order.status === "Completed"
                              ? `<span data-prefix>LKR </span><span contenteditable>${totalPayment}</span>`
                              : ""
                          }
                        </td>
                      </tr>
                      <tr>
                      <th><span contenteditable>Balance Due</span></th>
                      <td>
                        ${
                          order.status === "Completed"
                            ? `<span data-prefix>LKR </span><span>0.00</span>`
                            : `<span data-prefix>LKR </span><span>${totalPayment}</span>`
                        }
                      </td>
                    </tr>
                    
                    </table>
                </article>
                <aside>
                    <h1><span contenteditable>Additional Notes</span></h1>
                    <div contenteditable>
                        <p>A finance charge of 1.5% will be made on unpaid balances after 30 days.</p>
                    </div>
                </aside>
            </body>
        </html>`;
    const pdfBuffer = await generatePdfFromHtml(html);

    res.set({
      "Content-Type": "application/pdf",
      "Content-Length": pdfBuffer.length,
      "Content-Disposition": `attachment; filename="patient-prescription-order-report.pdf"`,
    });

    res.send(pdfBuffer);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const updatePaymentOrder = async (req, res) => {
  const paymentOrderID = req.params.id;
  const { paymentType } = req.body;
  try {
    await PaymentOrder.findByIdAndUpdate(paymentOrderID, {
      status: "Completed",
      paymentType: paymentType,
    });

    const paymentOrder = await PaymentOrder.findById(paymentOrderID);

    for (const paymentID of paymentOrder.Payment) {
      await Payment.findByIdAndUpdate(paymentID, { status: "Completed" });
    }

    res.status(200).json({ message: "Payment order updated successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const rejectPaymentOrder = async (req, res) => {
    const paymentOrderID = req.params.id;
    try {
        await PaymentOrder.findByIdAndUpdate(paymentOrderID, {
            status: "Rejected",
            paymentType: "Rejected",
          });
          const paymentOrder = await PaymentOrder.findById(paymentOrderID);

          for (const paymentID of paymentOrder.Payment) {
            await Payment.findByIdAndUpdate(paymentID, { status: "Rejected" });
          }
      
          res.status(200).json({ message: "Payment order rejected successfully." });
    } catch (error) {
        
    }
}