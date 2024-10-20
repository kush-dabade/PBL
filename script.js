let isDarkMode = false;

const darkModeToggle = document.getElementById('darkModeToggle');
darkModeToggle.addEventListener('click', () => {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('dark-mode', isDarkMode);
});

const cartButton = document.getElementById('cartButton');
const cartDropdown = document.querySelector('.cart-dropdown');

cartButton.addEventListener('mouseenter', () => {
    cartDropdown.classList.add('show');
});

cartButton.addEventListener('mouseleave', () => {
    cartDropdown.classList.remove('show');
});

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

const ctx = document.getElementById('cryptoChart').getContext('2d');

const gradientFill = ctx.createLinearGradient(0, 0, 0, 400);
gradientFill.addColorStop(0, 'rgba(75, 192, 192, 0.6)');
gradientFill.addColorStop(1, 'rgba(75, 192, 192, 0.1)');

let cryptoChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Price',
            data: [],
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 2,
            backgroundColor: gradientFill,
            fill: true,
            tension: 0,
            pointRadius: 0,
            borderDash: [5, 5],
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                title: { display: true, text: 'Date' },
                ticks: {
                    autoSkip: true,
                    maxTicksLimit: 30
                },
                grid: {
                    display: true,
                    color: '#444', 
                    lineWidth: 0.5
                }
            },
            y: {
                title: { display: true, text: 'Price (INR)' }, 
                beginAtZero: false,
                ticks: {
                    callback: function(value) {
                        return formatToINR(value); 
                    }
                },
                grid: {
                    display: true,
                    color: '#444',
                    lineWidth: 0.5
                }
            }
        },
        interaction: {
            mode: 'nearest', 
            intersect: false
        },
        plugins: {
            legend: {
                labels: {
                    color: '#fff',
                    font: {
                        size: 14,
                        family: 'Arial',
                        style: 'italic'
                    }
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0,0,0,0.8)',
                titleFont: { size: 16, weight: 'bold' },
                bodyFont: { size: 14 },
                displayColors: true,
                callbacks: {
                    label: function(context) {
                        return formatToINR(context.parsed.y);
                    }
                }
            }
        }
    }
});

async function fetchCryptoPriceData(cryptoId) {
    try {
        const [marketChartResponse, marketDataResponse] = await Promise.all([
            fetch(`https://api.coingecko.com/api/v3/coins/${cryptoId}/market_chart?vs_currency=inr&days=30&interval=daily`),
            fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=inr&ids=${cryptoId}`)
        ]);
        
        const marketChartData = await marketChartResponse.json();
        const marketData = await marketDataResponse.json();
        
        const change24h = marketData[0].price_change_percentage_24h;

        document.getElementById('change').textContent = `${change24h.toFixed(2)}%`;

        return marketChartData.prices;
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

    const latestPrice = data[data.length - 1];
    const formattedPrice = formatToINR(latestPrice);

    const maxLength = 10;
    const truncatedPrice = formattedPrice.length > maxLength ? formattedPrice.substring(0, maxLength) : formattedPrice;

    document.getElementById('price').textContent = truncatedPrice;

    const marketCap = latestPrice * 1000000;
    const formattedMarketCap = formatToINR(marketCap);
    document.getElementById('marketCap').textContent = formattedMarketCap; 
}

const sidebarItems = document.querySelectorAll('.sidebar-top ul li a');
sidebarItems.forEach(item => {
    item.addEventListener('click', async (event) => {
        event.preventDefault();
        const cryptoName = item.querySelector('.label').textContent.toLowerCase(); 

        const cryptoId = {
            bitcoin: 'bitcoin',
            ethereum: 'ethereum',
            litecoin: 'litecoin',
            dogecoin: 'dogecoin',
            ripple: 'ripple'
        }[cryptoName];

        if (cryptoId) {
            const prices = await fetchCryptoPriceData(cryptoId);
            if (prices) {
                updateCryptoChart(prices);
            }
        }
    });
});

const compareButton = document.querySelector('.sidebar-top ul li a:last-child'); 
compareButton.addEventListener('click', async (event) => {
    event.preventDefault();

    const cryptoId1 = 'bitcoin';
    const cryptoId2 = 'ethereum';
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
                            return formatToINR(value); 
                        }
                    }
                }
            }
        }
    });
}

fetchCryptoPriceData('bitcoin').then(prices => {
    if (prices) {
        updateCryptoChart(prices);
    }
});

