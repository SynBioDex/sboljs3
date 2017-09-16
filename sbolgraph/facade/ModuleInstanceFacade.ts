
import IdentifiedFacade from './IdentifiedFacade'
import ModuleDefinitionFacade from './ModuleDefinitionFacade'

import * as triple from '../triple'
import { Types, Predicates, Specifiers } from 'terms'
import SbolGraph from "../SbolGraph";

export default class ModuleInstanceFacade extends IdentifiedFacade {

    constructor(graph:SbolGraph, uri:string) {

        super(graph, uri)
    }

    get facadeType():string {
        return Types.SBOL2.Module
    }

    get definition():ModuleDefinitionFacade {

        const uri:string|undefined = this.getUriProperty(Predicates.SBOL2.definition)

        if(uri === undefined) {
            throw new Error('module has no definition?')
        }

        return new ModuleDefinitionFacade(this.graph, uri)
    }

    get containingObject():IdentifiedFacade|undefined {

        const uri = triple.subjectUri(
            this.graph.matchOne(null, Predicates.SBOL2.module, this.uri)
        )

        if(!uri) {
            throw new Error('ModuleInstance has no containing object?')
        }

        return this.graph.uriToFacade(uri)

    }
}


