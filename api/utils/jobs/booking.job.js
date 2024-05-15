import cron from "node-cron";
import Booking from "../../models/booking.model.js";
import { updateBookingStatus } from "../booking.utils.js";

cron.schedule("*/5 * * * *", async () => { // Change here for every 5 minutes
  try {
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000); // 5 minutes ago

    const pendingPaymentBookings = await Booking.find({
      status: "Pending Payment",
      updatedAt: { $lt: fiveMinutesAgo },
    });

    for (const booking of pendingPaymentBookings) {
      await updateBookingStatus(booking._id, "Not Booked");
    }
  } catch (error) {
    console.error("Error updating booking status:", error);
  }
});
