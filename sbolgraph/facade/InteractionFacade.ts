import SbolGraph, { FunctionalComponentFacade, ModuleDefinitionFacade } from '..';

import IdentifiedFacade from './IdentifiedFacade'
import ParticipationFacade from './ParticipationFacade'

import * as triple from '../triple'
import { Types, Predicates, Specifiers } from 'sbolterms'

export default class InteractionFacade extends IdentifiedFacade {

    constructor(graph:SbolGraph, uri:string) {

        super(graph, uri)

    }

    get facadeType():string {
        return Types.SBOL2.Interaction
    }

    get participations():Array<ParticipationFacade> {

        return this.getUriProperties(Predicates.SBOL2.participation)
                   .map((uri:string) => new ParticipationFacade(this.graph, uri))

    }

    get participants():Array<FunctionalComponentFacade> {

        const participants:Array<FunctionalComponentFacade|undefined>
            = this.participations.map((participation:ParticipationFacade) => participation.participant)

        return participants.filter((el) => !!el) as Array<FunctionalComponentFacade>
    }

    get containingModuleDefinition():ModuleDefinitionFacade {

        const uri = triple.subjectUri(
            this.graph.matchOne(null, Predicates.SBOL2.interaction, this.uri)
        )

        if(!uri) {
            throw new Error('Interaction ' + this.uri + ' not contained by a MD?')
        }

        return new ModuleDefinitionFacade(this.graph, uri)
    }

    get containingObject():IdentifiedFacade|undefined {

        return this.containingModuleDefinition

    }
}


