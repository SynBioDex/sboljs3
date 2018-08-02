import { SBOLXGraph, SXSubComponent, SXComponent } from '..';

import SXIdentified from './SXIdentified'
import SXParticipation from './SXParticipation'

import * as triple from '../triple'
import * as node from '../node'
import { Types, Predicates, Specifiers } from 'bioterms'
import SXIdentifiedFactory from './SXIdentifiedFactory';

export default class SXInteraction extends SXIdentified {

    constructor(graph:SBOLXGraph, uri:string) {

        super(graph, uri)

    }

    get facadeType():string {
        return Types.SBOLX.Interaction
    }

    get type():string {

        const typeUri:string|undefined = this.getUriProperty(Predicates.SBOLX.type)

        if(!typeUri)
            throw new Error(this.uri + ' has no type?')

        return typeUri
    }

    get types():Array<string> {

        return this.getUriProperties(Predicates.SBOLX.type)
    }

    set type(uri:string) {

        this.setUriProperty(Predicates.SBOLX.type, uri)

    }

    addType(type:string) {

        this.graph.add(node.createUriNode(this.uri), node.createUriNode(Predicates.SBOLX.type), node.createUriNode(type))

    }

    hasType(type:string):boolean {
        return this.graph.hasMatch(this.uri, Predicates.SBOLX.type, type)
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

    hasParticipant(participant:SXSubComponent):boolean {

        return this.participants.map((p) => p.uri).indexOf(participant.uri) !== -1

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

    createParticipation(id:string, version?:string):SXParticipation {

        const identified:SXIdentified =
            SXIdentifiedFactory.createChild(this.graph, Types.SBOLX.Participation, this, id, undefined, version)

        const participation:SXParticipation = new SXParticipation(this.graph, identified.uri)

        this.graph.add(node.createUriNode(this.uri), node.createUriNode(Predicates.SBOLX.hasParticipation), node.createUriNode(identified.uri))

        return participation
    }

    createParticipationWithParticipantAndRole(id:string, participant:SXSubComponent, role:string, version?:string):SXParticipation {

        let participation = this.createParticipation(id, version)

        participation.addRole(role)
        participation.setParticipant(participant)

        return participation
    }




}


