
import S3Identified from './S3Identified'

import { Types, Predicates, Specifiers } from 'bioterms'
import SBOL3GraphView from "../SBOL3GraphView";

import { triple } from 'rdfoo'

export default class S3Model extends S3Identified {

    constructor(view:SBOL3GraphView, uri:string) {

        super(view, uri)
    }

    get facadeType():string {
        return Types.SBOL3.Model
    }

    get framework(): string|undefined {
        return this.getUriProperty(Predicates.SBOL3.framework)
    }

    set framework(framework: string|undefined) {
        this.setUriProperty(Predicates.SBOL3.framework, framework)
    }

    get language():string|undefined {
        return this.getUriProperty(Predicates.SBOL3.language)
    }

    set language(language:string|undefined) {
        this.setUriProperty(Predicates.SBOL3.language, language)
    }

    get source():string|undefined {
        return this.getUriProperty(Predicates.SBOL3.source)
    }

    set source(source:string|undefined) {
        this.setUriProperty(Predicates.SBOL3.source, source)
    }

}

