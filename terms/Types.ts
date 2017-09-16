
import { Prefixes } from './Prefixes'

export namespace Types {

    export namespace SBOL2 {
        export const ModuleDefinition:string = Prefixes.sbol2 + 'ModuleDefinition'
        export const ComponentDefinition:string = Prefixes.sbol2 + 'ComponentDefinition'
        export const Module:string = Prefixes.sbol2 + 'Module'
        export const Component:string = Prefixes.sbol2 + 'Component'
        export const Range:string = Prefixes.sbol2 + 'Range'
        export const SequenceAnnotation:string = Prefixes.sbol2 + 'SequenceAnnotation'
        export const SequenceConstraint:string = Prefixes.sbol2 + 'SequenceConstraint'
        export const Interaction:string = Prefixes.sbol2 + 'Interaction'
        export const Participation:string = Prefixes.sbol2 + 'Participation'
        export const Collection:string = Prefixes.sbol2 + 'Collection'
        export const FunctionalComponent:string = Prefixes.sbol2 + 'FunctionalComponent'
        export const Sequence:string = Prefixes.sbol2 + 'Sequence'
        export const MapsTo:string = Prefixes.sbol2 + 'MapsTo'
        export const GenericLocation:string = Prefixes.sbol2 + 'GenericLocation'
    }

    export namespace Visual {

        export const ModuleDepiction:string = Prefixes.visual + 'ModuleDepiction'
        export const ComponentDepiction:string = Prefixes.visual + 'ComponentDepiction'
        export const Glyph:string = Prefixes.visual + 'Glyph'
        export const Label:string = Prefixes.visual + 'Label'

    }

    export namespace SyBiOnt {

        export const Protein:string = Prefixes.sybio + 'Protein'
        export const InduciblePromoter:string = Prefixes.sybio + 'InduciblePromoter'

    }

}


