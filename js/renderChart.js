// /js/renderChart.js

// Function to render bar chart for a president's data with smooth transitions
export function renderBarChart(data, presidentName) {
    const margin = { top: 20, right: 30, bottom: 40, left: 40 };
    const width = 400 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    // Set up SVG for bar chart, clearing previous content but keeping the existing SVG
    const svg = d3.select("#vis")
      .selectAll("svg")
      .data([null])
      .join("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .selectAll("g")
      .data([null])
      .join("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Set up scales
    const x = d3.scaleBand()
      .domain(data.map(d => d.date))
      .range([0, width])
      .padding(0.1);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.views)])
      .nice()
      .range([height, 0]);

    // Update x-axis
    svg.selectAll(".x-axis")
      .data([null])
      .join("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat(d => d.slice(0, 6))) // Format to show only year-month
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-0.8em")
      .attr("dy", "-0.15em")
      .attr("transform", "rotate(-65)");

    // Update y-axis
    svg.selectAll(".y-axis")
      .data([null])
      .join("g")
      .attr("class", "y-axis")
      .call(d3.axisLeft(y)
        .tickFormat(d3.format("~s"))
      );

    // Bind data to bars and handle enter, update, and exit
    const bars = svg.selectAll(".bar")
      .data(data, d => d.date); // Use date as the key for consistency

    // Enter selection for new bars
    bars.enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", d => x(d.date))
      .attr("width", x.bandwidth())
      .attr("y", height) // Start from the bottom
      .attr("height", 0) // Start with height 0
      .merge(bars) // Merge with update selection
      .transition() // Transition both enter and update
      .duration(1200) // Duration set to 1200 milliseconds
      .ease(d3.easeCubicInOut)
      .attr("x", d => x(d.date))
      .attr("width", x.bandwidth())
      .attr("y", d => y(d.views)) // Transition to correct y position
      .attr("height", d => height - y(d.views)); // Transition to correct height

    // Exit selection for bars no longer needed
    bars.exit()
      .transition() // Smooth exit transition
      .duration(500)
      .attr("height", 0) // Shrink height to 0
      .attr("y", height) // Move to the bottom
      .remove(); // Remove after transition
}
