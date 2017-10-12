
import SBOL2Graph from './SBOL2Graph'
import SBOLXGraph from './SBOLXGraph'

import {

    S2ComponentDefinition,
    S2SequenceAnnotation,
    SXModule,
    SXSequenceFeature,
    S2Location,
    S2Range,
    S2Identified,
    S2Collection,

    SXSubModule,
    S2ComponentInstance,
    SXIdentified,
    SXCollection

} from '.'

import { Predicates } from 'sbolterms'
import SXThingWithLocation from './sbolx/SXThingWithLocation';



export default function convertToSBOLX(graph:SBOL2Graph):SBOLXGraph {

    // uriChain -> uriChain
    const map:Map<string, SXIdentified> = new Map()

    const xgraph:SBOLXGraph = new SBOLXGraph()

    graph.componentDefinitions.forEach((cd:S2ComponentDefinition) => {
        cdToModule(cd)
    })

    graph.collections.forEach((collection:S2Collection) => {

        const xcollection:SXCollection = xgraph.createCollection(collection.uriPrefix, collection.displayId || 'collection', collection.version)

        collection.members.forEach((member:S2Identified) => {

            const converted:SXIdentified|undefined = map.get(member.uri)

            if(converted === undefined)
                throw new Error('???')

            xcollection.addMember(converted)
        })


    })

    function cdToModule(cd:S2ComponentDefinition):SXModule {

        const existing = map.get(cd.uriChain)

        if(existing)
            return existing as SXModule

        var displayId:string|undefined = cd.displayId
        var version:string|undefined = cd.version
    
        if(displayId === undefined)
            throw new Error('missing displayId')

        if(version === undefined) {
            version = '1'
        }

        const module:SXModule = xgraph.createModule(cd.uriPrefix, displayId, version)

        map.set(cd.uriChain, module)

        console.log('roles')

        cd.roles.forEach((role:string) => {
            module.addRole(role)
        })

        console.log('types')

        cd.types.forEach((type:string) => {
            module.addType(type)
        })

        console.log('cs')

        cd.components.forEach((sc:S2ComponentInstance) => {

            const def:SXModule = cdToModule(sc.definition)

            const subModule:SXSubModule = module.createSubModule(def)

            // TODO check sc roles match the def roles

        })

        cd.sequenceAnnotations.forEach((sa:S2SequenceAnnotation) => {

            if(!sa.component) {

                // no component, make a feature

                const feature:SXSequenceFeature = module.createFeature(sa.displayName)

                copyLocations(sa, feature)

            } else {

                // component, add locations to existing submodule

            }


        })

        return module

    }


    return xgraph


}

function copyLocations(a:S2SequenceAnnotation, b:SXThingWithLocation) {

    a.locations.forEach((location:S2Location) => {

        if(location instanceof S2Range) {

            const range:S2Range = location as S2Range

            const start:number|undefined = range.start
            const end:number|undefined = range.end

            if(start === undefined || end === undefined)
                throw new Error('missing start/end on range')

            b.addRange(start, end)

        } else {

            throw new Error('not implemented location type')

        }

    })

}