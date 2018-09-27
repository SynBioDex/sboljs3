
import * as triple from '../triple'
import { Types, Predicates, Specifiers } from 'bioterms'

import S2Facade from './S2Facade'

import SBOL2Graph from '../SBOL2Graph'
import { S2Attachment, S2Collection } from '..';

export default class S2Identified extends S2Facade {

    constructor(graph:SBOL2Graph, uri:string) {
        super(graph, uri)
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

    get version():string|undefined {
        return this.getStringProperty(Predicates.SBOL2.version)
    }

    set version(version:string|undefined) {
        this.setStringProperty(Predicates.SBOL2.version, version)
    }

    get persistentIdentity():string|undefined {
        return this.getUriProperty(Predicates.SBOL2.persistentIdentity)
    }

    set persistentIdentity(uri:string|undefined) {
        this.setUriProperty(Predicates.SBOL2.persistentIdentity, uri)
    }

    get uriPrefix():string {

        const version:string|undefined = this.version
        const displayId:string|undefined = this.displayId

        if(!displayId) {
            throw new Error('no displayId for ' + this.uri)
        }

        if(version) {

            return this.uri.substr(0,
                this.uri.length - displayId.length - version.length - 1)

        } else {

            return this.uri.substr(0,
                this.uri.length - displayId.length)

        }

    }

    get attachments():Array<S2Attachment> {

        return this.getUriProperties(Predicates.SBOL2.attachment)
            .map((attachment) => new S2Attachment(this.graph, attachment))

    }


    get containingObject():S2Identified|undefined {

        return undefined

    }

    get containedObjects():S2Identified[] {
        return []
    }

    get containingCollections():Array<S2Collection> {

        return this.graph.match(null, Predicates.SBOL2.member, this.uri)
                    .map(triple.subjectUri)
                    .map((uri) => new S2Collection(this.graph, uri as string))
    }


    get uriChain():string {

        const containingObject:S2Identified|undefined = this.containingObject

        if(containingObject !== undefined) {
            return containingObject.uriChain + ';' + this.uri
        } else {
            return this.uri
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
            if(theirContainer && theirContainer.uri === ourContainer.uri) {
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
            if(containedObjects[i].uri === this.uri) {
                containedObjects.splice(i, 1)
                break
            }
        }

        return containedObjects
    }
}


