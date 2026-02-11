import FlightPackage from '../models/FlightPackage.js';
import Flight from '../models/Flight.js';
import Package from '../models/Package.js';

// Get all flight packages with filters
export const getAllFlightPackages = async (req, res) => {
    try {
        const { status, packageType, page = 1, limit = 50 } = req.query;
        const query = {};

        // Status filter
        if (status) {
            query.status = status;
        }

        const flightPackages = await FlightPackage.find(query)
            .populate({
                path: 'flight',
                populate: [
                    { path: 'airline', select: 'airlineName logo' },
                    { path: 'sector', select: 'sectorTitle fullSector' }
                ]
            })
            .populate('package')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        // Filter by package type if provided
        let filteredPackages = flightPackages;
        if (packageType) {
            filteredPackages = flightPackages.filter(fp => 
                fp.package && fp.package.type === packageType
            );
        }

        const count = await FlightPackage.countDocuments(query);

        res.status(200).json({
            flightPackages: filteredPackages,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count
        });
    } catch (error) {
        console.error('Error fetching flight packages:', error);
        res.status(500).json({ 
            message: 'Error fetching flight packages', 
            error: error.message 
        });
    }
};

// Get single flight package by ID
export const getFlightPackageById = async (req, res) => {
    try {
        const flightPackage = await FlightPackage.findById(req.params.id)
            .populate({
                path: 'flight',
                populate: [
                    { path: 'airline', select: 'airlineName logo' },
                    { path: 'sector', select: 'sectorTitle fullSector' }
                ]
            })
            .populate('package');

        if (!flightPackage) {
            return res.status(404).json({ message: 'Flight package not found' });
        }

        res.status(200).json({ flightPackage });
    } catch (error) {
        console.error('Error fetching flight package:', error);
        res.status(500).json({ 
            message: 'Error fetching flight package', 
            error: error.message 
        });
    }
};

// Get flight packages by flight ID
export const getFlightPackagesByFlight = async (req, res) => {
    try {
        const flightPackages = await FlightPackage.find({ flight: req.params.flightId })
            .populate('package')
            .populate({
                path: 'flight',
                populate: [
                    { path: 'airline', select: 'airlineName logo' },
                    { path: 'sector', select: 'sectorTitle fullSector' }
                ]
            });

        res.status(200).json({ flightPackages });
    } catch (error) {
        console.error('Error fetching flight packages by flight:', error);
        res.status(500).json({ 
            message: 'Error fetching flight packages', 
            error: error.message 
        });
    }
};

// Get flight packages by package ID
export const getFlightPackagesByPackage = async (req, res) => {
    try {
        const flightPackages = await FlightPackage.find({ package: req.params.packageId })
            .populate({
                path: 'flight',
                populate: [
                    { path: 'airline', select: 'airlineName logo' },
                    { path: 'sector', select: 'sectorTitle fullSector' }
                ]
            })
            .populate('package');

        res.status(200).json({ flightPackages });
    } catch (error) {
        console.error('Error fetching flight packages by package:', error);
        res.status(500).json({ 
            message: 'Error fetching flight packages', 
            error: error.message 
        });
    }
};

// Create new flight package
export const createFlightPackage = async (req, res) => {
    try {
        const { flight, package: packageId, remainingSlots, status } = req.body;

        // Validate flight exists
        const flightExists = await Flight.findById(flight);
        if (!flightExists) {
            return res.status(404).json({ message: 'Flight not found' });
        }

        // Validate package exists
        const packageExists = await Package.findById(packageId);
        if (!packageExists) {
            return res.status(404).json({ message: 'Package not found' });
        }

        // Check if this combination already exists
        const existingLink = await FlightPackage.findOne({ flight, package: packageId });
        if (existingLink) {
            return res.status(400).json({ 
                message: 'This package is already linked to this flight' 
            });
        }

        const flightPackage = new FlightPackage({
            flight,
            package: packageId,
            remainingSlots: remainingSlots || 0,
            status: status || 'Active'
        });

        await flightPackage.save();

        const populatedFlightPackage = await FlightPackage.findById(flightPackage._id)
            .populate({
                path: 'flight',
                populate: [
                    { path: 'airline', select: 'airlineName logo' },
                    { path: 'sector', select: 'sectorTitle fullSector' }
                ]
            })
            .populate('package');

        res.status(201).json({ 
            message: 'Flight package link created successfully',
            flightPackage: populatedFlightPackage 
        });
    } catch (error) {
        console.error('Error creating flight package:', error);
        if (error.code === 11000) {
            return res.status(400).json({ 
                message: 'This package is already linked to this flight' 
            });
        }
        res.status(500).json({ 
            message: 'Error creating flight package', 
            error: error.message 
        });
    }
};

// Update flight package
export const updateFlightPackage = async (req, res) => {
    try {
        const { flight, package: packageId, remainingSlots, status } = req.body;

        const flightPackage = await FlightPackage.findById(req.params.id);
        if (!flightPackage) {
            return res.status(404).json({ message: 'Flight package not found' });
        }

        // If flight or package is being changed, validate they exist
        if (flight && flight !== flightPackage.flight.toString()) {
            const flightExists = await Flight.findById(flight);
            if (!flightExists) {
                return res.status(404).json({ message: 'Flight not found' });
            }
            flightPackage.flight = flight;
        }

        if (packageId && packageId !== flightPackage.package.toString()) {
            const packageExists = await Package.findById(packageId);
            if (!packageExists) {
                return res.status(404).json({ message: 'Package not found' });
            }
            flightPackage.package = packageId;
        }

        // Check for duplicate if flight or package changed
        if (flight || packageId) {
            const checkFlight = flight || flightPackage.flight;
            const checkPackage = packageId || flightPackage.package;
            
            const existingLink = await FlightPackage.findOne({ 
                flight: checkFlight, 
                package: checkPackage,
                _id: { $ne: req.params.id }
            });
            
            if (existingLink) {
                return res.status(400).json({ 
                    message: 'This package is already linked to this flight' 
                });
            }
        }

        if (remainingSlots !== undefined) flightPackage.remainingSlots = remainingSlots;
        if (status) flightPackage.status = status;

        await flightPackage.save();

        const populatedFlightPackage = await FlightPackage.findById(flightPackage._id)
            .populate({
                path: 'flight',
                populate: [
                    { path: 'airline', select: 'airlineName logo' },
                    { path: 'sector', select: 'sectorTitle fullSector' }
                ]
            })
            .populate('package');

        res.status(200).json({ 
            message: 'Flight package updated successfully',
            flightPackage: populatedFlightPackage 
        });
    } catch (error) {
        console.error('Error updating flight package:', error);
        res.status(500).json({ 
            message: 'Error updating flight package', 
            error: error.message 
        });
    }
};

// Delete flight package
export const deleteFlightPackage = async (req, res) => {
    try {
        const flightPackage = await FlightPackage.findByIdAndDelete(req.params.id);

        if (!flightPackage) {
            return res.status(404).json({ message: 'Flight package not found' });
        }

        res.status(200).json({ 
            message: 'Flight package link deleted successfully' 
        });
    } catch (error) {
        console.error('Error deleting flight package:', error);
        res.status(500).json({ 
            message: 'Error deleting flight package', 
            error: error.message 
        });
    }
};

// Update remaining slots (for bookings)
export const updateRemainingSlots = async (req, res) => {
    try {
        const { decrement } = req.body;
        const flightPackage = await FlightPackage.findById(req.params.id);

        if (!flightPackage) {
            return res.status(404).json({ message: 'Flight package not found' });
        }

        if (decrement) {
            if (flightPackage.remainingSlots <= 0) {
                return res.status(400).json({ message: 'No slots available' });
            }
            flightPackage.remainingSlots -= decrement;
            
            // Auto-update status if sold out
            if (flightPackage.remainingSlots === 0) {
                flightPackage.status = 'Sold Out';
            }
        }

        await flightPackage.save();

        res.status(200).json({ 
            message: 'Slots updated successfully',
            flightPackage 
        });
    } catch (error) {
        console.error('Error updating slots:', error);
        res.status(500).json({ 
            message: 'Error updating slots', 
            error: error.message 
        });
    }
};
