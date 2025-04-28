const express = require('express');
const router = express.Router();
const Plant = require('../models/Plant');
const { body, validationResult } = require('express-validator');

// Get all plants
router.get('/', async (req, res) => {
    try {
        const plants = await Plant.find();
        res.json(plants);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get single plant
router.get('/:id', async (req, res) => {
    try {
        const plant = await Plant.findById(req.params.id);
        if (!plant) {
            return res.status(404).json({ message: 'Plant not found' });
        }
        res.json(plant);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create plant
router.post('/', [
    body('name').notEmpty(),
    body('description').notEmpty(),
    body('price').isNumeric(),
    body('imageUrl').notEmpty(),
    body('category').notEmpty(),
    body('stockQuantity').isNumeric(),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const plant = new Plant(req.body);
        const newPlant = await plant.save();
        res.status(201).json(newPlant);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update plant
router.patch('/:id', async (req, res) => {
    try {
        const plant = await Plant.findById(req.params.id);
        if (!plant) {
            return res.status(404).json({ message: 'Plant not found' });
        }
        
        Object.assign(plant, req.body);
        const updatedPlant = await plant.save();
        res.json(updatedPlant);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete plant
router.delete('/:id', async (req, res) => {
    try {
        const plant = await Plant.findById(req.params.id);
        if (!plant) {
            return res.status(404).json({ message: 'Plant not found' });
        }
        
        await Plant.deleteOne({ _id: req.params.id });
        res.json({ message: 'Plant deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 