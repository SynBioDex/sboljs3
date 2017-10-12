
import SXIdentified from './SXIdentified'
import SXThingWithLocation from './SXThingWithLocation'
import SXModule from './SXModule'

import * as triple from '../triple'
import { Types, Predicates, Specifiers } from 'sbolterms'
import SBOLXGraph from "../SBOLXGraph";

export default class SXSubModule extends SXThingWithLocation {

    constructor(graph:SBOLXGraph, uri:string) {

        super(graph, uri)
    }

    get facadeType():string {
        return Types.SBOLX.Module
    }

    get instanceOf():SXModule {

        const uri:string|undefined = this.getUriProperty(Predicates.SBOLX.instanceOf)

        if(uri === undefined) {
            throw new Error('module has no instanceOf?')
        }

        return new SXModule(this.graph, uri)
    }

    set instanceOf(def:SXModule) {

        this.setUriProperty(Predicates.SBOLX.instanceOf, def.uri)

    }

    get containingObject():SXIdentified|undefined {

        const uri = triple.subjectUri(
            this.graph.matchOne(null, Predicates.SBOLX.hasSubModule, this.uri)
        )

        if(!uri) {
            throw new Error('ModuleInstance has no containing object?')
        }

        return this.graph.uriToFacade(uri)

    }
}


