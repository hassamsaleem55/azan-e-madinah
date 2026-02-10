import mongoose from "mongoose";

const SectorSchema = new mongoose.Schema(
  {
    sectorTitle: {
      type: String,
      required: [true, "Sector title is required"],
      trim: true,
      uppercase: true,
      unique: true
    },
    fullSector: {
      type: String,
      required: [true, "Full sector name is required"],
      trim: true
    }
  },
  { 
    timestamps: true 
  }
);

const Sector = mongoose.model("Sector", SectorSchema);

export default Sector;
