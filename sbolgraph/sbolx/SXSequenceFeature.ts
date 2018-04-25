
import SXIdentified from './SXIdentified'
import SXThingWithLocation from './SXThingWithLocation'

import * as triple from '../triple'
import * as node from '../node'
import { Types, Predicates, Specifiers } from 'bioterms'
import SBOLXGraph from "../SBOLXGraph";
import SXComponent from "./SXComponent";
import SXSubComponent from "./SXSubComponent";
import SXIdentifiedFactory from './SXIdentifiedFactory';
import SXRange from "./SXRange";

export default class SXSequenceFeature extends SXThingWithLocation {

    constructor(graph:SBOLXGraph, uri:string) {

        super(graph, uri)

    }

    get roles():Array<string> {
        return this.getUriProperties(Predicates.SBOLX.hasRole)
    }

    hasRole(role:string):boolean {
        return this.graph.hasMatch(this.uri, Predicates.SBOLX.hasRole, role)
    }

    addRole(role:string):void {
        this.graph.insert(node.createUriNode(this.uri), Predicates.SBOLX.hasRole, node.createUriNode(role))
    }

    removeRole(role:string):void {
        this.graph.removeMatches(this.uri, Predicates.SBOLX.hasRole, role)
    }

    get containingObject():SXIdentified|undefined {

        const uri = triple.subjectUri(
            this.graph.matchOne(null, Predicates.SBOLX.hasSequenceFeature, this.uri)
        )

        if(!uri) {
            throw new Error('has no containing object?')
        }

        return this.graph.uriToFacade(uri)

    }

    get containingComponent():SXComponent {

        return this.containingObject as SXComponent

    }
}


