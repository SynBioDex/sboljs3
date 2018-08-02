
import * as triple from '../triple'
import { Types, Predicates, Specifiers } from 'bioterms'

import SXFacade from './SXFacade'

import SBOLXGraph from '../SBOLXGraph'

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

    get displayName():string|undefined {
        return this.name || this.id
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

    get id():string {
        return this.getRequiredStringProperty(Predicates.SBOLX.id)
    }

    set id(id:string) {
        this.setStringProperty(Predicates.SBOLX.id, id)
    }

    get version():string {
        return this.getRequiredStringProperty(Predicates.SBOLX.version)
    }

    set version(version:string) {
        this.setStringProperty(Predicates.SBOLX.version, version)
    }

    get persistentIdentity():string {
        return this.getRequiredUriProperty(Predicates.SBOLX.persistentIdentity)
    }

    set persistentIdentity(uri:string) {
        this.setUriProperty(Predicates.SBOLX.persistentIdentity, uri)
    }

    get uriPrefix():string {

        const version:string = this.version
        const id:string = this.id

        return this.uri.substr(0,
            this.uri.length - id.length - version.length - 1)

    }

    get containingObject():SXIdentified|undefined {

        return undefined

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
            if(theirContainer === ourContainer) {
                return true
            } else {
                return false
            }
        }
    }

}


