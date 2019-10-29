
import SBOLXGraphView from '../SBOLXGraphView';

import SXIdentified from './SXIdentified'

import { triple, node } from 'rdfoo'
import { Types, Predicates, Specifiers } from 'bioterms'

export default class SXCollection extends SXIdentified {

    constructor(view:SBOLXGraphView, uri:string) {

        super(view, uri)
    }

    get facadeType():string {
        return Types.SBOL2.Collection
    }

    get members():Array<SXIdentified> {

        return this.getUriProperties(Predicates.SBOLX.member)
                   .map((uri:string) => this.view.uriToFacade(uri))
                   .filter((r:SXIdentified) => r !== undefined) as Array<SXIdentified>

    }

    addMember(member:SXIdentified):void {

        this.insertProperties({
            [Predicates.SBOLX.member]: node.createUriNode(member.uri)
        })

    }

}




