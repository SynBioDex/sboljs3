
import Graph from '../../Graph'

import SBOL1Graph from '../../SBOL1Graph'
import SBOL2Graph from '../../SBOL2Graph'

import S1Facade from '../../sbol1/S1Facade'

import { Predicates, Prefixes } from 'bioterms'

export default function convert1to2(graph:Graph) {

    const map:Map<string, S1Facade> = new Map()

    let graph1:SBOL1Graph = new SBOL1Graph()
    graph1.graph = graph.graph

    let graph2:SBOL2Graph = new SBOL2Graph()



    // Delete anything with an SBOL1 type from the graph

    for(let typeTriple of graph.match(null, Predicates.a, null)) {
        if(typeTriple.object.toString().indexOf(Prefixes.sbol1) === 0) {
            graph.removeMatches(typeTriple.subject, null, null)
        }
    }

    graph.graph.addAll(graph2.graph)
}
