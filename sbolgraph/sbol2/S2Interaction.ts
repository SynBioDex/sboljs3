import SBOLGraph, { S2FunctionalComponent, S2ModuleDefinition } from '..';

import S2Identified from './S2Identified'
import S2Participation from './S2Participation'

import * as triple from '../triple'
import { Types, Predicates, Specifiers } from 'sbolterms'

export default class S2Interaction extends S2Identified {

    constructor(graph:SBOLGraph, uri:string) {

        super(graph, uri)

    }

    get facadeType():string {
        return Types.SBOL2.Interaction
    }

    get participations():Array<S2Participation> {

        return this.getUriProperties(Predicates.SBOL2.participation)
                   .map((uri:string) => new S2Participation(this.graph, uri))

    }

    get participants():Array<S2FunctionalComponent> {

        const participants:Array<S2FunctionalComponent|undefined>
            = this.participations.map((participation:S2Participation) => participation.participant)

        return participants.filter((el) => !!el) as Array<S2FunctionalComponent>
    }

    get containingModuleDefinition():S2ModuleDefinition {

        const uri = triple.subjectUri(
            this.graph.matchOne(null, Predicates.SBOL2.interaction, this.uri)
        )

        if(!uri) {
            throw new Error('Interaction ' + this.uri + ' not contained by a MD?')
        }

        return new S2ModuleDefinition(this.graph, uri)
    }

    get containingObject():S2Identified|undefined {

        return this.containingModuleDefinition

    }
}


