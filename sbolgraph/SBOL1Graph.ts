
import Graph from './Graph'
import S1DnaSequence from './sbol1/S1DnaSequence'
import S1DnaComponent from './sbol1/S1DnaComponent'
import S1Collection from './sbol1/S1Collection'
import { Types } from 'bioterms'

export default class SBOL1Graph extends Graph {

    constructor(rdfGraph?:any) {

        super(rdfGraph)

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


}
