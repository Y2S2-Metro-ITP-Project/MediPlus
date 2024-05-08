import cron from "node-cron";
import Booking from "../../models/booking.model.js";
import { updateBookingStatus } from "../booking.utils.js";

cron.schedule("*/30 * * * * *", async () => {
  try {
    const now = new Date();
    const thirtySecondsAgo = new Date(now.getTime() - 30 * 1000); // 30 seconds ago

    const pendingPaymentBookings = await Booking.find({
      status: "Pending Payment",
      updatedAt: { $lt: thirtySecondsAgo },
    });

    for (const booking of pendingPaymentBookings) {
      await updateBookingStatus(booking._id, "Not Booked");
    }
  } catch (error) {
    console.error("Error updating booking status:", error);
  }
});
