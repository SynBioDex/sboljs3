import SbolGraph from 'sbolgraph';

import IdentifiedFacade from './IdentifiedFacade'

import { Types, Predicates, Specifiers } from 'terms'

import * as triple from '../triple' 
import ComponentDefinitionFacade from "sbolgraph/facade/ComponentDefinitionFacade";
import SequenceAnnotationFacade from "sbolgraph/facade/SequenceAnnotationFacade";
import LocationFacade from "sbolgraph/facade/LocationFacade";
import RangeFacade from "sbolgraph/facade/RangeFacade";

export default class SequenceFacade extends IdentifiedFacade {

    constructor(graph:SbolGraph, uri:string) {

        super(graph, uri)

    }

    get facadeType():string {
        return Types.SBOL2.Sequence
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

        const containingCDs:Array<ComponentDefinitionFacade> =
            this.graph.match(null, Predicates.SBOL2.sequence, this.uri)
                .map(triple.subjectUri)
                .map((uri:string) => new ComponentDefinitionFacade(this.graph, uri))

        containingCDs.forEach((cd:ComponentDefinitionFacade) => {

            cd.sequenceAnnotations.forEach((sa:SequenceAnnotationFacade) => {

                sa.locations.forEach((location:LocationFacade) => {

                    if(location instanceof RangeFacade) {

                        const range:RangeFacade = location as RangeFacade

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

        const containingCDs:Array<ComponentDefinitionFacade> =
            this.graph.match(null, Predicates.SBOL2.sequence, this.uri)
                .map(triple.subjectUri)
                .map((uri:string) => new ComponentDefinitionFacade(this.graph, uri))

        containingCDs.forEach((cd:ComponentDefinitionFacade) => {

            cd.sequenceAnnotations.forEach((sa:SequenceAnnotationFacade) => {

                sa.locations.forEach((location:LocationFacade) => {

                    if(location instanceof RangeFacade) {

                        const range:RangeFacade = location as RangeFacade

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

    get containingObject():IdentifiedFacade|undefined {
        return undefined
    }
}

