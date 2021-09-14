
import { triple, GraphView } from 'rdfoo'
import { Types, Predicates, Specifiers } from 'bioterms'

import SBOL2GraphView from '../SBOL2GraphView'
import URIUtils from '../URIUtils'
import S2Facade from './S2Facade'
import { Node } from 'rdfoo'

export default class S2Identified extends S2Facade {

    constructor(view:SBOL2GraphView, subject:Node) {
        super(view, subject)
    }
    
    get facadeType():string {
        throw new Error('base called')
    }

    get name():string|undefined {
        return this.getStringProperty(Predicates.Dcterms.title)
    }

    get displayName():string|undefined {
        return this.name || this.displayId
    }

    get displayType():string {
        return this.objectType || 'unknown'
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
        return this.getStringProperty(Predicates.SBOL2.displayId)
    }

    set displayId(displayId:string|undefined) {
        this.setStringProperty(Predicates.SBOL2.displayId, displayId)
    }

    set displayType(type:string) {
        this.setUriProperty(Predicates.a, type)
    }

    get version():string|undefined {
        return this.getStringProperty(Predicates.SBOL2.version)
    }

    set version(version:string|undefined) {
        this.setStringProperty(Predicates.SBOL2.version, version)
    }

    get persistentIdentity():string|undefined {
        return this.getUriProperty(Predicates.SBOL2.persistentIdentity)
    }

    set persistentIdentity(subject:string|undefined) {
        this.setUriProperty(Predicates.SBOL2.persistentIdentity, subject)
    }

    get uriPrefix():string {
        return URIUtils.getPrefix(this.subject.value)
    }

    get attachments():Array<S2Attachment> {

        return this.getProperties(Predicates.SBOL2.attachment)
            .map((attachment) => new S2Attachment(this.view, attachment))

    }

    get measures():Array<S2Measure> {

        return this.getProperties(Predicates.SBOL2.measure)
            .map((measure) => new S2Measure(this.view, measure))

    }


    get containingObject():S2Identified|undefined {

        return undefined

    }

    get containedObjects():S2Identified[] {
        return []
    }

    get containingCollections():Array<S2Collection> {

        return this.view.graph.match(null, Predicates.SBOL2.member, this.subject)
                    .map((t) => new S2Collection(this.view, t.subject))
    }


    get uriChain():string {

        const containingObject:S2Identified|undefined = this.containingObject

        if(containingObject !== undefined) {
            return containingObject.uriChain + ';' + this.subject.value
        } else {
            return this.subject.value
        }

    }

    isSiblingOf(other:S2Identified):boolean {

        let ourContainer = this.containingObject
        let theirContainer = other.containingObject

        if(!ourContainer) {
            if(!theirContainer) {
                return true
            } else {
                return false
            }
        } else {
            if(theirContainer && theirContainer.subject.value === ourContainer.subject.value) {
                return true
            } else {
                return false
            }
        }
    }

    getSiblings():Array<S2Identified> {

        let ourContainer = this.containingObject

        if(!ourContainer) {
            return []
        }

        let containedObjects = ourContainer.containedObjects

        // remove us from the list
        //
        for(let i = 0; i < containedObjects.length; ++ i) {
            if(containedObjects[i].subject.value === this.subject.value) {
                containedObjects.splice(i, 1)
                break
            }
        }

        return containedObjects
    }

    
}

import S2Attachment from './S2Attachment'
import S2Collection from './S2Collection'
import S2Measure from './S2Measure'

