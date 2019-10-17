/*scrollVis - encapsulates
 * all the code for the visualization
 * using reusable charts pattern:
 * http://bost.ocks.org/mike/chart/
 */
var scrollVis = function() {
  // constants to define the size and margins of the vis area.
  var width = 700;
  var height = 520;
  var margin = { top: 0, left: 20, bottom: 40, right: 10 };

  // Keep track of which visualization we are on and which was the last index activated.
  // When user scrolls quickly, we want to call all the activate functions that they pass.
  var lastIndex = -1;
  var activeIndex = 0;

  // main svg used for visualization
  var svg = null;

  // d3 selection that will be used for displaying visualizations
  var g = null;

  // Color is determined just by the index of the bars
  var barColors = {0: "#008080", 1: "#399785", 2: "#5AAF8C" };

  // here i've hard-coded the year range, if this needs to be dynamic,
  // then more work would need to be done.
  var years = d3.range(1984, 2020);

  var allData = {};

  // The histogram display shows the
  // first 30 minutes of data
  // so the range goes from 0 to 30
  // @v4 using new scale name
  var xHistScale = d3
    .scaleBand()
    .domain(years)
    .range([0, width - 20]);

  // @v4 using new scale name
  var yHistScale = d3.scaleLinear().range([height, 0]);

  // @v4 using new axis name
  var xAxisHist = d3.axisBottom().scale(xHistScale);

  // When scrolling to a new section
  // the activation function for that
  // section is called.
  var activateFunctions = [];
  // If a section has an update function
  // then it is called while scrolling
  // through the section with the current
  // progress through the section.
  var updateFunctions = [];

  /**
   * chart
   *
   * @param selection - the current d3 selection(s)
   *  to draw the visualization in. For this
   *  example, we will be drawing it in #vis
   */
  var chart = function(selection) {
    selection.each(function(rawData) {
      // create svg and give it a width and height
      svg = d3
        .select(this)
        .selectAll("svg")
        .data([rawData]);
      var svgE = svg.enter().append("svg");
      // @v4 use merge to combine enter and existing selection
      svg = svg.merge(svgE);

      svg.attr("width", width + margin.left + margin.right);
      svg.attr("height", height + margin.top + margin.bottom);

      svg.append("g");

      // this group element will be used to contain all
      // other elements.
      g = svg
        .select("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      // run through all our datasets and clean them,
      // then find the max `frequency` so we can set
      // our y scale with it.
      var maxCounts = [];
      Object.keys(rawData).forEach(function(key) {
        rawData[key] = cleanData(rawData[key]);
        maxCounts.push(
          d3.max(rawData[key], function(d) {
            return d.frequency;
          })
        );
      });

      var countMax = d3.max(maxCounts);
      console.log("max count: ", countMax);
      yHistScale.domain([0, countMax]);

      // save the datasets to a global for easy/lazy access later.
      allData = rawData;

      setupVis(allData);

      setupSections();
    });
  };

  /**
   * setupVis - creates initial elements for all
   * sections of the visualization.
   *
   * @param wordData - data object for each word.
   * @param fillerCounts - nested data that includes
   *  element for each filler word type.
   * @param histData - binned histogram data
   */
  var setupVis = function(histData) {
    // intro text title #1
    // count openvis title
    g.append("text")
      .attr("class", "title openvis-title")
      .attr("x", width / 2)
      .attr("y", height / 3)
      .text("Jeopardy!")
      .style("fill", "#008080");

    g.append("text")
      .attr("class", "sub-title openvis-title")
      .attr("x", width / 2)
      .attr("y", height / 3 + height / 5)
      .text("A scrollstory");

    g.selectAll(".openvis-title").attr("opacity", 0);

    // intro text title #2
    // count filler word count title
    g.append("text")
      .attr("class", "title count-title highlight")
      .attr("x", width / 2)
      .attr("y", height / 3)
      .text("testing");

    g.append("text")
      .attr("class", "sub-title count-title")
      .attr("x", width / 2)
      .attr("y", height / 3 + height / 5)
      .text("1, 2, 3...");

    g.selectAll(".count-title").attr("opacity", 0);

    // here we bind the .hist rects to some data -
    // just to get them into position.
    // if not all datasets will have all years, this might cause some problems...
    var hist = g.selectAll(".hist").data(histData["teddy"]);
    var histE = hist
      .enter()
      .append("rect")
      .attr("class", "hist");
    hist = hist
      .merge(histE)
      .attr("x", function(d) {
        return xHistScale(d.year);
      })
      .attr("y", height)
      .attr("height", 0)
      .attr("width", xHistScale.bandwidth())
      .attr("fill", barColors[0])
      .attr("opacity", 0);
  };

  /*setupSections - each section is activated by a separate function. Here we associate these functions to the sections based on the section's index.*/
  var setupSections = function() {
    // activateFunctions are called each
    // time the active section changes
    activateFunctions[0] = showTitle;
    activateFunctions[1] = showFillerTitle;
    activateFunctions[2] = showGeorgeWashHist;
    activateFunctions[3] = showjAdamsHist; // <- note the use of the other callback function
    activateFunctions[4] = showtJeffHist;
    activateFunctions[5] = showjMadisonHist;
    activateFunctions[6] = showjMonroeHist;
    activateFunctions[7] = showjqAdamsHist;
    activateFunctions[8] = showaJacksonHist;
    activateFunctions[9] = showmvBurenHist;
    activateFunctions[10] = showTeddyHist;

    // updateFunctions are called while in a particular section to update the scroll progress in that section.
    // Most sections do not need to be updated for all scrolling and so are set to no-op functions.
    for (var i = 0; i < 9; i++) {
      updateFunctions[i] = function() {};
    }
  };

  /* ACTIVATE FUNCTIONS
   * These will be called their section is scrolled to.*/
  /* showTitle - initial title
   * hides: count title
   * (no previous step to hide)
   * shows: intro title*/
  function showTitle() {
    g.selectAll(".count-title")
      .transition()
      .duration(0)
      .attr("opacity", 0);

    g.selectAll(".openvis-title")
      .transition()
      .duration(600)
      .attr("opacity", 1.0);
  }

  /*showFillerTitle - filler counts
   * hides: intro title
   * hides: histogram
   * shows: filler count title*/
  function showFillerTitle() {
    g.selectAll(".openvis-title")
      .transition()
      .duration(0)
      .attr("opacity", 0);

    //hides the axis
    g.select(".x.axis")
      .transition()
      .duration(500)
      .style("opacity", 0);
    //hides the histogram
    g.selectAll(".hist")
      .transition()
      .duration(600)
      .attr("height", function() {
        return 0;
      })
      .attr("y", function() {
        return height;
      })
      .style("opacity", 0);

    g.selectAll(".count-title")
      .transition()
      .duration(600)
      .attr("opacity", 1);
  }

  // These functions call the showHistAll function with
  // different datasets, allowing the data to change in the histogram.
  function showTeddyHist() {
    showHistAll(allData["teddy"]);
  }

  function showGeorgeWashHist() {
    showHistAll(allData["georgeWash"]);
  }

  function showjAdamsHist() {
    showHistAll(allData["jAdams"]);
  }
  
  function showtJeffHist() {
    showHistAll(allData["tJeff"]);
  }

  function showjMadisonHist() {
    showHistAll(allData["jMadison"]);
  }

  function showjMonroeHist() {
    showHistAll(allData["jMonroe"]);
  }

  function showjqAdamsHist() {
    showHistAll(allData["jqAdams"]);
  }

  function showaJacksonHist() {
    showHistAll(allData["aJackson"]);
  }

  function showmvBurenHist() {
    showHistAll(allData["mvBuren"]);
  }

  /* showHistAll - show all of the histogram
   * hides: cough title and color (previous step was also part of the histogram. But now it isn't so you need to hide the axis)*/
  function showHistAll(data) {
    // ensure the axis to histogram one
    showAxis(xAxisHist);

    g.selectAll(".count-title")
      .transition()
      .duration(0)
      .attr("opacity", 0);

    // here we rebind the .hist rects to the new data, allowing their
    // frequencys to change the y position of the bars.
    var hist = g.selectAll(".hist").data(data);

    // named transition to ensure
    // color change is not clobbered
    hist
      .transition("color")
      .duration(500)
      .style("fill", "#008080");

    hist
      .transition()
      .duration(1200)
      .attr("y", function(d) {
        return yHistScale(d.frequency);
      })
      .attr("height", function(d) {
        return height - yHistScale(d.frequency);
      })
      .style("opacity", 1.0);
  }

  /*showAxis - helper function to display particular xAxis @param axis - the axis to show (xAxisHist or xAxisBar)*/
  function showAxis(axis) {
    g.select(".x.axis")
      .call(axis)
      .transition()
      .duration(500)
      .style("opacity", 1);
  }

  /*hideAxis - helper function to hide the axis*/
  function hideAxis() {
    g.select(".x.axis")
      .transition()
      .duration(500)
      .style("opacity", 0);
  }
  /* DATA FUNCTIONS: Used to coerce the data into the formats we need to visualize*/

  function cleanData(data) {
    data.forEach(function(datum) {
      datum.frequency = +datum.frequency;
      datum.year = +datum.year;
    });

    return data;
  }

  /**
   * activate -
   *
   * @param index - index of the activated section
   */
  chart.activate = function(index) {
    activeIndex = index;
    var sign = activeIndex - lastIndex < 0 ? -1 : 1;
    var scrolledSections = d3.range(lastIndex + sign, activeIndex + sign, sign);
    scrolledSections.forEach(function(i) {
      activateFunctions[i]();
    });
    lastIndex = activeIndex;
  };

  /**
   * update
   * @param index
   * @param progress
   */
  chart.update = function(index, progress) {
    updateFunctions[index](progress);
  };

  // return chart function
  return chart;
};

/* display - called once data
 * has been loaded.
 * sets up the scroller and
 * displays the visualization.*/
function displayData(error, georgeWashData, jAdamsData, tJeffData, jMadisonData, jMonroeData, jqAdamsData, aJacksonData, mvBurenData, teddyData) {
  // if there is a problem loading the data, we should see something here.
  console.log("data loading errors:", error);

  // i'm just going to combine these into one object...
  // there is probably a more elegant way to pass these
  // datasets to the plot...
  const data = { georgeWash: georgeWashData, jAdams: jAdamsData, tJeff: tJeffData, jMadison: jMadisonData, jMonroe: jMonroeData, jqAdams:jqAdamsData, aJackson: aJacksonData, mvBuren: mvBurenData, teddy: teddyData };
  // create a new plot and
  // display it
  var plot = scrollVis();
  d3.select("#vis")
    .datum(data)
    .call(plot);

  // setup scroll functionality
  var scroll = scroller().container(d3.select("#graphic"));

  // pass in .step selection as the steps
  scroll(d3.selectAll(".step"));

  // setup event handling
  scroll.on("active", function(index) {
    // highlight current step text
    d3.selectAll(".step").style("opacity", function(d, i) {
      return i === index ? 1 : 0.1;
    });

    // activate current section
    plot.activate(index);
  });

  scroll.on("progress", function(index, progress) {
    plot.update(index, progress);
  });
}

// use d3.queue to load multiple datasets.
d3.queue()
    // .defer(d3.tsv, "https://raw.githubusercontent.com/vlandham/jeopardy/quick_histogram_fixes/theodore_roosevelt.tsv")
    .defer(d3.tsv, "https://raw.githubusercontent.com/natephil/jeopardy/gh-pages/president_tsvs/g_wash.tsv")
    .defer(d3.tsv, "https://raw.githubusercontent.com/natephil/jeopardy/gh-pages/president_tsvs/j_adams.tsv")
    .defer(d3.tsv, "https://raw.githubusercontent.com/natephil/jeopardy/gh-pages/president_tsvs/t_jefferson.tsv")
    .defer(d3.tsv, "https://raw.githubusercontent.com/natephil/jeopardy/gh-pages/president_tsvs/j_madison.tsv")
    .defer(d3.tsv, "https://raw.githubusercontent.com/natephil/jeopardy/gh-pages/president_tsvs/j_monroe.tsv")
    .defer(d3.tsv, "https://raw.githubusercontent.com/natephil/jeopardy/gh-pages/president_tsvs/j_q_adams.tsv")
    .defer(d3.tsv, "https://raw.githubusercontent.com/natephil/jeopardy/gh-pages/president_tsvs/a_jackson.tsv")
    .defer(d3.tsv, "https://raw.githubusercontent.com/natephil/jeopardy/gh-pages/president_tsvs/m_v_buren.tsv")
    .defer(d3.tsv, "https://raw.githubusercontent.com/vlandham/jeopardy/quick_histogram_fixes/theodore_roosevelt.tsv")
    .await(displayData);
