
import Graph from "./Graph";
import { Predicates, Prefixes } from "bioterms";

import et = require('elementtree')

let ElementTree = et.ElementTree
let Element = et.Element
let SubElement = et.SubElement
let QName = et.QName

export default function serialize(graph:Graph, defaultPrefixes:Map<string,string>, ownershipPredicates:Set<string>):string {

    let prefixes = new Map(defaultPrefixes)

    let subjectToElement = new Map()
    let ownedElements = new Set()

    for(let triple of graph.match(null, Predicates.a, null)) {

        let subject = nodeToURI(triple.subject)
        let type = nodeToURI(triple.object)

        let subjectElem = Element(prefixify(type), {
            [prefixify(Prefixes.rdf + 'about')]: subject
        })

        subjectToElement.set(subject, subjectElem)
    }

    for(let triple of graph.graph.toArray()) {

        let s = nodeToURI(triple.subject)

        let subjectElem = subjectToElement.get(s)

        if(!subjectElem) {
            subjectElem = Element('rdf:Description', {
                [prefixify(Prefixes.rdf + 'about')]: s
            })
            subjectToElement.set(s, subjectElem)
        }

        let p = nodeToURI(triple.predicate)

        if(p === Predicates.a) {
            continue
        }

        if(ownershipPredicates.has(p)) {

            let o = nodeToURI(triple.object)

            let ownedElement = subjectToElement.get(o)

            if(ownedElement) {

                let ownershipElement = SubElement(subjectElem, prefixify(p))
                ownershipElement.append(ownedElement)

                ownedElements.add(o)

                continue
            }
        }

        if(triple.object.interfaceName === 'NamedNode') {
            SubElement(subjectElem, prefixify(p), {
                [prefixify(Prefixes.rdf + 'resource')]: nodeToURI(triple.object)
            })
            continue
        }

        if(triple.object.interfaceName === 'Literal') {

            let attr:any = {}

            // TODO language and datatype

            let elem = SubElement(subjectElem, prefixify(p), attr)

            elem.text = triple.object.nominalValue

            continue
        }

        throw new Error('Unknown interfaceName ' + triple.object.interfaceName)
    }


    let docAttr = {}

    for(let prefix of prefixes.keys()) {
        docAttr['xmlns:' + prefix] = prefixes.get(prefix)
    }


    console.log(JSON.stringify(docAttr))


    let root = Element(prefixify(Prefixes.rdf + 'RDF'), docAttr)

    for(let subject of subjectToElement.keys()) {
        if(!ownedElements.has(subject))
            root.append(subjectToElement.get(subject))
    }


    let doc = new ElementTree(root)

    return doc.write({
        xml_declaration: true,
        indent: 2
    })


    function nodeToURI(node):string {

        if(node.interfaceName !== 'NamedNode')
            throw new Error('expected NamedNode')

        if(typeof node.nominalValue !== 'string')
            throw new Error('nominalValue not a string?')

        return node.nominalValue
    }

    function prefixify(iri) {

        for(var prefix of prefixes.keys()) {

            var prefixIRI:any = prefixes.get(prefix)

            if(iri.indexOf(prefixIRI) === 0) {
                return prefix + ':' + iri.slice(prefixIRI.length)
            }
        }

        var fragmentStart = iri.lastIndexOf('#')

        if(fragmentStart === -1)
            fragmentStart = iri.lastIndexOf('/')

        if(fragmentStart === -1)
            return iri

        var iriPrefix = iri.substr(0, fragmentStart + 1)

        for(var i = 0 ;; ++ i) {

            var prefixName = 'ns' + i

            if(prefixes.get(prefixName) === undefined) {

                prefixes.set(prefixName, iriPrefix)
                return prefixName + ':' + iri.slice(iriPrefix.length)
            }
        }
    }

}
