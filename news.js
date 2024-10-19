async function fetchNews() {
    const apiKey = 'd7087682e163490a8a7e113dc592d57b';
    const url = `https://newsapi.org/v2/everything?q=cryptocurrency&apiKey=${apiKey}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();

        const articlesContainer = document.getElementById('newsContainer');
        articlesContainer.innerHTML = ''; // Clear previous articles

        let displayedArticlesCount = 0; // Counter for displayed articles

        data.articles.forEach(article => {
            // Check if the article has an image and limit to 9 articles
            if (article.urlToImage && displayedArticlesCount < 9) {
                const articleElement = document.createElement('div');
                articleElement.classList.add('news-item');

                articleElement.innerHTML = `
                    <img src="${article.urlToImage}" alt="${article.title}" />
                    <div class="content">
                        <h2>${article.title}</h2>
                        <p class="news-description">${article.description || ''}</p>
                        <a href="${article.url}" target="_blank" class="read-more">Read more</a>
                    </div>
                `;

                articlesContainer.appendChild(articleElement);
                displayedArticlesCount++;
            }
        });

        // If no articles were displayed, show a message
        if (articlesContainer.innerHTML === '') {
            articlesContainer.innerHTML = '<p>No articles available.</p>';
        }
    } catch (error) {
        console.error('Error fetching news:', error);
    }
}

// Call the function to fetch news when the page loads
fetchNews();
