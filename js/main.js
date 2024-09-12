import { fetchPresidentPageviews } from './fetchData.js';
import { renderBarChart } from './renderChart.js';

function setupScroll() {
    const observer = new IntersectionObserver(async (entries) => {
        entries.forEach(async entry => {
            if (entry.isIntersecting) {
                const presidentName = entry.target.getAttribute('data-president');
                const { pageviews, imageUrl } = await fetchPresidentPageviews(presidentName);

                // Clear previous images and append new image under the president's name
                entry.target.querySelectorAll('img').forEach(img => img.remove()); // Remove existing images
                if (imageUrl) {
                    d3.select(entry.target)
                      .append("img")
                      .attr("src", imageUrl)
                      .attr("alt", presidentName)
                      .attr("style", "width: 200px; display: block; margin-top: 10px;");
                }

                renderBarChart(pageviews, presidentName); // Render bar chart in the #vis area
            }
        });
    }, { threshold: 0.6 }); // Trigger when 60% of the section is visible

    // Observe each step
    document.querySelectorAll('.step').forEach(step => observer.observe(step));
}

  // Initialize the scroll functionality
  setupScroll();