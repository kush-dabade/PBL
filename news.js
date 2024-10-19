async function fetchNews() {
    const apiKey = '9646d0642f782e763739ead7babad7c8'; // GNews API key
    const url = `https://gnews.io/api/v4/search?q=cryptocurrency&token=${apiKey}&lang=en&max=9`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        // Log the entire response to check structure
        console.log(data);

        const articlesContainer = document.getElementById('newsContainer');
        articlesContainer.innerHTML = ''; // Clear previous articles

        if (data.articles) { // Check if articles exist in the response
            let displayedArticlesCount = 0; // Counter for displayed articles

            data.articles.forEach(article => {
                // Check if the article has an image and limit to 9 articles
                if (article.image && displayedArticlesCount < 9) {
                    const articleElement = document.createElement('div');
                    articleElement.classList.add('news-item');

                    articleElement.innerHTML = `
                        <img src="${article.image}" alt="${article.title}" />
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
        } else {
            console.error("No articles found in the response.");
            articlesContainer.innerHTML = '<p>Error fetching articles.</p>';
        }
    } catch (error) {
        console.error('Error fetching news:', error);
    }
}

// Call the function to fetch news when the page loads
fetchNews();
