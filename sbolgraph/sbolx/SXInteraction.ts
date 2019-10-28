
import SBOLXGraphView from '../SBOLXGraphView'

import SXIdentified from './SXIdentified'
import SXParticipation from './SXParticipation'

import { triple, node } from 'rdfoo'
import { Types, Predicates, Specifiers } from 'bioterms'
import SXIdentifiedFactory from './SXIdentifiedFactory';
import SXMeasure from './SXMeasure';
import SXSubComponent from './SXSubComponent'
import SXComponent from './SXComponent'

export default class SXInteraction extends SXIdentified {

    constructor(view:SBOLXGraphView, uri:string) {

        super(view, uri)

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

        this.insertProperty(Predicates.SBOLX.type, node.createUriNode(type))

    }

    hasType(type:string):boolean {
        return this.view.graph.hasMatch(this.uri, Predicates.SBOLX.type, type)
    }

    get participations():Array<SXParticipation> {

        return this.getUriProperties(Predicates.SBOLX.participation)
                   .map((uri:string) => new SXParticipation(this.view, uri))

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
            this.view.graph.matchOne(null, Predicates.SBOLX.interaction, this.uri)
        )

        if(!uri) {
            throw new Error('Interaction ' + this.uri + ' not contained by a Module?')
        }

        return new SXComponent(this.view, uri)
    }

    get containingObject():SXIdentified|undefined {

        return this.containingModule

    }

    createParticipation(id:string, version?:string):SXParticipation {

        const identified:SXIdentified =
            SXIdentifiedFactory.createChild(this.view, Types.SBOLX.Participation, this, Predicates.SBOLX.participation, id, undefined, version)

        const participation:SXParticipation = new SXParticipation(this.view, identified.uri)

        return participation
    }

    createParticipationWithParticipantAndRole(id:string, participant:SXSubComponent, role:string, version?:string):SXParticipation {

        let participation = this.createParticipation(id, version)

        participation.addRole(role)
        participation.setParticipant(participant)

        return participation
    }

    get measure():SXMeasure|undefined {
        let measure = this.getUriProperty(Predicates.SBOLX.measure)

        if(measure === undefined)
            return
        
        return new SXMeasure(this.view, measure)
    }

    set measure(measure:SXMeasure|undefined) {

        if(measure === undefined)
            this.deleteProperty(Predicates.SBOLX.measure)
        else
            this.setUriProperty(Predicates.SBOLX.measure, measure.uri)

    }



}


