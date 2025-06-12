const Trolley = require('../models/Trolley');

// Get all trolleys
exports.getTrolleys = async (req, res) => {
  try {
    const trolleys = await Trolley.find();
    res.json(trolleys);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching trolleys', error: err.message });
  }
};

// Get trolley by ID
exports.getTrolleyById = async (req, res) => {
  try {
    const trolley = await Trolley.findById(req.params.id);
    if (!trolley) return res.status(404).json({ message: 'Trolley not found' });
    res.json(trolley);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching trolley', error: err.message });
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