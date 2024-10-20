async function fetchNews() {
    const apiKey = '9646d0642f782e763739ead7babad7c8';
    const url = `https://gnews.io/api/v4/search?q=cryptocurrency&token=${apiKey}&lang=en&max=9`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        console.log(data);

        const articlesContainer = document.getElementById('newsContainer');
        articlesContainer.innerHTML = '';

        if (data.articles) {
            let displayedArticlesCount = 0;

            data.articles.forEach(article => {
                
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

fetchNews();
