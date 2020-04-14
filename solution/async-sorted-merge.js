'use strict'

const FastPriorityQueue = require('fastpriorityqueue')
// This is the faster solution. The slower solution but more memory friendly solution is included below as well.
module.exports = (logSources, printer) => {

    const pq = new FastPriorityQueue(function(a,b) {
            return a.log.date < b.log.date
    })  

    let entryTracker = []
    let sourceTracker = []
    let promises = []
    let sizeTracker = []

    for (let index in logSources) {
        entryTracker.push(0)
        sourceTracker.push(true)
        promises.push(addToQueue(index)) 
    }
    Promise.all(promises).then(()=>{
        printer.done()
        console.log(entryTracker)
        console.log(pq.size)
        console.log(sourceTracker)
        console.log(sizeTracker)
        const max = Math.max(...sizeTracker)
        console.log("max size = ", max )
    })


    function print() {
        sizeTracker.push(pq.size)
        while (checkTracker() && !pq.isEmpty()) {
                const toPrint = pq.poll()
                printer.print(toPrint.log)
                entryTracker[toPrint.index]--
        } 

    }

    function checkTracker() {
        for (const index in entryTracker) {
            if (entryTracker[index] === 0 && sourceTracker[index]) { 
                return false
            } 
        }
        return true
    }

    async function addToQueue(index) {

        while (true) {
            let log = await logSources[index].popAsync() 
            if (log) {
                const logEntry = {
                    index : index,
                    log : log
                }   
                pq.add(logEntry)
                entryTracker[index]++
                
                print()
            } else {
                sourceTracker[index] = false
                print()

                break
            }
        }   
    }
}
// ************ Slow solution *****************
// 'use strict'

// const FastPriorityQueue = require('fastpriorityqueue')

// module.exports = (logSources, printer) => {

//     const pq = new FastPriorityQueue(function(a,b) {
//             return a.log.date < b.log.date
//     })  

//     function addToQueue(indexOfSource) {
//         let promise = logSources[indexOfSource].popAsync();

//         return (
//             promise.then((log) => {
//                 if (log) {
//                     const logEntry = {
//                         index: indexOfSource,
//                         log: log
//                     }
//                     pq.add(logEntry)
//                 }        
//             })
//         )          
//     }
//     // collecting promises 
//     let sourceCount = logSources.length
//     let promises = []
//     let index = 0
//     while (index < sourceCount) {       
//         promises.push(addToQueue(index))        
//         index +=1
//     }

//     function printLog() {
//         if (!pq.isEmpty()) {
//             const toPrint = pq.poll()
//             printer.print(toPrint.log) 
//             return addToQueue(toPrint.index).then(printLog)
//         } else {
//             printer.done()
//         }
//     }

//     Promise.all(promises).then(function(values) {
//         printLog()
//     }).catch(error => {
//         console.log(error);
//     })
