
import S2Identified from './S2Identified'
import S2ModuleDefinition from './S2ModuleDefinition'

import * as triple from '../triple'
import { Types, Predicates, Specifiers } from 'sbolterms'
import SBOL2Graph from "../SBOL2Graph";

export default class S2ModuleInstance extends S2Identified {

    constructor(graph:SBOL2Graph, uri:string) {

        super(graph, uri)
    }

    get facadeType():string {
        return Types.SBOL2.Module
    }

    get definition():S2ModuleDefinition {

        const uri:string|undefined = this.getUriProperty(Predicates.SBOL2.definition)

        if(uri === undefined) {
            throw new Error('module has no definition?')
        }

        return new S2ModuleDefinition(this.graph, uri)
    }

    get containingObject():S2Identified|undefined {

        const uri = triple.subjectUri(
            this.graph.matchOne(null, Predicates.SBOL2.module, this.uri)
        )

        if(!uri) {
            throw new Error('ModuleInstance has no containing object?')
        }

        return this.graph.uriToFacade(uri)

    }
}


