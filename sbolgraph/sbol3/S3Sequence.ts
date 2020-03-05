
import SBOL3GraphView from '../SBOL3GraphView'

import S3Identified from './S3Identified'

import { Types, Predicates, Specifiers } from 'bioterms'

import { triple } from 'rdfoo'
import S3Component from "./S3Component";
import S3SequenceFeature from "./S3SequenceFeature";
import S3Location from "./S3Location";
import S3Range from "./S3Range";
import S3SubComponent from './S3SubComponent';

export default class S3Sequence extends S3Identified {

    constructor(view:SBOL3GraphView, uri:string) {

        super(view, uri)

    }

    get facadeType():string {
        return Types.SBOL3.Sequence
    }

    get elements():string|undefined {
        return this.getStringProperty(Predicates.SBOL3.elements)
    }

    set elements(elements:string|undefined) {

        if(elements === undefined) {
            this.deleteProperty(Predicates.SBOL3.elements)
        } else {
            this.setStringProperty(Predicates.SBOL3.elements, elements)
        }
    }

    prependFragment(fragment:string) {

        this.elements = fragment + this.elements

    }

    appendFragment(fragment:string) {

        this.elements = this.elements + fragment

    }

    // Updates any SequenceFeatures and SubModules that use this sequence
    //
    insertFragment(pos:number, fragment:string) {

        const elements:string|undefined = this.elements

        if(elements === undefined)
            throw new Error('???')

        if(pos === elements.length) {
            this.appendFragment(fragment)
        }

        if(pos < 0 || pos >= elements.length)
            return

        const containingModules:Array<S3Component> =
            this.view.graph.match(null, Predicates.SBOL3.sequence, this.uri)
                .map(triple.subjectUri)
                .map((uri:string) => new S3Component(this.view, uri))

        containingModules.forEach((module:S3Component) => {

            module.sequenceFeatures.forEach((sa:S3SequenceFeature) => {
                sa.locations.forEach((location:S3Location) => {
                    updateLocation(location)
                })
            })

            module.subComponents.forEach((sm:S3SubComponent) => {
                sm.locations.forEach((location:S3Location) => {
                    updateLocation(location)
                })
            })

            function updateLocation(location:S3Location) {

                if(location instanceof S3Range) {

                    const range:S3Range = location as S3Range

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

            }

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

        const containingCDs:Array<S3Component> =
            this.view.graph.match(null, Predicates.SBOL3.sequence, this.uri)
                .map(triple.subjectUri)
                .map((uri:string) => new S3Component(this.view, uri))

        containingCDs.forEach((cd:S3Component) => {

            cd.sequenceFeatures.forEach((sa:S3SequenceFeature) => {
                sa.locations.forEach((location:S3Location) => {
                    updateLocation(location)
                })
            })

            cd.subComponents.forEach((sm:S3SubComponent) => {
                sm.locations.forEach((location:S3Location) => {
                    updateLocation(location)
                })
            })

            function updateLocation(location:S3Location) {

                if(location instanceof S3Range) {

                    const range:S3Range = location as S3Range

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

            }
        })

        const slices = [
            elements.substring(0, pos),
            elements.substring(pos + n)
        ]

        this.elements = slices.join('')
    }

    get encoding():string|undefined {
        return this.getUriProperty(Predicates.SBOL3.encoding)
    }

    set encoding(encoding:string|undefined) {

        if(encoding === undefined) {
            this.deleteProperty(Predicates.SBOL3.encoding)
        } else {
            this.setUriProperty(Predicates.SBOL3.encoding, encoding)
        }
    }

    get containingObject():S3Identified|undefined {
        return undefined
    }

    get referencingComponents():S3Component[] {

        return this.graph.match(
            null, Predicates.SBOL3.sequence, this.uri
        ).map(triple.subjectUri)
         .map((uri:string) => new S3Component(this.view, uri))
    }
}

