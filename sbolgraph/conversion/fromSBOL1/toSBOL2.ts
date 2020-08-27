
import { Graph, node, Facade } from 'rdfoo'

import SBOL1GraphView from '../../SBOL1GraphView'
import SBOL2GraphView from '../../SBOL2GraphView'

import S1Facade from '../../sbol1/S1Facade'

import { Predicates, Prefixes, Types, Specifiers } from 'bioterms'
import S2Identified from '../../sbol2/S2Identified';
import S2SequenceConstraint from '../../sbol2/S2SequenceConstraint';
import S2Sequence from '../../sbol2/S2Sequence';
import S2ComponentDefinition from '../../sbol2/S2ComponentDefinition';
import S2ComponentInstance from '../../sbol2/S2ComponentInstance';
import S2SequenceAnnotation from '../../sbol2/S2SequenceAnnotation';
import S2Range from '../../sbol2/S2Range';
import S2GenericLocation from '../../sbol2/S2GenericLocation';
import S2Collection from '../../sbol2/S2Collection';

import URIUtils from '../../URIUtils'
import { strict as assert } from 'assert'
import { S2Location } from '../..'

export default function convert1to2(graph:Graph) {

    const map:Map<string, S1Facade> = new Map()

    let graph1:SBOL1GraphView = new SBOL1GraphView(graph)

    let newGraph = new Graph()
    let graph2:SBOL2GraphView = new SBOL2GraphView(newGraph)


    for(let sequence of graph1.dnaSequences) {

        let sequence2 = new S2Sequence(graph2, sequence.uri)
        sequence2.setUriProperty(Predicates.a, Types.SBOL2.Sequence)

        sequence2.encoding = Specifiers.SBOL2.SequenceEncoding.NucleicAcid
        sequence2.elements = sequence.nucleotides
    }

    for(let dnaComponent of graph1.dnaComponents) {

        let component2 = new S2ComponentDefinition(graph2, dnaComponent.uri)
        component2.setUriProperty(Predicates.a, Types.SBOL2.ComponentDefinition)

        component2.addType(Specifiers.SBOL2.Type.DNA)
        component2.name = dnaComponent.name
        component2.description = dnaComponent.description
        copyDisplayId(dnaComponent, component2)

        if(dnaComponent.dnaSequence) {
            component2.insertProperty(Predicates.SBOL2.sequence, node.createUriNode(dnaComponent.dnaSequence.uri))
        }

        for(let type of dnaComponent.getUriProperties(Predicates.a)) {
            if(type.indexOf(Prefixes.sbol1) === 0) {
                continue
            }
            // if(type.indexOf('so:') === 0) {
            //     component2.addRole(Prefixes.sequenceOntologyIdentifiersOrg + 'SO:' + type.slice(3))
            // } else {
                component2.addRole(type)
            // }
        }

        let precedesN = 0

        for(let anno of dnaComponent.annotations) {

            let anno2 = new S2SequenceAnnotation(graph2, anno.uri)
            anno2.setUriProperty(Predicates.a, Types.SBOL2.SequenceAnnotation)
            /// HAS to have locations

            component2.insertUriProperty(Predicates.SBOL2.sequenceAnnotation, anno2.uri)


            let subComponent = anno.subComponent

            if(subComponent
                // any precedes relation requires a subcomponent in SBOL2
                //
                || graph.hasMatch(null, Predicates.SBOL1.precedes, anno.uri)
                || graph.hasMatch(anno.uri, Predicates.SBOL1.precedes, null)
            ) {

                console.log('FOOBAR MAKING SC FOR ' + anno.uri + ' IN COMPONENT ' + dnaComponent.uri)

                let subComponent2 = new S2ComponentInstance(graph2, URIUtils.addSuffix(anno.uri, '/component'))
                subComponent2.setUriProperty(Predicates.a, Types.SBOL2.Component)

                if(subComponent !== undefined) {
                    // an actual SBOL1 composition
                    subComponent2.setUriProperty(Predicates.SBOL2.definition, subComponent.uri)
                } else {
                    // forced subcomponent creation for precedes
                    subComponent2.setUriProperty(Predicates.SBOL2.definition, 'http://sboltools.org/terms/stub')
                }

                anno2.insertUriProperty(Predicates.SBOL2.component, subComponent2.uri)
                component2.insertUriProperty(Predicates.SBOL2.component, subComponent2.uri)
            }
        }

        for(let anno of dnaComponent.annotations) {

            let anno2 = new S2SequenceAnnotation(graph2, anno.uri)

            let start = anno.bioStart
            let end = anno.bioEnd
            let strand = anno.strand

            if(strand === '+')
                strand = Specifiers.SBOL2.Orientation.Inline
            else if(strand === '-')
                strand = Specifiers.SBOL2.Orientation.ReverseComplement
            else
                strand = undefined

            if(start !== undefined || end !== undefined) {

                let range = new S2Range(graph2, URIUtils.addSuffix(anno.uri, '/location'))
                range.setUriProperty(Predicates.a, Types.SBOL2.Range)

                range.start = start
                range.end = end
                range.orientation = strand

                anno2.insertUriProperty(Predicates.SBOL2.location, range.uri)

            } else {
                let genericLocation = new S2GenericLocation(graph2, URIUtils.addSuffix(anno.uri, '/location'))
                genericLocation.setUriProperty(Predicates.a, Types.SBOL2.GenericLocation)

                if(strand !== undefined)
                    genericLocation.orientation = strand

                anno2.insertUriProperty(Predicates.SBOL2.location, genericLocation.uri)
            }

            for(let precedes of anno.precedes) {
                
                let constraint = new S2SequenceConstraint(graph2, URIUtils.addSuffix(dnaComponent.uri, '/precedes' + (++ precedesN)))
                constraint.setUriProperty(Predicates.a, Types.SBOL2.SequenceConstraint)

                component2.insertUriProperty(Predicates.SBOL2.sequenceConstraint, constraint.uri)


                let obj = new S2SequenceAnnotation(graph2, anno.uri)
                let c2 = obj.component
                assert(c2)

                

                console.log('FOOBAR LOOKING FOR SC FOR ' + precedes.uri + ' IN COMPONENT ' + dnaComponent.uri)


                let precedes2 = new S2SequenceAnnotation(graph2, precedes.uri)
                assert(precedes2.component) // no

                constraint.setProperty(Predicates.SBOL2.subject, node.createUriNode(c2.uri))
                constraint.setProperty(Predicates.SBOL2.restriction, node.createUriNode(Specifiers.SBOL2.SequenceConstraint.Precedes))
                constraint.setProperty(Predicates.SBOL2.object, node.createUriNode(precedes2.component?.uri as string))
            }
        }
    }

    for(let collection of graph1.collections) {

        let collection2 = new S2Collection(graph2, collection.uri)
        collection2.setUriProperty(Predicates.a, Types.SBOL2.Collection)

        collection2.name = collection.name
        collection2.description = collection.description
        copyDisplayId(collection, collection2)

        for(let component of collection.components) {
            collection2.addMember(new S2ComponentDefinition(graph2, component.uri))
        }
    }


    // Delete anything with an SBOL1 type from the graph

    for(let typeTriple of graph.match(null, Predicates.a, null)) {
        if(typeTriple.object.toString().indexOf(Prefixes.sbol1) === 0) {
            graph.removeMatches(typeTriple.subject, null, null)
        }
    }


    graph.addAll(newGraph)

    function copyDisplayId(a:Facade, b:Facade) {

        let oldDisplayId = a.getStringProperty(Predicates.SBOL1.displayId)

        if(oldDisplayId === undefined) {
            return
        }

        let newDisplayId =
            oldDisplayId?.replace(/[^A-z_]/g, '_')

        b.setStringProperty(Predicates.SBOL2.displayId, newDisplayId)

        if(oldDisplayId === newDisplayId) {
            return
        }

        b.setStringProperty('http://sboltools.org/backport#sbol1displayId', oldDisplayId)
    }
}
