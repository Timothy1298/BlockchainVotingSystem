import React from "react";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export const VotePieChart = ({ data }) => {
  const chartData = {
    labels: data.map(d => d.candidate),
    datasets: [
      {
        label: "Votes",
        data: data.map(d => d.votes),
        backgroundColor: ["#3b82f6", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6"],
      },
    ],
  };

  return <Pie data={chartData} />;
};

export const VoteBarChart = ({ data }) => {
  const chartData = {
    labels: data.map(d => d.candidate),
    datasets: [
      {
        label: "Votes",
        data: data.map(d => d.votes),
        backgroundColor: "#3b82f6",
      },
    ],
  };

  return <Bar data={chartData} />;
};
