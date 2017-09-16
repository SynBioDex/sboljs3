
import { Prefixes } from './Prefixes'

export namespace Predicates {

    export const a:string = Prefixes.rdf + 'type'

    export namespace SBOL2 {
        export const component:string = Prefixes.sbol2 + 'component'
        export const module:string = Prefixes.sbol2 + 'module'
        export const definition:string = Prefixes.sbol2 + 'definition'
        export const functionalComponent:string = Prefixes.sbol2 + 'functionalComponent'
        export const role:string = Prefixes.sbol2 + 'role'
        export const location:string = Prefixes.sbol2 + 'location'
        export const start:string = Prefixes.sbol2 + 'start'
        export const end:string = Prefixes.sbol2 + 'end'
        export const sequenceAnnotation:string = Prefixes.sbol2 + 'sequenceAnnotation'
        export const sequenceConstraint:string = Prefixes.sbol2 + 'sequenceConstraint'
        export const orientation:string = Prefixes.sbol2 + 'orientation'
        export const displayId:string = Prefixes.sbol2 + 'displayId'
        export const version:string = Prefixes.sbol2 + 'version'
        export const access:string = Prefixes.sbol2 + 'access'
        export const mapsTo:string = Prefixes.sbol2 + 'mapsTo'
        export const local:string = Prefixes.sbol2 + 'local'
        export const remote:string = Prefixes.sbol2 + 'remote'
        export const interaction:string = Prefixes.sbol2 + 'interaction'
        export const participation:string = Prefixes.sbol2 + 'participation'
        export const participant:string = Prefixes.sbol2 + 'participant'
        export const type:string = Prefixes.sbol2 + 'type'
        export const sequence:string = Prefixes.sbol2 + 'sequence'
        export const encoding:string = Prefixes.sbol2 + 'encoding'
        export const elements:string = Prefixes.sbol2 + 'elements'
        export const persistentIdentity:string = Prefixes.sbol2 + 'persistentIdentity'
        export const restriction:string = Prefixes.sbol2 + 'restriction'
        export const subject:string = Prefixes.sbol2 + 'subject'
        export const object:string = Prefixes.sbol2 + 'object'
    }

    export namespace Visual {
        export const depictionOf:string = Prefixes.visual + 'depictionOf'
        export const childOf:string = Prefixes.visual + 'childOf'
        export const offsetX:string = Prefixes.visual + 'offsetX'
        export const offsetY:string = Prefixes.visual + 'offsetY'
        export const sizeX:string = Prefixes.visual + 'sizeX'
        export const sizeY:string = Prefixes.visual + 'sizeY'
        export const display:string = Prefixes.visual + 'display' /* float/backbone */
        export const opacity:string = Prefixes.visual + 'opacity' /* blackbox/whitebox */
        export const orientation:string = Prefixes.visual + 'orientation' /* forward/reverse */
        export const anchorY:string = Prefixes.visual + 'anchorY'
        export const anchorRelativeTo:string = Prefixes.visual + 'anchorRelativeTo'
        export const scaleX:string = Prefixes.visual + 'scaleX'
        export const scaleY:string = Prefixes.visual + 'scaleY'
        export const marginTop:string = Prefixes.visual + 'marginTop'
        export const marginLeft:string = Prefixes.visual + 'marginLeft'
        export const marginBottom:string = Prefixes.visual + 'marginBottom'
        export const marginRight:string = Prefixes.visual + 'marginRight'
        export const detailLevel:string = Prefixes.visual + 'detailLevel'
        export const expandability:string = Prefixes.visual + 'expandability'
    }

    export namespace Dcterms {

        export const title:string = Prefixes.dcterms + 'title'
        export const description:string = Prefixes.dcterms + 'description'

    }

    export namespace SVG {
        export const fontFamily:string = Prefixes.svg + 'font-family'
        export const fontSize:string = Prefixes.svg + 'font-size'
        export const fontStyle:string = Prefixes.svg + 'font-style'
    }

    export namespace SyBiOnt {

        export const encodedBy:string = Prefixes.sybio + 'en_by'



    }

    export namespace Prov {

        export const wasDerivedFrom:string = Prefixes.prov + 'wasDerivedFrom'

    }



}
