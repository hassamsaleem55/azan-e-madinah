import Sector from "../models/Sector.js";

// Add new sector
export const addSector = async (req, res) => {
  try {
    const { sectorTitle, fullSector } = req.body;

    // Validate required fields
    if (!sectorTitle || !fullSector) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    // Check if sector already exists
    const existingSector = await Sector.findOne({ 
      sectorTitle: sectorTitle.toUpperCase() 
    });

    if (existingSector) {
      return res.status(400).json({
        success: false,
        message: "Sector with this title already exists"
      });
    }

    // Create new sector
    const newSector = await Sector.create({
      sectorTitle: sectorTitle.toUpperCase(),
      fullSector
    });

    res.status(201).json({
      success: true,
      message: "Sector added successfully",
      data: newSector
    });

  } catch (error) {
    console.error("Error adding sector:", error);
    res.status(500).json({
      success: false,
      message: "Error adding sector",
      error: error.message
    });
  }
};

// Get all sectors
export const getSectors = async (req, res) => {
  try {
    const sectors = await Sector.find().sort({ sectorTitle: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: sectors.length,
      data: sectors
    });

  } catch (error) {
    console.error("Error fetching sectors:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching sectors",
      error: error.message
    });
  }
};

// Get single sector by ID
export const getSectorById = async (req, res) => {
  try {
    const { id } = req.params;
    const sector = await Sector.findById(id);

    if (!sector) {
      return res.status(404).json({
        success: false,
        message: "Sector not found"
      });
    }

    res.status(200).json({
      success: true,
      data: sector
    });

  } catch (error) {
    console.error("Error fetching sector:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching sector",
      error: error.message
    });
  }
};

// Update sector
export const updateSector = async (req, res) => {
  try {
    const { id } = req.params;
    const { sectorTitle, fullSector } = req.body;

    // Validate required fields
    if (!sectorTitle || !fullSector) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    // Check if sector exists
    const sector = await Sector.findById(id);
    if (!sector) {
      return res.status(404).json({
        success: false,
        message: "Sector not found"
      });
    }

    // Check if another sector with the same title exists
    const existingSector = await Sector.findOne({
      _id: { $ne: id },
      sectorTitle: sectorTitle.toUpperCase()
    });

    if (existingSector) {
      return res.status(400).json({
        success: false,
        message: "Another sector with this title already exists"
      });
    }

    // Update sector
    const updatedSector = await Sector.findByIdAndUpdate(
      id,
      {
        sectorTitle: sectorTitle.toUpperCase(),
        fullSector
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Sector updated successfully",
      data: updatedSector
    });

  } catch (error) {
    console.error("Error updating sector:", error);
    res.status(500).json({
      success: false,
      message: "Error updating sector",
      error: error.message
    });
  }
};

// Delete sector
export const deleteSector = async (req, res) => {
  try {
    const { id } = req.params;

    const sector = await Sector.findById(id);
    if (!sector) {
      return res.status(404).json({
        success: false,
        message: "Sector not found"
      });
    }

    await Sector.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Sector deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting sector:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting sector",
      error: error.message
    });
  }
};
