import { SBOLXGraph, SXSubModule, SXModule } from '..';

import SXIdentified from './SXIdentified'
import SXParticipation from './SXParticipation'

import * as triple from '../triple'
import { Types, Predicates, Specifiers } from 'sbolterms'

export default class SXInteraction extends SXIdentified {

    constructor(graph:SBOLXGraph, uri:string) {

        super(graph, uri)

    }

    get facadeType():string {
        return Types.SBOLX.Interaction
    }

    get participations():Array<SXParticipation> {

        return this.getUriProperties(Predicates.SBOLX.hasParticipation)
                   .map((uri:string) => new SXParticipation(this.graph, uri))

    }

    get participants():Array<SXSubModule> {

        const participants:Array<SXSubModule|undefined>
            = this.participations.map((participation:SXParticipation) => participation.participant)

        return participants.filter((el) => !!el) as Array<SXSubModule>
    }

    get containingModule():SXModule {

        const uri = triple.subjectUri(
            this.graph.matchOne(null, Predicates.SBOLX.hasInteraction, this.uri)
        )

        if(!uri) {
            throw new Error('Interaction ' + this.uri + ' not contained by a Module?')
        }

        return new SXModule(this.graph, uri)
    }

    get containingObject():SXIdentified|undefined {

        return this.containingModule

    }
}


