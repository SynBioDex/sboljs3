
import { Graph, GraphViewBasic, Facade, serialize } from 'rdfoo'
import S1DnaSequence from './sbol1/S1DnaSequence'
import S1DnaComponent from './sbol1/S1DnaComponent'
import S1Collection from './sbol1/S1Collection'
import S1SequenceAnnotation from './sbol1/S1SequenceAnnotation'
import { Types, Prefixes, Predicates } from 'bioterms'
import S1Facade from './sbol1/S1Facade'
import isOwnershipRelation from './isOwnershipRelation'

export default class SBOL1GraphView extends GraphViewBasic {

    graph:Graph

    constructor(graph:Graph) {
        super(graph)
        this.graph = graph
    }

    get dnaSequences():Array<S1DnaSequence> {

        return this.instancesOfType(Types.SBOL1.DnaSequence)
                    .map((uri) => new S1DnaSequence(this, uri))

    }

    get dnaComponents():Array<S1DnaComponent> {

        return this.instancesOfType(Types.SBOL1.DnaComponent)
                    .map((uri) => new S1DnaComponent(this, uri))

    }

    get collections():Array<S1Collection> {

        return this.instancesOfType(Types.SBOL1.Collection)
                    .map((uri) => new S1Collection(this, uri))

    }

    uriToFacade(uri:string):Facade|undefined {

        if(!uri)
            return undefined

        const types = this.getTypes(uri)

        if(types.indexOf(Types.SBOL1.DnaSequence) !== -1)
            return new S1DnaSequence(this, uri)

        if(types.indexOf(Types.SBOL1.DnaComponent) !== -1)
            return new S1DnaComponent(this, uri)

        if(types.indexOf(Types.SBOL1.Collection) !== -1)
            return new S1Collection(this, uri)

        if(types.indexOf(Types.SBOL1.SequenceAnnotation) !== -1)
            return new S1SequenceAnnotation(this, uri)

        return undefined
    }

    get topLevels():S1Facade[] {

        const topLevels = []

        Array.prototype.push.apply(topLevels, this.instancesOfType(Types.SBOL1.DnaSequence))
        Array.prototype.push.apply(topLevels, this.instancesOfType(Types.SBOL1.DnaComponent))
        Array.prototype.push.apply(topLevels, this.instancesOfType(Types.SBOL1.Collection))

        return topLevels.map((topLevel) => this.uriToFacade(topLevel) as S1Facade)
    }

    serializeXML() {

        let defaultPrefixes:Array<[string,string]> = [
            [ 'rdf', Prefixes.rdf ],
            [ 'dcterms', Prefixes.dcterms ],
            [ 'prov', Prefixes.prov ],
            [ 'sbol', Prefixes.sbol1 ],
            [ 'sbol2', Prefixes.sbol2 ],
            [ 'sbol3', Prefixes.sbol3 ],
            [ 'om', Prefixes.measure ],
        ]

        return serialize(this.graph, new Map(defaultPrefixes), t => isOwnershipRelation(this.graph, t), Prefixes.sbol1)
    }

    get rootDnaComponents():Array<S1DnaComponent> {

        return this.instancesOfType(Types.SBOL1.DnaComponent).filter((uri) => {
            return !this.graph.hasMatch(null, Predicates.SBOL1.subComponent, uri)
        }).map((uri) => new S1DnaComponent(this, uri))

    }
}

export function sbol1(graph:Graph) {
    return new SBOL1GraphView(graph)
}
