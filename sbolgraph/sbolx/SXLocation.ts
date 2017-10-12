
import SXIdentified from './SXIdentified'

import * as triple from '../triple'
import { Types, Predicates, Specifiers } from 'sbolterms'
import SBOLXGraph from "../SBOLXGraph";
import SXSequenceFeature from "./SXSequenceFeature";
import SXModule from "./SXModule";
import SXSubModule from "./SXSubModule";

export default abstract class SXLocation extends SXIdentified {

    constructor(graph:SBOLXGraph, uri:string) {

        super(graph, uri)

    }

    get containingObject():SXIdentified|undefined {

        const uri = triple.subjectUri(
            this.graph.matchOne(null, Predicates.SBOLX.hasLocation, this.uri)
        )

        if(!uri) {
            throw new Error('Location has no containing object?')
        }

        return this.graph.uriToFacade(uri)

    }

    isFixed():boolean {

        return this.facadeType === Types.SBOLX.Range // TODO || this.facadeType === Types.SBOLX.Cut
   
    }
}


