
import S3Identified from './S3Identified'

import { triple, Node } from 'rdfoo'
import { Types, Predicates, Specifiers } from 'bioterms'
import SBOL3GraphView from "../SBOL3GraphView";
import S3Sequence from "./S3Sequence";

export default abstract class S3Location extends S3Identified {

    constructor(view:SBOL3GraphView, subject:Node) {

        super(view, subject)

    }

    get containingObject():S3Identified|undefined {

        const uri = triple.subjectUri(
            this.view.graph.matchOne(null, Predicates.SBOL3.hasLocation, this.subject)
        )

        if(!subject) {
            throw new Error('Location has no containing object?')
        }

        return this.view.uriToIdentified(subject)

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

        let uri = this.getUriProperty(Predicates.SBOL3.hasSequence)

        if(uri === undefined)
            return undefined
        
        let obj = this.view.subjectToFacade(subject)

        if(! (obj instanceof S3Sequence)) {
            throw new Error('sequence was not a sequence')
        }

        return obj
    }

    set sequence(sequence:S3Sequence|undefined) {

        if(sequence !== undefined)
            this.setUriProperty(Predicates.SBOL2.sequence, sequence.subject)
        else
            this.deleteProperty(Predicates.SBOL2.sequence)

    }
}


