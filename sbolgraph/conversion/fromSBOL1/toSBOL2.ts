
import { Graph } from 'rdfoo'

import SBOL1Graph from '../../SBOL1Graph'
import SBOL2Graph from '../../SBOL2Graph'

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

export default function convert1to2(graph:Graph) {

    const map:Map<string, S1Facade> = new Map()

    let graph1:SBOL1Graph = new SBOL1Graph()
    graph1.graph = graph.graph

    let graph2:SBOL2Graph = new SBOL2Graph()


    for(let sequence of graph1.dnaSequences) {

        let sequence2 = new S2Sequence(graph2, sequence.uri)
        sequence2.setUriProperty(Predicates.a, Types.SBOL2.Sequence)

        sequence2.encoding = Specifiers.SBOL2.SequenceEncoding.NucleicAcid
        sequence2.elements = sequence.nucleotides
    }

    for(let component of graph1.dnaComponents) {

        let component2 = new S2ComponentDefinition(graph2, component.uri)
        component2.setUriProperty(Predicates.a, Types.SBOL2.ComponentDefinition)

        component2.addType(Specifiers.SBOL2.Type.DNA)
        component2.name = component.name
        component2.description = component.description
        component2.displayId = component.displayId

        for(let type of component.getUriProperties(Predicates.a)) {
            if(type.indexOf(Prefixes.sbol1) === 0) {
                continue
            }
            if(type.indexOf('so:') === 0) {
                component2.addRole(Prefixes.sequenceOntologyIdentifiersOrg + 'SO:' + type.slice(3))
            } else {
                component2.addRole(type)
            }
        }

        for(let anno of component.annotations) {

            let anno2 = new S2SequenceAnnotation(graph2, anno.uri)
            anno2.setUriProperty(Predicates.a, Types.SBOL2.SequenceAnnotation)

            component2.insertUriProperty(Predicates.SBOL2.sequenceAnnotation, anno2.uri)

            let subComponent = anno.subComponent

            if(subComponent) {

                let subComponent2 = new S2ComponentInstance(graph2, URIUtils.addSuffix(anno.uri, '/component'))
                subComponent2.setUriProperty(Predicates.a, Types.SBOL2.Component)
                subComponent2.setUriProperty(Predicates.SBOL2.definition, subComponent.uri)

                anno2.insertUriProperty(Predicates.SBOL2.component, subComponent2.uri)
                component2.insertUriProperty(Predicates.SBOL2.component, subComponent2.uri)
            }

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

            } else if(strand !== undefined) {
                let genericLocation = new S2GenericLocation(graph2, URIUtils.addSuffix(anno.uri, '/location'))
                genericLocation.setUriProperty(Predicates.a, Types.SBOL2.GenericLocation)
                genericLocation.orientation = strand

                anno2.insertUriProperty(Predicates.SBOL2.location, genericLocation.uri)
            }


            for(let precedes of anno.precedes) {
                // TODO
            }
        }
    }

    for(let collection of graph1.collections) {

        let collection2 = new S2Collection(graph2, collection.uri)
        collection2.setUriProperty(Predicates.a, Types.SBOL2.Collection)

        collection2.name = collection.name
        collection2.description = collection.description
        collection2.displayId = collection.displayId

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

    graph.graph.addAll(graph2.graph)
}
