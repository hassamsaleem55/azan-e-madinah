import axios from "axios";
import GroupTicketing from "../models/GroupTicketing.js";
import Airline from "../models/Airline.js";

/* ===========================
   CREATE GROUP TICKETING
=========================== */
export const createGroupTicketing = async (req, res) => {
  try {
    // Generate unique IDs
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();

    const voucher_id = `VCH-${timestamp}-${randomSuffix}`;
    const groupBookingId = `GRP-${timestamp}-${randomSuffix}`;

    // Add airline to each flight if not present
    const flights = req.body.flights?.map(flight => ({
      ...flight,
      airline: flight.airline || req.body.airline
    })) || [];

    const groupData = {
      ...req.body,
      voucher_id,
      groupBookingId,
      flights
    };

    const group = await GroupTicketing.create(groupData);

    res.status(201).json({
      success: true,
      message: "Group ticketing created successfully",
      data: group
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/* ===========================
   GET ALL GROUP BOOKINGS
=========================== */
export const getAllGroupTicketings = async (req, res) => {
  try {
    let allGroupsData = [];

    // Extract query parameters
    const { group_type } = req.query;
    const groupTypeFilters = group_type ? (Array.isArray(group_type) ? group_type : [group_type]) : [];

    // Check if UMRAH-related types are in the filters
    const shouldFetchUmrahGroups = groupTypeFilters.length === 0 || 
      groupTypeFilters.some(filterType => 
        filterType.toLowerCase().includes('umrah')
      );

    /* ================= FLYING ZONE GROUPS ================= */
    if (req.flyingZoneToken && shouldFetchUmrahGroups) {
      try {
        // Always call Flying Zone API with hardcoded "UMRAH GROUPS" when UMRAH filter is present
        const flyingZoneUrl = `${process.env.FLYING_ZONE_API_URL}/groups?type=UMRAH GROUPS&token=${req.flyingZoneToken}`;
        const flyingZoneResponse = await axios.get(flyingZoneUrl);
        const groups = flyingZoneResponse.data?.groups || [];
        allGroupsData.push(
          ...groups.map(group => ({
            id: `FLZ-${group.id}`,
            available_no_of_pax: group.available_no_of_pax || 0,
            showSeat: true,
            sector: group.sector || "",
            type: group.type || "",
            price: group.price || 0,
            childPrice: group.child_price || 0,
            infantPrice: group.infant_price || 0,
            pnr: group.pnr || "",
            dept_date: group.dept_date || null,
            arv_date: group.arv_date || null,
            details: group.details || [],
            airline: {
              id: group.airline[0].id || null,
              airline_name: group.airline[0].airline_name || "",
              short_name: group.airline[0].short_name || "",
              logo_url: group.airline[0].logo_url || ""
            },
            source: "flyingzone"
          }))
        );
      } catch (err) {
        console.error("FLYING ZONE GROUP FETCH FAILED:", err.message);
      }
    }

    /* ================= ADMIN GROUPS ================= */
    const [groups, airlines] = await Promise.all([
      GroupTicketing.find().sort({ createdAt: -1 }),
      Airline.find()
    ]);

    allGroupsData.push(
      ...groups.map(group => {
        const airlineData = airlines.find(a => a.airlineName === group.airline);

        return {
          id: group._id,
          available_no_of_pax: group.totalSeats || 0,
          showSeat: group.showSeat || false,
          sector: group.sector,
          type: group.groupType,
          price: group.price?.sellingAdultPriceB2B || 0,
          childPrice: group.price?.sellingChildPriceB2B || 0,
          infantPrice: group.price?.sellingInfantPriceB2B || 0,
          pnr: group.pnr || "",
          dept_date: group.flights?.[0]?.depDate || null,
          arv_date: group.flights?.[group.flights.length - 1]?.arrDate || null,
          details: group.flights.map((flight, index) => ({
            sr: index + 1,
            flight_no: flight.flightNo,
            flight_date: flight.depDate,
            dep_date: flight.depDate,
            dept_time: flight.depTime,
            origin: flight.sectorFrom,
            destination: flight.sectorTo,
            arv_date: flight.arrDate,
            arv_time: flight.arrTime,
            baggage: flight.baggage,
            meal: flight.meal
          })),
          airline: {
            id: airlineData?._id || null,
            airline_name: group.airline,
            short_name: airlineData?.shortCode || null,
            logo_url: airlineData?.logo || null
          },
          source: "admin"
        };
      })
    );
    
    // Apply group_type filtering only to admin groups, not Flying Zone groups
    // Flying Zone API already filters by type
    if (groupTypeFilters.length > 0) {
      allGroupsData = allGroupsData.filter(group => {
        // Skip filtering for Flying Zone groups since API already filtered them
        if (group.source === 'flyingzone') {
          return true;
        }
        
        // Apply filtering only to admin groups
        const matches = groupTypeFilters.some(filterType => 
          group.type?.toLowerCase().includes(filterType.toLowerCase())
        );
        return matches;
      });
    }
    
    res.status(200).json({
      success: true,
      count: allGroupsData.length,
      data: allGroupsData
    });

  } catch (error) {
    console.error("GROUP FETCH ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* ===========================
   GET SINGLE GROUP BOOKING
=========================== */
export const getGroupTicketingById = async (req, res) => {
  try {
    const group = await GroupTicketing.findById(req.params.id);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group ticketing not found"
      });
    }

    res.status(200).json({
      success: true,
      data: group
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* ===========================
   UPDATE GROUP BOOKING
=========================== */
export const updateGroupTicketing = async (req, res) => {
  try {
    const group = await GroupTicketing.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group ticketing not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Group ticketing updated",
      data: group
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/* ===========================
   DELETE GROUP BOOKING
=========================== */
export const deleteGroupTicketing = async (req, res) => {
  try {
    const group = await GroupTicketing.findByIdAndDelete(req.params.id);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group ticketing not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Group ticketing deleted"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
