import Flight from '../models/Flight.js';

// Create a new flight
export const createFlight = async (req, res) => {
    try {
        const {
            flightNumber,
            airline,
            sector,
            departureCity,
            departureDate,
            departureTime,
            arrivalCity,
            arrivalDate,
            arrivalTime
        } = req.body;

        // Check if flight number already exists for the same date
        const existingFlight = await Flight.findOne({ 
            flightNumber: flightNumber.toUpperCase(),
            departureDate: new Date(departureDate)
        });

        if (existingFlight) {
            return res.status(400).json({ 
                message: 'A flight with this number already exists for the selected date' 
            });
        }

        const flight = new Flight({
            flightNumber: flightNumber.toUpperCase(),
            airline,
            sector,
            departureCity,
            departureDate,
            departureTime,
            arrivalCity,
            arrivalDate,
            arrivalTime
        });

        await flight.save();
        await flight.populate(['airline', 'sector']);

        res.status(201).json({
            message: 'Flight created successfully',
            flight
        });
    } catch (error) {
        console.error('Error creating flight:', error);
        res.status(500).json({ 
            message: 'Error creating flight', 
            error: error.message 
        });
    }
};

// Get all flights
export const getAllFlights = async (req, res) => {
    try {
        const { airline, sector, date } = req.query;
        const filter = {};

        if (airline) filter.airline = airline;
        if (sector) filter.sector = sector;
        if (date) {
            const searchDate = new Date(date);
            filter.departureDate = {
                $gte: new Date(searchDate.setHours(0, 0, 0, 0)),
                $lt: new Date(searchDate.setHours(23, 59, 59, 999))
            };
        }

        const flights = await Flight.find(filter)
            .populate('airline', 'airlineName airlineCode logo')
            .populate('sector', 'sectorTitle fullSector')
            .sort({ departureDate: 1, departureTime: 1 });

        res.status(200).json({
            count: flights.length,
            flights
        });
    } catch (error) {
        console.error('Error fetching flights:', error);
        res.status(500).json({ 
            message: 'Error fetching flights', 
            error: error.message 
        });
    }
};

// Get a single flight by ID
export const getFlightById = async (req, res) => {
    try {
        const flight = await Flight.findById(req.params.id)
            .populate('airline', 'airlineName airlineCode logo')
            .populate('sector', 'sectorTitle fullSector');

        if (!flight) {
            return res.status(404).json({ message: 'Flight not found' });
        }

        res.status(200).json({ flight });
    } catch (error) {
        console.error('Error fetching flight:', error);
        res.status(500).json({ 
            message: 'Error fetching flight', 
            error: error.message 
        });
    }
};

// Update a flight
export const updateFlight = async (req, res) => {
    try {
        const {
            flightNumber,
            airline,
            sector,
            departureCity,
            departureDate,
            departureTime,
            arrivalCity,
            arrivalDate,
            arrivalTime
        } = req.body;

        // Check if flight number already exists for another flight on the same date
        const existingFlight = await Flight.findOne({ 
            flightNumber: flightNumber.toUpperCase(),
            departureDate: new Date(departureDate),
            _id: { $ne: req.params.id }
        });

        if (existingFlight) {
            return res.status(400).json({ 
                message: 'Another flight with this number already exists for the selected date' 
            });
        }

        const flight = await Flight.findByIdAndUpdate(
            req.params.id,
            {
                flightNumber: flightNumber.toUpperCase(),
                airline,
                sector,
                departureCity,
                departureDate,
                departureTime,
                arrivalCity,
                arrivalDate,
                arrivalTime
            },
            { new: true, runValidators: true }
        ).populate(['airline', 'sector']);

        if (!flight) {
            return res.status(404).json({ message: 'Flight not found' });
        }

        res.status(200).json({
            message: 'Flight updated successfully',
            flight
        });
    } catch (error) {
        console.error('Error updating flight:', error);
        res.status(500).json({ 
            message: 'Error updating flight', 
            error: error.message 
        });
    }
};

// Delete a flight
export const deleteFlight = async (req, res) => {
    try {
        const flight = await Flight.findByIdAndDelete(req.params.id);

        if (!flight) {
            return res.status(404).json({ message: 'Flight not found' });
        }

        res.status(200).json({ 
            message: 'Flight deleted successfully' 
        });
    } catch (error) {
        console.error('Error deleting flight:', error);
        res.status(500).json({ 
            message: 'Error deleting flight', 
            error: error.message 
        });
    }
};
