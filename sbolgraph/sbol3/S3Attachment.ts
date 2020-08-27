
import S3Identified from './S3Identified'

import { Types, Predicates, Specifiers } from 'bioterms'
import SBOL3GraphView from "../SBOL3GraphView";

import { triple } from 'rdfoo'

export default class S3Attachment extends S3Identified {

    constructor(view:SBOL3GraphView, uri:string) {

        super(view, uri)
    }

    get facadeType():string {
        return Types.SBOL3.Attachment
    }

    get source():string|undefined {
        return this.getUriProperty(Predicates.SBOL3.source)
    }

    set source(source:string|undefined) {

        if(source)
            this.setUriProperty(Predicates.SBOL3.source, source)
        else
            this.deleteProperty(Predicates.SBOL3.source)

    }

    get format():string|undefined {
        return this.getUriProperty(Predicates.SBOL3.format)
    }

    set format(format:string|undefined) {

        if(format)
            this.setUriProperty(Predicates.SBOL3.format, format)
        else
            this.deleteProperty(Predicates.SBOL3.format)

    }

    get size():number|undefined {
        return this.getIntProperty(Predicates.SBOL3.size)
    }

    set size(size:number|undefined) {

        if(size)
            this.setIntProperty(Predicates.SBOL3.size, size)
        else
            this.deleteProperty(Predicates.SBOL3.size)

    }

    get hash():string|undefined {
        return this.getStringProperty(Predicates.SBOL3.hash)
    }

    set hash(hash:string|undefined) {

        if(hash)
            this.setStringProperty(Predicates.SBOL3.hash, hash)
        else
            this.deleteProperty(Predicates.SBOL3.hash)

    }
}

