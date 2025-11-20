// functions/models/Test.js

const mongoose = require('mongoose');

const ResultSchema = new mongoose.Schema({
    id: { type: String, required: true }, // Telegram ID
    name: { type: String, required: true },
    username: { type: String, default: '' },
    correct: { type: Number, required: true },
    wrong: { type: Number, required: true },
    total: { type: Number, required: true },
    percentage: { type: Number, required: true },
    answers: { type: Object, required: true }, // Talabaning javoblari
    date: { type: Date, default: Date.now }
});

const TestSchema = new mongoose.Schema({
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    pdf: { type: String, required: true },
    questions: { type: Number, required: true },
    variants: { type: Number, required: true },
    answers: { type: Object, required: true }, // To'g'ri javoblar
    results: [ResultSchema], // Natijalar massivi
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Test || mongoose.model('Test', TestSchema);
