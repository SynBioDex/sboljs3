
import { SBOL2Graph, S2ComponentDefinition } from '..';

import S2Identified from './S2Identified'
import S2ComponentInstance from './S2ComponentInstance'
import S2Range from './S2Range'

import * as triple from '../triple'
import * as node from '../node'
import { Types, Predicates, Specifiers } from 'bioterms'
import CompliantURIs from "../SBOL2CompliantURIs";

export default class S2SequenceConstraint extends S2Identified {

    constructor(graph:SBOL2Graph, uri:string) {

        super(graph, uri)

    }

    get facadeType():string {
        return Types.SBOL2.SequenceConstraint
    }

    get containingObject():S2Identified|undefined {

        const uri = triple.subjectUri(
            this.graph.matchOne(null, Predicates.SBOL2.sequenceConstraint, this.uri)
        )

        if(!uri) {
            throw new Error('SeqCons has no containing object?')
        }

        return this.graph.uriToFacade(uri)

    }

    get restriction():string {

        const restriction:string|undefined = this.getUriProperty(Predicates.SBOL2.restriction)

        if(restriction === undefined) {
            throw new Error('SeqCons has no restriction?')
        }

        return restriction
    }

    get subject():S2ComponentInstance {

        const subject:string|undefined = this.getUriProperty(Predicates.SBOL2.subject)

        if(subject === undefined) {
            throw new Error('SeqCons has no subject?')
        }

        return new S2ComponentInstance(this.graph, subject)
    }

    get object():S2ComponentInstance {

        const object:string|undefined = this.getUriProperty(Predicates.SBOL2.object)

        if(object === undefined) {
            throw new Error('SeqCons has no object?')
        }

        return new S2ComponentInstance(this.graph, object)
    }

}
