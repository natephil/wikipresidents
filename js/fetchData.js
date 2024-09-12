export async function fetchPresidentPageviews(presidentName) {
    const encodedName = encodeURIComponent(presidentName.replace(/ /g, '_'));
    const pageviewsUrl = `https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia.org/all-access/all-agents/${encodedName}/monthly/20230101/20231231`;

    try {
        // Fetch pageviews data
        const response = await fetch(pageviewsUrl);
        const data = await response.json();
        const pageviews = data.items.map(item => ({
            date: item.timestamp,
            views: item.views
        }));

        // Fetch image data
        const imageResponse = await fetch(`https://en.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages&titles=${encodedName}&pithumbsize=200&origin=*`);
        const imageData = await imageResponse.json();
        const pages = imageData.query.pages;
        const imageUrl = pages[Object.keys(pages)[0]].thumbnail?.source || '';

        return { pageviews, imageUrl }; // Return both pageviews and image URL
    } catch (error) {
        console.error(`Failed to fetch data for ${presidentName}:`, error);
        return { pageviews: [], imageUrl: '' };
    }
  }