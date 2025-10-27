import mongoose from 'mongoose';

const mapFormSchema = new mongoose.Schema({
  linkedUserFormId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FormsData', // Reference to the main user/agent form
    required: true,
    unique: true // Each map form links to one main form
  },
  formId: { // A unique ID for the map form itself
    type: String,
    unique: true,
    required: true
  },
  propertyType: {
    type: String,
    enum: ['Residential', 'Commercial', 'Industrial', 'Agriculture'],
    required: true
  },
  propertySubType: {
    type: String,
    required: true
  },
  propertyAddress: {
    type: String,
    required: true,
    trim: true
  },
  plotLength: {
    type: Number,
    required: true,
    min: 0
  },
  plotWidth: {
    type: Number,
    required: true,
    min: 0
  },
  lengthUnit: {
    type: String,
    enum: ['feet', 'yards', 'meters'],
    default: 'feet'
  },
  widthUnit: {
    type: String,
    enum: ['feet', 'yards', 'meters'],
    default: 'feet'
  },
  vicinityRadius: {
    type: Number,
    default: 100,
    min: 0
  },
  entryDirection: {
    type: String,
    enum: ['North', 'South', 'East', 'West'],
    default: 'North'
  },
  builtUpUnit: {
    type: String,
    enum: ['feet', 'yards', 'meters'],
    default: 'feet'
  },
  builtUpAreas: [{
    type: {
      type: String,
      enum: ['room', 'kitchen', 'bathroom', 'hall', 'open'],
      required: true
    },
    label: {
      type: String,
      required: true
    },
    length: {
      type: Number,
      required: true,
      min: 0
    },
    width: {
      type: Number,
      required: true,
      min: 0
    },
    unit: {
      type: String,
      enum: ['feet', 'yards', 'meters'],
      default: 'feet'
    },
    color: {
      type: String,
      default: '#ffc107'
    }
  }],
  neighbourDetails: {
    north: {
      type: {
        type: String,
        enum: ['Road', 'Plot', 'Others'],
        default: 'Road'
      },
      name: {
        type: String,
        default: ''
      },
      roadSize: {
        type: Number,
        default: 0
      }
    },
    south: {
      type: {
        type: String,
        enum: ['Road', 'Plot', 'Others'],
        default: 'Plot'
      },
      name: {
        type: String,
        default: ''
      },
      roadSize: {
        type: Number,
        default: 0
      }
    },
    east: {
      type: {
        type: String,
        enum: ['Road', 'Plot', 'Others'],
        default: 'Road'
      },
      name: {
        type: String,
        default: ''
      },
      roadSize: {
        type: Number,
        default: 0
      }
    },
    west: {
      type: {
        type: String,
        enum: ['Road', 'Plot', 'Others'],
        default: 'Plot'
      },
      name: {
        type: String,
        default: ''
      },
      roadSize: {
        type: Number,
        default: 0
      }
    }
  },
  calculatedData: {
    totalPlotAreaSqFeet: {
      type: Number,
      default: 0
    },
    totalPlotAreaSqMeters: {
      type: Number,
      default: 0
    },
    totalPlotAreaSqYards: {
      type: Number,
      default: 0
    },
    totalBuiltUpAreaSqFeet: {
      type: Number,
      default: 0
    },
    totalBuiltUpAreaSqMeters: {
      type: Number,
      default: 0
    },
    builtUpPercentage: {
      type: Number,
      default: 0
    }
  },
  status: {
    type: String,
    enum: ['draft', 'pending_verification', 'verified', 'modified', 'rejected', 'completed'],
    default: 'draft'
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Should be a Staff 3 user
    default: null
  },
  verifiedAt: {
    type: Date,
    default: null
  },
  notes: {
    type: String,
    trim: true
  },
  assignedToStaff3: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'map_forms'
});

// Pre-save hook to update `updatedAt` and calculate areas
mapFormSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Calculate plot area
  const lengthFeet = this.convertToFeet(this.plotLength, this.lengthUnit);
  const widthFeet = this.convertToFeet(this.plotWidth, this.widthUnit);
  const areaSqFeet = lengthFeet * widthFeet;
  
  this.calculatedData.totalPlotAreaSqFeet = areaSqFeet;
  this.calculatedData.totalPlotAreaSqMeters = areaSqFeet * 0.092903; // 1 sq ft = 0.092903 sq m
  this.calculatedData.totalPlotAreaSqYards = areaSqFeet / 9; // 1 sq yd = 9 sq ft
  
  // Calculate built-up area
  let totalBuiltUpSqFeet = 0;
  this.builtUpAreas.forEach(area => {
    const areaLengthFeet = this.convertToFeet(area.length, area.unit);
    const areaWidthFeet = this.convertToFeet(area.width, area.unit);
    totalBuiltUpSqFeet += areaLengthFeet * areaWidthFeet;
  });
  
  this.calculatedData.totalBuiltUpAreaSqFeet = totalBuiltUpSqFeet;
  this.calculatedData.totalBuiltUpAreaSqMeters = totalBuiltUpSqFeet * 0.092903;
  this.calculatedData.builtUpPercentage = areaSqFeet > 0 ? (totalBuiltUpSqFeet / areaSqFeet) * 100 : 0;
  
  next();
});

// Helper method to convert units to feet
mapFormSchema.methods.convertToFeet = function(value, unit) {
  const conversions = {
    'feet': 1,
    'yards': 3,
    'meters': 3.28084
  };
  return value * (conversions[unit] || 1);
};

// Helper method to get formatted area
mapFormSchema.methods.getFormattedArea = function() {
  return {
    sqFeet: this.calculatedData.totalPlotAreaSqFeet.toFixed(2),
    sqMeters: this.calculatedData.totalPlotAreaSqMeters.toFixed(3),
    sqYards: this.calculatedData.totalPlotAreaSqYards.toFixed(3)
  };
};

// Helper method to get built-up summary
mapFormSchema.methods.getBuiltUpSummary = function() {
  return {
    sqFeet: this.calculatedData.totalBuiltUpAreaSqFeet.toFixed(2),
    sqMeters: this.calculatedData.totalBuiltUpAreaSqMeters.toFixed(3),
    percentage: this.calculatedData.builtUpPercentage.toFixed(1)
  };
};

const MapForm = mongoose.model('MapForm', mapFormSchema);

export default MapForm;
