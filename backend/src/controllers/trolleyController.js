const Trolley = require('../models/Trolley');
const { ObjectId } = require('mongoose').Types; // Import ObjectId

// Get all trolleys
exports.getTrolleys = async (req, res) => {
  try {
    const trolleys = await Trolley.find();
    res.json(trolleys);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching trolleys', error: err.message });
  }
};

// Get trolley by ID (Admin can get by _id, User can get by trolleyId)
exports.getTrolleyById = async (req, res) => {
  try {
    let trolley;
    if (ObjectId.isValid(req.params.id)) {
      trolley = await Trolley.findById(req.params.id);
    } else {
      // Assume it's a trolleyId string if not a valid ObjectId
      trolley = await Trolley.findOne({ trolleyId: req.params.id });
    }

    if (!trolley) return res.status(404).json({ message: 'Trolley not found' });
    res.json(trolley);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching trolley', error: err.message });
  }
};

// Connect to a trolley by trolleyId
exports.connectTrolley = async (req, res) => {
  try {
    const { trolleyId } = req.body;

    if (!trolleyId) {
      return res.status(400).json({ message: 'Trolley ID is required' });
    }

    const trolley = await Trolley.findOne({ trolleyId });

    if (!trolley) {
      return res.status(404).json({ message: 'Trolley not found' });
    }

    if (trolley.status.operational !== 'active') {
      return res.status(400).json({ message: 'Trolley is not operational' });
    }

    if (!trolley.status.availableForConnection) {
      return res.status(400).json({ message: 'Trolley is already connected or unavailable' });
    }

    // Mark trolley as unavailable for connection
    trolley.status.availableForConnection = false;
    await trolley.save();

    res.json({ message: `Successfully connected to trolley ${trolley.trolleyId}`, trolley });
  } catch (err) {
    res.status(500).json({ message: 'Error connecting to trolley', error: err.message });
  }
};

// Disconnect from a trolley by trolleyId
exports.disconnectTrolley = async (req, res) => {
  try {
    const { trolleyId } = req.body;

    if (!trolleyId) {
      return res.status(400).json({ message: 'Trolley ID is required' });
    }

    const trolley = await Trolley.findOne({ trolleyId });

    if (!trolley) {
      return res.status(404).json({ message: 'Trolley not found' });
    }

    // Mark trolley as available for connection
    trolley.status.availableForConnection = true;
    await trolley.save();

    res.json({ message: `Successfully disconnected from trolley ${trolley.trolleyId}`, trolley });
  } catch (err) {
    res.status(500).json({ message: 'Error disconnecting from trolley', error: err.message });
  }
};

// Check trolley availability by trolleyId
exports.checkTrolleyAvailability = async (req, res) => {
  try {
    const { trolleyId } = req.params; // Get trolleyId from params

    if (!trolleyId) {
      return res.status(400).json({ message: 'Trolley ID is required' });
    }

    const trolley = await Trolley.findOne({ trolleyId });

    if (!trolley) {
      return res.status(404).json({ message: 'Trolley not found' });
    }

    res.json({ trolleyId: trolley.trolleyId, available: trolley.status.availableForConnection });
  } catch (err) {
    res.status(500).json({ message: 'Error checking trolley availability', error: err.message });
  }
};

// Update trolley status (admin only)
exports.updateTrolleyStatus = async (req, res) => {
  try {
    const { operational } = req.body;
    const trolley = await Trolley.findById(req.params.id);
    if (!trolley) return res.status(404).json({ message: 'Trolley not found' });
    if (operational) trolley.status.operational = operational;
    await trolley.save();
    res.json(trolley);
  } catch (err) {
    res.status(400).json({ message: 'Error updating trolley status', error: err.message });
  }
};

// Update trolley (admin only, for mocking location/battery/task)
exports.updateTrolley = async (req, res) => {
  try {
    const trolley = await Trolley.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!trolley) return res.status(404).json({ message: 'Trolley not found' });
    res.json(trolley);
  } catch (err) {
    res.status(400).json({ message: 'Error updating trolley', error: err.message });
  }
};

// Create a new trolley (admin only)
exports.createTrolley = async (req, res) => {
  try {
    const trolley = new Trolley(req.body);
    await trolley.save();
    res.status(201).json(trolley);
  } catch (err) {
    res.status(400).json({ message: 'Error creating trolley', error: err.message });
  }
}; 