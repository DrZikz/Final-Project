// Chart Dimensions
const margin = { top: 50, right: 30, bottom: 100, left: 80 }; // Adjusted margins for axis titles
const width = 1500 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

// Create SVG Container
const svg = d3.select("#chart")
    .append("svg")
    .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

let data;

d3.csv("Expanded_Cleaned_Data_for_D3_Visualization.csv").then(dataset => {
    // Convert numerical fields to numbers
    dataset.forEach(d => {
        d.year = +d.year || 1970;
        d.popularity = +d.popularity || 0;
        d.danceability = +d.danceability || 0;
        d.energy = +d.energy || 0;
        d.valence = +d.valence || 0;
    });

    data = dataset;

    // Scales
    const x = d3.scaleBand()
        .domain(data.map(d => d.year))
        .range([0, width])
        .padding(0.2);

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.popularity)])
        .range([height, 0]);

    const color = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.popularity)])
        .range(["lightblue", "darkblue"]);

    // Add Axes
    const xAxis = svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).tickFormat(d3.format("d")));

    xAxis.selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");

    const yAxis = svg.append("g")
        .call(d3.axisLeft(y));

    // Add Axis Titles
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + 50) // Position below x-axis
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("Year"); // X-axis title

    svg.append("text")
        .attr("x", -height / 2)
        .attr("y", -50) // Position to the left of y-axis
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .style("font-size", "16px")
        .text("Popularity"); // Y-axis title

    // Add Bars
    const bars = svg.selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.year))
        .attr("y", d => y(d.popularity))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d.popularity))
        .attr("fill", d => color(d.popularity))
        .on("mouseover", (event, d) => {
            const tooltip = d3.select("body").append("div")
                .attr("class", "tooltip")
                .html(`
                    <strong>Year:</strong> ${d.year}<br>
                    <strong>Popularity:</strong> ${d.popularity}<br>
                    <strong>Language:</strong> ${d.language}<br>
                    <strong>Artist:</strong> ${d.artist_name}<br>
                    <strong>Track:</strong> ${d.track_name}
                `)
                .style("left", `${event.pageX + 5}px`)
                .style("top", `${event.pageY - 28}px`);
        })
        .on("mouseout", () => {
            d3.select(".tooltip").remove();
        });

    // Filter by Language (Adjust Opacity)
    d3.select("#languageFilter").on("change", function () {
        const selectedLanguage = this.value;

        bars.transition()
            .duration(500)
            .style("opacity", d => {
                return selectedLanguage === "all" || d.language === selectedLanguage ? 1 : 0.3;
            });
    });

    // Sort Bars
    let sorted = false;
    d3.select("#sortBars").on("click", () => {
        sorted = !sorted;

        const sortedData = sorted
            ? [...data].sort((a, b) => b.popularity - a.popularity)
            : [...data].sort((a, b) => a.year - b.year);

        x.domain(sortedData.map(d => d.year));

        bars.transition()
            .duration(500)
            .attr("x", d => x(d.year));

        xAxis.transition().duration(500).call(d3.axisBottom(x).tickFormat(d3.format("d")));

        xAxis.selectAll("text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end");
    });

    // Download Chart
    d3.select("#download").on("click", () => {
        const svgElement = document.querySelector("svg");
        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(svgElement);
        const blob = new Blob([svgString], { type: "image/svg+xml" });

        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "chart.svg";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    });
});
