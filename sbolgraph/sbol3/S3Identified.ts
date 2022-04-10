
import { triple, Node } from 'rdfoo'
import { Types, Predicates, Specifiers } from 'bioterms'

import S3Facade from './S3Facade'

import URIUtils from '../URIUtils';
import SBOL3GraphView from '../SBOL3GraphView';

export default class S3Identified extends S3Facade {

    constructor(view:SBOL3GraphView, subject:Node) {
        super(view, subject)
    }

    get facadeType():string {
        throw new Error('base called')
    }

    get name():string|undefined {
        return this.getStringProperty(Predicates.Dcterms.title)
    }

    // Should never throw; make sure not dependent on any getRequiredProperties
    get displayName():string|undefined {
        return this.name || this.getStringProperty(Predicates.SBOL3.displayId) || this.subject.value
    }

    set name(name:string|undefined) {
        this.setStringProperty(Predicates.Dcterms.title, name)
    }

    get description():string|undefined {
        return this.getStringProperty(Predicates.Dcterms.description)
    }

    set description(desc:string|undefined) {
        this.setStringProperty(Predicates.Dcterms.description, desc)
    }

    get displayDescription():string|undefined {
        return this.description
    }

    get displayId():string|undefined {
        return this.getStringProperty(Predicates.SBOL3.displayId)
    }

    set displayId(displayId:string|undefined) {
        this.setStringProperty(Predicates.SBOL3.displayId, displayId)
    }

    get uriPrefix():string {
        return URIUtils.getPrefix(this.subject.value)
    }

    get namespace():string {
        return this.getRequiredUriProperty(Predicates.SBOL3.hasNamespace)
    }

    set namespace(namespace:string) {
        this.setUriProperty(Predicates.SBOL3.hasNamespace, namespace)
    }

    get measures():Array<S3Measure> {

        return this.getProperties(Predicates.SBOL2.measure)
            .map((measure) => new S3Measure(this.view, measure))

    }

}



import S3Measure from './S3Measure';
