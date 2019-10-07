import { SBOL2Graph, S2FunctionalComponent, S2ModuleDefinition } from '..';

import S2Identified from './S2Identified'
import S2Participation from './S2Participation'

import { triple, node } from 'rdfoo'
import { Types, Predicates, Specifiers } from 'bioterms'
import S2IdentifiedFactory from './S2IdentifiedFactory';
import S2Measure from './S2Measure';

export default class S2Interaction extends S2Identified {

    constructor(graph:SBOL2Graph, uri:string) {

        super(graph, uri)

    }

    get facadeType():string {
        return Types.SBOL2.Interaction
    }

    get type():string {

        const typeUri:string|undefined = this.getUriProperty(Predicates.SBOL2.type)

        if(!typeUri)
            throw new Error(this.uri + ' has no type?')

        return typeUri
    }

    get types():Array<string> {

        return this.getUriProperties(Predicates.SBOL2.type)
    }

    set type(uri:string) {

        this.setUriProperty(Predicates.SBOL2.type, uri)

    }

    hasType(type:string):boolean {
        return this.graph.hasMatch(this.uri, Predicates.SBOL2.type, type)
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

    addParticipation(participation:S2Participation) {
        this.graph.insertProperties(this.uri, {
            [Predicates.SBOL2.participation]: node.createUriNode(participation.uri)
        })
    }

    createParticipation(id?:string, version?:string):S2Participation {

        const identified:S2Identified =
            S2IdentifiedFactory.createChild(this.graph, Types.SBOL2.Participation, this, Predicates.SBOL2.participation, id, undefined, version)

        const participation:S2Participation = new S2Participation(this.graph, identified.uri)

        return participation
    }

    createParticipationWithParticipantAndRole(id:string, participant:S2FunctionalComponent, role:string, version?:string):S2Participation {

        let participation = this.createParticipation(id, version)

        participation.addRole(role)
        participation.setParticipant(participant)

        return participation
    }

    get measure():S2Measure|undefined {
        let measure = this.getUriProperty(Predicates.SBOL2.measure)

        if(measure === undefined)
            return
        
        return new S2Measure(this.graph, measure)
    }

    set measure(measure:S2Measure|undefined) {

        if(measure === undefined)
            this.deleteProperty(Predicates.SBOL2.measure)
        else
            this.setUriProperty(Predicates.SBOL2.measure, measure.uri)

    }

}


