const insights = document.getElementById('insights');

// Ensure smooth fade-in on page load (when the page is loaded directly)
insights.addEventListener('click', () => {
    document.body.style.transition = 'opacity 1s ease';
    document.body.style.opacity = 0;

    setTimeout(() => {
        location.href = 'chatbot.html';
    }, 1000);
});

const currentDate = new Date();
const month = currentDate.toLocaleString('default', { month: 'long' });
const year = currentDate.getFullYear();

document.querySelectorAll('.month').forEach(div => {
    div.textContent = `${month} ${year}`;
});

// Format numbers for display
function formatNumber(num) {
    return new Intl.NumberFormat().format(num);
}

// Extract numbers from bot responses
function extractNumberFromResponse(response) {
    if (!response) return 0;
    const cleanedResponse = response.replace(/[^\d.-]/g, '');
    const numberMatch = cleanedResponse.match(/(\d+(\.\d+)?)/);
    if (numberMatch) {
        return Math.round(parseFloat(numberMatch[0]));
    }
    return 0;
}

// Fetch metric from the API
async function fetchMetric(metricDescription) {
    try {
        console.log(`Fetching: ${metricDescription}`);
        const requestBody = {
            input_value: metricDescription,
            input_type: "chat",
            output_type: "chat",
            context: {
                dataset: [
                    {
                        post_id: "P2169",
                        post_type: "carousel",
                        likes: 837,
                        shares: 471,
                        comments: 108,
                        saved: 179,
                        impressions: 4592,
                        reach: 1257,
                        timestamp: "2024-12-22 08:55:12",
                        uuid: "c05b61c1-6c24-4f78-bca9-6e9788a87e9f",
                        carousel: false,
                    }
                    // Add your complete dataset here
                ],
            },
        };

        const response = await fetch("http://localhost:8000", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
        });

        const data = await response.json();
        const botResponse = data.outputs?.[0]?.outputs?.[0]?.artifacts?.message;
        return extractNumberFromResponse(botResponse);
    } catch (error) {
        console.error(`Error fetching metric: ${metricDescription}`, error);
        return 0;
    }
}

// Calculate engagement metrics
function calculateEngagementMetrics({ totalLikes, totalComments, totalImpressions }) {
    const engagementRate = ((totalLikes + totalComments) / totalImpressions) * 100;
    return engagementRate.toFixed(2);
}

// Update dashboard and chart
// Update dashboard and chart
async function updateDashboard() {
    console.log('Starting dashboard update...');
    const loadingElement = document.getElementById('loading');
    if (loadingElement) loadingElement.style.display = 'block';

    // Set loading text
    const boxValues = document.querySelectorAll('.box-value');
    boxValues.forEach((boxValue) => {
        boxValue.textContent = 'Loading...';
        boxValue.style.fontSize = '17px'; // Font size during loading
    });

    try {
        const totalPosts = await fetchMetric('Count total number of posts in the dataset. Return only the final count as a single number. The total number of posts can be found on final row of post_types column in the total row. So total row and post_id column is the answer. Look at the final value of id in post_id column in the total row and that is the answer. The answer is the final value of post_id .');
        const totalLikes = await fetchMetric('Count total number of likes in the dataset. Return only the final count as a single number. The value can be found in the final row of the dataset titled total and the value is in the column likes. So total row and likes column is the answer');
        const totalComments = await fetchMetric('Count total number of comments in the dataset. Return only the final count as a single number. The value can be found in the final row of the dataset titled total and the value is in the column likes. So total row and comments column is the answer.');
        const totalImpressions = await fetchMetric('Count total number of impressions in the dataset. Return only the final count as a single number. The value can be found in the final row of the dataset titled total and the value is in the column impressions. So total row and likes column is the answer');

        const engagementRate = calculateEngagementMetrics({
            totalLikes,
            totalComments,
            totalImpressions,
        });

        // Update dashboard
        document.querySelector('.box:nth-child(1) .box-value').textContent = formatNumber(totalPosts);
        document.querySelector('.box:nth-child(2) .box-value').textContent = formatNumber(totalImpressions);
        document.querySelector('.box:nth-child(3) .box-value').textContent = formatNumber(totalLikes);
        document.querySelector('.box:nth-child(4) .box-value').textContent = formatNumber(totalComments);

        // Update chart
        updateChart([totalPosts, totalLikes, totalComments, totalImpressions, engagementRate]);
    } catch (error) {
        console.error('Error updating dashboard:', error);
    } finally {
        if (loadingElement) loadingElement.style.display = 'none';

        // Change font size after loading
        boxValues.forEach((boxValue) => {
            boxValue.style.fontSize = '25px'; // Font size after loading is complete
        });
    }
}

let chartInstance;

// Updated Chart.js instance to use a doughnut chart
function updateChart(data) {
    const ctx = document.getElementById('engagementChart').getContext('2d');
    if (chartInstance) chartInstance.destroy(); // Destroy old chart before reinitializing

    // Calculate total engagement (excluding Posts)
    const totalEngagement = data.slice(1, 4).reduce((sum, val) => sum + val, 0);

    // Percentage breakdown for each metric (excluding Posts)
    const percentages = data.slice(1, 4).map((value) => ((value / totalEngagement) * 100).toFixed(2));

    chartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Likes', 'Comments', 'Impressions'],
            datasets: [{
                data: data.slice(1, 4), // Likes, Comments, Impressions
                backgroundColor: [
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(255, 206, 86, 0.8)',
                    'rgba(153, 102, 255, 0.8)',
                ],
                hoverBackgroundColor: [
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(153, 102, 255, 1)',
                ],
            }],
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const percentage = percentages[context.dataIndex] || 0;
                            return `${label}: ${value} (${percentage}%)`;
                        },
                    },
                },
            },
        },
    });
}

// Initial dashboard update
updateDashboard();
setInterval(updateDashboard, 300000); // Update every 5 minutes
