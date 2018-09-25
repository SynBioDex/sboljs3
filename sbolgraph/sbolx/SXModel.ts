
import SXIdentified from './SXIdentified'

import { Types, Predicates, Specifiers } from 'bioterms'
import SBOLXGraph from "../SBOLXGraph";

import * as triple from '../triple'

export default class SXModel extends SXIdentified {

    constructor(graph:SBOLXGraph, uri:string) {

        super(graph, uri)
    }

    get facadeType():string {
        return Types.SBOLX.Model
    }

    get framework(): string|undefined {
        return this.getUriProperty(Predicates.SBOLX.modelFramework)
    }

    set framework(framework: string|undefined) {
        this.setUriProperty(Predicates.SBOLX.modelFramework, framework)
    }

    get language():string|undefined {
        return this.getUriProperty(Predicates.SBOLX.modelLanguage)
    }

    set language(language:string|undefined) {
        this.setUriProperty(Predicates.SBOLX.modelLanguage, language)
    }

    get source():string|undefined {
        return this.getUriProperty(Predicates.SBOLX.modelSource)
    }

    set source(source:string|undefined) {
        this.setUriProperty(Predicates.SBOLX.modelSource, source)
    }

}

