// Initial setup
let isDarkMode = false;

// Dark/Light mode toggle
const darkModeToggle = document.getElementById('darkModeToggle');
darkModeToggle.addEventListener('click', () => {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('dark-mode', isDarkMode);
});

// Cart functionality
const cartButton = document.getElementById('cartButton');
const cartDropdown = document.querySelector('.cart-dropdown');

cartButton.addEventListener('mouseenter', () => {
    cartDropdown.classList.add('show'); // Show cart on hover
});

cartButton.addEventListener('mouseleave', () => {
    cartDropdown.classList.remove('show'); // Hide cart when not hovering
});

// Buy and Sell functionality
const addCryptoButton = document.getElementById('addCrypto');
const removeCryptoButton = document.getElementById('removeCrypto');
const cryptoQuantityInput = document.getElementById('cryptoQuantity');
const cartItemsContainer = document.querySelector('.cart-items');

addCryptoButton.addEventListener('click', () => {
    const cryptoName = document.getElementById('cryptoName').value.toUpperCase();
    const cryptoQuantity = parseInt(cryptoQuantityInput.value);
    
    if (cryptoName && cryptoQuantity) {
        const item = document.createElement('div');
        item.className = 'cart-item';
        item.innerHTML = `
            <span class="item-name">${cryptoName}</span>
            <span class="item-quantity">${cryptoQuantity}</span>
            <button class="remove-item">-</button>
        `;
        cartItemsContainer.appendChild(item);
        cryptoQuantityInput.value = '';
    }
});

removeCryptoButton.addEventListener('click', () => {
    const cryptoName = document.getElementById('cryptoName').value.toUpperCase();
    const items = document.querySelectorAll('.cart-item');
    for (const item of items) {
        if (item.querySelector('.item-name').textContent === cryptoName) {
            const quantitySpan = item.querySelector('.item-quantity');
            let quantity = parseInt(quantitySpan.textContent);

            if (quantity > 1) {
                quantity -= 1;
                quantitySpan.textContent = quantity;
            } else {
                cartItemsContainer.removeChild(item);
            }
            break;
        }
    }
});

// Removing cart item functionality
cartItemsContainer.addEventListener('click', (event) => {
    if (event.target.classList.contains('remove-item')) {
        const item = event.target.closest('.cart-item');
        const quantitySpan = item.querySelector('.item-quantity');
        let quantity = parseInt(quantitySpan.textContent);

        if (quantity > 1) {
            quantity -= 1;
            quantitySpan.textContent = quantity;
        } else {
            cartItemsContainer.removeChild(item);
        }
    }
});

function formatToINR(value) {
    return '₹' + value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Chart.js configuration
const ctx = document.getElementById('cryptoChart').getContext('2d');

// Create a gradient fill for the chart
const gradientFill = ctx.createLinearGradient(0, 0, 0, 400); // Adjust based on your chart size
gradientFill.addColorStop(0, 'rgba(75, 192, 192, 0.6)');
gradientFill.addColorStop(1, 'rgba(75, 192, 192, 0.1)');

let cryptoChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [], // X-axis labels (dates)
        datasets: [{
            label: 'Price',
            data: [], // Price data
            borderColor: 'rgba(75, 192, 192, 1)', // Line color
            borderWidth: 2, // Line thickness
            backgroundColor: gradientFill, // Use gradient fill
            fill: true, // Fill the area under the line
            tension: 0, // No curve, making it look more like a financial chart
            pointRadius: 0, // Hide points for a cleaner look
            borderDash: [5, 5], // Dashed line style for a financial look
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false, // Stretch chart to fit container
        scales: {
            x: {
                title: { display: true, text: 'Date' }, // X-axis title
                ticks: {
                    autoSkip: true,
                    maxTicksLimit: 10 // Show a maximum of 10 ticks
                },
                grid: {
                    display: true,
                    color: '#444', // Darker grid color for contrast
                    lineWidth: 1 // Thicker grid lines
                }
            },
            y: {
                title: { display: true, text: 'Price (INR)' }, // Y-axis title
                beginAtZero: false,
                ticks: {
                    callback: function(value) {
                        return formatToINR(value); // Format Y-axis labels
                    }
                },
                grid: {
                    display: true,
                    color: '#444', // Darker grid color for contrast
                    lineWidth: 1 // Thicker grid lines
                }
            }
        },
        interaction: {
            mode: 'nearest', // Shows tooltip for the nearest point
            intersect: false // Shows tooltip even when hovering between points
        },
        plugins: {
            legend: {
                labels: {
                    color: '#fff', // Legend text color
                    font: {
                        size: 14, // Font size
                        family: 'Arial',
                        style: 'italic'
                    }
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0,0,0,0.8)', // Darker tooltip background color
                titleFont: { size: 16, weight: 'bold' }, // Tooltip title font
                bodyFont: { size: 14 }, // Tooltip body font
                displayColors: true, // Show color box
                callbacks: {
                    label: function(context) {
                        return formatToINR(context.parsed.y); // Format Y-value in tooltip
                    }
                }
            }
        }
    }
});

// Fetch and display chart data for the selected cryptocurrency
async function fetchCryptoPriceData(cryptoId) {
    try {
        // Fetch data for the last 30 days and current data
        const [marketChartResponse, marketDataResponse] = await Promise.all([
            fetch(`https://api.coingecko.com/api/v3/coins/${cryptoId}/market_chart?vs_currency=inr&days=30&interval=daily`),
            fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=inr&ids=${cryptoId}`)
        ]);
        
        const marketChartData = await marketChartResponse.json();
        const marketData = await marketDataResponse.json();
        
        // 24-hour percentage change
        const change24h = marketData[0].price_change_percentage_24h;

        // Update the 24h change display
        document.getElementById('change').textContent = `${change24h.toFixed(2)}%`;

        return marketChartData.prices; // Prices is an array with [timestamp, price] format
    } catch (error) {
        console.error('Error fetching crypto data:', error);
        return null;
    }
}

function updateCryptoChart(prices) {
    const labels = prices.map(price => new Date(price[0]).toLocaleDateString());
    const data = prices.map(price => price[1]);

    cryptoChart.data.labels = labels;
    cryptoChart.data.datasets[0].data = data;
    cryptoChart.update();

    // Update price display
    const latestPrice = data[data.length - 1]; // Get the latest price
    const formattedPrice = formatToINR(latestPrice); // Format the latest price

    // Set a maximum length for the displayed price
    const maxLength = 10; // Set your desired maximum length here
    const truncatedPrice = formattedPrice.length > maxLength ? formattedPrice.substring(0, maxLength) : formattedPrice;

    document.getElementById('price').textContent = truncatedPrice; // Update price display

    // Update market cap display
    const marketCap = latestPrice * 1000000; // Assuming market cap is some function of latest price; update as necessary
    const formattedMarketCap = formatToINR(marketCap);
    document.getElementById('marketCap').textContent = formattedMarketCap; // Update market cap display
}

// Listen for clicks on sidebar cryptocurrency options and update chart
const sidebarItems = document.querySelectorAll('.sidebar-top ul li a');
sidebarItems.forEach(item => {
    item.addEventListener('click', async (event) => {
        event.preventDefault();
        const cryptoName = item.querySelector('.label').textContent.toLowerCase(); // Get the cryptocurrency name

        const cryptoId = {
            bitcoin: 'bitcoin',
            ethereum: 'ethereum',
            litecoin: 'litecoin',
            dogecoin: 'dogecoin',
            ripple: 'ripple'
        }[cryptoName]; // Map the sidebar labels to CoinGecko API IDs

        if (cryptoId) {
            const prices = await fetchCryptoPriceData(cryptoId);
            if (prices) {
                updateCryptoChart(prices);
            }
        }
    });
});

// Compare functionality
const compareButton = document.querySelector('.sidebar-top ul li a:last-child'); // Select the compare link

compareButton.addEventListener('click', async (event) => {
    event.preventDefault(); // Prevent default link behavior

    // Get the selected cryptocurrencies (you can also use prompts or any other method to get user input)
    const cryptoId1 = 'bitcoin'; // Replace with the actual selected ID from the UI
    const cryptoId2 = 'ethereum'; // Replace with the actual selected ID from the UI

    const prices1 = await fetchCryptoPriceData(cryptoId1);
    const prices2 = await fetchCryptoPriceData(cryptoId2);

    if (prices1 && prices2) {
        updateComparisonChart(prices1, prices2);
    }
});

function updateComparisonChart(prices1, prices2) {
    const labels = prices1.map(price => new Date(price[0]).toLocaleDateString());
    const data1 = prices1.map(price => price[1]);
    const data2 = prices2.map(price => price[1]);

    // Create or update the comparison chart
    const comparisonCtx = document.getElementById('comparisonChart').getContext('2d');
    let comparisonChart = new Chart(comparisonCtx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Price of Bitcoin',
                    data: data1,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 2,
                    fill: false
                },
                {
                    label: 'Price of Ethereum',
                    data: data2,
                    borderColor: 'rgba(153, 102, 255, 1)',
                    borderWidth: 2,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: { display: true, text: 'Date' }
                },
                y: {
                    title: { display: true, text: 'Price (INR)' },
                    ticks: {
                        callback: function(value) {
                            return formatToINR(value); // Format Y-axis labels
                        }
                    }
                }
            }
        }
    });
}

// Initial fetch to display Bitcoin prices on page load
fetchCryptoPriceData('bitcoin').then(prices => {
    if (prices) {
        updateCryptoChart(prices);
    }
});
