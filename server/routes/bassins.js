const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { Bassin } = require('../models');
const router = express.Router();

// Validation rules
const bassinValidation = [
  body('nom').notEmpty().withMessage('Le nom est requis'),
  body('capacite_litres').isInt({ min: 1 }).withMessage('Capacité invalide'),
  body('materiau').isIn(['inox', 'beton', 'bois', 'plastique']).withMessage('Matériau invalide'),
  body('type_bassin').isIn(['fermentation', 'stockage', 'vieillissement']).withMessage('Type invalide'),
  body('statut').optional().isIn(['disponible', 'occupe', 'nettoyage', 'maintenance']).withMessage('Statut invalide')
];

// GET /api/bassins - Obtenir tous les bassins
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT * FROM bassins 
      ORDER BY nom ASC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/bassins/:id - Obtenir un bassin par ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM bassins WHERE id = ?', [req.params.id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Bassin non trouvé' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/bassins - Créer un nouveau bassin
router.post('/', bassinValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      nom, capacite_litres, materiau, type_bassin, statut, temperature_optimale, last_cleaning
    } = req.body;

    const [result] = await pool.execute(`
      INSERT INTO bassins 
      (nom, capacite_litres, materiau, type_bassin, statut, temperature_optimale, last_cleaning)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [nom, capacite_litres, materiau, type_bassin, statut, temperature_optimale, last_cleaning]);

    const [newBassin] = await pool.execute('SELECT * FROM bassins WHERE id = ?', [result.insertId]);
    res.status(201).json(newBassin[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/bassins/:id - Mettre à jour un bassin
router.put('/:id', bassinValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      nom, capacite_litres, materiau, type_bassin, statut, temperature_optimale, last_cleaning
    } = req.body;

    await pool.execute(`
      UPDATE bassins 
      SET nom = ?, capacite_litres = ?, materiau = ?, type_bassin = ?, statut = ?, 
          temperature_optimale = ?, last_cleaning = ?
      WHERE id = ?
    `, [nom, capacite_litres, materiau, type_bassin, statut, temperature_optimale, last_cleaning, req.params.id]);

    const [updatedBassin] = await pool.execute('SELECT * FROM bassins WHERE id = ?', [req.params.id]);
    
    if (updatedBassin.length === 0) {
      return res.status(404).json({ error: 'Bassin non trouvé' });
    }

    res.json(updatedBassin[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/bassins/:id - Supprimer un bassin
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.execute('DELETE FROM bassins WHERE id = ?', [req.params.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Bassin non trouvé' });
    }
    
    res.json({ message: 'Bassin supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/bassins/stats - Statistiques des bassins
router.get('/stats', async (req, res) => {
  try {
    const [totalBassins] = await pool.execute('SELECT COUNT(*) as total FROM bassins');
    const [capaciteTotale] = await pool.execute('SELECT SUM(capacite_litres) as total_litres FROM bassins');
    const [parStatut] = await pool.execute(`
      SELECT statut, COUNT(*) as count, SUM(capacite_litres) as capacite_litres
      FROM bassins 
      GROUP BY statut
    `);
    const [parType] = await pool.execute(`
      SELECT type_bassin, COUNT(*) as count, SUM(capacite_litres) as capacite_litres
      FROM bassins 
      GROUP BY type_bassin
    `);
    const [parMateriau] = await pool.execute(`
      SELECT materiau, COUNT(*) as count, SUM(capacite_litres) as capacite_litres
      FROM bassins 
      GROUP BY materiau
    `);

    res.json({
      total: totalBassins[0].total,
      capaciteTotale: capaciteTotale[0].total_litres || 0,
      parStatut,
      parType,
      parMateriau
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;