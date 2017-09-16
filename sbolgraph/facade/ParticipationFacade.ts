import SbolGraph from 'sbolgraph';

import IdentifiedFacade from './IdentifiedFacade'
import FunctionalComponentFacade from './FunctionalComponentFacade'
import InteractionFacade from './InteractionFacade'

import * as triple from '../triple'
import { Types, Predicates, Specifiers } from 'terms'

export default class ParticipationFacade extends IdentifiedFacade {

    constructor(graph:SbolGraph, uri:string) {

        super(graph, uri)

    }

    get facadeType():string {
        return Types.SBOL2.Participation
    }

    get participant():FunctionalComponentFacade|undefined {

        const uri:string|undefined = this.getUriProperty(Predicates.SBOL2.participant)

        if(uri) {
            return new FunctionalComponentFacade(this.graph, uri)
        }
    }

    get interaction():InteractionFacade|undefined {

        const uri:string|undefined = triple.subjectUri(
            this.graph.matchOne(null, Predicates.SBOL2.participation, this.uri)
        )

        if(uri) {
            return new InteractionFacade(this.graph, uri)
        }

    }

    get containingObject():IdentifiedFacade|undefined {

        const uri = triple.subjectUri(
            this.graph.matchOne(null, Predicates.SBOL2.participation, this.uri)
        )

        if(!uri) {
            throw new Error('Participation has no containing object?')
        }

        return this.graph.uriToFacade(uri)

    }

    hasRole(uri:string):boolean {

        return this.graph.hasMatch(this.uri, Predicates.SBOL2.role, uri)
    
    }

}


