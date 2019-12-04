
import SBOLXGraphView from '../SBOLXGraphView'

import SXIdentified from './SXIdentified'

import { Types, Predicates, Specifiers } from 'bioterms'

import { triple } from 'rdfoo'
import SXComponent from "./SXComponent";
import SXSequenceFeature from "./SXSequenceFeature";
import SXLocation from "./SXLocation";
import SXRange from "./SXRange";
import SXSubComponent from './SXSubComponent';

export default class SXSequence extends SXIdentified {

    constructor(view:SBOLXGraphView, uri:string) {

        super(view, uri)

    }

    get facadeType():string {
        return Types.SBOLX.Sequence
    }

    get elements():string|undefined {
        return this.getStringProperty(Predicates.SBOLX.elements)
    }

    set elements(elements:string|undefined) {

        if(elements === undefined) {
            this.deleteProperty(Predicates.SBOLX.elements)
        } else {
            this.setStringProperty(Predicates.SBOLX.elements, elements)
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

        const containingModules:Array<SXComponent> =
            this.view.graph.match(null, Predicates.SBOLX.sequence, this.uri)
                .map(triple.subjectUri)
                .map((uri:string) => new SXComponent(this.view, uri))

        containingModules.forEach((module:SXComponent) => {

            module.sequenceFeatures.forEach((sa:SXSequenceFeature) => {
                sa.locations.forEach((location:SXLocation) => {
                    updateLocation(location)
                })
            })

            module.subComponents.forEach((sm:SXSubComponent) => {
                sm.locations.forEach((location:SXLocation) => {
                    updateLocation(location)
                })
            })

            function updateLocation(location:SXLocation) {

                if(location instanceof SXRange) {

                    const range:SXRange = location as SXRange

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

        const containingCDs:Array<SXComponent> =
            this.view.graph.match(null, Predicates.SBOLX.sequence, this.uri)
                .map(triple.subjectUri)
                .map((uri:string) => new SXComponent(this.view, uri))

        containingCDs.forEach((cd:SXComponent) => {

            cd.sequenceFeatures.forEach((sa:SXSequenceFeature) => {
                sa.locations.forEach((location:SXLocation) => {
                    updateLocation(location)
                })
            })

            cd.subComponents.forEach((sm:SXSubComponent) => {
                sm.locations.forEach((location:SXLocation) => {
                    updateLocation(location)
                })
            })

            function updateLocation(location:SXLocation) {

                if(location instanceof SXRange) {

                    const range:SXRange = location as SXRange

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
        return this.getUriProperty(Predicates.SBOLX.encoding)
    }

    set encoding(encoding:string|undefined) {

        if(encoding === undefined) {
            this.deleteProperty(Predicates.SBOLX.encoding)
        } else {
            this.setUriProperty(Predicates.SBOLX.encoding, encoding)
        }
    }

    get containingObject():SXIdentified|undefined {
        return undefined
    }

    get referencingComponents():SXComponent[] {

        return this.graph.match(
            null, Predicates.SBOLX.sequence, this.uri
        ).map(triple.subjectUri)
         .map((uri:string) => new SXComponent(this.view, uri))
    }
}

