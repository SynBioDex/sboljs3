
import SBOL2GraphView from '../SBOL2GraphView'

import S2Identified from './S2Identified'
import S2Participation from './S2Participation'

import { triple, node, Node } from 'rdfoo'
import { Types, Predicates, Specifiers } from 'bioterms'
import S2IdentifiedFactory from './S2IdentifiedFactory';
import S2Measure from './S2Measure';
import S2FunctionalComponent from './S2FunctionalComponent'
import S2ModuleDefinition from './S2ModuleDefinition'

export default class S2Interaction extends S2Identified {

    constructor(view:SBOL2GraphView, subject:Node) {

        super(view, subject)

    }

    get facadeType():string {
        return Types.SBOL2.Interaction
    }

    get type():string {

        const typeUri:Node|undefined = this.getProperty(Predicates.SBOL2.type)

        if(!typeUri)
            throw new Error(this.subject + ' has no type?')

        return typeUri.value
    }

    get types():Array<string> {

        return this.getUriProperties(Predicates.SBOL2.type)
    }

    set type(subject:string) {

        this.setUriProperty(Predicates.SBOL2.type, subject)

    }

    hasType(type:string):boolean {
        return this.view.graph.hasMatch(this.subject, Predicates.SBOL2.type, node.createUriNode(type))
    }

    get participations():Array<S2Participation> {

        return this.getProperties(Predicates.SBOL2.participation)
                   .map((subject:Node) => new S2Participation(this.view, subject))

    }

    get participants():Array<S2FunctionalComponent> {

        const participants:Array<S2FunctionalComponent|undefined>
            = this.participations.map((participation:S2Participation) => participation.participant)

        return participants.filter((el) => !!el) as Array<S2FunctionalComponent>
    }

    get containingModuleDefinition():S2ModuleDefinition {

        const uri =
            this.view.graph.matchOne(null, Predicates.SBOL2.interaction, this.subject)?.subject

        if(!uri) {
            throw new Error('Interaction ' + this.subject.value + ' not contained by a MD?')
        }

        return new S2ModuleDefinition(this.view, uri)
    }

    get containingObject():S2Identified|undefined {

        return this.containingModuleDefinition

    }

    addParticipation(participation:S2Participation) {
        this.insertProperties({
            [Predicates.SBOL2.participation]: participation.subject
        })
    }

    createParticipation(id?:string, version?:string):S2Participation {

        const identified:S2Identified =
            S2IdentifiedFactory.createChild(this.view, Types.SBOL2.Participation, this, Predicates.SBOL2.participation, id, undefined, version)

        const participation:S2Participation = new S2Participation(this.view, identified.subject)

        return participation
    }

    createParticipationWithParticipantAndRole(id:string, participant:S2FunctionalComponent, role:string, version?:string):S2Participation {

        let participation = this.createParticipation(id, version)

        participation.addRole(role)
        participation.setParticipant(participant)

        return participation
    }

    get measure():S2Measure|undefined {
        let measure = this.getProperty(Predicates.SBOL2.measure)

        if(measure === undefined)
            return
        
        return new S2Measure(this.view, measure)
    }

    set measure(measure:S2Measure|undefined) {

        if(measure === undefined)
            this.deleteProperty(Predicates.SBOL2.measure)
        else
            this.setProperty(Predicates.SBOL2.measure, measure.subject)

    }

}


