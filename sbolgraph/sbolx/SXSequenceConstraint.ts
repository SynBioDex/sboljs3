
import { SBOLXGraph, SXComponent } from '..';

import SXIdentified from './SXIdentified'
import SXSubComponent from './SXSubComponent'
import SXRange from './SXRange'

import * as triple from '../triple'
import * as node from '../node'
import { Types, Predicates, Specifiers } from 'sbolterms'
import CompliantURIs from "../SBOLXCompliantURIs";

export default class SXSequenceConstraint extends SXIdentified {

    constructor(graph:SBOLXGraph, uri:string) {

        super(graph, uri)

    }

    get facadeType():string {
        return Types.SBOLX.SequenceConstraint
    }

    get containingObject():SXIdentified|undefined {

        const uri = triple.subjectUri(
            this.graph.matchOne(null, Predicates.SBOLX.hasSequenceConstraint, this.uri)
        )

        if(!uri) {
            throw new Error('SeqCons has no containing object?')
        }

        return this.graph.uriToFacade(uri)

    }

    get containingComponent():SXComponent {

        return this.containingObject as SXComponent

    }

    get restriction():string {

        const restriction:string|undefined = this.getUriProperty(Predicates.SBOLX.constraintRestriction)

        if(restriction === undefined) {
            throw new Error('SeqCons has no restriction?')
        }

        return restriction
    }

    get subject():SXSubComponent {

        const subject:string|undefined = this.getUriProperty(Predicates.SBOLX.constraintSubject)

        if(subject === undefined) {
            throw new Error('SeqCons has no subject?')
        }

        return new SXSubComponent(this.graph, subject)
    }

    get object():SXSubComponent {

        const object:string|undefined = this.getUriProperty(Predicates.SBOLX.constraintObject)

        if(object === undefined) {
            throw new Error('SeqCons has no object?')
        }

        return new SXSubComponent(this.graph, object)
    }

}
