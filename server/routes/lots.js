const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const router = express.Router();

// Validation rules
const lotValidation = [
  body('numero_lot').notEmpty().withMessage('Le numéro de lot est requis'),
  body('recolte_id').isInt({ min: 1 }).withMessage('Récolte ID invalide'),
  body('bassin_id').isInt({ min: 1 }).withMessage('Bassin ID invalide'),
  body('date_debut_production').isDate().withMessage('Date de début invalide'),
  body('type_vin').isIn(['rouge', 'blanc', 'rose', 'petillant']).withMessage('Type de vin invalide'),
  body('volume_initial_litres').isFloat({ min: 0 }).withMessage('Volume initial invalide'),
  body('statut').optional().isIn(['en_fermentation', 'en_vieillissement', 'pret', 'embouteille']).withMessage('Statut invalide')
];

// GET /api/lots - Obtenir tous les lots
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT l.*, 
             b.nom as bassin_nom,
             r.quantite_kg as recolte_quantite,
             p.nom as recolte_parcelle
      FROM lots_production l
      JOIN bassins b ON l.bassin_id = b.id
      JOIN recoltes r ON l.recolte_id = r.id
      JOIN parcelles p ON r.parcelle_id = p.id
      ORDER BY l.date_debut_production DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/lots/:id - Obtenir un lot par ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT l.*, 
             b.nom as bassin_nom, b.capacite_litres,
             r.quantite_kg as recolte_quantite, r.date_recolte,
             p.nom as recolte_parcelle
      FROM lots_production l
      JOIN bassins b ON l.bassin_id = b.id
      JOIN recoltes r ON l.recolte_id = r.id
      JOIN parcelles p ON r.parcelle_id = p.id
      WHERE l.id = ?
    `, [req.params.id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Lot non trouvé' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/lots - Créer un nouveau lot
router.post('/', lotValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      numero_lot, recolte_id, bassin_id, date_debut_production, date_fin_production,
      type_vin, volume_initial_litres, volume_final_litres, degre_alcool, statut, notes_production
    } = req.body;

    // Vérifier que le numéro de lot est unique
    const [existing] = await pool.execute('SELECT id FROM lots_production WHERE numero_lot = ?', [numero_lot]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Ce numéro de lot existe déjà' });
    }

    const [result] = await pool.execute(`
      INSERT INTO lots_production 
      (numero_lot, recolte_id, bassin_id, date_debut_production, date_fin_production, 
       type_vin, volume_initial_litres, volume_final_litres, degre_alcool, statut, notes_production)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [numero_lot, recolte_id, bassin_id, date_debut_production, date_fin_production, 
        type_vin, volume_initial_litres, volume_final_litres, degre_alcool, statut, notes_production]);

    // Mettre à jour le statut du bassin
    await pool.execute('UPDATE bassins SET statut = ? WHERE id = ?', ['occupe', bassin_id]);

    const [newLot] = await pool.execute(`
      SELECT l.*, b.nom as bassin_nom, p.nom as recolte_parcelle
      FROM lots_production l
      JOIN bassins b ON l.bassin_id = b.id
      JOIN recoltes r ON l.recolte_id = r.id
      JOIN parcelles p ON r.parcelle_id = p.id
      WHERE l.id = ?
    `, [result.insertId]);

    res.status(201).json(newLot[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/lots/:id - Mettre à jour un lot
router.put('/:id', lotValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      numero_lot, recolte_id, bassin_id, date_debut_production, date_fin_production,
      type_vin, volume_initial_litres, volume_final_litres, degre_alcool, statut, notes_production
    } = req.body;

    // Vérifier que le numéro de lot est unique (sauf pour le lot actuel)
    const [existing] = await pool.execute('SELECT id FROM lots_production WHERE numero_lot = ? AND id != ?', [numero_lot, req.params.id]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Ce numéro de lot existe déjà' });
    }

    await pool.execute(`
      UPDATE lots_production 
      SET numero_lot = ?, recolte_id = ?, bassin_id = ?, date_debut_production = ?, date_fin_production = ?,
          type_vin = ?, volume_initial_litres = ?, volume_final_litres = ?, degre_alcool = ?, 
          statut = ?, notes_production = ?
      WHERE id = ?
    `, [numero_lot, recolte_id, bassin_id, date_debut_production, date_fin_production, 
        type_vin, volume_initial_litres, volume_final_litres, degre_alcool, statut, notes_production, req.params.id]);

    const [updatedLot] = await pool.execute(`
      SELECT l.*, b.nom as bassin_nom, p.nom as recolte_parcelle
      FROM lots_production l
      JOIN bassins b ON l.bassin_id = b.id
      JOIN recoltes r ON l.recolte_id = r.id
      JOIN parcelles p ON r.parcelle_id = p.id
      WHERE l.id = ?
    `, [req.params.id]);
    
    if (updatedLot.length === 0) {
      return res.status(404).json({ error: 'Lot non trouvé' });
    }

    res.json(updatedLot[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/lots/:id - Supprimer un lot
router.delete('/:id', async (req, res) => {
  try {
    // Récupérer les infos du lot avant suppression
    const [lotInfo] = await pool.execute('SELECT bassin_id FROM lots_production WHERE id = ?', [req.params.id]);
    
    const [result] = await pool.execute('DELETE FROM lots_production WHERE id = ?', [req.params.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Lot non trouvé' });
    }

    // Libérer le bassin
    if (lotInfo.length > 0) {
      await pool.execute('UPDATE bassins SET statut = ? WHERE id = ?', ['disponible', lotInfo[0].bassin_id]);
    }
    
    res.json({ message: 'Lot supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/lots/stats - Statistiques des lots
router.get('/stats', async (req, res) => {
  try {
    const [totalLots] = await pool.execute('SELECT COUNT(*) as total FROM lots_production');
    const [volumeTotal] = await pool.execute('SELECT SUM(volume_initial_litres) as total_litres FROM lots_production');
    const [parStatut] = await pool.execute(`
      SELECT statut, COUNT(*) as count, SUM(volume_initial_litres) as volume_litres
      FROM lots_production 
      GROUP BY statut
    `);
    const [parType] = await pool.execute(`
      SELECT type_vin, COUNT(*) as count, SUM(volume_initial_litres) as volume_litres
      FROM lots_production 
      GROUP BY type_vin
    `);

    res.json({
      total: totalLots[0].total,
      volumeTotal: volumeTotal[0].total_litres || 0,
      parStatut,
      parType
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;