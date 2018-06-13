import { SBOLXGraph } from '..';

import SXIdentified from './SXIdentified'
import SXSubComponent from './SXSubComponent'
import SXInteraction from './SXInteraction'

import * as triple from '../triple'
import * as node from '../node'
import { Types, Predicates, Specifiers } from 'bioterms'

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

    get interaction():SXInteraction|undefined {

        const uri:string|undefined = triple.subjectUri(
            this.graph.matchOne(null, Predicates.SBOLX.hasParticipation, this.uri)
        )

        if(uri) {
            return new SXInteraction(this.graph, uri)
        }

    }

    get containingObject():SXIdentified|undefined {

        const uri = triple.subjectUri(
            this.graph.matchOne(null, Predicates.SBOLX.hasParticipation, this.uri)
        )

        if(!uri) {
            throw new Error('Participation has no containing object?')
        }

        return this.graph.uriToFacade(uri)

    }

    hasRole(uri:string):boolean {

        return this.graph.hasMatch(this.uri, Predicates.SBOLX.hasRole, uri)
    
    }

    addRole(role:string):void {
        this.graph.insert(node.createUriNode(this.uri), Predicates.SBOLX.hasRole, node.createUriNode(role))
    }

    get roles():string[] {
        return this.getUriProperties(Predicates.SBOLX.hasRole)
    }

    setParticipant(participant:SXSubComponent):void {
        this.setUriProperty(Predicates.SBOLX.participant, node.createUriNode(participant.uri))
    }



}


