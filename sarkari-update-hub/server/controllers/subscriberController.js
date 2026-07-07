const Subscriber = require('../models/Subscriber');

const addSubscriber = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const existing = await Subscriber.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'You are already subscribed!' });
    }

    const subscriber = new Subscriber({ email });
    await subscriber.save();

    res.status(201).json({ message: 'Subscribed successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error subscribing email' });
  }
};

module.exports = { addSubscriber };
