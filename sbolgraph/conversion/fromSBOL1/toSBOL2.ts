
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
import { S2Location } from '../..'

export default function convert1to2(graph:Graph) {

    const map:Map<string, S1Facade> = new Map()

    let graph1:SBOL1GraphView = new SBOL1GraphView(graph)

    let newGraph = new Graph()
    let graph2:SBOL2GraphView = new SBOL2GraphView(newGraph)


    for(let sequence of graph1.dnaSequences) {

        let sequence2 = new S2Sequence(graph2, sequence.subject)
        sequence2.setUriProperty(Predicates.a, Types.SBOL2.Sequence)

        copyNonSBOLProperties(sequence, sequence2)

        sequence2.encoding = Specifiers.SBOL2.SequenceEncoding.NucleicAcid
        sequence2.elements = sequence.nucleotides
    }

    for(let dnaComponent of graph1.dnaComponents) {

        let component2 = new S2ComponentDefinition(graph2, dnaComponent.subject)
        component2.setUriProperty(Predicates.a, Types.SBOL2.ComponentDefinition)

        copyNonSBOLProperties(dnaComponent, component2)

        component2.addType(Specifiers.SBOL2.Type.DNA)
        component2.name = dnaComponent.name
        component2.description = dnaComponent.description
        copyDisplayId(dnaComponent, component2)

        if(dnaComponent.dnaSequence) {
            component2.insertProperty(Predicates.SBOL2.sequence, dnaComponent.dnaSequence.subject)
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

            let anno2 = new S2SequenceAnnotation(graph2, anno.subject)
            anno2.setUriProperty(Predicates.a, Types.SBOL2.SequenceAnnotation)
            /// HAS to have locations

            component2.insertProperty(Predicates.SBOL2.sequenceAnnotation, anno2.subject)

            copyNonSBOLProperties(anno, anno2)

            let subComponent = anno.subComponent

            if(subComponent
                // any precedes relation requires a subcomponent in SBOL2
                //
                || graph.hasMatch(null, Predicates.SBOL1.precedes, anno.subject)
                || graph.hasMatch(anno.subject, Predicates.SBOL1.precedes, null)
            ) {
                let subComponent2 = new S2ComponentInstance(graph2, node.createUriNode(URIUtils.addSuffix(anno.subject.value, '/component')))
                subComponent2.setUriProperty(Predicates.a, Types.SBOL2.Component)

                if(subComponent !== undefined) {
                    // an actual SBOL1 composition
                    subComponent2.setProperty(Predicates.SBOL2.definition, subComponent.subject)
                } else {
                    // forced subcomponent creation for precedes
                    subComponent2.setUriProperty(Predicates.SBOL2.definition, 'http://sboltools.org/terms/stub')
                }

                anno2.insertProperty(Predicates.SBOL2.component, subComponent2.subject)
                component2.insertProperty(Predicates.SBOL2.component, subComponent2.subject)
            }
        }

        for(let anno of dnaComponent.annotations) {

            let anno2 = new S2SequenceAnnotation(graph2, anno.subject)
            anno2.setUriProperty(Predicates.a, Types.SBOL2.SequenceAnnotation)

            copyNonSBOLProperties(anno, anno2)

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

                let range = new S2Range(graph2, node.createUriNode(URIUtils.addSuffix(anno.subject.value, '/location')))
                range.setUriProperty(Predicates.a, Types.SBOL2.Range)

                range.start = start
                range.end = end
                range.orientation = strand

                anno2.insertProperty(Predicates.SBOL2.location, range.subject)

            } else {
                let genericLocation = new S2GenericLocation(graph2, node.createUriNode(URIUtils.addSuffix(anno.subject.value, '/location')))
                genericLocation.setUriProperty(Predicates.a, Types.SBOL2.GenericLocation)

                if(strand !== undefined)
                    genericLocation.orientation = strand

                anno2.insertProperty(Predicates.SBOL2.location, genericLocation.subject)
            }

            for(let precedes of anno.precedes) {
                
                let constraint = new S2SequenceConstraint(graph2, node.createUriNode(URIUtils.addSuffix(dnaComponent.subject.value, '/precedes' + (++ precedesN))))
                constraint.setUriProperty(Predicates.a, Types.SBOL2.SequenceConstraint)

                component2.insertProperty(Predicates.SBOL2.sequenceConstraint, constraint.constraintSubject.subject)


                let obj = new S2SequenceAnnotation(graph2, anno.subject)
                let c2 = obj.component
                if(!c2) {
                    throw new Error('???')
                }

                

                let precedes2 = new S2SequenceAnnotation(graph2, precedes.subject)

                if(!precedes2.component) { // no
                    throw new Error('???')
                }

                constraint.setProperty(Predicates.SBOL2.subject, c2.subject)
                constraint.setProperty(Predicates.SBOL2.restriction, node.createUriNode(Specifiers.SBOL2.SequenceConstraint.Precedes))
                constraint.setProperty(Predicates.SBOL2.object, precedes2.component?.subject)
            }
        }
    }

    for(let collection of graph1.collections) {

        let collection2 = new S2Collection(graph2, collection.subject)
        collection2.setUriProperty(Predicates.a, Types.SBOL2.Collection)

        collection2.name = collection.name
        collection2.description = collection.description
        copyDisplayId(collection, collection2)

        for(let component of collection.components) {
            collection2.addMember(new S2ComponentDefinition(graph2, component.subject))
        }
    }


    // Delete anything with an SBOL1 type from the graph

    for(let typeTriple of graph.match(null, Predicates.a, null)) {
        if(typeTriple.object.value.indexOf(Prefixes.sbol1) === 0) {
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

    function copyNonSBOLProperties(a:Facade, b:Facade) {

        for(let t of graph.match(a.subject, null, null)) {

            if(t.subject.value.indexOf(Prefixes.sbol1) == 0) {
                continue
            }

            b.insertProperty(t.predicate.value, t.object)

        }


    }
}
