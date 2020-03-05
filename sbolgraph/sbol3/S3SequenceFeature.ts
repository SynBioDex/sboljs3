
import S3Identified from './S3Identified'
import S3ThingWithLocation from './S3ThingWithLocation'

import { triple, node } from 'rdfoo'
import { Types, Predicates, Specifiers, Prefixes } from 'bioterms'
import SBOL3GraphView from "../SBOL3GraphView";
import S3Component from "./S3Component";
import S3SubComponent from "./S3SubComponent";
import S3IdentifiedFactory from './S3IdentifiedFactory';
import S3Range from "./S3Range";
import extractTerm from '../extractTerm'

export default class S3SequenceFeature extends S3ThingWithLocation {

    constructor(view:SBOL3GraphView, uri:string) {

        super(view, uri)

    }

    get roles():Array<string> {
        return this.getUriProperties(Predicates.SBOL3.role)
    }

    hasRole(role:string):boolean {
        return this.view.graph.hasMatch(this.uri, Predicates.SBOL3.role, role)
    }

    addRole(role:string):void {
        this.insertProperty(Predicates.SBOL3.role, node.createUriNode(role))
    }

    removeRole(role:string):void {
        this.view.graph.removeMatches(this.uri, Predicates.SBOL3.role, role)
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

    get containingObject():S3Identified|undefined {

        const uri = triple.subjectUri(
            this.view.graph.matchOne(null, Predicates.SBOL3.sequenceAnnotation, this.uri)
        )

        if(!uri) {
            throw new Error('has no containing object?')
        }

        return this.view.uriToIdentified(uri)

    }

    get containingComponent():S3Component {

        return this.containingObject as S3Component

    }
}


