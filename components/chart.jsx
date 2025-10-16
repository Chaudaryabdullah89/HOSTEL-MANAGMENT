'use client'

import React from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line } from 'react-chartjs-2'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

const chart = () => {
    const data = {
        labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
        datasets: [{
          label: 'Revenue',
        //   backgroundColor: 'rgba(0, 0, 0, 0.1)',
        //   borderColor: '#000000',
        //   borderWidth: 3,
        //   pointBackgroundColor: '#000000',
        //   pointBorderColor: '#ffffff',
        //   pointBorderWidth: 2,
        //   pointRadius: 6,
        //   pointHoverRadius: 8,
        //   pointHoverBackgroundColor: '#000000',
        //   pointHoverBorderColor: '#ffffff',
        //   pointHoverBorderWidth: 3,
        //   fill: true,
        //   tension: 0.4,
          data: [0, 10, 5, 2, 20, 30, 45]
        }]
      }
      
      const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              color: '#000000',
              font: {
                size: 14,
                weight: 'bold'
              },
              padding: 20
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: '#000000',
            borderWidth: 1,
            cornerRadius: 8,
            displayColors: true,
            callbacks: {
              label: function(context) {
                return `Revenue: $${context.parsed.y}`
              }
            }
          }
        },
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: 'Month',
              color: '#000000',
              font: {
                size: 14,
                weight: 'bold'
              }
            },
            grid: {
              display: true,
              color: 'rgba(0, 0, 0, 0.1)',
              lineWidth: 1
            },
            ticks: {
              color: '#000000',
              font: {
                size: 12,
                weight: '500'
              }
            }
          },
          y: {
            display: true,
            title: {
              display: true,
              text: 'Revenue',
              color: '#000000',
              font: {
                size: 14,
                weight: 'bold'
              }
            },
            grid: {
              display: true,
              color: 'rgba(0, 0, 0, 0.1)',
              lineWidth: 1
            },
            ticks: {
              color: '#000000',
              font: {
                size: 12,
                weight: '500'
              },
              callback: function(value) {
                return '$' + value 
              }
            }
          }
        },
        interaction: {
          intersect: false,
          mode: 'index'
        },
        elements: {
          line: {
            borderJoinStyle: 'round',
            borderCapStyle: 'round'
          }
        }
      }
      
  return (
    <div className='h-96 w-full rounded-lg border bg-white shadow-lg p-6'>
        <Line data={data} options={options} />
    </div>
  )
}

export default chart