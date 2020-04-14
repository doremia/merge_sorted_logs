'use strict'

const FastPriorityQueue = require('fastpriorityqueue')

module.exports = (logSources, printer) => {

    //initialize priority queue
    const pq = new FastPriorityQueue(function(a,b) {
            return a.log.date < b.log.date
    })  

    function addToQueue(value,key) {
        const sourceRef = {}
        sourceRef.index = key
        sourceRef.log = value
        pq.add(sourceRef)
    }

    for (const indexSource in logSources) {
        const entry = logSources[indexSource].pop()
        if (entry) {
            addToQueue(entry, indexSource)
        }
    }

    //print the earliest date while adding nextEntry to the queue
    while (!pq.isEmpty()) {
        const indexAndEntry = pq.poll()
        const printedIndex = indexAndEntry.index
        const toPrint = indexAndEntry.log
        printer.print(toPrint)

        const nextEntry = logSources[printedIndex].pop() 
        if (nextEntry) {  
            addToQueue(nextEntry, printedIndex)
        }
    }

    printer.done()
}