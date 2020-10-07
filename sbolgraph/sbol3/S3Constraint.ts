
import S3Identified from './S3Identified'
import S3SubComponent from './S3SubComponent'
import S3Range from './S3Range'

import { triple, node } from 'rdfoo'
import { Types, Predicates, Specifiers } from 'bioterms'
import SBOL3GraphView from '../SBOL3GraphView'
import S3Component from './S3Component'

export default class S3Constraint extends S3Identified {

    constructor(view:SBOL3GraphView, uri:string) {

        super(view, uri)

    }

    get facadeType():string {
        return Types.SBOL3.Constraint
    }

    get containingObject():S3Identified|undefined {

        const uri = triple.subjectUri(
            this.view.graph.matchOne(null, Predicates.SBOL3.hasConstraint, this.uri)
        )

        if(!uri) {
            throw new Error('SeqCons has no containing object?')
        }

        return this.view.uriToIdentified(uri)

    }

    get containingComponent():S3Component {

        return this.containingObject as S3Component

    }

    get restriction():string {

        const restriction:string|undefined = this.getUriProperty(Predicates.SBOL3.restriction)

        if(restriction === undefined) {
            throw new Error('SeqCons has no restriction?')
        }

        return restriction
    }

    set restriction(uri:string) {
        this.setUriProperty(Predicates.SBOL3.restriction, uri)
    }

    get subject():S3SubComponent {

        const subject:string|undefined = this.getUriProperty(Predicates.SBOL3.subject)

        if(subject === undefined) {
            throw new Error('SeqCons has no subject?')
        }

        return new S3SubComponent(this.view, subject)
    }

    set subject(sc:S3SubComponent) {
        this.setUriProperty(Predicates.SBOL3.subject, sc.uri)
    }

    get object():S3SubComponent {

        const object:string|undefined = this.getUriProperty(Predicates.SBOL3.object)

        if(object === undefined) {
            throw new Error('SeqCons has no object?')
        }

        return new S3SubComponent(this.view, object)
    }

    set object(sc:S3SubComponent) {
        this.setUriProperty(Predicates.SBOL3.object, sc.uri)
    }

}
