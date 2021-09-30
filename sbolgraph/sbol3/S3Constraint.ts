
import S3Identified from './S3Identified'
import S3SubComponent from './S3SubComponent'
import S3Range from './S3Range'

import { triple, node, Node } from 'rdfoo'
import { Types, Predicates, Specifiers } from 'bioterms'
import SBOL3GraphView from '../SBOL3GraphView'
import S3Component from './S3Component'

export default class S3Constraint extends S3Identified {

    constructor(view:SBOL3GraphView, subject:Node) {

        super(view, subject)

    }

    get facadeType():string {
        return Types.SBOL3.Constraint
    }

    get containingObject():S3Identified|undefined {

        const subject = this.view.graph.matchOne(null, Predicates.SBOL3.hasConstraint, this.subject)?.subject

        if(!subject) {
            throw new Error('SeqCons has no containing object?')
        }

        return this.view.uriToIdentified(subject)

    }

    get containingComponent():S3Component {

        return this.containingObject as S3Component

    }

    get constraintRestriction():string {

        const restriction:string|undefined = this.getUriProperty(Predicates.SBOL3.restriction)

        if(restriction === undefined) {
            throw new Error('SeqCons has no restriction?')
        }

        return restriction
    }

    set constraintRestriction(subject:string) {
        this.setUriProperty(Predicates.SBOL3.restriction, subject)
    }

    get constraintSubject():S3SubComponent {

        const subject:Node|undefined = this.getProperty(Predicates.SBOL3.subject)

        if(subject === undefined) {
            throw new Error('SeqCons has no subject?')
        }

        return new S3SubComponent(this.view, subject)
    }

    set constraintSubject(sc:S3SubComponent) {
        this.setProperty(Predicates.SBOL3.subject, sc.subject)
    }

    get constraintObject():S3SubComponent {

        const object:Node|undefined = this.getProperty(Predicates.SBOL3.object)

        if(object === undefined) {
            throw new Error('SeqCons has no object?')
        }

        return new S3SubComponent(this.view, object)
    }

    set constraintObject(sc:S3SubComponent) {
        this.setProperty(Predicates.SBOL3.object, sc.subject)
    }

}
