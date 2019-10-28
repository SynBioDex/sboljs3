
import S2Identified from './S2Identified'

import { Types, Predicates, Specifiers } from 'bioterms'
import SBOL2GraphView from "../SBOL2GraphView";

import { triple } from 'rdfoo'

export default class S2Attachment extends S2Identified {

    constructor(view:SBOL2GraphView, uri:string) {

        super(view, uri)
    }

    get facadeType():string {
        return Types.SBOL2.Attachment
    }

    get source():string|undefined {
        return this.getUriProperty(Predicates.SBOL2.source)
    }

    set source(source:string|undefined) {

        if(source)
            this.setUriProperty(Predicates.SBOL2.source, source)
        else
            this.deleteProperty(Predicates.SBOL2.source)

    }

    get format():string|undefined {
        return this.getUriProperty(Predicates.SBOL2.format)
    }

    set format(format:string|undefined) {

        if(format)
            this.setUriProperty(Predicates.SBOL2.format, format)
        else
            this.deleteProperty(Predicates.SBOL2.format)

    }

    get size():number|undefined {
        return this.getIntProperty(Predicates.SBOL2.size)
    }

    set size(size:number|undefined) {

        if(size)
            this.setIntProperty(Predicates.SBOL2.size, size)
        else
            this.deleteProperty(Predicates.SBOL2.size)

    }

    get hash():string|undefined {
        return this.getStringProperty(Predicates.SBOL2.hash)
    }

    set hash(hash:string|undefined) {

        if(hash)
            this.setStringProperty(Predicates.SBOL2.hash, hash)
        else
            this.deleteProperty(Predicates.SBOL2.hash)

    }
}

