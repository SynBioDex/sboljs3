import SBOL2Graph from '../SBOL2Graph';

import S2Identified from './S2Identified'

import { Types, Predicates, Specifiers } from 'bioterms'

import * as triple from '../triple' 
import S2ComponentDefinition from "../sbol2/S2ComponentDefinition";
import S2SequenceAnnotation from "../sbol2/S2SequenceAnnotation";
import S2Location from "../sbol2/S2Location";
import S2Range from "../sbol2/S2Range";

export default class S2Sequence extends S2Identified {

    constructor(graph:SBOL2Graph, uri:string) {

        super(graph, uri)

    }

    get facadeType():string {
        return Types.SBOL2.Sequence
    }

    get displayType() {
        switch(this.encoding) {
        case Specifiers.SBOL2.SequenceEncoding.AminoAcid:
            return 'Amino Acid Sequence'
        case Specifiers.SBOL2.SequenceEncoding.NucleicAcid:
        case Specifiers.SBOL2.SequenceEncoding.RNA:
            return 'Nucleic Acid Sequence'
        default:
            return 'Sequence'
        }
    }

    get elements():string|undefined {
        return this.getStringProperty(Predicates.SBOL2.elements)
    }

    set elements(elements:string|undefined) {

        if(elements === undefined) {
            this.deleteProperty(Predicates.SBOL2.elements)
        } else {
            this.setStringProperty(Predicates.SBOL2.elements, elements)
        }
    }

    // Updates any SAs that use this sequence
    //
    insertFragment(pos:number, fragment:string) {

        const elements:string|undefined = this.elements

        if(elements === undefined)
            throw new Error('???')

        if(pos < 0 || pos >= elements.length)
            return

        const containingCDs:Array<S2ComponentDefinition> =
            this.graph.match(null, Predicates.SBOL2.sequence, this.uri)
                .map(triple.subjectUri)
                .map((uri:string) => new S2ComponentDefinition(this.graph, uri))

        containingCDs.forEach((cd:S2ComponentDefinition) => {

            cd.sequenceAnnotations.forEach((sa:S2SequenceAnnotation) => {

                sa.locations.forEach((location:S2Location) => {

                    if(location instanceof S2Range) {

                        const range:S2Range = location as S2Range

                        const start:number|undefined = range.start
                        const end:number|undefined = range.end

                        if(start === undefined || end === undefined)
                            throw new Error('???')

                        if(pos >= start && pos <= end) {

                            range.end = end + fragment.length

                        } else if(pos < start) {

                            range.start = start + fragment.length
                            range.end = end + fragment.length

                        }
                    }

                })

            })

        })

        const slices = [
            elements.substring(0, pos),
            fragment,
            elements.substring(pos)
        ]

        this.elements = slices.join('')
    }

    // Updates any SAs that use this sequence
    //
    deleteFragment(pos:number, n:number) {

        const elements:string|undefined = this.elements

        if(elements === undefined)
            throw new Error('???')

        if(pos < 0 || pos >= elements.length)
            return

        const containingCDs:Array<S2ComponentDefinition> =
            this.graph.match(null, Predicates.SBOL2.sequence, this.uri)
                .map(triple.subjectUri)
                .map((uri:string) => new S2ComponentDefinition(this.graph, uri))

        containingCDs.forEach((cd:S2ComponentDefinition) => {

            cd.sequenceAnnotations.forEach((sa:S2SequenceAnnotation) => {

                sa.locations.forEach((location:S2Location) => {

                    if(location instanceof S2Range) {

                        const range:S2Range = location as S2Range

                        const start:number|undefined = range.start
                        const end:number|undefined = range.end

                        if(start === undefined || end === undefined)
                            throw new Error('???')

                        if(pos >= start && pos <= end) {

                            range.end = end - n

                        } else if(pos < start) {

                            range.start = start - n
                            range.end = end - n

                        }
                    }

                })

            })

        })

        const slices = [
            elements.substring(0, pos),
            elements.substring(pos + n)
        ]

        this.elements = slices.join('')
    }

    get encoding():string|undefined {
        return this.getUriProperty(Predicates.SBOL2.encoding)
    }

    set encoding(encoding:string|undefined) {

        if(encoding === undefined) {
            this.deleteProperty(Predicates.SBOL2.encoding)
        } else {
            this.setUriProperty(Predicates.SBOL2.encoding, encoding)
        }
    }

    get containingObject():S2Identified|undefined {
        return undefined
    }
}

