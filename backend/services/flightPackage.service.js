import FlightPackage from '../models/FlightPackage.js';
import Flight from '../models/Flight.js';
import Package from '../models/Package.js';

/**
 * FlightPackage Service - Business logic for flight-package linking
 */

class FlightPackageService {
    /**
     * Get all flight packages with optional filters
     */
    async getAllFlightPackages(filters = {}, pagination = {}) {
        const { page = 1, limit = 50, sort = '-createdAt' } = pagination;
        const query = {};

        // Build query
        if (filters.status) {
            query.status = filters.status;
        }

        if (filters.flight) {
            query.flight = filters.flight;
        }

        if (filters.package) {
            query.package = filters.package;
        }

        // Execute query with population
        const flightPackages = await FlightPackage.find(query)
            .populate({
                path: 'flight',
                populate: [
                    { path: 'airline', select: 'airlineName logo' },
                    { path: 'sector', select: 'sectorTitle fullSector' }
                ]
            })
            .populate('package')
            .sort(sort)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .lean();

        const total = await FlightPackage.countDocuments(query);

        return {
            flightPackages,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit),
                limit: parseInt(limit)
            }
        };
    }

    /**
     * Get flight package by ID
     */
    async getFlightPackageById(id) {
        const flightPackage = await FlightPackage.findById(id)
            .populate({
                path: 'flight',
                populate: [
                    { path: 'airline', select: 'airlineName logo' },
                    { path: 'sector', select: 'sectorTitle fullSector' }
                ]
            })
            .populate('package')
            .lean();

        if (!flightPackage) {
            throw new Error('Flight package not found');
        }

        return flightPackage;
    }

    /**
     * Get flight packages by flight ID
     */
    async getFlightPackagesByFlight(flightId) {
        return await FlightPackage.find({ flight: flightId })
            .populate('package')
            .populate({
                path: 'flight',
                populate: [
                    { path: 'airline', select: 'airlineName logo' },
                    { path: 'sector', select: 'sectorTitle fullSector' }
                ]
            })
            .lean();
    }

    /**
     * Get flight packages by package ID
     */
    async getFlightPackagesByPackage(packageId) {
        return await FlightPackage.find({ package: packageId })
            .populate({
                path: 'flight',
                populate: [
                    { path: 'airline', select: 'airlineName logo' },
                    { path: 'sector', select: 'sectorTitle fullSector' }
                ]
            })
            .populate('package')
            .lean();
    }

    /**
     * Create new flight package link
     */
    async createFlightPackage(data) {
        const { flight, package: packageId, remainingSlots, status } = data;

        // Validate flight exists
        const flightExists = await Flight.findById(flight);
        if (!flightExists) {
            throw new Error('Flight not found');
        }

        // Validate package exists
        const packageExists = await Package.findById(packageId);
        if (!packageExists) {
            throw new Error('Package not found');
        }

        // Check for existing link
        const existingLink = await FlightPackage.findOne({ flight, package: packageId });
        if (existingLink) {
            throw new Error('This package is already linked to this flight');
        }

        // Create the link
        const flightPackage = new FlightPackage({
            flight,
            package: packageId,
            remainingSlots: remainingSlots || 0,
            status: status || 'Active'
        });

        await flightPackage.save();

        // Return populated data
        return await this.getFlightPackageById(flightPackage._id);
    }

    /**
     * Update flight package
     */
    async updateFlightPackage(id, data) {
        const flightPackage = await FlightPackage.findById(id);
        if (!flightPackage) {
            throw new Error('Flight package not found');
        }

        const { flight, package: packageId, remainingSlots, status } = data;

        // Update flight if provided
        if (flight && flight !== flightPackage.flight.toString()) {
            const flightExists = await Flight.findById(flight);
            if (!flightExists) {
                throw new Error('Flight not found');
            }
            flightPackage.flight = flight;
        }

        // Update package if provided
        if (packageId && packageId !== flightPackage.package.toString()) {
            const packageExists = await Package.findById(packageId);
            if (!packageExists) {
                throw new Error('Package not found');
            }
            flightPackage.package = packageId;
        }

        // Check for duplicate if changed
        if (flight || packageId) {
            const checkFlight = flight || flightPackage.flight;
            const checkPackage = packageId || flightPackage.package;
            
            const existingLink = await FlightPackage.findOne({ 
                flight: checkFlight, 
                package: checkPackage,
                _id: { $ne: id }
            });
            
            if (existingLink) {
                throw new Error('This package is already linked to this flight');
            }
        }

        // Update other fields
        if (remainingSlots !== undefined) flightPackage.remainingSlots = remainingSlots;
        if (status) flightPackage.status = status;

        await flightPackage.save();

        // Return populated data
        return await this.getFlightPackageById(id);
    }

    /**
     * Delete flight package
     */
    async deleteFlightPackage(id) {
        const flightPackage = await FlightPackage.findByIdAndDelete(id);
        if (!flightPackage) {
            throw new Error('Flight package not found');
        }
        return { message: 'Flight package link deleted successfully' };
    }

    /**
     * Update remaining slots (for bookings)
     */
    async updateRemainingSlots(id, decrement) {
        const flightPackage = await FlightPackage.findById(id);
        if (!flightPackage) {
            throw new Error('Flight package not found');
        }

        if (decrement) {
            if (flightPackage.remainingSlots <= 0) {
                throw new Error('No slots available');
            }
            
            flightPackage.remainingSlots -= decrement;
            
            // Auto-update status if sold out
            if (flightPackage.remainingSlots === 0) {
                flightPackage.status = 'Sold Out';
            }
        }

        await flightPackage.save();
        return await this.getFlightPackageById(id);
    }

    /**
     * Get active flight packages for frontend display
     */
    async getActiveFlightPackages(filters = {}) {
        const query = { status: 'Active', remainingSlots: { $gt: 0 } };

        if (filters.packageType) {
            // We'll need to populate and filter afterwards
        }

        const flightPackages = await FlightPackage.find(query)
            .populate({
                path: 'flight',
                match: { departureDate: { $gte: new Date() } }, // Only future flights
                populate: [
                    { path: 'airline', select: 'airlineName logo' },
                    { path: 'sector', select: 'sectorTitle fullSector' }
                ]
            })
            .populate('package')
            .sort({ 'flight.departureDate': 1 })
            .lean();

        // Filter out any null flights (past dates)
        return flightPackages.filter(fp => fp.flight !== null);
    }
}

export default new FlightPackageService();
