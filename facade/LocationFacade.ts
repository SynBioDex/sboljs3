
import IdentifiedFacade from './IdentifiedFacade'

import * as triple from '../triple'
import { Types, Predicates, Specifiers } from 'terms'
import SbolGraph from "../SbolGraph";
import SequenceAnnotationFacade from "sbolgraph/facade/SequenceAnnotationFacade";
import ComponentDefinitionFacade from "sbolgraph/facade/ComponentDefinitionFacade";
import ComponentInstanceFacade from "sbolgraph/facade/ComponentInstanceFacade";

export default abstract class LocationFacade extends IdentifiedFacade {

    constructor(graph:SbolGraph, uri:string) {

        super(graph, uri)

    }

    get containingObject():IdentifiedFacade|undefined {

        const uri = triple.subjectUri(
            this.graph.matchOne(null, Predicates.SBOL2.location, this.uri)
        )

        if(!uri) {
            throw new Error('Location has no containing object?')
        }

        return this.graph.uriToFacade(uri)

    }

    get containingSequenceAnnotation():SequenceAnnotationFacade {

        const containingObject:IdentifiedFacade|undefined = this.containingObject

        if(!(containingObject instanceof SequenceAnnotationFacade)) {
            throw new Error('???')
        }

        return containingObject as SequenceAnnotationFacade
    }

    get containingComponentInstance():ComponentInstanceFacade|undefined {

        return this.containingSequenceAnnotation.component

    }

    get containingComponentDefinition():ComponentDefinitionFacade {

        return this.containingSequenceAnnotation.containingComponentDefinition

    }

    isFixed():boolean {

        return this.facadeType === Types.SBOL2.Range // TODO || this.facadeType === Types.SBOL2.Cut
   
    }
}


