
import SXIdentified from './SXIdentified'
import SXSubComponent from './SXSubComponent'
import SXRange from './SXRange'

import { triple, node } from 'rdfoo'
import { Types, Predicates, Specifiers } from 'bioterms'
import SBOLXGraphView from '../SBOLXGraphView'
import SXComponent from './SXComponent'

export default class SXSequenceConstraint extends SXIdentified {

    constructor(view:SBOLXGraphView, uri:string) {

        super(view, uri)

    }

    get facadeType():string {
        return Types.SBOLX.SequenceConstraint
    }

    get containingObject():SXIdentified|undefined {

        const uri = triple.subjectUri(
            this.view.graph.matchOne(null, Predicates.SBOLX.sequenceConstraint, this.uri)
        )

        if(!uri) {
            throw new Error('SeqCons has no containing object?')
        }

        return this.view.uriToIdentified(uri)

    }

    get containingComponent():SXComponent {

        return this.containingObject as SXComponent

    }

    get restriction():string {

        const restriction:string|undefined = this.getUriProperty(Predicates.SBOLX.restriction)

        if(restriction === undefined) {
            throw new Error('SeqCons has no restriction?')
        }

        return restriction
    }

    set restriction(uri:string) {
        this.setUriProperty(Predicates.SBOLX.restriction, uri)
    }

    get subject():SXSubComponent {

        const subject:string|undefined = this.getUriProperty(Predicates.SBOLX.subject)

        if(subject === undefined) {
            throw new Error('SeqCons has no subject?')
        }

        return new SXSubComponent(this.view, subject)
    }

    set subject(sc:SXSubComponent) {
        this.setUriProperty(Predicates.SBOLX.subject, sc.uri)
    }

    get object():SXSubComponent {

        const object:string|undefined = this.getUriProperty(Predicates.SBOLX.object)

        if(object === undefined) {
            throw new Error('SeqCons has no object?')
        }

        return new SXSubComponent(this.view, object)
    }

    set object(sc:SXSubComponent) {
        this.setUriProperty(Predicates.SBOLX.object, sc.uri)
    }

}
