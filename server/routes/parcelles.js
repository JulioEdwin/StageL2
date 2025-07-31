const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const router = express.Router();

// Validation rules
const parcelleValidation = [
  body('nom').notEmpty().withMessage('Le nom est requis'),
  body('superficie').isFloat({ min: 0 }).withMessage('Superficie invalide'),
  body('exposition').optional().isIn(['Nord', 'Sud', 'Est', 'Ouest', 'Nord-Est', 'Nord-Ouest', 'Sud-Est', 'Sud-Ouest']).withMessage('Exposition invalide'),
  body('statut').optional().isIn(['active', 'repos', 'renovation']).withMessage('Statut invalide')
];

// GET /api/parcelles - Obtenir toutes les parcelles
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT * FROM parcelles 
      ORDER BY nom ASC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/parcelles/:id - Obtenir une parcelle par ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM parcelles WHERE id = ?', [req.params.id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Parcelle non trouvée' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/parcelles - Créer une nouvelle parcelle
router.post('/', parcelleValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      nom, superficie, localisation, type_sol, exposition, altitude, pente,
      date_plantation, cepage, densite_plantation, statut
    } = req.body;

    const [result] = await pool.execute(`
      INSERT INTO parcelles 
      (nom, superficie, localisation, type_sol, exposition, altitude, pente, date_plantation, cepage, densite_plantation, statut)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [nom, superficie, localisation, type_sol, exposition, altitude, pente, date_plantation, cepage, densite_plantation, statut]);

    const [newParcelle] = await pool.execute('SELECT * FROM parcelles WHERE id = ?', [result.insertId]);
    res.status(201).json(newParcelle[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/parcelles/:id - Mettre à jour une parcelle
router.put('/:id', parcelleValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      nom, superficie, localisation, type_sol, exposition, altitude, pente,
      date_plantation, cepage, densite_plantation, statut
    } = req.body;

    await pool.execute(`
      UPDATE parcelles 
      SET nom = ?, superficie = ?, localisation = ?, type_sol = ?, exposition = ?, 
          altitude = ?, pente = ?, date_plantation = ?, cepage = ?, densite_plantation = ?, statut = ?
      WHERE id = ?
    `, [nom, superficie, localisation, type_sol, exposition, altitude, pente, date_plantation, cepage, densite_plantation, statut, req.params.id]);

    const [updatedParcelle] = await pool.execute('SELECT * FROM parcelles WHERE id = ?', [req.params.id]);
    
    if (updatedParcelle.length === 0) {
      return res.status(404).json({ error: 'Parcelle non trouvée' });
    }

    res.json(updatedParcelle[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/parcelles/:id - Supprimer une parcelle
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.execute('DELETE FROM parcelles WHERE id = ?', [req.params.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Parcelle non trouvée' });
    }
    
    res.json({ message: 'Parcelle supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/parcelles/stats - Statistiques des parcelles
router.get('/stats', async (req, res) => {
  try {
    const [totalParcelles] = await pool.execute('SELECT COUNT(*) as total FROM parcelles');
    const [superficieTotale] = await pool.execute('SELECT SUM(superficie) as total_ha FROM parcelles');
    const [parStatut] = await pool.execute(`
      SELECT statut, COUNT(*) as count, SUM(superficie) as superficie_ha
      FROM parcelles 
      GROUP BY statut
    `);
    const [parCepage] = await pool.execute(`
      SELECT cepage, COUNT(*) as count, SUM(superficie) as superficie_ha
      FROM parcelles 
      WHERE cepage IS NOT NULL AND cepage != ''
      GROUP BY cepage
    `);

    res.json({
      total: totalParcelles[0].total,
      superficieTotale: superficieTotale[0].total_ha || 0,
      parStatut,
      parCepage
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;