import { SBOLXGraph, SXSubComponent, SXComponent } from '..';

import SXIdentified from './SXIdentified'
import SXParticipation from './SXParticipation'

import * as triple from '../triple'
import { Types, Predicates, Specifiers } from 'bioterms'

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

    get participants():Array<SXSubComponent> {

        const participants:Array<SXSubComponent|undefined>
            = this.participations.map((participation:SXParticipation) => participation.participant)

        return participants.filter((el) => !!el) as Array<SXSubComponent>
    }

    get containingModule():SXComponent {

        const uri = triple.subjectUri(
            this.graph.matchOne(null, Predicates.SBOLX.hasInteraction, this.uri)
        )

        if(!uri) {
            throw new Error('Interaction ' + this.uri + ' not contained by a Module?')
        }

        return new SXComponent(this.graph, uri)
    }

    get containingObject():SXIdentified|undefined {

        return this.containingModule

    }
}


