
import * as triple from '../triple'
import { Types, Predicates, Specifiers } from 'terms'

import Facade from './Facade'

import SbolGraph from 'sbolgraph'

export default abstract class IdentifiedFacade extends Facade {

    constructor(graph:SbolGraph, uri:string) {
        super(graph, uri)
    }

    get name():string|undefined {
        return this.getStringProperty(Predicates.Dcterms.title)
    }

    get displayName():string|undefined {
        return this.name || this.displayId
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



    abstract get containingObject():IdentifiedFacade|undefined


    get uriChain():string {

        const containingObject:IdentifiedFacade|undefined = this.containingObject

        if(containingObject !== undefined) {
            return containingObject.uriChain + ';' + this.uri
        } else {
            return this.uri
        }

    }
}


