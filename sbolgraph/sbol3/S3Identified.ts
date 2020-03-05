
import { triple } from 'rdfoo'
import { Types, Predicates, Specifiers } from 'bioterms'

import S3Facade from './S3Facade'

import URIUtils from '../URIUtils';
import SBOL3GraphView from '../SBOL3GraphView';

export default class S3Identified extends S3Facade {

    constructor(view:SBOL3GraphView, uri:string) {
        super(view, uri)
    }

    get facadeType():string {
        throw new Error('base called')
    }

    get name():string|undefined {
        return this.getStringProperty(Predicates.Dcterms.title)
    }

    // Should never throw; make sure not dependent on any getRequiredProperties
    get displayName():string|undefined {
        return this.name || this.getStringProperty(Predicates.SBOL3.id) || this.uri
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

    get id():string|undefined {
        return this.getStringProperty(Predicates.SBOL3.id)
    }

    set id(id:string|undefined) {
        this.setStringProperty(Predicates.SBOL3.id, id)
    }

    get version():string|undefined {
        return this.getStringProperty(Predicates.SBOL3.version)
    }

    setCompliantIdentity(id:string, version?:string, newPrefix?:string) {

        let uriPrefix = newPrefix || this.uriPrefix

        this.id = id
        this.version = version

        let newPersistentIdentity = uriPrefix + id
        let newURI = newPersistentIdentity

        if(version)
            newURI += '/' + version

        let curPersistentIdentity = this.persistentIdentity

        if(newURI !== this.uri) {

            console.log(this.view.serializeXML())
            console.log('replace ' + this.uri + ' -> ' + newURI)
            this.graph.replaceURI(this.uri, newURI)
            console.log(this.view.serializeXML())

            this.uri = newURI
        }

        if (curPersistentIdentity) {
            this.graph.replaceURI(curPersistentIdentity, newPersistentIdentity)
        }

        this.persistentIdentity = newPersistentIdentity

        let childPrefix = this.persistentIdentity + '/'

        for(let contained of this.containedObjects) {

            let containedID = contained.id

            if(containedID) {
                contained.setCompliantIdentity(containedID, contained.version, childPrefix)
            } else {
                // not compliant; can't do anything
            }
        }
    }

    set version(version:string|undefined) {

        if(version !== undefined) {
            this.setStringProperty(Predicates.SBOL3.version, version)
        } else {
            this.deleteProperty(Predicates.SBOL3.version)
        }
    }

    get persistentIdentity():string|undefined {
        return this.getUriProperty(Predicates.SBOL3.persistentIdentity)
    }

    set persistentIdentity(uri:string|undefined) {

        if(uri !== undefined) {
            this.setUriProperty(Predicates.SBOL3.persistentIdentity, uri)
        } else {
            this.deleteProperty(Predicates.SBOL3.persistentIdentity)
        }
    }

    get uriPrefix():string {
        return URIUtils.getPrefix(this.uri)
    }

    get containingObject():S3Identified|undefined {

        return undefined

    }

    get containedObjects():Array<S3Identified> {

        return []

    }

    isSiblingOf(other:S3Identified):boolean {

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

    getSiblings():Array<S3Identified> {

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

    destroy() {

        let contained = this.containedObjects

        super.destroy()

        for(let obj of contained) {
            obj.destroy()
        }
    }

}


