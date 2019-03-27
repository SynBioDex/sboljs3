import { SBOLXGraph } from '..';

import SXIdentified from './SXIdentified'
import SXSubComponent from './SXSubComponent'
import SXInteraction from './SXInteraction'

import * as triple from '../triple'
import * as node from '../node'
import { Types, Predicates, Specifiers } from 'bioterms'
import SXMeasure from './SXMeasure';

export default class SXParticipation extends SXIdentified {

    constructor(graph:SBOLXGraph, uri:string) {

        super(graph, uri)

    }

    get facadeType():string {
        return Types.SBOLX.Participation
    }

    get participant():SXSubComponent|undefined {

        const uri:string|undefined = this.getUriProperty(Predicates.SBOLX.participant)

        if(uri) {
            return new SXSubComponent(this.graph, uri)
        }
    }

    set participant(c:SXSubComponent|undefined) {

        if(c) {
            this.setUriProperty(Predicates.SBOLX.participant, c.uri)
        } else {
            this.deleteProperty(Predicates.SBOLX.participant)
        }
    }

    get interaction():SXInteraction|undefined {

        const uri:string|undefined = triple.subjectUri(
            this.graph.matchOne(null, Predicates.SBOLX.participation, this.uri)
        )

        if(uri) {
            return new SXInteraction(this.graph, uri)
        }

    }

    get containingObject():SXIdentified|undefined {

        const uri = triple.subjectUri(
            this.graph.matchOne(null, Predicates.SBOLX.participation, this.uri)
        )

        if(!uri) {
            throw new Error('Participation has no containing object?')
        }

        return this.graph.uriToFacade(uri)

    }

    hasRole(uri:string):boolean {

        return this.graph.hasMatch(this.uri, Predicates.SBOLX.role, uri)
    
    }

    addRole(role:string):void {
        this.graph.insert(this.uri, Predicates.SBOLX.role, node.createUriNode(role))
    }

    removeRole(role:string):void {
        this.graph.removeMatches(this.uri, Predicates.SBOLX.role, role)
    }

    get roles():string[] {
        return this.getUriProperties(Predicates.SBOLX.role)
    }

    setParticipant(participant:SXSubComponent):void {
        this.setUriProperty(Predicates.SBOLX.participant, participant.uri)
    }

    get measure():SXMeasure|undefined {
        let measure = this.getUriProperty(Predicates.SBOLX.measure)

        if(measure === undefined)
            return
        
        return new SXMeasure(this.graph, measure)
    }

    set measure(measure:SXMeasure|undefined) {

        if(measure === undefined)
            this.deleteProperty(Predicates.SBOLX.measure)
        else
            this.setUriProperty(Predicates.SBOLX.measure, measure.uri)

    }


}


