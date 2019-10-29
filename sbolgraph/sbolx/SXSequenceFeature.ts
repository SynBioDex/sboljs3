
import SXIdentified from './SXIdentified'
import SXThingWithLocation from './SXThingWithLocation'

import { triple, node } from 'rdfoo'
import { Types, Predicates, Specifiers, Prefixes } from 'bioterms'
import SBOLXGraphView from "../SBOLXGraphView";
import SXComponent from "./SXComponent";
import SXSubComponent from "./SXSubComponent";
import SXIdentifiedFactory from './SXIdentifiedFactory';
import SXRange from "./SXRange";
import extractTerm from '../extractTerm'

export default class SXSequenceFeature extends SXThingWithLocation {

    constructor(view:SBOLXGraphView, uri:string) {

        super(view, uri)

    }

    get roles():Array<string> {
        return this.getUriProperties(Predicates.SBOLX.role)
    }

    hasRole(role:string):boolean {
        return this.view.graph.hasMatch(this.uri, Predicates.SBOLX.role, role)
    }

    addRole(role:string):void {
        this.insertProperty(Predicates.SBOLX.role, node.createUriNode(role))
    }

    removeRole(role:string):void {
        this.view.graph.removeMatches(this.uri, Predicates.SBOLX.role, role)
    }

    get soTerms():string[] {

        let terms:string[] = []

        for(let role of this.roles) {
            let term = extractTerm(role)

            if(term)
                terms.push(term)
        }

        return terms
    }

    get containingObject():SXIdentified|undefined {

        const uri = triple.subjectUri(
            this.view.graph.matchOne(null, Predicates.SBOLX.sequenceAnnotation, this.uri)
        )

        if(!uri) {
            throw new Error('has no containing object?')
        }

        return this.view.uriToIdentified(uri)

    }

    get containingComponent():SXComponent {

        return this.containingObject as SXComponent

    }
}


