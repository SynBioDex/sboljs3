import { Predicates, Types } from "bioterms"
import { Graph } from "rdfoo"

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

    Predicates.SBOL3.sequenceConstraint,
    Predicates.SBOL3.hasFeature,
    Predicates.SBOL3.subComponent,
    Predicates.SBOL3.participation,
    Predicates.SBOL3.hasLocation,
    Predicates.SBOL3.sourceLocation,
    Predicates.SBOL3.interaction,
    Predicates.SBOL3.hasMeasure
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

        if(g.hasMatch(s, Predicates.a, Types.SBOL2.SequenceAnnotation))
            return false

        return true
    }

    if(p === Predicates.SBOL1.subComponent) {

        let s = nodeToURI(triple.subject)

        if(g.hasMatch(s, Predicates.a, Types.SBOL1.SequenceAnnotation))
            return false

        return true
    }

    return false
}

function nodeToURI(node):string {

    if(node.interfaceName !== 'NamedNode')
        throw new Error('expected NamedNode but found ' + JSON.stringify(node))

    if(typeof node.nominalValue !== 'string')
        throw new Error('nominalValue not a string?')

    return node.nominalValue
}