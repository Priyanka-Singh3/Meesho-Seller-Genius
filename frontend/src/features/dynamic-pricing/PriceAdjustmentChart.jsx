import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const PriceAdjustmentChart = ({ product }) => {
  const priceHistory = [
    { date: 'Jan 1', price: product.price * 0.95 },
    { date: 'Feb 1', price: product.price * 1.05 },
    { date: 'Mar 1', price: product.price * 0.98 },
    { date: 'Apr 1', price: product.price * 1.1 },
    { date: 'May 1', price: product.price * 1.15 },
    { date: 'Jun 1', price: product.price },
  ];

  const data = {
    labels: priceHistory.map(item => item.date),
    datasets: [
      {
        label: 'Price (₹)',
        data: priceHistory.map(item => item.price),
        borderColor: '#9B177E',
        backgroundColor: 'rgba(155, 23, 126, 0.1)',
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return '₹' + context.parsed.y.toFixed(2);
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          callback: function(value) {
            return '₹' + value;
          }
        }
      }
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg">
      <Line data={data} options={options} />
    </div>
  );
};

export default PriceAdjustmentChart;
