
import { triple } from 'rdfoo'
import { Types, Predicates, Specifiers } from 'bioterms'

import SXFacade from './SXFacade'

import SBOLXGraph from '../SBOLXGraph'
import URIUtils from '../URIUtils';

export default class SXIdentified extends SXFacade {

    constructor(graph:SBOLXGraph, uri:string) {
        super(graph, uri)
    }

    get facadeType():string {
        throw new Error('base called')
    }

    get name():string|undefined {
        return this.getStringProperty(Predicates.Dcterms.title)
    }

    // Should never throw; make sure not dependent on any getRequiredProperties
    get displayName():string|undefined {
        return this.name || this.getStringProperty(Predicates.SBOLX.id) || this.uri
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
        return this.getStringProperty(Predicates.SBOLX.id)
    }

    set id(id:string|undefined) {
        this.setStringProperty(Predicates.SBOLX.id, id)
    }

    get version():string|undefined {
        return this.getStringProperty(Predicates.SBOLX.version)
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

            console.log(this.graph.serializeXML())
            console.log('replace ' + this.uri + ' -> ' + newURI)
            this.graph.replaceURI(this.uri, newURI)
            console.log(this.graph.serializeXML())

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
            this.setStringProperty(Predicates.SBOLX.version, version)
        } else {
            this.deleteProperty(Predicates.SBOLX.version)
        }
    }

    get persistentIdentity():string|undefined {
        return this.getUriProperty(Predicates.SBOLX.persistentIdentity)
    }

    set persistentIdentity(uri:string|undefined) {

        if(uri !== undefined) {
            this.setUriProperty(Predicates.SBOLX.persistentIdentity, uri)
        } else {
            this.deleteProperty(Predicates.SBOLX.persistentIdentity)
        }
    }

    get uriPrefix():string {
        return URIUtils.getPrefix(this.uri)
    }

    get containingObject():SXIdentified|undefined {

        return undefined

    }

    get containedObjects():Array<SXIdentified> {

        return []

    }

    isSiblingOf(other:SXIdentified):boolean {

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

    getSiblings():Array<SXIdentified> {

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


