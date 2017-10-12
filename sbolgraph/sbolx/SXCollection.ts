
import SBOLXGraph from '../SBOLXGraph';

import SXIdentified from './SXIdentified'

import * as triple from '../triple'
import * as node from '../node'
import { Types, Predicates, Specifiers } from 'sbolterms'
import CompliantURIs from "../CompliantURIs";

export default class SXCollection extends SXIdentified {

    constructor(graph:SBOLXGraph, uri:string) {

        super(graph, uri)
    }

    get facadeType():string {
        return Types.SBOL2.Collection
    }

    get members():Array<SXIdentified> {

        return this.getUriProperties(Predicates.SBOLX.hasMember)
                   .map((uri:string) => this.graph.uriToFacade(uri))
                   .filter((r:SXIdentified) => r !== undefined) as Array<SXIdentified>

    }

    addMember(member:SXIdentified):void {

        this.graph.insertProperties(this.uri, {
            [Predicates.SBOLX.hasMember]: node.createUriNode(member.uri)
        })

    }

}




