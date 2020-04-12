
import { Graph, GraphViewBasic, Facade } from 'rdfoo'
import S1DnaSequence from './sbol1/S1DnaSequence'
import S1DnaComponent from './sbol1/S1DnaComponent'
import S1Collection from './sbol1/S1Collection'
import S1SequenceAnnotation from './sbol1/S1SequenceAnnotation'
import { Types } from 'bioterms'
import S1Facade from './sbol1/S1Facade'

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

        const type = this.getType(uri)

        if(type === Types.SBOL1.DnaSequence)
            return new S1DnaSequence(this, uri)

        if(type === Types.SBOL1.DnaComponent)
            return new S1DnaComponent(this, uri)

        if(type === Types.SBOL1.Collection)
            return new S1Collection(this, uri)

        if(type === Types.SBOL1.SequenceAnnotation)
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

}

export function sbol1(graph:Graph) {
    return new SBOL1GraphView(graph)
}