
import SBOL2Graph from './SBOL2Graph'
import SBOLXGraph from './SBOLXGraph'

import {

    S2ComponentDefinition,
    S2SequenceAnnotation,
    SXComponent,
    SXSequenceFeature,
    S2Location,
    S2Range,
    S2Identified,
    S2Collection,

    SXSubComponent,
    S2ComponentInstance,
    SXIdentified,
    SXCollection,
    S2Sequence,
    SXSequence,
    S2ModuleDefinition,
    S2FunctionalComponent,
    S2Interaction,
    SXInteraction,
    SXParticipation,
    S2ModuleInstance

} from '.'

import { Predicates, Prefixes } from 'bioterms'
import SXThingWithLocation from './sbolx/SXThingWithLocation';



export default function convertToSBOLX(graph:SBOL2Graph):SBOLXGraph {

    // uriChain -> uriChain
    const map:Map<string, SXIdentified> = new Map()

    const xgraph:SBOLXGraph = new SBOLXGraph()

    graph.componentDefinitions.forEach((cd:S2ComponentDefinition) => {
        cdToModule(cd)
    })

    graph.moduleDefinitions.forEach((md:S2ModuleDefinition) => {
        mdToModule(md)
    })

    graph.sequences.forEach((seq:S2Sequence) => {
        convertSeq(seq)
    })


    for(let typeTriple of graph.match(null, Predicates.a, null)) {

        if(typeTriple.object.toString().indexOf(Prefixes.sbol2) !== 0) {

            for(let triple of graph.match(typeTriple.subject, null, null)) {

                xgraph.add(triple.subject, triple.predicate, triple.object)

            }

        }

    }



    graph.collections.forEach((collection:S2Collection) => {

        const xcollection:SXCollection = xgraph.createCollection(collection.uriPrefix, collection.displayId || 'collection', collection.version)

        collection.members.forEach((member:S2Identified) => {

            const converted:SXIdentified|undefined = map.get(member.uri)

            if(converted === undefined)
                throw new Error('???')

            xcollection.addMember(converted)
        })


    })

    function convertSeq(seq:S2Sequence):SXSequence {

        const existing = map.get(seq.uriChain)

        if(existing)
            return existing as SXSequence

        var displayId:string|undefined = seq.displayId
        var version:string|undefined = seq.version
    
        if(displayId === undefined)
            throw new Error('missing displayId')

        if(version === undefined) {
            version = '1'
        }

        const xseq:SXSequence = xgraph.createSequence(seq.uriPrefix, displayId, version)

        map.set(xseq.uriChain, xseq)

        xseq.encoding = seq.encoding
        xseq.elements = seq.elements

        return xseq
    }

    function cdToModule(cd:S2ComponentDefinition):SXComponent {

        const existing = map.get(cd.uriChain)

        if(existing)
            return existing as SXComponent

        var displayId:string|undefined = cd.displayId
        var version:string|undefined = cd.version
    
        if(displayId === undefined)
            throw new Error('missing displayId')

        if(version === undefined) {
            version = '1'
        }

        const module:SXComponent = xgraph.createComponent(cd.uriPrefix, displayId, version)

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

            const def:SXComponent = cdToModule(sc.definition)

            const subModule:SXSubComponent = module.createSubComponent(def)

            subModule.name = sc.displayName

            map.set(sc.uriChain, subModule)

            // TODO check sc roles match the def roles

        })

        cd.sequenceAnnotations.forEach((sa:S2SequenceAnnotation) => {

            if(!sa.component) {

                // no component, make a feature

                const feature:SXSequenceFeature = module.createFeature(sa.displayName)

                feature.name = sa.displayName

                sa.roles.forEach((role:string) => {
                    feature.addRole(role)
                })

                copyLocations(sa, feature)

            } else {

                // component, add locations to existing submodule

                const found = map.get(sa.component.uriChain)

                if(!found)
                    throw new Error('???')

                const sc:SXSubComponent = found as SXSubComponent


                copyLocations(sa, sc)
            }


        })

        cd.sequences.forEach((seq:S2Sequence) => {

            module.addSequence(convertSeq(seq))

        })

        return module

    }

    function mdToModule(md:S2ModuleDefinition):SXComponent {

        const existing = map.get(md.uriChain)

        if(existing)
            return existing as SXComponent

        var displayId:string|undefined = md.displayId
        var version:string|undefined = md.version
    
        if(displayId === undefined)
            throw new Error('missing displayId')

        if(version === undefined) {
            version = '1'
        }

        const module:SXComponent = xgraph.createComponent(md.uriPrefix, displayId, version)

        map.set(md.uriChain, module)

        md.modules.forEach((sm:S2ModuleInstance) => {

            const def:SXComponent = mdToModule(sm.definition)

            const subModule:SXSubComponent = module.createSubComponent(def)

            subModule.name = sm.displayName

            map.set(sm.uriChain, subModule)

            // TODO check sc roles match the def roles

        })

        md.functionalComponents.forEach((sc:S2FunctionalComponent) => {

            const def:SXComponent = cdToModule(sc.definition)

            const subModule:SXSubComponent = module.createSubComponent(def)

            subModule.name = sc.displayName

            map.set(sc.uriChain, subModule)

            // TODO check sc roles match the def roles

        })

        md.interactions.forEach((int:S2Interaction) => {

            if(!int.displayId) {
                throw new Error('missing displayId')
            }

            let newInt:SXInteraction = module.createInteraction(int.displayId, int.version)

            for(let type of int.types)
                newInt.addType(type)

            for(let participation of int.participations) {

                if (!participation.displayId) {
                    throw new Error('missing displayId')
                }

                let newParticipation:SXParticipation = newInt.createParticipation(participation.displayId, participation.version)

                if(participation.participant) {

                    let participant = map.get(participation.participant.uriChain)

                    if(!participant || !(participant instanceof SXSubComponent)) {
                        throw new Error('???')
                    }

                    newParticipation.setParticipant(participant as SXSubComponent)
                }

                for (let role of participation.roles) {
                    newParticipation.addRole(role)
                }

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