const body = d3.select('body')
const container = body.append('div')
    .attr('class', 'container')

const bounds = container.node().getBoundingClientRect()

// margin convention (d3 way of handliong margins)
const margin = { top: 20, right: 20, bottom: 30, left: 35 }

const width = bounds.width - margin.left - margin.right
const height = bounds.height - margin.top - margin.bottom

const svg = container.append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)

// group element, like div of svg world
const gContainer = svg.append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`)

loadData('data.csv')

async function loadData(dataset) {
    const data = await d3.csv(dataset)
    data.forEach(d => d.value = +d.value)

    const xScaleDomain = data.map(d => d.name)
    const yScaleDomain = d3.extent(data.map(d => d.value))

    // band (ordinal) scale, want all categorical labels
    const xScale = d3.scaleBand()
        .domain(xScaleDomain) // input
        .range([0, width]) // output
        .padding(0.1)

    const yScale = d3.scaleLinear()
        .domain(yScaleDomain)
        .range([height, 0])
        .nice()

    const bars = gContainer.selectAll('rect')
        .data(data)
        .enter().append('rect')
        .attr('class', 'bar')
        .attr('width', 10)
        .attr('height', d => yScale(0) - yScale(d.value))
        .attr('x', d => xScale(d.name))
        .attr('y', d => yScale(d.value))

    const xAxis = d3.axisBottom(xScale)

    gContainer.append('g')
        .attr('class', 'x axis')
        .call(xAxis)
        .attr('transform', `translate(${0},${yScale(0)})`)

    const yAxis = d3.axisLeft(yScale)

    gContainer.append('g')
        .attr('class', 'y axis')
        .call(yAxis)

    timedUpdate()

    function timedUpdate() {
        setTimeout(() => {
            updateData()
            timedUpdate()
        }, 5000)

    }

    // shows mechanics of how d3 handles updates to data
    function updateData() {
        const randNum = () => Math.floor(Math.random() * 27)
        const num = randNum()
        console.log('num', num)

        const numSet = new Set

        let counter = 0
        while (counter < num) { numSet.add(randNum()); counter++ }

        const updatedData = data.filter((d, i) => numSet.has(i))

        // transition
        const t = gContainer.transition()
            .duration(1500)

        // general update pattern
        const update = gContainer.selectAll('rect')
            .data(updatedData, d => d.name)
            .join(
                enter => enter.append('rect')
                    .attr('width', xScale.bandwidth())
                    .attr('height', d => yScale(0) - yScale(d.value))
                    .attr('x', d => xScale(d.name))
                    .attr('y', d => yScale(d.value) - 200)
                    .attr('fill', 'white')
                    .call(enter => enter.transition(t)
                        .attr('y', d => yScale(d.value))
                        .attr('fill', 'green')
                    ),
                update => update
                    .attr('fill', 'black'),
                exit => exit
                    .attr('fill', 'brown')
                    .call(exit => exit.transition(t)
                        .attr('y', d => yScale(d.value) + height * 1.5)
                        .remove()
                    )
            )
            .on('click', function () {
                const radius = 10
                d3.select(this)
                    .attr('stroke-width', 5)
                    .attr('stroke', 'pink')
                    .transition(t).duration(300)
                    .attr('y', () => yScale(0.13))
                    .attr('rx', radius)
                    .attr('width', radius * 2)
                    .attr('height', radius * 2)
            })

        // old way
        // const enter = update.enter()
        // const exit = update.exit()

        // console.log('update', update)
        // console.log('enter', enter)
        // console.log('exit', exit)

        console.log('updatedData:')
        console.table(updatedData)
    }
}