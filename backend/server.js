import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import dbConnection from './config/db.js';
import groupTicketingRoutes from "./routes/groupTicketing.routes.js";
import authRoutes from "./routes/auth.routes.js";
import bankRoutes from "./routes/bank.routes.js";
import sectorRoutes from "./routes/sector.routes.js";
import airlineRoutes from "./routes/airline.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import bookingRoutes from "./routes/booking.routes.js";
import exportRoutes from "./routes/export.routes.js";
import roleRoutes from "./routes/role.routes.js";
import packageRoutes from "./routes/package.routes.js";
import hotelRoutes from "./routes/hotel.routes.js";
import flightRoutes from "./routes/flight.routes.js";
import flightPackageRoutes from "./routes/flightPackage.routes.js";
import visaRoutes from "./routes/visa.routes.js";
import tourRoutes from "./routes/tour.routes.js";
import testimonialRoutes from "./routes/testimonial.routes.js";
import contentRoutes from "./routes/content.routes.js";
import { startBookingExpiryJob } from './utils/bookingExpiryJob.js'
import helmet from "helmet";

const app = express();
dotenv.config();

// Connect to the database
dbConnection();

app.use(
  helmet({
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
    crossOriginEmbedderPolicy: false,
  })
);

app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001", "http://localhost:5173", "http://localhost:5174", "http://azan-e-madinah.com", "https://azan-e-madinah.com", "https://www.azan-e-madinah.com", "http://www.azan-e-madinah.com"],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'X-Active-Role'],
    exposedHeaders: ['Content-Type', 'Content-Disposition', 'Content-Length'],
    optionsSuccessStatus: 200,
    maxAge: 86400 // 24 hours
  })
);
// Increase body-parser limit for file uploads (base64 images)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());


app.use("/api/group-ticketing", groupTicketingRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/bank", bankRoutes);
app.use("/api/sector", sectorRoutes);
app.use("/api/airline", airlineRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/export", exportRoutes);
app.use("/api", roleRoutes);
app.use("/api/packages", packageRoutes);
app.use("/api/hotels", hotelRoutes);
app.use("/api/flights", flightRoutes);
app.use("/api/flight-packages", flightPackageRoutes);
app.use("/api/visas", visaRoutes);
app.use("/api/tours", tourRoutes);
app.use("/api/testimonials", testimonialRoutes);
app.use("/api/content", contentRoutes);

startBookingExpiryJob();

app.get('/', (req, res) => {
  res.send('AZAN-E-MADINA Travel API is running');
});

const PORT = process.env.PORT || 8007;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;