import mongoose from "mongoose";

const permissionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    code: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description: {
        type: String,
        default: ""
    },
    module: {
        type: String,
        required: true,
        enum: ['Dashboard', 'Bookings', 'Payments', 'Airlines', 'Banks', 'Sectors', 'Users', 'Reports', 'Settings']
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

export default mongoose.model("Permission", permissionSchema);
