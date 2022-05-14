
import SBOL2GraphView from '../SBOL2GraphView';

import S2Identified from './S2Identified'
import S2ComponentInstance from './S2ComponentInstance'

import { triple, node, Node } from 'rdfoo'
import { Types, Predicates, Specifiers } from 'bioterms'

export default class S2SequenceConstraint extends S2Identified {

    constructor(view:SBOL2GraphView, subject:Node) {

        super(view, subject)

    }

    get facadeType():string {
        return Types.SBOL2.SequenceConstraint
    }

    get containingObject():S2Identified|undefined {

        const subject = this.view.graph.matchOne(null, Predicates.SBOL2.sequenceConstraint, this.subject)?.subject

        if(!subject) {
            throw new Error('SeqCons has no containing object?')
        }

        return this.view.uriToIdentified(subject)

    }

    get constraintRestriction():string {

        const restriction:string|undefined = this.getUriProperty(Predicates.SBOL2.restriction)

        if(restriction === undefined) {
            throw new Error('SeqCons has no restriction?')
        }

        return restriction
    }

    get constraintSubject():S2ComponentInstance {

        const subject:Node|undefined = this.getProperty(Predicates.SBOL2.subject)

        if(subject === undefined) {
            throw new Error('SeqCons has no subject?')
        }

        return new S2ComponentInstance(this.view, subject)
    }

    get constraintObject():S2ComponentInstance {

        const object:Node|undefined = this.getProperty(Predicates.SBOL2.object)

        if(object === undefined) {
            throw new Error('SeqCons has no object?')
        }

        return new S2ComponentInstance(this.view, object)
    }

}
