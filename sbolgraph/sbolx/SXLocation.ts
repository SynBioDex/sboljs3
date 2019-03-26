
import SXIdentified from './SXIdentified'

import * as triple from '../triple'
import { Types, Predicates, Specifiers } from 'bioterms'
import SBOLXGraph from "../SBOLXGraph";
import SXSequence from "./SXSequence";

export default abstract class SXLocation extends SXIdentified {

    constructor(graph:SBOLXGraph, uri:string) {

        super(graph, uri)

    }

    get containingObject():SXIdentified|undefined {

        const uri = triple.subjectUri(
            this.graph.matchOne(null, Predicates.SBOLX.location, this.uri)
        )

        if(!uri) {
            throw new Error('Location has no containing object?')
        }

        return this.graph.uriToFacade(uri)

    }

    isFixed():boolean {

        return this.facadeType === Types.SBOLX.Range // TODO || this.facadeType === Types.SBOLX.Cut
   
    }

    get displayName():string|undefined {

        const name:string|undefined = this.name

        if(name !== undefined)
            return name

        const containingObject:SXIdentified|undefined = this.containingObject

        if(containingObject === undefined) {
            throw new Error('???')

        }

        return containingObject.displayName

    }

    get sequence():SXSequence|undefined {

        let uri = this.getUriProperty(Predicates.SBOLX.sequence)

        if(uri === undefined)
            return undefined
        
        let obj = this.graph.uriToFacade(uri)

        if(! (obj instanceof SXSequence)) {
            throw new Error('sequence was not a sequence')
        }

        return obj
    }

    set sequence(sequence:SXSequence|undefined) {

        if(sequence !== undefined)
            this.setUriProperty(Predicates.SBOL2.sequence, sequence.uri)
        else
            this.deleteProperty(Predicates.SBOL2.sequence)

    }
}


