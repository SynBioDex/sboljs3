
import S2Identified from './S2Identified'

import { Types, Predicates, Specifiers } from 'bioterms'
import SBOL2GraphView from "../SBOL2GraphView";

import { triple, Node } from 'rdfoo'

export default class S2Model extends S2Identified {

    constructor(view:SBOL2GraphView, subject:Node) {

        super(view, subject)
    }

    get facadeType():string {
        return Types.SBOL2.Model
    }

    get framework(): string|undefined {
        return this.getUriProperty(Predicates.SBOL2.framework)
    }

    set framework(framework: string|undefined) {
        this.setUriProperty(Predicates.SBOL2.framework, framework)
    }

    get language():string|undefined {
        return this.getUriProperty(Predicates.SBOL2.language)
    }

    set language(language:string|undefined) {
        this.setUriProperty(Predicates.SBOL2.language, language)
    }

    get source():string|undefined {
        return this.getUriProperty(Predicates.SBOL2.source)
    }

    set source(source:string|undefined) {
        this.setUriProperty(Predicates.SBOL2.source, source)
    }

}

