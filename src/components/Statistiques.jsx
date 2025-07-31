import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

const Statistiques = () => {
  // Données pour le graphique de répartition des bassins par type
  const bassinTypeData = {
    labels: ['Fermentation', 'Vieillissement', 'Stockage'],
    datasets: [
      {
        data: [1, 1, 2],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
        hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
      },
    ],
  };

  // Données pour le graphique de répartition des commandes par statut
  const commandeStatutData = {
    labels: ['En attente', 'Préparée', 'Livrée'],
    datasets: [
      {
        label: 'Nombre de commandes',
        data: [1, 1, 2],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
        borderColor: ['#FF6384', '#36A2EB', '#FFCE56'],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Statistiques - Lazan'i Betsileo Wine</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Résumé des bassins */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold">Bassins</h2>
          <p>Nombre total : <strong>4</strong></p>
          <p>Capacité totale : <strong>8 010 litres</strong></p>
          <div className="mt-4">
            <Pie
              data={bassinTypeData}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: 'top' },
                  title: { display: true, text: 'Répartition par type de bassin' }
                },
              }}
            />
          </div>
        </div>

        {/* Résumé des clients */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold">Clients</h2>
          <p>Nombre total : <strong>3</strong></p>
          <p>Professionnels : <strong>2</strong></p>
          <p>Particuliers : <strong>1</strong></p>
          <p>Prospects : <strong>1</strong></p>
        </div>

        {/* Résumé des commandes */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold">Commandes</h2>
          <p>Nombre total : <strong>4</strong></p>
          <p>Montant total : <strong>417 000,10 MGA</strong></p>
          <div className="mt-4">
            <Bar
              data={commandeStatutData}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: 'top' },
                  title: { display: true, text: 'Répartition par statut de commande' }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      precision: 0
                    }
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Résumé des factures */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold">Factures</h2>
          <p>Nombre total : <strong>3</strong></p>
          <p>Montant total TTC : <strong>112 801,00 MGA</strong></p>
          <p>Factures payées : <strong>2</strong></p>
        </div>

        {/* Résumé des paiements */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold">Paiements</h2>
          <p>Nombre total : <strong>4</strong></p>
          <p>Montant total : <strong>105 602,00 MGA</strong></p>
          <p>Modes : <span>Espèces (1), Virement (2), Carte (1)</span></p>
        </div>

        {/* Résumé des produits */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold">Produits</h2>
          <p>Nombre total : <strong>4</strong></p>
          <p>Stock total : <strong>133 bouteilles</strong></p>
          <p>Produits en rupture : <strong>3</strong></p>
        </div>

        {/* Résumé des lots de production */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold">Lots de production</h2>
          <p>Nombre total : <strong>3</strong></p>
          <p>Volume initial : <strong>6 504,00 litres</strong></p>
        </div>

        {/* Résumé des récoltes */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold">Récoltes</h2>
          <p>Nombre total : <strong>0</strong></p>
          <p>Aucune récolte enregistrée pour le moment.</p>
        </div>
      </div>
    </div>
  );
};

export default Statistiques;