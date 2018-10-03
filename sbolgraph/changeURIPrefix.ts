
import Graph from './Graph'
import rdf = require('rdf-ext')
import RdfGraphArray = require('rdf-graph-array')
import { Predicates } from 'bioterms'

export default function changeURIPrefix(graph:Graph, topLevels:Set<string>, newPrefix:string) {

    let triples = graph.graph._graph

    let newGraph = new RdfGraphArray.Graph([])

    let prefixes = new Set()

    for(let triple of triples) {

        if(triple.predicate.nominalValue === Predicates.a) {

            if(topLevels.has(triple.object.nominalValue)) {

                let subjectPrefix = prefix(triple.subject.nominalValue)

                prefixes.add(subjectPrefix)
            }
        }
    }

    for(let triple of triples) {

        let subject = triple.subject
        let predicate = triple.predicate
        let object = triple.object

        let matched = false

        for(let prefix of prefixes) {
            if(subject.nominalValue.indexOf(prefix) === 0) {
                subject = rdf.createNamedNode(newPrefix + subject.nominalValue.slice(prefix.length))
                matched = true
                break
            }
        }

        if(!matched) {
            // can't change prefix, just drop the triple
            continue
        }

        if(object.interfaceName === 'NamedNode') {
            for(let prefix of prefixes) {
                if(object.nominalValue.indexOf(prefix) === 0) {
                    object = rdf.createNamedNode(newPrefix + object.nominalValue.slice(prefix.length))
                    break
                }
            }
        }

        newGraph.add({ subject, predicate, object })

    }

    console.dir(prefixes)

    this.graph = newGraph

    // TODO currently only works for compliant URIs
    // 
    function prefix(uri:string) {

        let n = 0

        for(let i = uri.length - 1; i > 0; -- i) {

            if(uri[i] === '/') {
                ++ n

                if(n === 2) {
                    return uri.slice(0, i + 1)
                }
            }
        }

        throw new Error('cant get prefix')
    }

}

