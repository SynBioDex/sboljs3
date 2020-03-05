
import S3Identified from './S3Identified'

import { triple } from 'rdfoo'
import { Types, Predicates, Specifiers } from 'bioterms'
import SBOL3GraphView from "../SBOL3GraphView";
import S3Sequence from "./S3Sequence";

export default abstract class S3Location extends S3Identified {

    constructor(view:SBOL3GraphView, uri:string) {

        super(view, uri)

    }

    get containingObject():S3Identified|undefined {

        const uri = triple.subjectUri(
            this.view.graph.matchOne(null, Predicates.SBOL3.location, this.uri)
        )

        if(!uri) {
            throw new Error('Location has no containing object?')
        }

        return this.view.uriToIdentified(uri)

    }

    isFixed():boolean {

        return this.facadeType === Types.SBOL3.Range // TODO || this.facadeType === Types.SBOL3.Cut
   
    }

    get displayName():string|undefined {

        const name:string|undefined = this.name

        if(name !== undefined)
            return name

        const containingObject:S3Identified|undefined = this.containingObject

        if(containingObject === undefined) {
            throw new Error('???')

        }

        return containingObject.displayName

    }

    get sequence():S3Sequence|undefined {

        let uri = this.getUriProperty(Predicates.SBOL3.sequence)

        if(uri === undefined)
            return undefined
        
        let obj = this.view.uriToFacade(uri)

        if(! (obj instanceof S3Sequence)) {
            throw new Error('sequence was not a sequence')
        }

        return obj
    }

    set sequence(sequence:S3Sequence|undefined) {

        if(sequence !== undefined)
            this.setUriProperty(Predicates.SBOL2.sequence, sequence.uri)
        else
            this.deleteProperty(Predicates.SBOL2.sequence)

    }
}


