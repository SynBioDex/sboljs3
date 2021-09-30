
import SBOL3GraphView from '../SBOL3GraphView'

import S3Identified from './S3Identified'
import S3Participation from './S3Participation'

import { triple, node, Node } from 'rdfoo'
import { Types, Predicates, Specifiers } from 'bioterms'
import S3IdentifiedFactory from './S3IdentifiedFactory';
import S3Measure from './S3Measure';
import S3SubComponent from './S3SubComponent'
import S3Component from './S3Component'

export default class S3Interaction extends S3Identified {

    constructor(view:SBOL3GraphView, subject:Node) {

        super(view, subject)

    }

    get facadeType():string {
        return Types.SBOL3.Interaction
    }

    get type():string {

        const typeUri:string|undefined = this.getUriProperty(Predicates.SBOL3.type)

        if(!typeUri)
            throw new Error(this.subject.value + ' has no type?')

        return typeUri
    }

    get types():Array<string> {

        return this.getUriProperties(Predicates.SBOL3.type)
    }

    set type(subject:string) {

        this.setUriProperty(Predicates.SBOL3.type, subject)

    }

    addType(type:string) {

        this.insertProperty(Predicates.SBOL3.type, node.createUriNode(type))

    }

    hasType(type:string):boolean {
        return this.view.graph.hasMatch(this.subject, Predicates.SBOL3.type, node.createUriNode( type) )
    }

    get participations():Array<S3Participation> {

        return this.getProperties(Predicates.SBOL3.hasParticipation)
                   .map((subject:Node) => new S3Participation(this.view, subject))

    }

    get participants():Array<S3SubComponent> {

        const participants:Array<S3SubComponent|undefined>
            = this.participations.map((participation:S3Participation) => participation.participant)

        return participants.filter((el) => !!el) as Array<S3SubComponent>
    }

    hasParticipant(participant:S3SubComponent):boolean {

        return this.participants.map((p) => p.subject).indexOf(participant.subject) !== -1

    }

    get containingModule():S3Component {

        const subject = this.view.graph.matchOne(null, Predicates.SBOL3.hasInteraction, this.subject)?.subject

        if(!subject) {
            throw new Error('Interaction ' + this.subject.value + ' not contained by a Module?')
        }

        return new S3Component(this.view, subject)
    }

    get containingObject():S3Identified|undefined {

        return this.containingModule

    }

    createParticipation(id:string, version?:string):S3Participation {

        const identified:S3Identified =
            S3IdentifiedFactory.createChild(this.view, Types.SBOL3.Participation, this, Predicates.SBOL3.hasParticipation, id, undefined)

        const participation:S3Participation = new S3Participation(this.view, identified.subject)

        return participation
    }

    createParticipationWithParticipantAndRole(id:string, participant:S3SubComponent, role:string, version?:string):S3Participation {

        let participation = this.createParticipation(id, version)

        participation.addRole(role)
        participation.setParticipant(participant)

        return participation
    }

    get measure():S3Measure|undefined {
        let measure = this.getProperty(Predicates.SBOL3.hasMeasure)

        if(measure === undefined)
            return
        
        return new S3Measure(this.view, measure)
    }

    set measure(measure:S3Measure|undefined) {

        if(measure === undefined)
            this.deleteProperty(Predicates.SBOL3.hasMeasure)
        else
            this.setProperty(Predicates.SBOL3.hasMeasure, measure.subject)

    }



}


