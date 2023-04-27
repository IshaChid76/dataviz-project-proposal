(function (d3$1) {
  'use strict';

  const axes = (
    selection,
    {
      xScale,
      yScale,
      xAxisLabel,
      yAxisLabel,
      xAxisLabelOffset = 25,
      yAxisLabelOffset = 60,
    }
  ) => {
    selection
      .selectAll('g.y-axis')
      .data([null])
      .join('g')
      .attr('class', 'y-axis')
      .attr(
        'transform',
        `translate(${xScale.range()[0]},0)`
      )
      .call(d3$1.axisLeft(yScale));

    selection
      .selectAll('g.x-axis')
      .data([null])
      .join('g')
      .attr('class', 'x-axis')
      .attr(
        'transform',
        `translate(0,${yScale.range()[0]})`
      )
      .call(d3$1.axisBottom(xScale));

    selection
      .selectAll('text.x-axis-label')
      .data([null])
      .join('text')
      .attr(
        'x',
        (xScale.range()[0] + xScale.range()[1]) / 2
      )
      .attr(
        'y',
        yScale.range()[0] + xAxisLabelOffset
      )
      .attr('class', 'x-axis-label')
      .attr('alignment-baseline', 'hanging')
      .attr('text-anchor', 'middle')
      .attr('font-family', 'sans-serif')
      .text(xAxisLabel);

    selection
      .selectAll('text.y-axis-label')
      .data([null])
      .join('text')
      .attr('class', 'y-axis-label')
      .attr('text-anchor', 'middle')
      .attr('transform', 'rotate(-90)')
      .attr('font-family', 'sans-serif')
      .attr(
        'x',
        -(yScale.range()[0] + yScale.range()[1]) / 2
      )
      .attr(
        'y',
        xScale.range()[0] - yAxisLabelOffset
      )
      .text(yAxisLabel);
  };

  const colorLegend = (
    selection,
    {
      colorScale,
      colorLegendLabel,
      colorLegendX,
      colorLegendY,
      tickSpacing = 15,
      tickPadding = 15,
      colorLegendLabelX = -10,
      colorLegendLabelY = -24,
      setHoveredValue,
      hoveredValue
    }
  ) => {
    const colorLegendG = selection
      .selectAll('g.color-legend')
      .data([null])
      .join('g')
      .attr('class', 'color-legend')
      .attr(
        'transform',
        `translate(${colorLegendX},${colorLegendY})`
      );

    colorLegendG
      .selectAll('text.color-legend-label')
      .data([null])
      .join('text')
      .attr('x', colorLegendLabelX)
      .attr('y', colorLegendLabelY)
      .attr('class', 'color-legend-label')
      .attr('font-family', 'sans-serif')
      .text(colorLegendLabel);

    colorLegendG
      .selectAll('g.tick')
      .data(colorScale.domain())
      .join((enter) =>
        enter
          .append('g')
          .attr('class', 'tick')
          .call((selection) => {
            selection.append('circle');
            selection.append('text');
          })
      )
      .attr(
        'transform',
        (d, i) => `translate(0, ${i * tickSpacing})`
      )
      .attr('font-size', 10)
      .attr('font-family', 'sans-serif')
      .call((selection) => {
        selection
          .select('circle')
          .attr('r', 6)
          .attr('fill', colorScale);
      		// .attr('fill-opacity', 0.6);
        selection.select('text')
          .attr('dy', '0.32em')
          .attr('x', tickPadding)
          .text((d) => d);
      })
    	.attr('opacity', d => 
            hoveredValue ? (d === hoveredValue ? 1 : 0.2) : 1
      )
    	.on('mouseover', (event, d) => {
      	setHoveredValue(d);
    	})
    	.on('mouseout', () => {
      	setHoveredValue(null);
    	});
  };

  const scatterPlot = (
    selection,
    { data, 
     	width,
     	height, 
     	xValue, 
     	yValue, 
      colorValue,
     	xAxisLabel, 
     	yAxisLabel, 
     	margin,
      colorLegendLabel,
      colorLegendX,
      colorLegendY,
     	setHoveredValue,
     	hoveredValue
    }
  ) => {
    const xScale = d3$1.scaleLog()
      .domain([30000, 9000000])
      .range([margin.left, width - margin.right]);

    const yScale = d3$1.scaleLinear()
    	.domain([5000, 260000])
      .range([height - margin.bottom, margin.top]);
    
    const colorScale = d3$1.scaleOrdinal()
      .domain(data.map(colorValue))
      .range(d3$1.schemeCategory10);
    
    // var color = scaleOrdinal()
    //   .domain(["English", "Portuguese", "Spanish", "Korean"])
    //   .range([ "#D0270399", "#21908d99", "#fde72599", "#0920E999"])
    
    selection.call(axes, {
      xScale,
      yScale,
      xAxisLabel,
      yAxisLabel,
    });
    
    selection.call(colorLegend, {
      colorScale,
      colorLegendLabel,
      colorLegendX,
      colorLegendY,
      setHoveredValue,
      hoveredValue
    });
    
    const tooltip = d3
      .select('body')
      .append('div')
      .attr('class', 'd3-tooltip')
      .style('position', 'absolute')
      .style('z-index', '10')
      .style('visibility', 'hidden')
      .style('padding', '5px')
      .style('background', 'rgba(0,0,0,0.6)')
      .style('border-radius', '5px')
      .style('color', 'white');

    selection
      .selectAll('circle.mark')
      .data(data)
      .join('circle')
    	.attr('class', 'mark')
      .attr('cx', (d) => xScale(xValue(d)))
      .attr('cy', (d) => yScale(yValue(d)))
    	.attr('fill', (d) =>
        colorScale(colorValue(d))
      )
      .attr('r', 8)
    	.attr('opacity', (d) => 
          hoveredValue 
            ? colorValue(d) === hoveredValue 
            	? 1 
            	: 0
            : 1
      )
    	.on('mouseover', function (e, d) {
          tooltip
            .html(`${d.Channel}`)
            .style('visibility', 'visible');
      })
    	.on('mousemove', function () {
        tooltip
          .style('top', event.pageY - 10 + 'px')
          .style('left', event.pageX + 10 + 'px');
      })
      .on('mouseout', function () {
        tooltip
          .html(``)
          .style('visibility', 'hidden');
      });
  };

  const viz = (
    container,
    { state, setState }
  ) => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    const svg = d3$1.select(container)
      .selectAll('svg')
      .data([null])
      .join('svg')
      .attr('width', width)
      .attr('height', height);

    // state.data could be:
    // * undefined
    // * 'LOADING'
    // * An array of objects
    const { data, hoveredValue } = state;
    
    const setHoveredValue = (d) => {
      setState((state) => ({
      	...state,
        hoveredValue: d
      }));
    };

    if (data && data !== 'LOADING') {
      svg.call(scatterPlot, {
        data,
        width,
        height,
        xValue: (d) => d.Followers,
        yValue: (d) => d.Stream_time_minutes,
        colorValue: (d) => d.Language,
        xAxisLabel: 'Total Followers',
        yAxisLabel: 'Total Streaming Time (minutes)',
        margin: {
          top: 10,
          right: 30,
          bottom: 50,
          left: 80,
        },
        colorLegendLabel: 'Languages',
        colorLegendX: 850,
        colorLegendY: 50,
        setHoveredValue,
        hoveredValue,
      });
    }

    if (data === undefined) {
      setState((state) => ({
        ...state,
        data: 'LOADING',
      }));
      fetch('data.csv')
        .then((response) => response.text())
        .then((csvString) => {
          const data = d3$1.csvParse(csvString);
        
          for (const d of data) {
            d.Watch_time_minutes = +d.Watch_time_minutes;
            d.Stream_time_minutes = +d.Stream_time_minutes;
            d.Peak_viewers = +d.Peak_viewers;
            d.Average_viewers = +d.Average_viewers;
            d.Followers = +d.Followers;
            d.Followers_gained = +d.Followers_gained;
            d.Views_gained = +d.Views_gained;
          }
          setState((state) => ({
            ...state,
            data,
          }));
        });
    }
  };

  const container = d3$1.select('#app').node();
  let state = {};

  const render = () => {
    viz(container, {
      state,
      setState,
    });
  };

  const setState = (next) => {
    state = next(state);
    render();
  };

  render();

}(d3));

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbImF4ZXMuanMiLCJjb2xvckxlZ2VuZC5qcyIsInNjYXR0ZXJQbG90LmpzIiwidml6LmpzIiwiaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgYXhpc0xlZnQsIGF4aXNCb3R0b20gfSBmcm9tICdkMyc7XG5cbmV4cG9ydCBjb25zdCBheGVzID0gKFxuICBzZWxlY3Rpb24sXG4gIHtcbiAgICB4U2NhbGUsXG4gICAgeVNjYWxlLFxuICAgIHhBeGlzTGFiZWwsXG4gICAgeUF4aXNMYWJlbCxcbiAgICB4QXhpc0xhYmVsT2Zmc2V0ID0gMjUsXG4gICAgeUF4aXNMYWJlbE9mZnNldCA9IDYwLFxuICB9XG4pID0+IHtcbiAgc2VsZWN0aW9uXG4gICAgLnNlbGVjdEFsbCgnZy55LWF4aXMnKVxuICAgIC5kYXRhKFtudWxsXSlcbiAgICAuam9pbignZycpXG4gICAgLmF0dHIoJ2NsYXNzJywgJ3ktYXhpcycpXG4gICAgLmF0dHIoXG4gICAgICAndHJhbnNmb3JtJyxcbiAgICAgIGB0cmFuc2xhdGUoJHt4U2NhbGUucmFuZ2UoKVswXX0sMClgXG4gICAgKVxuICAgIC5jYWxsKGF4aXNMZWZ0KHlTY2FsZSkpO1xuXG4gIHNlbGVjdGlvblxuICAgIC5zZWxlY3RBbGwoJ2cueC1heGlzJylcbiAgICAuZGF0YShbbnVsbF0pXG4gICAgLmpvaW4oJ2cnKVxuICAgIC5hdHRyKCdjbGFzcycsICd4LWF4aXMnKVxuICAgIC5hdHRyKFxuICAgICAgJ3RyYW5zZm9ybScsXG4gICAgICBgdHJhbnNsYXRlKDAsJHt5U2NhbGUucmFuZ2UoKVswXX0pYFxuICAgIClcbiAgICAuY2FsbChheGlzQm90dG9tKHhTY2FsZSkpO1xuXG4gIHNlbGVjdGlvblxuICAgIC5zZWxlY3RBbGwoJ3RleHQueC1heGlzLWxhYmVsJylcbiAgICAuZGF0YShbbnVsbF0pXG4gICAgLmpvaW4oJ3RleHQnKVxuICAgIC5hdHRyKFxuICAgICAgJ3gnLFxuICAgICAgKHhTY2FsZS5yYW5nZSgpWzBdICsgeFNjYWxlLnJhbmdlKClbMV0pIC8gMlxuICAgIClcbiAgICAuYXR0cihcbiAgICAgICd5JyxcbiAgICAgIHlTY2FsZS5yYW5nZSgpWzBdICsgeEF4aXNMYWJlbE9mZnNldFxuICAgIClcbiAgICAuYXR0cignY2xhc3MnLCAneC1heGlzLWxhYmVsJylcbiAgICAuYXR0cignYWxpZ25tZW50LWJhc2VsaW5lJywgJ2hhbmdpbmcnKVxuICAgIC5hdHRyKCd0ZXh0LWFuY2hvcicsICdtaWRkbGUnKVxuICAgIC5hdHRyKCdmb250LWZhbWlseScsICdzYW5zLXNlcmlmJylcbiAgICAudGV4dCh4QXhpc0xhYmVsKTtcblxuICBzZWxlY3Rpb25cbiAgICAuc2VsZWN0QWxsKCd0ZXh0LnktYXhpcy1sYWJlbCcpXG4gICAgLmRhdGEoW251bGxdKVxuICAgIC5qb2luKCd0ZXh0JylcbiAgICAuYXR0cignY2xhc3MnLCAneS1heGlzLWxhYmVsJylcbiAgICAuYXR0cigndGV4dC1hbmNob3InLCAnbWlkZGxlJylcbiAgICAuYXR0cigndHJhbnNmb3JtJywgJ3JvdGF0ZSgtOTApJylcbiAgICAuYXR0cignZm9udC1mYW1pbHknLCAnc2Fucy1zZXJpZicpXG4gICAgLmF0dHIoXG4gICAgICAneCcsXG4gICAgICAtKHlTY2FsZS5yYW5nZSgpWzBdICsgeVNjYWxlLnJhbmdlKClbMV0pIC8gMlxuICAgIClcbiAgICAuYXR0cihcbiAgICAgICd5JyxcbiAgICAgIHhTY2FsZS5yYW5nZSgpWzBdIC0geUF4aXNMYWJlbE9mZnNldFxuICAgIClcbiAgICAudGV4dCh5QXhpc0xhYmVsKTtcbn07IiwiZXhwb3J0IGNvbnN0IGNvbG9yTGVnZW5kID0gKFxuICBzZWxlY3Rpb24sXG4gIHtcbiAgICBjb2xvclNjYWxlLFxuICAgIGNvbG9yTGVnZW5kTGFiZWwsXG4gICAgY29sb3JMZWdlbmRYLFxuICAgIGNvbG9yTGVnZW5kWSxcbiAgICB0aWNrU3BhY2luZyA9IDE1LFxuICAgIHRpY2tQYWRkaW5nID0gMTUsXG4gICAgY29sb3JMZWdlbmRMYWJlbFggPSAtMTAsXG4gICAgY29sb3JMZWdlbmRMYWJlbFkgPSAtMjQsXG4gICAgc2V0SG92ZXJlZFZhbHVlLFxuICAgIGhvdmVyZWRWYWx1ZVxuICB9XG4pID0+IHtcbiAgY29uc3QgY29sb3JMZWdlbmRHID0gc2VsZWN0aW9uXG4gICAgLnNlbGVjdEFsbCgnZy5jb2xvci1sZWdlbmQnKVxuICAgIC5kYXRhKFtudWxsXSlcbiAgICAuam9pbignZycpXG4gICAgLmF0dHIoJ2NsYXNzJywgJ2NvbG9yLWxlZ2VuZCcpXG4gICAgLmF0dHIoXG4gICAgICAndHJhbnNmb3JtJyxcbiAgICAgIGB0cmFuc2xhdGUoJHtjb2xvckxlZ2VuZFh9LCR7Y29sb3JMZWdlbmRZfSlgXG4gICAgKTtcblxuICBjb2xvckxlZ2VuZEdcbiAgICAuc2VsZWN0QWxsKCd0ZXh0LmNvbG9yLWxlZ2VuZC1sYWJlbCcpXG4gICAgLmRhdGEoW251bGxdKVxuICAgIC5qb2luKCd0ZXh0JylcbiAgICAuYXR0cigneCcsIGNvbG9yTGVnZW5kTGFiZWxYKVxuICAgIC5hdHRyKCd5JywgY29sb3JMZWdlbmRMYWJlbFkpXG4gICAgLmF0dHIoJ2NsYXNzJywgJ2NvbG9yLWxlZ2VuZC1sYWJlbCcpXG4gICAgLmF0dHIoJ2ZvbnQtZmFtaWx5JywgJ3NhbnMtc2VyaWYnKVxuICAgIC50ZXh0KGNvbG9yTGVnZW5kTGFiZWwpO1xuXG4gIGNvbG9yTGVnZW5kR1xuICAgIC5zZWxlY3RBbGwoJ2cudGljaycpXG4gICAgLmRhdGEoY29sb3JTY2FsZS5kb21haW4oKSlcbiAgICAuam9pbigoZW50ZXIpID0+XG4gICAgICBlbnRlclxuICAgICAgICAuYXBwZW5kKCdnJylcbiAgICAgICAgLmF0dHIoJ2NsYXNzJywgJ3RpY2snKVxuICAgICAgICAuY2FsbCgoc2VsZWN0aW9uKSA9PiB7XG4gICAgICAgICAgc2VsZWN0aW9uLmFwcGVuZCgnY2lyY2xlJyk7XG4gICAgICAgICAgc2VsZWN0aW9uLmFwcGVuZCgndGV4dCcpO1xuICAgICAgICB9KVxuICAgIClcbiAgICAuYXR0cihcbiAgICAgICd0cmFuc2Zvcm0nLFxuICAgICAgKGQsIGkpID0+IGB0cmFuc2xhdGUoMCwgJHtpICogdGlja1NwYWNpbmd9KWBcbiAgICApXG4gICAgLmF0dHIoJ2ZvbnQtc2l6ZScsIDEwKVxuICAgIC5hdHRyKCdmb250LWZhbWlseScsICdzYW5zLXNlcmlmJylcbiAgICAuY2FsbCgoc2VsZWN0aW9uKSA9PiB7XG4gICAgICBzZWxlY3Rpb25cbiAgICAgICAgLnNlbGVjdCgnY2lyY2xlJylcbiAgICAgICAgLmF0dHIoJ3InLCA2KVxuICAgICAgICAuYXR0cignZmlsbCcsIGNvbG9yU2NhbGUpO1xuICAgIFx0XHQvLyAuYXR0cignZmlsbC1vcGFjaXR5JywgMC42KTtcbiAgICAgIHNlbGVjdGlvbi5zZWxlY3QoJ3RleHQnKVxuICAgICAgICAuYXR0cignZHknLCAnMC4zMmVtJylcbiAgICAgICAgLmF0dHIoJ3gnLCB0aWNrUGFkZGluZylcbiAgICAgICAgLnRleHQoKGQpID0+IGQpO1xuICAgIH0pXG4gIFx0LmF0dHIoJ29wYWNpdHknLCBkID0+IFxuICAgICAgICAgIGhvdmVyZWRWYWx1ZSA/IChkID09PSBob3ZlcmVkVmFsdWUgPyAxIDogMC4yKSA6IDFcbiAgICApXG4gIFx0Lm9uKCdtb3VzZW92ZXInLCAoZXZlbnQsIGQpID0+IHtcbiAgICBcdHNldEhvdmVyZWRWYWx1ZShkKTtcbiAgXHR9KVxuICBcdC5vbignbW91c2VvdXQnLCAoKSA9PiB7XG4gICAgXHRzZXRIb3ZlcmVkVmFsdWUobnVsbCk7XG4gIFx0fSlcbn07IiwiaW1wb3J0IHsgZXh0ZW50LCBzY2FsZUxpbmVhciwgc2NhbGVMb2csIHNjYWxlT3JkaW5hbCwgc2NoZW1lQ2F0ZWdvcnkxMCB9IGZyb20gJ2QzJztcbmltcG9ydCB7IGF4ZXMgfSBmcm9tICcuL2F4ZXMnO1xuaW1wb3J0IHsgY29sb3JMZWdlbmQgfSBmcm9tICcuL2NvbG9yTGVnZW5kJztcblxuZXhwb3J0IGNvbnN0IHNjYXR0ZXJQbG90ID0gKFxuICBzZWxlY3Rpb24sXG4gIHsgZGF0YSwgXG4gICBcdHdpZHRoLFxuICAgXHRoZWlnaHQsIFxuICAgXHR4VmFsdWUsIFxuICAgXHR5VmFsdWUsIFxuICAgIGNvbG9yVmFsdWUsXG4gICBcdHhBeGlzTGFiZWwsIFxuICAgXHR5QXhpc0xhYmVsLCBcbiAgIFx0bWFyZ2luLFxuICAgIGNvbG9yTGVnZW5kTGFiZWwsXG4gICAgY29sb3JMZWdlbmRYLFxuICAgIGNvbG9yTGVnZW5kWSxcbiAgIFx0c2V0SG92ZXJlZFZhbHVlLFxuICAgXHRob3ZlcmVkVmFsdWVcbiAgfVxuKSA9PiB7XG4gIGNvbnN0IHhTY2FsZSA9IHNjYWxlTG9nKClcbiAgICAuZG9tYWluKFszMDAwMCwgOTAwMDAwMF0pXG4gICAgLnJhbmdlKFttYXJnaW4ubGVmdCwgd2lkdGggLSBtYXJnaW4ucmlnaHRdKTtcblxuICBjb25zdCB5U2NhbGUgPSBzY2FsZUxpbmVhcigpXG4gIFx0LmRvbWFpbihbNTAwMCwgMjYwMDAwXSlcbiAgICAucmFuZ2UoW2hlaWdodCAtIG1hcmdpbi5ib3R0b20sIG1hcmdpbi50b3BdKTtcbiAgXG4gIGNvbnN0IGNvbG9yU2NhbGUgPSBzY2FsZU9yZGluYWwoKVxuICAgIC5kb21haW4oZGF0YS5tYXAoY29sb3JWYWx1ZSkpXG4gICAgLnJhbmdlKHNjaGVtZUNhdGVnb3J5MTApO1xuICBcbiAgLy8gdmFyIGNvbG9yID0gc2NhbGVPcmRpbmFsKClcbiAgLy8gICAuZG9tYWluKFtcIkVuZ2xpc2hcIiwgXCJQb3J0dWd1ZXNlXCIsIFwiU3BhbmlzaFwiLCBcIktvcmVhblwiXSlcbiAgLy8gICAucmFuZ2UoWyBcIiNEMDI3MDM5OVwiLCBcIiMyMTkwOGQ5OVwiLCBcIiNmZGU3MjU5OVwiLCBcIiMwOTIwRTk5OVwiXSlcbiAgXG4gIHNlbGVjdGlvbi5jYWxsKGF4ZXMsIHtcbiAgICB4U2NhbGUsXG4gICAgeVNjYWxlLFxuICAgIHhBeGlzTGFiZWwsXG4gICAgeUF4aXNMYWJlbCxcbiAgfSk7XG4gIFxuICBzZWxlY3Rpb24uY2FsbChjb2xvckxlZ2VuZCwge1xuICAgIGNvbG9yU2NhbGUsXG4gICAgY29sb3JMZWdlbmRMYWJlbCxcbiAgICBjb2xvckxlZ2VuZFgsXG4gICAgY29sb3JMZWdlbmRZLFxuICAgIHNldEhvdmVyZWRWYWx1ZSxcbiAgICBob3ZlcmVkVmFsdWVcbiAgfSk7XG4gIFxuICBjb25zdCB0b29sdGlwID0gZDNcbiAgICAuc2VsZWN0KCdib2R5JylcbiAgICAuYXBwZW5kKCdkaXYnKVxuICAgIC5hdHRyKCdjbGFzcycsICdkMy10b29sdGlwJylcbiAgICAuc3R5bGUoJ3Bvc2l0aW9uJywgJ2Fic29sdXRlJylcbiAgICAuc3R5bGUoJ3otaW5kZXgnLCAnMTAnKVxuICAgIC5zdHlsZSgndmlzaWJpbGl0eScsICdoaWRkZW4nKVxuICAgIC5zdHlsZSgncGFkZGluZycsICc1cHgnKVxuICAgIC5zdHlsZSgnYmFja2dyb3VuZCcsICdyZ2JhKDAsMCwwLDAuNiknKVxuICAgIC5zdHlsZSgnYm9yZGVyLXJhZGl1cycsICc1cHgnKVxuICAgIC5zdHlsZSgnY29sb3InLCAnd2hpdGUnKTtcblxuICBzZWxlY3Rpb25cbiAgICAuc2VsZWN0QWxsKCdjaXJjbGUubWFyaycpXG4gICAgLmRhdGEoZGF0YSlcbiAgICAuam9pbignY2lyY2xlJylcbiAgXHQuYXR0cignY2xhc3MnLCAnbWFyaycpXG4gICAgLmF0dHIoJ2N4JywgKGQpID0+IHhTY2FsZSh4VmFsdWUoZCkpKVxuICAgIC5hdHRyKCdjeScsIChkKSA9PiB5U2NhbGUoeVZhbHVlKGQpKSlcbiAgXHQuYXR0cignZmlsbCcsIChkKSA9PlxuICAgICAgY29sb3JTY2FsZShjb2xvclZhbHVlKGQpKVxuICAgIClcbiAgICAuYXR0cigncicsIDgpXG4gIFx0LmF0dHIoJ29wYWNpdHknLCAoZCkgPT4gXG4gICAgICAgIGhvdmVyZWRWYWx1ZSBcbiAgICAgICAgICA/IGNvbG9yVmFsdWUoZCkgPT09IGhvdmVyZWRWYWx1ZSBcbiAgICAgICAgICBcdD8gMSBcbiAgICAgICAgICBcdDogMFxuICAgICAgICAgIDogMVxuICAgIClcbiAgXHQub24oJ21vdXNlb3ZlcicsIGZ1bmN0aW9uIChlLCBkKSB7XG4gICAgICAgIHRvb2x0aXBcbiAgICAgICAgICAuaHRtbChgJHtkLkNoYW5uZWx9YClcbiAgICAgICAgICAuc3R5bGUoJ3Zpc2liaWxpdHknLCAndmlzaWJsZScpO1xuICAgIH0pXG4gIFx0Lm9uKCdtb3VzZW1vdmUnLCBmdW5jdGlvbiAoKSB7XG4gICAgICB0b29sdGlwXG4gICAgICAgIC5zdHlsZSgndG9wJywgZXZlbnQucGFnZVkgLSAxMCArICdweCcpXG4gICAgICAgIC5zdHlsZSgnbGVmdCcsIGV2ZW50LnBhZ2VYICsgMTAgKyAncHgnKTtcbiAgICB9KVxuICAgIC5vbignbW91c2VvdXQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICB0b29sdGlwXG4gICAgICAgIC5odG1sKGBgKVxuICAgICAgICAuc3R5bGUoJ3Zpc2liaWxpdHknLCAnaGlkZGVuJyk7XG4gICAgfSk7XG59O1xuIiwiaW1wb3J0IHsgY3N2UGFyc2UsIHNlbGVjdCwgbWFwIH0gZnJvbSAnZDMnO1xuaW1wb3J0IHsgc2NhdHRlclBsb3QgfSBmcm9tICcuL3NjYXR0ZXJQbG90JztcblxuZXhwb3J0IGNvbnN0IHZpeiA9IChcbiAgY29udGFpbmVyLFxuICB7IHN0YXRlLCBzZXRTdGF0ZSB9XG4pID0+IHtcbiAgY29uc3Qgd2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aDtcbiAgY29uc3QgaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0O1xuICBcbiAgY29uc3Qgc3ZnID0gc2VsZWN0KGNvbnRhaW5lcilcbiAgICAuc2VsZWN0QWxsKCdzdmcnKVxuICAgIC5kYXRhKFtudWxsXSlcbiAgICAuam9pbignc3ZnJylcbiAgICAuYXR0cignd2lkdGgnLCB3aWR0aClcbiAgICAuYXR0cignaGVpZ2h0JywgaGVpZ2h0KTtcblxuICAvLyBzdGF0ZS5kYXRhIGNvdWxkIGJlOlxuICAvLyAqIHVuZGVmaW5lZFxuICAvLyAqICdMT0FESU5HJ1xuICAvLyAqIEFuIGFycmF5IG9mIG9iamVjdHNcbiAgY29uc3QgeyBkYXRhLCBob3ZlcmVkVmFsdWUgfSA9IHN0YXRlO1xuICBcbiAgY29uc3Qgc2V0SG92ZXJlZFZhbHVlID0gKGQpID0+IHtcbiAgICBzZXRTdGF0ZSgoc3RhdGUpID0+ICh7XG4gICAgXHQuLi5zdGF0ZSxcbiAgICAgIGhvdmVyZWRWYWx1ZTogZFxuICAgIH0pKTtcbiAgfTtcblxuICBpZiAoZGF0YSAmJiBkYXRhICE9PSAnTE9BRElORycpIHtcbiAgICBzdmcuY2FsbChzY2F0dGVyUGxvdCwge1xuICAgICAgZGF0YSxcbiAgICAgIHdpZHRoLFxuICAgICAgaGVpZ2h0LFxuICAgICAgeFZhbHVlOiAoZCkgPT4gZC5Gb2xsb3dlcnMsXG4gICAgICB5VmFsdWU6IChkKSA9PiBkLlN0cmVhbV90aW1lX21pbnV0ZXMsXG4gICAgICBjb2xvclZhbHVlOiAoZCkgPT4gZC5MYW5ndWFnZSxcbiAgICAgIHhBeGlzTGFiZWw6ICdUb3RhbCBGb2xsb3dlcnMnLFxuICAgICAgeUF4aXNMYWJlbDogJ1RvdGFsIFN0cmVhbWluZyBUaW1lIChtaW51dGVzKScsXG4gICAgICBtYXJnaW46IHtcbiAgICAgICAgdG9wOiAxMCxcbiAgICAgICAgcmlnaHQ6IDMwLFxuICAgICAgICBib3R0b206IDUwLFxuICAgICAgICBsZWZ0OiA4MCxcbiAgICAgIH0sXG4gICAgICBjb2xvckxlZ2VuZExhYmVsOiAnTGFuZ3VhZ2VzJyxcbiAgICAgIGNvbG9yTGVnZW5kWDogODUwLFxuICAgICAgY29sb3JMZWdlbmRZOiA1MCxcbiAgICAgIHNldEhvdmVyZWRWYWx1ZSxcbiAgICAgIGhvdmVyZWRWYWx1ZSxcbiAgICB9KTtcbiAgfVxuXG4gIGlmIChkYXRhID09PSB1bmRlZmluZWQpIHtcbiAgICBzZXRTdGF0ZSgoc3RhdGUpID0+ICh7XG4gICAgICAuLi5zdGF0ZSxcbiAgICAgIGRhdGE6ICdMT0FESU5HJyxcbiAgICB9KSk7XG4gICAgZmV0Y2goJ2RhdGEuY3N2JylcbiAgICAgIC50aGVuKChyZXNwb25zZSkgPT4gcmVzcG9uc2UudGV4dCgpKVxuICAgICAgLnRoZW4oKGNzdlN0cmluZykgPT4ge1xuICAgICAgICBjb25zdCBkYXRhID0gY3N2UGFyc2UoY3N2U3RyaW5nKTtcbiAgICAgIFxuICAgICAgICBmb3IgKGNvbnN0IGQgb2YgZGF0YSkge1xuICAgICAgICAgIGQuV2F0Y2hfdGltZV9taW51dGVzID0gK2QuV2F0Y2hfdGltZV9taW51dGVzO1xuICAgICAgICAgIGQuU3RyZWFtX3RpbWVfbWludXRlcyA9ICtkLlN0cmVhbV90aW1lX21pbnV0ZXM7XG4gICAgICAgICAgZC5QZWFrX3ZpZXdlcnMgPSArZC5QZWFrX3ZpZXdlcnM7XG4gICAgICAgICAgZC5BdmVyYWdlX3ZpZXdlcnMgPSArZC5BdmVyYWdlX3ZpZXdlcnM7XG4gICAgICAgICAgZC5Gb2xsb3dlcnMgPSArZC5Gb2xsb3dlcnM7XG4gICAgICAgICAgZC5Gb2xsb3dlcnNfZ2FpbmVkID0gK2QuRm9sbG93ZXJzX2dhaW5lZDtcbiAgICAgICAgICBkLlZpZXdzX2dhaW5lZCA9ICtkLlZpZXdzX2dhaW5lZDtcbiAgICAgICAgfVxuICAgICAgICBzZXRTdGF0ZSgoc3RhdGUpID0+ICh7XG4gICAgICAgICAgLi4uc3RhdGUsXG4gICAgICAgICAgZGF0YSxcbiAgICAgICAgfSkpO1xuICAgICAgfSk7XG4gIH1cbn07XG4iLCJpbXBvcnQgeyBzZWxlY3QgfSBmcm9tICdkMyc7XG5pbXBvcnQgeyB2aXogfSBmcm9tICcuL3Zpeic7XG5jb25zdCBjb250YWluZXIgPSBzZWxlY3QoJyNhcHAnKS5ub2RlKCk7XG5sZXQgc3RhdGUgPSB7fTtcblxuY29uc3QgcmVuZGVyID0gKCkgPT4ge1xuICB2aXooY29udGFpbmVyLCB7XG4gICAgc3RhdGUsXG4gICAgc2V0U3RhdGUsXG4gIH0pO1xufTtcblxuY29uc3Qgc2V0U3RhdGUgPSAobmV4dCkgPT4ge1xuICBzdGF0ZSA9IG5leHQoc3RhdGUpO1xuICByZW5kZXIoKTtcbn07XG5cbnJlbmRlcigpO1xuIl0sIm5hbWVzIjpbImF4aXNMZWZ0IiwiYXhpc0JvdHRvbSIsInNjYWxlTG9nIiwic2NhbGVMaW5lYXIiLCJzY2FsZU9yZGluYWwiLCJzY2hlbWVDYXRlZ29yeTEwIiwic2VsZWN0IiwiY3N2UGFyc2UiXSwibWFwcGluZ3MiOiI7OztFQUVPLE1BQU0sSUFBSSxHQUFHO0VBQ3BCLEVBQUUsU0FBUztFQUNYLEVBQUU7RUFDRixJQUFJLE1BQU07RUFDVixJQUFJLE1BQU07RUFDVixJQUFJLFVBQVU7RUFDZCxJQUFJLFVBQVU7RUFDZCxJQUFJLGdCQUFnQixHQUFHLEVBQUU7RUFDekIsSUFBSSxnQkFBZ0IsR0FBRyxFQUFFO0VBQ3pCLEdBQUc7RUFDSCxLQUFLO0VBQ0wsRUFBRSxTQUFTO0VBQ1gsS0FBSyxTQUFTLENBQUMsVUFBVSxDQUFDO0VBQzFCLEtBQUssSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7RUFDakIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDO0VBQ2QsS0FBSyxJQUFJLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQztFQUM1QixLQUFLLElBQUk7RUFDVCxNQUFNLFdBQVc7RUFDakIsTUFBTSxDQUFDLFVBQVUsRUFBRSxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDO0VBQ3pDLEtBQUs7RUFDTCxLQUFLLElBQUksQ0FBQ0EsYUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7QUFDNUI7RUFDQSxFQUFFLFNBQVM7RUFDWCxLQUFLLFNBQVMsQ0FBQyxVQUFVLENBQUM7RUFDMUIsS0FBSyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztFQUNqQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUM7RUFDZCxLQUFLLElBQUksQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDO0VBQzVCLEtBQUssSUFBSTtFQUNULE1BQU0sV0FBVztFQUNqQixNQUFNLENBQUMsWUFBWSxFQUFF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