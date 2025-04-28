const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const { body, validationResult } = require('express-validator');

// Submit contact form
router.post('/', [
    body('name').notEmpty(),
    body('email').isEmail(),
    body('message').notEmpty(),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const contact = new Contact(req.body);
        const newContact = await contact.save();
        res.status(201).json(newContact);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get all contact submissions (admin only)
router.get('/', async (req, res) => {
    try {
        const contacts = await Contact.find().sort({ createdAt: -1 });
        res.json(contacts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 