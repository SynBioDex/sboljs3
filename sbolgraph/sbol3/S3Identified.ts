
import { triple } from 'rdfoo'
import { Types, Predicates, Specifiers } from 'bioterms'

import S3Facade from './S3Facade'

import URIUtils from '../URIUtils';
import SBOL3GraphView from '../SBOL3GraphView';
import { S3Namespace } from '..';

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
        return this.name || this.getStringProperty(Predicates.SBOL3.displayId) || this.uri
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
        return URIUtils.getPrefix(this.uri)
    }

    get namespace():S3Namespace|undefined {
        let n = this.view.uriToFacade(
            this.graph.match(null, Predicates.SBOL3.member, this.uri)
                .map(triple.subjectUri)
                .filter(uri => this.graph.hasMatch(uri as string, Predicates.a, Types.SBOL3.Namespace))[0] as string
        ) 

        if(n === undefined)
            return

        return n as S3Namespace
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


