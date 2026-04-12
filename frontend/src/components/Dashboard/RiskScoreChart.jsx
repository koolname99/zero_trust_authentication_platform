import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const RiskScoreChart = ({ logs }) => {
  if (!logs) return <div className="glass-panel" style={{ padding: '2rem' }}>Loading Chart...</div>;

  // Process raw logs into average daily scores
  const scoreMap = {};
  logs.forEach(log => {
      // Ignore undefined scores
      if (!log.riskScore && log.riskScore !== 0) return;
      const dateString = new Date(log.timestamp).toLocaleDateString();
      if (!scoreMap[dateString]) scoreMap[dateString] = [];
      scoreMap[dateString].push(log.riskScore);
  });

  // Calculate averages
  const labels = Object.keys(scoreMap).reverse(); // Oldest to newest
  const dataPoints = labels.map(date => {
      const arr = scoreMap[date];
      const sum = arr.reduce((a, b) => a + b, 0);
      return Math.round(sum / arr.length);
  });

  // Fallback visual if no math generated
  if (labels.length === 0) {
      labels.push('Today');
      dataPoints.push(0);
  }

  const data = {
    labels,
    datasets: [
      {
        label: 'Average Anomaly Risk Score',
        data: dataPoints,
        borderColor: 'rgba(0, 212, 255, 1)',
        backgroundColor: 'rgba(0, 212, 255, 0.1)',
        pointBackgroundColor: 'rgba(124, 58, 237, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(124, 58, 237, 1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { color: 'rgba(255, 255, 255, 0.7)' }
      },
      tooltip: {
        backgroundColor: 'rgba(10, 10, 26, 0.9)',
        titleColor: '#fff',
        bodyColor: 'rgba(255, 255, 255, 0.7)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: 'rgba(255, 255, 255, 0.5)' },
        title: { display: true, text: 'Mathematical Risk Engine Score', color: 'rgba(255, 255, 255, 0.5)' }
      },
      x: {
        grid: { display: false },
        ticks: { color: 'rgba(255, 255, 255, 0.5)' }
      },
    },
  };

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', height: '350px' }}>
      <h3 style={{ color: 'var(--accent-cyan)', marginBottom: '1rem' }}>Global Telemetry Risk Trend</h3>
      <div style={{ height: '260px' }}>
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

export default RiskScoreChart;
