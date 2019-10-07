
import S2Identified from './S2Identified'

import { triple } from 'rdfoo'
import { Types, Predicates, Specifiers } from 'bioterms'
import SBOL2Graph from "../SBOL2Graph";
import S2SequenceAnnotation from "./S2SequenceAnnotation";
import S2ComponentDefinition from "./S2ComponentDefinition";
import S2ComponentInstance from "./S2ComponentInstance";
import S2Sequence from './S2Sequence';

export default abstract class S2Location extends S2Identified {

    constructor(graph:SBOL2Graph, uri:string) {

        super(graph, uri)

    }

    get containingObject():S2Identified|undefined {

        const uri = triple.subjectUri(
            this.graph.matchOne(null, Predicates.SBOL2.location, this.uri)
        )

        if(!uri) {
            throw new Error('Location has no containing object?')
        }

        return this.graph.uriToFacade(uri)

    }

    get containingSequenceAnnotation():S2SequenceAnnotation {

        const containingObject:S2Identified|undefined = this.containingObject

        if(!(containingObject instanceof S2SequenceAnnotation)) {
            throw new Error('???')
        }

        return containingObject as S2SequenceAnnotation
    }

    get containingComponentInstance():S2ComponentInstance|undefined {

        return this.containingSequenceAnnotation.component

    }

    get containingComponentDefinition():S2ComponentDefinition {

        return this.containingSequenceAnnotation.containingComponentDefinition

    }

    isFixed():boolean {

        return this.facadeType === Types.SBOL2.Range // TODO || this.facadeType === Types.SBOL2.Cut
   
    }

    get sequence():S2Sequence|undefined {

        let uri = this.getUriProperty(Predicates.SBOL2.sequence)

        if(uri === undefined)
            return undefined
        
        let obj = this.graph.uriToFacade(uri)

        if(! (obj instanceof S2Sequence)) {
            throw new Error('sequence was not a sequence')
        }

        return obj
    }

    set sequence(sequence:S2Sequence|undefined) {

        if(sequence !== undefined)
            this.setUriProperty(Predicates.SBOL2.sequence, sequence.uri)
        else
            this.deleteProperty(Predicates.SBOL2.sequence)

    }
}


