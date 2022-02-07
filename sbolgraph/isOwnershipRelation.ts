import { Predicates, Types } from "bioterms"
import { Graph, node } from "rdfoo"

let ownershipPredicates = [
    Predicates.SBOL1.annotation,
    Predicates.SBOL1.dnaSequence,

    Predicates.SBOL2.sequenceConstraint,
    Predicates.SBOL2.sequenceAnnotation,
    Predicates.SBOL2.attachment,
    Predicates.SBOL2.module,
    Predicates.SBOL2.functionalComponent,
    Predicates.SBOL2.participation,
    Predicates.SBOL2.location,
    Predicates.SBOL2.sourceLocation,
    Predicates.SBOL2.interaction,
    Predicates.Prov.qualifiedAssociation,
    Predicates.Prov.qualifiedUsage,
    Predicates.SBOL2.measure,
    Predicates.SBOL2.variableComponent,

    Predicates.SBOL3.hasConstraint,
    Predicates.SBOL3.hasFeature,
    Predicates.SBOL3.hasParticipation,
    Predicates.SBOL3.hasLocation,
    Predicates.SBOL3.sourceLocation,
    Predicates.SBOL3.hasInteraction,
    Predicates.SBOL3.hasMeasure,
    Predicates.SBOL3.hasVariableFeature,
    Predicates.SBOL3.hasInterface
]

export default function isOwnershipRelation(g:Graph, triple:any):boolean {

    let p = nodeToURI(triple.predicate)

    if(ownershipPredicates.indexOf(p) !== -1) {
        return true
    }

    // component is an ownership predicate unless used by SequenceAnnotation...
    //
    if(p === Predicates.SBOL2.component) {

        let s = nodeToURI(triple.subject)

        if(g.hasMatch(node.createUriNode(s), Predicates.a, node.createUriNode(Types.SBOL2.SequenceAnnotation)))
            return false

        return true
    }

    if(p === Predicates.SBOL1.subComponent) {

        let s = nodeToURI(triple.subject)

        if(g.hasMatch(node.createUriNode(s), Predicates.a,node.createUriNode( Types.SBOL1.SequenceAnnotation)))
            return false

        return true
    }

    return false
}

function nodeToURI(node):string {

    if(node.termType !== 'NamedNode')
        throw new Error('expected NamedNode but found ' + JSON.stringify(node))

    if(typeof node.value !== 'string')
        throw new Error('nominalValue not a string?')

    return node.value
}