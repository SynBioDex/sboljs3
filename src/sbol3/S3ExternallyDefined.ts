
import S3Identified from './S3Identified'
import S3Feature from './S3Feature'

import { triple, node, Node } from 'rdfoo'
import { Types, Predicates, Specifiers, Prefixes } from 'bioterms'
import SBOL3GraphView from "../SBOL3GraphView";

export default class S3ExternallyDefined extends S3Feature {

    constructor(view:SBOL3GraphView, subject:Node) {

        super(view, subject)
    }

    get facadeType():string {
        return Types.SBOL3.ExternallyDefined
    }

    get types():Array<string> {
        return this.getUriProperties(Predicates.SBOL3.type)
    }

    hasType(type:string):boolean {
        return this.view.graph.hasMatch(this.subject, Predicates.SBOL3.type, node.createUriNode(type))
    }

    addType(type:string):void {
        this.view.graph.insertTriple(this.subject, Predicates.SBOL3.type, node.createUriNode(type))
    }

    removeType(type:string):void {
        this.view.graph.removeMatches(this.subject, Predicates.SBOL3.type, node.createUriNode(type))
    }



}


