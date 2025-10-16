import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

// Register Chart.js components globally for use in your application
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// Maps raw snapshot data into a format Chart.js understands
const formatChartData = (snapshots) => {
    if (!snapshots || snapshots.length === 0) return { labels: [], datasets: [] };

    // 1. Identify all unique candidates across all snapshots
    const candidateNames = [...new Set(
        snapshots.flatMap(s => s.counts.map(c => c.name))
    )];

    // 2. Prepare datasets for each candidate
    const datasets = candidateNames.map((name, index) => {
        // Use consistent colors for visualization
        const colors = ['#38BDF8', '#8B5CF6', '#10B981', '#F59E0B', '#F87171'];
        const color = colors[index % colors.length];

        return {
            label: name,
            data: snapshots.map(s => {
                const candidateCount = s.counts.find(c => c.name === name);
                // Return 0 if the candidate wasn't present in that snapshot
                return candidateCount ? candidateCount.votes : 0; 
            }),
            borderColor: color,
            backgroundColor: color + '33', 
            tension: 0.4, // smooth line tension
            pointRadius: 3,
        };
    });

    // 3. Prepare labels (timestamps)
    const labels = snapshots.map(s => {
        const date = new Date(s.timestamp);
        // Display time for a compact view
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); 
    });

    return { labels, datasets };
};

const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'top',
            labels: {
                color: '#fff',
            }
        },
        tooltip: {
            mode: 'index',
            intersect: false,
        }
    },
    scales: {
        x: {
            title: {
                display: true,
                text: 'Time',
                color: '#9CA3AF'
            },
            grid: { color: '#374151' },
            ticks: { color: '#9CA3AF' }
        },
        y: {
            title: {
                display: true,
                text: 'Total Votes',
                color: '#9CA3AF'
            },
            beginAtZero: true,
            grid: { color: '#374151' },
            ticks: { color: '#9CA3AF' }
        }
    }
};

export const LiveVoteTrendChart = ({ snapshots, title }) => {
    const data = formatChartData(snapshots);

    if (data.labels.length === 0) {
        return (
            <div className="h-40 flex items-center justify-center bg-gray-800 rounded-lg border border-dashed border-sky-700">
                <p className="text-gray-500 italic">
                    Live vote history is not available for this election (Backend must provide 'voteSnapshots').
                </p>
            </div>
        );
    }
    
    return (
        <div className="h-64">
             <Line data={data} options={options} />
        </div>
    );
};