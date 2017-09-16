
import SbolGraph, { ComponentDefinitionFacade } from 'sbolgraph';

import IdentifiedFacade from './IdentifiedFacade'
import ComponentInstanceFacade from './ComponentInstanceFacade'
import RangeFacade from './RangeFacade'

import * as triple from '../triple'
import * as node from '../node'
import { Types, Predicates, Specifiers } from 'terms'
import CompliantURIs from "sbolgraph/CompliantURIs";

export default class SequenceConstraintFacade extends IdentifiedFacade {

    constructor(graph:SbolGraph, uri:string) {

        super(graph, uri)

    }

    get facadeType():string {
        return Types.SBOL2.SequenceConstraint
    }

    get containingObject():IdentifiedFacade|undefined {

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

    get subject():ComponentInstanceFacade {

        const subject:string|undefined = this.getUriProperty(Predicates.SBOL2.subject)

        if(subject === undefined) {
            throw new Error('SeqCons has no subject?')
        }

        return new ComponentInstanceFacade(this.graph, subject)
    }

    get object():ComponentInstanceFacade {

        const object:string|undefined = this.getUriProperty(Predicates.SBOL2.object)

        if(object === undefined) {
            throw new Error('SeqCons has no object?')
        }

        return new ComponentInstanceFacade(this.graph, object)
    }

}
